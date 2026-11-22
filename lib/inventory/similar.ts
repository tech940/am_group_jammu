/**
 * Other cars to show on a page that has only a few of its own.
 *
 * WHY (2026-11-22). Visitors were leaving pages like "used Maruti Suzuki cars"
 * that list two cars: nothing else to look at. A page with fewer than
 * MORE_CARS_BELOW cars now shows up to four more from stock, then a button to
 * the full list. The owner's words: "add a new section where we will say see
 * more, and that will have 2, 3, 4 more cars which we already have".
 *
 * The extra cars are the closest to what the page shows, so they read as
 * "you may also like", not as random stock:
 *   same body type   +3   (a hatchback page shows other hatchbacks)
 *   price within 30% +2   (of the middle price on the page)
 *   same fuel        +1
 *   same gearbox     +1
 * Ties go to the newest listing. A page with no cars of its own (a sold-out
 * model) gets the newest cars in stock.
 */

import type { InventoryVehicle } from './types.ts'

/** A page with fewer cars than this gets the "more cars" section. */
export const MORE_CARS_BELOW = 6
const MORE_CARS_LIMIT = 4

function median(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

const time = (v: InventoryVehicle) => (v.postedAt ? Date.parse(v.postedAt) || 0 : 0)

export function moreCarsFor(
  shown: InventoryVehicle[],
  stock: InventoryVehicle[],
  limit = MORE_CARS_LIMIT,
): InventoryVehicle[] {
  const shownIds = new Set(shown.map((v) => v.id))
  const candidates = stock.filter((v) => !shownIds.has(v.id))
  if (candidates.length === 0) return []

  const bodies = new Set(shown.map((v) => v.bodyType).filter(Boolean))
  const fuels = new Set(shown.map((v) => v.fuel).filter(Boolean))
  const gearboxes = new Set(shown.map((v) => v.transmission).filter(Boolean))
  const mid = median(shown.map((v) => v.price).filter((p): p is number => typeof p === 'number' && p > 0))

  const score = (v: InventoryVehicle) =>
    (v.bodyType && bodies.has(v.bodyType) ? 3 : 0) +
    (mid !== null && v.price && Math.abs(v.price - mid) <= mid * 0.3 ? 2 : 0) +
    (v.fuel && fuels.has(v.fuel) ? 1 : 0) +
    (v.transmission && gearboxes.has(v.transmission) ? 1 : 0)

  return candidates
    .map((v) => ({ v, s: score(v) }))
    .sort((a, b) => b.s - a.s || time(b.v) - time(a.v))
    .slice(0, limit)
    .map((x) => x.v)
}
