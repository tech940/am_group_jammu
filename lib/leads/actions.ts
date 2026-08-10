"use server"

import { headers } from 'next/headers'
import { requireAdmin } from '../admin/auth.ts'
import {
  addActivity,
  allLeads,
  findRecentDuplicate,
  getLead,
  insertLead,
  listActivities,
  listLeads,
  storageBackend,
  updateLead,
} from './store.ts'
import { rateLimit, validateLead } from './validation.ts'
import type {
  CreateLeadInput,
  Lead,
  LeadActivity,
  LeadFilters,
  LeadListResult,
  LeadSort,
  LeadStats,
  LeadStatus,
  Result,
} from './types.ts'
import { LEAD_STATUSES } from './types.ts'

/* -------------------------------------------------------------------------- */
/* Public capture                                                              */
/* -------------------------------------------------------------------------- */

async function clientKey(): Promise<string> {
  const h = await headers()
  const fwd = h.get('x-forwarded-for')
  return (fwd?.split(',')[0].trim() || h.get('x-real-ip') || 'unknown').slice(0, 64)
}

/**
 * Capture a lead from any public form.
 *
 * Returns a Result rather than throwing, so a caller can always give the
 * visitor accurate feedback instead of a silent failure.
 */
export async function submitLead(input: CreateLeadInput): Promise<Result<{ id: string; duplicate: boolean }>> {
  const validation = validateLead(input)

  if (!validation.ok || !validation.clean) {
    // The honeypot path deliberately reports success so a bot cannot tell it
    // was caught, while nothing is written.
    if (validation.errors._bot) return { ok: true, data: { id: 'ignored', duplicate: false } }
    const first = Object.values(validation.errors)[0] ?? 'Please check the form and try again.'
    return { ok: false, error: first, code: 'validation' }
  }

  const limit = rateLimit(await clientKey())
  if (!limit.allowed) {
    return {
      ok: false,
      error: `Too many submissions. Please try again in ${Math.ceil(limit.retryAfterMs / 1000)}s.`,
      code: 'rate_limited',
    }
  }

  const clean = validation.clean

  try {
    // Double-click and refresh protection: the same person asking about the
    // same thing twice in ten minutes is one lead, not two.
    const duplicate = await findRecentDuplicate(clean.phone, clean.intent)
    if (duplicate) {
      await addActivity(
        duplicate.id,
        'note',
        `Repeat submission from the same number${clean.sourcePath ? ` on ${clean.sourcePath}` : ''}.`,
        null,
      )
      return { ok: true, data: { id: duplicate.id, duplicate: true } }
    }

    const vehicle = input.vehicle
      ? {
          listingId: input.vehicle.listingId ?? null,
          title: input.vehicle.title ?? null,
          price: input.vehicle.price ?? null,
          url: input.vehicle.url ?? null,
        }
      : { listingId: null, title: null, price: null, url: null }

    const lead = await insertLead({ ...clean, vehicle })

    // Deliberately NOT calling revalidatePath('/admin') here. The admin routes
    // are dynamic, so there is no cache to bust — and revalidating them from a
    // public visitor's action makes the client follow the proxy's redirect to
    // /admin/login mid-stream, which aborts the action response and leaves the
    // form stuck on "Processing…" even though the lead was saved.
    return { ok: true, data: { id: lead.id, duplicate: false } }
  } catch (err) {
    console.error('[leads] submit failed', err)
    return {
      ok: false,
      error: 'We could not save your enquiry. Please call us on +91 94191 00000.',
      code: 'storage',
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Admin reads                                                                 */
/* -------------------------------------------------------------------------- */

export async function adminListLeads(
  filters: LeadFilters,
  sort: LeadSort,
  page: number,
  pageSize: number,
): Promise<LeadListResult> {
  await requireAdmin()
  return listLeads(filters, sort, page, pageSize)
}

export async function adminGetLead(
  id: string,
): Promise<{ lead: Lead | null; activities: LeadActivity[]; overdue: boolean }> {
  await requireAdmin()
  const lead = await getLead(id)
  if (!lead) return { lead: null, activities: [], overdue: false }
  const overdue =
    lead.nextFollowUpAt !== null && new Date(lead.nextFollowUpAt).getTime() < Date.now()
  return { lead, activities: await listActivities(id), overdue }
}

export async function adminGetStats(): Promise<LeadStats> {
  await requireAdmin()
  const leads = await allLeads()
  const now = Date.now()
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const endOfToday = new Date(startOfToday)
  endOfToday.setDate(endOfToday.getDate() + 1)

  const byStatus = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0])) as Record<LeadStatus, number>
  let newToday = 0
  let dueToday = 0
  let overdue = 0
  let unassigned = 0

  for (const l of leads) {
    byStatus[l.status] = (byStatus[l.status] ?? 0) + 1
    if (new Date(l.createdAt) >= startOfToday) newToday++
    if (!l.assignedTo) unassigned++
    if (l.nextFollowUpAt) {
      const due = new Date(l.nextFollowUpAt).getTime()
      if (due < now) overdue++
      else if (due < endOfToday.getTime()) dueToday++
    }
  }

  return { total: leads.length, byStatus, newToday, dueToday, overdue, unassigned }
}

export async function adminGetStorageInfo(): Promise<{ backend: string; warning: string | null }> {
  await requireAdmin()
  return {
    backend: storageBackend,
    warning:
      storageBackend === 'file'
        ? 'Supabase is not configured, so leads are being written to a local file (.data/leads.json). Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, then run lib/leads/migration.sql, to store them in the database.'
        : null,
  }
}

/* -------------------------------------------------------------------------- */
/* Admin writes                                                                */
/* -------------------------------------------------------------------------- */

export async function adminUpdateStatus(id: string, status: LeadStatus, author?: string): Promise<Result<Lead>> {
  await requireAdmin()
  if (!LEAD_STATUSES.includes(status)) return { ok: false, error: 'Unknown status.' }

  try {
    const before = await getLead(id)
    if (!before) return { ok: false, error: 'Lead not found.' }
    if (before.status === status) return { ok: true, data: before }

    const updated = await updateLead(id, { status })
    if (!updated) return { ok: false, error: 'Lead not found.' }

    await addActivity(id, 'status_change', null, author ?? null, { from: before.status, to: status })
    return { ok: true, data: updated }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Update failed.' }
  }
}

export async function adminAddNote(id: string, body: string, author?: string): Promise<Result<LeadActivity>> {
  await requireAdmin()
  const text = body.trim()
  if (!text) return { ok: false, error: 'Note cannot be empty.' }
  if (text.length > 2000) return { ok: false, error: 'Note is too long.' }

  try {
    const activity = await addActivity(id, 'note', text, author ?? null)
    return { ok: true, data: activity }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Could not save note.' }
  }
}

export async function adminLogContact(
  id: string,
  type: 'call' | 'whatsapp' | 'email',
  body: string,
  author?: string,
): Promise<Result<LeadActivity>> {
  await requireAdmin()
  try {
    const activity = await addActivity(id, type, body.trim() || null, author ?? null)
    // Logging an outbound contact implies the lead has been contacted.
    const lead = await getLead(id)
    if (lead && lead.status === 'New') {
      await updateLead(id, { status: 'Contacted' })
      await addActivity(id, 'status_change', null, author ?? null, { from: 'New', to: 'Contacted' })
    }
    return { ok: true, data: activity }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Could not log contact.' }
  }
}

export async function adminScheduleFollowUp(
  id: string,
  when: string | null,
  author?: string,
): Promise<Result<Lead>> {
  await requireAdmin()
  if (when && Number.isNaN(Date.parse(when))) return { ok: false, error: 'Invalid date.' }

  try {
    const updated = await updateLead(id, { nextFollowUpAt: when })
    if (!updated) return { ok: false, error: 'Lead not found.' }

    await addActivity(
      id,
      'follow_up_scheduled',
      when ? `Follow-up set for ${new Date(when).toLocaleString('en-IN')}` : 'Follow-up cleared',
      author ?? null,
    )
    // Scheduling a call-back is what "Follow-up" means.
    if (when && (updated.status === 'New' || updated.status === 'Contacted')) {
      await updateLead(id, { status: 'Follow-up' })
      await addActivity(id, 'status_change', null, author ?? null, { from: updated.status, to: 'Follow-up' })
    }
    return { ok: true, data: updated }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Could not schedule follow-up.' }
  }
}

export async function adminAssign(id: string, assignee: string | null, author?: string): Promise<Result<Lead>> {
  await requireAdmin()
  try {
    const value = assignee?.trim() || null
    const updated = await updateLead(id, { assignedTo: value })
    if (!updated) return { ok: false, error: 'Lead not found.' }
    await addActivity(id, 'assigned', value ? `Assigned to ${value}` : 'Unassigned', author ?? null)
    return { ok: true, data: updated }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Could not assign.' }
  }
}

export async function adminBulkStatus(ids: string[], status: LeadStatus, author?: string): Promise<Result<number>> {
  await requireAdmin()
  let changed = 0
  for (const id of ids) {
    const res = await adminUpdateStatus(id, status, author)
    if (res.ok) changed++
  }
  return { ok: true, data: changed }
}

/** CSV of the current filter selection. */
export async function adminExportCsv(filters: LeadFilters, sort: LeadSort): Promise<Result<string>> {
  await requireAdmin()
  try {
    const { leads } = await listLeads(filters, sort, 1, 100000)
    const headerRow = [
      'ID', 'Created', 'Name', 'Phone', 'Email', 'Intent', 'Status',
      'Vehicle', 'Listing Price', 'Source Page', 'Assigned To', 'Next Follow-up', 'Message',
    ]
    const escape = (v: unknown) => {
      const s = v === null || v === undefined ? '' : String(v)
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const rows = leads.map((l) => [
      l.id, l.createdAt, l.name, l.phone, l.email ?? '', l.intent, l.status,
      l.vehicle.title ?? '', l.vehicle.price ?? '', l.sourcePath ?? '',
      l.assignedTo ?? '', l.nextFollowUpAt ?? '', l.message ?? '',
    ])
    return { ok: true, data: [headerRow, ...rows].map((r) => r.map(escape).join(',')).join('\n') }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Export failed.' }
  }
}
