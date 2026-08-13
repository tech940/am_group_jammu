"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { FOUNDED, TIMELINE } from "@/components/home/content"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"

export function EditorialOrigin() {
  const sectionRef = React.useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  // Parallax transforms
  const photoY = useTransform(scrollYProgress, [0, 1], [-40, 40])
  const numberY = useTransform(scrollYProgress, [0, 1], [30, -30])

  return (
    <section ref={sectionRef} className="bg-[#F8FAFC] px-6 py-28 text-[#0F172A] md:px-16 md:py-40 border-t border-[#E2E8F0] overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Archival Catalog Header */}
        <div className="flex items-center justify-between border-b border-[#CBD5E1] pb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-[#64748B]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-[#2563EB]" />
            <span>CATALOGUE 1968-HP</span>
          </div>
          <span>CHAPTER 01 / FOUNDATION</span>
          <span>JAMMU SITE</span>
        </div>

        {/* Two-Column Editorial Composition */}
        <div className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-12 lg:items-start">
          {/* Left Column — Display Number & Coordinate with Parallax */}
          <motion.div style={{ y: numberY }} className="lg:col-span-5">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#2563EB] font-bold">
              FOUNDATION YEAR
            </span>
            <h2 className="mt-2 font-sans text-[clamp(6rem,18vw,13rem)] font-black leading-none tracking-tighter text-[#0F172A]">
              {FOUNDED}
            </h2>
            <div className="mt-8 border-t border-[#CBD5E1] pt-6 font-mono text-[11px] text-[#64748B] space-y-1">
              <p className="flex items-center gap-2">
                <span className="text-[#2563EB]">●</span>
                <span>GPS: 32°42&apos;59&quot;N 74°51&apos;25&quot;E</span>
              </p>
              <p>PETROLEUM &amp; ENERGY DISTRIBUTION</p>
            </div>
          </motion.div>

          {/* Right Column — Framed Photograph & Parallax Frame */}
          <motion.div style={{ y: photoY }} className="lg:col-span-7">
            <div className="group relative aspect-[16/10] w-full overflow-hidden border-2 border-[#1E3A8A]/20 bg-[#E2E8F0] shadow-lg">
              <Image
                src={SUPABASE_MEDIA.branches.petroleum.exterior}
                alt="AM Group HP Petroleum Forecourt"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/40 via-transparent to-transparent" />
            </div>

            <figcaption className="mt-4 flex items-baseline justify-between font-mono text-[11px] text-[#64748B]">
              <span className="font-bold text-[#0F172A]">[FIG 01] HP PETROLEUM FORECOURT, JAMMU</span>
              <span className="text-[#2563EB]">TRADING SINCE 1968</span>
            </figcaption>

            <div className="mt-10 max-w-xl space-y-6 text-base leading-relaxed text-[#334155]">
              <p className="text-xl font-bold text-[#0F172A]">
                {TIMELINE[0].note}
              </p>
              <p>
                Nine years later, the group expanded into Indian Oil dealership ({TIMELINE[1].title}). Both fuel businesses remain operational today under standard commercial agreements — serving as the foundational energy core that funded the group&apos;s expansion into automotive retail.
              </p>
              <p className="font-mono text-xs text-[#64748B] uppercase tracking-wider border-t border-[#CBD5E1] pt-4 flex items-center justify-between">
                <span>PHOTOGRAPHED 2026</span>
                <span className="text-[#2563EB]">AM GROUP HP FORECOURT</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
