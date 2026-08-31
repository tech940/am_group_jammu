/**
 * Server-side inventory access for every public page.
 *
 * SERVER ONLY. Pages call these, then pass plain data down into Client
 * Components as props — no component fetches inventory for itself, so a page
 * renders exactly one upstream read (and that read is cached for 30 minutes).
 *
 * Every function degrades to an empty snapshot rather than throwing: a
 * WordPress outage should show "no vehicles available", not a 500.
 */

import { getUsedInventory } from '../integrations/motors/index.ts'
import { buildFacets, idFromSlug, toInventoryVehicle } from './adapter.ts'
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

export async function getInventory(): Promise<InventorySnapshot> {
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
    const reason = err instanceof Error ? err.message : String(err)
    console.warn(`[inventory] upstream fetch unavailable (${reason}); serving empty snapshot`)
    return {
      vehicles: [],
      facets: EMPTY_FACETS,
      total: 0,
      fetchedAt: new Date().toISOString(),
      degraded: true,
    }
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

export async function getVehicleBySlug(slug: string): Promise<{
  vehicle: InventoryVehicle | null
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
    return { vehicle: null, similar: [], canonicalSlug: null, position: 0, total: vehicles.length, prev: null, next: null }
  }

  const toNeighbour = (v: InventoryVehicle): VehicleNeighbour => ({
    slug: v.slug,
    title: v.title,
    year: v.year,
    priceLabel: v.priceLabel,
  })

  // Prefer same make, then same body type, then anything else — always filling
  // up to three so the section never renders half-empty.
  const others = vehicles.filter((v) => v.id !== vehicle.id)
  const sameMake = others.filter((v) => v.make && v.make === vehicle.make)
  const sameBody = others.filter(
    (v) => !sameMake.includes(v) && v.bodyType && v.bodyType === vehicle.bodyType,
  )
  const rest = others.filter((v) => !sameMake.includes(v) && !sameBody.includes(v))
  const similar = [...sameMake, ...sameBody, ...rest].slice(0, 3)

  return {
    vehicle,
    similar,
    canonicalSlug: vehicle.slug,
    position: index + 1,
    total: vehicles.length,
    prev: index > 0 ? toNeighbour(vehicles[index - 1]) : null,
    next: index < vehicles.length - 1 ? toNeighbour(vehicles[index + 1]) : null,
  }
}

/** All slugs, for generateStaticParams and the sitemap. */
export async function getAllVehicleSlugs(): Promise<{ slug: string; postedAt: string | null }[]> {
  const { vehicles } = await getInventory()
  return vehicles.map((v) => ({ slug: v.slug, postedAt: v.postedAt }))
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
