/**
 * Types for the AM Group WordPress "Motors" (StylemixThemes) inventory integration.
 *
 * The Motors plugin does not expose listings through the WP REST API
 * (/wp-json/wp/v2/stm_vehicles_listing is not registered), so inventory is
 * obtained from the public listings page / its AJAX endpoint and the returned
 * markup is parsed into the normalized shapes below.
 */

/** A single normalized vehicle listing. `null` means "not reliably extractable". */
export interface MotorsVehicle {
  /** WordPress post ID from data-listing-id. Primary key — always present. */
  id: number
  /** Make + model, with the trailing year stripped. e.g. "Hyundai ALCAZAR" */
  title: string
  /** The untouched card title, e.g. "Hyundai ALCAZAR 2022" */
  titleRaw: string
  make: string | null
  model: string | null
  year: number | null
  /**
   * The actual asking price in INR.
   *
   * IMPORTANT: this is the sale price where one exists. It is deliberately NOT
   * taken from the root `data-price` attribute — that attribute carries the
   * pre-discount list price, which on this inventory is up to 16x higher than
   * what the listing actually sells for.
   */
  price: number | null
  /** Pre-discount list price in INR (the struck-through figure), if any. */
  originalPrice: number | null
  /** True when the card renders both a regular and a sale price. */
  isDiscounted: boolean
  /** Odometer reading. Only exists as a data attribute — never rendered on the card. */
  mileage: number | null
  /** Display fuel name as shown, e.g. "Gasoline" (the taxonomy slug is "petrol"). */
  fuel: string | null
  transmission: string | null
  drivetrain: string | null
  /** e.g. "Certified Used" / "Used Cars", derived from the taxonomy slug. */
  condition: string | null
  /** Absolute, percent-decoded listing URL. */
  url: string
  /** Full-size gallery images. Empty when the listing has only a placeholder. */
  images: string[]
  /** First gallery image, or null when the card uses the plugin placeholder. */
  primaryImage: string | null
  /** Photo-count badge shown on the card. */
  photoCount: number | null
  /** data-date (YYYYMMDDHHMM) converted to an ISO-8601 string, site-local. */
  postedAt: string | null
  /** All taxonomy terms on the card, as slug -> WordPress term ID. */
  taxonomies: Record<string, number>
}

/** Per-card problems collected during parsing; surfaced for monitoring, never thrown. */
export interface MotorsParseIssue {
  listingId: number | null
  field: string
  detail: string
}

export interface MotorsParseResult {
  vehicles: MotorsVehicle[]
  issues: MotorsParseIssue[]
  /** Cards found in the markup, including any that failed to yield an id. */
  cardsSeen: number
}

/** Facet counts exposed by the AJAX transport (absent for the HTML transport). */
export interface MotorsFacetOption {
  slug: string
  label: string
  count: number | null
  termId: number | null
}

export type MotorsTransport = 'ajax' | 'html'

export interface MotorsFetchResult {
  vehicles: MotorsVehicle[]
  /** Authoritative count reported by WordPress, when the transport provides it. */
  total: number | null
  /** Which transport actually produced the data. */
  transport: MotorsTransport
  /** True when the AJAX transport was attempted and failed, forcing the fallback. */
  usedFallback: boolean
  pagesRequested: number
  issues: MotorsParseIssue[]
  /** Filter facets (make/fuel/transmission/...) — AJAX transport only. */
  facets: Record<string, MotorsFacetOption[]> | null
  /** Duplicate listing IDs discarded while merging pages. */
  duplicateIds: number[]
  fetchedAt: string
  /** Non-fatal warnings (nonce retry, page failure that did not abort the run). */
  warnings: string[]
}

export interface MotorsFetchOptions {
  /**
   * 'auto'  — try AJAX (authoritative total + facets), fall back to HTML. Default.
   * 'ajax'  — AJAX only; throws if the nonce cannot be used.
   * 'html'  — plain GET only; no nonce required.
   */
  transport?: 'auto' | MotorsTransport
  /** Listings requested per page. Default 50 (the whole inventory in one request). */
  perPage?: number
  /** Hard cap on pages, as a runaway guard. Default 20. */
  maxPages?: number
  /** Per-request timeout in ms. Default 15000. */
  timeoutMs?: number
  /** Delay between paged requests in ms, to be polite to the origin. Default 400. */
  politeDelayMs?: number
  signal?: AbortSignal
}
