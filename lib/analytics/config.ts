/**
 * Analytics configuration: which tags exist, and where they may run.
 *
 * TWO VALUES ARE ENOUGH. The owner supplies NEXT_PUBLIC_GA_ID and
 * NEXT_PUBLIC_CLARITY_ID; the site then loads GA4 (gtag.js) and Microsoft
 * Clarity itself. No Google Tag Manager set-up is needed.
 *
 * THE ONE RULE AGAINST DOUBLE COUNTING
 *
 *   NEXT_PUBLIC_GTM_ID set    -> "gtm" mode. The GTM container is the ONLY
 *                                third-party script the site loads. GA4 and
 *                                Clarity are expected to be tags inside that
 *                                container, so the site does not load gtag.js
 *                                or Clarity and never calls gtag('event').
 *                                Events go to the dataLayer as plain objects,
 *                                which is what GTM triggers read.
 *   NEXT_PUBLIC_GTM_ID empty  -> "direct" mode. The site loads gtag.js and
 *                                Clarity from the two ids and sends every
 *                                event with gtag('event'). Nothing is pushed
 *                                for a container that is not there.
 *   no id at all              -> "off". Nothing loads.
 *
 * Setting the GA or Clarity id as well as a GTM id therefore changes nothing:
 * GTM wins, and each hit is still sent once.
 *
 * WHERE NOTHING LOADS (see hostAllowed and lib/analytics/consent.ts)
 *   - /admin, always
 *   - development (next dev)
 *   - a Vercel preview deployment, or any host that is not the site's own
 *   - a browser that said "No thanks", or one marked as staff
 *
 * Relative `.ts` imports and no `next/*`: lib/analytics is imported by code
 * that node scripts also load.
 */

import { SITE_URL } from '../seo/site.ts'

/**
 * An id is used only if it looks like one. These values end up in a script
 * URL, so a stray quote or space in an environment variable must not.
 */
function idFrom(value: string | undefined, shape: RegExp): string {
  const id = (value ?? '').trim()
  return shape.test(id) ? id : ''
}

/** GA4 measurement id, "G-XXXXXXXXXX". */
export const GA_ID = idFrom(process.env.NEXT_PUBLIC_GA_ID, /^G-[A-Z0-9]{4,20}$/)
/** Microsoft Clarity project id, about ten lower-case letters and digits. */
export const CLARITY_ID = idFrom(process.env.NEXT_PUBLIC_CLARITY_ID, /^[a-z0-9]{4,24}$/i)
/** Meta (Facebook / Instagram) Pixel id, a long number. Loaded in direct mode only. */
// The owner's pixel, supplied 2026-11-17. It is public by nature (it is in
// every page's source once it loads), so it is written here as the default;
// NEXT_PUBLIC_META_PIXEL_ID overrides it.
export const META_PIXEL_ID = idFrom(process.env.NEXT_PUBLIC_META_PIXEL_ID || '1429872412509869', /^\d{10,20}$/)
/** Optional Google Tag Manager container, "GTM-XXXXXXX". */
export const GTM_ID = idFrom(process.env.NEXT_PUBLIC_GTM_ID, /^GTM-[A-Z0-9]{4,12}$/)

export type AnalyticsMode = 'gtm' | 'direct' | 'off'

export const ANALYTICS_MODE: AnalyticsMode = GTM_ID ? 'gtm' : GA_ID || CLARITY_ID || META_PIXEL_ID ? 'direct' : 'off'

/**
 * What a browser that has not answered the notice gets.
 *
 * 'granted' = analytics run and the notice offers "No thanks" (opt-out).
 * 'denied'  = nothing runs until the visitor presses "Allow" (opt-in).
 *
 * Which of the two Indian law (the DPDP Act) requires is a legal question for
 * the owner. Changing this one word switches the whole site over, wording of
 * the notice included.
 */
export const CONSENT_DEFAULT: 'granted' | 'denied' = 'granted'

/**
 * The explicit override. NEXT_PUBLIC_GTM_DEV is the older name for the same
 * switch and still works.
 */
const FORCED =
  process.env.NEXT_PUBLIC_ANALYTICS_FORCE === 'true' || process.env.NEXT_PUBLIC_GTM_DEV === 'true'

/**
 * "production" | "preview" | "development" on Vercel, when the project has
 * "Automatically expose System Environment Variables" switched on. Empty
 * anywhere else.
 */
const VERCEL_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV ?? ''

const bareHost = (host: string) => host.toLowerCase().replace(/^www\./, '')

/**
 * Whether tags may run on the host the page is being read on.
 *
 * NODE_ENV alone is not enough: a Vercel preview deployment is also a
 * production build, and counting a colleague's preview click as a customer is
 * exactly what this prevents.
 */
export function hostAllowed(hostname: string): boolean {
  if (FORCED) return true
  if (process.env.NODE_ENV !== 'production') return false
  // Vercel says which kind of deployment this is: believe it.
  if (VERCEL_ENV) return VERCEL_ENV === 'production'
  // Otherwise the page must be on the site's own address (lib/seo/site.ts).
  try {
    return bareHost(hostname) === bareHost(new URL(SITE_URL).hostname)
  } catch {
    return false
  }
}
