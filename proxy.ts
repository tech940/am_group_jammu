import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/admin/session'

/**
 * Three jobs, all decided before a page is rendered:
 *
 *  1. Gate the admin area.
 *  2. Answer "410 Gone" for old WordPress URLs that have no home on this site.
 *  3. Send a few old WordPress URLs to their used-car equivalent, but only
 *     while that page really exists.
 *
 * In Next.js 16 the `middleware` file convention was renamed to `proxy`.
 *
 * The admin gate is the outer perimeter only — it stops a browser reaching the
 * pages. Server Actions are separately guarded by requireAdmin() in
 * lib/leads/actions.ts, because actions are publicly invocable endpoints that
 * a proxy matcher on page routes does not cover.
 *
 * Redirects in next.config.ts run BEFORE this file. A URL handled here must
 * not also be listed there, or the rule there wins and this never runs.
 */

/* -------------------------------------------------------------------------- */
/* 410 Gone                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * URLs the old site had that this site has nothing for.
 *
 * The first group is dead WordPress plugin pages. The rest is the company
 * site this used-car site replaced: news, the gallery, the cafés, fuel, real
 * estate, retail, and the new-vehicle showrooms with no used-car equivalent.
 * They used to redirect to the homepage or /inventory. A redirect to a page
 * about something else is what Google calls a soft 404: it keeps the old URL
 * in the index and counts against the page it lands on. 410 says plainly that
 * the page is gone, and it is dropped.
 *
 * If the group gives any of these a home on another website, replace its line
 * here with a 301 to that address in next.config.ts.
 */
const GONE_EXACT = new Set([
  // Motors plugin utility pages.
  '/compare',
  '/compare-page',
  '/profile-page',
  '/listing-creation-page',
  '/add-car',
  '/authorization',
  '/listing_template',
  // Company pages with no counterpart here.
  '/our-businesses',
  '/automobile',
  '/hp-indian-oil',
  '/real-estate',
  '/s-mega-mart',
  '/milele',
  '/mocha',
  '/gallery',
  // News.
  '/blog',
  '/news-updates',
  '/category/news',
  '/category/uncategorized',
  '/am-hyundai-bags-two-prestigious-awards',
  '/am-hyundai-inaugurates-smart-car-care-clinic',
  '/am-hyundai-launches-indias-first-fully-electric-suv-kona-electric',
  '/am-hyundai-launches-all-new-i20',
  // New-vehicle showrooms for makes this site has no used-car page for
  // (MG and the three two-wheeler franchises).
  '/amg-autocraft-jammu',
  '/honda-two-wheeler',
  '/ktm-jammu',
  '/am-bajaj-jammu',
])

const GONE_PREFIXES = ['/listing_template/']

function isGone(pathname: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return GONE_EXACT.has(path) || GONE_PREFIXES.some((p) => pathname.startsWith(p))
}

/**
 * The 410 body. A person who followed an old link should not get a blank
 * screen, so it says the page is gone and links to what the site does now.
 * Deliberately a bare document with no styling: it is served from here, before
 * the app and its stylesheet exist for this request.
 */
const GONE_HTML =
  '<!doctype html><html lang="en-IN"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width, initial-scale=1">' +
  '<meta name="robots" content="noindex"><title>Page removed | AM Group Used Cars</title></head>' +
  '<body><h1>This page has been removed</h1>' +
  '<p>This website is now AM Group Used Cars, Jammu.</p>' +
  '<p><a href="/used-cars/jammu">Used cars in Jammu</a> · <a href="/sell-your-car">Sell your car</a> · ' +
  '<a href="/contact">Contact</a></p></body></html>'

function gone(): NextResponse {
  return new NextResponse(GONE_HTML, {
    status: 410,
    headers: { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex' },
  })
}

/* -------------------------------------------------------------------------- */
/* Old URLs whose destination depends on what is in stock                      */
/* -------------------------------------------------------------------------- */

/** Always exists, and lists every car: the safe place to land. */
const FALLBACK = '/used-cars/jammu'

/**
 * The old new-car showroom pages for makes we do sell used. Someone looking
 * for "AM Hyundai" who lands on our used Hyundai cars has found the nearest
 * true thing this site has.
 */
const FRANCHISE_TO_BRAND: Record<string, string> = {
  '/hyundai': '/brands/hyundai',
  '/am-kia': '/brands/kia',
  '/am-tata': '/brands/tata',
}

/**
 * WordPress published its filter archives as /?taxonomy=<kind>&term=<value>.
 * These are the page each kind maps to here, when that page has cars.
 */
function taxonomyTarget(taxonomy: string, term: string): string | null {
  // Only a plain slug may be placed in a path.
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(term)) return null
  switch (taxonomy) {
    case 'make':
      return `/brands/${term}`
    case 'body':
      return `/used-cars/${term}-in-jammu`
    case 'fuel':
    case 'transmission':
      return `/used-cars/${term}-cars-in-jammu`
    default:
      // Price bands, years, colours, models and the rest have no page of
      // their own here.
      return null
  }
}

/**
 * Does this path answer 200 right now?
 *
 * Brand and landing pages exist only while a car is behind them, so a fixed
 * redirect table goes stale the day the last Chevrolet or the last sedan
 * sells, and the old URL then redirects into a 404. Asking the site itself is
 * the one check that cannot drift from what the pages do. It costs one small
 * request, on legacy URLs only. On any doubt (slow, error) the answer is no.
 */
async function isLive(request: NextRequest, path: string): Promise<boolean> {
  try {
    const res = await fetch(new URL(path, request.nextUrl.origin), {
      method: 'HEAD',
      redirect: 'manual',
      signal: AbortSignal.timeout(3000),
    })
    return res.status === 200
  } catch {
    return false
  }
}

/**
 * Redirect to `target` if it is live, otherwise to the page that lists every
 * car.
 *
 * The Location is built from the path alone, so the old query string
 * (?taxonomy=make&term=kia) is not carried along. A redirect written in
 * next.config.ts always carries it, which is why these live here.
 *
 * 301 when the real target exists. 302 when we are falling back, because the
 * target may exist again next week and a permanent redirect would be
 * remembered by browsers and search engines.
 */
async function redirectIfLive(request: NextRequest, target: string | null): Promise<NextResponse> {
  if (target && (await isLive(request, target))) {
    return NextResponse.redirect(new URL(target, request.nextUrl.origin), 301)
  }
  // A URL with no possible target (an unknown taxonomy) will never have one,
  // so that fallback is permanent.
  return NextResponse.redirect(new URL(FALLBACK, request.nextUrl.origin), target ? 302 : 301)
}

/* -------------------------------------------------------------------------- */

export async function proxy(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl

  if (isGone(pathname)) return gone()

  if (pathname === '/' && searchParams.has('taxonomy')) {
    const taxonomy = (searchParams.get('taxonomy') ?? '').toLowerCase()
    const term = (searchParams.get('term') ?? '').toLowerCase()
    return redirectIfLive(request, taxonomyTarget(taxonomy, term))
  }

  const franchise = FRANCHISE_TO_BRAND[pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname]
  if (franchise) return redirectIfLive(request, franchise)

  // Everything else that reaches this file is /admin (see the matcher).
  // Public pages MUST NEVER BE GATED.
  if (!pathname.startsWith('/admin')) return NextResponse.next()

  if (pathname === '/admin/login') return NextResponse.next()

  const token = request.cookies.get(ADMIN_COOKIE)?.value
  if (await verifySessionToken(token)) return NextResponse.next()

  const loginUrl = new URL('/admin/login', request.url)
  // Send the user back where they were headed once they sign in.
  if (pathname !== '/admin') loginUrl.searchParams.set('next', `${pathname}${search}`)

  const response = NextResponse.redirect(loginUrl)
  // Clear an expired or tampered cookie so it cannot linger.
  if (token) response.cookies.delete(ADMIN_COOKIE)
  return response
}

/**
 * Next reads this list at build time, so every entry is written out; it cannot
 * be computed from the sets above. Add a URL to GONE_EXACT or
 * FRANCHISE_TO_BRAND and it must be added here too, or this file never sees
 * the request.
 */
export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    // 410
    '/compare',
    '/compare-page',
    '/profile-page',
    '/listing-creation-page',
    '/add-car',
    '/authorization',
    '/listing_template',
    '/listing_template/:path*',
    '/our-businesses',
    '/automobile',
    '/hp-indian-oil',
    '/real-estate',
    '/s-mega-mart',
    '/milele',
    '/mocha',
    '/gallery',
    '/blog',
    '/news-updates',
    '/category/news',
    '/category/uncategorized',
    '/am-hyundai-bags-two-prestigious-awards',
    '/am-hyundai-inaugurates-smart-car-care-clinic',
    '/am-hyundai-launches-indias-first-fully-electric-suv-kona-electric',
    '/am-hyundai-launches-all-new-i20',
    '/amg-autocraft-jammu',
    '/honda-two-wheeler',
    '/ktm-jammu',
    '/am-bajaj-jammu',
    // Stock-dependent redirects
    '/hyundai',
    '/am-kia',
    '/am-tata',
    // The homepage itself is matched only when it carries ?taxonomy=.
    { source: '/', has: [{ type: 'query', key: 'taxonomy' }] },
  ],
}
