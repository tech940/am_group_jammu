"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { DIVISIONS } from "./content"
import { ArrowGlyph, PlateCaption, TitleBlock } from "@/components/system/marks"

/**
 * Sheet 02 — schedule of works.
 *
 * The four published divisions as an interactive schedule: the name list is
 * the control, the plate answers. Selecting a row swaps the photography and
 * the annotation. On touch, tapping a row selects it; the link out is a
 * separate, explicit control so selection never hijacks navigation.
 */

export function Divisions() {
  const [active, setActive] = React.useState(0)
  const reduce = useReducedMotion()
  const division = DIVISIONS[active]

  return (
    <section id="businesses" aria-labelledby="businesses-title" className="scroll-mt-16 bg-print text-paper">
      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-28">
        <TitleBlock sheet="02" title="Schedule of works" scale="4 divisions" tone="print" />

        <h2
          id="businesses-title"
          className="mt-8 max-w-[18ch] font-display text-5xl font-bold uppercase leading-[0.95] md:text-7xl"
        >
          What the group <span className="text-print-dim">actually runs</span>
        </h2>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          {/* Schedule — the control */}
          <div role="tablist" aria-label="Divisions" className="self-center">
            {DIVISIONS.map((d, i) => {
              const selected = i === active
              return (
                <button
                  key={d.key}
                  role="tab"
                  aria-selected={selected}
                  aria-controls="division-plate"
                  id={`division-tab-${d.key}`}
                  onClick={() => setActive(i)}
                  className={`group flex w-full items-baseline justify-between gap-4 border-t border-print-line/30 py-5 text-left transition-colors last:border-b focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-paper ${
                    selected ? "text-paper" : "text-print-dim hover:text-paper"
                  }`}
                >
                  <span className="flex items-baseline gap-4 min-w-0">
                    <span
                      aria-hidden
                      className={`h-2 w-2 shrink-0 self-center transition-colors ${
                        selected ? "bg-redline" : "bg-print-line/40 group-hover:bg-print-line"
                      }`}
                    />
                    <span className="truncate font-display text-4xl font-semibold uppercase leading-none md:text-6xl">
                      {d.name}
                    </span>
                  </span>
                  <span className="shrink-0 font-anno text-[11px] tracking-[0.1em]">
                    since {d.sinceApprox ? `c. ${d.since}` : d.since}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Plate — the answer */}
          <div
            id="division-plate"
            role="tabpanel"
            aria-labelledby={`division-tab-${division.key}`}
          >
            <div className="relative aspect-[4/3] overflow-hidden border border-print-line/40 md:aspect-[16/10]">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={division.key}
                  className="absolute inset-0"
                  initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 100% 0 0)" }}
                  animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0% 0 0)" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Image
                    src={division.image}
                    alt={division.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-4 flex items-start justify-between gap-6">
              <div className="min-w-0">
                <PlateCaption fig={`FIG. 0${active + 3}`} tone="print">
                  {division.figure}
                </PlateCaption>
                <p className="mt-3 max-w-[52ch] text-[14.5px] leading-relaxed text-print-dim">
                  {division.summary}
                </p>
              </div>
              <Link
                href={division.href}
                className="group mt-1 inline-flex shrink-0 items-center gap-2 border border-paper/60 px-5 py-3 font-anno text-[11px] uppercase tracking-[0.12em] text-paper transition-colors hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
              >
                Open
                <ArrowGlyph className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
