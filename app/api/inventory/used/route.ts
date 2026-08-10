import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  getUsedInventory,
  MotorsError,
  MOTORS_REVALIDATE_SECONDS,
} from '@/lib/integrations/motors'

/**
 * GET /api/inventory/used
 *
 * Normalized used-vehicle inventory, sourced from the AM Group WordPress site.
 * Returns clean JSON — never the upstream markup.
 *
 * Query params:
 *   ?fresh=1        bypass the cache (requires MOTORS_REFRESH_TOKEN, see below)
 *   ?transport=     'auto' (default) | 'ajax' | 'html'
 *   ?perPage=       listings per upstream request, 1-100 (default 50)
 *   ?debug=1        include parse issues, warnings and facets in the response
 *
 * The upstream nonce is never included in any response.
 */

// Give the platform headroom for a slow upstream plus parsing.
export const maxDuration = 30

const MAX_PER_PAGE = 100

function parsePerPage(raw: string | null): number {
  const n = raw ? Number.parseInt(raw, 10) : NaN
  if (!Number.isFinite(n)) return 50
  return Math.min(Math.max(n, 1), MAX_PER_PAGE)
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const transportParam = searchParams.get('transport')
  const transport =
    transportParam === 'ajax' || transportParam === 'html' || transportParam === 'auto'
      ? transportParam
      : 'auto'

  const debug = searchParams.get('debug') === '1'

  // A cache bypass is a request amplifier pointed at the WordPress origin, so
  // it is gated behind a shared secret. Without the env var configured the
  // bypass is simply unavailable rather than open to the world.
  let fresh = false
  if (searchParams.get('fresh') === '1') {
    const expected = process.env.MOTORS_REFRESH_TOKEN
    const provided = request.headers.get('x-refresh-token')
    if (!expected || provided !== expected) {
      return NextResponse.json(
        { error: 'forbidden', message: 'fresh=1 requires a valid x-refresh-token header.' },
        { status: 403 },
      )
    }
    fresh = true
  }

  try {
    const result = await getUsedInventory({
      fresh,
      transport,
      perPage: parsePerPage(searchParams.get('perPage')),
    })

    const body = {
      vehicles: result.vehicles,
      count: result.vehicles.length,
      total: result.total,
      fetchedAt: result.fetchedAt,
      ...(debug
        ? {
            debug: {
              transport: result.transport,
              usedFallback: result.usedFallback,
              pagesRequested: result.pagesRequested,
              duplicateIds: result.duplicateIds,
              warnings: result.warnings,
              issues: result.issues,
              facets: result.facets,
            },
          }
        : {}),
    }

    return NextResponse.json(body, {
      headers: {
        'Cache-Control': fresh
          ? 'no-store'
          : `public, s-maxage=${MOTORS_REVALIDATE_SECONDS}, stale-while-revalidate=${MOTORS_REVALIDATE_SECONDS * 2}`,
      },
    })
  } catch (err) {
    if (err instanceof MotorsError) {
      const status = err.code === 'timeout' ? 504 : 502
      return NextResponse.json(
        { error: err.code, message: err.message, upstreamStatus: err.status ?? null },
        { status },
      )
    }
    console.error('[api/inventory/used] unexpected failure', err)
    return NextResponse.json(
      { error: 'internal_error', message: 'Failed to load inventory.' },
      { status: 500 },
    )
  }
}
