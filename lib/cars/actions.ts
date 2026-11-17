"use server"

/**
 * Admin actions for the cars table.
 *
 * Every export here is a public HTTP endpoint (that is what a Server Action
 * is), so each one calls `requireAdmin()` before it does anything else, and
 * nothing a caller sends is trusted: `saveCar` rebuilds the row column by
 * column from what it was given rather than passing the object through, so a
 * caller cannot set `id`, `source` or `source_url`.
 *
 * Validation problems come back as `{ ok: false, error }` so the form can show
 * them next to the fields. Only a missing admin session throws.
 */

import { after } from 'next/server'
import { metaPushConfigured, pushCatalogChange, type CatalogChange } from '../feed/meta-push.ts'
import { randomUUID } from 'node:crypto'
import { revalidatePath, updateTag } from 'next/cache'
import { requireAdmin } from '../admin/auth.ts'
import { displayFuel } from '../inventory/adapter.ts'
import { getInventorySource } from '../inventory/server.ts'
import { LOCATIONS } from '../locations.ts'
import { hasServiceRole } from '../supabase.ts'
import {
  createPhotoUpload,
  deleteCar,
  insertCar,
  photoPublicUrl,
  readAllCars,
  readCar,
  photosUsedByOtherCars,
  removePhotosByUrl,
  updateCar,
} from './store.ts'
import { CAR_STATUSES, INVENTORY_CACHE_TAG, type CarInput, type CarRow, type CarStatus } from './types.ts'

export type CarsListing =
  | {
      state: 'ok'
      cars: CarRow[]
      /** Where the public site is reading its stock from right now. */
      siteSource: 'database' | 'wordpress' | 'unavailable'
    }
  /** No service-role key on this deployment, so the table cannot be reached. */
  | { state: 'not-configured' }
  /** The key is there but the table is not: the migration has not been run. */
  | { state: 'table-missing' }
  /** The table exists and the query failed (paused project, network). */
  | { state: 'error'; error: string }

export type CarResult = { ok: true; car: CarRow } | { ok: false; error: string; field?: string }
export type DoneResult = { ok: true } | { ok: false; error: string }
export type PhotoUploadResult =
  | { ok: true; signedUrl: string; publicUrl: string }
  | { ok: false; error: string }

function message(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

/**
 * Make the public pages show the change at once. Admin pages are refreshed by
 * the client.
 *
 * This never throws. It runs after the row is already saved, and reporting a
 * saved car as a failure would invite a second press of Save, which for a new
 * car means a duplicate. The cache also expires by itself within minutes.
 */
/**
 * Tell Meta's catalogue at once when a car stops (or starts) being for sale,
 * instead of waiting up to an hour for the next feed fetch. Runs after the
 * response with `after()`, so the admin never waits on Meta, and does nothing
 * until META_CATALOG_ID and META_CATALOG_TOKEN are set (lib/feed/meta-push.ts).
 * Only a change of whether the car is on sale is sent; edits go by the feed.
 */
function syncCatalogue(id: number, before: CarStatus | null, after_: CarStatus | 'deleted'): void {
  const wasOnSale = before === 'published'
  const isOnSale = after_ === 'published'
  let change: CatalogChange | null = null
  if (after_ === 'deleted') change = wasOnSale || before === 'sold' ? 'deleted' : null
  else if (wasOnSale && !isOnSale) change = 'sold'
  else if (!wasOnSale && isOnSale && before !== null) change = 'available'
  if (!change || !metaPushConfigured()) return
  const what = change
  after(async () => {
    await pushCatalogChange(id, what)
  })
}

function expireStock(): void {
  try {
    updateTag(INVENTORY_CACHE_TAG)
    revalidatePath('/')
    // 'layout' so the listing AND every car page under it are rebuilt.
    revalidatePath('/inventory', 'layout')
  } catch (err) {
    console.warn(`[cars] saved, but the public pages could not be refreshed: ${message(err)}`)
  }
}

/* ------------------------------------------------------------------ */
/* Reading                                                             */
/* ------------------------------------------------------------------ */

export async function listCars(): Promise<CarsListing> {
  await requireAdmin()
  if (!hasServiceRole) return { state: 'not-configured' }
  try {
    const all = await readAllCars()
    if (all.state === 'absent') return { state: 'table-missing' }
    return { state: 'ok', cars: all.rows, siteSource: await getInventorySource() }
  } catch (err) {
    return { state: 'error', error: message(err) }
  }
}

export async function getCar(id: number): Promise<CarResult> {
  await requireAdmin()
  if (!Number.isSafeInteger(id) || id <= 0) return { ok: false, error: 'That is not a car id.' }
  try {
    const car = await readCar(id)
    return car ? { ok: true, car } : { ok: false, error: 'This car no longer exists.' }
  } catch (err) {
    return { ok: false, error: message(err) }
  }
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

type Invalid = { ok: false; error: string; field: string }

const invalid = (field: string, error: string): Invalid => ({ ok: false, error, field })

/** Trimmed text, or null when empty. Anything that is not a string is null. */
function text(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const t = value.replace(/\s+/g, ' ').trim()
  return t ? t.slice(0, max) : null
}

/**
 * A whole number in range, null when left empty, or 'bad' when something was
 * entered that is not a whole number in range.
 */
function whole(value: unknown, min: number, max: number): number | null | 'bad' {
  if (value === null || value === undefined || value === '') return null
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value.replace(/[,\s]/g, '')) : NaN
  if (!Number.isSafeInteger(n) || n < min || n > max) return 'bad'
  return n
}

/** The exact start of every public URL in our photo bucket, or null if unconfigured. */
function bucketPrefix(): string | null {
  try {
    const base = photoPublicUrl('')
    return base.endsWith('/') ? base : `${base}/`
  } catch {
    return null
  }
}

// Upper bounds chosen so a slipped key cannot store nonsense; the lower bounds
// and the year / owners ranges are the table's own CHECK constraints.
const MAX_PRICE = 1_000_000_000
const MAX_KM = 2_000_000
const MAX_PHOTOS = 40

function validate(
  raw: unknown,
  existing: CarRow | null,
): { ok: true; values: CarInput } | Invalid {
  if (!raw || typeof raw !== 'object') return invalid('title', 'Nothing was sent to save.')
  const input = raw as Record<string, unknown>

  const title = text(input.title, 120)
  const make = text(input.make, 60)
  const model = text(input.model, 60)
  if (!title) return invalid('title', 'Give the car a title, for example "Hyundai i20".')
  if (!make) return invalid('make', 'Enter the make.')
  if (!model) return invalid('model', 'Enter the model.')

  const status = input.status
  if (typeof status !== 'string' || !(CAR_STATUSES as readonly string[]).includes(status)) {
    return invalid('status', 'Choose draft, published or sold.')
  }

  const year = whole(input.year, 1980, 2100)
  if (year === 'bad') return invalid('year', 'The year must be between 1980 and 2100.')

  const price = whole(input.price, 0, MAX_PRICE)
  if (price === 'bad') return invalid('price', 'The price must be a whole number of rupees, with no decimals.')
  const originalPrice = whole(input.original_price, 0, MAX_PRICE)
  if (originalPrice === 'bad') {
    return invalid('original_price', 'The original price must be a whole number of rupees, with no decimals.')
  }
  if (price !== null && originalPrice !== null && price > originalPrice) {
    return invalid('original_price', 'The original price is the higher, struck-through one. It cannot be below the asking price.')
  }

  const mileage = whole(input.mileage_km, 0, MAX_KM)
  if (mileage === 'bad') return invalid('mileage_km', 'Kilometres must be a whole number.')

  const owners = whole(input.owners, 1, 10)
  if (owners === 'bad') return invalid('owners', 'Owners must be between 1 and 10.')

  const locationSlug = text(input.location_slug, 60)
  if (locationSlug && !LOCATIONS.some((l) => l.slug === locationSlug)) {
    return invalid('location_slug', 'Choose one of our locations.')
  }

  // The series only ("JK02"). A full plate identifies the previous owner, so it
  // is refused rather than quietly trimmed.
  const registration = text(input.registration, 20)?.toUpperCase().replace(/[\s-]/g, '') ?? null
  if (registration && !/^[A-Z]{2}\d{1,2}[A-Z]{0,3}$/.test(registration)) {
    return invalid('registration', 'Enter the registration series only, for example JK02. Do not enter the full number plate.')
  }

  // Photos. A URL is accepted only if it is in our own bucket, or was already
  // on this car (imported cars keep their old addresses until re-uploaded).
  // Without this check the form would be a way to make the public site
  // hot-link any address on the internet.
  if (!Array.isArray(input.images)) return invalid('images', 'The photo list was not understood.')
  // The cap limits GROWTH. A car imported with more photos than the cap (one in
  // stock today has 49) must still be editable - otherwise changing its price
  // would mean deleting photos first.
  const photoLimit = Math.max(MAX_PHOTOS, existing?.images.length ?? 0)
  if (input.images.length > photoLimit) return invalid('images', `A car can have at most ${photoLimit} photos.`)
  const prefix = bucketPrefix()
  const already = new Set(existing?.images ?? [])
  const images: string[] = []
  for (const entry of input.images) {
    if (typeof entry !== 'string') return invalid('images', 'The photo list was not understood.')
    if (images.includes(entry)) continue
    if (already.has(entry)) {
      images.push(entry)
      continue
    }
    // A new address is checked in its NORMALISED form, and that form is what is
    // stored. `new URL()` resolves `..` and `%2e%2e`, so testing the raw string
    // for a prefix would accept "<bucket>/../other-bucket/x.png", which a
    // browser then loads from the other bucket.
    let stored: string | null = null
    try {
      const url = new URL(entry)
      if (
        url.protocol === 'https:' &&
        prefix !== null &&
        url.href.startsWith(prefix) &&
        url.href.length > prefix.length &&
        !url.search &&
        !url.hash &&
        !/%2f|%5c|\\/i.test(entry)
      ) {
        stored = url.href
      }
    } catch {
      stored = null
    }
    if (!stored) {
      return invalid('images', 'One of the photos was not uploaded through this page. Remove it and upload it again.')
    }
    if (!images.includes(stored)) images.push(stored)
  }

  let postedAt: string | undefined
  if (typeof input.posted_at === 'string' && input.posted_at) {
    const when = new Date(input.posted_at)
    if (Number.isNaN(when.getTime())) return invalid('posted_at', 'The listing date was not understood.')
    postedAt = when.toISOString()
  }

  const description = typeof input.description === 'string' ? input.description.trim().slice(0, 5000) || null : null

  const values: CarInput = {
    status: status as CarStatus,
    title,
    make,
    model,
    variant: text(input.variant, 80),
    year,
    price,
    original_price: originalPrice,
    mileage_km: mileage,
    // One spelling per fuel, the same one the public filters use.
    fuel: displayFuel(text(input.fuel, 30)),
    transmission: text(input.transmission, 30),
    drivetrain: text(input.drivetrain, 30),
    body_type: text(input.body_type, 40),
    colour: text(input.colour, 40),
    engine: text(input.engine, 60),
    condition: text(input.condition, 40),
    owners,
    registration,
    location_slug: locationSlug,
    description,
    images,
  }
  if (postedAt) values.posted_at = postedAt
  return { ok: true, values }
}

/* ------------------------------------------------------------------ */
/* Writing                                                             */
/* ------------------------------------------------------------------ */

/** Delete photos from storage, except any another car still shows. */
async function removeUnsharedPhotos(urls: string[], carId: number): Promise<void> {
  const shared = await photosUsedByOtherCars(urls, carId)
  await removePhotosByUrl(urls.filter((u) => !shared.has(u)))
}

/** Create (id null) or update a car. */
export async function saveCar(id: number | null, input: unknown): Promise<CarResult> {
  await requireAdmin()
  if (id !== null && (!Number.isSafeInteger(id) || id <= 0)) return { ok: false, error: 'That is not a car id.' }

  try {
    const existing = id === null ? null : await readCar(id)
    if (id !== null && !existing) return { ok: false, error: 'This car no longer exists. It may have been deleted.' }

    const checked = validate(input, existing)
    if (!checked.ok) return checked

    // The listing date is the day the car went on the site, not the day a
    // draft was started: a draft published three weeks later would otherwise
    // sort below everything listed since and miss the "just arrived" rail.
    const goingLive = checked.values.status === 'published' && (!existing || existing.status === 'draft')
    const values = goingLive && !checked.values.posted_at ? { ...checked.values, posted_at: new Date().toISOString() } : checked.values

    const car = id === null ? await insertCar(values) : await updateCar(id, values)

    // Photos taken off the car are deleted from storage. The row is already
    // saved, so a storage failure here must not turn the save into an error.
    if (existing) {
      const dropped = existing.images.filter((u) => !car.images.includes(u))
      if (dropped.length > 0) {
        try {
          await removeUnsharedPhotos(dropped, car.id)
        } catch (err) {
          console.warn(`[cars] could not remove ${dropped.length} photo(s) of car ${car.id}: ${message(err)}`)
        }
      }
    }

    expireStock()
    syncCatalogue(car.id, existing ? existing.status : null, car.status)
    return { ok: true, car }
  } catch (err) {
    return { ok: false, error: message(err) }
  }
}

export async function setCarStatus(id: number, status: CarStatus): Promise<CarResult> {
  await requireAdmin()
  if (!Number.isSafeInteger(id) || id <= 0) return { ok: false, error: 'That is not a car id.' }
  if (typeof status !== 'string' || !(CAR_STATUSES as readonly string[]).includes(status)) {
    return { ok: false, error: 'Choose draft, published or sold.' }
  }
  try {
    const existing = await readCar(id)
    if (!existing) return { ok: false, error: 'This car no longer exists. It may have been deleted.' }
    // See saveCar: the listing date is the day a draft first goes on the site.
    const goingLive = status === 'published' && existing.status === 'draft'
    const car = await updateCar(id, goingLive ? { status, posted_at: new Date().toISOString() } : { status })
    expireStock()
    syncCatalogue(id, existing.status, car.status)
    return { ok: true, car }
  } catch (err) {
    return { ok: false, error: message(err) }
  }
}

export async function removeCar(id: number): Promise<DoneResult> {
  await requireAdmin()
  if (!Number.isSafeInteger(id) || id <= 0) return { ok: false, error: 'That is not a car id.' }
  try {
    // Read first: once the row is gone there is no record of which photos it had.
    const existing = await readCar(id)
    if (!existing) return { ok: true }
    await deleteCar(id)
    try {
      await removeUnsharedPhotos(existing.images, id)
    } catch (err) {
      console.warn(`[cars] car ${id} deleted, but its photos could not be removed: ${message(err)}`)
    }
    expireStock()
    syncCatalogue(id, existing.status, 'deleted')
    return { ok: true }
  } catch (err) {
    return { ok: false, error: message(err) }
  }
}

/* ------------------------------------------------------------------ */
/* Photos                                                              */
/* ------------------------------------------------------------------ */

// The extension comes from the type we allow, never from the file's own name.
const PHOTO_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

/**
 * Hand the browser a one-time address to send ONE photo to.
 *
 * `carKey` only groups a car's photos into a folder: the car's id, or a
 * throwaway key for a car that has not been saved yet. `fileName` is accepted
 * for the error message only; nothing from it reaches the storage path.
 */
export async function startPhotoUpload(
  carKey: string,
  fileName: string,
  contentType: string,
): Promise<PhotoUploadResult> {
  await requireAdmin()
  const extension = typeof contentType === 'string' ? PHOTO_EXTENSIONS[contentType] : undefined
  if (!extension) {
    const name = typeof fileName === 'string' ? fileName.slice(0, 80) : 'This file'
    return { ok: false, error: `${name} is not a JPEG, PNG or WebP photo.` }
  }
  if (typeof carKey !== 'string' || !/^[a-z0-9][a-z0-9-]{0,39}$/.test(carKey)) {
    return { ok: false, error: 'The upload could not be started. Reload the page and try again.' }
  }
  try {
    const target = await createPhotoUpload(`${carKey}/${randomUUID()}.${extension}`)
    return { ok: true, signedUrl: target.signedUrl, publicUrl: target.publicUrl }
  } catch (err) {
    return { ok: false, error: message(err) }
  }
}
