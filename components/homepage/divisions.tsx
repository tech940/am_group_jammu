import Link from "next/link"
import Image from "next/image"
import { Band, Head, Plate } from "@/components/system/page-kit"
import { ScrollDrift } from "@/components/system/scroll-drift"
import { DotMatrix, Grain, WaveRibbons } from "@/components/system/backdrops"
import { RevealGroup, RevealItem } from "@/components/system/reveal"
import { DIVISIONS } from "@/components/home/content"
import { ArrowGlyph } from "@/components/system/marks"

/**
 * The four businesses the company actually publishes.
 *
 * Deliberately NOT four identical cards. The automobile division is the group's
 * largest by an order of magnitude and the reason most people are on this site,
 * so it gets the plate and the width; the other three are a register beside it.
 * Equal weight would be a layout lying about the business.
 */
export function Divisions() {
  const [lead, ...rest] = DIVISIONS

  return (
    <Band
      ground="ground"
      labelledBy="divisions-title"
      id="divisions"
      backdrop={
        <>
          <WaveRibbons id="divisions" tone="light" layers={4} flip />
          <DotMatrix cell={24} strength={0.05} fade="both" />
          <Grain />
        </>
      }
    >
      <Head
        id="divisions-title"
        label="Our businesses"
        title="Four divisions, one company"
        lede="Fuel first, cars second, then property and retail. Each division is a separate operating business with its own sites, staff and appointments."
      />

      <RevealGroup className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        {/* The lead division ------------------------------------------- */}
        <RevealItem className="lg:col-span-7">
        <article>
          {/* The lead photograph moves at a slightly different rate from the
              list beside it — the same depth cue as the hero plate. */}
          <ScrollDrift distance={14}>
            <Plate
              src={lead.image}
              alt={lead.imageAlt}
              caption={lead.figure}
              ratio="aspect-[16/10]"
              sizes="(max-width: 1024px) 100vw, 58vw"
            />
          </ScrollDrift>

          <div className="mt-8 flex items-baseline gap-4">
            <h3 className="font-display text-h2 uppercase text-ink">{lead.name}</h3>
            <span className="text-meta uppercase text-ink-2" data-num>
              Since {lead.since}
            </span>
          </div>

          <p className="mt-4 max-w-[58ch] text-body-lg text-ink-2">{lead.summary}</p>

          <Link
            href={lead.href}
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-button uppercase text-accent-text-light transition-colors duration-(--duration-1) hover:text-accent-hover"
          >
            The automobile division
            <ArrowGlyph />
          </Link>
        </article>
        </RevealItem>

        {/* The other three, as a register ------------------------------ */}
        <RevealItem className="lg:col-span-5">
          <ul className="border-t border-line">
            {rest.map((division) => (
              <li key={division.key}>
                <Link
                  href={division.href}
                  className="group flex items-start gap-5 border-b border-line py-6 transition-colors duration-(--duration-1) hover:bg-ground-2"
                >
                  <span className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-md border border-line bg-ground-2">
                    <Image
                      src={division.image}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-3">
                      <span className="font-display text-h3 uppercase text-ink transition-colors duration-(--duration-1) group-hover:text-accent-text-light">
                        {division.name}
                      </span>
                      <span className="text-meta uppercase text-ink-2" data-num>
                        {/* "c. 2000" — the real-estate year is a stand-in the
                            client has not confirmed, and it is never presented
                            with the certainty of the verified ones. */}
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
        </RevealItem>
      </RevealGroup>
    </Band>
  )
}
