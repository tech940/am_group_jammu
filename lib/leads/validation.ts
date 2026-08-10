/**
 * Input validation for public lead capture.
 *
 * The old modal validated almost nothing: `type="tel"` enforces no format, so
 * "asdf" was a valid phone number, and there was no bot protection at all on a
 * publicly-invocable server action.
 */

import type { CreateLeadInput, LeadIntent } from './types.ts'
import { LEAD_INTENTS } from './types.ts'

export interface ValidationResult {
  ok: boolean
  errors: Record<string, string>
  /** Present only when ok. */
  clean?: {
    name: string
    phone: string
    email: string | null
    message: string | null
    intent: LeadIntent
    sourcePath: string | null
    sourceLabel: string | null
    consent: boolean
  }
}

const MAX = { name: 120, email: 200, message: 2000, path: 300, label: 60 } as const

/**
 * Normalize an Indian mobile number to +91XXXXXXXXXX.
 * Accepts 10 digits, 0-prefixed, 91-prefixed, and +91 with any spacing.
 */
export function normalizePhone(raw: string): string | null {
  const digits = (raw ?? '').replace(/\D/g, '')
  if (!digits) return null

  let local = digits
  if (local.length === 12 && local.startsWith('91')) local = local.slice(2)
  else if (local.length === 11 && local.startsWith('0')) local = local.slice(1)
  else if (local.length === 13 && local.startsWith('091')) local = local.slice(3)

  // Indian mobile numbers are 10 digits starting 6-9.
  if (!/^[6-9]\d{9}$/.test(local)) return null
  return `+91${local}`
}

export function isValidEmail(raw: string): boolean {
  if (raw.length > MAX.email) return false
  // Deliberately simple: catches typos without rejecting valid odd addresses.
  return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(raw.trim())
}

export function validateLead(input: CreateLeadInput): ValidationResult {
  const errors: Record<string, string> = {}

  // Honeypot: hidden field, invisible to humans. Treated as a hard reject.
  if (input.companyWebsite && input.companyWebsite.trim() !== '') {
    return { ok: false, errors: { _bot: 'Rejected.' } }
  }

  const name = (input.name ?? '').trim().replace(/\s+/g, ' ')
  if (name.length < 2) errors.name = 'Please enter your name.'
  else if (name.length > MAX.name) errors.name = 'That name is too long.'

  const phone = normalizePhone(input.phone ?? '')
  if (!phone) errors.phone = 'Enter a valid 10-digit Indian mobile number.'

  let email: string | null = null
  const rawEmail = (input.email ?? '').trim()
  if (rawEmail) {
    if (!isValidEmail(rawEmail)) errors.email = 'Enter a valid email address.'
    else email = rawEmail.toLowerCase()
  }

  const rawMessage = (input.message ?? '').trim()
  if (rawMessage.length > MAX.message) errors.message = 'Please keep your message under 2000 characters.'
  const message = rawMessage || null

  const intent: LeadIntent = LEAD_INTENTS.includes(input.intent as LeadIntent)
    ? (input.intent as LeadIntent)
    : 'General'

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  return {
    ok: true,
    errors: {},
    clean: {
      name,
      phone: phone!,
      email,
      message,
      intent,
      sourcePath: (input.sourcePath ?? '').slice(0, MAX.path) || null,
      sourceLabel: (input.sourceLabel ?? '').slice(0, MAX.label) || null,
      consent: Boolean(input.consent),
    },
  }
}

/* -------------------------------------------------------------------------- */
/* Rate limiting                                                               */
/* -------------------------------------------------------------------------- */

const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 5
const buckets = new Map<string, number[]>()

/**
 * Best-effort in-process rate limit.
 *
 * On a single server this stops casual flooding. On serverless each instance
 * keeps its own counter, so treat it as a speed bump rather than a guarantee —
 * a real deployment should also put a WAF or edge rate limit in front.
 */
export function rateLimit(key: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now()
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < WINDOW_MS)

  if (hits.length >= MAX_PER_WINDOW) {
    const retryAfterMs = WINDOW_MS - (now - hits[0])
    buckets.set(key, hits)
    return { allowed: false, retryAfterMs }
  }

  hits.push(now)
  buckets.set(key, hits)

  // Opportunistic cleanup so the map cannot grow without bound.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t >= WINDOW_MS)) buckets.delete(k)
    }
  }
  return { allowed: true, retryAfterMs: 0 }
}

/** Exposed for tests. */
export function __resetRateLimit() {
  buckets.clear()
}
