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

  // ONLY gate /admin routes and 410 retired WP URLs.
  // Public pages (/, /about, /inventory, /locations, etc.) MUST NEVER BE GATED.
  if (!pathname.startsWith('/admin') && !isGone(pathname)) {
    return NextResponse.next()
  }

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
