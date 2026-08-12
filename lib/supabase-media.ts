/**
 * Supabase Storage Media Resolver for `am_group_files` bucket.
 * Dynamically resolves public media URLs for branches, corporate divisions,
 * brand showrooms, and facilities from Supabase Storage.
 */

const SUPABASE_STORAGE_BASE =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nhceknbaslqdqofefyla.supabase.co"

/**
 * Storage project keys, matching app/api/media/[project]/[...path]/route.ts.
 *   m = media library (the client's photography)
 *   l = lead-data project (legacy branch photography)
 */
export type MediaProject = "m" | "l"

/**
 * Build a same-origin URL for a Supabase Storage object.
 *
 * next/image cannot fetch these hosts directly on any network running
 * DNS64/NAT64: Next rejects the upstream because the hostname also resolves to
 * a synthesised `64:ff9b::/96` address, which it classifies as private. Routing
 * through our own origin skips that check while keeping full next/image
 * optimisation — which matters, because the originals reach 5.8MB.
 * See the route handler for the full reasoning and the allow-list.
 *
 * To serve storage directly instead (no DNS64 on your network, and you would
 * rather skip the hop), return the absolute Supabase URL here and add the host
 * to `images.remotePatterns`.
 */
export function mediaPath(project: MediaProject, objectPath: string): string {
  if (!objectPath) return ""
  const clean = objectPath.replace(/^\/+/, "")
  return `/api/media/${project}/${clean}`
}

export function getSupabaseMediaUrl(path: string): string {
  if (!path) return ""
  if (path.startsWith("/api/media")) return path
  // Absolute URLs are mapped back onto the proxy by host.
  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      const u = new URL(path)
      const marker = "/storage/v1/object/public/am_group_files/"
      const i = u.pathname.indexOf(marker)
      if (i !== -1) {
        const project: MediaProject = u.hostname.startsWith("ehcm") ? "m" : "l"
        return mediaPath(project, u.pathname.slice(i + marker.length))
      }
    } catch {
      /* fall through to returning the input unchanged */
    }
    return path
  }
  return mediaPath("l", path)
}

/**
 * The AM Kia showroom photograph, client-supplied 2026-08-11.
 *
 * Absolute, and pointing at a DIFFERENT Supabase project from the rest of this
 * file (ehcmjypfxucvcvuofozx, not the lead-data project) — so it deliberately
 * bypasses getSupabaseMediaUrl, which builds paths against
 * NEXT_PUBLIC_SUPABASE_URL. See lib/media/storage.ts for the media project.
 *
 * The original is 4229x2506 / 5.8MB. It must only ever be rendered through
 * next/image with a real `sizes` value: the optimiser fetches this once on the
 * server and serves an AVIF variant per breakpoint, so the browser never sees
 * the megabytes.
 */
export const AM_KIA_SHOWROOM = mediaPath("m", "kia/service/untitled-09028.jpg")

export const SUPABASE_MEDIA = {
  heroBg: AM_KIA_SHOWROOM,
  awards: getSupabaseMediaUrl("corporate/awards/trophies.png"),
  divisions: {
    automobile: getSupabaseMediaUrl("branches/central-workshop/workshop-3.webp"),
    petroleum: getSupabaseMediaUrl("branches/petroleum/station-3.jpg"),
    realEstate: getSupabaseMediaUrl("branches/real-estate/complex-2.jpg"),
    retail: getSupabaseMediaUrl("branches/smegamart/storefront.jpg"),
  },
  branches: {
    "jammu-hyundai": {
      exterior: getSupabaseMediaUrl("branches/jammu-hyundai/exterior.webp"),
      banner: getSupabaseMediaUrl("branches/jammu-hyundai/banner.jpg"),
      gallery: [
        getSupabaseMediaUrl("branches/jammu-hyundai/exterior.webp"),
        getSupabaseMediaUrl("branches/jammu-hyundai/banner.jpg"),
        getSupabaseMediaUrl("branches/central-workshop/workshop-1.webp"),
      ],
    },
    "jammu-kia": {
      exterior: AM_KIA_SHOWROOM,
      banner: AM_KIA_SHOWROOM,
      gallery: [
        AM_KIA_SHOWROOM,
        getSupabaseMediaUrl("branches/jammu-kia/exterior.jpg"),
        getSupabaseMediaUrl("branches/jammu-kia/banner.jpg"),
      ],
    },
    "srinagar-hyundai": {
      exterior: getSupabaseMediaUrl("branches/srinagar-hyundai/exterior.jpg"),
      banner: getSupabaseMediaUrl("branches/srinagar-hyundai/banner.jpg"),
      gallery: [
        getSupabaseMediaUrl("branches/srinagar-hyundai/exterior.jpg"),
        getSupabaseMediaUrl("branches/srinagar-hyundai/banner.jpg"),
      ],
    },
    "central-workshop": {
      exterior: getSupabaseMediaUrl("branches/central-workshop/workshop-1.webp"),
      gallery: [
        getSupabaseMediaUrl("branches/central-workshop/workshop-1.webp"),
        getSupabaseMediaUrl("branches/central-workshop/workshop-2.webp"),
        getSupabaseMediaUrl("branches/central-workshop/workshop-3.webp"),
      ],
    },
    petroleum: {
      exterior: getSupabaseMediaUrl("branches/petroleum/station-1.webp"),
      gallery: [
        getSupabaseMediaUrl("branches/petroleum/station-1.webp"),
        getSupabaseMediaUrl("branches/petroleum/station-2.webp"),
        getSupabaseMediaUrl("branches/petroleum/station-3.jpg"),
      ],
    },
    smegamart: {
      exterior: getSupabaseMediaUrl("branches/smegamart/storefront.jpg"),
      gallery: [getSupabaseMediaUrl("branches/smegamart/storefront.jpg")],
    },
    "real-estate": {
      exterior: getSupabaseMediaUrl("branches/real-estate/complex-1.jpg"),
      gallery: [
        getSupabaseMediaUrl("branches/real-estate/complex-1.jpg"),
        getSupabaseMediaUrl("branches/real-estate/complex-2.jpg"),
        getSupabaseMediaUrl("branches/real-estate/complex-3.jpg"),
      ],
    },
    "luxury-showrooms": {
      mg: getSupabaseMediaUrl("branches/luxury-showrooms/mg-showroom.jpg"),
      mgBanner: getSupabaseMediaUrl("branches/luxury-showrooms/mg-banner.jpg"),
    },
    "two-wheelers": {
      honda: getSupabaseMediaUrl("branches/two-wheelers/honda.jpg"),
      bajaj: getSupabaseMediaUrl("branches/two-wheelers/bajaj.jpg"),
      ktm: getSupabaseMediaUrl("branches/two-wheelers/ktm.jpg"),
    },
  },
}
