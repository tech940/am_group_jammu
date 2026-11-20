import Link from "@/components/system/intent-link"
import { ArrowGlyph } from "@/components/system/marks"
import { IlloChoose, IlloDrive, IlloPapers } from "@/components/system/illustrations"
import { GROUP_ORIGIN } from "@/app/locations/about-facts"
import { LOCATIONS } from "@/lib/locations"
import { SectionHead } from "./section-head"

/**
 * Why buy a used car here, and what happens when you do.
 *
 * Four reasons a stranger can check, then the steps of buying. Everything is
 * about used cars in Jammu: the three sites come from lib/locations.ts, the
 * 1968 sentence from app/locations/about-facts.ts, and the in-house services
 * are the ones every location lists (test drives, finance assistance,
 * exchange, RC and insurance transfer), in that file's words: no bank, no new
 * insurance policy and no promise about the future is named.
 *
 * WHAT 1968 IS. The year the GROUP started, as a fuel retailer. It is not the
 * year it began selling cars (the first car franchise came decades later, and
 * the used-car business later still). GROUP_ORIGIN says exactly that, and is
 * the same text /inventory, /locations and llms.txt print. Add the
 * car-dealing year only when the company supplies it.
 *
 * WHAT IS NOT HERE ANY MORE. The old band named the group's other cities, its
 * new-car franchises and its service workshops, and printed content.ts's
 * CIRCUIT in full — which includes "New across 7 current franchises". None of
 * that is this site's business now, so the steps are written here for a
 * used-car buyer instead of being filtered out of a group-wide list.
 */
const SITES = LOCATIONS.map((l) => l.shortName)

const REASONS = [
  {
    title: "Part of AM Group",
    body: GROUP_ORIGIN,
  },
  {
    title: "The facts are on the listing",
    body: "Listings carry our own photographs, the odometer reading and the asking price, so you know the car before you call anyone.",
  },
  {
    title: "Paperwork done in-house",
    body: "Finance help and the RC and insurance transfer are handled at the dealership, so buying does not mean visiting three offices.",
  },
  {
    title: `${SITES.length} sites in Jammu`,
    body: `${SITES.join(", ")}. Call to confirm which site a car is at, then come and see it.`,
  },
]

const STEPS = [
  {
    Illo: IlloChoose,
    label: "Pick a car",
    detail: "Browse the live stock list and shortlist what suits your budget.",
  },
  {
    Illo: IlloDrive,
    label: "Come and drive it",
    detail: "Call first and we confirm which site the car is at. Inspect it and take a test drive.",
  },
  {
    Illo: IlloPapers,
    label: "We do the paperwork",
    detail: "Exchange valuation, finance help, and the RC and insurance transfer, all at the dealership.",
  },
]

export function Why() {
  return (
    <section aria-labelledby="why-title" id="why" className="sky-ground relative py-12 md:py-24">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <SectionHead
          id="why-title"
          title="How buying works"
          lede="Three steps, and you deal with one dealership the whole way through."
        />

        {/* The steps ARE a sequence, so they are numbered. */}
        <ol className="mt-8 grid grid-cols-1 gap-3 md:mt-12 md:grid-cols-3 md:gap-5">
          {STEPS.map(({ Illo, label, detail }, i) => (
            <li
              key={label}
              className="glass flex items-center gap-4 p-4 md:flex-col md:items-start md:gap-0 md:p-7"
            >
              <Illo className="h-24 w-auto shrink-0 md:h-44" />
              <div className="md:mt-5">
                <h3 className="flex items-baseline gap-2.5 font-display text-h3 uppercase text-ink md:text-h2">
                  <span className="text-accent" data-num>
                    {i + 1}
                  </span>
                  {label}
                </h3>
                <p className="mt-1.5 text-body text-ink-2">{detail}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* An h2, not an h3 under "How buying works": it opens its own list. */}
        <h2 className="mt-12 font-display text-h2 uppercase text-ink md:mt-20">
          Bought from a dealer, not a stranger
        </h2>
        <ul className="mt-6 grid grid-cols-1 gap-x-10 gap-y-6 border-t border-line-strong pt-6 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((r) => (
            <li key={r.title}>
              <h3 className="text-h4 text-ink">{r.title}</h3>
              <p className="mt-1.5 text-body text-ink-2">{r.body}</p>
            </li>
          ))}
        </ul>

        <Link
          href="/locations"
          className="mt-6 inline-flex min-h-11 items-center gap-2 text-button text-accent transition-colors duration-(--duration-1) hover:text-accent-hover"
        >
          Where to see the cars
          <ArrowGlyph />
        </Link>
      </div>
    </section>
  )
}
