"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  AWARDS_CHEVROLET,
  AWARDS_HYUNDAI,
  CIRCUIT,
  FOUNDED,
  FRANCHISES,
  SCALE,
  TIMELINE,
  YEARS_TRADING,
} from "@/components/home/content"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"
import { PRIMARY_LOCATION } from "@/lib/locations"
import { Chapter, ChapterMark } from "./chapter"
import { useStoryMotion, EASE_OUT } from "./motion"

/* ==========================================================================
   CHAPTER 07 — WHERE WE ARE NOW
   ========================================================================== */

/**
 * Scale, from verified figures only.
 *
 * Every number here has a source. What is NOT here matters as much: there is no
 * employee count and no customers-served figure anywhere in this project, and
 * PRODUCT.md bans the previously-used "500,000 customers" by name. They are
 * omitted entirely rather than shown as an em-dash placeholder — an empty tile
 * in a stat band reads as a broken number, not as honesty.
 *
 * The live stock count is the strongest item on the page because a reader can
 * check it against /inventory in real time. When the scrape is down it is
 * SUPPRESSED, not zeroed: "0 cars in stock" during an outage is a lie.
 */
export function ChapterToday({
  stockCount,
  degraded,
}: {
  stockCount: number
  degraded: boolean
}) {
  const { settleProps, reduce } = useStoryMotion()

  const currentMarques = FRANCHISES.filter((f) => f.category !== "Heritage").length
  const awards = AWARDS_HYUNDAI.length + AWARDS_CHEVROLET.length

  const figures: { value: string; label: string; note?: string }[] = [
    { value: String(YEARS_TRADING), label: "Years trading", note: `Since ${FOUNDED}` },
    { value: String(SCALE.outlets), label: "Outlets", note: "Company published" },
    { value: String(currentMarques), label: "Current appointments", note: "Plus one heritage marque" },
    { value: String(SCALE.divisions), label: "Divisions", note: "Automobile · Fuel · Property · Retail" },
    { value: String(awards), label: "OEM awards on record", note: "Dated, 2006–2019" },
  ]

  if (!degraded && stockCount > 0) {
    figures.push({
      value: String(stockCount),
      label: "Used cars in stock",
      note: "Live — checkable now",
    })
  }

  return (
    <Chapter id="today" label="Chapter seven — the group today" ground="ink">
      <div className="mx-auto max-w-[1400px] px-5 py-28 md:px-10 md:py-40">
        <ChapterMark index="07" kicker="Where we are now" />

        <motion.h2
          {...settleProps(0.05)}
          className="mt-8 max-w-[18ch] font-display text-h1 uppercase text-on-deep"
        >
          The group, measured
        </motion.h2>

        {/* Not four cards in a row. The figures run as a register at display
            scale, each one a line you read rather than a tile you scan. */}
        <dl className="mt-16 md:mt-24">
          {figures.map((f, i) => (
            <motion.div
              key={f.label}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-12% 0px" }}
              transition={{ duration: 0.55, delay: (i % 3) * 0.06, ease: EASE_OUT }}
              className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 border-t border-current/15 py-7 last:border-b md:grid-cols-[minmax(0,1fr)_auto_16rem] md:gap-x-12 md:py-9"
            >
              <dt className="order-2 font-display text-h3 uppercase text-on-deep md:order-1 md:text-h2">
                {f.label}
              </dt>
              <dd
                className="order-1 font-display text-[clamp(3rem,9vw,7rem)] leading-[0.85] text-accent md:order-2"
                data-num
              >
                {f.value}
              </dd>
              {f.note && (
                <dd className="order-3 col-span-2 text-meta uppercase text-on-deep-2 md:col-span-1">
                  {f.note}
                </dd>
              )}
            </motion.div>
          ))}
        </dl>

        {degraded && (
          <motion.p {...settleProps()} className="mt-8 text-meta uppercase text-on-deep-2">
            Live stock count temporarily unavailable — see{" "}
            <Link href="/inventory" className="text-accent underline underline-offset-4">
              the inventory
            </Link>
            .
          </motion.p>
        )}

        <motion.div {...settleProps(0.1)} className="mt-16 md:mt-20">
          <figure className="relative aspect-[21/9] overflow-hidden border border-line-on-deep">
            <Image
              src={SUPABASE_MEDIA.awards}
              alt="Award trophies presented to AM Group by Hyundai and General Motors"
              fill
              sizes="100vw"
              loading="lazy"
              className="object-cover"
            />
          </figure>
          <figcaption className="mt-3 text-meta uppercase text-on-deep-2">
            {awards} awards on record — Los Angeles 2009 to Rio de Janeiro 2019
          </figcaption>
        </motion.div>
      </div>
    </Chapter>
  )
}

/* ==========================================================================
   CHAPTER 08 — WHAT COMES NEXT
   ========================================================================== */

/**
 * The close — momentum and an invitation, not a forecast.
 *
 * The company has published no roadmap: no announced outlet, no target, no
 * timetable, no EV strategy. Any chapter that states where the group is going
 * would be inventing it. So this leans on the two true forward-facing things —
 * the 2024 expansion (three appointments in one year, the broadest since 1968)
 * and the six services that exist today — and then opens the door.
 *
 * The story ends unfinished on purpose: the rule runs past the last line.
 */
export function ChapterNext() {
  const { settleProps, reduce } = useStoryMotion()
  const latest = TIMELINE[TIMELINE.length - 1]

  return (
    <Chapter
      id="next"
      label="Chapter eight — what comes next"
      ground="deep-2"
      plate={{
        src: SUPABASE_MEDIA.branches["luxury-showrooms"].mg,
        alt: "AMG Autocraft, the group's MG showroom in Jammu, opened 2024",
        scrim: 0.74,
      }}
    >
      <div className="mx-auto max-w-[1400px] px-5 py-28 md:px-10 md:py-40">
        <ChapterMark index="08" kicker="What comes next" />

        <motion.h2
          {...settleProps(0.05)}
          className="mt-8 max-w-[16ch] font-display text-display uppercase leading-[0.92] text-on-deep"
        >
          Drawn in {FOUNDED}. Still being drawn.
        </motion.h2>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <motion.div {...settleProps(0.12)}>
            <p className="text-meta uppercase text-accent" data-num>
              {latest.year} — the most recent chapter
            </p>
            <p className="mt-4 max-w-[46ch] text-body-lg leading-relaxed text-on-deep">
              {latest.note}
            </p>
            <p className="mt-6 max-w-[46ch] text-body leading-relaxed text-on-deep-2">
              Retail came next — the first business outside automotive and energy in{" "}
              {YEARS_TRADING} years.
            </p>
          </motion.div>

          {/* What the group already does for an owner, after the sale. Six real
              services, each with a working destination. */}
          <motion.ol {...settleProps(0.2)} className="grid grid-cols-2 gap-px bg-current/15">
            {CIRCUIT.map((c) => {
              // CircuitStop.href is `string | null` — a service can exist
              // without a page to send someone to. Those render as plain text
              // rather than a dead link.
              const body = (
                <>
                  <span className="font-display text-h3 uppercase leading-none text-on-deep">
                    {c.label}
                  </span>
                  <span className="text-small leading-snug text-on-deep-2">{c.detail}</span>
                </>
              )
              return (
                <li key={c.label} className="bg-deep-2">
                  {c.href ? (
                    <Link
                      href={c.href}
                      className="flex h-full flex-col gap-2 p-5 transition-colors duration-(--duration-1) hover:bg-deep"
                    >
                      {body}
                    </Link>
                  ) : (
                    <div className="flex h-full flex-col gap-2 p-5">{body}</div>
                  )}
                </li>
              )
            })}
          </motion.ol>
        </div>

        <motion.div {...settleProps(0.28)} className="mt-16 flex flex-wrap items-center gap-4">
          <Link
            href="/locations"
            className="inline-flex h-12 items-center rounded-sm bg-accent px-7 text-button text-on-accent transition-colors duration-(--duration-1) hover:bg-accent-hover"
          >
            Visit a showroom
          </Link>
          <Link
            href="/inventory"
            className="inline-flex h-12 items-center rounded-sm border border-line-on-deep px-7 text-button text-on-deep transition-colors duration-(--duration-1) hover:bg-ground hover:text-ink"
          >
            Certified used cars
          </Link>
          <a
            href={`mailto:${PRIMARY_LOCATION.email}`}
            className="inline-flex h-12 items-center px-1 text-button text-on-deep-2 underline-offset-4 transition-colors duration-(--duration-1) hover:text-on-deep hover:underline"
          >
            {PRIMARY_LOCATION.email}
          </a>
        </motion.div>

        {/* The rule, running off the end. */}
        <motion.div
          initial={reduce ? false : { scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: EASE_OUT }}
          className="mt-20 h-24 w-px origin-top bg-accent opacity-60"
          aria-hidden
        />
      </div>
    </Chapter>
  )
}
