"use client"

import Image from "next/image"
import { motion, useScroll } from "framer-motion"
import * as React from "react"
import { TIMELINE, YEARS_TRADING } from "@/components/home/content"
import { useProgress } from "./shared/motion"

export function EditorialTimeline() {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.2"],
  })
  // Keeps tracking the reader's scroll under reduce; loses only the spring's
  // overshoot, so the register still shows how far through the chronology it is.
  const scaleY = useProgress(scrollYProgress)

  return (
    <section ref={containerRef} className="bg-[#111315] px-6 py-36 text-white md:px-16 md:py-48 border-t border-white/10">
      <div className="mx-auto max-w-7xl">
        {/* Archival Register Header */}
        <div className="flex items-center justify-between border-b border-white/15 pb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-[#94A3B8]">
          <span>CHRONOLOGY 1968–2024</span>
          <span>CHAPTER 02 / GROWTH</span>
          <span>8 APPOINTMENTS</span>
        </div>

        {/* Section Heading */}
        <div className="mt-16 max-w-3xl">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#38BDF8]">
            CHRONOLOGICAL REGISTER
          </span>
          <h2 className="mt-4 font-serif text-3xl font-black uppercase tracking-tight text-white sm:text-5xl">
            Eight Appointments in {YEARS_TRADING} Years
          </h2>
          <p className="mt-4 text-lg text-[#CBD5E1] leading-relaxed font-sans">
            Petroleum distribution provided the stable capital foundation. Twenty-seven years of fuel distribution funded the landmark entry into passenger vehicle showrooms.
          </p>
        </div>

        {/* Dynamic Timeline Register */}
        <div className="relative mt-20 border-t border-white/15">
          {/* Scroll-linked progress line */}
          <motion.div
            className="absolute left-0 top-0 w-1 bg-[#38BDF8] origin-top hidden md:block"
            style={{ height: "100%", scaleY }}
          />

          {TIMELINE.map((item, idx) => {
            const prev = TIMELINE[idx - 1]
            const gap = prev ? item.year - prev.year : 0
            const isLongGap = gap >= 15

            return (
              <div key={item.year}>
                {isLongGap && (
                  <div className="flex items-center justify-between border-b border-white/15 bg-[#181A1D] px-6 py-5 font-mono text-xs font-bold text-[#38BDF8]">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#38BDF8]" />
                      <span>INTERVAL: {gap} YEARS OF PETROLEUM TRADING</span>
                    </span>
                    <span className="hidden sm:inline">FUEL TRADING FUNDS CAR SHOWROOM MOVE</span>
                    <span>1977 ➔ 2004</span>
                  </div>
                )}
                <div className="group relative grid grid-cols-1 items-center border-b border-white/10 py-8 transition-colors duration-200 hover:bg-[#181A1D] md:grid-cols-12 md:gap-8 md:px-8">
                  {/* Year */}
                  <div className="md:col-span-2">
                    <span className="font-serif text-4xl font-black text-white group-hover:text-[#38BDF8] transition-colors duration-200">
                      {item.year}
                    </span>
                  </div>

                  {/* Marque Chip */}
                  <div className="my-3 md:my-0 md:col-span-3">
                    {item.mark ? (
                      <div className="flex h-14 w-28 items-center justify-center border border-white/20 bg-white p-2 shadow-sm">
                        <Image
                          src={item.mark}
                          alt={item.title}
                          width={220}
                          height={90}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <span className="font-mono text-xs text-[#64748B]">—</span>
                    )}
                  </div>

                  {/* Title & Note */}
                  <div className="md:col-span-5">
                    <h3 className="font-serif text-xl font-bold uppercase text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#CBD5E1] leading-relaxed font-sans">
                      {item.note}
                    </p>
                  </div>

                  {/* Offset badge */}
                  <div className="mt-2 text-right font-mono text-xs font-bold text-[#38BDF8] md:mt-0 md:col-span-2">
                    <span className="rounded-xs bg-white/10 px-2.5 py-1 border border-white/20">
                      +{item.year - 1968} YRS
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
