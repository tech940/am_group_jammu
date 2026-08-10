/**
 * Lead persistence.
 *
 * SERVER ONLY.
 *
 * Two backends behind one interface:
 *   - Supabase, whenever NEXT_PUBLIC_SUPABASE_URL is configured. This is the
 *     production path.
 *   - A local JSON file, used only when Supabase is NOT configured. Its job is
 *     to make sure a real enquiry is never silently dropped while credentials
 *     are still being set up, and to make the whole flow testable end to end.
 *     It is not a production store: it will not work on read-only serverless
 *     filesystems, and the admin surfaces a warning whenever it is active.
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { getSupabaseAdmin, isSupabaseConfigured } from '../supabase.ts'
import type { Database } from '../../types/database.ts'
import type {
  CreateLeadInput,
  Lead,
  LeadActivity,
  LeadActivityType,
  LeadFilters,
  LeadIntent,
  LeadListResult,
  LeadSort,
  LeadStatus,
} from './types.ts'

const FALLBACK_FILE = path.join(process.cwd(), '.data', 'leads.json')

export const storageBackend: 'supabase' | 'file' = isSupabaseConfigured ? 'supabase' : 'file'

/* -------------------------------------------------------------------------- */
/* Row mapping                                                                 */
/* -------------------------------------------------------------------------- */

interface LeadRow {
  id: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  message: string | null
  intent: string | null
  inquiry_type: string | null
  status: string | null
  source_path: string | null
  source_label: string | null
  listing_id: number | null
  listing_title: string | null
  listing_price: number | null
  listing_url: string | null
  assigned_to: string | null
  next_follow_up_at: string | null
  consent: boolean | null
  created_at: string
  updated_at: string | null
}

/**
 * Normalise a timestamp to canonical ISO-8601 with a Z suffix.
 *
 * Postgres returns `2026-08-10T08:07:04.220693+00:00` (microseconds, numeric
 * offset) while the file backend stores `…Z` with milliseconds. Without this,
 * the two backends hand callers different strings for the same instant and any
 * equality check across them fails.
 */
function toIso(value: string | null): string | null {
  if (!value) return null
  const t = Date.parse(value)
  return Number.isNaN(t) ? value : new Date(t).toISOString()
}

function rowToLead(r: LeadRow): Lead {
  return {
    id: r.id,
    name: r.customer_name,
    phone: r.customer_phone,
    email: r.customer_email,
    message: r.message,
    intent: (r.intent ?? r.inquiry_type ?? 'General') as LeadIntent,
    status: (r.status ?? 'New') as LeadStatus,
    sourcePath: r.source_path,
    sourceLabel: r.source_label,
    vehicle: {
      listingId: r.listing_id,
      title: r.listing_title,
      price: r.listing_price,
      url: r.listing_url,
    },
    assignedTo: r.assigned_to,
    nextFollowUpAt: toIso(r.next_follow_up_at),
    consent: Boolean(r.consent),
    createdAt: toIso(r.created_at) ?? r.created_at,
    updatedAt: toIso(r.updated_at ?? r.created_at) ?? r.created_at,
  }
}

function leadToRow(lead: Lead): LeadRow {
  return {
    id: lead.id,
    customer_name: lead.name,
    customer_phone: lead.phone,
    customer_email: lead.email,
    message: lead.message,
    intent: lead.intent,
    inquiry_type: lead.intent,
    status: lead.status,
    source_path: lead.sourcePath,
    source_label: lead.sourceLabel,
    listing_id: lead.vehicle.listingId,
    listing_title: lead.vehicle.title,
    listing_price: lead.vehicle.price,
    listing_url: lead.vehicle.url,
    assigned_to: lead.assignedTo,
    next_follow_up_at: lead.nextFollowUpAt,
    consent: lead.consent,
    created_at: lead.createdAt,
    updated_at: lead.updatedAt,
  }
}

/* -------------------------------------------------------------------------- */
/* File backend                                                                */
/* -------------------------------------------------------------------------- */

interface FileShape {
  leads: LeadRow[]
  activities: LeadActivity[]
}

async function readFile(): Promise<FileShape> {
  try {
    const raw = await fs.readFile(FALLBACK_FILE, 'utf8')
    const parsed = JSON.parse(raw) as Partial<FileShape>
    return { leads: parsed.leads ?? [], activities: parsed.activities ?? [] }
  } catch {
    return { leads: [], activities: [] }
  }
}

async function writeFile(data: FileShape): Promise<void> {
  await fs.mkdir(path.dirname(FALLBACK_FILE), { recursive: true })
  await fs.writeFile(FALLBACK_FILE, JSON.stringify(data, null, 2), 'utf8')
}

/* -------------------------------------------------------------------------- */
/* Filtering / sorting (shared by both backends)                               */
/* -------------------------------------------------------------------------- */

function matches(lead: Lead, f: LeadFilters): boolean {
  if (f.status && f.status !== 'all' && lead.status !== f.status) return false
  if (f.intent && f.intent !== 'all' && lead.intent !== f.intent) return false
  if (f.assignedTo) {
    if (f.assignedTo === 'unassigned' ? lead.assignedTo !== null : lead.assignedTo !== f.assignedTo) {
      return false
    }
  }
  if (f.dueOnly) {
    if (!lead.nextFollowUpAt) return false
    if (new Date(lead.nextFollowUpAt).getTime() > Date.now()) return false
  }
  if (f.from && lead.createdAt < f.from) return false
  if (f.to && lead.createdAt > f.to) return false

  if (f.search) {
    const q = f.search.trim().toLowerCase()
    // Phone and email matter most here — the old admin searched neither.
    const hay = [
      lead.name,
      lead.phone,
      lead.email,
      lead.message,
      lead.vehicle.title,
      lead.sourcePath,
      lead.assignedTo,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    const digits = q.replace(/\D/g, '')
    if (!hay.includes(q) && !(digits.length >= 4 && lead.phone.replace(/\D/g, '').includes(digits))) {
      return false
    }
  }
  return true
}

function sortLeads(leads: Lead[], sort: LeadSort): Lead[] {
  const out = [...leads]
  switch (sort) {
    case 'oldest':
      return out.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    case 'name':
      return out.sort((a, b) => a.name.localeCompare(b.name))
    case 'follow-up':
      return out.sort((a, b) => {
        if (!a.nextFollowUpAt && !b.nextFollowUpAt) return b.createdAt.localeCompare(a.createdAt)
        if (!a.nextFollowUpAt) return 1
        if (!b.nextFollowUpAt) return -1
        return a.nextFollowUpAt.localeCompare(b.nextFollowUpAt)
      })
    case 'newest':
    default:
      return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                  */
/* -------------------------------------------------------------------------- */

export async function insertLead(input: Required<Pick<Lead, 'name' | 'phone'>> & Partial<Lead> & { intent: LeadIntent }): Promise<Lead> {
  const now = new Date().toISOString()
  const lead: Lead = {
    id: randomUUID(),
    name: input.name,
    phone: input.phone,
    email: input.email ?? null,
    message: input.message ?? null,
    intent: input.intent,
    status: 'New',
    sourcePath: input.sourcePath ?? null,
    sourceLabel: input.sourceLabel ?? null,
    vehicle: input.vehicle ?? { listingId: null, title: null, price: null, url: null },
    assignedTo: null,
    nextFollowUpAt: null,
    consent: input.consent ?? false,
    createdAt: now,
    updatedAt: now,
  }

  if (storageBackend === 'supabase') {
    const db = getSupabaseAdmin()
    if (!db) throw new Error('Supabase is not configured')
    // Built explicitly rather than derived from LeadRow: id/created_at/updated_at
    // are database defaults, and the Insert type wants `status?: string` where
    // the row type allows null.
    const { data, error } = await db
      .from('leads')
      .insert([
        {
          customer_name: lead.name,
          customer_phone: lead.phone,
          customer_email: lead.email,
          message: lead.message,
          intent: lead.intent,
          inquiry_type: lead.intent,
          status: lead.status,
          source_path: lead.sourcePath,
          source_label: lead.sourceLabel,
          listing_id: lead.vehicle.listingId,
          listing_title: lead.vehicle.title,
          listing_price: lead.vehicle.price,
          listing_url: lead.vehicle.url,
          consent: lead.consent,
        },
      ])
      .select()
      .single()
    if (error) throw new Error(error.message)
    const created = rowToLead(data as unknown as LeadRow)
    await addActivity(created.id, 'created', `Lead captured from ${created.sourcePath ?? 'the website'}`, null)
    return created
  }

  const file = await readFile()
  file.leads.unshift(leadToRow(lead))
  file.activities.unshift({
    id: randomUUID(),
    leadId: lead.id,
    type: 'created',
    body: `Lead captured from ${lead.sourcePath ?? 'the website'}`,
    fromStatus: null,
    toStatus: null,
    author: null,
    createdAt: now,
  })
  await writeFile(file)
  return lead
}

/** Same phone + same intent within the window counts as a repeat submission. */
export async function findRecentDuplicate(
  phone: string,
  intent: LeadIntent,
  windowMinutes = 10,
): Promise<Lead | null> {
  const since = new Date(Date.now() - windowMinutes * 60_000).toISOString()
  const digits = phone.replace(/\D/g, '')

  if (storageBackend === 'supabase') {
    const db = getSupabaseAdmin()
    if (!db) return null
    const { data } = await db
      .from('leads')
      .select('*')
      .eq('customer_phone', phone)
      .gte('created_at', since)
      .limit(5)
    const rows = (data ?? []) as unknown as LeadRow[]
    const hit = rows.map(rowToLead).find((l) => l.intent === intent)
    return hit ?? null
  }

  const file = await readFile()
  const hit = file.leads
    .map(rowToLead)
    .find(
      (l) =>
        l.createdAt >= since &&
        l.intent === intent &&
        l.phone.replace(/\D/g, '') === digits,
    )
  return hit ?? null
}

export async function listLeads(
  filters: LeadFilters = {},
  sort: LeadSort = 'newest',
  page = 1,
  pageSize = 25,
): Promise<LeadListResult> {
  let all: Lead[]

  if (storageBackend === 'supabase') {
    const db = getSupabaseAdmin()
    if (!db) return { leads: [], total: 0, page, pageSize }
    // Server-side narrowing where it is cheap; the rest is applied below so the
    // two backends behave identically.
    let q = db.from('leads').select('*')
    if (filters.status && filters.status !== 'all') q = q.eq('status', filters.status)
    if (filters.intent && filters.intent !== 'all') q = q.eq('intent', filters.intent)
    const { data, error } = await q.order('created_at', { ascending: false }).limit(2000)
    if (error) throw new Error(error.message)
    all = ((data ?? []) as unknown as LeadRow[]).map(rowToLead)
  } else {
    const file = await readFile()
    all = file.leads.map(rowToLead)
  }

  const filtered = sortLeads(all.filter((l) => matches(l, filters)), sort)
  const start = (page - 1) * pageSize
  return {
    leads: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
  }
}

export async function getLead(id: string): Promise<Lead | null> {
  if (storageBackend === 'supabase') {
    const db = getSupabaseAdmin()
    if (!db) return null
    const { data, error } = await db.from('leads').select('*').eq('id', id).maybeSingle()
    if (error || !data) return null
    return rowToLead(data as unknown as LeadRow)
  }
  const file = await readFile()
  const row = file.leads.find((r) => r.id === id)
  return row ? rowToLead(row) : null
}

export async function updateLead(id: string, patch: Partial<Lead>): Promise<Lead | null> {
  if (storageBackend === 'supabase') {
    const db = getSupabaseAdmin()
    if (!db) return null
    const update: Database['public']['Tables']['leads']['Update'] = {}
    if (patch.status !== undefined) update.status = patch.status
    if (patch.assignedTo !== undefined) update.assigned_to = patch.assignedTo
    if (patch.nextFollowUpAt !== undefined) update.next_follow_up_at = patch.nextFollowUpAt
    const { data, error } = await db.from('leads').update(update).eq('id', id).select().single()
    if (error) throw new Error(error.message)
    return rowToLead(data as unknown as LeadRow)
  }

  const file = await readFile()
  const idx = file.leads.findIndex((r) => r.id === id)
  if (idx === -1) return null
  const merged: Lead = {
    ...rowToLead(file.leads[idx]),
    ...patch,
    updatedAt: new Date().toISOString(),
  }
  file.leads[idx] = leadToRow(merged)
  await writeFile(file)
  return merged
}

export async function addActivity(
  leadId: string,
  type: LeadActivityType,
  body: string | null,
  author: string | null,
  statuses?: { from: LeadStatus | null; to: LeadStatus | null },
): Promise<LeadActivity> {
  const activity: LeadActivity = {
    id: randomUUID(),
    leadId,
    type,
    body,
    fromStatus: statuses?.from ?? null,
    toStatus: statuses?.to ?? null,
    author,
    createdAt: new Date().toISOString(),
  }

  if (storageBackend === 'supabase') {
    const db = getSupabaseAdmin()
    if (!db) return activity
    const { data, error } = await db
      .from('lead_activities')
      .insert([
        {
          lead_id: leadId,
          type,
          body,
          from_status: activity.fromStatus,
          to_status: activity.toStatus,
          author,
        },
      ])
      .select()
      .single()
    if (error || !data) return activity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = data as any
    return {
      id: d.id,
      leadId: d.lead_id,
      type: d.type,
      body: d.body,
      fromStatus: d.from_status,
      toStatus: d.to_status,
      author: d.author,
      createdAt: toIso(d.created_at) ?? d.created_at,
    }
  }

  const file = await readFile()
  file.activities.unshift(activity)
  await writeFile(file)
  return activity
}

export async function listActivities(leadId: string): Promise<LeadActivity[]> {
  if (storageBackend === 'supabase') {
    const db = getSupabaseAdmin()
    if (!db) return []
    const { data } = await db
      .from('lead_activities')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((data ?? []) as any[]).map((d) => ({
      id: d.id,
      leadId: d.lead_id,
      type: d.type,
      body: d.body,
      fromStatus: d.from_status,
      toStatus: d.to_status,
      author: d.author,
      createdAt: toIso(d.created_at) ?? d.created_at,
    }))
  }
  const file = await readFile()
  return file.activities
    .filter((a) => a.leadId === leadId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** All leads, unpaginated — for stats and CSV export. */
export async function allLeads(): Promise<Lead[]> {
  const { leads } = await listLeads({}, 'newest', 1, 100000)
  return leads
}
