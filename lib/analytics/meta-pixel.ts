/**
 * Meta (Facebook / Instagram) Pixel. Browser only.
 *
 * Loaded by components/analytics/analytics.tsx from NEXT_PUBLIC_META_PIXEL_ID,
 * under the same rules as GA4 and Clarity (lib/analytics/config.ts): never on
 * /admin, never on preview deployments, never for a browser that said
 * "No thanks". Events reach it only through pushEvent() in gtm.ts, which has
 * already dropped names, phone numbers, emails and messages.
 *
 * WHAT IS SENT, mapped from the site's own events (sources: Meta Pixel
 * reference, and the Automotive Inventory Ads events guide, read 2026-11-17):
 *
 *   page_view          -> PageView
 *   view_item          -> ViewContent  content_type 'vehicle', content_ids [car id]
 *                                      + make, model, year, state_of_vehicle,
 *                                        price, currency, country
 *   search             -> Search       search_string, content_type 'vehicle'
 *   generate_lead      -> Lead         (no contact details; the enquiry's intent
 *                                       as content_category, and the car id
 *                                       when the enquiry was about one car)
 *   contact_call       -> Contact
 *   contact_whatsapp   -> Contact
 *
 * content_ids are the car's id, which is also its `vehicle_id` in the
 * catalogue feed (/api/feed/meta), so Meta can tie a view or a lead to the
 * catalogue item and retarget the car the visitor looked at.
 *
 * PageView is sent per real page by the site (not by fbq('init')), because
 * this is a single-page app: the browser does not reload between pages.
 */

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void
  queue?: unknown[]
  push?: unknown
  loaded?: boolean
  version?: string
}

declare global {
  interface Window {
    fbq?: Fbq
    _fbq?: Fbq
  }
}

/** Create Meta's command queue (the first half of the official base code). */
export function preparePixel(pixelId: string): void {
  if (typeof window === 'undefined' || !pixelId || window.fbq) return
  // Typed as Fbq up front so the properties fbevents.js later attaches
  // (callMethod) are part of the type the queue function refers to.
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args)
    else fbq.queue!.push(args)
  } as Fbq
  fbq.queue = []
  fbq.push = fbq
  fbq.loaded = true
  fbq.version = '2.0'
  window.fbq = fbq
  if (!window._fbq) window._fbq = fbq
  fbq('init', pixelId)
}

/** Stop the pixel for a visitor who turns tracking off part-way through a visit. */
export function stopPixel(): void {
  try {
    window.fbq?.('consent', 'revoke')
  } catch {
    // nothing else to do: pushEvent stops sending anyway
  }
}

export function resumePixel(): void {
  try {
    window.fbq?.('consent', 'grant')
  } catch {
    // ignore
  }
}

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined)
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined)

function firstItem(params: Record<string, unknown>): Record<string, unknown> {
  const items = params.items
  return Array.isArray(items) && items[0] && typeof items[0] === 'object' ? (items[0] as Record<string, unknown>) : {}
}

/** Translate one site event to the pixel. Unmapped events are not sent. */
export function forwardToPixel(event: string, params: Record<string, unknown>): void {
  const fbq = window.fbq
  if (!fbq) return

  switch (event) {
    case 'page_view':
      fbq('track', 'PageView')
      return

    case 'view_item': {
      const item = firstItem(params)
      const id = str(item.item_id)
      if (!id) return
      fbq('track', 'ViewContent', {
        content_type: 'vehicle',
        content_ids: [id],
        content_name: str(item.item_name),
        make: str(item.item_brand),
        model: str(item.item_variant),
        year: num(params.vehicle_year),
        state_of_vehicle: 'Used',
        price: num(item.price),
        currency: 'INR',
        country: 'India',
      })
      return
    }

    case 'search': {
      const term = str(params.search_term)
      fbq('track', 'Search', { content_type: 'vehicle', search_string: term })
      return
    }

    case 'generate_lead': {
      const item = firstItem(params)
      const id = str(item.item_id)
      fbq('track', 'Lead', {
        content_category: str(params.lead_intent),
        ...(id ? { content_ids: [id], content_type: 'vehicle' } : {}),
        currency: 'INR',
        value: 0,
      })
      return
    }

    case 'contact_call':
    case 'contact_whatsapp':
      fbq('track', 'Contact', { content_category: event === 'contact_call' ? 'call' : 'whatsapp' })
      return

    default:
      return
  }
}
