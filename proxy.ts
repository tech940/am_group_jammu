import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/admin/session'

/**
 * Gate the admin area.
 *
 * In Next.js 16 the `middleware` file convention was renamed to `proxy`.
 *
 * This is the outer perimeter only — it stops a browser reaching the pages.
 * Server Actions are separately guarded by requireAdmin() in
 * lib/leads/actions.ts, because actions are publicly invocable endpoints that
 * a proxy matcher on page routes does not cover.
 */
/**
 * Dead WordPress URLs that must not be redirected anywhere.
 *
 * These are Motors-plugin utility shells — a comparison tray, a user dashboard,
 * a "submit your listing" form, a login screen, and the plugin's demo listing
 * templates (which render a fictional BMW M5 at ₹120,000). They carry no
 * content a person searched for, and they are all in the AIOSEO sitemap.
 *
 * A 301 would launder them into a real page and invite Google to treat that
 * page as their replacement. 410 Gone says the resource is deliberately
 * retired, which drops them from the index faster than a 404 and passes nothing
 * on. That is the correct signal for a page that should never have been public.
 */
const GONE_EXACT = new Set([
  '/compare',
  '/compare-page',
  '/profile-page',
  '/listing-creation-page',
  '/add-car',
  '/authorization',
  '/listing_template',
])

const GONE_PREFIXES = ['/listing_template/']

function isGone(pathname: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return GONE_EXACT.has(path) || GONE_PREFIXES.some((p) => pathname.startsWith(p))
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (isGone(pathname)) {
    return new NextResponse(null, {
      status: 410,
      headers: { 'x-robots-tag': 'noindex' },
    })
  }

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

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    // Retired WordPress URLs answered with 410 — see GONE_EXACT above.
    '/compare',
    '/compare-page',
    '/profile-page',
    '/listing-creation-page',
    '/add-car',
    '/authorization',
    '/listing_template',
    '/listing_template/:path*',
  ],
}
