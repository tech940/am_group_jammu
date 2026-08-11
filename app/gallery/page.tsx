import type { Metadata } from "next"
import { Gallery } from "@/components/ui/gallery"
import { Alert } from "@/components/ui/feedback"
import { canListMedia, foldersOf, listMedia } from "@/lib/media/storage"

export const metadata: Metadata = {
  title: "Photo Gallery | AM Group Showrooms & Facilities",
  description:
    "Photographs of AM Group showrooms, workshops, fuel stations and facilities across Jammu & Kashmir.",
  alternates: { canonical: "/gallery" },
}

// The bucket changes rarely and every miss costs a listing round trip per
// folder, so this revalidates hourly rather than per request.
export const revalidate = 3600

export default async function GalleryPage() {
  const { items, enumerated } = await listMedia()
  const folders = foldersOf(items)

  return (
    <div className="bg-ground">
      <header className="border-b border-line">
        <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-10 md:py-20">
          <p className="text-meta uppercase text-ink-2">Photo library</p>
          <h1 className="mt-4 font-display text-h1 uppercase text-ink">Showrooms &amp; facilities</h1>
          <p className="mt-5 max-w-[60ch] text-body-lg text-ink-2">
            Photographs taken on site across the group&apos;s showrooms, workshops, fuel stations and
            facilities in Jammu &amp; Kashmir.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-10 md:py-16">
        {!enumerated && (
          // Honest about the degraded state rather than presenting one
          // photograph as if it were the whole library.
          <Alert tone="warning" title="Showing a partial library" className="mb-8">
            {canListMedia
              ? "The storage bucket could not be listed, so only confirmed images are shown."
              : "MEDIA_SUPABASE_ANON_KEY is not set, so the bucket cannot be enumerated. Only images with a known path are shown — add the key and the full library appears here with no code change."}
          </Alert>
        )}

        <Gallery items={items} folders={folders} />
      </div>
    </div>
  )
}
