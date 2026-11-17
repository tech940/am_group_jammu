/**
 * Instant updates to the Meta vehicle catalogue. SERVER ONLY.
 *
 * The scheduled feed (/api/feed/meta) is read by Meta at most once an hour, so
 * a car sold at 10:05 could still be advertised until about 11:00. This file
 * closes that gap: when staff mark a car sold, delete it, or put it back on
 * sale in the admin, the change is sent to Meta's Catalog Batch API straight
 * away.
 *
 * WHAT IS SENT, AND WHAT IS NOT. Only availability changes and deletions.
 *   - marked sold, or taken back to draft  ->  UPDATE  availability not_available
 *   - put on sale (again)                  ->  UPDATE  availability available
 *   - deleted                              ->  DELETE
 * New cars and edits are NOT pushed; they reach Meta through the hourly feed.
 * Meta's scheduled-feeds guide warns against creating items through both a
 * feed and the API, and the feed already carries every field of a new car.
 * The values pushed here are the same ones the feed carries, so the two never
 * disagree.
 *
 * SETUP (owner, one time; nothing happens until both are set):
 *   META_CATALOG_ID     the vehicle catalogue's ID, from Commerce Manager
 *   META_CATALOG_TOKEN  a system-user access token from Meta Business
 *                       Settings with the catalog_management permission,
 *                       assigned to that catalogue. A SECRET: never prefix it
 *                       with NEXT_PUBLIC_.
 *   META_GRAPH_VERSION  optional, default v27.0
 *
 * Sources (read 2026-11-17): Meta Marketing API, Catalog Batch API
 * (POST /{catalog_id}/items_batch, item_type VEHICLE), the Automotive
 * Inventory Ads reference (vehicle_id is the item's key; availability is
 * available / not_available), and the scheduled-feeds guide.
 *
 * A failed push is logged and otherwise ignored: the admin's save has already
 * happened, and the next hourly feed fetch makes the same change anyway.
 */

const CATALOG_ID = (process.env.META_CATALOG_ID ?? '').trim()
const TOKEN = (process.env.META_CATALOG_TOKEN ?? '').trim()
const GRAPH_VERSION = (process.env.META_GRAPH_VERSION ?? 'v27.0').trim()

export function metaPushConfigured(): boolean {
  return /^\d{5,30}$/.test(CATALOG_ID) && TOKEN.length > 20
}

export type CatalogChange = 'sold' | 'available' | 'deleted'

interface BatchRequest {
  method: 'UPDATE' | 'DELETE'
  data: Record<string, string>
}

function requestFor(vehicleId: number, change: CatalogChange): BatchRequest {
  const id = String(vehicleId)
  if (change === 'deleted') return { method: 'DELETE', data: { vehicle_id: id } }
  return {
    method: 'UPDATE',
    data: { vehicle_id: id, availability: change === 'sold' ? 'not_available' : 'available' },
  }
}

/**
 * Send one change to Meta. Resolves to a short result for logging; never
 * throws. `allow_upsert` is false so an UPDATE for a car Meta has never had
 * (one the feed skipped for a missing photo, say) does not create a bare,
 * incomplete item.
 */
export async function pushCatalogChange(
  vehicleId: number,
  change: CatalogChange,
): Promise<{ ok: boolean; detail: string }> {
  if (!metaPushConfigured()) return { ok: false, detail: 'not configured' }

  const body = new URLSearchParams({
    item_type: 'VEHICLE',
    allow_upsert: 'false',
    requests: JSON.stringify([requestFor(vehicleId, change)]),
    access_token: TOKEN,
  })

  try {
    const res = await fetch(
      `https://graph.facebook.com/${encodeURIComponent(GRAPH_VERSION)}/${CATALOG_ID}/items_batch`,
      { method: 'POST', body, signal: AbortSignal.timeout(10_000) },
    )
    const json = (await res.json().catch(() => ({}))) as {
      handles?: string[]
      validation_status?: { errors?: { message?: string }[] }[]
      error?: { message?: string; code?: number }
    }
    if (!res.ok || json.error) {
      const detail = `HTTP ${res.status}${json.error ? ` ${json.error.code ?? ''} ${json.error.message ?? ''}` : ''}`.trim()
      console.warn(`[meta-push] car ${vehicleId} ${change}: ${detail}`)
      return { ok: false, detail }
    }
    const errors = (json.validation_status ?? []).flatMap((v) => v.errors ?? [])
    if (errors.length) {
      const detail = errors.map((e) => e.message).join('; ')
      console.warn(`[meta-push] car ${vehicleId} ${change}: ${detail}`)
      return { ok: false, detail }
    }
    return { ok: true, detail: `queued ${json.handles?.[0] ?? ''}`.trim() }
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    console.warn(`[meta-push] car ${vehicleId} ${change}: ${detail}`)
    return { ok: false, detail }
  }
}
