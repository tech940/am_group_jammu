/**
 * View model shared by every inventory surface (home, listing, product page).
 *
 * This is deliberately separate from `MotorsVehicle` (the raw integration
 * shape): components render presentation-ready values, and the mapping lives in
 * exactly one place so an upstream change cannot ripple into the UI.
 */

export interface InventoryVehicle {
  /** WordPress listing ID — the stable primary key. */
  id: number
  /** Our own SEO slug, e.g. "hyundai-alcazar-2022-5099". */
  slug: string

  title: string
  make: string | null
  model: string | null
  year: number | null

  /** Real asking price in INR. */
  price: number | null
  /** Real pre-discount price in INR. */
  originalPrice: number | null
  isDiscounted: boolean
  /** Whole-number percent off, only when both prices are known and sane. */
  discountPercent: number | null
  /** "₹9,20,000" — full Indian-format price. */
  priceLabel: string
  /** "₹9.20 L" — compact price for tight card layouts. */
  priceShort: string
  originalPriceLabel: string | null
  /** "₹9,80,000 saved" style figure, in rupees. */
  savings: number | null

  mileage: number | null
  /** "94,000 km" */
  mileageLabel: string

  fuel: string | null
  transmission: string | null
  drivetrain: string | null
  condition: string | null

  /** Derived from the card's taxonomy terms; null when not recognizable. */
  bodyType: string | null
  colour: string | null
  engine: string | null

  images: string[]
  primaryImage: string | null
  photoCount: number

  /** Canonical listing URL on the WordPress site. */
  sourceUrl: string
  postedAt: string | null
}

export interface FacetValue {
  value: string
  label: string
  count: number
}

export interface NumericRange {
  min: number
  max: number
}

/**
 * Filter options computed from the vehicles actually in stock, so the UI can
 * never offer a filter that would return zero results.
 */
export interface InventoryFacets {
  makes: FacetValue[]
  models: FacetValue[]
  years: FacetValue[]
  fuels: FacetValue[]
  transmissions: FacetValue[]
  bodyTypes: FacetValue[]
  conditions: FacetValue[]
  colours: FacetValue[]
  priceRange: NumericRange
  mileageRange: NumericRange
  yearRange: NumericRange
}

export interface InventorySnapshot {
  vehicles: InventoryVehicle[]
  facets: InventoryFacets
  total: number
  fetchedAt: string
  /** True when the upstream fetch failed and this is an empty safe fallback. */
  degraded: boolean
}
