/**
 * Google Tag Manager dataLayer helpers.
 *
 * Event and parameter names deliberately reuse the vocabulary already stored on
 * a lead (`intent`, `sourceLabel`, `sourcePath` — see lib/leads/types.ts), so a
 * GA4 conversion row can be joined back to a real row in the admin lead table.
 * Inventing a parallel naming scheme would make the two impossible to reconcile.
 */

import type { InventoryVehicle } from '../inventory/types.ts'

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? ''

/**
 * Whether the container should actually load.
 *
 * Off in development unless explicitly opted in, so local clicking-about does
 * not pollute production analytics. Set NEXT_PUBLIC_GTM_DEV=true when you need
 * GTM Preview mode against a dev server.
 */
export const gtmEnabled =
  Boolean(GTM_ID) &&
  (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_GTM_DEV === 'true')

type Primitive = string | number | boolean | null | undefined

export interface DataLayerEvent {
  event: string
  [key: string]: Primitive | Primitive[] | Record<string, Primitive>[] | undefined
}

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[]
  }
}

/**
 * Push an event, dropping undefined values so GTM variables stay clean.
 * No-ops on the server and when the container is not enabled.
 */
export function pushEvent(event: string, params: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return

  const payload: DataLayerEvent = { event }
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue
    payload[k] = v as DataLayerEvent[string]
  }

  // The array exists before GTM loads, so events fired during hydration are not
  // lost — GTM replays whatever is already queued when it initialises.
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push(payload)
}

/** GA4 `items` entry for a vehicle. */
export function vehicleItem(v: InventoryVehicle, index?: number): Record<string, Primitive> {
  return {
    item_id: String(v.id),
    item_name: v.title,
    item_brand: v.make ?? undefined,
    item_variant: v.model ?? undefined,
    item_category: v.bodyType ?? undefined,
    item_category2: v.fuel ?? undefined,
    item_category3: v.transmission ?? undefined,
    item_category4: v.condition ?? undefined,
    price: v.price ?? undefined,
    quantity: 1,
    index,
  }
}

/** Common vehicle context shared by several events. */
export function vehicleParams(v: InventoryVehicle | null | undefined) {
  if (!v) return { has_vehicle: false }
  return {
    has_vehicle: true,
    currency: 'INR',
    value: v.price ?? 0,
    items: [vehicleItem(v)],
    vehicle_slug: v.slug,
    vehicle_year: v.year ?? undefined,
    vehicle_mileage: v.mileage ?? undefined,
    is_discounted: v.isDiscounted,
    discount_percent: v.discountPercent ?? undefined,
    photo_count: v.photoCount,
  }
}
