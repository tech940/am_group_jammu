import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getInventory } from '@/lib/inventory/server'
import { resolveLegacyListing } from '@/lib/seo/legacy-listing-urls'

/**
 * 301s for the legacy WordPress listing URLs.
 *
 * The Motors plugin published every car at /listings/<wp-slug>/ — and those
 * slugs are literally emoji-prefixed ("🚙-hyundai-alcazar-2-0-mt-prestige-
 * executive-7"), plus one bare-numeric form, /listings/5087/. All 27 are in
 * Google's index today, so every one has to land somewhere sensible.
 *
 * This is a route handler rather than a next.config redirect table because
 * stock turns over: a static map of today's 27 slugs is wrong the first time a
 * car sells. Matching runs against live inventory, where `sourceUrl` is the
 * exact WordPress URL the vehicle was scraped from — so the mapping is derived,
 * never hand-maintained.
 *
 * The emoji are load-bearing. Two pairs of live slugs differ by nothing else:
 *
 *   🚘-hyundai-i20-sportz-vtvt     (4929)   🚗-hyundai-i20-sportz-vtvt     (4497)
 *   🚘-hyundai-creta-1-5-mpi-mt-sx (4901)   🚗-hyundai-creta-1-5-mpi-mt-sx (4642)
 *
 * Flattening them to ASCII makes each pair identical, which would quietly send
 * one car's traffic to the other car's page. The matching rules live in
 * lib/seo/legacy-listing-urls.ts and are covered by scripts/test-redirects.ts.
 */

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await ctx.params
  const segments = (slug ?? []).filter(Boolean)

  const redirect = (to: string) =>
    NextResponse.redirect(new URL(to, request.nextUrl.origin), 301)

  if (segments.length === 0) return redirect('/inventory')

  const { vehicles, facets } = await getInventory()

  // Upstream is down — bounce to the listing page rather than 404ing a URL that
  // is genuinely still valid. A 301 here is safe: it is where the car lives.
  if (vehicles.length === 0) return redirect('/inventory')

  const resolved = resolveLegacyListing(segments[segments.length - 1], vehicles, facets)
  return redirect(resolved.destination)
}
