import type { ReactNode } from "react"
import Image from "next/image"
import { AM_KIA_SHOWROOM } from "@/lib/supabase-media"

/**
 * The storefront opener: the group's own showroom photograph, the two-stop
 * scrim, and ONE frosted panel holding everything the visitor reads.
 *
 * Same material and classes as page-kit's PageHero (`.photo-scrim`, `.glass`)
 * — this is the treatment the managing director asked to keep — without its
 * ruled eyebrow and at a height that suits a phone. The site header reserves
 * its own 64px (components/system/site-nav.tsx), so this band does not pad for
 * it. The top padding is there to show the photograph above the panel, and
 * the bottom leaves room for whatever sheet the page slides up over it.
 *
 * One panel, not several: blur is charged by painted area (DESIGN.md, Glass
 * rule 4), and inputs inside the panel sit on the plain surface colour.
 *
 * The photograph is decorative here — it is the ground, not content — so it
 * carries an empty alt and the wrapper is hidden from assistive tech.
 */
export function PhotoHero({
  labelledBy,
  overlap = false,
  children,
}: {
  /** id of the H1 inside `children`. */
  labelledBy: string
  /** Leave extra room at the bottom for a sheet that overlaps this band. */
  overlap?: boolean
  children: ReactNode
}) {
  return (
    <section
      aria-labelledby={labelledBy}
      data-ground="deep"
      className="relative isolate overflow-hidden bg-deep-2"
    >
      <div aria-hidden className="absolute inset-0 -z-10">
        <Image
          src={AM_KIA_SHOWROOM}
          alt=""
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="photo-scrim absolute inset-0" />
      </div>

      <div
        className={`relative mx-auto max-w-[1400px] px-4 pt-16 md:px-10 md:pt-20 ${
          overlap ? "pb-12 md:pb-28" : "pb-6 md:pb-16"
        }`}
      >
        <div className="glass max-w-[640px] p-5 md:p-9">{children}</div>
      </div>
    </section>
  )
}
