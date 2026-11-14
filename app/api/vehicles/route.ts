/**
 * GET /api/vehicles
 *
 * The used cars on sale, as JSON. It reads the same snapshot the website
 * renders (lib/inventory/server.ts), so it can only ever return cars that are
 * on the public pages: drafts and sold cars are dropped before the snapshot is
 * built and never reach this file.
 *
 * Query parameters — the same ones /inventory understands, handled by the same
 * functions (lib/inventory/filter.ts), so a link that works on the page works
 * here:
 *   make | brand, model, bodyType | body | type, fuel, transmission, condition
 *   budget=<lakhs>, priceMin, priceMax (rupees), year, kmsMax
 *   q=<free text>
 *   sort=recent | price-asc | price-desc | year-desc | year-asc | mileage-asc
 * As on the page, a value that matches nothing in stock is ignored rather than
 * returning an empty list; `filters` in the response shows what was applied.
 *
 * Paging: limit (default 50, at most 100) and offset (default 0).
 *
 * Response:
 *   source     "database" | "wordpress" — where the stock is being read from
 *   total      every car on sale
 *   matched    cars left after the filters
 *   count      cars in this response
 *   facets     filter options for the WHOLE stock, as on the listing page
 *
 * Each car also carries `variant`, `owners`, `registration` (the series only),
 * `locationSlug`, `description` and `updatedAt`. The first five are null until
 * staff enter them in the admin; see ./public-vehicle.ts.
 *
 * 503 when the stock cannot be read. No auth: every field is already public.
 */

import type { NextRequest } from 'next/server'
import { getInventory, getInventorySource } from '@/lib/inventory/server'
import { applyInventoryQuery, filtersFromSearchParams } from '@/lib/inventory/filter'
import { EMPTY_FILTERS } from '@/store/use-inventory-store'
import type { SortKey } from '@/store/use-inventory-store'
import { CACHE_OK, toPublicVehicle, unavailable } from './public-vehicle'

export const maxDuration = 30

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 100

const SORTS: readonly SortKey[] = [
  'recent',
  'price-asc',
  'price-desc',
  'year-desc',
  'year-asc',
  'mileage-asc',
]

/** A whole number from the query string, or the fallback when it is not one. */
function wholeNumber(raw: string | null, fallback: number): number {
  if (raw === null || !/^\d+$/.test(raw.trim())) return fallback
  const n = Number.parseInt(raw, 10)
  return Number.isSafeInteger(n) ? n : fallback
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const [snapshot, source] = await Promise.all([getInventory(), getInventorySource()])
  if (snapshot.degraded || source === 'unavailable') return unavailable(snapshot)

  const { vehicles, facets, fetchedAt } = snapshot

  const filters = { ...EMPTY_FILTERS, ...filtersFromSearchParams(searchParams, vehicles) }
  const sortParam = searchParams.get('sort') ?? ''
  const sort: SortKey = (SORTS as readonly string[]).includes(sortParam)
    ? (sortParam as SortKey)
    : 'recent'
  const matched = applyInventoryQuery(vehicles, filters, searchParams.get('q') ?? '', sort)

  const limit = Math.min(Math.max(wholeNumber(searchParams.get('limit'), DEFAULT_LIMIT), 1), MAX_LIMIT)
  const offset = wholeNumber(searchParams.get('offset'), 0)
  const page = matched.slice(offset, offset + limit)

  return Response.json(
    {
      source,
      // Counted from the cars actually read, not the snapshot's `total`: while
      // WordPress is the source that figure is WordPress's own claim, and it
      // can disagree with the list.
      total: vehicles.length,
      matched: matched.length,
      count: page.length,
      limit,
      offset,
      sort,
      filters,
      fetchedAt,
      vehicles: page.map(toPublicVehicle),
      facets,
    },
    { headers: { 'Cache-Control': CACHE_OK } },
  )
}
