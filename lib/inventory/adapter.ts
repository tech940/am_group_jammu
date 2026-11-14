/**
 * Maps the raw Motors integration shape onto the UI view model, and derives
 * filter facets from whatever is actually in stock.
 *
 * Nothing here invents data: any field that cannot be derived stays null and
 * the UI is responsible for hiding it.
 */

import type { MotorsVehicle } from '../integrations/motors/types.ts'
import type {
  FacetValue,
  InventoryFacets,
  InventoryVehicle,
  NumericRange,
} from './types.ts'

/**
 * Taxonomy slugs observed on this dealership's listings, grouped by what they
 * mean. The card markup gives us `slug -> termId` with no taxonomy label, and
 * the source site exposes only make/condition/price/year/transmission/mileage/
 * fuel as real facets — so body style, colour and engine have to be recognized
 * by value. Anything unrecognized is left null rather than guessed at.
 */
/**
 * The fuel name shown to buyers.
 *
 * The WordPress feed says "Gasoline" (and sometimes "ELECTRIC" in capitals).
 * Nobody in Jammu calls petrol gasoline, so it is renamed HERE, once, at the
 * edge — every card, filter, facet, landing page and schema block downstream
 * then says Petrol without each having to remember to.
 */
export function displayFuel(raw: string | null): string | null {
  if (!raw) return null
  const k = raw.trim().toLowerCase()
  if (k === 'gasoline' || k === 'petrol') return 'Petrol'
  if (k === 'diesel') return 'Diesel'
  if (k === 'electric' || k === 'ev') return 'Electric'
  if (k === 'cng') return 'CNG'
  if (k === 'hybrid') return 'Hybrid'
  return raw.trim()
}

/**
 * Make and model names as a buyer should read them.
 *
 * The stock list holds "TATA NEXON", "MARUTI SUZUKI VITARA BREZZA" and
 * "Hyundai ALCAZAR" beside "Kia Seltos", because staff type the name as it is
 * written on the car or the RC. It is put right HERE, once, at the edge, so
 * every card, heading, filter, landing page and schema block says "Tata Nexon"
 * without each having to remember to.
 *
 * THE ONE RULE THAT MUST HOLD: only the CASE of a letter may change. Car page
 * addresses are built from these names by `slugify`, which lower-cases, so a
 * case-only change can never move a page. `displayName` checks this itself and
 * hands the original back if a future edit to the table below breaks it.
 */

/** Words whose correct spelling is not "first letter capital". Keyed in lower case. */
const NAME_WORDS: Record<string, string> = {
  // Makes written in capitals because they are initials.
  mg: 'MG',
  bmw: 'BMW',
  byd: 'BYD',
  // A make that is a word, however short. Without this "KIA" would be kept as
  // a badge by the short-word rule below.
  kia: 'Kia',
  // Badges and codes that stay in capitals even when typed small.
  ev: 'EV',
  cng: 'CNG',
  amt: 'AMT',
  dct: 'DCT',
  cvt: 'CVT',
  xuv: 'XUV',
  kuv: 'KUV',
  tuv: 'TUV',
  // Short model names that are words, not initials.
  eon: 'Eon',
  zen: 'Zen',
}

/** "I20" and "i20" are the same Hyundai; the maker writes a small i. */
const SMALL_I_MODEL = /^i\d{2}$/i

function displayWord(word: string): string {
  const known = NAME_WORDS[word.toLowerCase()]
  if (known) return known
  if (SMALL_I_MODEL.test(word)) return word.toLowerCase()
  // Anything else with a digit is a code ("XUV700", "K10", "800"): leave it.
  if (/\d/.test(word)) return word
  const hasUpper = /\p{Lu}/u.test(word)
  const hasLower = /\p{Ll}/u.test(word)
  // Already mixed case ("Creta", "McLaren"): the listing knows best.
  if (hasUpper && hasLower) return word
  // A short word in capitals is a badge we have not listed ("ZXI", "RXT").
  if (hasUpper && word.length <= 3) return word
  // "TATA" -> "Tata", "seltos" -> "Seltos".
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

/** Tidy a make, a model or a "make model" title for display. Null stays null. */
export function displayName(raw: string | null): string | null {
  if (raw === null) return null
  const tidy = raw
    .split(/(\s+|-)/) // keep the separators so they are put back exactly
    .map((part) => (/^(\s+|-)?$/.test(part) ? part : displayWord(part)))
    .join('')
  // The guard described above: case may change, letters may not.
  return tidy.toLowerCase() === raw.toLowerCase() ? tidy : raw
}

const BODY_TYPE_SLUGS: Record<string, string> = {
  suv: 'SUV',
  'compact-suv': 'Compact SUV',
  'premium-suv': 'Premium SUV',
  sedan: 'Sedan',
  hatchback: 'Hatchback',
  'premium-hatchback': 'Premium Hatchback',
  mpv: 'MPV',
  muv: 'MUV',
  coupe: 'Coupe',
  convertible: 'Convertible',
  pickup: 'Pickup',
  van: 'Van',
  crossover: 'Crossover',
}

/** Colour terms are free-text on the WP side ("phantom-black", "starry-night"). */
const COLOUR_HINTS = [
  'black', 'white', 'silver', 'grey', 'gray', 'red', 'blue', 'brown', 'green',
  'orange', 'beige', 'bronze', 'gold', 'maroon', 'yellow', 'purple', 'pearl',
  'night', 'titan', 'sand', 'copper', 'teal', 'ivory', 'platinum',
]

/** Engine terms look like "2-0l-mpi", "1-2l-kappa", "k10b-1-0l", "936-cc-...". */
const ENGINE_PATTERN = /(^|-)(\d+-\d+l|\d+l|\d+-cc|cc)(-|$)|turbo|tcdi|mpi|kappa|crdi|vtec|dci|tdi/i

const NON_DESCRIPTIVE = new Set(['certified-used', 'used-cars', 'new-cars', 'used', 'new'])

function titleCase(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Our own product-page slug: descriptive for SEO, with the listing ID appended
 * so the mapping back to a listing is exact even if the title changes.
 */
export function buildSlug(v: Pick<MotorsVehicle, 'id' | 'make' | 'model' | 'year' | 'title'>): string {
  const words = [v.make, v.model, v.year].filter(Boolean).join(' ') || v.title
  const base = slugify(words)
  return base ? `${base}-${v.id}` : String(v.id)
}

/** Recover the listing ID from a slug. Accepts a bare numeric slug too. */
export function idFromSlug(slug: string): number | null {
  const m = /(?:^|-)(\d+)$/.exec(slug.trim())
  if (!m) return null
  const n = Number.parseInt(m[1], 10)
  return Number.isFinite(n) ? n : null
}

export function formatINR(value: number | null): string {
  if (value === null) return 'Price on request'
  return `₹${value.toLocaleString('en-IN')}`
}

/** Compact Indian notation: 9,20,000 -> "₹9.20 L", 1,50,00,000 -> "₹1.50 Cr". */
export function formatINRShort(value: number | null): string {
  if (value === null) return 'On request'
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(2)} Cr`
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(2)} L`
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(0)}K`
  return `₹${value}`
}

function classifyTaxonomies(
  taxonomies: Record<string, number>,
  known: { mileage: number | null; price: number | null; originalPrice: number | null; make: string | null; model: string | null; year: number | null; fuel: string | null; transmission: string | null; drivetrain: string | null },
): { bodyType: string | null; colour: string | null; engine: string | null } {
  let bodyType: string | null = null
  let colour: string | null = null
  let engine: string | null = null

  // Slugs already accounted for by a first-class field — never re-classify them.
  const consumed = new Set(
    [
      known.make && slugify(known.make),
      known.model && slugify(known.model),
      known.year && String(known.year),
      known.fuel && slugify(known.fuel),
      known.transmission && slugify(known.transmission),
      known.drivetrain && slugify(known.drivetrain),
      known.mileage !== null && String(known.mileage),
      known.price !== null && String(known.price),
      known.originalPrice !== null && String(known.originalPrice),
      'petrol', // taxonomy slug for the "Gasoline" display value
    ].filter(Boolean) as string[],
  )

  for (const slug of Object.keys(taxonomies)) {
    if (consumed.has(slug) || NON_DESCRIPTIVE.has(slug) || /^\d+$/.test(slug)) continue

    if (!bodyType && BODY_TYPE_SLUGS[slug]) {
      bodyType = BODY_TYPE_SLUGS[slug]
      continue
    }
    if (!engine && ENGINE_PATTERN.test(slug)) {
      engine = titleCase(slug).replace(/\bL\b/g, 'L')
      continue
    }
    if (!colour && COLOUR_HINTS.some((h) => slug.includes(h))) {
      colour = titleCase(slug)
      continue
    }
  }

  return { bodyType, colour, engine }
}

/**
 * Above this gap, the struck-through figure is almost certainly the car's
 * original showroom price rather than a dealer discount — e.g. a 2011 Beat
 * listed at ₹5.8L "reduced" to ₹80k is depreciation over 14 years, not an
 * offer. We still show the higher figure the way the source site does, but we
 * refuse to describe the difference as a saving.
 */
const MAX_CREDIBLE_DISCOUNT_PERCENT = 60

export function toInventoryVehicle(v: MotorsVehicle): InventoryVehicle {
  const hasHigherListedPrice =
    v.price !== null && v.originalPrice !== null && v.originalPrice > v.price && v.price > 0

  const rawDiscount = hasHigherListedPrice
    ? Math.round(((v.originalPrice! - v.price!) / v.originalPrice!) * 100)
    : null

  // Only a plausible gap is presented as an actual discount/saving.
  const isCredibleDiscount = rawDiscount !== null && rawDiscount <= MAX_CREDIBLE_DISCOUNT_PERCENT
  const discountPercent = isCredibleDiscount ? rawDiscount : null

  const { bodyType, colour, engine } = classifyTaxonomies(v.taxonomies, {
    mileage: v.mileage,
    price: v.price,
    originalPrice: v.originalPrice,
    make: v.make,
    model: v.model,
    year: v.year,
    fuel: v.fuel,
    transmission: v.transmission,
    drivetrain: v.drivetrain,
  })

  return {
    id: v.id,
    // The slug is built from the names as stored. `displayName` only changes
    // case and `slugify` lower-cases, so it would come out the same either
    // way; using the stored names makes that plain.
    slug: buildSlug(v),
    title: displayName(v.title || v.titleRaw) ?? '',
    make: displayName(v.make),
    model: displayName(v.model),
    year: v.year,
    price: v.price,
    originalPrice: v.originalPrice,
    isDiscounted: isCredibleDiscount,
    discountPercent,
    priceLabel: formatINR(v.price),
    priceShort: formatINRShort(v.price),
    // The struck-through figure is shown whenever the source shows one; only
    // the *saving* claim is withheld when the gap is not credible.
    originalPriceLabel: hasHigherListedPrice ? formatINR(v.originalPrice) : null,
    savings: isCredibleDiscount ? v.originalPrice! - v.price! : null,
    mileage: v.mileage,
    mileageLabel: v.mileage !== null ? `${v.mileage.toLocaleString('en-IN')} km` : '—',
    fuel: displayFuel(v.fuel),
    transmission: v.transmission,
    drivetrain: v.drivetrain,
    condition: v.condition,
    bodyType,
    colour,
    engine,
    images: v.images,
    primaryImage: v.primaryImage,
    photoCount: v.photoCount ?? v.images.length,
    sourceUrl: v.url,
    postedAt: v.postedAt,
  }
}

function tally(
  vehicles: InventoryVehicle[],
  pick: (v: InventoryVehicle) => string | null,
  sort: 'count' | 'alpha' | 'numeric-desc' = 'count',
): FacetValue[] {
  const counts = new Map<string, number>()
  for (const v of vehicles) {
    const raw = pick(v)
    if (!raw) continue
    counts.set(raw, (counts.get(raw) ?? 0) + 1)
  }
  const out: FacetValue[] = [...counts.entries()].map(([label, count]) => ({
    value: label,
    label,
    count,
  }))
  if (sort === 'alpha') out.sort((a, b) => a.label.localeCompare(b.label))
  else if (sort === 'numeric-desc') out.sort((a, b) => Number(b.value) - Number(a.value))
  else out.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
  return out
}

function rangeOf(values: number[], fallback: NumericRange): NumericRange {
  const clean = values.filter((n) => Number.isFinite(n))
  if (clean.length === 0) return fallback
  return { min: Math.min(...clean), max: Math.max(...clean) }
}

/** Build the filter facets from the vehicles actually in stock. */
export function buildFacets(vehicles: InventoryVehicle[]): InventoryFacets {
  return {
    makes: tally(vehicles, (v) => v.make),
    models: tally(vehicles, (v) => v.model),
    years: tally(vehicles, (v) => (v.year !== null ? String(v.year) : null), 'numeric-desc'),
    fuels: tally(vehicles, (v) => v.fuel),
    transmissions: tally(vehicles, (v) => v.transmission),
    bodyTypes: tally(vehicles, (v) => v.bodyType),
    conditions: tally(vehicles, (v) => v.condition),
    colours: tally(vehicles, (v) => v.colour),
    priceRange: rangeOf(
      vehicles.map((v) => v.price).filter((n): n is number => n !== null),
      { min: 0, max: 0 },
    ),
    mileageRange: rangeOf(
      vehicles.map((v) => v.mileage).filter((n): n is number => n !== null),
      { min: 0, max: 0 },
    ),
    yearRange: rangeOf(
      vehicles.map((v) => v.year).filter((n): n is number => n !== null),
      { min: 0, max: 0 },
    ),
  }
}
