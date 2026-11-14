import Link from "next/link"
import { ArrowGlyph } from "@/components/system/marks"
import { IlloBuy, IlloSell } from "@/components/system/illustrations"
import { Services } from "./services"

/**
 * The two things this site is for — buy a car, sell a car — and the six
 * services around them, on a sheet that rides up over the bottom of the hero
 * photograph.
 *
 * THE SHEET IS THE PAGE, NOT A CARD. It is the page ground with its top
 * corners rounded, so the light page reads as sliding up over the photograph.
 * It has no border and no surface fill of its own, which is what keeps the
 * tiles on it from being cards inside a card.
 *
 * It has to be a SIBLING of the hero, pulled up with a negative margin: the
 * hero is `overflow-hidden isolate` (its photograph sits at a negative
 * z-index), so anything inside it that tried to hang below would be clipped.
 *
 * TWO TILES, NOT A MATCHED PAIR. Buy is the blue fill with a white car; Sell
 * is a white surface with a blue one. Same size, same weight, plainly
 * different, so the choice is read by colour and picture before the label.
 *
 * The counts are live. With the feed down the Buy tile still goes to
 * /inventory but prints no number it cannot stand behind.
 */
export function Doors({
  total,
  priceFrom,
  live,
}: {
  total: number
  /** Lowest asking price in today's stock, in rupees; null when unknown. */
  priceFrom: number | null
  live: boolean
}) {
  const from = live && priceFrom && priceFrom > 0 ? `₹${(priceFrom / 100_000).toFixed(2)} L` : null

  return (
    <section
      aria-labelledby="doors-title"
      className="relative z-10 -mt-6 rounded-t-lg bg-ground md:-mt-10"
    >
      <div className="mx-auto max-w-[1400px] px-4 pb-10 pt-4 md:px-10 md:pb-16 md:pt-8">
        <h2 id="doors-title" className="sr-only">
          Buy or sell a used car
        </h2>

        <div className="grid grid-cols-2 gap-2.5 md:gap-4">
          <Link
            href="/inventory"
            data-ground="deep"
            className="group flex min-h-44 flex-col justify-between overflow-hidden rounded-md bg-accent p-4 text-on-accent transition-colors duration-(--duration-1) hover:bg-accent-hover md:min-h-56 md:flex-row md:items-end md:p-7"
          >
            <IlloBuy tone="blue" className="-mr-2 -mt-1 h-24 w-auto self-end md:order-2 md:h-44" />
            <span>
              <span className="flex items-center gap-2 font-display text-h2 uppercase md:text-h1">
                Buy a car
                <ArrowGlyph className="text-body-lg transition-transform duration-(--duration-2) group-hover:translate-x-1" />
              </span>
              <span className="mt-1 block text-small text-on-deep-2 md:text-body" data-num>
                {live ? (
                  <>
                    {total} in stock
                    {from && (
                      <>
                        <span aria-hidden> · </span>
                        <span className="whitespace-nowrap">from {from}</span>
                      </>
                    )}
                  </>
                ) : (
                  "See what is in stock"
                )}
              </span>
            </span>
          </Link>

          <Link
            href="/sell-your-car"
            className="group flex min-h-44 flex-col justify-between overflow-hidden rounded-md border border-line bg-surface p-4 text-ink shadow-raised transition-colors duration-(--duration-1) hover:border-accent md:min-h-56 md:flex-row md:items-end md:p-7"
          >
            <IlloSell className="-mr-2 -mt-1 h-24 w-auto self-end md:order-2 md:h-44" />
            <span>
              <span className="flex items-center gap-2 font-display text-h2 uppercase md:text-h1">
                Sell your car
                <ArrowGlyph className="text-body-lg text-accent transition-transform duration-(--duration-2) group-hover:translate-x-1" />
              </span>
              <span className="mt-1 block text-small text-ink-2 md:text-body">
                Free valuation while you wait
              </span>
            </span>
          </Link>
        </div>

        <div className="mt-2.5 md:mt-4">
          <Services />
        </div>
      </div>
    </section>
  )
}
