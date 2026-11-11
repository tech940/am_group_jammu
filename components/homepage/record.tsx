import Link from "next/link"
import { Head } from "@/components/system/page-kit"
import { BigWave, GradientGround, Grain } from "@/components/system/backdrops"
import { JourneyRoad } from "./journey-road"
import { JourneyNumbers } from "./journey-numbers"
import { TIMELINE, AWARDS, CLAIMS, FOUNDED, YEARS_TRADING, SCALE } from "@/components/home/content"
import {
  ArrowGlyph,
  BikeGlyph,
  CarGlyph,
  FlagGlyph,
  FuelPumpGlyph,
} from "@/components/system/marks"
import type { Award } from "@/components/home/content"

/**
 * The receipts: every appointment dated, every award dated and placed.
 *
 * The appointments are drawn as a JOURNEY — a serpentine road with a stop per
 * appointment and a marker that drives it once — because that is what they
 * are: one route, driven in order, 1968 to now. The interaction carries the
 * detail (hover/focus/tap a stop for the note and the marque), so the band
 * shows the shape of the story at a glance instead of eight paragraphs.
 *
 * The road exists at `md` and up only. At phone widths a 1400-unit serpentine
 * compresses into scribble, so mobile keeps the vertical spine — the same
 * eight stops read top-to-bottom, which on a phone IS the journey.
 *
 * THE BACKGROUND IS DELIBERATELY QUIET NOW. This band used to carry a
 * parallax photograph, a gradient mesh and the topographic contours; with a
 * road drawn across the whole band that stopped being atmosphere and started
 * being two maps arguing. One wash, grain, and the seams — the road is the
 * picture.
 *
 * AWARDS are not a sequence, so they are not on the road: a register grouped
 * by marque, below, same as before.
 */

/** Awards arrive flat; the register reads better grouped by who gave them. */
function groupByMarque(awards: Award[]) {
  const order: Award["marque"][] = ["Hyundai", "Chevrolet"]
  return order
    .map((marque) => ({ marque, items: awards.filter((a) => a.marque === marque) }))
    .filter((g) => g.items.length > 0)
}

const KIND_GLYPH = {
  fuel: FuelPumpGlyph,
  car: CarGlyph,
  bike: BikeGlyph,
  multi: FlagGlyph,
} as const

export function Record() {
  const latest = TIMELINE[TIMELINE.length - 1].year
  const groups = groupByMarque(AWARDS)

  return (
    <section
      id="record"
      aria-labelledby="record-title"
      className="relative isolate overflow-hidden bg-ground py-24 md:py-32"
    >
      {/* THE wave. The page's one big curve, splitting the services band's
          grey into this band's ice tint — one crest, one trough, full width.
          Every other seam on the page is a straight ground swap now; a wave on
          every edge stops being a shape and becomes a texture. The extra top
          padding is the wave's landing room. */}
      <BigWave side="top" ground="text-ground-2" />
      {/* The ice tint that makes the split read as two COLOURS, not two greys:
          the same two token ends as every gradient on the site, held at the
          strengths measured against ink when the light bands were tuned. */}
      <GradientGround tone="light" angle="176deg" strength={1.1} />
      <Grain />

      <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
        <Head
          id="record-title"
          label="The record"
          title="The route so far"
          lede={`Eight franchise appointments between ${FOUNDED} and ${latest}, driven in order. Stop at any year for what happened there — and below, the manufacturer awards that came with the journey.`}
        />

        {/* The journey — road at md+, spine on phones ------------------- */}
        <div className="mt-10 hidden md:block">
          <JourneyRoad milestones={TIMELINE} />
        </div>

        <ol className="relative mt-4 md:hidden">
          <span
            aria-hidden
            className="absolute bottom-8 left-[3px] top-8 w-px bg-line-strong"
          />
          {TIMELINE.map((milestone) => (
            <li
              key={milestone.year}
              className="relative flex items-start gap-4 py-5 pl-7"
            >
              <span
                aria-hidden
                className="absolute left-[3px] top-[1.95rem] h-px w-3.5 bg-accent"
              />
              <span className="w-14 shrink-0 font-display text-h3 text-ink" data-num>
                {milestone.year}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 font-display text-h4 uppercase text-ink">
                  {(() => {
                    const Kind = KIND_GLYPH[milestone.kind]
                    return <Kind className="h-[1.1em] w-[1.1em] shrink-0 text-ink-2" />
                  })()}
                  {milestone.stage}
                </span>
                <span className="mt-1 block text-small text-ink-2">
                  {milestone.title} — {milestone.note}
                </span>
              </span>
            </li>
          ))}
        </ol>

        {/* The journey in numbers — the old homepage's "Why us" counters, kept
            as content. Two cells are computed or counted from published data;
            the other two are the company's own round marketing figures, and
            their note lines say so instead of dressing them up as
            measurements. The old site's "50+ years" cell was simply stale —
            YEARS_TRADING computes the real number. */}
        <div className="mt-14 md:mt-6">
          <JourneyNumbers
            items={[
              { value: YEARS_TRADING, label: "Years of trust", note: `since ${FOUNDED}` },
              { value: SCALE.outlets, label: "Dealership outlets", note: SCALE.cities.join(" · ") },
              { value: CLAIMS.vehiclesPerYear.value, suffix: CLAIMS.vehiclesPerYear.suffix, label: CLAIMS.vehiclesPerYear.label, note: "company-published figure" },
              { value: CLAIMS.customers.value, suffix: CLAIMS.customers.suffix, label: CLAIMS.customers.label, note: "company-published figure" },
            ]}
          />
        </div>

        {/* Awards — not a sequence, so not on the road ------------------- */}
        <div className="mt-12">
          <div className="grid grid-cols-1 gap-x-20 gap-y-10 lg:grid-cols-2">
            {groups.map((group) => (
              <div key={group.marque}>
                <p className="flex items-baseline justify-between gap-4">
                  <span className="font-display text-h3 uppercase text-accent">
                    {group.marque}
                  </span>
                  <span className="text-meta uppercase text-ink-2" data-num>
                    {group.items.length} awards
                  </span>
                </p>
                <ul className="mt-3 border-t border-line">
                  {group.items.map((award) => (
                    <li
                      key={`${award.title}-${award.year}-${award.place}`}
                      className="flex items-baseline justify-between gap-6 border-b border-line py-3.5"
                    >
                      <span className="min-w-0">
                        <span className="block text-body text-ink">{award.title}</span>
                        <span className="mt-0.5 block text-small text-ink-2">
                          {award.place}
                        </span>
                      </span>
                      <span className="shrink-0 text-small text-ink-2" data-num>
                        {award.year}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Link
            href="/about"
            className="mt-8 inline-flex min-h-11 items-center gap-2 text-button uppercase text-accent transition-colors duration-(--duration-1) hover:text-accent-hover"
          >
            The full award register
            <ArrowGlyph />
          </Link>
        </div>
      </div>
    </section>
  )
}
