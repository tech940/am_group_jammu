/**
 * The visitor's analytics choice, and the single answer to "may a tag run
 * here, now, for this browser?".
 *
 * Browser only. Every function is safe to call on the server (it answers "no")
 * and safe in a browser that blocks storage (the choice then lasts for the
 * page instead of for ever).
 *
 * Keys in localStorage:
 *   am_analytics   'granted' | 'denied'   what the visitor answered
 *   am_internal    '1'                    this browser belongs to staff
 */

import { ANALYTICS_MODE, CONSENT_DEFAULT, hostAllowed } from './config.ts'

const CHOICE_KEY = 'am_analytics'
const INTERNAL_KEY = 'am_internal'
/** Development only: show the notice on a dev server where no tag is configured. */
const PREVIEW_KEY = 'am_analytics_preview'

/** Fired on window whenever the choice or the staff mark changes. */
export const CHOICE_EVENT = 'am:analytics-choice'

export type AnalyticsChoice = 'granted' | 'denied'

// Fallback for browsers where localStorage throws (private modes, blocked
// site data): "No thanks" still holds for as long as the page is open.
const memory: Record<string, string | null> = {}

function read(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(key)
  } catch {
    return memory[key] ?? null
  }
}

function write(key: string, value: string | null): void {
  if (typeof window === 'undefined') return
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  } catch {
    // Storage is blocked: carry the value for this page instead.
    memory[key] = value
  }
  window.dispatchEvent(new Event(CHOICE_EVENT))
}

/** What the visitor answered, or null if they have not. */
export function readChoice(): AnalyticsChoice | null {
  const value = read(CHOICE_KEY)
  return value === 'granted' || value === 'denied' ? value : null
}

export function writeChoice(choice: AnalyticsChoice | null): void {
  write(CHOICE_KEY, choice)
}

/** The answer in force: the visitor's, or the site default if they gave none. */
export function effectiveChoice(): AnalyticsChoice {
  return readChoice() ?? CONSENT_DEFAULT
}

/** Staff browsers are never measured: their visits are not customers. */
export function isInternal(): boolean {
  return read(INTERNAL_KEY) === '1'
}

export function setInternal(internal: boolean): void {
  if (isInternal() === internal) return
  write(INTERNAL_KEY, internal ? '1' : null)
}

export function onAdminPath(): boolean {
  return typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')
}

/**
 * Tags are configured and this host is one they may run on.
 *
 * Exported for the privacy page's control, which must not say analytics are
 * "switched on" on a site, or a copy of the site, where no tag can load.
 */
export function configuredHere(): boolean {
  if (typeof window === 'undefined') return false
  return ANALYTICS_MODE !== 'off' && hostAllowed(window.location.hostname)
}

/**
 * 'live'    tags may load and events are sent
 * 'blocked' this browser or this page must not be measured: send nothing
 * 'idle'    no tag is configured for this host (development, a preview, or
 *           the ids are not set yet). Nothing loads and nothing is sent.
 */
export type AnalyticsState = 'live' | 'blocked' | 'idle'

export function analyticsState(): AnalyticsState {
  if (typeof window === 'undefined') return 'idle'
  if (onAdminPath() || isInternal()) return 'blocked'
  if (effectiveChoice() === 'denied') return 'blocked'
  return configuredHere() ? 'live' : 'idle'
}

export function analyticsLive(): boolean {
  return analyticsState() === 'live'
}

/** Whether the notice should be on screen: tags are in use and nobody has answered. */
export function shouldAskChoice(): boolean {
  if (typeof window === 'undefined') return false
  if (onAdminPath() || isInternal()) return false
  if (readChoice() !== null) return false
  if (configuredHere()) return true
  // Lets the notice be looked at on a dev server, where no tag ever loads.
  return process.env.NODE_ENV !== 'production' && read(PREVIEW_KEY) === '1'
}

/** For useSyncExternalStore: re-read when the choice changes, here or in another tab. */
export function subscribeChoice(onChange: () => void): () => void {
  window.addEventListener(CHOICE_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(CHOICE_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}
