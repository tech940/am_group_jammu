/**
 * What this browser remembers about the enquiry form, for the timed pop-up
 * (components/modals/auto-enquiry.tsx).
 *
 * Two facts:
 *   shown  the form has been on screen in this visit (it opened by itself, or
 *          the visitor pressed any Enquire button)  -> do not pop it up again
 *   sent   an enquiry was sent from any form on the site in the last 30 days
 *          -> do not pop it up at all
 *
 * Both are kept in web storage AND in a module variable. Storage can be
 * blocked (private windows, some in-app browsers); without the in-memory copy
 * nothing would be remembered there and the form would reopen on every page.
 *
 * Browser only. Every function is safe to call on the server (it does nothing).
 */

const SHOWN_KEY = 'am_auto_enquiry_shown'
const SENT_KEY = 'am_enquiry_sent_at'
const SENT_QUIET_DAYS = 30

let shownInMemory = false
let sentInMemory = false

function read(storage: 'session' | 'local', key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return (storage === 'session' ? window.sessionStorage : window.localStorage).getItem(key)
  } catch {
    return null
  }
}

function write(storage: 'session' | 'local', key: string, value: string): void {
  if (typeof window === 'undefined') return
  try {
    ;(storage === 'session' ? window.sessionStorage : window.localStorage).setItem(key, value)
  } catch {
    // Kept in memory instead; see the note above.
  }
}

/** The form has been on screen in this visit. */
export function markEnquiryShown(): void {
  shownInMemory = true
  write('session', SHOWN_KEY, '1')
}

export function enquiryWasShown(): boolean {
  return shownInMemory || read('session', SHOWN_KEY) !== null
}

/** Call from every form on the site when a lead has been sent. */
export function rememberEnquirySent(): void {
  sentInMemory = true
  write('local', SENT_KEY, String(Date.now()))
}

export function recentlyEnquired(): boolean {
  if (sentInMemory) return true
  const at = Number(read('local', SENT_KEY))
  return Number.isFinite(at) && at > 0 && Date.now() - at < SENT_QUIET_DAYS * 86_400_000
}
