import { linkPhones } from "@/components/system/phone-text"
import type { ReactNode } from "react"
import { Settle } from "@/components/system/motion"

/**
 * The storefront's section opener: a heading and, optionally, one sentence.
 *
 * Deliberately not page-kit's `Head`. That one sets a ruled meta label above
 * every heading, which on a page of seven bands is seven kickers and a lot of
 * height on a phone. A shop's sections are named by what is in them, so the
 * heading stands alone here and the lede sits under it on phones and opposite
 * it on wide screens.
 */
export function SectionHead({
  id,
  title,
  lede,
}: {
  id: string
  title: ReactNode
  lede?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-3">
      <h2 id={id} className="max-w-[22ch] font-display text-h1 uppercase text-ink">
        {title}
      </h2>
      {lede && <p className="max-w-[48ch] text-body text-ink-2 md:text-body-lg">{typeof lede === "string" ? linkPhones(lede, "section-lede") : lede}</p>}
    </div>
  )
}

/**
 * Band padding for the storefront. page-kit's Band ships `py-20 md:py-28`,
 * which made the old homepage very long on a phone; the important modifier is
 * needed because two padding utilities on one element resolve by stylesheet
 * order, not by the order they are written in `className`.
 */
export const TIGHT_BAND = "py-12! md:py-20!"

const STORE_GROUND = {
  ground: "bg-ground text-ink",
  "ground-2": "bg-ground-2 text-ink",
} as const

/**
 * A homepage band: page-kit's `Band` with the storefront's padding, and with
 * its contents in the server HTML as visible markup.
 *
 * It is not page-kit's Band because that one wraps its children in a reveal
 * that ships `opacity:0` and waits for script, which left the car rail, the
 * browse links and the three sites invisible to anything reading the page
 * without running it. The reveal used here (components/system/motion.tsx) adds
 * the same 8px settle only after load and only to bands still below the fold.
 */
export function StoreBand({
  id,
  ground,
  labelledBy,
  children,
}: {
  id?: string
  ground: keyof typeof STORE_GROUND
  /** id of the band's own heading, so the section is a named landmark. */
  labelledBy: string
  children: ReactNode
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={`${STORE_GROUND[ground]} py-12 md:py-20`}>
      <Settle className="relative mx-auto max-w-[1400px] px-5 md:px-10">{children}</Settle>
    </section>
  )
}
