/**
 * Connection + schema diagnostic.
 *
 *   node --env-file=.env scripts/check-supabase.ts
 *
 * Reports which env vars resolve, whether the service-role client can reach the
 * database, which lead columns exist, and whether RLS is actually protecting
 * the table from the public anon key. Never prints a secret value.
 */

import { createClient } from '@supabase/supabase-js'

const mask = (v: string | undefined) =>
  !v ? 'NOT SET' : `set (${v.length} chars, …${v.slice(-4)})`

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonPublic = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const anonPlain = process.env.SUPABASE_ANON_KEY

console.log('\n=== ENVIRONMENT ===')
console.log('  NEXT_PUBLIC_SUPABASE_URL      :', url ?? 'NOT SET')
console.log('  SUPABASE_SERVICE_ROLE_KEY     :', mask(serviceKey))
console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY :', mask(anonPublic))
console.log('  SUPABASE_ANON_KEY             :', mask(anonPlain))
console.log('  ADMIN_PASSWORD                :', mask(process.env.ADMIN_PASSWORD))
console.log('  ADMIN_SESSION_SECRET          :', mask(process.env.ADMIN_SESSION_SECRET))

if (!url || !serviceKey) {
  console.error('\nCannot continue without NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } })

/** Probe a column by selecting it; a missing column returns a 42703 error. */
async function hasColumn(table: string, column: string): Promise<boolean> {
  const { error } = await admin.from(table).select(column).limit(1)
  return !error
}

async function main() {
  console.log('\n=== CONNECTION (service role) ===')
  const { error: pingErr, count } = await admin
    .from('leads')
    .select('*', { count: 'exact', head: true })

  if (pingErr) {
    console.log('  leads table  : UNREACHABLE —', pingErr.message)
    console.log('\n  If this says the relation does not exist, the base schema has not been')
    console.log('  created yet. Run lib/leads/migration.sql in the Supabase SQL editor.')
    process.exit(1)
  }
  console.log('  leads table  : reachable')
  console.log('  rows in leads:', count)

  console.log('\n=== MIGRATION STATE (lib/leads/migration.sql) ===')
  const needed = [
    'intent', 'source_path', 'source_label', 'listing_id', 'listing_title',
    'listing_price', 'listing_url', 'assigned_to', 'next_follow_up_at',
    'consent', 'updated_at',
  ]
  const missing: string[] = []
  for (const col of needed) {
    const ok = await hasColumn('leads', col)
    console.log(`  leads.${col.padEnd(18)} ${ok ? 'present' : 'MISSING'}`)
    if (!ok) missing.push(col)
  }

  const { error: actErr } = await admin.from('lead_activities').select('id').limit(1)
  const activitiesOk = !actErr
  console.log(`  lead_activities table  ${activitiesOk ? 'present' : 'MISSING — ' + actErr?.message}`)

  console.log('\n=== RLS CHECK (can the public anon key read customer data?) ===')
  const anon: string | undefined = anonPublic ?? anonPlain
  if (!anon) {
    console.log('  no anon key available to test with — skipped')
  } else {
    const pub = createClient(url as string, anon, { auth: { persistSession: false } })
    const { data, error } = await pub.from('leads').select('customer_name, customer_phone').limit(1)
    if (error) {
      console.log('  anon read blocked  : GOOD —', error.message)
    } else if ((data ?? []).length === 0) {
      console.log('  anon read returned 0 rows. Inconclusive while the table is empty —')
      console.log('  re-run this once a lead exists, or confirm RLS in the dashboard.')
    } else {
      console.log('  anon read SUCCEEDED: *** RLS IS NOT PROTECTING THIS TABLE ***')
      console.log('  Anyone with the public anon key can read every customer name and phone.')
      console.log('  Run the RLS section of lib/leads/migration.sql immediately.')
    }
  }

  console.log('\n=== VERDICT ===')
  if (missing.length === 0 && activitiesOk) {
    console.log('  Migration looks applied. The lead pipeline can use Supabase.')
  } else {
    console.log('  Migration NOT applied yet.')
    if (missing.length) console.log('  Missing columns:', missing.join(', '))
    if (!activitiesOk) console.log('  Missing table  : lead_activities')
    console.log('  -> Run lib/leads/migration.sql in the Supabase SQL editor.')
  }
  console.log()
}

main().catch((e) => {
  console.error('failed:', e)
  process.exitCode = 1
})
