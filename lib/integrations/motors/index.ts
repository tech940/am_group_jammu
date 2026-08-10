/**
 * Public, cached entry point for the AM Group Motors inventory.
 *
 * SERVER ONLY — importing this from a Client Component will pull the scraper
 * (and the WordPress nonce handling) into the browser bundle.
 *
 * Caching note for Next.js 16: `use cache` / `cacheLife` are gated behind the
 * app-wide `cacheComponents` flag, which would switch the whole app to PPR and
 * remove the `revalidate`/`dynamic` segment configs — far too invasive for one
 * integration. The fetch data cache is no good here either: it only caches the
 * HTTP response (so cheerio would still re-parse 285KB on every request) and it
 * does not apply to the POST used by the AJAX transport. `unstable_cache` is
 * the right fit — it caches the *parsed* result, works for both transports, and
 * is stable in 16.2.6.
 */

import { unstable_cache } from 'next/cache'
import { fetchInventory } from './client.ts'
import type { MotorsFetchOptions, MotorsFetchResult } from './types.ts'

export const MOTORS_CACHE_TAG = 'motors-inventory'

/** How long a successful sync is served from cache, in seconds. */
export const MOTORS_REVALIDATE_SECONDS = 1800 // 30 minutes

/**
 * Cached inventory read. Collapses many callers onto one upstream sync per
 * revalidation window.
 *
 * A throw inside `unstable_cache` propagates and nothing is cached, which is
 * what we want: a failed sync must not be remembered as an empty inventory.
 */
const cachedInventory = unstable_cache(
  async (perPage: number, transport: NonNullable<MotorsFetchOptions['transport']>) =>
    fetchInventory({ perPage, transport }),
  ['motors-used-inventory-v1'],
  { revalidate: MOTORS_REVALIDATE_SECONDS, tags: [MOTORS_CACHE_TAG] },
)

export interface GetUsedInventoryOptions {
  /** Bypass the cache and hit the source directly. Server-side callers only. */
  fresh?: boolean
  perPage?: number
  transport?: NonNullable<MotorsFetchOptions['transport']>
}

export async function getUsedInventory(
  options: GetUsedInventoryOptions = {},
): Promise<MotorsFetchResult> {
  const { fresh = false, perPage = 50, transport = 'auto' } = options
  return fresh ? fetchInventory({ perPage, transport }) : cachedInventory(perPage, transport)
}

export { fetchInventory, MotorsError, clearNonceCache } from './client.ts'
export { parseListings } from './parser.ts'
export type {
  MotorsVehicle,
  MotorsFetchResult,
  MotorsFetchOptions,
  MotorsParseIssue,
  MotorsFacetOption,
  MotorsTransport,
} from './types.ts'
