/**
 * Lead / enquiry domain types.
 *
 * The public site captures leads from many different CTAs (a finance
 * pre-approval, a service booking, a specific car enquiry). Previously all of
 * them were written as inquiry_type "Test Drive" with the real origin buried in
 * free text, which made the admin unable to tell them apart. Intent and source
 * are now first-class fields.
 */

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
  /** Whether the visitor ticked the contact-consent box. */
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
