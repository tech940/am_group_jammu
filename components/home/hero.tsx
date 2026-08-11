"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { FOUNDED, SCALE, YEARS_TRADING } from "./content"
import { ArrowGlyph, RegMark, TitleBlock } from "@/components/system/marks"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"

/**
 * Sheet 00 — the cover sheet.
 *
 * Composition: a drawn field, then the heritage spine, then a full-width plate.
 * NOT the split hero this replaced, for two reasons.
 *
 * 1. Photography. Every image in the am_group_files bucket is landscape or
 *    square — there is not one portrait asset. The old layout put a 1376x768
 *    photograph into a full-height portrait column, so object-cover had to
 *    upscale it ~1.4x on width and ~2.8x on a 2x display just to fill the slot.
 *    That is why it read as blurry: not compression, aspect mismatch. A
 *    full-bleed landscape band lets a 1600px-wide source render at or below
 *    1:1 on most screens.
 *
 * 2. Story. The brief is 1968 -> TODAY -> WHAT'S NEXT, so the spine states it
 *    literally as a measured rule with three stations, and each station carries
 *    a real number. It is also the section's primary navigation, which is what
 *    lets the hero lead with the company rather than with the car stock.
 *
 * CTA order is deliberate: this is the corporate homepage, so the story and the
 * businesses lead. Used-car stock appears once, as a live annotation on the
 * TODAY station, not as a hero button.
 */

interface Station {
  key: string
  marker: string
  label: string
  detail: string
  href: string
}

export function HomeHero({ stockCount }: { stockCount: number }) {
  const reduce = useReducedMotion()
  const thisYear = FOUNDED + YEARS_TRADING

  // stockCount was previously accepted and never rendered — the live figure was
  // fetched on every request and thrown away. It belongs here, as evidence
  // under TODAY, rather than as a button competing with the company's story.
  const stations: Station[] = [
    {
      key: "then",
      marker: String(FOUNDED),
      label: "Founded",
      detail: "Hindustan Petroleum pumps and kerosene, Jammu",
      href: "#story",
    },
    {
      key: "now",
      marker: "Today",
      label: `${SCALE.outlets} outlets · ${SCALE.franchises} franchises`,
      detail:
        stockCount > 0
          ? `${SCALE.divisions} divisions · ${stockCount} used cars in stock`
          : `${SCALE.divisions} divisions across Jammu & Kashmir`,
      href: "#divisions",
    },
    {
      key: "next",
      marker: "Next",
      label: "Where the group is going",
      detail: "Three franchises added in 2024 — the broadest expansion since 1968",
      href: "#ecosystem",
    },
  ]

  return (
    <section data-ground="deep" className="relative bg-deep text-on-deep">
      {/* ---------------------------------------------------------------- */}
      {/* Drawn field                                                       */}
      {/* ---------------------------------------------------------------- */}
      <div className="relative overflow-hidden">
        <svg aria-hidden className="absolute inset-0 h-full w-full opacity-[0.13]">
          <defs>
            <pattern id="grid-major" width="96" height="96" patternUnits="userSpaceOnUse">
              <path d="M96 0H0v96" fill="none" stroke="#9fb6d6" strokeWidth="0.75" />
            </pattern>
            <pattern id="grid-minor" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M24 0H0v24" fill="none" stroke="#9fb6d6" strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-minor)" />
          <rect width="100%" height="100%" fill="url(#grid-major)" />
        </svg>

        <RegMark className="absolute left-5 top-24 text-line-deep/50 md:left-10" />
        <RegMark className="absolute bottom-6 right-5 text-line-deep/50 md:right-10" />

        <div className="relative mx-auto max-w-[1400px] px-5 pb-14 pt-28 md:px-10 md:pb-20 md:pt-36">
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <TitleBlock
              sheet="00"
              title="General arrangement — AM Group"
              scale={`${FOUNDED}–${thisYear}`}
              tone="print"
            />
          </motion.div>

          {/* The headline runs the full sheet rather than sitting in a 7/12
              column, so the type can actually be display-scale. */}
          <h1 className="mt-9 font-display text-display uppercase text-on-deep md:mt-12">
            {["Keeping J&K", "moving since"].map((line, i) => (
              <motion.span
                key={line}
                className="block"
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              >
                {line === "moving since" ? (
                  <>
                    moving <span className="text-on-deep-2">since</span>
                  </>
                ) : (
                  line
                )}
              </motion.span>
            ))}
            <motion.span
              className="block text-accent-text-dark"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
            >
              {FOUNDED}
            </motion.span>
          </h1>

          <div className="mt-10 grid gap-8 md:mt-12 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-16">
            <motion.p
              className="max-w-[54ch] text-body-lg leading-relaxed text-on-deep-2"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              AM Group is Jammu &amp; Kashmir&apos;s automotive and industrial house —{" "}
              <strong className="font-semibold text-on-deep">
                {SCALE.outlets} dealership outlets
              </strong>
              , {SCALE.franchises} vehicle franchises, fuel stations, real estate and retail — run by
              one family business, trading since {FOUNDED}, from {SCALE.cities[0]} to{" "}
              {SCALE.cities[1]}.
            </motion.p>

            <motion.div
              className="flex flex-wrap items-center gap-3"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.62 }}
            >
              <a
                href="#story"
                className="group inline-flex h-12 items-center gap-3 rounded-sm bg-accent px-6 text-button text-on-deep transition-colors duration-(--duration-1) hover:bg-accent-hover"
              >
                Our story
                <ArrowGlyph className="transition-transform duration-(--duration-1) group-hover:translate-x-0.5 motion-reduce:transform-none" />
              </a>
              <a
                href="#divisions"
                className="inline-flex h-12 items-center rounded-sm border border-line-on-deep px-6 text-button text-on-deep transition-colors duration-(--duration-1) hover:bg-ground hover:text-ink"
              >
                Our businesses
              </a>
              <Link
                href="/locations"
                className="inline-flex h-12 items-center px-1 text-button text-on-deep-2 underline-offset-4 transition-colors duration-(--duration-1) hover:text-on-deep hover:underline"
              >
                Showrooms
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* The heritage spine — 1968 / TODAY / NEXT                          */}
      {/* ---------------------------------------------------------------- */}
      <nav
        aria-label="The group at a glance"
        className="relative border-y border-line-on-deep bg-deep-2"
      >
        <ul className="mx-auto grid max-w-[1400px] grid-cols-1 md:grid-cols-3">
          {stations.map((s, i) => (
            <li
              key={s.key}
              className={
                i === 0
                  ? "border-line-on-deep"
                  : "border-t border-line-on-deep md:border-l md:border-t-0"
              }
            >
              <a
                href={s.href}
                className="group flex h-full flex-col gap-1.5 px-5 py-6 transition-colors duration-(--duration-1) hover:bg-deep md:px-8 md:py-8"
              >
                <span className="flex items-center gap-3">
                  {/* The station dot: this is a measured rule, and the marker
                      is where the reading is taken. */}
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-text-dark"
                  />
                  <span className="font-display text-h2 uppercase leading-none text-on-deep" data-num>
                    {s.marker}
                  </span>
                </span>
                <span className="text-label text-on-deep">{s.label}</span>
                <span className="max-w-[40ch] text-small text-on-deep-2">{s.detail}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ---------------------------------------------------------------- */}
      {/* Plate — full-width landscape band                                 */}
      {/* ---------------------------------------------------------------- */}
      <figure className="relative">
        <motion.div
          // Aspect ratios chosen against the real source (1376x768, 1.79:1) so
          // the browser downscales rather than upscales at every breakpoint.
          // The old full-height column forced the opposite.
          className="relative aspect-[16/10] w-full sm:aspect-[2/1] lg:aspect-[2.6/1]"
          initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={SUPABASE_MEDIA.heroBg}
            alt="The AM Kia flagship showroom in Jammu, lit at dusk"
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover object-center"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-deep to-transparent"
          />
        </motion.div>

        <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-5 py-4 md:px-10">
          <span className="text-meta uppercase text-on-deep">
            <span className="text-accent-text-dark">Fig. 01</span> · AM Kia showroom, Jammu —
            photographed on site
          </span>
          <RegMark className="hidden text-line-deep/60 lg:block" />
        </figcaption>
      </figure>
    </section>
  )
}
