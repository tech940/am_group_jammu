import type { ReactNode } from "react"

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
      {lede && <p className="max-w-[48ch] text-body text-ink-2 md:text-body-lg">{lede}</p>}
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
