"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useMotionValue, useScroll } from "framer-motion"
import { LOCATIONS, formatAddress, formatHours } from "@/lib/locations"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"
import { useEditorialMotion, useProgress } from "./shared/motion"

export function EditorialGeography() {
  const { reduce } = useEditorialMotion()
  const routeRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: routeRef,
    offset: ["start 0.8", "end 0.3"],
  })
  // Under reduce the route is handed a constant 1 — drawn in full, immediately.
  // Unlike the timeline rule this line is not a progress indicator; it is the
  // Jammu–Srinagar route itself, so a partially drawn one states the geography
  // wrongly. Both hooks always run; only which value feeds the line changes.
  const drawnOnScroll = useProgress(scrollYProgress)
  const drawnInFull = useMotionValue(1)
  const pathLength = reduce ? drawnInFull : drawnOnScroll

  return (
    <section ref={routeRef} className="bg-[#0B192C] px-6 py-36 text-white md:px-16 md:py-48 border-t border-white/10">
      <div className="mx-auto max-w-7xl">
        {/* Archival Map Header */}
        <div className="flex items-center justify-between border-b border-white/15 pb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-[#94A3B8]">
          <div className="flex items-center gap-2">
            {/* Static — decorative pulsing dots are banned in AGENTS.md. */}
            <span className="h-2 w-2 rounded-full bg-[#38BDF8]" />
            <span>ROUTE NH-44 · 270 KM</span>
          </div>
          <span>CHAPTER 05 / GEOGRAPHY</span>
          <span>2 PRIMARY HUBS</span>
        </div>

        <div className="mt-16 max-w-3xl">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#38BDF8]">
            REGIONAL FOOTPRINT
          </span>
          <h2 className="mt-4 font-serif text-3xl font-black uppercase tracking-tight text-white sm:text-5xl">
            Jammu to Srinagar — 270 KM
          </h2>
          <p className="mt-4 text-base text-[#CBD5E1] leading-relaxed font-sans">
            Two primary addressable dealership complexes connected along National Highway 44 across Jammu &amp; Kashmir.
          </p>
        </div>

        {/* NH-44 Route Line Animated Diagram */}
        <div className="mt-20 border-t border-b border-white/15 py-8">
          <div className="flex items-center justify-between font-mono text-xs uppercase text-white/90">
            <div className="flex items-center gap-3">
              <span className="h-3.5 w-3.5 rounded-full bg-[#38BDF8] ring-4 ring-[#38BDF8]/20" />
              <span>JAMMU (FLAGSHIP) · 32°42&apos;59&quot;N</span>
            </div>
            <div className="hidden sm:block text-[#38BDF8] font-bold">
              NATIONAL HIGHWAY 44
            </div>
            <div className="flex items-center gap-3">
              <span>SRINAGAR (HUB) · 34°01&apos;04&quot;N</span>
              <span className="h-3.5 w-3.5 rounded-full border-2 border-[#38BDF8]" />
            </div>
          </div>

          <div className="relative mt-6 h-4 w-full">
            <svg viewBox="0 0 1000 16" className="w-full h-full" preserveAspectRatio="none">
              <line x1="0" y1="8" x2="1000" y2="8" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
              {/* Under reduce this renders COMPLETE rather than scrubbing.
                  Unlike the timeline rule, this line is not a progress
                  indicator — it is the Jammu–Srinagar route itself, so a
                  partially drawn one would state the geography wrongly.

                  It renders as a PLAIN line rather than a motion.line holding a
                  static pathLength of 1: framer drives pathLength through
                  stroke-dasharray, and handing it a constant left the computed
                  dasharray at `0px, 1px` — a fully invisible route. No
                  dasharray, no way for it to be anything but drawn. */}
              {/* Always a motion.line, never a conditional swap to a plain one.
                  framer renders pathLength as SVG ATTRIBUTES (pathLength,
                  stroke-dasharray, stroke-dashoffset) — including during SSR,
                  where the scroll value is 0 and the dasharray is therefore
                  `0 1`. Swapping in a plain <line> leaves React unable to clear
                  attributes it never owned, so the route stayed invisible.
                  Handing framer a constant motion value keeps one owner of the
                  element and lets it write the fully-drawn state itself. */}
              <motion.line
                x1="0"
                y1="8"
                x2="1000"
                y2="8"
                stroke="#38BDF8"
                strokeWidth="4"
                style={{ pathLength }}
              />
            </svg>
          </div>
        </div>

        {/* Two Locations Editorial Grid */}
        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-2">
          {LOCATIONS.map((loc, idx) => {
            const imageSrc =
              idx === 0
                ? SUPABASE_MEDIA.branches["jammu-hyundai"].exterior
                : SUPABASE_MEDIA.branches["srinagar-hyundai"].exterior

            return (
              <div
                key={loc.slug}
                className="group border border-white/15 bg-[#0F172A] p-8 shadow-2xl transition-all duration-300 hover:border-[#38BDF8]"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden border border-white/10">
                  <Image
                    src={imageSrc}
                    alt={loc.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-transparent" />
                </div>
                <div className="mt-6 flex items-baseline justify-between font-mono text-xs text-[#94A3B8]">
                  <span className="font-bold text-[#38BDF8]">STATION 0{idx + 1}</span>
                  <span>{loc.city.toUpperCase()}</span>
                </div>
                <h3 className="mt-2 font-serif text-2xl font-bold uppercase text-white group-hover:text-[#38BDF8] transition-colors">
                  {loc.name}
                </h3>
                <p className="mt-3 text-sm text-[#CBD5E1] leading-relaxed font-sans">
                  {formatAddress(loc)} — {loc.landmark}
                </p>
                <p className="mt-2 font-mono text-xs text-[#94A3B8]">
                  HOURS: {formatHours(loc)}
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <a
                    href={loc.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-white bg-white px-5 py-2.5 font-mono text-xs font-bold uppercase text-[#0B192C] transition-colors hover:bg-white/90"
                  >
                    GET DIRECTIONS →
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
