"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useScroll, useSpring } from "framer-motion"
import { LOCATIONS, formatAddress, formatHours } from "@/lib/locations"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"

export function EditorialGeography() {
  const routeRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: routeRef,
    offset: ["start 0.8", "end 0.3"],
  })
  const pathLength = useSpring(scrollYProgress, { stiffness: 100, damping: 25 })

  return (
    <section ref={routeRef} className="bg-[#0B192C] px-6 py-28 text-white md:px-16 md:py-40 border-t border-[#1E293B]">
      <div className="mx-auto max-w-7xl">
        {/* Archival Map Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between border-b border-[#334155] pb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-[#94A3B8]"
        >
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#2563EB] animate-ping" />
            <span>ROUTE NH-44 · 270 KM</span>
          </div>
          <span>CHAPTER 05 / GEOGRAPHY</span>
          <span>2 PRIMARY HUBS</span>
        </motion.div>

        <div className="mt-16 max-w-3xl">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#60A5FA]">
            REGIONAL FOOTPRINT
          </span>
          <h2 className="mt-3 font-sans text-3xl font-black uppercase tracking-tight text-white sm:text-5xl">
            Jammu to Srinagar
          </h2>
          <p className="mt-4 text-base text-[#94A3B8] leading-relaxed">
            Two primary addressable dealership complexes connected along National Highway 44 across Jammu &amp; Kashmir.
          </p>
        </div>

        {/* NH-44 Route Line Animated Diagram */}
        <div className="mt-16 border-t border-b border-[#334155] py-8">
          <div className="flex items-center justify-between font-mono text-xs uppercase text-white/90">
            <div className="flex items-center gap-3">
              <span className="h-3.5 w-3.5 rounded-full bg-[#2563EB] ring-4 ring-[#1E3A8A]" />
              <span>JAMMU (FLAGSHIP) · 32°42&apos;59&quot;N</span>
            </div>
            <div className="hidden sm:block text-[#60A5FA] font-bold">
              NATIONAL HIGHWAY 44
            </div>
            <div className="flex items-center gap-3">
              <span>SRINAGAR (HUB) · 34°01&apos;04&quot;N</span>
              <span className="h-3.5 w-3.5 rounded-full border-2 border-[#38BDF8]" />
            </div>
          </div>

          <div className="relative mt-6 h-4 w-full">
            <svg viewBox="0 0 1000 16" className="w-full h-full" preserveAspectRatio="none">
              <line x1="0" y1="8" x2="1000" y2="8" stroke="#334155" strokeWidth="3" />
              <motion.line
                x1="0"
                y1="8"
                x2="1000"
                y2="8"
                stroke="#2563EB"
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
              <motion.div
                key={loc.slug}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.7, delay: idx * 0.2 }}
                className="group border border-[#334155] bg-[#0F172A] p-8 shadow-2xl transition-all duration-300 hover:border-[#2563EB]"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden border border-[#334155]">
                  <Image
                    src={imageSrc}
                    alt={loc.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-transparent" />
                </div>
                <div className="mt-6 flex items-baseline justify-between font-mono text-xs text-[#94A3B8]">
                  <span className="font-bold text-[#60A5FA]">STATION 0{idx + 1}</span>
                  <span>{loc.city.toUpperCase()}</span>
                </div>
                <h3 className="mt-2 font-sans text-2xl font-bold uppercase text-white group-hover:text-[#60A5FA] transition-colors">
                  {loc.name}
                </h3>
                <p className="mt-3 text-sm text-[#CBD5E1] leading-relaxed">
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
                    className="border border-[#2563EB] bg-[#2563EB] px-5 py-2.5 font-mono text-xs font-bold uppercase text-white transition-colors hover:bg-[#1D4ED8]"
                  >
                    GET DIRECTIONS →
                  </a>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
