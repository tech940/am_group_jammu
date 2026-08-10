/**
 * Transport layer for the AM Group Motors inventory.
 *
 * SERVER ONLY. The WordPress nonce handled here must never reach the browser.
 *
 * Two transports:
 *
 *   'html'  GET https://amgroupind.com/used-cars-in-jammu/?posts_per_page=N
 *           Listings are server-rendered into the page, so this needs no nonce,
 *           no cookies and no auth. Served from the site's LiteSpeed cache, so
 *           it is fast and puts almost no load on the origin.
 *
 *   'ajax'  POST <pageUrl>?posts_per_page=N&security=<nonce>
 *           body: ajax_action=listings-result
 *           Returns JSON with an authoritative `total` and ready-made filter
 *           facets in addition to the same card markup.
 *
 * Nonce mechanics (verified against the live site):
 *   - The nonce is the anonymous WordPress nonce: tick-based, reusable across
 *     many requests, not per-session, and no cookie replay is needed.
 *   - The listings page is behind LiteSpeed full-page cache. A cache entry
 *     older than the nonce tick serves a DEAD nonce, and WordPress answers the
 *     POST with a bare `-1`. A `Cache-Control: no-cache` request header does
 *     NOT bust it; only a unique query-string parameter changes the cache key.
 *   - So the nonce is always acquired through a cache-busted GET, then reused
 *     for the rest of the run (and across runs, until it stops working).
 */

import { extractMaxPage, parseListings } from './parser.ts'
import type {
  MotorsFacetOption,
  MotorsFetchOptions,
  MotorsFetchResult,
  MotorsParseIssue,
  MotorsVehicle,
} from './types.ts'

/**
 * Origin of the WordPress site we read inventory from.
 *
 * MUST be overridden with MOTORS_BASE_URL once this app is serving
 * amgroupind.com itself. If it is not, the sync requests inventory from this
 * very app: /used-cars-in-jammu/ now 301s to /used-cars/jammu and returns
 * Next.js HTML, no Motors markup is found, and the site renders zero vehicles.
 *
 * Point it at wherever WordPress actually lives after the migration — e.g.
 * https://legacy.amgroupind.com — and keep that host online, because the
 * vehicle photographs are served from it too.
 */
export const MOTORS_BASE_URL = (
  process.env.MOTORS_BASE_URL || 'https://amgroupind.com'
).replace(/\/+$/, '')

export const MOTORS_LISTINGS_PATH = '/used-cars-in-jammu/'

const USER_AGENT =
  'Mozilla/5.0 (compatible; AMGroupSiteBot/1.0; +https://amgroupind.com) inventory-sync'

/** WordPress nonces live for two 12h ticks; refresh well inside that. */
const NONCE_TTL_MS = 6 * 60 * 60 * 1000

const DEFAULTS = {
  perPage: 50,
  maxPages: 20,
  timeoutMs: 15_000,
  politeDelayMs: 400,
} as const

export type MotorsErrorCode =
  | 'http_error'
  | 'timeout'
  | 'invalid_json'
  | 'nonce_rejected'
  | 'nonce_unavailable'
  | 'empty_response'

export class MotorsError extends Error {
  // Declared as plain fields rather than constructor parameter properties so
  // that scripts/*.ts can run under Node's strip-only TypeScript support.
  readonly code: MotorsErrorCode
  readonly status: number | undefined

  constructor(message: string, code: MotorsErrorCode, status?: number) {
    super(message)
    this.name = 'MotorsError'
    this.code = code
    this.status = status
  }
}

/**
 * Process-local nonce cache. Best-effort only — on serverless this will not
 * survive between invocations, in which case each cold start simply pays one
 * extra GET. Correctness never depends on it.
 */
let nonceCache: { value: string; acquiredAt: number } | null = null

/** Exposed for tests and for forcing re-acquisition after a `-1`. */
export function clearNonceCache(): void {
  nonceCache = null
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(t)
        reject(new DOMException('Aborted', 'AbortError'))
      },
      { once: true },
    )
  })
}

function withTimeout(timeoutMs: number, signal?: AbortSignal): AbortSignal {
  const timeout = AbortSignal.timeout(timeoutMs)
  return signal ? AbortSignal.any([signal, timeout]) : timeout
}

/** Build the listings URL for a given 1-based page number. */
export function listingsUrl(page: number, params: Record<string, string | number> = {}): URL {
  const path = page > 1 ? `${MOTORS_LISTINGS_PATH}page/${page}/` : MOTORS_LISTINGS_PATH
  const url = new URL(path, MOTORS_BASE_URL)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v))
  return url
}

async function httpText(
  url: URL | string,
  init: RequestInit & { timeoutMs: number; signal?: AbortSignal },
): Promise<{ text: string; status: number }> {
  const { timeoutMs, signal, ...rest } = init
  let res: Response
  try {
    res = await fetch(url, {
      ...rest,
      signal: withTimeout(timeoutMs, signal),
      headers: {
        'user-agent': USER_AGENT,
        'accept-language': 'en-IN,en;q=0.9',
        ...(rest.headers ?? {}),
      },
    })
  } catch (err) {
    if (err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
      throw new MotorsError(`Request to ${String(url)} timed out after ${timeoutMs}ms`, 'timeout')
    }
    throw err
  }

  if (!res.ok) {
    throw new MotorsError(`Upstream returned HTTP ${res.status} for ${String(url)}`, 'http_error', res.status)
  }
  return { text: await res.text(), status: res.status }
}

/** Pull the nonce out of a page. The JS var and the hidden input always agree. */
export function extractNonce(html: string): string | null {
  const fromVar = /var\s+stm_security_nonce\s*=\s*['"]([a-f0-9]+)['"]/i.exec(html)
  if (fromVar) return fromVar[1]
  const fromInput = /id=["']security["'][^>]*value=["']([a-f0-9]+)["']/i.exec(html)
  return fromInput ? fromInput[1] : null
}

/**
 * Acquire a usable nonce via a cache-busted GET.
 *
 * The cache-buster is required: without a unique query parameter LiteSpeed
 * serves a cached page whose nonce may be days old and therefore already dead.
 * Each buster mints a new cache entry, so this runs once per refresh cycle and
 * the result is reused, rather than once per request.
 */
export async function getNonce(
  opts: { timeoutMs?: number; signal?: AbortSignal; forceRefresh?: boolean } = {},
): Promise<string> {
  const { timeoutMs = DEFAULTS.timeoutMs, signal, forceRefresh = false } = opts

  if (!forceRefresh && nonceCache && Date.now() - nonceCache.acquiredAt < NONCE_TTL_MS) {
    return nonceCache.value
  }

  const url = listingsUrl(1, { _: `${Date.now()}${Math.floor(Math.random() * 1e6)}` })
  const { text } = await httpText(url, {
    timeoutMs,
    signal,
    headers: { 'cache-control': 'no-cache', pragma: 'no-cache' },
  })

  const nonce = extractNonce(text)
  if (!nonce) {
    throw new MotorsError('Could not find stm_security_nonce in the listings page', 'nonce_unavailable')
  }

  nonceCache = { value: nonce, acquiredAt: Date.now() }
  return nonce
}

interface AjaxPayload {
  html?: string
  total?: number
  url?: string
  options?: Record<string, Record<string, { id?: number; label?: string; count?: number }>>
}

/** Normalize the AJAX `options` blob into plain facet lists. */
function normalizeFacets(options: AjaxPayload['options']): Record<string, MotorsFacetOption[]> | null {
  if (!options || typeof options !== 'object') return null
  const facets: Record<string, MotorsFacetOption[]> = {}
  for (const [taxonomy, terms] of Object.entries(options)) {
    if (!terms || typeof terms !== 'object') continue
    const list: MotorsFacetOption[] = []
    for (const [slug, term] of Object.entries(terms)) {
      if (!slug || !term || typeof term !== 'object') continue // "" is the placeholder row
      list.push({
        slug,
        label: typeof term.label === 'string' ? term.label : slug,
        count: typeof term.count === 'number' ? term.count : null,
        termId: typeof term.id === 'number' ? term.id : null,
      })
    }
    if (list.length > 0) facets[taxonomy] = list
  }
  return Object.keys(facets).length > 0 ? facets : null
}

/**
 * One AJAX page request.
 * Throws `nonce_rejected` on the bare `-1` so the caller can re-acquire.
 */
async function fetchAjaxPage(
  page: number,
  nonce: string,
  perPage: number,
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<AjaxPayload> {
  const url = listingsUrl(page, { posts_per_page: perPage, security: nonce })
  const { text } = await httpText(url, {
    method: 'POST',
    timeoutMs,
    signal,
    headers: {
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'x-requested-with': 'XMLHttpRequest',
      referer: new URL(MOTORS_LISTINGS_PATH, MOTORS_BASE_URL).toString(),
    },
    body: new URLSearchParams({ ajax_action: 'listings-result' }).toString(),
  })

  const trimmed = text.trim()
  if (trimmed === '' ) throw new MotorsError('AJAX endpoint returned an empty body', 'empty_response')
  if (trimmed === '-1' || trimmed === '0') {
    throw new MotorsError(`AJAX endpoint rejected the nonce (returned "${trimmed}")`, 'nonce_rejected')
  }

  let payload: unknown
  try {
    payload = JSON.parse(trimmed)
  } catch {
    throw new MotorsError(
      `AJAX endpoint returned non-JSON (first 120 chars: ${trimmed.slice(0, 120)})`,
      'invalid_json',
    )
  }
  if (!payload || typeof payload !== 'object') {
    throw new MotorsError('AJAX endpoint returned a non-object payload', 'invalid_json')
  }
  return payload as AjaxPayload
}

interface PageOutcome {
  html: string
  total: number | null
  facets: Record<string, MotorsFacetOption[]> | null
}

/**
 * Fetch the inventory and return normalized vehicles.
 *
 * Pages are requested one at a time until every listing reported by `total`
 * has been collected (or the markup stops advertising more pages), deduplicated
 * by listing ID. With the default `perPage` of 50 the current inventory arrives
 * in a single request.
 */
export async function fetchInventory(options: MotorsFetchOptions = {}): Promise<MotorsFetchResult> {
  const {
    transport = 'auto',
    perPage = DEFAULTS.perPage,
    maxPages = DEFAULTS.maxPages,
    timeoutMs = DEFAULTS.timeoutMs,
    politeDelayMs = DEFAULTS.politeDelayMs,
    signal,
  } = options

  const warnings: string[] = []
  const issues: MotorsParseIssue[] = []
  const duplicateIds: number[] = []
  const byId = new Map<number, MotorsVehicle>()

  let activeTransport: 'ajax' | 'html' = transport === 'html' ? 'html' : 'ajax'
  let usedFallback = false
  let total: number | null = null
  let facets: Record<string, MotorsFacetOption[]> | null = null
  let pagesRequested = 0

  const getHtmlPage = async (page: number): Promise<PageOutcome> => {
    const url = listingsUrl(page, { posts_per_page: perPage })
    const { text } = await httpText(url, { timeoutMs, signal })
    return { html: text, total: null, facets: null }
  }

  const getAjaxPage = async (page: number): Promise<PageOutcome> => {
    let nonce = await getNonce({ timeoutMs, signal })
    try {
      const payload = await fetchAjaxPage(page, nonce, perPage, timeoutMs, signal)
      return {
        html: payload.html ?? '',
        total: typeof payload.total === 'number' ? payload.total : null,
        facets: normalizeFacets(payload.options),
      }
    } catch (err) {
      if (err instanceof MotorsError && err.code === 'nonce_rejected') {
        // Stale tick — re-acquire once with a fresh cache-buster and retry.
        warnings.push('Nonce was rejected; re-acquired a fresh one and retried.')
        nonce = await getNonce({ timeoutMs, signal, forceRefresh: true })
        const payload = await fetchAjaxPage(page, nonce, perPage, timeoutMs, signal)
        return {
          html: payload.html ?? '',
          total: typeof payload.total === 'number' ? payload.total : null,
          facets: normalizeFacets(payload.options),
        }
      }
      throw err
    }
  }

  const getPage = async (page: number): Promise<PageOutcome> => {
    if (activeTransport === 'html') return getHtmlPage(page)
    try {
      return await getAjaxPage(page)
    } catch (err) {
      if (transport === 'ajax') throw err // caller demanded AJAX; do not silently degrade
      const reason = err instanceof Error ? err.message : String(err)
      warnings.push(`AJAX transport failed (${reason}); fell back to the plain HTML transport.`)
      activeTransport = 'html'
      usedFallback = true
      return getHtmlPage(page)
    }
  }

  for (let page = 1; page <= maxPages; page++) {
    if (page > 1) await sleep(politeDelayMs, signal)

    let outcome: PageOutcome
    try {
      outcome = await getPage(page)
    } catch (err) {
      if (page === 1) throw err // nothing collected — surface the failure
      warnings.push(
        `Page ${page} failed (${err instanceof Error ? err.message : String(err)}); ` +
          `returning the ${byId.size} listing(s) collected so far.`,
      )
      break
    }
    pagesRequested++

    if (outcome.total !== null) total = outcome.total
    if (outcome.facets) facets = outcome.facets

    const parsed = parseListings(outcome.html, MOTORS_BASE_URL)
    issues.push(...parsed.issues)

    for (const vehicle of parsed.vehicles) {
      if (byId.has(vehicle.id)) {
        duplicateIds.push(vehicle.id)
        continue
      }
      byId.set(vehicle.id, vehicle)
    }

    // Stop conditions, cheapest first.
    if (parsed.vehicles.length === 0) break
    if (total !== null && byId.size >= total) break

    // Without an authoritative total, trust the pagination markup. The AJAX
    // fragment carries no pagination, so a short page ends the run.
    const maxPage = extractMaxPage(outcome.html)
    if (maxPage !== null) {
      if (page >= maxPage) break
    } else if (parsed.vehicles.length < perPage) {
      break
    }

    if (page === maxPages) {
      warnings.push(
        `Stopped at the maxPages cap (${maxPages}) with ${byId.size} listing(s)` +
          `${total !== null ? ` of ${total}` : ''}; some listings may be missing.`,
      )
    }
  }

  const vehicles = [...byId.values()]

  if (total !== null && vehicles.length !== total) {
    warnings.push(`WordPress reported total=${total} but ${vehicles.length} listing(s) were parsed.`)
  }

  return {
    vehicles,
    total,
    transport: activeTransport,
    usedFallback,
    pagesRequested,
    issues,
    facets,
    duplicateIds,
    fetchedAt: new Date().toISOString(),
    warnings,
  }
}
