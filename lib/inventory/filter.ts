/**
 * Pure filtering/sorting for the inventory list, shared by the listing page and
 * any server-side pre-filtering (brand pages, city pages).
 *
 * Null policy: a listing whose price/year/mileage is unknown stays visible
 * until the user actively filters on that field. Anything else would quietly
 * hide listings that merely have incomplete upstream data.
 */

import type { InventoryFilterState, Range, SortKey } from '../../store/use-inventory-store.ts'
import type { InventoryVehicle } from './types.ts'

const eq = (a: string | null, b: string) =>
  !!a && a.trim().toLowerCase() === b.trim().toLowerCase()

function inRange(value: number | null, range: Range | null): boolean {
  if (range === null) return true // filter not engaged
  if (value === null) return false // engaged, and this listing can't answer
  return value >= range[0] && value <= range[1]
}

export function matchesSearch(v: InventoryVehicle, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [v.title, v.make, v.model, v.bodyType, v.fuel, v.transmission, v.colour, v.condition]
    .filter(Boolean)
    .some((field) => (field as string).toLowerCase().includes(q))
    || (v.year !== null && String(v.year).includes(q))
}

export function matchesFilters(v: InventoryVehicle, f: InventoryFilterState): boolean {
  if (f.make && !eq(v.make, f.make)) return false
  if (f.model && !eq(v.model, f.model)) return false
  if (f.bodyType && !eq(v.bodyType, f.bodyType)) return false
  if (f.fuel && !eq(v.fuel, f.fuel)) return false
  if (f.transmission && !eq(v.transmission, f.transmission)) return false
  if (f.condition && !eq(v.condition, f.condition)) return false
  if (f.colour && !eq(v.colour, f.colour)) return false
  if (!inRange(v.price, f.priceRange)) return false
  if (!inRange(v.year, f.yearRange)) return false
  if (!inRange(v.mileage, f.mileageRange)) return false
  return true
}

/** Nulls always sort last, whichever direction is requested. */
function cmpNullable(a: number | null, b: number | null, dir: 1 | -1): number {
  if (a === null && b === null) return 0
  if (a === null) return 1
  if (b === null) return -1
  return (a - b) * dir
}

export function sortVehicles(vehicles: InventoryVehicle[], sort: SortKey): InventoryVehicle[] {
  const out = [...vehicles]
  switch (sort) {
    case 'price-asc':
      return out.sort((a, b) => cmpNullable(a.price, b.price, 1))
    case 'price-desc':
      return out.sort((a, b) => cmpNullable(a.price, b.price, -1))
    case 'year-desc':
      return out.sort((a, b) => cmpNullable(a.year, b.year, -1))
    case 'year-asc':
      return out.sort((a, b) => cmpNullable(a.year, b.year, 1))
    case 'mileage-asc':
      return out.sort((a, b) => cmpNullable(a.mileage, b.mileage, 1))
    case 'recent':
    default:
      return out.sort((a, b) => (b.postedAt ?? '').localeCompare(a.postedAt ?? ''))
  }
}

export function applyInventoryQuery(
  vehicles: InventoryVehicle[],
  filters: InventoryFilterState,
  searchQuery: string,
  sort: SortKey,
): InventoryVehicle[] {
  return sortVehicles(
    vehicles.filter((v) => matchesFilters(v, filters) && matchesSearch(v, searchQuery)),
    sort,
  )
}

/**
 * Hydrate filters from URL search params so hero/homepage deep links work.
 * Values that do not exist in the current inventory are ignored rather than
 * producing an empty result set.
 */
export function filtersFromSearchParams(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
  vehicles: InventoryVehicle[],
): Partial<InventoryFilterState> {
  const get = (key: string): string => {
    if (params instanceof URLSearchParams) return params.get(key) ?? ''
    const raw = params[key]
    return Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '')
  }

  const out: Partial<InventoryFilterState> = {}

  const matchAgainst = (key: keyof InventoryVehicle, raw: string): string => {
    if (!raw) return ''
    const hit = vehicles.find((v) => eq(v[key] as string | null, raw))
    return hit ? ((hit[key] as string | null) ?? '') : ''
  }

  const make = matchAgainst('make', get('make') || get('brand'))
  if (make) out.make = make

  const model = matchAgainst('model', get('model'))
  if (model) out.model = model

  const body = matchAgainst('bodyType', get('bodyType') || get('body') || get('type'))
  if (body) out.bodyType = body

  const fuel = matchAgainst('fuel', get('fuel'))
  if (fuel) out.fuel = fuel

  const transmission = matchAgainst('transmission', get('transmission'))
  if (transmission) out.transmission = transmission

  const condition = matchAgainst('condition', get('condition'))
  if (condition) out.condition = condition

  // budget=<lakhs> is what the hero search form emits.
  const budget = Number.parseFloat(get('budget'))
  if (Number.isFinite(budget) && budget > 0) out.priceRange = [0, budget * 100_000]

  // year=2024 -> exactly that model year (used by the footer/SEO link graph).
  const year = Number.parseInt(get('year'), 10)
  if (Number.isFinite(year) && vehicles.some((v) => v.year === year)) {
    out.yearRange = [year, year]
  }

  // kmsMax=50000 -> "under 50,000 km"
  const kmsMax = Number.parseInt(get('kmsMax'), 10)
  if (Number.isFinite(kmsMax) && kmsMax > 0) out.mileageRange = [0, kmsMax]

  const priceMin = Number.parseInt(get('priceMin'), 10)
  const priceMax = Number.parseInt(get('priceMax'), 10)
  if (Number.isFinite(priceMin) || Number.isFinite(priceMax)) {
    out.priceRange = [
      Number.isFinite(priceMin) ? priceMin : 0,
      Number.isFinite(priceMax) ? priceMax : Number.MAX_SAFE_INTEGER,
    ]
  }

  return out
}
