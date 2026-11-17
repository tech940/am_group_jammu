/**
 * Server-side inventory access for every public page.
 *
 * SERVER ONLY. Pages call these, then pass plain data down into Client
 * Components as props — no component fetches inventory for itself, so a page
 * renders exactly one cached read.
 *
 * Every function degrades to an empty snapshot rather than throwing: an
 * outage should show "no vehicles available", not a 500.
 */

import { unstable_cache } from 'next/cache'
import { getUsedInventory } from '../integrations/motors/index.ts'
import { carRowToInventoryVehicle } from '../cars/mapper.ts'
import { readAllCars } from '../cars/store.ts'
import { INVENTORY_CACHE_TAG } from '../cars/types.ts'
import { buildFacets, idFromSlug, toInventoryVehicle } from './adapter.ts'
import { toCardVehicle } from './filter.ts'
import type { InventoryFacets, InventorySnapshot, InventoryVehicle } from './types.ts'

const EMPTY_FACETS: InventoryFacets = {
  makes: [],
  models: [],
  years: [],
  fuels: [],
  transmissions: [],
  bodyTypes: [],
  conditions: [],
  colours: [],
  priceRange: { min: 0, max: 0 },
  mileageRange: { min: 0, max: 0 },
  yearRange: { min: 0, max: 0 },
}

/** Newest first, then by price descending, so "featured" picks are sensible. */
function defaultSort(a: InventoryVehicle, b: InventoryVehicle): number {
  const at = a.postedAt ?? ''
  const bt = b.postedAt ?? ''
  if (at !== bt) return bt.localeCompare(at)
  return (b.price ?? 0) - (a.price ?? 0)
}

/**
 * WHERE THE STOCK COMES FROM.
 *
 *   1. The website's own database (`used_cars`), whenever it holds at least
 *      one car of ANY status. From that moment the database is the only
 *      source: a car marked sold disappears even if WordPress still lists it.
 *   2. WordPress, only while the table does not exist yet or is completely
 *      empty — that is, before the import has been run.
 *
 * A database that is configured, has the table, and then FAILS to answer is
 * NOT a reason to fall back to WordPress: that would quietly put sold cars
 * back on sale. It takes the degraded path instead ("stock list is not
 * loading, call us").
 *
 * The database read is cached and tagged, and every admin write expires the
 * tag (lib/cars/actions.ts), so an edit is on the site at once while ordinary
 * page views do not each cost a query.
 */
const DB_REVALIDATE_SECONDS = 300

/**
 * How long a sold car's own page stays up, marked "Sold", before it goes back
 * to being a 404. Counted from the row's `updated_at`, which the database
 * moves whenever the row changes, so marking a car sold starts the clock (and
 * editing a sold car afterwards restarts it).
 *
 * THE OWNER CAN CHANGE THIS NUMBER. Thirty days is a common choice, not a
 * rule: long enough that someone following a shared link or a search result
 * sees "sold, here are similar cars" instead of an error, short enough that
 * the site is not full of cars nobody can buy.
 *
 * Only a car whose status is "sold" gets this. A car DELETED in the admin
 * leaves no row behind, so its page is a 404 at once.
 */
export const SOLD_PAGE_RETENTION_DAYS = 30

type DbStock =
  | {
      source: 'database'
      vehicles: InventoryVehicle[]
      /** Sold cars, for their own "Sold" page only. Never listed anywhere. */
      sold: InventoryVehicle[]
      fetchedAt: string
    }
  | { source: 'none' }

const cachedDbStock = unstable_cache(
  async (): Promise<DbStock> => {
    const all = await readAllCars()
    if (all.state === 'absent' || all.rows.length === 0) return { source: 'none' }
    return {
      source: 'database',
      vehicles: all.rows.filter((r) => r.status === 'published').map(carRowToInventoryVehicle),
      sold: all.rows.filter((r) => r.status === 'sold').map(carRowToInventoryVehicle),
      fetchedAt: new Date().toISOString(),
    }
  },
  // v2: the cached value gained `sold` and the per-car optional facts. A new
  // key stops a copy cached in the old shape from being read as the new one.
  ['used-cars-db-v2'],
  { revalidate: DB_REVALIDATE_SECONDS, tags: [INVENTORY_CACHE_TAG] },
)

/** Which source is serving the site right now — for the admin and the API. */
export async function getInventorySource(): Promise<'database' | 'wordpress' | 'unavailable'> {
  try {
    return (await cachedDbStock()).source === 'database' ? 'database' : 'wordpress'
  } catch {
    return 'unavailable'
  }
}

function degradedSnapshot(err: unknown, what: string): InventorySnapshot {
  const reason = err instanceof Error ? err.message : String(err)
  console.warn(`[inventory] ${what} unavailable (${reason}); serving empty snapshot`)
  return {
    vehicles: [],
    facets: EMPTY_FACETS,
    total: 0,
    fetchedAt: new Date().toISOString(),
    degraded: true,
  }
}

export async function getInventory(): Promise<InventorySnapshot> {
  let db: DbStock
  try {
    db = await cachedDbStock()
  } catch (err) {
    return degradedSnapshot(err, 'cars database')
  }

  if (db.source === 'database') {
    const vehicles = [...db.vehicles].sort(defaultSort)
    return {
      vehicles,
      facets: buildFacets(vehicles),
      total: vehicles.length,
      fetchedAt: db.fetchedAt,
      degraded: false,
    }
  }

  try {
    const result = await getUsedInventory()
    const vehicles = result.vehicles.map(toInventoryVehicle).sort(defaultSort)
    return {
      vehicles,
      facets: buildFacets(vehicles),
      total: result.total ?? vehicles.length,
      fetchedAt: result.fetchedAt,
      degraded: false,
    }
  } catch (err) {
    return degradedSnapshot(err, 'upstream fetch')
  }
}

/**
 * Look a vehicle up by our slug. Matches on the trailing listing ID so an
 * edited title never breaks an existing URL.
 */
export interface VehicleNeighbour {
  slug: string
  title: string
  year: number | null
  priceLabel: string
}

/**
 * Up to three cars on sale that are closest to this one: same make first, then
 * same body type, then anything else, so the section never renders half-empty.
 *
 * Each comes back with only the photos a card can show. A car has up to 49,
 * and all of them were being written into every car page for three cards that
 * use eight each. `photoCount` still holds the real total.
 */
function pickSimilar(vehicle: InventoryVehicle, onSale: InventoryVehicle[]): InventoryVehicle[] {
  const others = onSale.filter((v) => v.id !== vehicle.id)
  const sameMake = others.filter((v) => v.make && v.make === vehicle.make)
  const sameBody = others.filter(
    (v) => !sameMake.includes(v) && v.bodyType && v.bodyType === vehicle.bodyType,
  )
  const rest = others.filter((v) => !sameMake.includes(v) && !sameBody.includes(v))
  return [...sameMake, ...sameBody, ...rest].slice(0, 3).map((v) => toCardVehicle(v))
}

/**
 * The sold car with this id, if it was sold recently enough to still have a
 * page (see SOLD_PAGE_RETENTION_DAYS). Null for a draft, for a car that was
 * never there, for one sold longer ago than that, and whenever the stock is
 * being read from WordPress, which keeps no record of what was sold.
 */
async function findRecentlySold(id: number): Promise<InventoryVehicle | null> {
  let db: DbStock
  try {
    db = await cachedDbStock()
  } catch {
    return null
  }
  if (db.source !== 'database') return null
  const car = db.sold.find((v) => v.id === id)
  if (!car) return null

  const soldAt = Date.parse(car.updatedAt ?? '')
  // No readable date means the age cannot be shown to be inside the window.
  if (!Number.isFinite(soldAt)) return null
  const ageDays = (Date.now() - soldAt) / 86_400_000
  return ageDays <= SOLD_PAGE_RETENTION_DAYS ? car : null
}

/**
 * Cars marked sold within the last SOLD_PAGE_RETENTION_DAYS, for the Meta
 * catalogue feed. They are written into the feed as `not_available` so Meta
 * stops advertising them whether the feed is set to Replace or Update - Meta's
 * own advice is to mark an item unavailable rather than only drop it. Empty
 * when the stock is not coming from the database.
 */
export async function getRecentlySold(): Promise<InventoryVehicle[]> {
  let db: DbStock
  try {
    db = await cachedDbStock()
  } catch {
    return []
  }
  if (db.source !== 'database') return []
  return db.sold.filter((car) => {
    const soldAt = Date.parse(car.updatedAt ?? '')
    return Number.isFinite(soldAt) && (Date.now() - soldAt) / 86_400_000 <= SOLD_PAGE_RETENTION_DAYS
  })
}

export async function getVehicleBySlug(slug: string): Promise<{
  /** A car ON SALE. Null for a sold car: nothing that lists stock may show one. */
  vehicle: InventoryVehicle | null
  /**
   * Set instead of `vehicle` when the car is sold and still inside its
   * retention window. Only the car's own page reads this.
   */
  soldVehicle: InventoryVehicle | null
  similar: InventoryVehicle[]
  canonicalSlug: string | null
  /** Position in the full listing, for "car 4 of 27" style pagination. */
  position: number
  total: number
  prev: VehicleNeighbour | null
  next: VehicleNeighbour | null
}> {
  const { vehicles } = await getInventory()
  const id = idFromSlug(slug)
  const index = id !== null ? vehicles.findIndex((v) => v.id === id) : -1
  const vehicle = index >= 0 ? vehicles[index] : null

  if (!vehicle) {
    const soldVehicle = id !== null ? await findRecentlySold(id) : null
    return {
      vehicle: null,
      soldVehicle,
      similar: soldVehicle ? pickSimilar(soldVehicle, vehicles) : [],
      canonicalSlug: soldVehicle ? soldVehicle.slug : null,
      position: 0,
      total: vehicles.length,
      prev: null,
      next: null,
    }
  }

  const toNeighbour = (v: InventoryVehicle): VehicleNeighbour => ({
    slug: v.slug,
    title: v.title,
    year: v.year,
    priceLabel: v.priceLabel,
  })

  const similar = pickSimilar(vehicle, vehicles)

  return {
    vehicle,
    soldVehicle: null,
    similar,
    canonicalSlug: vehicle.slug,
    position: index + 1,
    total: vehicles.length,
    prev: index > 0 ? toNeighbour(vehicles[index - 1]) : null,
    next: index < vehicles.length - 1 ? toNeighbour(vehicles[index + 1]) : null,
  }
}

/** All slugs, for generateStaticParams and the sitemap. */
export async function getAllVehicleSlugs(): Promise<
  { slug: string; postedAt: string | null; updatedAt: string | null }[]
> {
  const { vehicles } = await getInventory()
  return vehicles.map((v) => ({
    slug: v.slug,
    postedAt: v.postedAt,
    // When the row last changed; the listing date for a car that has none.
    updatedAt: v.updatedAt ?? v.postedAt,
  }))
}

export interface HomeInventory {
  /** Newest listings, for the hero and showcase rails. */
  latest: InventoryVehicle[]
  /** Most affordable stock, cheapest first. */
  bestValue: InventoryVehicle[]
  /** Listings grouped by the body styles actually in stock. */
  byBodyType: { label: string; slug: string; count: number; vehicles: InventoryVehicle[] }[]
  /** One vehicle with the richest gallery, for the spotlight. */
  spotlight: InventoryVehicle[]
  facets: InventoryFacets
  total: number
  degraded: boolean
}

export async function getHomeInventory(): Promise<HomeInventory> {
  const { vehicles, facets, total, degraded } = await getInventory()

  const withImages = vehicles.filter((v) => v.images.length > 0)

  // Cheapest first. Deliberately NOT "biggest saving": on used stock the
  // struck-through price is usually the original showroom price, so ranking by
  // that gap would just surface the oldest cars as though they were bargains.
  const bestValue = [...vehicles]
    .filter((v) => v.price !== null && v.images.length > 0)
    .sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    .slice(0, 8)

  const bodyGroups = new Map<string, InventoryVehicle[]>()
  for (const v of vehicles) {
    if (!v.bodyType) continue
    const list = bodyGroups.get(v.bodyType) ?? []
    list.push(v)
    bodyGroups.set(v.bodyType, list)
  }

  const byBodyType = [...bodyGroups.entries()]
    .map(([label, list]) => ({
      label,
      slug: label.toLowerCase().replace(/\s+/g, '-'),
      count: list.length,
      vehicles: list,
    }))
    .sort((a, b) => b.count - a.count)

  return {
    latest: withImages.slice(0, 8),
    bestValue,
    byBodyType,
    spotlight: [...withImages].sort((a, b) => b.images.length - a.images.length).slice(0, 3),
    facets,
    total,
    degraded,
  }
}
