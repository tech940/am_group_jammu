"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { LOCATIONS, formatAddress, formatHours } from "@/lib/locations"
import { REVIEWS, SCALE, YEARS_TRADING, FOUNDED } from "@/components/home/content"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"
import { Chapter, ChapterMark } from "./chapter"
import { useStoryMotion, EASE_OUT } from "./motion"

/* ==========================================================================
   CHAPTER 05 — WHERE WE ARE
   ========================================================================== */

/** Photography that genuinely depicts each addressable site. */
const SITE_PLATE: Record<string, { src: string; alt: string }> = {
  jammu: {
    src: SUPABASE_MEDIA.branches["jammu-hyundai"].exterior,
    alt: "AM Hyundai, the group's flagship site in Jammu",
  },
  srinagar: {
    src: SUPABASE_MEDIA.branches["srinagar-hyundai"].exterior,
    alt: "AM Group's Srinagar site at AM Tower, Hyderpora",
  },
}

/**
 * The turn from TIME to PLACE.
 *
 * This is where the rule stops being a timeline and becomes a road: the
 * vertical thread hands off to a horizontal route that draws between the two
 * addressable sites as the reader scrolls. Same gesture, rotated — which is the
 * one moment on the page where the connective element visibly changes job.
 *
 * IT MAPS TWO SITES, NOT TWENTY-SIX. lib/locations.ts holds exactly two
 * Location records with a real name, street address, hours and map pin. The
 * company publishes 26 outlets, and that figure is stated here as what it is —
 * an attributed group total, typographically separate from the route. Pinning
 * 26 would invent 24 addresses a customer could try to drive to.
 */
export function ChapterPlaces() {
  const { settleProps, reduce } = useStoryMotion()
  const ref = React.useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.4"],
  })
  const draw = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <Chapter id="places" label="Chapter five — where the group is" ground="deep">
      <div className="mx-auto max-w-[1400px] px-5 py-28 md:px-10 md:py-40">
        <ChapterMark index="05" kicker="Where we are" />

        <motion.h2
          {...settleProps(0.05)}
          className="mt-8 max-w-[20ch] font-display text-h1 uppercase text-on-deep"
        >
          Jammu to Srinagar
        </motion.h2>

        <motion.p {...settleProps(0.12)} className="mt-6 max-w-[54ch] text-body-lg text-on-deep-2">
          Two addressable sites, {SCALE.outlets} outlets across the union territory, and about
          270&nbsp;km of National Highway 44 between the two cities the group answers the phone in.
        </motion.p>

        {/* The route. One thin path drawing across the viewport — the rule,
            turned on its side. */}
        {/* `relative` is required, not cosmetic: framer's useScroll measures
            offsets against this element and warns (and mis-measures) when the
            target is statically positioned. */}
        <div ref={ref} className="relative mt-16 md:mt-24">
          {/* The route is drawn in SVG but LABELLED IN HTML.
              A viewBox of 0 0 1000 80 on a w-full svg scales the whole
              coordinate system by (width / 1000) — measured 26.8px tall at a
              375px viewport, which rendered fontSize="11" at roughly 3.7px.
              SVG text cannot opt out of that scaling, so the labels live
              outside the svg where 11px means 11px. */}
          <svg
            viewBox="0 0 1000 24"
            className="w-full"
            preserveAspectRatio="none"
            style={{ height: 24 }}
            role="img"
            aria-label="Route between the Jammu and Srinagar sites along National Highway 44"
          >
            <line x1="6" y1="12" x2="994" y2="12" className="stroke-current opacity-20" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <motion.line
              x1="6"
              y1="12"
              x2="994"
              y2="12"
              className="stroke-accent"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              style={reduce ? { pathLength: 1 } : { pathLength: draw }}
            />
          </svg>

          {/* Station dots and labels, in HTML so type stays on the ramp. */}
          <div className="relative -mt-[18px] flex items-start justify-between">
            {[LOCATIONS[0]?.city ?? "Jammu", LOCATIONS[1]?.city ?? "Srinagar"].map((city, i) => (
              <span key={city} className={i === 0 ? "flex flex-col items-start gap-2" : "flex flex-col items-end gap-2"}>
                <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-accent" />
                <span className="text-meta uppercase text-on-deep">{city}</span>
              </span>
            ))}
            <span aria-hidden className="absolute left-1/2 top-0 -translate-x-1/2 text-meta uppercase text-on-deep-2">
              NH&nbsp;44
            </span>
          </div>
        </div>

        {/* The two sites, with real NAP. */}
        <div className="mt-16 grid gap-12 md:mt-24 lg:grid-cols-2 lg:gap-16">
          {LOCATIONS.map((loc, i) => {
            const plate = SITE_PLATE[loc.slug]
            return (
              <motion.article
                key={loc.slug}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-12% 0px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: EASE_OUT }}
              >
                {plate && (
                  <figure className="relative aspect-[3/2] overflow-hidden border border-line-on-deep">
                    <Image
                      src={plate.src}
                      alt={plate.alt}
                      fill
                      sizes="(max-width:1024px) 100vw, 45vw"
                      loading="lazy"
                      className="object-cover"
                    />
                  </figure>
                )}

                <div className="mt-6 flex items-baseline gap-4">
                  <span className="text-meta uppercase text-accent" data-num>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-h2 uppercase leading-none text-on-deep">
                    {loc.city}
                  </h3>
                  {loc.isPrimary && (
                    <span className="text-meta uppercase text-on-deep-2">Flagship</span>
                  )}
                </div>

                <address className="mt-4 max-w-[44ch] not-italic text-body leading-relaxed text-on-deep-2">
                  {formatAddress(loc)}
                  <br />
                  {loc.landmark}
                  <br />
                  <span className="text-small">Open {formatHours(loc)}</span>
                </address>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={loc.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-track-location="story-places"
                    className="inline-flex h-11 items-center rounded-sm bg-accent px-5 text-button text-on-accent transition-colors duration-(--duration-1) hover:bg-accent-hover"
                  >
                    Directions
                  </a>
                  <Link
                    href={`/locations/${loc.slug}`}
                    className="inline-flex h-11 items-center rounded-sm border border-line-on-deep px-5 text-button text-on-deep transition-colors duration-(--duration-1) hover:bg-ground hover:text-ink"
                  >
                    This showroom
                  </Link>
                </div>
              </motion.article>
            )
          })}
        </div>

        <motion.p {...settleProps()} className="mt-14 max-w-[64ch] text-meta uppercase text-on-deep-2">
          {SCALE.outlets} outlets is the group&apos;s own published figure. The two sites above are
          the ones with a full published address — see all locations for the rest.
        </motion.p>
      </div>
    </Chapter>
  )
}

/* ==========================================================================
   CHAPTER 06 — THE PEOPLE
   ========================================================================== */

/**
 * The people chapter, without a single face — because there is not one
 * photograph of a person anywhere in this project, and inventing staff is
 * explicitly banned by PRODUCT.md.
 *
 * What IS real: three verbatim Google reviews in which customers name the
 * people who served them. That is stronger evidence of the human side than a
 * commissioned portrait would be — it is the customers' own words, and the
 * staff are named by the people they sold to.
 *
 * The mood shifts here deliberately: warm ground, generous measure, no
 * technical annotation. After five chapters of dark grounds and drawn lines
 * this should feel like the room lighting up.
 */
export function ChapterPeople() {
  const { settleProps, reduce } = useStoryMotion()

  return (
    <Chapter id="people" label="Chapter six — the people" ground="ground-2">
      <div className="mx-auto max-w-[1400px] px-5 py-28 md:px-10 md:py-40">
        <ChapterMark index="06" kicker="The people" className="text-ink" />

        <motion.h2
          {...settleProps(0.05)}
          className="mt-8 max-w-[20ch] font-display text-h1 uppercase text-ink"
        >
          One family, {YEARS_TRADING} years, the same counter
        </motion.h2>

        <motion.p {...settleProps(0.12)} className="mt-6 max-w-[56ch] text-body-lg text-ink-2">
          The group has traded under its own name since {FOUNDED} — the same family, answering for
          every appointment it has ever held. Below is what that looks like from the other side of
          the desk.
        </motion.p>

        <ul className="mt-16 grid gap-10 md:mt-24 lg:grid-cols-3 lg:gap-12">
          {REVIEWS.map((r, i) => (
            <motion.li
              key={r.name}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: EASE_OUT }}
              className="border-t border-line pt-6"
            >
              <blockquote className="text-body-lg leading-relaxed text-ink">
                &ldquo;{r.quote}&rdquo;
              </blockquote>
              <footer className="mt-5">
                <p className="text-label text-ink">{r.name}</p>
                <p className="mt-1 text-meta uppercase text-ink-2">
                  {r.meta} · {r.date}
                </p>
              </footer>
            </motion.li>
          ))}
        </ul>

        <motion.p {...settleProps()} className="mt-12 max-w-[62ch] text-meta uppercase text-ink-2">
          Verbatim from Google reviews. The advisors these customers name — Rahida, Sheetal,
          Shivani — work on the Jammu floor.
        </motion.p>
      </div>
    </Chapter>
  )
}
