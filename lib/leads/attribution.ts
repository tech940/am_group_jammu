/**
 * How an enquiry found the site: the pure, shared half.
 *
 * The browser collects a "touch" (campaign tags, ad click ids, the referring
 * site and the first page) and sends two of them with every lead: the FIRST
 * the browser ever arrived with and the LAST one before the enquiry. This file
 * holds the shape, the server-side cleaning and the wording, so the browser
 * code (lib/analytics/attribution.ts), the server action, the admin note and
 * the lead email all agree.
 *
 * Everything in a touch is typed by a stranger: a utm_source is whatever the
 * link said. It is cleaned here on the way in and only ever printed as text
 * (React escapes it in the admin, lib/leads/notify.ts escapes it in the email).
 *
 * No `next/*` or `@/` imports: scripts/test-leads.ts loads lib/leads directly
 * with node.
 */

/** The fields of one touch. All optional, all short strings. */
export const TOUCH_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  /** Google Ads click ids (gclid on the web, gbraid / wbraid from iOS). */
  'gclid',
  'gbraid',
  'wbraid',
  /** Meta (Facebook / Instagram) click id. */
  'fbclid',
  /** Host and path of the site the visitor came from. Never a query string. */
  'referrer',
  /** First page of that visit, path only. */
  'landing_path',
  /** When the touch was recorded, ISO-8601. */
  'at',
] as const

export type TouchKey = (typeof TOUCH_KEYS)[number]
export type LeadTouch = Partial<Record<TouchKey, string>>

export interface LeadAttribution {
  /** The first arrival this browser remembers. */
  first: LeadTouch | null
  /** The arrival that led to this enquiry. */
  last: LeadTouch | null
}

const MAX_LEN = 200

/** One line of plain text: no control characters, no runs of spaces, capped. */
function cleanText(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_LEN)
}

/**
 * Reduce a referrer to "host/path".
 *
 * The query string is dropped on purpose: on a search engine it can hold what
 * the person typed, which is nobody's business in a lead record.
 */
export function referrerHostPath(raw: unknown): string {
  const text = cleanText(raw)
  if (!text) return ''
  try {
    const url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`)
    const path = url.pathname === '/' ? '' : url.pathname
    return `${url.hostname.toLowerCase()}${path}`.slice(0, MAX_LEN)
  } catch {
    return ''
  }
}

/** Clean one touch. Unknown keys are dropped; an empty result is null. */
export function sanitizeTouch(raw: unknown): LeadTouch | null {
  if (!raw || typeof raw !== 'object') return null
  const source = raw as Record<string, unknown>
  const out: LeadTouch = {}

  for (const key of TOUCH_KEYS) {
    let value = cleanText(source[key])
    if (!value) continue
    if (key === 'referrer') value = referrerHostPath(value)
    // A path is a path: anything else in this field is not ours.
    if (key === 'landing_path') value = value.startsWith('/') ? value.split(/[?#]/)[0] : ''
    if (key === 'at') {
      const t = Date.parse(value)
      value = Number.isNaN(t) ? '' : new Date(t).toISOString()
    }
    if (value) out[key] = value
  }

  // A touch that is only a timestamp says nothing.
  const informative = Object.keys(out).some((k) => k !== 'at')
  return informative ? out : null
}

export function sanitizeAttribution(raw: unknown): LeadAttribution | null {
  if (!raw || typeof raw !== 'object') return null
  const source = raw as Record<string, unknown>
  const first = sanitizeTouch(source.first)
  const last = sanitizeTouch(source.last)
  return first || last ? { first, last } : null
}

const AI_ASSISTANTS = [
  'chatgpt.com',
  'chat.openai.com',
  'perplexity.ai',
  'gemini.google.com',
  'copilot.microsoft.com',
  'claude.ai',
]
const SEARCH_ENGINES = /(^|\.)(google|bing|duckduckgo|yahoo|ecosia|brave)\./

/**
 * A touch as one word the sales desk can read.
 *
 * "Direct or unknown" rather than "Direct": a browser that blocks storage or
 * strips referrers looks exactly like someone who typed the address.
 */
export function channelOf(touch: LeadTouch | null | undefined): string {
  if (!touch) return 'Direct or unknown'
  const source = (touch.utm_source ?? '').toLowerCase()
  const host = (touch.referrer ?? '').split('/')[0]

  if (touch.gclid || touch.gbraid || touch.wbraid) return 'Google Ads'
  if (touch.fbclid || /^(facebook|instagram|meta|fb|ig)$/.test(source)) {
    return 'Meta (Facebook / Instagram)'
  }
  if (touch.utm_source || touch.utm_medium) {
    return `${touch.utm_source ?? 'unknown source'} / ${touch.utm_medium ?? 'unknown medium'}`
  }
  // Checked before search engines: gemini.google.com is a google host.
  if (AI_ASSISTANTS.some((d) => host === d || host.endsWith(`.${d}`))) return 'AI assistant'
  if (host && SEARCH_ENGINES.test(`${host}.`)) return 'Organic search'
  if (host) return `Referral (${host})`
  return 'Direct or unknown'
}

/** "source google, medium cpc, landed on /used-cars/jammu, from google.com". */
export function describeTouch(touch: LeadTouch | null | undefined): string {
  if (!touch) return ''
  const parts: string[] = []
  if (touch.utm_source) parts.push(`source ${touch.utm_source}`)
  if (touch.utm_medium) parts.push(`medium ${touch.utm_medium}`)
  if (touch.utm_campaign) parts.push(`campaign ${touch.utm_campaign}`)
  if (touch.utm_term) parts.push(`term ${touch.utm_term}`)
  if (touch.utm_content) parts.push(`content ${touch.utm_content}`)
  if (touch.gclid) parts.push(`gclid ${touch.gclid}`)
  if (touch.gbraid) parts.push(`gbraid ${touch.gbraid}`)
  if (touch.wbraid) parts.push(`wbraid ${touch.wbraid}`)
  if (touch.fbclid) parts.push(`fbclid ${touch.fbclid}`)
  if (touch.referrer) parts.push(`from ${touch.referrer}`)
  if (touch.landing_path) parts.push(`landed on ${touch.landing_path}`)
  if (touch.at) parts.push(`on ${touch.at.slice(0, 10)}`)
  return parts.join(', ')
}

/**
 * The same lines as one string, for the lead's history.
 *
 * One line, no line breaks: the admin lead page prints an activity note as a
 * single paragraph.
 */
export function attributionNote(attribution: LeadAttribution | null | undefined): string {
  return attributionLines(attribution)
    .map(([label, value]) => `${label}: ${value}`)
    .join('. ')
}

function sameTouch(a: LeadTouch | null, b: LeadTouch | null): boolean {
  if (!a || !b) return false
  return TOUCH_KEYS.every((k) => (a[k] ?? '') === (b[k] ?? ''))
}

/**
 * The labelled lines the lead desk and the email both show.
 *
 * Empty when nothing was captured, so no lead gets a line that only says
 * "unknown".
 */
export function attributionLines(attribution: LeadAttribution | null | undefined): [string, string][] {
  if (!attribution) return []
  const { first, last } = attribution
  const lines: [string, string][] = []
  const latest = last ?? first

  lines.push(['Channel', channelOf(latest)])
  if (last) lines.push(['This visit', describeTouch(last)])
  if (first && !sameTouch(first, last)) {
    lines.push(['First visit', `${channelOf(first)}: ${describeTouch(first)}`])
  }
  return lines
}
