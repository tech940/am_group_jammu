/**
 * GET /api/feed/meta
 *
 * The Meta (Facebook / Instagram) vehicle catalogue feed, built live from the
 * same inventory the website shows. A car added to stock appears here on the
 * next refresh (this response may be cached for up to 30 minutes) and a sold
 * car drops out, so nobody has to export a spreadsheet by hand any more.
 *
 * `vehicle_id` is the car's own number in our stock list. Cars imported from
 * WordPress kept the number they had there, so the catalogue Meta already
 * holds stays matched to the same cars.
 *
 * HOW TO CONNECT IT IN META COMMERCE MANAGER (one-time setup)
 *   1. Commerce Manager -> pick the vehicle catalogue -> Data sources.
 *   2. Add items -> Data feed -> Scheduled feed.
 *   3. Feed URL:  https://<this site's domain>/api/feed/meta
 *      Leave username and password empty — the feed is public.
 *   4. Schedule: Hourly - the most often Meta fetches a scheduled feed.
 *   5. Currency INR. Upload type "Replace". A car marked sold stays in the
 *      feed for 30 days with availability `not_available`, so Meta stops
 *      advertising it at the next fetch; a deleted car leaves the feed and
 *      Replace removes it.
 *      For removal within seconds rather than within the hour, set
 *      META_CATALOG_ID and META_CATALOG_TOKEN: see lib/feed/meta-push.ts.
 *   6. Remove the old manually uploaded file as a data source, otherwise the
 *      same car is listed twice.
 *
 * WHY IS A CAR MISSING FROM THE ADS?
 *   Open  /api/feed/meta?format=json  — it lists every car left out and the
 *   reason (no price, no photo, or a model whose body style is not mapped yet
 *   in lib/feed/meta.ts).
 *
 * Each car's `url` is its page on this site (/inventory/<slug>). Set
 * NEXT_PUBLIC_SITE_URL to the public domain in production; without it the
 * origin of the incoming request is used.
 *
 * No auth: Meta fetches anonymously, and every field here is already public on
 * the listing pages.
 */

import type { NextRequest } from 'next/server'
import { getInventory, getRecentlySold } from '@/lib/inventory/server'
import { metaPushConfigured } from '@/lib/feed/meta-push'
import { buildMetaFeed, toCsv } from '@/lib/feed/meta'
import { SITE_URL, SITE_URL_IS_EXPLICIT } from '@/lib/seo/site'

export const maxDuration = 30

// Five minutes. Meta fetches a scheduled feed at most once an hour, so the
// feed it reads is never more than a few minutes behind the admin. (It was 30
// minutes, which could add half an hour before a sold car left the ads.)
const CACHE_OK = 'public, s-maxage=300, stale-while-revalidate=60'
/** Seconds Meta (or a CDN) should wait before retrying after a failed build. */
const RETRY_AFTER_SECONDS = 600

/**
 * Where each car's link in the feed points.
 *
 * The site's origin has one definition, lib/seo/site.ts. When the owner has
 * set it, that is used. Until then SITE_URL is only a guess (the old WordPress
 * domain), and an ad that sent buyers there would land on the wrong site, so
 * the address this request came in on is used instead.
 */
function siteOrigin(request: NextRequest): string {
  return SITE_URL_IS_EXPLICIT ? SITE_URL : request.nextUrl.origin
}

/**
 * A feed with no cars tells Meta to delete the whole catalogue. When the
 * inventory cannot be read — or reads as nothing usable — answer 503 so Meta
 * keeps the last good copy and tries again later.
 */
function unavailable(message: string, asJson: boolean): Response {
  const headers = {
    'Retry-After': String(RETRY_AFTER_SECONDS),
    'Cache-Control': 'no-store',
  }
  if (asJson) {
    return Response.json({ error: 'feed_unavailable', message }, { status: 503, headers })
  }
  return new Response(`${message}\n`, {
    status: 503,
    headers: { ...headers, 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

export async function GET(request: NextRequest) {
  const asJson = request.nextUrl.searchParams.get('format') === 'json'

  const snapshot = await getInventory()
  if (snapshot.degraded) {
    return unavailable('Inventory source is unavailable right now; feed not generated.', asJson)
  }

  const sold = await getRecentlySold()
  const { rows, skipped } = buildMetaFeed(snapshot.vehicles, siteOrigin(request), sold)
  const available = rows.filter((r) => r.availability === 'available').length

  if (asJson) {
    return Response.json(
      {
        included: rows.length,
        available,
        markedSold: rows.length - available,
        instantPush: metaPushConfigured() ? 'on' : 'off (META_CATALOG_ID and META_CATALOG_TOKEN not set)',
        skipped,
        total: snapshot.vehicles.length,
        fetchedAt: snapshot.fetchedAt,
      },
      { headers: { 'Cache-Control': CACHE_OK } },
    )
  }

  if (available === 0) {
    return unavailable(
      'No car in the inventory is complete enough for the feed; see ?format=json for the reasons.',
      false,
    )
  }

  return new Response(toCsv(rows), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'inline; filename="am-group-meta-vehicle-feed.csv"',
      'Cache-Control': CACHE_OK,
      'X-Feed-Included': String(rows.length),
      'X-Feed-Skipped': String(skipped.length),
    },
  })
}
