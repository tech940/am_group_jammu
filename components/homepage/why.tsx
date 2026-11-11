import Link from "next/link"
import { Band, Head } from "@/components/system/page-kit"
import { ArrowGlyph } from "@/components/system/marks"
import { CIRCUIT, FOUNDED, YEARS_TRADING, SCALE } from "@/components/home/content"

/**
 * Why buy a used car here, and what happens when you do.
 *
 * This is where the company lives on the homepage now: as four reasons a
 * stranger can check, not as a profile. The full story — divisions, the
 * appointment timeline, the award register — is one link away on /about,
 * which is where someone who wants it will look for it.
 *
 * Left: the reasons, each one a fact from content.ts or lib/locations.ts.
 * Right: the six steps of buying, from CIRCUIT, which lists only services the
 * dealership actually runs.
 */
const REASONS = [
  {
    title: `A dealer since ${FOUNDED}`,
    body: `${YEARS_TRADING} years trading in Jammu & Kashmir, and the authorised dealer for seven vehicle brands today. The business will still be here when the car needs something.`,
  },
  {
    title: "See the car before you talk price",
    body: "All stock is held at one site. Every listing shows the dealership's own photographs, the recorded odometer reading and the asking price.",
  },
  {
    title: "Paperwork done in the building",
    body: "Bank finance, motor insurance and RC transfer are arranged in-house, so buying does not mean visiting three offices.",
  },
  {
    title: "Workshops behind the sale",
    body: `Authorised service workshops with genuine parts, across ${SCALE.cities.join(", ")}.`,
  },
]

export function Why() {
  return (
    <Band ground="ground" labelledBy="why-title" id="why">
      <Head
        id="why-title"
        label="Why AM Group"
        title="Bought from a dealer, not a stranger"
        lede="A used car is only as good as the people standing behind it. These are the things you can check before you buy."
      />

      <div className="mt-14 grid grid-cols-1 gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
        <ul className="grid grid-cols-1 content-start gap-x-10 gap-y-10 border-t border-line-strong pt-8 sm:grid-cols-2">
          {REASONS.map((r) => (
            <li key={r.title}>
              <h3 className="font-display text-h3 uppercase text-ink">{r.title}</h3>
              <p className="mt-2 text-body text-ink-2">{r.body}</p>
            </li>
          ))}
        </ul>

        <div>
          <h3 className="border-b border-line-strong pb-3 text-meta uppercase text-ink-2">
            How buying works
          </h3>
          <ol>
            {CIRCUIT.map((stop, i) => (
              <li key={stop.label} className="flex gap-5 border-b border-line py-4">
                <span className="w-7 shrink-0 font-display text-h3 text-ink-2" data-num>
                  {i + 1}
                </span>
                <span>
                  <span className="block font-display text-h4 uppercase text-ink">
                    {stop.label}
                  </span>
                  <span className="mt-0.5 block text-small text-ink-2">{stop.detail}</span>
                </span>
              </li>
            ))}
          </ol>
          <Link
            href="/about"
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-button uppercase text-accent transition-colors duration-(--duration-1) hover:text-accent-hover"
          >
            About AM Group
            <ArrowGlyph />
          </Link>
        </div>
      </div>
    </Band>
  )
}
