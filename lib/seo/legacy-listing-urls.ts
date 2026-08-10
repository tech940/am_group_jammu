/**
 * Resolving legacy WordPress /listings/ URLs to our vehicle pages.
 *
 * Pure and free of any `next/*` import so it can be exercised directly by
 * scripts/test-redirects.ts against live stock — the redirect table is the one
 * piece of the migration where being quietly wrong costs real rankings, so it
 * needs to be testable rather than merely plausible.
 *
 * See app/listings/[...slug]/route.ts for why the emoji in these slugs are
 * load-bearing.
 */

import { slugify } from '../inventory/adapter.ts'
import type { InventoryFacets, InventoryVehicle } from '../inventory/types.ts'

const NUMERIC = /^\d+$/

/**
 * Deliberately NOT `idFromSlug` from the adapter: that accepts any trailing
 * digits, and real WordPress slugs end in them — "carens-g1-5-dct-luxary-plus-7"
 * would resolve to listing #7. Only a wholly numeric segment is an ID.
 */
export function numericId(segment: string): number | null {
  if (!NUMERIC.test(segment)) return null
  const n = Number.parseInt(segment, 10)
  return Number.isFinite(n) ? n : null
}

/** decodeURIComponent that tolerates malformed input rather than throwing. */
export function decode(input: string): string {
  try {
    return decodeURIComponent(input)
  } catch {
    return input
  }
}

/** Comparison key: decoded, trailing slash removed, lowercased, emoji intact. */
export function exactKey(segment: string): string {
  return decode(segment).replace(/\/+$/, '').toLowerCase()
}

/** Last path segment of a vehicle's WordPress URL, decoded. */
export function sourceSegment(vehicle: Pick<InventoryVehicle, 'sourceUrl'>): string | null {
  if (!vehicle.sourceUrl) return null
  try {
    // The URL constructor percent-encodes the emoji, so decode on the way back.
    const path = decode(new URL(vehicle.sourceUrl).pathname)
    return path.replace(/\/+$/, '').split('/').pop() || null
  } catch {
    return null
  }
}

export type Resolution =
  | { kind: 'vehicle'; destination: string; vehicle: InventoryVehicle; via: 'id' | 'exact' | 'loose' }
  | { kind: 'fallback'; destination: string; via: 'model' | 'brand' | 'index' }

/**
 * Best destination for a car we no longer stock. Collapsing every sold listing
 * onto /inventory tells Google that dozens of distinct URLs are now one page,
 * which it treats as a soft 404. Walking model -> brand -> index keeps the
 * redirect topically honest. Tokens come from live facets, not a hardcoded
 * list, so this keeps working as the brand mix changes.
 */
export function resolveFallback(asciiSlug: string, facets: InventoryFacets): Resolution {
  const tokens = new Set(asciiSlug.split('-').filter(Boolean))
  const allPresent = (value: string) => {
    const parts = slugify(value).split('-').filter(Boolean)
    return parts.length > 0 && parts.every((p) => tokens.has(p))
  }

  for (const model of facets.models) {
    if (!allPresent(model.value)) continue
    const make = facets.makes.find((m) => allPresent(m.value))
    const base = make ? `${slugify(make.value)}-${slugify(model.value)}` : slugify(model.value)
    return { kind: 'fallback', destination: `/used-cars/${base}-in-jammu`, via: 'model' }
  }

  for (const make of facets.makes) {
    if (allPresent(make.value)) {
      return { kind: 'fallback', destination: `/brands/${slugify(make.value)}`, via: 'brand' }
    }
  }

  return { kind: 'fallback', destination: '/inventory', via: 'index' }
}

/**
 * Resolve one legacy /listings/<segment> to a destination path.
 *
 * `segment` is the final path segment, already decoded by the router (or not —
 * `exactKey` decodes defensively either way).
 */
export function resolveLegacyListing(
  segment: string,
  vehicles: InventoryVehicle[],
  facets: InventoryFacets,
): Resolution {
  const id = numericId(segment)
  if (id !== null) {
    const byId = vehicles.find((v) => v.id === id)
    return byId
      ? { kind: 'vehicle', destination: `/inventory/${byId.slug}`, vehicle: byId, via: 'id' }
      : { kind: 'fallback', destination: '/inventory', via: 'index' }
  }

  const wanted = exactKey(segment)

  const exact = vehicles.find((v) => sourceSegment(v)?.toLowerCase() === wanted)
  if (exact) {
    return { kind: 'vehicle', destination: `/inventory/${exact.slug}`, vehicle: exact, via: 'exact' }
  }

  // Emoji flattened away — only trusted when it resolves to exactly one car,
  // because two live slug pairs differ by nothing but their emoji.
  const ascii = slugify(wanted)
  const loose = vehicles.filter((v) => {
    const seg = sourceSegment(v)
    return seg !== null && slugify(seg) === ascii
  })
  if (loose.length === 1) {
    return { kind: 'vehicle', destination: `/inventory/${loose[0].slug}`, vehicle: loose[0], via: 'loose' }
  }

  return resolveFallback(ascii, facets)
}
