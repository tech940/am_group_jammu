import Link from "next/link"
import { Band } from "@/components/system/page-kit"
import { ArrowGlyph } from "@/components/system/marks"
import { FOUNDED, YEARS_TRADING } from "@/components/home/content"
import { LOCATIONS } from "@/lib/locations"
import { SectionHead, TIGHT_BAND } from "./section-head"

/**
 * Why buy a used car here, and what happens when you do.
 *
 * Four reasons a stranger can check, then the steps of buying. Everything is
 * about used cars in Jammu: the three sites come from lib/locations.ts, the
 * founding year from content.ts, and the in-house services are the ones every
 * location lists (test drives, finance, exchange, RC and insurance transfer).
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
    title: `A dealer since ${FOUNDED}`,
    body: `${YEARS_TRADING} years trading in Jammu & Kashmir. The business will still be here when the car needs something.`,
  },
  {
    title: "The facts are on the listing",
    body: "Listings carry our own photographs, the recorded odometer reading and the asking price, so you know the car before you call anyone.",
  },
  {
    title: "Paperwork done in-house",
    body: "Bank finance, motor insurance and RC transfer are arranged at the dealership, so buying does not mean visiting three offices.",
  },
  {
    title: `${SITES.length} sites in Jammu`,
    body: `${SITES.join(", ")}. Call to confirm which site a car is at, then come and see it.`,
  },
]

const STEPS = [
  { label: "Pick a car", detail: "Browse the live stock list and shortlist what suits your budget." },
  { label: "Call, then come and see it", detail: "We confirm which site the car is at. Inspect it and take a test drive." },
  { label: "Exchange your old car", detail: "If you have one to sell, we value it while you wait." },
  { label: "Finance and insurance", detail: "Arranged at the dealership if you need them." },
  { label: "RC transfer", detail: "Handled in-house once the sale is agreed." },
]

export function Why() {
  return (
    <Band ground="ground-2" labelledBy="why-title" id="why" className={TIGHT_BAND}>
      <SectionHead
        id="why-title"
        title="Bought from a dealer, not a stranger"
        lede="A used car is only as good as the people standing behind it. These are things you can check before you buy."
      />

      <div className="mt-8 grid grid-cols-1 gap-10 md:mt-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
        <ul className="grid grid-cols-1 content-start gap-x-10 gap-y-6 sm:grid-cols-2 md:gap-y-10">
          {REASONS.map((r) => (
            <li key={r.title}>
              <h3 className="font-display text-h3 uppercase text-ink">{r.title}</h3>
              <p className="mt-1.5 text-body text-ink-2">{r.body}</p>
            </li>
          ))}
        </ul>

        <div>
          <h3 className="border-b border-line-strong pb-3 font-display text-h3 uppercase text-ink">
            How buying works
          </h3>
          <ol>
            {STEPS.map((step, i) => (
              <li key={step.label} className="flex gap-4 border-b border-line py-3.5">
                <span className="w-6 shrink-0 font-display text-h3 text-ink-2" data-num>
                  {i + 1}
                </span>
                <span>
                  <span className="block text-h4 text-ink">{step.label}</span>
                  <span className="mt-0.5 block text-small text-ink-2">{step.detail}</span>
                </span>
              </li>
            ))}
          </ol>
          <Link
            href="/locations"
            className="mt-4 inline-flex min-h-11 items-center gap-2 text-button text-accent transition-colors duration-(--duration-1) hover:text-accent-hover"
          >
            Where to see the cars
            <ArrowGlyph />
          </Link>
        </div>
      </div>
    </Band>
  )
}
