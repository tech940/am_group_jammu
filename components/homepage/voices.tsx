import { Band, Head } from "@/components/system/page-kit"
import { RevealGroup, RevealItem } from "@/components/system/reveal"
import { GradientGround, Grain, WaveField } from "@/components/system/backdrops"
import { REVIEWS } from "@/components/home/content"

/**
 * Three Google reviews, verbatim.
 *
 * Not three matching cards: the longest review carries the band as a pull
 * quote and the other two run beside it as a register. Names, branch and
 * recency are shown because an unattributed testimonial proves nothing — and
 * these are real, which is the only reason they are worth the space.
 */
export function Voices() {
  const [lead, ...rest] = REVIEWS

  return (
    <Band
      ground="ground-2"
      labelledBy="voices-title"
      id="voices"
      backdrop={
        <>
          <GradientGround tone="light" angle="200deg" strength={0.9} />
          <WaveField tone="light" lines={9} amplitude={26} fade="both" />
          <Grain />
        </>
      }
    >
      <Head
        id="voices-title"
        label="Customer reviews"
        title="What buyers actually wrote"
        lede="Published reviews from Google, quoted in full and attributed. Nothing here is edited for length or written in-house."
      />

      <RevealGroup className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-20">
        <RevealItem>
        <figure className="border-t border-line-strong pt-8">
          <blockquote className="font-display text-h2 leading-tight text-ink">
            <p>&ldquo;{lead.quote}&rdquo;</p>
          </blockquote>
          <figcaption className="mt-6 text-small text-ink-2">
            <span className="text-label text-ink">{lead.name}</span>
            <span className="mx-2 text-ink-2">·</span>
            {lead.meta}
            <span className="mx-2 text-ink-2">·</span>
            {lead.date}
          </figcaption>
        </figure>
        </RevealItem>

        <RevealItem className="border-t border-line">
          {rest.map((review) => (
            <figure key={review.name} className="border-b border-line py-7">
              <blockquote className="text-body text-ink-2">
                <p>&ldquo;{review.quote}&rdquo;</p>
              </blockquote>
              <figcaption className="mt-4 text-small text-ink-2">
                <span className="text-label text-ink">{review.name}</span>
                <span className="mx-2 text-ink-2">·</span>
                {review.meta}
                <span className="mx-2 text-ink-2">·</span>
                {review.date}
              </figcaption>
            </figure>
          ))}
        </RevealItem>
      </RevealGroup>
    </Band>
  )
}
