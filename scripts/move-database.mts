/**
 * MOVE, STEP 2 of 3: copy the website's data from the current Supabase project
 * to a new one. (Step 1 is supabase/move/01-schema.sql, step 3 is
 * supabase/move/03-after-copy.sql, both run in the NEW project's SQL editor.)
 *
 *   npm run db:move              dry run: checks both projects, prints the plan, writes nothing
 *   npm run db:move -- --apply   copy files and rows
 *
 * WHAT IS COPIED, and nothing else (the old project also holds another app's
 * tables; they are never read):
 *   car-photos bucket      400 stock photos
 *   am_group_files bucket  branch photography the pages show
 *   used_cars              ids kept: they are in every car URL, the Meta
 *                          catalogue and leads.listing_id
 *   leads, lead_activities ids and dates kept, leads first
 *
 * Every car's photo URLs are rewritten to the new project before the row is
 * inserted (a later UPDATE would change updated_at).
 *
 * SAFE TO RE-RUN, and meant to be: after the website is switched over, run it
 * once more to pick up leads that arrived during the switch. A re-run only
 * ADDS rows and files that are missing. It never overwrites, so a lead the team
 * has already updated on the new project keeps its changes.
 *
 * CREDENTIALS. The source is the project the site uses now
 * (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY). The target comes
 * ONLY from NEW_SUPABASE_URL + NEW_SUPABASE_SERVICE_ROLE_KEY in .env, so the
 * two can never be swapped by accident. After the switch, when the site's own
 * variables point at the new project, set OLD_SUPABASE_URL and
 * OLD_SUPABASE_SERVICE_ROLE_KEY for the re-run. Keys are never printed.
 */

import './lib/load-env.mts'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const APPLY = process.argv.includes('--apply')

const TABLES = ['used_cars', 'leads', 'lead_activities'] as const
const BUCKETS = ['car-photos', 'am_group_files'] as const
const PAGE = 1000
const PARALLEL = 6

/** Columns each table must have on the target, read from the old project's live shape. */
const COLUMNS: Record<(typeof TABLES)[number], string> = {
  used_cars:
    'id,status,title,make,model,variant,year,price,original_price,mileage_km,fuel,transmission,drivetrain,body_type,colour,engine,condition,owners,registration,location_slug,description,images,source,source_url,posted_at,created_at,updated_at',
  leads:
    'id,customer_name,customer_phone,customer_email,vehicle_id,dealership_id,inquiry_type,message,status,created_at,intent,source_path,source_label,listing_id,listing_title,listing_price,listing_url,assigned_to,next_follow_up_at,consent,updated_at',
  lead_activities: 'id,lead_id,type,body,from_status,to_status,author,created_at',
}

/* ------------------------------------------------------------------ */

function fail(message: string): never {
  console.error(`\nSTOPPED: ${message}\n`)
  process.exit(1)
}

function env(name: string): string | undefined {
  const v = process.env[name]?.trim()
  return v ? v : undefined
}

/** Just the project address: the dashboard's "API URL" adds /rest/v1/, which the client adds itself. */
function projectOrigin(value: string | undefined): string | undefined {
  if (!value) return undefined
  try {
    return new URL(value).origin
  } catch {
    fail(`"${value}" is not a web address.`)
  }
}

// Before the switch: old = the site's own variables, new = NEW_*.
// After it: old = OLD_*, new = NEW_* or, if those are gone, the site's own
// variables (which by then point at the new project).
const afterSwitch = Boolean(env('OLD_SUPABASE_URL'))
const sourceUrl = projectOrigin(env('OLD_SUPABASE_URL') ?? env('NEXT_PUBLIC_SUPABASE_URL'))
const sourceKey = env('OLD_SUPABASE_SERVICE_ROLE_KEY') ?? (afterSwitch ? undefined : env('SUPABASE_SERVICE_ROLE_KEY'))
const targetUrl = projectOrigin(env('NEW_SUPABASE_URL') ?? (afterSwitch ? env('NEXT_PUBLIC_SUPABASE_URL') : undefined))
const targetKey = env('NEW_SUPABASE_SERVICE_ROLE_KEY') ?? (afterSwitch ? env('SUPABASE_SERVICE_ROLE_KEY') : undefined)

if (!sourceUrl || !sourceKey)
  fail(afterSwitch ? "add OLD_SUPABASE_SERVICE_ROLE_KEY (the old project's service_role key) to .env." : "the current project is not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).")
if (!targetUrl || !targetKey)
  fail('add NEW_SUPABASE_URL and NEW_SUPABASE_SERVICE_ROLE_KEY for the new project to .env (never paste them in chat).')
if (new URL(sourceUrl).host === new URL(targetUrl).host)
  fail(`source and target are the same project (${new URL(targetUrl).host}). After the switch, set OLD_SUPABASE_URL / OLD_SUPABASE_SERVICE_ROLE_KEY to the old project.`)

const opts = { auth: { persistSession: false, autoRefreshToken: false } }
const source = createClient(sourceUrl, sourceKey, opts)
const target = createClient(targetUrl, targetKey, opts)
const host = (u: string) => new URL(u).host

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

type Obj = { path: string; size: number; mimetype?: string; cacheControl?: string }

/** Every object in a bucket, walking folders. */
async function listAll(db: SupabaseClient, bucket: string, prefix = ''): Promise<Obj[]> {
  const out: Obj[] = []
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await db.storage.from(bucket).list(prefix, { limit: PAGE, offset, sortBy: { column: 'name', order: 'asc' } })
    if (error) throw new Error(`listing ${bucket}/${prefix}: ${error.message}`)
    for (const o of data ?? []) {
      const path = prefix ? `${prefix}/${o.name}` : o.name
      if (o.id === null) out.push(...(await listAll(db, bucket, path)))
      else {
        const meta = (o.metadata ?? {}) as { size?: number; mimetype?: string; cacheControl?: string }
        out.push({ path, size: meta.size ?? 0, mimetype: meta.mimetype, cacheControl: meta.cacheControl })
      }
    }
    if (!data || data.length < PAGE) break
  }
  return out
}

async function readAll(db: SupabaseClient, table: string, columns: string): Promise<Record<string, unknown>[]> {
  const rows: Record<string, unknown>[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db.from(table).select(columns).order('id').range(from, from + PAGE - 1)
    if (error) throw new Error(`reading ${table}: ${error.message}`)
    rows.push(...((data ?? []) as unknown as Record<string, unknown>[]))
    if (!data || data.length < PAGE) break
  }
  return rows
}

async function countRows(db: SupabaseClient, table: string): Promise<number | null> {
  const { count, error } = await db.from(table).select('id', { count: 'exact', head: true })
  return error ? null : count ?? 0
}

/** Run jobs a few at a time. */
async function pool<T>(items: T[], fn: (item: T) => Promise<void>): Promise<void> {
  let i = 0
  await Promise.all(
    Array.from({ length: Math.min(PARALLEL, items.length) }, async () => {
      while (i < items.length) await fn(items[i++])
    }),
  )
}

const mb = (bytes: number) => `${(bytes / 1e6).toFixed(1)} MB`

/* ------------------------------------------------------------------ */
/* 1. Preflight: both projects, read only                              */
/* ------------------------------------------------------------------ */

console.log(`\n${APPLY ? 'APPLY' : 'DRY RUN (nothing is written; add --apply to copy)'}`)
console.log(`  from ${host(sourceUrl)}`)
console.log(`  to   ${host(targetUrl)}\n`)

for (const t of TABLES) {
  // Selecting the full column list fails if the table or any column is missing.
  const { error } = await target.from(t).select(COLUMNS[t]).limit(0)
  if (error)
    fail(`the new project has no usable public.${t} (${error.message}). Run supabase/move/01-schema.sql in its SQL editor first.`)
}

const { data: targetBuckets, error: bucketError } = await target.storage.listBuckets()
if (bucketError) fail(`cannot read the new project's buckets: ${bucketError.message}`)
for (const b of BUCKETS) {
  const found = targetBuckets?.find((x) => x.id === b)
  if (!found) fail(`the new project has no "${b}" bucket. Run supabase/move/01-schema.sql first.`)
  if (!found.public) fail(`the "${b}" bucket on the new project is not public; the website's photos would not load.`)
}

/* ------------------------------------------------------------------ */
/* 2. Files                                                            */
/* ------------------------------------------------------------------ */

const fileSummary: string[] = []
let fileProblems = 0

for (const bucket of BUCKETS) {
  const [from, already] = await Promise.all([listAll(source, bucket), listAll(target, bucket)])
  const there = new Map(already.map((o) => [o.path, o]))
  const missing = from.filter((o) => !there.has(o.path))
  // Same path, different size: something else is already stored there. Never overwritten.
  const clashes = from.filter((o) => there.has(o.path) && there.get(o.path)!.size !== o.size)
  for (const c of clashes) console.warn(`  ! ${bucket}/${c.path} already exists on the new project with different content; left as it is`)
  fileProblems += clashes.length

  console.log(`${bucket}: ${from.length} files (${mb(from.reduce((s, o) => s + o.size, 0))}), ${from.length - missing.length} already there, ${missing.length} to copy`)

  if (APPLY && missing.length) {
    let done = 0
    await pool(missing, async (o) => {
      const { data, error } = await source.storage.from(bucket).download(o.path)
      if (error || !data) {
        console.warn(`  ! could not read ${bucket}/${o.path}: ${error?.message}`)
        fileProblems++
        return
      }
      const up = await target.storage.from(bucket).upload(o.path, await data.arrayBuffer(), {
        contentType: o.mimetype || data.type || 'application/octet-stream',
        cacheControl: o.cacheControl?.replace(/^max-age=/, '') || '31536000',
        upsert: false,
      })
      if (up.error && !/exists|duplicate/i.test(up.error.message)) {
        console.warn(`  ! could not write ${bucket}/${o.path}: ${up.error.message}`)
        fileProblems++
        return
      }
      if (++done % 50 === 0) console.log(`  ${done}/${missing.length}`)
    })
    console.log(`  copied ${done}`)
  }

  if (APPLY) {
    const after = await listAll(target, bucket)
    const have = new Set(after.map((o) => o.path))
    const stillMissing = from.filter((o) => !have.has(o.path)).length
    fileSummary.push(`${bucket}: ${from.length} on old, ${from.length - stillMissing} of them on new${stillMissing ? `, ${stillMissing} MISSING` : ''}`)
    fileProblems += stillMissing
  }
}

/* ------------------------------------------------------------------ */
/* 3. Rows                                                             */
/* ------------------------------------------------------------------ */

const oldPhotoBase = `${sourceUrl}/storage/v1/object/public/car-photos/`
const newPhotoBase = `${targetUrl}/storage/v1/object/public/car-photos/`

const rowSummary: string[] = []
let rowProblems = 0
const copied: Record<string, Record<string, unknown>[]> = {}

for (const table of TABLES) {
  let rows = await readAll(source, table, COLUMNS[table])

  if (table === 'used_cars') {
    let rewritten = 0
    rows = rows.map((r) => {
      const images = ((r.images as string[] | null) ?? []).map((u) => {
        if (u.startsWith(oldPhotoBase)) {
          rewritten++
          return newPhotoBase + u.slice(oldPhotoBase.length)
        }
        return u
      })
      return { ...r, images }
    })
    console.log(`used_cars: ${rewritten} photo addresses point at the new project`)
  }

  if (table === 'lead_activities') {
    const leadIds = new Set((copied.leads ?? []).map((l) => l.id))
    const orphans = rows.filter((a) => !leadIds.has(a.lead_id))
    if (orphans.length) {
      console.warn(`  ! ${orphans.length} activities belong to no lead on the old project; skipped`)
      rows = rows.filter((a) => leadIds.has(a.lead_id))
    }
  }

  copied[table] = rows
  const before = await countRows(target, table)
  console.log(`${table}: ${rows.length} rows on old, ${before ?? '?'} on new before copying`)

  if (APPLY && rows.length) {
    for (let i = 0; i < rows.length; i += 500) {
      // ignoreDuplicates: insert the missing rows, leave existing ones untouched.
      const { error } = await target.from(table).upsert(rows.slice(i, i + 500), { onConflict: 'id', ignoreDuplicates: true })
      if (error) fail(`writing ${table}: ${error.message}`)
    }
    const after = await countRows(target, table)
    const ok = after !== null && after >= rows.length
    if (!ok) rowProblems++
    rowSummary.push(`${table}: ${rows.length} on old, ${after} on new${ok ? '' : '  <- FEWER THAN THE OLD PROJECT'}`)
  }
}

/* ------------------------------------------------------------------ */
/* 4. Check every car photo now loads from the new project             */
/* ------------------------------------------------------------------ */

if (APPLY) {
  const urls = (copied.used_cars ?? []).flatMap((r) => (r.images as string[]) ?? []).filter((u) => u.startsWith(newPhotoBase))
  const broken: string[] = []
  await pool(urls, async (u) => {
    const r = await fetch(u, { method: 'HEAD' }).catch(() => null)
    if (!r || !r.ok) broken.push(u)
  })

  console.log('\nRESULT')
  for (const line of [...fileSummary, ...rowSummary]) console.log(`  ${line}`)
  console.log(`  car photos loading from the new project: ${urls.length - broken.length}/${urls.length}`)
  for (const u of broken.slice(0, 10)) console.log(`    broken: ${u.slice(newPhotoBase.length)}`)

  const problems = fileProblems + rowProblems + broken.length
  console.log(
    problems
      ? `\n${problems} problem(s) above. Fix them and run again; finished parts are skipped.\n`
      : '\nAll copied. Next: run supabase/move/03-after-copy.sql in the new project, then switch the website (see supabase/move/README.md).\n',
  )
  process.exit(problems ? 1 : 0)
} else {
  console.log('\nDry run finished. Run again with --apply to copy.\n')
}
