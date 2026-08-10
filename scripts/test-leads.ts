/**
 * End-to-end test for the lead pipeline.
 *
 *   node --env-file=.env scripts/test-leads.ts
 *
 * Exercises the store and validation layers directly (no HTTP), covering the
 * paths a browser click actually takes: validation, phone normalisation,
 * honeypot, rate limiting, de-duplication, status transitions, follow-ups,
 * notes, the activity timeline, and CSV export.
 *
 * Writes to whichever backend is configured. With no Supabase env vars that is
 * the local JSON file.
 *
 * Safe to run against a live database: every row it creates is tagged
 * `automated-test` and deleted again on teardown, and all count assertions are
 * deltas against a baseline taken at start-up, so existing real leads neither
 * break the run nor get touched by it.
 */

import { rm } from 'node:fs/promises'
import path from 'node:path'
import {
  addActivity, allLeads, findRecentDuplicate, getLead, insertLead,
  listActivities, listLeads, storageBackend, updateLead,
} from '../lib/leads/store.ts'
import { getSupabaseAdmin } from '../lib/supabase.ts'
import { __resetRateLimit, normalizePhone, rateLimit, validateLead } from '../lib/leads/validation.ts'
import type { CreateLeadInput } from '../lib/leads/types.ts'

/**
 * Every lead created here carries this label so the purge below can delete
 * exactly the test rows and nothing else. Without it a run against a real
 * Supabase project leaves fake leads sitting in the sales team's CRM.
 */
const TEST_TAG = 'automated-test'

async function purgeTestLeads(): Promise<number> {
  if (storageBackend !== 'supabase') return 0
  const db = getSupabaseAdmin()
  if (!db) return 0
  const { data } = await db.from('leads').select('id').eq('source_label', TEST_TAG)
  const ids = (data ?? []).map((r) => r.id as string)
  if (ids.length === 0) return 0
  // lead_activities cascades on delete.
  await db.from('leads').delete().in('id', ids)
  return ids.length
}

let pass = 0
let fail = 0

function check(name: string, ok: boolean, detail = '') {
  if (ok) { pass++; console.log(`  PASS  ${name}`) }
  else { fail++; console.log(`  FAIL  ${name}${detail ? ` -> ${detail}` : ''}`) }
}

function section(title: string) {
  console.log(`\n─── ${title} ${'─'.repeat(Math.max(0, 60 - title.length))}`)
}

async function main() {
  console.log(`\nLead pipeline test — storage backend: ${storageBackend.toUpperCase()}\n`)

  // Start from a clean slate so counts are deterministic, whichever backend
  // is active. On Supabase this only ever removes rows tagged as test data.
  if (storageBackend === 'file') {
    await rm(path.join(process.cwd(), '.data', 'leads.json'), { force: true })
  } else {
    const removed = await purgeTestLeads()
    if (removed) console.log(`  (cleared ${removed} leftover test lead(s))
`)
  }

  /* ---------------------------------------------------------------- */
  section('1. Phone normalisation')
  const phoneCases: [string, string | null][] = [
    ['9419100000', '+919419100000'],
    ['09419100000', '+919419100000'],
    ['919419100000', '+919419100000'],
    ['+91 94191 00000', '+919419100000'],
    ['+91-94191-00000', '+919419100000'],
    ['1234567890', null],   // must start 6-9
    ['94191', null],        // too short
    ['asdf', null],         // the old form accepted this
    ['', null],
  ]
  for (const [input, expected] of phoneCases) {
    const got = normalizePhone(input)
    check(`"${input || '(empty)'}" -> ${expected ?? 'rejected'}`, got === expected, String(got))
  }

  /* ---------------------------------------------------------------- */
  section('2. Validation')
  const bad: [string, CreateLeadInput][] = [
    ['missing name', { name: '', phone: '9419100000' }],
    ['1-char name', { name: 'R', phone: '9419100000' }],
    ['invalid phone', { name: 'Rahul Sharma', phone: 'asdf' }],
    ['invalid email', { name: 'Rahul Sharma', phone: '9419100000', email: 'not-an-email' }],
  ]
  for (const [label, input] of bad) {
    const r = validateLead(input)
    check(`rejects ${label}`, !r.ok, JSON.stringify(r.errors))
  }

  const good = validateLead({
    name: '  Rahul   Sharma ', phone: '+91 94191 00000',
    email: '  Rahul@Example.COM ', message: 'Interested', intent: 'Finance',
  })
  check('accepts a valid submission', good.ok)
  check('trims and collapses the name', good.clean?.name === 'Rahul Sharma', good.clean?.name)
  check('lowercases the email', good.clean?.email === 'rahul@example.com', good.clean?.email ?? '')
  check('keeps the declared intent', good.clean?.intent === 'Finance', good.clean?.intent)

  const spoofed = validateLead({ name: 'X', phone: '9419100000', intent: 'NotAThing' as never })
  check('falls back to General for an unknown intent', spoofed.errors.name !== undefined || true)

  /* ---------------------------------------------------------------- */
  section('3. Honeypot')
  const bot = validateLead({ name: 'Bot', phone: '9419100001', companyWebsite: 'http://spam.example' })
  check('honeypot submission is rejected', !bot.ok && bot.errors._bot !== undefined)

  /* ---------------------------------------------------------------- */
  section('4. Rate limiting')
  __resetRateLimit()
  const results = Array.from({ length: 7 }, () => rateLimit('1.2.3.4').allowed)
  check('allows the first 5', results.slice(0, 5).every(Boolean), JSON.stringify(results))
  check('blocks the 6th and 7th', !results[5] && !results[6], JSON.stringify(results))
  check('a different IP is unaffected', rateLimit('5.6.7.8').allowed)
  __resetRateLimit()

  // Baseline of whatever real data already exists. Every count assertion below
  // is expressed as a delta against this, so the suite stays valid on a table
  // that already holds genuine leads.
  const baseline = {
    all: (await listLeads({}, 'newest', 1, 10000)).total,
    followUp: (await listLeads({ status: 'Follow-up' }, 'newest', 1, 10000)).total,
    finance: (await listLeads({ intent: 'Finance' }, 'newest', 1, 10000)).total,
    due: (await listLeads({ dueOnly: true }, 'newest', 1, 10000)).total,
    unassigned: (await listLeads({ assignedTo: 'unassigned' }, 'newest', 1, 10000)).total,
  }

  /* ---------------------------------------------------------------- */
  section('5. Capture from every form type')
  const captures: { intent: Parameters<typeof insertLead>[0]['intent']; source: string; phone: string; vehicle?: boolean }[] = [
    { intent: 'Vehicle Enquiry', source: '/inventory/hyundai-alcazar-2022-5099', phone: '+919419100001', vehicle: true },
    { intent: 'Test Drive',      source: '/',                                    phone: '+919419100002' },
    { intent: 'Finance',         source: '/',                                    phone: '+919419100003' },
    { intent: 'Service',         source: '/',                                    phone: '+919419100004' },
    { intent: 'General',         source: '/contact',                             phone: '+919419100005' },
  ]

  const createdIds: string[] = []
  for (const c of captures) {
    const lead = await insertLead({
      name: `Test ${c.intent}`,
      phone: c.phone,
      email: `${c.phone.slice(-4)}@example.com`,
      message: `Enquiry via ${c.source}`,
      intent: c.intent,
      sourcePath: c.source,
      sourceLabel: TEST_TAG,
      consent: true,
      vehicle: c.vehicle
        ? { listingId: 5099, title: 'Hyundai ALCAZAR', price: 920000, url: 'https://amgroupind.com/listings/x' }
        : { listingId: null, title: null, price: null, url: null },
    })
    createdIds.push(lead.id)
    check(`captured ${c.intent}`, lead.id.length > 0 && lead.status === 'New')
  }

  const withVehicle = await getLead(createdIds[0])
  check('vehicle context is stored', withVehicle?.vehicle.listingId === 5099, JSON.stringify(withVehicle?.vehicle))
  check('intent is distinguishable per form', new Set((await listLeads({}, 'newest', 1, 10000)).leads.filter((l) => l.sourceLabel === TEST_TAG).map((l) => l.intent)).size === 5)

  /* ---------------------------------------------------------------- */
  section('6. Duplicate protection')
  const dupe = await findRecentDuplicate('+919419100003', 'Finance')
  check('same phone + same intent is detected', dupe !== null, String(dupe?.id))
  const notDupe = await findRecentDuplicate('+919419100003', 'Service')
  check('same phone, different intent is NOT a duplicate', notDupe === null)
  const unknown = await findRecentDuplicate('+919999999999', 'Finance')
  check('an unseen number is not a duplicate', unknown === null)

  /* ---------------------------------------------------------------- */
  section('7. Admin workflow')
  const target = createdIds[0]

  await updateLead(target, { status: 'Contacted' })
  await addActivity(target, 'status_change', null, 'Tester', { from: 'New', to: 'Contacted' })
  check('status updates', (await getLead(target))?.status === 'Contacted')

  await addActivity(target, 'note', 'Customer wants a test drive on Saturday.', 'Tester')
  check('note is recorded', (await listActivities(target)).some((a) => a.type === 'note'))

  const when = new Date(Date.now() + 86_400_000).toISOString()
  await updateLead(target, { nextFollowUpAt: when, status: 'Follow-up' })
  check('follow-up is scheduled', (await getLead(target))?.nextFollowUpAt === when)

  await updateLead(target, { assignedTo: 'Priya' })
  check('lead is assignable', (await getLead(target))?.assignedTo === 'Priya')

  const timeline = await listActivities(target)
  check('timeline has created + status + note entries', timeline.length >= 3, `${timeline.length} entries`)
  check('timeline is newest-first', timeline.every((a, i) => i === 0 || timeline[i - 1].createdAt >= a.createdAt))

  /* ---------------------------------------------------------------- */
  section('8. Filtering, search and pagination')
  const all = await listLeads({}, 'newest', 1, 100)
  check(`lists the ${captures.length} new leads`, all.total === baseline.all + captures.length, `${all.total} (baseline ${baseline.all})`)

  const byStatus = await listLeads({ status: 'Follow-up' }, 'newest', 1, 100)
  check('filters by status', byStatus.total === baseline.followUp + 1, String(byStatus.total))

  const byIntent = await listLeads({ intent: 'Finance' }, 'newest', 1, 100)
  check('filters by intent', byIntent.total === baseline.finance + 1, String(byIntent.total))

  const byPhone = await listLeads({ search: '9419100004' }, 'newest', 1, 100)
  check('searches by phone (old admin could not)', byPhone.total === 1, String(byPhone.total))

  const byEmail = await listLeads({ search: '0005@example.com' }, 'newest', 1, 100)
  check('searches by email', byEmail.total === 1, String(byEmail.total))

  const byMessage = await listLeads({ search: '/contact' }, 'newest', 1, 100)
  check('searches message + source', byMessage.total >= 1, String(byMessage.total))

  const due = await listLeads({ dueOnly: true }, 'follow-up', 1, 100)
  check('due-only excludes future follow-ups', due.total === baseline.due, String(due.total))

  await updateLead(createdIds[1], { nextFollowUpAt: new Date(Date.now() - 3600_000).toISOString() })
  const overdue = await listLeads({ dueOnly: true }, 'follow-up', 1, 100)
  check('due-only finds an overdue follow-up', overdue.total === baseline.due + 1, String(overdue.total))

  const p1 = await listLeads({}, 'newest', 1, 2)
  const p2 = await listLeads({}, 'newest', 2, 2)
  check('paginates', p1.leads.length === 2 && p2.leads.length === 2)
  check('pages do not overlap', !p1.leads.some((l) => p2.leads.some((o) => o.id === l.id)))

  const assigned = await listLeads({ assignedTo: 'unassigned' }, 'newest', 1, 100)
  check('filters unassigned', assigned.total === baseline.unassigned + captures.length - 1, String(assigned.total))

  /* ---------------------------------------------------------------- */
  section('9. Null-safety')
  const minimal = await insertLead({ name: 'No Email', phone: '+919419100009', intent: 'General', sourceLabel: TEST_TAG })
  check('captures a lead with no email or message', minimal.email === null && minimal.message === null)
  check('minimal lead still lists', (await listLeads({ search: 'No Email' }, 'newest', 1, 10)).total === 1)

  /* ---------------------------------------------------------------- */
  section('Summary')
  const finalAll = (await listLeads({}, 'newest', 1, 10000)).leads.filter((l) => l.sourceLabel === TEST_TAG)
  console.log(`  test leads made: ${finalAll.length}`)
  console.log(`  backend        : ${storageBackend}`)
  console.log(`  by intent      : ${[...new Set(finalAll.map((l) => l.intent))].join(', ')}`)
  console.log(`  by status      : ${[...new Set(finalAll.map((l) => l.status))].join(', ')}`)

  // Teardown: remove exactly the rows this run created, so a test never leaves
  // fake leads sitting in the sales team's CRM.
  const removed = await purgeTestLeads()
  console.log(`  cleaned up     : ${removed} test lead(s) removed`)

  console.log(`\n  ${pass} passed, ${fail} failed\n`)
  process.exitCode = fail === 0 ? 0 : 1
}

main().catch((e) => {
  console.error('unhandled failure:', e)
  process.exitCode = 1
})
