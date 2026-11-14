/**
 * The shape of one car in the public API, shared by the list and the single
 * car route so the two can never disagree.
 *
 * It is the same view model the public pages render, with one swap: the old
 * WordPress address (`sourceUrl`) is left out and `url` — the car's page on
 * THIS site — is given instead. A car added in the admin never had a WordPress
 * page, and the ones that did are losing theirs, so an API consumer must never
 * be handed that address to link to.
 */

import type { InventorySnapshot, InventoryVehicle } from '@/lib/inventory/types'
import { absoluteUrl } from '@/lib/seo/site'

/**
 * Facts the stock record may or may not hold. In the API each is ALWAYS
 * present and is `null` when staff have not entered it, so a consumer can tell
 * "not recorded" from "this field does not exist" without guessing.
 */
type OptionalFacts = 'variant' | 'owners' | 'registration' | 'locationSlug' | 'description' | 'updatedAt'

export type PublicVehicle = Omit<InventoryVehicle, 'sourceUrl' | OptionalFacts> & {
  /** Trim level as the dealer wrote it. */
  variant: string | null
  /** Number of owners, counting the present one. */
  owners: number | null
  /** Registration series only ("JK02"), never the full plate. */
  registration: string | null
  /** Which site the car is kept at: "jammu", "nanak-nagar" or "gangyal". */
  locationSlug: string | null
  /** The dealer's own words about the car. Plain text. */
  description: string | null
  /** When the record last changed (price, photos). Falls back to the listing date. */
  updatedAt: string | null
  /** The car's page on this site. */
  url: string
}

export function toPublicVehicle(vehicle: InventoryVehicle): PublicVehicle {
  const copy: Partial<InventoryVehicle> = { ...vehicle }
  delete copy.sourceUrl
  return {
    ...(copy as Omit<InventoryVehicle, 'sourceUrl' | OptionalFacts>),
    variant: vehicle.variant ?? null,
    owners: vehicle.owners ?? null,
    registration: vehicle.registration ?? null,
    locationSlug: vehicle.locationSlug ?? null,
    description: vehicle.description ?? null,
    updatedAt: vehicle.updatedAt ?? vehicle.postedAt ?? null,
    url: absoluteUrl(`/inventory/${vehicle.slug}`),
  }
}

/**
 * Short on purpose. An admin edit expires the server's own cache at once, but
 * nothing can reach into a CDN or a browser, so whatever is allowed here is
 * how long a sold car can linger for an API consumer.
 */
export const CACHE_OK = 'public, s-maxage=60, stale-while-revalidate=300'

const RETRY_AFTER_SECONDS = 120

/**
 * The stock could not be read. The pages show "call us" in this state; the API
 * must say so plainly rather than answer "there are no cars", which a consumer
 * would take as an instruction to delist everything.
 */
export function unavailable(snapshot: InventorySnapshot): Response {
  return Response.json(
    {
      error: 'inventory_unavailable',
      message:
        'The stock list could not be read right now. Nothing has been removed; try again shortly.',
      fetchedAt: snapshot.fetchedAt,
    },
    {
      status: 503,
      headers: { 'Cache-Control': 'no-store', 'Retry-After': String(RETRY_AFTER_SECONDS) },
    },
  )
}
