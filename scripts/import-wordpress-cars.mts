/**
 * One-time importer: copies the used-car stock from the WordPress site into
 * our own table (public.used_cars) and its photos into our own bucket.
 *
 *   npm run cars:import                        dry run - prints what would happen, writes nothing
 *   npm run cars:import -- --apply             copy the photos and insert the cars
 *   npm run cars:import -- --apply --no-photos insert the cars, leave the photo URLs pointing at WordPress
 *   npm run cars:import -- --apply --overwrite also rewrite cars that are already in the table
 *   npm run cars:import -- --only=5579,5099    limit any of the above to these listing ids
 *
 * Safe to run twice. A car that is already in the table is left alone, because
 * someone may have corrected it in the admin since the first import; only
 * --overwrite rewrites it. Nothing is ever deleted - a car that has gone from
 * WordPress stays in the table until an admin marks it sold or removes it.
 *
 * The table is checked BEFORE any photo is copied, so a run against a database
 * that is not ready stops without having uploaded anything. Photos are all
 * copied before the first car is written, because the public site switches
 * from WordPress to this table as soon as it holds a single row.
 */

import './lib/load-env.mts'

import { photoPublicUrl, putPhoto, upsertCars } from '../lib/cars/store.ts'
import type { CarUpsert } from '../lib/cars/types.ts'
import {
  explainTableState,
  fetchWordPressStock,
  printTable,
  probeTable,
  rupees,
  type WordPressCar,
} from './lib/cars-shared.mts'

/* ------------------------------------------------------------------ */
/* Arguments                                                           */
/* ------------------------------------------------------------------ */

const args = process.argv.slice(2)
const KNOWN_FLAGS = ['--apply', '--no-photos', '--overwrite']
const unknown = args.filter((a) => !KNOWN_FLAGS.includes(a) && !a.startsWith('--only='))
if (unknown.length) {
  // A mistyped flag must not quietly turn into a different kind of run.
  console.error(`Unknown argument: ${unknown.join(' ')}\nKnown: ${KNOWN_FLAGS.join(' ')} --only=<id,id>`)
  process.exit(2)
}

const APPLY = args.includes('--apply')
const COPY_PHOTOS = !args.includes('--no-photos')
const OVERWRITE = args.includes('--overwrite')
const onlyArg = args.find((a) => a.startsWith('--only='))
const ONLY = onlyArg
  ? new Set(onlyArg.slice('--only='.length).split(',').map((s) => Number(s.trim())).filter(Number.isFinite))
  : null

/* ------------------------------------------------------------------ */
/* Photos                                                              */
/* ------------------------------------------------------------------ */

// These mirror the bucket's own limits in the migration, so a file the bucket
// would refuse is reported here with a reason instead of as a storage error.
const ALLOWED_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
const MAX_PHOTO_BYTES = 8 * 1024 * 1024

const PHOTO_TIMEOUT_MS = 20_000
const PHOTO_ATTEMPTS = 3
/** Downloads in flight at once. WordPress is a small shared host; be gentle. */
const PHOTO_CONCURRENCY = 4

const USER_AGENT = 'Mozilla/5.0 (compatible; AMGroupSiteBot/1.0; +https://amgroupind.com) photo-import'

type PhotoOutcome =
  | { kind: 'copied' | 'existing'; url: string }
  | { kind: 'failed'; url: string; reason: string }

/** A failure that another attempt cannot fix (wrong type, 404, too large). */
class PermanentPhotoError extends Error {}

function extensionOf(url: string): string {
  let path = url
  try {
    path = new URL(url).pathname
  } catch {
    // not an absolute URL; the pattern below still finds an extension
  }
  const ext = /\.([a-z0-9]{2,5})$/i.exec(path)?.[1].toLowerCase()
  if (ext === 'jpeg') return 'jpg'
  // When the address has no usable extension, name the object .jpg. The
  // browser goes by the stored content type, not by this name.
  return ext === 'jpg' || ext === 'png' || ext === 'webp' ? ext : 'jpg'
}

async function downloadPhoto(url: string): Promise<{ bytes: Uint8Array; contentType: string }> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(PHOTO_TIMEOUT_MS),
    headers: { 'user-agent': USER_AGENT, accept: 'image/webp,image/jpeg,image/png' },
  })
  if (!res.ok) {
    const message = `HTTP ${res.status}`
    // 4xx will be the same next time, except "slow down" and "timed out".
    if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) {
      throw new PermanentPhotoError(message)
    }
    throw new Error(message)
  }
  const contentType = (res.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
  // WordPress can answer 200 with an HTML error page; that is not a photo.
  if (!ALLOWED_TYPES[contentType]) throw new PermanentPhotoError(`not an accepted image type (${contentType || 'no content type'})`)
  const bytes = new Uint8Array(await res.arrayBuffer())
  if (bytes.byteLength === 0) throw new Error('empty response')
  if (bytes.byteLength > MAX_PHOTO_BYTES) {
    throw new PermanentPhotoError(`larger than the bucket's 8MB limit (${(bytes.byteLength / 1048576).toFixed(1)}MB)`)
  }
  return { bytes, contentType }
}

async function alreadyInBucket(publicUrl: string): Promise<boolean> {
  try {
    const res = await fetch(publicUrl, { method: 'HEAD', signal: AbortSignal.timeout(10_000) })
    return res.ok
  } catch {
    return false // cannot tell; copying again is harmless
  }
}

/**
 * Copy one photo to wordpress/<carId>/<nn>.<ext>. Never throws: a photo that
 * cannot be copied keeps its WordPress address so the car still has a picture
 * in that slot.
 */
async function copyPhoto(carId: number, index: number, sourceUrl: string): Promise<PhotoOutcome> {
  const path = `wordpress/${carId}/${String(index + 1).padStart(2, '0')}.${extensionOf(sourceUrl)}`
  let lastReason = 'unknown error'
  try {
    const target = photoPublicUrl(path)
    if (await alreadyInBucket(target)) return { kind: 'existing', url: target }

    for (let attempt = 1; attempt <= PHOTO_ATTEMPTS; attempt++) {
      try {
        const { bytes, contentType } = await downloadPhoto(sourceUrl)
        return { kind: 'copied', url: await putPhoto(path, bytes, contentType) }
      } catch (err) {
        lastReason = err instanceof Error ? err.message : String(err)
        if (err instanceof PermanentPhotoError) break
        if (attempt < PHOTO_ATTEMPTS) await new Promise((r) => setTimeout(r, 800 * attempt))
      }
    }
  } catch (err) {
    lastReason = err instanceof Error ? err.message : String(err)
  }
  return { kind: 'failed', url: sourceUrl, reason: lastReason }
}

/** Copy a car's photos a few at a time, keeping the original order. */
async function copyPhotos(carId: number, sources: string[]): Promise<PhotoOutcome[]> {
  const out = new Array<PhotoOutcome>(sources.length)
  let next = 0
  const worker = async () => {
    while (next < sources.length) {
      const i = next++
      out[i] = await copyPhoto(carId, i, sources[i])
    }
  }
  await Promise.all(Array.from({ length: Math.min(PHOTO_CONCURRENCY, sources.length) }, worker))
  return out
}

/* ------------------------------------------------------------------ */
/* Rows                                                                */
/* ------------------------------------------------------------------ */

/**
 * WordPress gives the posting time as site-local wall-clock time with no
 * offset ("2026-05-01T10:30:00"). The dealership is in India, so it is stored
 * as IST; without the offset Postgres would read it as UTC, 5h30 late.
 */
function postedAtWithOffset(postedAt: string | null): string | null {
  if (!postedAt) return null
  return /(Z|[+-]\d{2}:?\d{2})$/.test(postedAt) ? postedAt : `${postedAt}+05:30`
}

function toRow(car: WordPressCar, images: string[], isNew: boolean, firstImport: boolean): CarUpsert {
  const v = car.vehicle
  const row: CarUpsert = {
    id: v.id,
    title: v.title,
    make: v.make,
    model: v.model,
    year: v.year,
    price: v.price,
    original_price: v.originalPrice,
    mileage_km: v.mileage,
    fuel: v.fuel,
    transmission: v.transmission,
    drivetrain: v.drivetrain,
    body_type: v.bodyType,
    colour: v.colour,
    engine: v.engine,
    condition: v.condition,
    images,
    source: 'wordpress',
    source_url: v.sourceUrl || null,
  }
  // On --overwrite the status of an existing row is left as the admin set it:
  // a car marked sold must not come back onto the site because WordPress still
  // lists it. Columns WordPress knows nothing about (variant, owners,
  // registration, location, description) are not in the row at all, so an
  // upsert leaves them untouched too.
  // A car that is new to the table is published only on the FIRST import. On a
  // later run, an id that is on WordPress but not in the table is most likely
  // a car staff deleted after it sold; it comes back as a draft, so a person
  // has to decide to put it on sale again.
  if (isNew) row.status = firstImport ? 'published' : 'draft'
  const postedAt = postedAtWithOffset(v.postedAt)
  // New rows always carry a date, so every row in a batch has the same keys.
  if (postedAt) row.posted_at = postedAt
  else if (isNew) row.posted_at = new Date().toISOString()
  return row
}

/** Things worth a human look, including values the table's checks would refuse. */
function problemsWith(car: WordPressCar): { notes: string[]; blocking: string[] } {
  const v = car.vehicle
  const notes: string[] = []
  const blocking: string[] = []
  if (v.price === null) notes.push('no price')
  else if (v.price === 0) notes.push('price is 0')
  if (v.images.length === 0) notes.push('no photos')
  if (v.year === null) notes.push('no year')
  if (v.mileage === null) notes.push('no km')
  if (!v.make || !v.model) notes.push('make or model not recognised')
  if (car.raw.photoCount !== null && car.raw.photoCount !== v.images.length) {
    notes.push(`WordPress badge says ${car.raw.photoCount} photos, gallery has ${v.images.length}`)
  }
  if (!v.title.trim()) blocking.push('no title (the table requires one)')
  if (v.year !== null && (v.year < 1980 || v.year > 2100)) blocking.push(`year ${v.year} is outside 1980-2100`)
  if (v.price !== null && v.price < 0) blocking.push('negative price')
  if (v.originalPrice !== null && v.originalPrice < 0) blocking.push('negative original price')
  if (v.mileage !== null && v.mileage < 0) blocking.push('negative km')
  return { notes, blocking }
}

/* ------------------------------------------------------------------ */
/* Run                                                                 */
/* ------------------------------------------------------------------ */

async function main(): Promise<number> {
  console.log(
    APPLY
      ? `APPLY: importing WordPress cars into public.used_cars${COPY_PHOTOS ? ' and copying photos' : ' (photos stay on WordPress)'}${OVERWRITE ? ', overwriting existing rows' : ''}.`
      : 'DRY RUN: nothing will be written. Pass --apply to import.',
  )

  // 1. The table, before anything else. An --apply run that cannot write stops
  //    here, before a single photo is downloaded or uploaded.
  const table = await probeTable()
  if (table.state !== 'ok') {
    if (APPLY) {
      console.error(`\nStopped, nothing was written or uploaded.\n${explainTableState(table)}`)
      return 1
    }
    console.log(`\nDatabase: ${explainTableState(table)}\n(The dry run continues; --apply would stop here.)`)
  } else {
    console.log(`\nDatabase: public.used_cars exists and holds ${table.rows.length} car(s).`)
  }
  const existing = new Set(table.state === 'ok' ? table.rows.map((r) => r.id) : [])

  // 2. The live WordPress stock, through the site's own adapter.
  const stock = await fetchWordPressStock()
  console.log(
    `WordPress: ${stock.cars.length} listing(s) via the ${stock.transport} transport` +
      `${stock.total !== null ? ` (WordPress reports ${stock.total})` : ''}.`,
  )
  for (const note of stock.notes) console.log(`  note: ${note}`)

  let cars = stock.cars
  if (ONLY) {
    cars = cars.filter((c) => ONLY.has(c.vehicle.id))
    const absent = [...ONLY].filter((id) => !cars.some((c) => c.vehicle.id === id))
    console.log(`--only: ${cars.length} of the requested ${ONLY.size} id(s) are on WordPress.${absent.length ? ` Not found: ${absent.join(', ')}.` : ''}`)
  }

  if (cars.length === 0) {
    console.error('\nNo cars to import. If WordPress really has stock, the fetch or the markup has changed; nothing was written.')
    return APPLY ? 1 : 0
  }

  // 3. The plan.
  const plan = cars.map((car) => {
    const inTable = existing.has(car.vehicle.id)
    const { notes, blocking } = problemsWith(car)
    const action = blocking.length ? 'refuse' : !inTable ? 'insert' : OVERWRITE ? 'overwrite' : 'skip'
    return { car, inTable, notes, blocking, action }
  })

  console.log()
  printTable(
    ['id', 'title', 'year', 'price', 'km', 'photos', table.state === 'ok' ? 'action' : 'action (if table were empty)'],
    plan.map((p) => [
      String(p.car.vehicle.id),
      p.car.vehicle.title,
      p.car.vehicle.year === null ? '-' : String(p.car.vehicle.year),
      rupees(p.car.vehicle.price),
      rupees(p.car.vehicle.mileage),
      String(p.car.vehicle.images.length),
      p.action === 'skip' ? 'skip (already in table)' : p.action,
    ]),
    [0, 2, 3, 4, 5],
  )

  const flagged = plan.filter((p) => p.notes.length || p.blocking.length)
  console.log(`\nWorth a look: ${flagged.length ? '' : 'nothing.'}`)
  for (const p of flagged) {
    const all = [...p.blocking.map((b) => `WILL NOT IMPORT - ${b}`), ...p.notes]
    console.log(`  ${p.car.vehicle.id}  ${p.car.vehicle.title}: ${all.join('; ')}`)
  }

  const totalPhotos = plan
    .filter((p) => p.action === 'insert' || p.action === 'overwrite')
    .reduce((n, p) => n + p.car.vehicle.images.length, 0)

  if (!APPLY) {
    const count = (a: string) => plan.filter((p) => p.action === a).length
    console.log(
      `\nDry run summary: would insert ${count('insert')}, overwrite ${count('overwrite')}, ` +
        `skip ${count('skip')} already in the table, refuse ${count('refuse')}; ` +
        `${COPY_PHOTOS ? `${totalPhotos} photo(s) would be copied to the bucket` : 'photos would stay on WordPress'}. Nothing was written.`,
    )
    return 0
  }

  // The site stops reading WordPress the moment this table holds one row
  // (lib/inventory/server.ts), so a partial first import would take cars off
  // the public site. Two situations would cause exactly that; refuse both.
  const tableIsEmpty = existing.size === 0
  if (stock.total !== null && stock.cars.length < stock.total) {
    console.error(
      `\nStopped, nothing was written or uploaded. WordPress reports ${stock.total} listing(s) but only ` +
        `${stock.cars.length} could be read, and importing a short list would drop the rest from the site. Run it again.`,
    )
    return 1
  }
  if (ONLY && tableIsEmpty) {
    console.error(
      '\nStopped, nothing was written or uploaded. --only cannot be used for the first import: the table is empty, and ' +
        'the site would switch to showing just these cars. Run the full import first.',
    )
    return 1
  }

  // 4. Apply, in two passes. Photos first, for every car: uploads change
  //    nothing a visitor can see. Rows last, in one quick loop, so the moment
  //    the site switches from WordPress to the database the whole stock is
  //    there, not the first few cars while 400 photos are still copying.
  const done = { inserted: 0, overwritten: 0, skipped: 0, refused: 0, failed: 0, copied: 0, reused: 0, photoFailed: 0 }
  const photoFailures: string[] = []
  const carFailures: string[] = []
  const toWrite: { p: (typeof plan)[number]; images: string[] }[] = []

  if (COPY_PHOTOS) console.log('\nCopying photos...')
  for (const p of plan) {
    const v = p.car.vehicle
    if (p.action === 'skip') {
      done.skipped++
      continue
    }
    if (p.action === 'refuse') {
      done.refused++
      continue
    }

    let images = v.images
    if (COPY_PHOTOS && v.images.length) {
      const counts = { copied: 0, reused: 0, failed: 0 }
      const outcomes = await copyPhotos(v.id, v.images)
      images = outcomes.map((o) => o.url)
      outcomes.forEach((o, i) => {
        if (o.kind === 'failed') {
          counts.failed++
          photoFailures.push(`  ${v.id} photo ${i + 1}: ${o.reason} - kept ${o.url}`)
        } else if (o.kind === 'copied') counts.copied++
        else counts.reused++
      })
      done.copied += counts.copied
      done.reused += counts.reused
      done.photoFailed += counts.failed
      console.log(`  ${v.id}  ${v.title}: ${counts.copied} copied, ${counts.reused} already there, ${counts.failed} failed`)
    }
    toWrite.push({ p, images })
  }

  // One row per request: a row the database refuses does not take the others
  // down with it, and rows with and without a posting date can differ in
  // shape (a mixed batch would send the missing date as NULL).
  console.log('\nWriting cars...')
  // The FIRST import is one request, all or nothing. The public site switches
  // from WordPress to the database the moment the table holds a single row, so
  // writing 23 rows one at a time could leave it showing 5 cars if the run was
  // interrupted. If this one request fails, nothing is written and the site
  // stays on WordPress.
  if (tableIsEmpty && toWrite.length > 0) {
    try {
      await upsertCars(toWrite.map(({ p, images }) => toRow(p.car, images, true, true)))
      done.inserted += toWrite.length
      for (const { p } of toWrite) console.log(`  inserted  ${p.car.vehicle.id}  ${p.car.vehicle.title}`)
    } catch (err) {
      done.failed += toWrite.length
      carFailures.push(`  all ${toWrite.length} cars: ${err instanceof Error ? err.message : String(err)} (nothing was written; the site is still reading WordPress)`)
    }
    toWrite.length = 0
  }
  for (const { p, images } of toWrite) {
    const v = p.car.vehicle
    try {
      await upsertCars([toRow(p.car, images, !p.inTable, false)])
      if (p.inTable) done.overwritten++
      else done.inserted++
      console.log(`  ${p.inTable ? 'overwrote' : 'inserted '} ${v.id}  ${v.title}`)
    } catch (err) {
      done.failed++
      carFailures.push(`  ${v.id}  ${v.title}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  // 5. Summary.
  console.log('\nSummary')
  console.log(`  cars inserted      ${done.inserted}`)
  if (OVERWRITE) console.log(`  cars overwritten   ${done.overwritten}`)
  console.log(`  cars skipped       ${done.skipped}  (already in the table)`)
  if (done.refused) console.log(`  cars refused       ${done.refused}  (see "Worth a look" above)`)
  if (done.failed) console.log(`  cars FAILED        ${done.failed}`)
  console.log(`  photos copied      ${done.copied}${done.reused ? `  (+ ${done.reused} already in the bucket)` : ''}`)
  console.log(`  photos failed      ${done.photoFailed}`)

  if (carFailures.length) console.log(`\nCars the database refused:\n${carFailures.join('\n')}`)
  if (photoFailures.length) {
    console.log(`\nPhotos that could not be copied (the car keeps the WordPress address for that slot):\n${photoFailures.join('\n')}`)
    console.log(
      '\nThose cars are now in the table, so a plain re-run will skip them. To retry only their photos:\n' +
        '  npm run cars:import -- --apply --overwrite --only=<ids>\n' +
        '(--overwrite rewrites the imported fields of those cars, so use it before anyone edits them in the admin).',
    )
  }
  if (done.inserted + done.overwritten > 0) {
    // lib/inventory/server.ts switches to the database as soon as the table
    // holds one row, and caches that read for five minutes.
    console.log(
      '\nThe site now reads its stock from the database, not WordPress (within about five minutes, when its cache refreshes).\n' +
        'Check the two agree:  npm run cars:parity',
    )
  }
  return done.failed ? 1 : 0
}

main()
  .then((code) => {
    process.exitCode = code
  })
  .catch((err) => {
    console.error('\nThe import stopped on an error:', err instanceof Error ? err.message : err)
    process.exitCode = 1
  })
