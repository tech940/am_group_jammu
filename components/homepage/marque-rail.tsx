import Link from "next/link"
import Image from "next/image"
import { ScrollDrift } from "@/components/system/scroll-drift"
import { Grain } from "@/components/system/backdrops"
import { FRANCHISES, TIMELINE } from "@/components/home/content"

/**
 * The marque rail — the trust strip under the hero, rebuilt from the old
 * site's Elementor logo carousel.
 *
 * What was kept from that carousel: the idea. A row of manufacturer marks
 * directly under the opening claim is the classic proof strip, and it is the
 * one thing the old homepage did that this one did not.
 *
 * What was NOT kept, and why:
 *  - The auto-playing infinite loop. A marquee is a loop that never stops,
 *    which the motion rules ban outright — and it makes the logos unreadable
 *    at exactly the moment someone tries to read one. Movement here is
 *    scroll-linked instead: the rail drifts gently sideways as the reader
 *    scrolls past it, and stands still the moment they do.
 *  - The wp-content image URLs. That WordPress site is being decommissioned;
 *    every mark here is the self-hosted artwork under /public/marques.
 *  - Hyundai Mobis. The old carousel included it, but it is a B2B parts
 *    distribution relationship, not one of the published franchise
 *    appointments this site documents — nothing on this page should show a
 *    mark the register below cannot account for.
 *
 * The row derives from TIMELINE rather than carrying its own list, so a
 * marque cannot appear here that the journey and the register do not know
 * about. Dark artwork on light chips, never recoloured — a trademark is not
 * ours to restyle.
 */
/** TIMELINE rows are marque-level; resolve each to its franchise page. The
    combined 2024 row (Bajaj · Kia · MG) has three pages, so it goes to the
    division hub that lists all of them. */
function hrefFor(title: string, kind: string): string {
  if (kind === "fuel") return "/hp-indian-oil"
  if (kind === "multi") return "/automobile"
  const match = FRANCHISES.find((f) => title.startsWith(f.name) && f.slug)
  return match?.slug ? `/${match.slug}` : "/automobile"
}

export function MarqueRail() {
  const marques = TIMELINE.filter((m) => m.mark)

  return (
    <section
      aria-label="The group's franchise marques"
      data-ground="deep"
      className="relative isolate overflow-hidden border-t border-line-on-deep bg-deep-2 py-8 md:py-10"
    >
      <Grain onDeep />

      <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
        <p className="text-meta uppercase text-on-deep-2">
          {/* SEVEN current — Chevrolet's mark is shown because its appointment
              is part of the record, and the register band dates its exit. */}
          Eight appointments since 1968
        </p>

        {/* The drift: ±24px of sideways travel across the strip's trip
            through the viewport. Direct manipulation, zero under reduce. */}
        <ScrollDrift axis="x" distance={24} className="mt-5">
          <ul className="flex flex-wrap items-center gap-3 md:flex-nowrap md:justify-between md:gap-4">
            {marques.map((marque) => (
              <li key={marque.year} className="shrink-0">
                <Link
                  href={hrefFor(marque.title, marque.kind)}
                  aria-label={`${marque.title} — appointed ${marque.year}`}
                  className="group block rounded-sm border border-line-on-deep bg-ground p-2.5 transition-colors duration-(--duration-1) hover:border-accent-bright/60"
                >
                  <span className="relative block h-9 w-20 md:h-10 md:w-24">
                    <Image
                      src={marque.mark!}
                      alt={marque.title}
                      fill
                      sizes="96px"
                      className="object-contain"
                    />
                  </span>
                  <span className="mt-1.5 block text-center text-meta uppercase text-ink-2" data-num>
                    {marque.year}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </ScrollDrift>
      </div>
    </section>
  )
}
