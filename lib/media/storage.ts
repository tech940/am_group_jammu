import { createClient } from "@supabase/supabase-js"

/**
 * Media library reader for the `am_group_files` storage bucket.
 *
 * This is a SECOND Supabase project, separate from the one that stores leads:
 * lead data lives in NEXT_PUBLIC_SUPABASE_URL, the photo library lives in
 * MEDIA_SUPABASE_URL. They are kept apart deliberately — the media project only
 * ever needs public read, so it must not be reachable with the service-role key
 * that can read the `leads` table.
 *
 * Objects in the bucket are publicly readable, but Supabase requires an
 * authenticated request to LIST them. Without a key we can still render any
 * path we already know; we just cannot discover new ones. `listMedia()`
 * therefore degrades to the curated manifest below rather than throwing, so a
 * missing key costs discovery, never a broken page.
 */

export const MEDIA_SUPABASE_URL =
  process.env.MEDIA_SUPABASE_URL ?? "https://ehcmjypfxucvcvuofozx.supabase.co"

const MEDIA_BUCKET = "am_group_files"

/** Anon key is sufficient: every read here is public. */
const MEDIA_KEY = process.env.MEDIA_SUPABASE_ANON_KEY ?? process.env.MEDIA_SUPABASE_SERVICE_KEY

export const canListMedia = Boolean(MEDIA_SUPABASE_URL && MEDIA_KEY)

/** Public URL for a path inside the bucket. Accepts an absolute URL unchanged. */
export function mediaUrl(path: string): string {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  const clean = path.replace(/^\/+/, "")
  return `${MEDIA_SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${clean}`
}

export interface MediaItem {
  /** Path within the bucket, e.g. "kia/service/untitled-09028.jpg". */
  path: string
  url: string
  /** Top-level folder — used as the gallery's filter facet. */
  folder: string
  /** Second-level folder, when present. */
  subfolder: string | null
  /** Bytes, when the listing API reported it. */
  size: number | null
  alt: string
}

/**
 * Human-readable alt text from a storage path.
 *
 * Filenames in this bucket are camera exports ("untitled-09028.jpg"), which
 * carry no meaning for a screen reader, so the alt is built from the folder
 * structure instead: "kia/service/..." becomes "AM Kia — service". Real
 * per-image captions should replace this as the client supplies them.
 */
export function altFromPath(path: string): string {
  const parts = path.split("/").filter(Boolean)
  const words = parts.slice(0, -1).map((p) =>
    p
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim(),
  )
  if (words.length === 0) return "AM Group facility photograph"
  const [first, ...rest] = words
  const head = /^(kia|mg|hyundai|tata|bajaj|ktm|honda|chevrolet|triumph)$/i.test(first)
    ? `AM ${first}`
    : first
  return rest.length > 0 ? `${head} — ${rest.join(" · ").toLowerCase()}` : head
}

function toItem(path: string, size: number | null = null): MediaItem {
  const parts = path.split("/").filter(Boolean)
  return {
    path,
    url: mediaUrl(path),
    folder: parts.length > 1 ? parts[0] : "other",
    subfolder: parts.length > 2 ? parts[1] : null,
    size,
    alt: altFromPath(path),
  }
}

/**
 * Paths confirmed to exist in this bucket.
 *
 * Currently one entry, because the bucket cannot be enumerated without a key
 * (see the note at the top of this file). Everything the gallery renders comes
 * from `listMedia()`, so adding MEDIA_SUPABASE_ANON_KEY to the environment
 * turns the full library on with no code change.
 */
const KNOWN_PATHS: string[] = ["kia/service/untitled-09028.jpg"]

const IMAGE_RE = /\.(jpe?g|png|webp|avif|gif)$/i

/**
 * Walk the bucket. Returns the curated manifest when no key is configured.
 * Cached for an hour — the library changes rarely and each miss is a round trip
 * per folder.
 */
export async function listMedia(): Promise<{ items: MediaItem[]; enumerated: boolean }> {
  if (!canListMedia) {
    return { items: KNOWN_PATHS.map((p) => toItem(p)), enumerated: false }
  }

  const supabase = createClient(MEDIA_SUPABASE_URL, MEDIA_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const found: MediaItem[] = []

  async function walk(prefix: string, depth: number): Promise<void> {
    if (depth > 4) return
    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .list(prefix, { limit: 1000, sortBy: { column: "name", order: "asc" } })
    if (error || !data) return

    for (const entry of data) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name
      // Supabase marks folders with a null id.
      if (entry.id === null) {
        await walk(path, depth + 1)
      } else if (IMAGE_RE.test(entry.name)) {
        found.push(toItem(path, (entry.metadata?.size as number | undefined) ?? null))
      }
    }
  }

  try {
    await walk("", 0)
  } catch {
    return { items: KNOWN_PATHS.map((p) => toItem(p)), enumerated: false }
  }

  if (found.length === 0) {
    return { items: KNOWN_PATHS.map((p) => toItem(p)), enumerated: false }
  }
  return { items: found, enumerated: true }
}

/** Distinct top-level folders, for the gallery's filter row. */
export function foldersOf(items: MediaItem[]): { value: string; label: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const i of items) counts.set(i.folder, (counts.get(i.folder) ?? 0) + 1)
  return [...counts.entries()]
    .map(([value, count]) => ({
      value,
      label: value.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      count,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}
