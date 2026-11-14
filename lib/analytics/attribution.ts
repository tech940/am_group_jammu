/**
 * How this browser found the site: the browser half.
 *
 * Before this, a lead said which PAGE it came from and nothing about which
 * advert, search or shared link brought the person there, so the owner could
 * not tell a Google Business Profile click from a paid one.
 *
 * Two touches are kept, both in the visitor's own browser and nowhere else:
 *
 *   first touch   localStorage  'am_attr_first'   the first arrival remembered
 *                                                 (replaced after 90 days)
 *   last touch    sessionStorage 'am_attr_last'   the arrival of this visit
 *
 * Nothing is sent anywhere when it is captured. It leaves the browser only
 * attached to an enquiry the visitor chooses to submit (getAttribution is
 * called by the two lead forms). It is first-party and separate from GA4 and
 * Clarity, so the analytics "No thanks" does not switch it off; the privacy
 * policy says so.
 *
 * No library: this is a dozen URL parameters and document.referrer.
 */

import { channelOf, sanitizeAttribution, sanitizeTouch } from '../leads/attribution.ts'
import type { LeadAttribution, LeadTouch } from '../leads/attribution.ts'

const FIRST_KEY = 'am_attr_first'
const LAST_KEY = 'am_attr_last'
const FIRST_TOUCH_DAYS = 90

const CAMPAIGN_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'gbraid',
  'wbraid',
  'fbclid',
] as const

function readStored(storage: Storage, key: string): LeadTouch | null {
  try {
    const raw = storage.getItem(key)
    // Cleaned on the way out as well as in: storage can be edited by hand.
    return raw ? sanitizeTouch(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

function store(storage: Storage, key: string, touch: LeadTouch): void {
  try {
    storage.setItem(key, JSON.stringify(touch))
  } catch {
    // Storage full or blocked: this visit simply has no remembered touch.
  }
}

/** The touch described by the address and referrer of the page as it loaded. */
function currentTouch(): { touch: LeadTouch | null; isNewArrival: boolean; fromThisSite: boolean } {
  const params = new URLSearchParams(window.location.search)
  const raw: Record<string, string> = {}
  let hasCampaign = false
  for (const key of CAMPAIGN_PARAMS) {
    const value = params.get(key)
    if (value) {
      raw[key] = value
      hasCampaign = true
    }
  }

  // Only a referrer from ANOTHER site says where someone came from.
  let external = false
  let fromThisSite = false
  try {
    if (document.referrer) {
      if (new URL(document.referrer).host === window.location.host) fromThisSite = true
      else {
        raw.referrer = document.referrer
        external = true
      }
    }
  } catch {
    // An unparseable referrer is treated as none.
  }

  raw.landing_path = window.location.pathname
  raw.at = new Date().toISOString()
  return { touch: sanitizeTouch(raw), isNewArrival: hasCampaign || external, fromThisSite }
}

let captured = false

/**
 * Record how this page load arrived. Call once per full page load, as early as
 * possible (the analytics host does, on mount): a client-side navigation would
 * otherwise replace the landing address before it had been read.
 */
export function captureAttribution(): void {
  if (captured || typeof window === 'undefined') return
  captured = true

  let session: Storage
  let local: Storage
  try {
    session = window.sessionStorage
    local = window.localStorage
  } catch {
    return
  }

  const { touch, isNewArrival, fromThisSite } = currentTouch()
  if (!touch) return

  // A car opened in a new tab from this site's own pages starts with empty
  // session storage and says nothing about where the visitor came from.
  // Recording it would label an advert's lead "Direct"; the first touch
  // speaks for that tab instead.
  if (fromThisSite && !isNewArrival) return

  // Last touch: set when the visit starts, and again only if the visitor
  // comes back in the same tab through another advert or another site.
  if (isNewArrival || !readStored(session, LAST_KEY)) store(session, LAST_KEY, touch)

  const first = readStored(local, FIRST_KEY)
  const firstAge = first?.at ? Date.now() - Date.parse(first.at) : Infinity
  if (!first || firstAge > FIRST_TOUCH_DAYS * 86_400_000) store(local, FIRST_KEY, touch)
}

/** Both touches, cleaned, ready to send with a lead. Null when there are none. */
export function getAttribution(): LeadAttribution | null {
  if (typeof window === 'undefined') return null
  try {
    return sanitizeAttribution({
      first: readStored(window.localStorage, FIRST_KEY),
      last: readStored(window.sessionStorage, LAST_KEY),
    })
  } catch {
    return null
  }
}

/**
 * The same story as event parameters, for generate_lead, so GA4 and the lead
 * desk name the channel the same way. Campaign names only: click ids are
 * identifiers and stay out of analytics events.
 */
export function attributionParams(): Record<string, string | undefined> {
  const attribution = getAttribution()
  const touch = attribution?.last ?? attribution?.first ?? null
  return {
    lead_channel: channelOf(touch),
    lead_utm_source: touch?.utm_source,
    lead_utm_medium: touch?.utm_medium,
    lead_utm_campaign: touch?.utm_campaign,
    lead_landing_path: touch?.landing_path,
  }
}
