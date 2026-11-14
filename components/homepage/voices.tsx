import { Band } from "@/components/system/page-kit"
import { REVIEWS } from "@/components/home/content"
import { SectionHead, TIGHT_BAND } from "./section-head"

/**
 * Three Google reviews, as published.
 *
 * Not three matching cards: the first review carries the band as a pull quote
 * and the other two run beside it as a register. Names, showroom and recency
 * are shown because an unattributed testimonial proves nothing.
 *
 * These were written about the group's Jammu showroom, and each one says so
 * in its attribution. The heading therefore says "customers", not "used-car
 * buyers" — the reviews do not say what was bought, and this band does not
 * claim it for them.
 */
export function Voices() {
  const [lead, ...rest] = REVIEWS

  return (
    <Band ground="ground-2" labelledBy="voices-title" id="voices" className={TIGHT_BAND}>
      <SectionHead
        id="voices-title"
        title="What customers wrote"
        lede="Google reviews of our Jammu showroom, attributed and not rewritten in-house."
      />

      <div className="mt-8 grid grid-cols-1 gap-8 md:mt-12 lg:grid-cols-[1.25fr_1fr] lg:gap-20">
        <figure className="border-t border-line-strong pt-6">
          <blockquote className="font-display text-h3 text-ink md:text-h2">
            <p>&ldquo;{lead.quote}&rdquo;</p>
          </blockquote>
          <figcaption className="mt-4 text-small text-ink-2">
            <span className="text-label text-ink">{lead.name}</span>
            <span className="mx-2">·</span>
            {lead.meta}
            <span className="mx-2">·</span>
            {lead.date}
          </figcaption>
        </figure>

        <div className="border-t border-line">
          {rest.map((review) => (
            <figure key={review.name} className="border-b border-line py-5 md:py-7">
              <blockquote className="text-body text-ink-2">
                <p>&ldquo;{review.quote}&rdquo;</p>
              </blockquote>
              <figcaption className="mt-3 text-small text-ink-2">
                <span className="text-label text-ink">{review.name}</span>
                <span className="mx-2">·</span>
                {review.meta}
                <span className="mx-2">·</span>
                {review.date}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </Band>
  )
}
