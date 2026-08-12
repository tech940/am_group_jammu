"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { FOUNDED, TIMELINE, YEARS_TRADING } from "@/components/home/content"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"
import { Chapter, ChapterMark } from "./chapter"
import { useStoryMotion } from "./motion"

/* ==========================================================================
   CHAPTER 01 — WHERE IT STARTED
   ========================================================================== */

/**
 * 1968, carried typographically.
 *
 * The plate is a PETROLEUM FORECOURT, not the Kia showroom the hero uses. Two
 * reasons, and the second is the better one:
 *
 *  1. Reusing the hero frame here meant the same photograph twice in the first
 *     two screens.
 *  2. It is simply the truer picture. The group did not begin with cars — it
 *     began in 1968 with Hindustan Petroleum pumps and kerosene, and that fuel
 *     business is STILL TRADING under HP and Indian Oil today. A forecourt is
 *     what 1968 actually looked like, and the one on screen is a real AM Group
 *     site rather than a showroom standing in for one.
 *
 * It is still a PRESENT-DAY photograph and the chapter says so. No archival
 * imagery of the group exists in either Supabase project or in public/media.
 * Sepia, grain or a photo-corner treatment would manufacture a document that
 * does not exist — a worse breach than an honest contemporary frame.
 */
export function ChapterOrigin() {
  const { settleProps, reduce } = useStoryMotion()

  return (
    <Chapter
      id="origin"
      label="Chapter one — where it started, 1968"
      ground="void"
      plate={{
        src: SUPABASE_MEDIA.branches.petroleum.exterior,
        alt: "An AM Group HP forecourt — the petroleum business the group began with in 1968",
        scrim: 0.6,
      }}
    >
      <div className="mx-auto max-w-[1400px] px-5 py-28 md:px-10 md:py-40">
        <ChapterMark index="01" kicker="Where it started" />

        {/* The year at true display scale. This is the chapter's photograph —
            the number is the subject, not an accompaniment to one.
            It is an h2, not a p: every other chapter contributes a heading to
            the document outline and this one did not, so a screen-reader user
            navigating by heading skipped straight from the hero to Chapter 02
            and never knew Chapter 01 existed. */}
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 font-display text-[clamp(5rem,22vw,16rem)] leading-[0.8] tracking-[-0.02em] text-accent"
          data-num
        >
          {FOUNDED}
        </motion.h2>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <motion.p
            {...settleProps(0.1)}
            className="max-w-[46ch] text-body-lg leading-relaxed text-on-deep"
          >
            {TIMELINE[0].note}
          </motion.p>

          {/* Full-strength ink-on-light, NOT the on-deep-2 secondary tone.
              That tone is for FLAT dark grounds; over photography it fails.
              Measured against this plate: on-deep-2 needs a 0.70 scrim to hold
              4.5:1 over a bright patch (the sky and bunting in this frame),
              while on-deep clears it at 0.56 — so the photograph stays visible
              and the text stays readable. Hierarchy here comes from SIZE and
              measure, never from washing text out over an image. */}
          <motion.div {...settleProps(0.2)} className="max-w-[42ch]">
            <p className="text-body leading-relaxed text-on-deep">
              Nine years later the group took on {TIMELINE[1].title}. Both fuel businesses are
              still trading today — which is the whole reason the rest of this story exists.
            </p>
            <p className="mt-8 text-meta uppercase text-on-deep">
              Photographed {new Date().getFullYear()} · an AM Group HP forecourt — the 1968
              business as it trades now. No photography survives from {FOUNDED}.
            </p>
          </motion.div>
        </div>
      </div>
    </Chapter>
  )
}

/* ==========================================================================
   CHAPTER 02 — HOW WE GREW
   ========================================================================== */

/**
 * The 58-year climb, as a vertical scroll.
 *
 * The previous build laid these eight milestones on a horizontal rail, where
 * the stations sat closer together than a card is wide — 2004 and 2010 were
 * permanently covered by their neighbours and the whole rail needed sideways
 * scrolling on a phone. Vertical fixes that structurally: the reader's scroll
 * IS the passage of time, each milestone arrives in sequence, and the rule down
 * the left edge is already counting the same years.
 *
 * Every milestone is from the company's own About page via TIMELINE.
 *
 * This chapter IS the "Timeline of Excellence" from /about, rebuilt. The about
 * page renders it as a four-column grid of year + logo cards; repeating those
 * eight milestones as a ninth chapter here would have stated the same data
 * twice. What that grid has and a bare list does not is the MARQUES, so the
 * logos move onto the timeline itself — each one a plate on the row for the
 * year it was appointed.
 *
 * Still no PHOTOGRAPH per milestone: only four of the eight have a real
 * matching image, and borrowing a building for the other four is exactly the
 * fabrication this rebuild avoids. A logo is the marque itself, not a stand-in
 * for a place.
 */
export function ChapterGrowth() {
  const { settleProps, reduce } = useStoryMotion()

  return (
    <Chapter
      id="growth"
      label="Chapter two — how the group grew"
      ground="ink"
      plate={{
        src: SUPABASE_MEDIA.divisions.automobile,
        alt: "Inside AM Group's central workshop in Jammu",
        scrim: 0.82,
      }}
    >
      <div className="mx-auto max-w-[1400px] px-5 py-28 md:px-10 md:py-40">
        <ChapterMark index="02" kicker="Timeline of excellence" />

        <motion.h2
          {...settleProps(0.05)}
          className="mt-8 max-w-[18ch] font-display text-h1 uppercase text-on-deep"
        >
          Eight appointments in {YEARS_TRADING} years
        </motion.h2>

        <motion.p
          {...settleProps(0.12)}
          className="mt-6 max-w-[52ch] text-body-lg text-on-deep-2"
        >
          Fuel first, then cars. The gap between them is the interesting part.
        </motion.p>

        <ol className="mt-20 md:mt-28">
          {TIMELINE.map((m, i) => {
            const prev = TIMELINE[i - 1]
            const gap = prev ? m.year - prev.year : 0
            // The 27-year silence between IOCL and Chevrolet is real and is the
            // most telling thing on the timeline. Name it rather than hide it.
            const isLongGap = gap >= 15

            return (
              <li key={m.year}>
                {isLongGap && (
                  <motion.div
                    {...settleProps()}
                    className="flex items-center gap-5 py-10 md:py-14"
                  >
                    <span aria-hidden className="h-px flex-1 bg-current opacity-20" />
                    <span className="max-w-[34ch] text-center text-meta uppercase text-on-deep-2">
                      {gap} years of petroleum trading fund the move into showrooms
                    </span>
                    <span aria-hidden className="h-px flex-1 bg-current opacity-20" />
                  </motion.div>
                )}

                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-12% 0px" }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="group grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-3 border-t border-current/15 py-8 md:grid-cols-[7rem_auto_1fr_auto] md:gap-x-10 md:py-10"
                >
                  <span
                    className="font-display text-h2 leading-none text-accent md:text-h1"
                    data-num
                  >
                    {m.year}
                  </span>

                  {/* The marque, on a light chip.
                      Every one of these marks is dark artwork on transparent —
                      KTM is pure black — so on this ink ground they would be
                      invisible. The chip is the honest fix: a trademark is not
                      ours to recolour, so the ground moves instead of the logo.
                      It doubles as the drawing language's "plate". */}
                  {m.mark && (
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center bg-ground p-2 md:h-16 md:w-16">
                      <Image
                        src={m.mark}
                        alt=""
                        width={330}
                        height={130}
                        loading="lazy"
                        className="h-full w-full object-contain"
                      />
                    </span>
                  )}

                  <div className="col-span-2 md:col-span-1 md:col-start-3">
                    <p className="font-display text-h3 uppercase leading-none text-on-deep">
                      {m.title}
                    </p>
                    <p className="mt-3 max-w-[52ch] text-body leading-relaxed text-on-deep-2">
                      {m.note}
                    </p>
                  </div>
                  <span className="hidden text-meta uppercase text-on-deep-2 md:block" data-num>
                    +{m.year - FOUNDED} yr
                  </span>
                </motion.div>
              </li>
            )
          })}
        </ol>
      </div>
    </Chapter>
  )
}
