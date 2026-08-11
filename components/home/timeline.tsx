"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"
import { FOUNDED, TIMELINE, YEARS_TRADING } from "./content"
import { PlateCaption, Settle, TitleBlock } from "@/components/system/marks"

/**
 * Sheet 01 — the as-built record.
 *
 * The company's own published timeline drawn as a measured horizontal scale:
 * each franchise is a station on the line, positioned proportionally to its
 * real year. Horizontal scroll on every viewport — the length of the line IS
 * the story.
 */

const SPAN = YEARS_TRADING

export function Story() {
  const reduce = useReducedMotion()
  const scrollerRef = React.useRef<HTMLDivElement>(null)

  return (
    <section id="story" aria-labelledby="story-title" className="scroll-mt-16 bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <TitleBlock sheet="01" title="As-built record" scale="1:58" />
        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <h2
            id="story-title"
            className="max-w-[16ch] font-display text-5xl font-bold uppercase leading-[0.95] text-ink md:text-7xl"
          >
            Drawn over <span className="text-redline">{YEARS_TRADING} years</span>
          </h2>
          <p className="max-w-[44ch] text-[15px] leading-relaxed text-steel">
            The group did not arrive fully formed. It was added to, franchise by franchise, from a
            single Hindustan Petroleum station in 1968 to eight vehicle marques today. This is the
            record, to scale — drag it.
          </p>
        </div>
      </div>

      {/* The measured line */}
      <div
        ref={scrollerRef}
        className="no-scrollbar mt-14 overflow-x-auto overscroll-x-contain"
        role="region"
        aria-label="Company timeline, 1968 to present, horizontally scrollable"
        tabIndex={0}
      >
        <div className="relative mx-5 w-[1800px] pb-4 md:mx-10 lg:w-[2200px]">
          {/* Scale rule */}
          <div className="relative h-10">
            <motion.div
              className="absolute inset-x-0 top-1/2 h-px origin-left bg-ink/60"
              initial={reduce ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            />
            {Array.from({ length: SPAN + 1 }).map((_, i) => {
              const decade = (FOUNDED + i) % 10 === 0
              return (
                <span
                  key={i}
                  aria-hidden
                  className={`absolute top-1/2 w-px -translate-y-1/2 bg-ink/50 ${decade ? "h-5" : "h-2"}`}
                  style={{ left: `${(i / SPAN) * 100}%` }}
                />
              )
            })}
            {Array.from({ length: Math.floor(SPAN / 10) + 1 }).map((_, i) => {
              const year = Math.ceil(FOUNDED / 10) * 10 + i * 10
              if (year > FOUNDED + SPAN) return null
              return (
                <span
                  key={year}
                  aria-hidden
                  className="absolute top-0 -translate-x-1/2 font-anno text-[10px] text-steel"
                  style={{ left: `${((year - FOUNDED) / SPAN) * 100}%` }}
                >
                  {year}
                </span>
              )
            })}
          </div>

          {/* The 1977–2004 quiet is real: petroleum decades funded the move
              into showrooms. Annotate it so the gap reads as authored. */}
          <div
            aria-hidden
            className="absolute top-[248px] hidden md:block"
            style={{ left: `${((1977 - FOUNDED) / SPAN) * 100 + 3}%`, width: `${((2004 - 1977) / SPAN) * 100 - 6}%` }}
          >
            <div className="border-b border-dashed border-steel/50 pb-1" />
            <p className="mt-2 text-center font-anno text-[10px] uppercase tracking-[0.12em] text-steel">
              Two decades of petroleum trading fund the move into showrooms
            </p>
          </div>

          {/* Stations */}
          <ol className="relative mt-2 flex h-[300px]">
            {TIMELINE.map((m, i) => {
              const left = ((m.year - FOUNDED) / SPAN) * 100
              const tall = i % 2 === 0
              return (
                // The stations sit closer together than a card is wide, so they
                // overlap by design — the scale is honest about how bunched the
                // 2004-2012 expansion was. Without a z-index they are all in the
                // same stacking layer, so paint order is DOM order and a later
                // year permanently covers an earlier one: 2004 and 2010 could
                // not be read at all. Hovering lifts a station to the front.
                //
                // focus-within is paired with hover so this survives the cards
                // becoming links, and so keyboard users are not left with the
                // same unreadable overlap.
                <li
                  key={m.year}
                  className="group absolute top-0 z-0 hover:z-20 focus-within:z-20"
                  style={{ left: `${left}%` }}
                >
                  <Settle delay={i * 0.06}>
                    <span
                      aria-hidden
                      className={`block w-px bg-redline/70 ${tall ? "h-10" : "h-24"}`}
                    />
                    {/* Border darkens on hover so the raised card reads as the
                        one in front. Colour only — no lift, no scale. */}
                    <div className="w-52 border border-ink/25 bg-paper p-4 transition-colors duration-(--duration-1) group-hover:border-ink group-focus-within:border-ink md:w-60">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-display text-3xl font-bold text-ink">{m.year}</span>
                        <span className="font-anno text-[9px] uppercase tracking-[0.12em] text-redline-deep">
                          ST. {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <p className="mt-1 font-anno text-[11px] uppercase tracking-[0.1em] text-ink">
                        {m.title}
                      </p>
                      <p className="mt-2 text-[12.5px] leading-relaxed text-steel">{m.note}</p>
                    </div>
                  </Settle>
                </li>
              )
            })}
          </ol>
        </div>
      </div>

      {/* Origin plate */}
      <div className="mx-auto mt-16 max-w-[1400px] px-5 md:px-10">
        <div className="grid gap-8 border-t border-ink/15 pt-10 md:grid-cols-[1fr_1.2fr] md:gap-14">
          <div>
            <h3 className="font-display text-3xl font-semibold uppercase leading-tight text-ink md:text-4xl">
              It began at a fuel pump
            </h3>
            <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-steel">
              Before showrooms, the group sold fuel and kerosene. The petroleum business that opened
              in 1968 still runs today under HP and Indian Oil — which is why a car bought from AM
              Group comes with something rarer than a warranty: a counterparty that has been here,
              trading under its own name, for {YEARS_TRADING} years.
            </p>
          </div>
          <figure>
            <div className="relative aspect-[16/7] overflow-hidden border border-ink/20">
              <Image
                src="/media/petroleum-hp-iocl.jpg"
                alt="Indian Oil and HP fuel stations operated under the group's petroleum division"
                fill
                sizes="(max-width: 768px) 100vw, 55vw"
                className="object-cover"
              />
            </div>
            <div className="mt-3">
              <PlateCaption fig="FIG. 02">
                HP &amp; Indian Oil forecourts — the 1968 business, still trading
              </PlateCaption>
            </div>
          </figure>
        </div>
      </div>
    </section>
  )
}
