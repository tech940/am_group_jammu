import type { Metadata } from "next"
import { Gallery } from "@/components/ui/gallery"
import { Alert } from "@/components/ui/feedback"
import { canListMedia, foldersOf, listMedia } from "@/lib/media/storage"
import { Band, PageHero } from "@/components/system/page-kit"
import { ClosingCall } from "@/components/system/closing-call"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"
import { SCALE } from "@/components/home/content"
import { Grain, LightBeams, RadialWash } from "@/components/system/backdrops"

export const metadata: Metadata = {
  title: "Photo Gallery | AM Group Showrooms & Facilities",
  description:
    "Photographs of AM Group showrooms, workshops, fuel stations and facilities across Jammu & Kashmir — taken on site, not stock imagery.",
  alternates: { canonical: "/gallery" },
}

// The bucket changes rarely and every miss costs a listing round trip per
// folder, so this revalidates hourly rather than per request.
export const revalidate = 3600

export default async function GalleryPage() {
  const { items, enumerated } = await listMedia()
  const folders = foldersOf(items)

  return (
    <>
      <PageHero
        eyebrow="Photo library"
        title={
          <>
            Taken
            <br />
            on site
          </>
        }
        lede="Photographs of the group's own showrooms, workshops, fuel stations and developments across Jammu & Kashmir. None of it is stock imagery, which is why some of it is imperfect."
        image={SUPABASE_MEDIA.branches["jammu-kia"].exterior}
        backdrop={
          <>
            <LightBeams />
            <Grain onDeep />
          </>
        }
        stats={[
          {
            term: "Photographs",
            detail: enumerated ? String(items.length) : "—",
            note: enumerated ? "in the library" : "library not enumerable",
          },
          { term: "Areas", detail: String(folders.length), note: "filterable below" },
          { term: "Cities", detail: String(SCALE.cities.length), note: SCALE.cities.join(" · ") },
          { term: "Stock imagery", detail: "0", note: "every frame is the group's own" },
        ]}
      />

      {/* A grid of photographs is already the busiest thing a page can hold, so
          this band gets a wash and nothing else — no grid, no dots, no ribbons
          competing with the images they sit behind. */}
      <Band
        ground="ground"
        labelledBy="library-title"
        id="library"
        backdrop={
          <>
            <RadialWash at="50% 0%" strength={0.1} />
            <Grain />
          </>
        }
      >
        <h2 id="library-title" className="sr-only">
          The photo library
        </h2>

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
      </Band>

      <ClosingCall
        sourceLabel="gallery-closing"
        heading="See it in person"
        lede="Photographs only go so far. The Jammu site is open Mon–Sat, 9:30 am to 6:30 pm, with no appointment needed."
        image={SUPABASE_MEDIA.branches["jammu-hyundai"].exterior}
      />
    </>
  )
}
