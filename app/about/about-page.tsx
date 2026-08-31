import Link from "next/link"
import Image from "next/image"
import { Band, Head, PageHero, Plate, RegisterRow } from "@/components/system/page-kit"
import { ClosingCall } from "@/components/system/closing-call"
import { ArrowGlyph } from "@/components/system/marks"
import {
  DotMatrix,
  GlowOrbs,
  GradientGround,
  GradientMesh,
  GradientSeam,
  Grain,
  GridLines,
  RadialWash,
  TopoLines,
  WaveRibbons,
} from "@/components/system/backdrops"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"
import {
  FOUNDED,
  YEARS_TRADING,
  SCALE,
  TIMELINE,
  DIVISIONS,
  AWARDS_HYUNDAI,
  AWARDS_CHEVROLET,
} from "@/components/home/content"

/**
 * The group's own page.
 *
 * Rebuilt from a fully client-side component that hardcoded every fact it
 * stated. Three classes of defect went with it:
 *
 * 1. `"use client"` at the top, so the narrative, the milestone list and both
 *    award tables — the entire reason this page ranks — reached the browser as
 *    a hydration payload rather than as HTML.
 * 2. Thirteen `amgroupind.com/wp-content/...` image URLs. That WordPress site is
 *    being decommissioned; every one of them becomes a 404 at cutover. The
 *    marque artwork now comes from /public/marques and the photography from
 *    Supabase, both of which this app actually owns.
 * 3. Hardcoded "55+ years" and "26+" — one of them already wrong, and both
 *    duplicating figures that live in content.ts. Nothing here is typed twice
 *    any more.
 *
 * BACKDROP SIGNATURE: contours and registers. This is the page about where the
 * company came from, so the geography runs through it — topographic lines in the
 * opener and again under the award register, with grid on the milestone table
 * because a timeline of dated appointments is a table. No two routes share a
 * combination; see DESIGN.md, Backdrops.
 */
export function AboutPage() {
  const awards = AWARDS_HYUNDAI.length + AWARDS_CHEVROLET.length

  return (
    <>
      <PageHero
        eyebrow={`Jammu & Kashmir · since ${FOUNDED}`}
        title={
          <>
            The house that
            <br />
            fuel built
          </>
        }
        lede={`AM Group began with a Hindustan Petroleum forecourt in Jammu in ${FOUNDED} and an Indian Oil appointment nine years later. The cars came in 2004. Everything since has been built on the same two things: appointments we can date, and numbers we publish.`}
        image={SUPABASE_MEDIA.branches["jammu-hyundai"].exterior}
        caption="AM Hyundai, Jammu — appointed 2008, the group's largest car business."
        backdrop={
          <>
            <TopoLines tone="deep" strength={0.16} />
            <GlowOrbs orbs={[{ at: "84% 24%", size: "34%", strength: 0.2 }]} />
            <Grain onDeep />
          </>
        }
        stats={[
          { term: "Trading since", detail: String(FOUNDED), note: `${YEARS_TRADING} years` },
          {
            term: "Dealership outlets",
            detail: String(SCALE.outlets),
            note: SCALE.cities.join(" · "),
          },
          { term: "Vehicle franchises", detail: "7", note: "plus Chevrolet, held 2004–2017" },
          {
            term: "Manufacturer awards",
            detail: String(awards),
            note: "each dated and placed",
          },
        ]}
      />

      {/* The narrative ------------------------------------------------- */}
      <Band
        ground="ground"
        labelledBy="story-title"
        id="story"
        backdrop={
          <>
            <WaveRibbons id="about-story" tone="light" layers={4} flip />
            <Grain />
          </>
        }
      >
        <Head
          id="story-title"
          label="The group"
          title="One company, four businesses"
          lede="Written from the company's own published record. Where a year has not been published, it is marked as an estimate rather than presented as fact."
        />

        <div className="mt-14 grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div className="space-y-6 text-body-lg text-ink-2">
            {/* Template literals, not JSX text with interpolations. JSX drops the
                whitespace between an expression container and the text that
                follows it on the same line, which silently rendered
                "26dealership outlets" and "1968with a dealership". */}
            <p>
              {`AM Group runs ${SCALE.outlets} dealership outlets across the union territory of Jammu & Kashmir, covering both passenger vehicles and two-wheelers. Alongside them the group operates petroleum retail, commercial and residential development, and — since 2025 — organised retail.`}
            </p>
            <p>
              {`It started in ${FOUNDED} with a dealership for Hindustan Petroleum Corporation gas stations and kerosene oil. Indian Oil followed in 1977. The first passenger-car franchise, Chevrolet, arrived in 2004; AM Hyundai opened in 2008 and remains the group's largest car business to this day.`}
            </p>
            <p>
              2024 was the broadest single year of expansion since the company was
              founded: Bajaj, Kia and MG all appointed inside twelve months. The full
              sequence is below, with the year of every appointment.
            </p>
          </div>

          {/* The "central-workshop" key holds showroom photography, not workshop
              photography — see lib/supabase-media.ts. Captioned for what the
              picture actually shows. */}
          <Plate
            src={SUPABASE_MEDIA.branches["central-workshop"].exterior}
            alt="An AM Group dealership building in Jammu, cars visible through the glazing"
            caption="AM Group dealership, Jammu — showroom and authorised service in one building."
            ratio="aspect-[4/3]"
            sizes="(max-width: 1024px) 100vw, 45vw"
          />
        </div>
      </Band>

      {/* Milestones ----------------------------------------------------- */}
      {/* A timeline of dated appointments is a table, so it gets the grid — the
          same reasoning as the franchise register on the homepage. */}
      <Band
        ground="ground-2"
        labelledBy="milestones-title"
        id="milestones"
        backdrop={
          <>
            <GridLines cell={52} strength={0.04} fade="both" />
            <RadialWash at="88% 6%" strength={0.12} />
            <Grain />
          </>
        }
      >
        <Head
          id="milestones-title"
          label="Timeline of appointments"
          title={`${TIMELINE.length} appointments, ${FOUNDED} to ${TIMELINE[TIMELINE.length - 1].year}`}
          lede="Every marque the group has been appointed to represent, in the order it happened. The artwork is each manufacturer's own and is never recoloured."
        />

        <ol className="mt-14 grid grid-cols-1 gap-x-16 border-t border-line md:grid-cols-2">
          {TIMELINE.map((milestone) => (
            <li
              key={milestone.year}
              className="flex items-start gap-5 border-b border-line py-6"
            >
              <span className="w-14 shrink-0 font-display text-h2 text-ink" data-num>
                {milestone.year}
              </span>

              {milestone.mark && (
                <span className="relative hidden h-11 w-20 shrink-0 rounded-sm border border-line bg-surface sm:block">
                  <Image
                    src={milestone.mark}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-contain p-2"
                  />
                </span>
              )}

              <span className="min-w-0 flex-1">
                <span className="block font-display text-h3 uppercase text-ink">
                  {milestone.title}
                </span>
                <span className="mt-1 block text-small text-ink-2">{milestone.note}</span>
              </span>
            </li>
          ))}
        </ol>
      </Band>

      {/* Divisions ------------------------------------------------------ */}
      <Band
        ground="ground"
        labelledBy="divisions-title"
        id="divisions"
        backdrop={
          <>
            <GradientGround tone="light" angle="168deg" strength={0.8} />
            <DotMatrix cell={26} strength={0.05} fade="both" />
            <Grain />
          </>
        }
      >
        <Head
          id="divisions-title"
          label="Our businesses"
          title="Four divisions"
          lede="Each is a separate operating business with its own sites and staff. Follow any of them for the detail."
        />

        <ul className="mt-14 grid grid-cols-1 gap-x-16 border-t border-line md:grid-cols-2">
          {DIVISIONS.map((division) => (
            <li key={division.key}>
              <Link
                href={division.href}
                className="group flex items-start gap-5 border-b border-line py-6 transition-colors duration-(--duration-1) hover:bg-ground-2"
              >
                <span className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-md border border-line bg-ground-2">
                  <Image src={division.image} alt="" fill sizes="80px" className="object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-3">
                    <span className="font-display text-h3 uppercase text-ink transition-colors duration-(--duration-1) group-hover:text-accent">
                      {division.name}
                    </span>
                    <span className="text-meta uppercase text-ink-2" data-num>
                      {/* "c. 2000" — the real-estate year is a stand-in the client
                          has not confirmed, and it is never presented with the
                          certainty of the verified ones. */}
                      Since {division.sinceApprox ? "c. " : ""}
                      {division.since}
                    </span>
                  </span>
                  <span className="mt-2 block text-body text-ink-2">{division.summary}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Band>

      {/* Awards --------------------------------------------------------- */}
      <Band
        ground="deep"
        labelledBy="awards-title"
        id="awards"
        backdrop={
          <>
            <GradientMesh tone="deep" />
            <TopoLines tone="deep" />
            <GradientSeam side="top" ground="bg-ground" />
            <GradientSeam side="bottom" ground="bg-deep-2" />
            <Grain onDeep />
          </>
        }
      >
        <Head
          onDeep
          id="awards-title"
          label="Awards &amp; recognition"
          title="Dated, placed, checkable"
          lede="The complete register as the manufacturers awarded it — every entry with the year and the city it was given in. Nothing here is summarised as a badge count."
        />

        <div className="mt-14 grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-20">
          <div className="panel p-6 md:p-8">
            <h3 className="text-meta uppercase text-on-deep-2">
              Hyundai · {AWARDS_HYUNDAI.length} awards
            </h3>
            <ul className="mt-5 border-t border-line-on-deep">
              {AWARDS_HYUNDAI.map((award) => (
                <RegisterRow
                  onDeep
                  key={`${award.title}-${award.year}-${award.place}`}
                  primary={award.title}
                  secondary={award.place}
                  trailing={award.year}
                />
              ))}
            </ul>
          </div>

          <div className="panel p-6 md:p-8">
            <h3 className="text-meta uppercase text-on-deep-2">
              Chevrolet · {AWARDS_CHEVROLET.length} awards
            </h3>
            <ul className="mt-5 border-t border-line-on-deep">
              {AWARDS_CHEVROLET.map((award) => (
                <RegisterRow
                  onDeep
                  key={`${award.title}-${award.year}-${award.place}`}
                  primary={award.title}
                  secondary={award.place}
                  trailing={award.year}
                />
              ))}
            </ul>
            <p className="mt-6 text-small text-on-deep-2">
              AM Group held the Chevrolet franchise from 2004 until General Motors left
              India in 2017, and still honours service on those cars. It is not a current
              appointment.
            </p>

            <Link
              href="/automobile"
              className="mt-7 inline-flex min-h-11 items-center gap-2 text-button uppercase text-accent-bright transition-colors duration-(--duration-1) hover:text-on-deep"
            >
              The automobile division
              <ArrowGlyph />
            </Link>
          </div>
        </div>
      </Band>

      <ClosingCall
        sourceLabel="about-closing"
        heading="Come and see the place"
        lede={`${YEARS_TRADING} years of it is on the N-H 1 Bye-Pass in Jammu. Mon–Sat, 9:30 am to 6:30 pm.`}
        image={SUPABASE_MEDIA.branches["srinagar-hyundai"].exterior}
      />
    </>
  )
}
