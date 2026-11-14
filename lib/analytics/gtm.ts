/**
 * The one door every analytics event goes through: pushEvent().
 *
 * WHERE AN EVENT GOES (the rule is set out in full in ./config.ts)
 *
 *   NEXT_PUBLIC_GTM_ID set   -> pushed to window.dataLayer as a plain object
 *                               ({ event, ...params }), the shape GTM triggers
 *                               read. gtag() is NOT called for it, so a GA4
 *                               tag inside the container is the only sender.
 *   GTM id empty, GA id set  -> sent with gtag('event', name, params). A plain
 *                               object is useless here: gtag.js ignores them.
 *   Clarity loaded           -> a short list of events is also marked on the
 *                               session recording, with page type, car and
 *                               intent as tags, so recordings can be filtered.
 *
 * WHERE AN EVENT GOES NOWHERE
 *   - on /admin, in a staff browser, or after the visitor said "No thanks"
 *   - in development or on a preview host: it is only left in
 *     window.dataLayer, where nothing reads it, so it can be inspected
 *
 * Event and parameter names deliberately reuse the vocabulary already stored on
 * a lead (`intent`, `sourceLabel`, `sourcePath`, see lib/leads/types.ts), so
 * GA4 totals can be compared with the admin lead table by intent, button and
 * page. They are compared as counts only: the id of a lead's row is never
 * sent, so no analytics record or session recording can be matched to the
 * named person who enquired.
 *
 * The dealer's phone number and email address are never sent as parameters,
 * and no visitor detail (name, number, message) is ever passed to an event.
 */

import type { InventoryVehicle } from '../inventory/types.ts'
import { ANALYTICS_MODE, CLARITY_ID, GA_ID, GTM_ID } from './config.ts'
import { analyticsState } from './consent.ts'

export { GTM_ID }

type Primitive = string | number | boolean | null | undefined

export interface DataLayerEvent {
  event: string
  [key: string]: Primitive | Primitive[] | Record<string, Primitive>[] | undefined
}

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[] }

declare global {
  interface Window {
    /** Shared by GTM and gtag.js: plain objects for GTM, `arguments` objects for gtag. */
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    clarity?: ClarityFn
  }
}

/**
 * Every event name the site sends. A new event is added here first, so the
 * list in the GA4 property and the list in the code cannot drift apart.
 */
export type AnalyticsEventName =
  // pages
  | 'page_view'
  | 'page_not_found'
  | 'scroll_depth'
  // stock
  | 'view_item_list'
  | 'select_item'
  | 'view_item'
  | 'search'
  | 'view_search_results'
  | 'search_no_results'
  | 'filter_apply'
  | 'filter_reset'
  | 'sort_change'
  | 'gallery_interact'
  | 'gallery_depth'
  // enquiries
  | 'enquiry_modal_open'
  | 'enquiry_modal_close'
  | 'form_start'
  | 'form_error'
  | 'generate_lead'
  | 'generate_lead_duplicate'
  // contact
  | 'contact_call'
  | 'contact_support'
  | 'contact_whatsapp'
  | 'contact_email'
  | 'get_directions'
  | 'outbound_click'

/* -------------------------------------------------------------------------- */
/* gtag and Clarity plumbing                                                  */
/* -------------------------------------------------------------------------- */

let tagsPrepared = false

/**
 * Set up the queues the tag scripts read when they arrive.
 *
 * Called before the first event and before any script is requested, so a
 * view_item fired while the page is still hydrating waits in the queue and is
 * replayed, instead of being lost because gtag.js had not loaded yet.
 *
 * Order matters to Google: consent defaults first, then 'js', then 'config'.
 */
export function prepareTags(): void {
  if (tagsPrepared || typeof window === 'undefined') return
  tagsPrepared = true

  window.dataLayer = window.dataLayer ?? []
  if (!window.gtag) {
    window.gtag = function gtag() {
      // gtag.js only acts on the `arguments` object itself. A rest-parameter
      // array pushed here is silently ignored, so this cannot be modernised.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments)
    }
  }

  // Google Consent Mode. This runs only for a browser that has not refused
  // analytics (a refusal means no tag loads at all), so analytics storage is
  // granted. The three advertising signals stay denied: the site runs no ad
  // tags, and they should only be opened once Google Ads is really connected.
  window.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })

  if (ANALYTICS_MODE === 'gtm') {
    // The first half of the standard GTM snippet; the container script itself
    // is requested by components/analytics/analytics.tsx.
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
    return
  }

  if (GA_ID) {
    window.gtag('js', new Date())
    // send_page_view false: the site sends page_view itself, once per real
    // page, so a filter click on /inventory is not counted as a page.
    window.gtag('config', GA_ID, { send_page_view: false })
  }

  if (CLARITY_ID && !window.clarity) {
    // The same queue the official Clarity snippet creates.
    const queue: ClarityFn = function clarity() {
      // eslint-disable-next-line prefer-rest-params
      ;(queue.q = queue.q ?? []).push(arguments)
    }
    window.clarity = queue
  }
}

function expireCookie(name: string): void {
  const host = window.location.hostname
  const parts = host.split('.')
  // The tags set their cookies on the widest domain they can, so try each one.
  const domains = ['', host]
  for (let i = 1; i < parts.length - 1; i++) domains.push(parts.slice(i).join('.'))
  for (const domain of domains) {
    document.cookie =
      `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/` + (domain ? `; domain=.${domain}` : '')
  }
}

/**
 * Turn the tags off in a page that already loaded them.
 *
 * A browser that refused before the page loaded never gets here: nothing was
 * loaded for it. This is for the visitor who presses "No thanks" (or turns
 * analytics off on the privacy page) part-way through a visit.
 */
export function stopTags(): void {
  if (typeof window === 'undefined') return
  try {
    // Google's documented kill switch for one measurement id.
    if (GA_ID) (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = true
    window.gtag?.('consent', 'update', { analytics_storage: 'denied' })
    // Documented: erases Clarity's cookies and stops tracking until consent.
    window.clarity?.('consent', false)
    // Not in Microsoft's reference, but part of the open-source clarity-js
    // API: ends the recording now rather than at the next page.
    window.clarity?.('stop')
  } catch {
    // A tag that will not stop cleanly is still starved by pushEvent below.
  }
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim()
    if (/^(_ga|_gid|_gat|_clck|_clsk)/.test(name)) expireCookie(name)
  }
}

/**
 * Undo stopTags() in the same page, for the visitor who turns analytics back
 * on from the privacy page. Clarity, once stopped, starts again with the next
 * page that is loaded.
 */
export function resumeTags(): void {
  if (typeof window === 'undefined') return
  if (GA_ID) (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = false
  window.gtag?.('consent', 'update', { analytics_storage: 'granted' })
}

/** Events worth finding a recording by. Everything else would be noise. */
const CLARITY_EVENTS = new Set<string>([
  'generate_lead',
  'enquiry_modal_open',
  'form_start',
  'form_error',
  'contact_call',
  'contact_whatsapp',
  'get_directions',
  'page_not_found',
  'search_no_results',
])

/** Set a custom tag on the Clarity session. No-op when Clarity is not on the page. */
export function clarityTag(key: string, value: string | null | undefined): void {
  if (typeof window === 'undefined' || !value) return
  if (analyticsState() !== 'live') return
  window.clarity?.('set', key, value)
}

function forwardToClarity(event: string, params: Record<string, unknown>): void {
  const clarity = window.clarity
  if (!clarity) return
  if (typeof params.lead_intent === 'string') clarity('set', 'lead_intent', params.lead_intent)
  if (typeof params.item_id === 'string') clarity('set', 'car_id', params.item_id)
  if (!CLARITY_EVENTS.has(event)) return
  clarity('event', event)
  // If Clarity ever has to sample, keep the sessions that became enquiries.
  if (event === 'generate_lead') clarity('upgrade', 'lead')
}

/* -------------------------------------------------------------------------- */
/* pushEvent                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Never sent, whoever asks. Contact details do not belong in analytics, and
 * neither does `lead_id`: it is the key of a row holding a name and a phone
 * number, and sending it would let a GA4 record or a Clarity replay be tied
 * to that person. Dropped here so that no caller can send it by mistake.
 */
const PRIVATE_PARAMS = new Set([
  'phone_number',
  'email_address',
  'name',
  'phone',
  'email',
  'message',
  'lead_id',
])

/**
 * Send one event. Safe to call anywhere: on the server, before the tags have
 * loaded, in development, and in a browser that refused analytics.
 *
 * `(string & {})` keeps the known names as suggestions without breaking a
 * caller that sends a name this file has not listed yet.
 */
export function pushEvent(
  event: AnalyticsEventName | (string & {}),
  params: Record<string, unknown> = {},
): void {
  if (typeof window === 'undefined') return

  const state = analyticsState()
  if (state === 'blocked') return

  const clean: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || PRIVATE_PARAMS.has(k)) continue
    clean[k] = v
  }

  if (state === 'idle') {
    // Nothing is listening. Left here only so the event can be read back from
    // the console while developing.
    window.dataLayer = window.dataLayer ?? []
    window.dataLayer.push({ event, ...clean })
    return
  }

  prepareTags()

  if (ANALYTICS_MODE === 'gtm') {
    window.dataLayer!.push({ event, ...clean })
  } else if (GA_ID) {
    window.gtag!('event', event, clean)
  }

  forwardToClarity(event, clean)
}

/* -------------------------------------------------------------------------- */
/* Shared parameters                                                           */
/* -------------------------------------------------------------------------- */

/** One word for the kind of page, sent as `page_type` on most events. */
export function pageType(pathname: string): string {
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/inventory/')) return 'vdp'
  if (pathname === '/inventory') return 'listing'
  if (pathname === '/locations') return 'locations'
  if (pathname.startsWith('/locations/')) return 'location'
  if (pathname.startsWith('/used-cars')) return 'landing'
  if (pathname.startsWith('/brands')) return 'brand'
  if (pathname === '/sell-your-car') return 'sell'
  if (pathname === '/contact') return 'contact'
  if (pathname === '/privacy-policy' || pathname === '/terms') return 'legal'
  return 'other'
}

/** 'sell' on the sell-your-car page, 'buy' everywhere else. */
export function pageIntent(pathname: string): 'buy' | 'sell' {
  return pathname === '/sell-your-car' ? 'sell' : 'buy'
}

/**
 * The car a car-page address is about.
 *
 * A car page is /inventory/<words>-<id>, e.g.
 * /inventory/maruti-suzuki-vitara-brezza-2016-5925, so the id is the number
 * the slug ends with. Null for any other address.
 */
export function carFromPath(pathname: string): { id: string; slug: string } | null {
  const match = /^\/inventory\/((?:[a-z0-9-]*-)?(\d+))\/?$/i.exec(pathname)
  return match ? { slug: match[1], id: match[2] } : null
}

/**
 * The few fields of a car an `items` entry is built from. Lists are handed to
 * the browser in this shape, not as whole cars: a whole car carries every
 * photo address, and a page of them is a lot of markup for nothing.
 */
export type ItemVehicle = Pick<
  InventoryVehicle,
  'id' | 'title' | 'make' | 'model' | 'bodyType' | 'fuel' | 'transmission' | 'condition' | 'price'
>

/** GA4 `items` entry for a vehicle. */
export function vehicleItem(v: ItemVehicle, index?: number): Record<string, Primitive> {
  return {
    item_id: String(v.id),
    item_name: v.title,
    item_brand: v.make ?? undefined,
    item_variant: v.model ?? undefined,
    item_category: v.bodyType ?? undefined,
    item_category2: v.fuel ?? undefined,
    item_category3: v.transmission ?? undefined,
    item_category4: v.condition ?? undefined,
    price: v.price ?? undefined,
    quantity: 1,
    index,
  }
}

/** Common vehicle context shared by several events. */
export function vehicleParams(v: InventoryVehicle | null | undefined) {
  if (!v) return { has_vehicle: false }
  return {
    has_vehicle: true,
    currency: 'INR',
    value: v.price ?? 0,
    items: [vehicleItem(v)],
    vehicle_slug: v.slug,
    vehicle_year: v.year ?? undefined,
    vehicle_mileage: v.mileage ?? undefined,
    is_discounted: v.isDiscounted,
    discount_percent: v.discountPercent ?? undefined,
    photo_count: v.photoCount,
  }
}

/**
 * Vehicle context for a LEAD event.
 *
 * Same as vehicleParams, except `value` is 0 and the price moves to
 * `listing_price`. An enquiry about a Rs 4,80,000 car is not Rs 4,80,000 of
 * revenue, and GA4 adds `value` up as if it were. If the owner later agrees a
 * nominal worth per lead, it goes here.
 */
export function leadVehicleParams(v: InventoryVehicle | null | undefined) {
  if (!v) return { has_vehicle: false, currency: 'INR', value: 0 }
  return { ...vehicleParams(v), value: 0, listing_price: v.price ?? undefined }
}
