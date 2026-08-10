/**
 * Parser for Motors plugin listing-card markup.
 *
 * The markup this consumes is machine-generated and contains two defects that
 * rule out regex/hand-rolled attribute scanning, so we go through a real HTML5
 * parser (cheerio/parse5):
 *   1. `data-price` is emitted twice on every card root.
 *   2. Two attributes are glued with no separating whitespace:
 *      `data-price="1900000"data-mileage="94000"`
 * An HTML5 parser keeps the first duplicate and tokenizes the glued pair
 * correctly; a strict XML parser throws and a split-on-whitespace reader
 * silently loses `data-mileage`.
 */

import * as cheerio from 'cheerio'
import type { Element } from 'domhandler'
import type { MotorsParseIssue, MotorsParseResult, MotorsVehicle } from './types.ts'

/** Card root. `[data-listing-id]` and `.stm-directory-grid-loop` are equivalent. */
const CARD_SELECTOR = '.stm-isotope-listing-item'

/**
 * Class tokens on the card root that are layout/state, not taxonomy terms.
 * The bootstrap grid classes matter: `col-md-4` matches the `<slug>-<termId>`
 * pattern and would otherwise be ingested as a term.
 */
const NOISE_TOKENS = new Set([
  'col-md-4',
  'col-sm-6',
  'col-xs-12',
  'col-xxs-12',
  'stm-directory-grid-loop',
  'stm-isotope-listing-item',
  'all',
  'listing_is_active',
])
const NOISE_PATTERN = /^col(-[a-z]+)?-\d+$/

/** Meta rows are keyed by icon class — never by index, see below. */
const META_ICONS = {
  model: 'motors-icons-car',
  transmission: 'motors-icons-gearbox',
  fuel: 'motors-icons-gas-pump',
  drivetrain: 'motors-icons-steering-wheel-skin',
} as const

/**
 * Condition taxonomy slugs. Open vocabulary — an unrecognized value is passed
 * through (title-cased) rather than dropped.
 */
const CONDITION_SLUGS = new Set(['certified-used', 'used-cars', 'new-cars', 'used', 'new'])

/** Slug of a taxonomy term that is really a body style, colour, engine, etc. */
type TaxonomyMap = Record<string, number>

function toInt(value: string | undefined | null): number | null {
  if (value == null) return null
  const digits = value.replace(/[^\d]/g, '')
  if (digits === '') return null
  const n = Number.parseInt(digits, 10)
  return Number.isFinite(n) ? n : null
}

function cleanText(value: string | undefined | null): string {
  return (value ?? '').replace(/\s+/g, ' ').trim()
}

function titleCase(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function safeDecode(url: string): string {
  try {
    return decodeURIComponent(url)
  } catch {
    return url
  }
}

/** data-date is `YYYYMMDDHHMM` with no timezone; treated as site-local wall time. */
function parsePostedAt(raw: string | undefined): string | null {
  if (!raw || !/^\d{12}$/.test(raw)) return null
  const mo = Number(raw.slice(4, 6))
  const d = Number(raw.slice(6, 8))
  const h = Number(raw.slice(8, 10))
  const mi = Number(raw.slice(10, 12))
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59) return null
  const iso = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}T${raw.slice(8, 10)}:${raw.slice(10, 12)}:00`
  return Number.isNaN(Date.parse(iso)) ? null : iso
}

/**
 * Split the root class list into taxonomy terms (slug -> termId).
 *
 * Every remaining token matches `<slug>-<termId>` once the noise tokens are
 * removed. The tokens carry no taxonomy label and are ordered alphabetically by
 * the term's DISPLAY name (which is why `petrol-29` sorts next to `hyundai-84`
 * — its display name is "Gasoline"), so they can never be mapped positionally.
 */
function extractTaxonomies(classAttr: string): TaxonomyMap {
  const out: TaxonomyMap = {}
  for (const token of classAttr.split(/\s+/)) {
    if (!token || NOISE_TOKENS.has(token) || NOISE_PATTERN.test(token)) continue
    const m = /^(.+)-(\d+)$/.exec(token)
    if (!m) continue
    out[m[1]] = Number.parseInt(m[2], 10)
  }
  return out
}

/**
 * Year from the taxonomy tokens.
 *
 * Price and mileage are also emitted as bare-numeric taxonomy terms, so their
 * bases are excluded first — otherwise a four-digit mileage in the 1900-2099
 * range would be indistinguishable from a model year.
 */
function yearFromTaxonomies(
  taxonomies: TaxonomyMap,
  dataPrice: string | undefined,
  dataMileage: string | undefined,
): number | null {
  const excluded = new Set([dataPrice ?? '', dataMileage ?? ''].filter(Boolean))
  for (const slug of Object.keys(taxonomies)) {
    if (excluded.has(slug)) continue
    if (/^(19|20)\d{2}$/.test(slug)) return Number.parseInt(slug, 10)
  }
  return null
}

function conditionFromTaxonomies(taxonomies: TaxonomyMap): string | null {
  for (const slug of Object.keys(taxonomies)) {
    if (CONDITION_SLUGS.has(slug)) return titleCase(slug)
  }
  return null
}

/**
 * Gallery images from the card's inline lightGallery bootstrap script.
 *
 * The `dynamicEl` array has a trailing comma before its closing bracket, so it
 * is not valid JSON and JSON.parse throws — the src values are extracted
 * directly instead. `src` and `thumb` are identical and always full-size.
 */
function extractGalleryImages(scriptText: string): string[] {
  const urls: string[] = []
  const re = /src\s*:\s*"([^"]+)"/g
  let m: RegExpExecArray | null
  while ((m = re.exec(scriptText)) !== null) urls.push(m[1])
  return urls
}

/** Largest candidate in a srcset. Candidates are NOT in ascending width order. */
function largestFromSrcset(srcset: string | undefined): string | null {
  if (!srcset) return null
  let best: { url: string; w: number } | null = null
  for (const part of srcset.split(',')) {
    const bits = part.trim().split(/\s+/)
    if (bits.length === 0 || !bits[0]) continue
    const w = bits[1] ? Number.parseInt(bits[1], 10) : 0
    if (!best || w > best.w) best = { url: bits[0], w: Number.isFinite(w) ? w : 0 }
  }
  return best ? best.url : null
}

function isPlaceholder(src: string | undefined): boolean {
  return !!src && /plchldr/i.test(src)
}

/**
 * Parse every listing card in a chunk of Motors markup.
 *
 * Accepts either a full page or the `html` fragment from the AJAX response.
 * Never throws on a malformed card — problems are collected into `issues` so a
 * single bad listing cannot take down a whole sync.
 */
export function parseListings(html: string, baseUrl = 'https://amgroupind.com'): MotorsParseResult {
  const $ = cheerio.load(html)
  const vehicles: MotorsVehicle[] = []
  const issues: MotorsParseIssue[] = []
  const cards = $(CARD_SELECTOR)

  cards.each((_i, el) => {
    const card = $(el as Element)
    const id = toInt(card.attr('data-listing-id'))

    if (id === null) {
      issues.push({
        listingId: null,
        field: 'id',
        detail: 'card has no usable data-listing-id; skipped',
      })
      return
    }

    const note = (field: string, detail: string) => issues.push({ listingId: id, field, detail })

    const dataPrice = card.attr('data-price')
    const dataMileage = card.attr('data-mileage')
    const taxonomies = extractTaxonomies(card.attr('class') ?? '')

    // ---- meta rows, keyed by icon class -------------------------------------
    // Row count varies 2/3/4 and rows drop out, so index-based mapping
    // mis-assigns: on some cards index 1 is fuel where on others it is
    // transmission.
    const meta: Record<string, string> = {}
    card.find('.car-meta-bottom ul li').each((_j, li) => {
      const $li = $(li as Element)
      const iconClass = $li.find('i').attr('class') ?? ''
      const text = cleanText($li.find('span').first().text())
      if (!text) return
      for (const [key, icon] of Object.entries(META_ICONS)) {
        if (iconClass.split(/\s+/).includes(icon)) meta[key] = text
      }
    })

    const model = meta.model ?? null
    const transmission = meta.transmission ?? null
    const fuel = meta.fuel ?? null
    const drivetrain = meta.drivetrain ?? null

    // ---- title / year / make -------------------------------------------------
    const titleRaw = cleanText(card.find('.car-title').first().text())
    if (!titleRaw) note('title', 'no .car-title text found')

    const yearFromTitle = /\s(\d{4})$/.exec(titleRaw)
    const year =
      (yearFromTitle ? Number.parseInt(yearFromTitle[1], 10) : null) ??
      yearFromTaxonomies(taxonomies, dataPrice, dataMileage)
    if (year === null && titleRaw) note('year', `could not derive a year from "${titleRaw}"`)

    // "Hyundai ALCAZAR 2022" - year - model => make
    let title = titleRaw.replace(/\s\d{4}$/, '').trim()
    let make: string | null = null
    if (title) {
      if (model && title.toLowerCase().endsWith(model.toLowerCase())) {
        make = title.slice(0, title.length - model.length).trim() || null
      } else {
        // Model row missing or the title does not end with it — fall back to the
        // first word, which is the make on every observed listing.
        make = title.split(' ')[0] || null
        if (model) note('make', `title "${title}" does not end with model "${model}"`)
      }
    } else {
      title = titleRaw
    }

    // ---- prices ---------------------------------------------------------------
    // Three shapes exist: discounted (regular + sale), non-discounted
    // (.normal-price), and no .price node at all.
    const $price = card.find('.price').first()
    const isDiscounted = $price.hasClass('discounted-price')
    const regular = toInt($price.find('.regular-price').first().text())
    const sale = toInt($price.find('.sale-price').first().text())
    const normal = toInt($price.find('.normal-price').first().text())

    // data-price is the LIST price, never the asking price, so it is only used
    // as a last-resort source for originalPrice.
    const originalPrice = regular ?? normal ?? toInt(dataPrice)
    const price = sale ?? normal ?? null

    if (price === null) {
      note('price', $price.length === 0 ? 'card renders no .price block' : 'no sale/normal price text')
    }

    // ---- images ---------------------------------------------------------------
    const galleryScript = card.find('script').first().text()
    let images = galleryScript ? extractGalleryImages(galleryScript) : []

    const $img = card.find('.image-inner img').first()
    const imgSrc = $img.attr('src')
    const placeholder = isPlaceholder(imgSrc)

    if (images.length === 0 && !placeholder) {
      // Only meaningful when a gallery is absent but a real image exists.
      const fallback = largestFromSrcset($img.attr('srcset')) ?? imgSrc ?? null
      if (fallback) images = [fallback]
    }
    if (images.length === 0 && !placeholder) note('images', 'no gallery script and no usable <img>')

    const primaryImage = images[0] ?? (placeholder ? null : (imgSrc ?? null))

    // ---- url -------------------------------------------------------------------
    const href = card.find('a').first().attr('href') ?? ''
    const url = href ? safeDecode(href.startsWith('http') ? href : new URL(href, baseUrl).toString()) : ''
    if (!url) note('url', 'card has no anchor href')

    vehicles.push({
      id,
      title,
      titleRaw,
      make,
      model,
      year,
      price,
      originalPrice,
      isDiscounted,
      mileage: toInt(dataMileage),
      fuel,
      transmission,
      drivetrain,
      condition: conditionFromTaxonomies(taxonomies),
      url,
      images,
      primaryImage,
      photoCount: toInt(card.find('.stm-listing-photos-unit span').first().text()),
      postedAt: parsePostedAt(card.attr('data-date')),
      taxonomies,
    })
  })

  return { vehicles, issues, cardsSeen: cards.length }
}

/** Number of pagination pages advertised in a full page of markup, if any. */
export function extractMaxPage(html: string): number | null {
  const $ = cheerio.load(html)
  let max = 0
  $('.stm_ajax_pagination a.page-numbers, .stm_ajax_pagination span.page-numbers').each((_i, el) => {
    const m = /\/page\/(\d+)\//.exec($(el as Element).attr('href') ?? '')
    const n = m ? Number.parseInt(m[1], 10) : toInt($(el as Element).text())
    if (n && n > max) max = n
  })
  return max > 0 ? max : null
}
