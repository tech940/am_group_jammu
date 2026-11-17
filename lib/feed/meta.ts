/**
 * Builds the Meta (Facebook / Instagram) vehicle catalogue feed from the live
 * used-car inventory.
 *
 * This is a port of the hand-run script that produced the catalogue CSV Meta
 * already accepted. Pure functions only — no fetching, no request access — so
 * the route handler stays a thin wrapper and this can be tested on its own.
 *
 * Nothing here invents data. A car that is missing something Meta requires is
 * left out and reported with the reason, never padded with a guess.
 */

import { PRIMARY_LOCATION, getLocation } from '../locations.ts'
import type { Location } from '../locations.ts'
import type { InventoryVehicle } from '../inventory/types.ts'

export const MAX_IMAGES = 10

/** Column order Meta's vehicle catalogue reads. Do not reorder casually. */
export const META_COLUMNS: string[] = [
  'vehicle_id',
  'title',
  'description',
  'url',
  'make',
  'model',
  'year',
  'mileage.value',
  'mileage.unit',
  'price',
  'availability',
  'state_of_vehicle',
  'body_style',
  'fuel_type',
  'transmission',
  'drivetrain',
  'exterior_color',
  'address.addr1',
  'address.city',
  'address.region',
  'address.postal_code',
  'address.country',
  'latitude',
  'longitude',
  ...Array.from({ length: MAX_IMAGES }, (_, i) => `image[${i}].url`),
]

/**
 * Body style by model, in Meta's enum. The WordPress listings do not carry a
 * reliable body-style term, so the models this dealership actually stocks are
 * mapped by hand. Add a line here when a new model arrives and shows up in the
 * "skipped" report.
 */
const BODY_BY_MODEL: Record<string, string> = {
  CARENS: 'MPV',
  SELTOS: 'SUV',
  SWIFT: 'HATCHBACK',
  'ALTO 800': 'HATCHBACK',
  ALTROZ: 'HATCHBACK',
  TIAGO: 'HATCHBACK',
  PUNCH: 'SUV',
  'CURV EV EMP A 55': 'SUV',
  'PUNCH EV': 'SUV',
  NEXON: 'SUV',
  EXTER: 'SUV',
  ALCAZAR: 'SUV',
  CRETA: 'SUV',
  BEAT: 'HATCHBACK',
  VERNA: 'SEDAN',
  'WAGON R': 'HATCHBACK',
  'I20 SPORTZ': 'HATCHBACK',
  'ALTO K10': 'HATCHBACK',
  SYROS: 'SUV',
}

/** Fallback: the listing's own body type (see adapter BODY_TYPE_SLUGS) -> Meta enum. */
const BODY_BY_LISTING_TYPE: Record<string, string> = {
  SUV: 'SUV',
  'COMPACT SUV': 'SUV',
  'PREMIUM SUV': 'SUV',
  SEDAN: 'SEDAN',
  HATCHBACK: 'HATCHBACK',
  'PREMIUM HATCHBACK': 'HATCHBACK',
  MPV: 'MPV',
  MUV: 'MPV',
  COUPE: 'COUPE',
  CONVERTIBLE: 'CONVERTIBLE',
  PICKUP: 'PICKUP',
  VAN: 'VAN',
  CROSSOVER: 'CROSSOVER',
}

const FUEL: Record<string, string> = {
  GASOLINE: 'PETROL',
  PETROL: 'PETROL',
  DIESEL: 'DIESEL',
  ELECTRIC: 'ELECTRIC',
  EV: 'ELECTRIC',
}

const FUEL_WORD: Record<string, string> = {
  PETROL: 'Petrol',
  DIESEL: 'Diesel',
  ELECTRIC: 'Electric',
}

const DRIVETRAIN: Record<string, string> = {
  FWD: 'FWD',
  RWD: 'RWD',
  AWD: 'AWD',
  '4WD': '4X4',
  '4X4': '4X4',
}

export type MetaFeedRow = Record<string, string>

export interface MetaFeedSkipped {
  id: number
  title: string
  reasons: string[]
}

export interface MetaFeed {
  rows: MetaFeedRow[]
  skipped: MetaFeedSkipped[]
}

/** Strip emoji and symbols Meta rejects or renders badly; collapse whitespace. */
export function cleanText(input: string | null | undefined): string {
  return (input ?? '')
    .replace(/[^\p{L}\p{N}_\s\-.,/&()+'’]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isAllCaps(s: string): boolean {
  return /\p{Lu}/u.test(s) && !/\p{Ll}/u.test(s)
}

/**
 * Tidy a name the listing shouts in capitals: "HYUNDAI" -> "Hyundai",
 * "WAGON R" -> "Wagon R". Short words and anything with a digit keep their
 * capitals, because those are badges and codes ("KIA", "EV", "I20", "K10").
 * A name already in mixed case is left exactly as the listing has it.
 */
function tidyName(raw: string): string {
  const s = cleanText(raw)
  if (!isAllCaps(s)) return s
  return s
    .split(' ')
    .map((w) => (/\d/.test(w) || w.length <= 3 ? w : w.charAt(0) + w.slice(1).toLowerCase()))
    .join(' ')
}

/**
 * Percent-encode anything outside plain URL-safe ASCII (spaces, Devanagari,
 * accented letters in WordPress upload names) without touching an existing
 * "%xx" escape. Meta's fetcher rejects raw non-ASCII in URLs.
 */
export function encodeUrl(url: string): string {
  return url.replace(/[^A-Za-z0-9:/?&=%#+,;@!$'()*~\-._]/gu, (ch) => {
    try {
      return encodeURIComponent(ch)
    } catch {
      return '' // lone surrogate — cannot be part of a valid URL
    }
  })
}

function absoluteUrl(url: string, origin: string): string {
  const u = url.trim()
  if (/^https?:\/\//i.test(u)) return u
  if (u.startsWith('//')) return `https:${u}`
  return `${origin}${u.startsWith('/') ? '' : '/'}${u}`
}

function resolveBodyStyle(v: InventoryVehicle): string | null {
  const byModel = v.model ? BODY_BY_MODEL[v.model.trim().toUpperCase()] : undefined
  if (byModel) return byModel
  const byListing = v.bodyType ? BODY_BY_LISTING_TYPE[v.bodyType.trim().toUpperCase()] : undefined
  return byListing ?? null
}

function metaFuel(fuel: string | null): string {
  const key = (fuel ?? '').trim().toUpperCase()
  if (!key) return ''
  return FUEL[key] ?? 'OTHER'
}

function metaTransmission(transmission: string | null): string {
  const key = (transmission ?? '').trim().toUpperCase()
  return key === 'AUTOMATIC' || key === 'MANUAL' ? key : ''
}

/**
 * The address columns for one car, from confirmed facts only.
 *
 * WHICH SITE. The car's own site when the stock record names one that
 * lib/locations.ts knows; otherwise the main site, which is the dealer's
 * address of record (Meta needs one per row).
 *
 * WHAT IS LEFT BLANK, AND WHY.
 *   - Street and PIN are written only for a site whose address is confirmed
 *     (`addressConfirmed`). For the other sites the row carries the city,
 *     region and country, which are known, and no street.
 *   - Latitude and longitude are written only for a pin that has been checked
 *     against the Google Business Profile (`geo.verified`). The figures on
 *     file are approximate, and lib/locations.ts says a wrong pin is worse
 *     than none: ads would point buyers at the wrong place on the map. No
 *     site has a verified pin yet, so both columns are empty today.
 *
 * The columns themselves stay, in the same order, so the feed Meta already
 * reads keeps its shape. Filling in a site's real address and pin in
 * lib/locations.ts is all it takes for them to appear here.
 */
function addressColumns(v: InventoryVehicle): MetaFeedRow {
  const own: Location | null = v.locationSlug ? getLocation(v.locationSlug) : null
  const loc = own ?? PRIMARY_LOCATION
  return {
    'address.addr1': loc.addressConfirmed ? loc.streetAddress : '',
    'address.city': loc.city,
    'address.region': loc.region,
    'address.postal_code': loc.addressConfirmed ? loc.postalCode || '' : '',
    'address.country': 'IN',
    latitude: loc.geo.verified ? String(loc.geo.latitude) : '',
    longitude: loc.geo.verified ? String(loc.geo.longitude) : '',
  }
}

/**
 * @param origin  Scheme + host of THIS site, no trailing slash. Each car's
 *                `url` is its page here, so an ad click lands on our lead form.
 */
export function buildMetaFeed(
  vehicles: InventoryVehicle[],
  origin: string,
  /**
   * Cars recently marked sold. Written with availability `not_available` so
   * Meta stops showing them in ads at its next fetch, whichever upload mode
   * the feed is set to (Meta's docs: mark items unavailable rather than only
   * removing them). They are not counted in `skipped`.
   */
  sold: InventoryVehicle[] = [],
): MetaFeed {
  const soldIds = new Set(sold.map((v) => v.id))
  // A car can be in both lists for a moment while caches catch up; the
  // on-sale copy wins, because it is the newer state.
  const onSaleIds = new Set(vehicles.map((v) => v.id))
  const all = [...vehicles, ...sold.filter((v) => !onSaleIds.has(v.id))]
  const loc = PRIMARY_LOCATION

  const rows: MetaFeedRow[] = []
  const skipped: MetaFeedSkipped[] = []
  const seen = new Set<number>()

  for (const v of all) {
    const isSold = soldIds.has(v.id) && !onSaleIds.has(v.id)
    const make = tidyName(v.make ?? '')
    const model = tidyName(v.model ?? '')
    const body = resolveBodyStyle(v)
    const images = v.images.filter((src) => typeof src === 'string' && src.trim() !== '')

    const reasons: string[] = []
    if (!v.price || v.price <= 0) reasons.push('no price on the listing')
    if (images.length === 0) reasons.push('no photos on the listing')
    if (!body) reasons.push(`unknown body style for model '${cleanText(v.model) || 'not set'}'`)
    if (!make || !model || !v.year || v.mileage === null) {
      reasons.push('missing make, model, year or odometer reading')
    }
    if (seen.has(v.id)) reasons.push('duplicate listing ID')

    if (reasons.length > 0 || !body || !v.price) {
      // A sold car that could not be written was never in the catalogue as
      // complete either, so there is nothing to take down; it is not reported.
      if (!isSold) skipped.push({ id: v.id, title: cleanText(v.title), reasons })
      continue
    }
    seen.add(v.id)

    const km = v.mileage as number
    const fuel = metaFuel(v.fuel)
    const title = `${v.year} ${make} ${model}`
    const colour = cleanText(v.colour)
    const facts = [
      title,
      km ? `${km.toLocaleString('en-IN')} km` : null,
      FUEL_WORD[fuel] ?? null,
      cleanText(v.transmission) || null,
      colour || null,
    ].filter(Boolean)

    // The hand-run script said every car was "held at AM Business Park" and
    // could be inspected without an appointment. Stock sits across three
    // Jammu sites, so the description names no site.
    //
    // It says "Used car", not the listing's condition label. That label is a
    // stock category ("Used Cars", "Certified Used"): printed here it read
    // "Used Cars car", and "Certified" is a claim nobody has yet said what
    // stands behind.
    const description =
      `${facts.join(' · ')}. Used car from AM Group, ${loc.city}. ` +
      'Finance, insurance and RC transfer arranged in-house.'

    const row: MetaFeedRow = {
      vehicle_id: String(v.id),
      title,
      description,
      url: encodeUrl(`${origin}/inventory/${v.slug}`),
      make,
      model,
      year: String(v.year),
      'mileage.value': String(km),
      'mileage.unit': 'KM',
      price: `${Math.round(v.price)} INR`,
      availability: isSold ? 'not_available' : 'available',
      state_of_vehicle: 'USED',
      body_style: body,
      fuel_type: fuel,
      transmission: metaTransmission(v.transmission),
      drivetrain: DRIVETRAIN[(v.drivetrain ?? '').trim().toUpperCase()] ?? '',
      exterior_color: colour,
      ...addressColumns(v),
    }
    for (let i = 0; i < MAX_IMAGES; i++) {
      row[`image[${i}].url`] = i < images.length ? encodeUrl(absoluteUrl(images[i], origin)) : ''
    }
    rows.push(row)
  }

  return { rows, skipped }
}

/** One RFC 4180 field: quoted when it holds a comma, quote, line break or edge space. */
function csvField(value: string): string {
  return /[",\r\n]|^\s|\s$/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

/** RFC 4180 CSV: header row, CRLF line endings, UTF-8 without a BOM. */
export function toCsv(rows: MetaFeedRow[]): string {
  const lines = [META_COLUMNS.map(csvField).join(',')]
  for (const row of rows) {
    lines.push(META_COLUMNS.map((col) => csvField(row[col] ?? '')).join(','))
  }
  return `${lines.join('\r\n')}\r\n`
}
