/**
 * GET /api/feed/meta
 *
 * The Meta (Facebook / Instagram) vehicle catalogue feed, built live from the
 * same inventory the website shows. A car added to stock appears here on the
 * next refresh (the inventory is cached for about 30 minutes) and a sold car
 * drops out, so nobody has to export a spreadsheet by hand any more.
 *
 * HOW TO CONNECT IT IN META COMMERCE MANAGER (one-time setup)
 *   1. Commerce Manager -> pick the vehicle catalogue -> Data sources.
 *   2. Add items -> Data feed -> Scheduled feed.
 *   3. Feed URL:  https://<this site's domain>/api/feed/meta
 *      Leave username and password empty — the feed is public.
 *   4. Schedule: Hourly (or Daily). Turn on "Add automatic updates" if offered.
 *   5. Currency INR. Upload type "Replace", so cars that have left the feed
 *      (sold) are removed from the catalogue.
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
import { getInventory } from '@/lib/inventory/server'
import { buildMetaFeed, toCsv } from '@/lib/feed/meta'

export const maxDuration = 30

const CACHE_OK = 'public, s-maxage=1800, stale-while-revalidate=3600'
/** Seconds Meta (or a CDN) should wait before retrying after a failed build. */
const RETRY_AFTER_SECONDS = 600

function siteOrigin(request: NextRequest): string {
  const configured = (process.env.NEXT_PUBLIC_SITE_URL ?? '').trim().replace(/\/+$/, '')
  if (/^https?:\/\//i.test(configured)) return configured
  return request.nextUrl.origin
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

  const { rows, skipped } = buildMetaFeed(snapshot.vehicles, siteOrigin(request))

  if (asJson) {
    return Response.json(
      {
        included: rows.length,
        skipped,
        total: snapshot.vehicles.length,
        fetchedAt: snapshot.fetchedAt,
      },
      { headers: { 'Cache-Control': CACHE_OK } },
    )
  }

  if (rows.length === 0) {
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
