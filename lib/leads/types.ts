/**
 * Lead / enquiry domain types.
 *
 * The public site captures leads from many different CTAs (a finance
 * pre-approval, a service booking, a specific car enquiry). Previously all of
 * them were written as inquiry_type "Test Drive" with the real origin buried in
 * free text, which made the admin unable to tell them apart. Intent and source
 * are now first-class fields.
 */

import type { LeadAttribution } from './attribution.ts'

export const LEAD_STATUSES = [
  'New',
  'Contacted',
  'Follow-up',
  'Qualified',
  'Won',
  'Lost',
] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]

/** Statuses that still need action from the sales desk. */
export const OPEN_STATUSES: LeadStatus[] = ['New', 'Contacted', 'Follow-up', 'Qualified']

export const LEAD_INTENTS = [
  'Vehicle Enquiry',
  'Test Drive',
  'Finance',
  'Service',
  'Insurance',
  'Sell Your Car',
  'General',
] as const
export type LeadIntent = (typeof LEAD_INTENTS)[number]

/**
 * What the visitor agreed to, word for word.
 *
 * The lead row has ONE consent column, and the site has two forms that mean
 * different things by it. Both wordings live here so the text on screen and
 * the text written into the lead's history are the same string:
 *
 *  - 'enquiry'   the enquiry modal. The sentence is shown at the submit
 *                button, and pressing the button is the agreement. It covers
 *                being called or messaged about THIS enquiry and nothing else.
 *  - 'marketing' the contact page's optional tick box, which also covers
 *                offers and service updates. Unticked means not given.
 */
export const CONSENT_TEXT = {
  enquiry:
    'By sending this, you agree that AM Group may call or message you about this enquiry.',
  marketing:
    'I agree to be contacted by AM Group via Call, SMS, WhatsApp, RCS, and Email regarding my inquiry, offers, and service updates. I understand that I can opt out at any time.',
} as const
export type ConsentScope = keyof typeof CONSENT_TEXT

/**
 * The sentences written into a lead's history, one per thing a visitor can
 * have agreed to. Kept as named constants because the admin lead page reads
 * them back (consentSummary below) to say which one applies.
 */
const CONSENT_RECORD = {
  enquiry:
    'agreed to be called or messaged about this enquiry only (notice shown at the send button; no marketing consent was asked for)',
  marketing:
    'ticked the box agreeing to calls, SMS, WhatsApp, RCS and email about the enquiry, offers and service updates',
  marketingDeclined:
    'left the marketing box unticked, so reply to this enquiry only: no offers or updates',
} as const

/** Starts the history note for a second submission folded into an existing lead. */
export const REPEAT_NOTE_PREFIX = 'Repeat submission'

/** One sentence for the lead's history and the lead email. */
export function consentRecord(consent: boolean, scope: ConsentScope | null): string {
  if (scope === 'enquiry') return consent ? CONSENT_RECORD.enquiry : 'not recorded'
  if (scope === 'marketing') {
    return consent ? CONSENT_RECORD.marketing : CONSENT_RECORD.marketingDeclined
  }
  return consent ? 'given (the form did not say which wording)' : 'not recorded'
}

/**
 * A few words for the "Consent" row of the admin lead page.
 *
 * The row's single yes/no cannot tell "may be called about this enquiry" from
 * "ticked the box for offers and updates", and printing "Given" for both
 * invites staff to send offers to someone who never agreed to them. The exact
 * wording is in the note written with the lead, so it is read back from there.
 *
 * `noteBodies` is the text of the lead's history entries, in any order. Notes
 * for a repeat submission are skipped: they describe a later form, and are
 * shown in full in the history itself.
 */
export function consentSummary(consent: boolean, noteBodies: (string | null)[]): string {
  const original = noteBodies.find(
    (body) => body && body.includes('Consent: ') && !body.startsWith(REPEAT_NOTE_PREFIX),
  )
  if (original) {
    if (original.includes(CONSENT_RECORD.enquiry)) return 'This enquiry only; no offers'
    if (original.includes(CONSENT_RECORD.marketingDeclined)) {
      return 'This enquiry only; offers box left unticked'
    }
    if (original.includes(CONSENT_RECORD.marketing)) return 'Enquiry, offers and updates'
  }
  // A lead from before the wording was recorded, or one whose note failed to
  // save: say what is known and no more.
  return consent ? 'Given; wording not recorded' : 'Not recorded'
}

export interface LeadVehicleRef {
  /** WordPress listing ID — numeric, not the Supabase vehicles UUID. */
  listingId: number | null
  title: string | null
  price: number | null
  url: string | null
}

export interface Lead {
  id: string
  name: string
  phone: string
  email: string | null
  message: string | null

  intent: LeadIntent
  status: LeadStatus
  /** Page path the enquiry came from, e.g. "/inventory/hyundai-alcazar-2022-5099". */
  sourcePath: string | null
  /** Which control opened the form, e.g. "finance-cta", "vehicle-card". */
  sourceLabel: string | null

  vehicle: LeadVehicleRef

  assignedTo: string | null
  nextFollowUpAt: string | null
  /**
   * True when the visitor agreed to be contacted. WHAT they agreed to depends
   * on the form (see CONSENT_TEXT): the modal's notice covers this enquiry
   * only, the contact page's tick box also covers offers. The exact wording is
   * written into the lead's first history note, because this column cannot
   * hold it.
   */
  consent: boolean

  createdAt: string
  updatedAt: string
}

export const ACTIVITY_TYPES = [
  'created',
  'note',
  'status_change',
  'call',
  'whatsapp',
  'email',
  'follow_up_scheduled',
  'assigned',
] as const
export type LeadActivityType = (typeof ACTIVITY_TYPES)[number]

export interface LeadActivity {
  id: string
  leadId: string
  type: LeadActivityType
  body: string | null
  fromStatus: LeadStatus | null
  toStatus: LeadStatus | null
  author: string | null
  createdAt: string
}

/** What the public site submits. Server-side fields are never accepted here. */
export interface CreateLeadInput {
  name: string
  phone: string
  email?: string | null
  message?: string | null
  intent?: LeadIntent
  sourcePath?: string | null
  sourceLabel?: string | null
  vehicle?: Partial<LeadVehicleRef> | null
  consent?: boolean
  /** Which wording `consent` answers. See CONSENT_TEXT. */
  consentScope?: ConsentScope
  /** How the visitor found the site, from lib/analytics/attribution.ts. */
  attribution?: LeadAttribution | null
  /** Hidden field; a real user never fills this in. */
  companyWebsite?: string
}

export interface LeadFilters {
  status?: LeadStatus | 'all'
  intent?: LeadIntent | 'all'
  assignedTo?: string
  /** Free text across name, phone, email and message. */
  search?: string
  /** Only leads whose follow-up is due on or before now. */
  dueOnly?: boolean
  from?: string
  to?: string
}

export type LeadSort =
  | 'newest'
  | 'oldest'
  | 'follow-up'
  | 'name'

export interface LeadListResult {
  leads: Lead[]
  total: number
  page: number
  pageSize: number
}

export interface LeadStats {
  total: number
  byStatus: Record<LeadStatus, number>
  newToday: number
  dueToday: number
  overdue: number
  unassigned: number
}

/** Result wrapper so callers never have to catch. */
export type Result<T> = { ok: true; data: T } | { ok: false; error: string; code?: string }
