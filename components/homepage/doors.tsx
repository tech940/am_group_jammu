import Link from "next/link"
import { ArrowGlyph, KeyGlyph, TagGlyph } from "@/components/system/marks"
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
 * TWO TILES, NOT A MATCHED PAIR. Buy is the accent fill and Sell is the deep
 * ground: same size, same weight, plainly different, so the choice is read by
 * colour before it is read by label. Each is the correct end of the accent
 * for its own ground (DESIGN.md, The Accent Contrast Rule).
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
            className="group flex min-h-36 flex-col justify-between rounded-md bg-accent p-4 text-on-accent transition-colors duration-(--duration-1) hover:bg-accent-hover md:min-h-48 md:p-7"
          >
            <span className="flex items-start justify-between">
              <span aria-hidden className="text-h1 leading-none">
                <KeyGlyph />
              </span>
              <ArrowGlyph className="mt-1 transition-transform duration-(--duration-2) group-hover:translate-x-1" />
            </span>
            <span>
              <span className="block font-display text-h2 uppercase md:text-h1">Buy a car</span>
              <span className="mt-1 block text-small md:text-body" data-num>
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
            data-ground="deep"
            className="group flex min-h-36 flex-col justify-between rounded-md bg-deep p-4 text-on-deep transition-colors duration-(--duration-1) hover:bg-deep-2 md:min-h-48 md:p-7"
          >
            <span className="flex items-start justify-between">
              <span aria-hidden className="text-h1 leading-none text-accent-bright">
                <TagGlyph />
              </span>
              <ArrowGlyph className="mt-1 transition-transform duration-(--duration-2) group-hover:translate-x-1" />
            </span>
            <span>
              <span className="block font-display text-h2 uppercase md:text-h1">Sell your car</span>
              <span className="mt-1 block text-small text-on-deep-2 md:text-body">
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
