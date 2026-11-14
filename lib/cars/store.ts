/**
 * Data access for `public.used_cars`. SERVER ONLY.
 *
 * Every function here uses the service-role client, which bypasses row level
 * security — the table has RLS on and no policies, so nothing else can read or
 * write it. That makes this file the trust boundary: it must never be imported
 * by a client component, and every WRITE must be reached only through a server
 * action that has called `requireAdmin()` first (lib/cars/actions.ts).
 *
 * Reads distinguish three outcomes, because the site behaves differently for
 * each (see lib/inventory/server.ts):
 *
 *   { state: 'ok', rows }      the table answered; rows may be empty
 *   { state: 'absent' }        no database configured, or the table does not
 *                              exist yet (the migration has not been run)
 *   throws                     the database is configured and the table exists
 *                              but the query failed (paused project, network)
 */

import { getSupabaseAdmin, hasServiceRole } from '../supabase.ts'
import { CAR_PHOTO_BUCKET, CAR_TABLE, type CarRow, type CarStatus, type CarUpsert } from './types.ts'

/** PostgREST / Postgres codes that mean "this table is not there". */
const TABLE_MISSING = new Set(['42P01', 'PGRST205', 'PGRST204'])

// The generated Database type does not need to know this table for the store
// to be type-safe: every function below states its own row type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function table(): any | null {
  if (!hasServiceRole) return null
  const db = getSupabaseAdmin()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return db ? (db as any).from(CAR_TABLE) : null
}

export type CarsRead = { state: 'ok'; rows: CarRow[] } | { state: 'absent' }

function normalise(row: CarRow): CarRow {
  // bigint columns arrive as numbers when they fit and as strings when the
  // driver is being careful; the app works in numbers throughout.
  return {
    ...row,
    id: Number(row.id),
    price: row.price === null ? null : Number(row.price),
    original_price: row.original_price === null ? null : Number(row.original_price),
    images: Array.isArray(row.images) ? row.images : [],
  }
}

async function read(statuses: CarStatus[] | null): Promise<CarsRead> {
  const t = table()
  if (!t) return { state: 'absent' }
  let query = t.select('*').order('posted_at', { ascending: false }).order('id', { ascending: false })
  if (statuses) query = query.in('status', statuses)
  const { data, error } = await query
  if (error) {
    if (TABLE_MISSING.has(error.code)) return { state: 'absent' }
    throw new Error(`used_cars read failed: ${error.message}`)
  }
  return { state: 'ok', rows: (data as CarRow[]).map(normalise) }
}

/** Cars on the public site. */
export function readPublishedCars(): Promise<CarsRead> {
  return read(['published'])
}

/** Every car, whatever its status — for the admin list. */
export function readAllCars(): Promise<CarsRead> {
  return read(null)
}

export async function readCar(id: number): Promise<CarRow | null> {
  const t = table()
  if (!t) return null
  const { data, error } = await t.select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`used_cars read failed: ${error.message}`)
  return data ? normalise(data as CarRow) : null
}

function client() {
  const t = table()
  if (!t) throw new Error('The cars database is not configured (SUPABASE_SERVICE_ROLE_KEY is missing).')
  return t
}

/** Insert a car added in the admin. The id comes from the table's sequence. */
export async function insertCar(values: Partial<CarRow> & Pick<CarRow, 'title'>): Promise<CarRow> {
  const { data, error } = await client().insert([{ ...values, source: 'admin' }]).select().single()
  if (error) throw new Error(error.message)
  return normalise(data as CarRow)
}

export async function updateCar(id: number, values: Partial<CarRow>): Promise<CarRow> {
  const { data, error } = await client().update(values).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return normalise(data as CarRow)
}

export async function deleteCar(id: number): Promise<void> {
  const { error } = await client().delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/** Importer only: create or overwrite rows by id. */
export async function upsertCars(rows: CarUpsert[]): Promise<number> {
  if (rows.length === 0) return 0
  const { error } = await client().upsert(rows, { onConflict: 'id' })
  if (error) throw new Error(error.message)
  return rows.length
}

/* ------------------------------------------------------------------ */
/* Photos                                                              */
/* ------------------------------------------------------------------ */

function storage() {
  const db = hasServiceRole ? getSupabaseAdmin() : null
  if (!db) throw new Error('The cars database is not configured (SUPABASE_SERVICE_ROLE_KEY is missing).')
  return db.storage.from(CAR_PHOTO_BUCKET)
}

/** The public URL of an object in the photo bucket. */
export function photoPublicUrl(path: string): string {
  return storage().getPublicUrl(path).data.publicUrl
}

/**
 * A one-time URL the browser can PUT a single photo to. The file goes from the
 * admin's browser straight to storage, so a 6MB phone photo never passes
 * through a server action (whose body limit is 1MB by default).
 */
export async function createPhotoUpload(path: string): Promise<{ path: string; token: string; signedUrl: string; publicUrl: string }> {
  const { data, error } = await storage().createSignedUploadUrl(path)
  if (error || !data) throw new Error(error?.message ?? 'Could not start the upload')
  return { path: data.path, token: data.token, signedUrl: data.signedUrl, publicUrl: photoPublicUrl(data.path) }
}

/** Importer only: put bytes at a path, replacing whatever is there. */
export async function putPhoto(path: string, bytes: ArrayBuffer | Uint8Array, contentType: string): Promise<string> {
  const { error } = await storage().upload(path, bytes, { contentType, upsert: true, cacheControl: '31536000' })
  if (error) throw new Error(error.message)
  return photoPublicUrl(path)
}

/**
 * Of these photo URLs, the ones another car still shows. A photo is only
 * deleted from storage when no other row points at it: two rows can share
 * files (a save retried after a lost response creates a second row with the
 * same photos), and deleting the duplicate must not blank the original.
 */
export async function photosUsedByOtherCars(urls: string[], exceptId: number): Promise<Set<string>> {
  const used = new Set<string>()
  if (urls.length === 0) return used
  const { data, error } = await client().select('images').neq('id', exceptId).overlaps('images', urls)
  if (error) throw new Error(error.message)
  const wanted = new Set(urls)
  for (const row of (data ?? []) as { images: string[] | null }[]) {
    for (const u of row.images ?? []) if (wanted.has(u)) used.add(u)
  }
  return used
}

/** Remove photos by their public URL. URLs outside the bucket are ignored. */
export async function removePhotosByUrl(urls: string[]): Promise<void> {
  const marker = `/object/public/${CAR_PHOTO_BUCKET}/`
  const paths = urls
    .map((u) => {
      const i = u.indexOf(marker)
      return i === -1 ? null : decodeURIComponent(u.slice(i + marker.length))
    })
    .filter((p): p is string => Boolean(p))
  if (paths.length === 0) return
  const { error } = await storage().remove(paths)
  if (error) throw new Error(error.message)
}
