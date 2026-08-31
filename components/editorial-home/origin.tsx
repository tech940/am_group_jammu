"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useScroll } from "framer-motion"
import { FOUNDED, TIMELINE } from "@/components/home/content"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"
import { useParallax } from "./shared/motion"

export function EditorialOrigin() {
  const sectionRef = React.useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  // Parallax motion transforms. Both ranges straddle zero, so they rest at 0
  // under reduced motion rather than at the top of their travel — otherwise the
  // two columns would sit frozen 30px out of position.
  const photoY = useParallax(scrollYProgress, [-30, 30], 0)
  const numberY = useParallax(scrollYProgress, [20, -20], 0)

  return (
    <section ref={sectionRef} className="bg-[#F9F9F7] px-6 py-36 text-[#0F172A] md:px-16 md:py-48 border-t border-[#E2E8F0] overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Archival Chapter Header */}
        <div className="flex items-center justify-between border-b border-[#CBD5E1] pb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-[#64748B]">
          <span>CHAPTER 01 / ORIGIN</span>
          <span>THE FOUNDATION</span>
          <span>JAMMU SITE</span>
        </div>

        {/* Asymmetric 2-Column Editorial Composition */}
        <div className="mt-20 grid grid-cols-1 gap-16 lg:grid-cols-12 lg:items-start">
          {/* Left Column — Display Serif Number & Coordinates */}
          <motion.div style={{ y: numberY }} className="lg:col-span-5">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#0F172A] font-bold">
              FOUNDATION YEAR
            </span>
            <h2 className="mt-2 font-serif text-[clamp(6rem,18vw,12rem)] font-black leading-none tracking-tighter text-[#0F172A]">
              {FOUNDED}
            </h2>
            <div className="mt-8 border-t border-[#CBD5E1] pt-6 font-mono text-[11px] text-[#64748B] space-y-1">
              <p className="font-bold text-[#0F172A]">GPS: 32°42&apos;59&quot;N 74°51&apos;25&quot;E</p>
              <p>PETROLEUM &amp; ENERGY DISTRIBUTION</p>
            </div>
          </motion.div>

          {/* Right Column — Framed Photograph & Archival Copy */}
          <motion.div style={{ y: photoY }} className="lg:col-span-7">
            <div className="group relative aspect-[16/10] w-full overflow-hidden border border-[#CBD5E1] bg-[#E2E8F0] shadow-md">
              <Image
                src={SUPABASE_MEDIA.branches.petroleum.exterior}
                alt="AM Group HP Petroleum Forecourt"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover object-center"
              />
            </div>

            <figcaption className="mt-4 flex items-baseline justify-between font-mono text-[11px] text-[#64748B]">
              <span className="font-bold text-[#0F172A]">[FIG. 01] HP PETROLEUM FORECOURT, JAMMU</span>
              <span>TRADING SINCE 1968</span>
            </figcaption>

            <div className="mt-10 max-w-xl space-y-6 text-lg leading-relaxed text-[#334155] font-sans">
              <h3 className="font-serif text-2xl font-bold uppercase text-[#0F172A]">
                Before The Showrooms, There Was Fuel.
              </h3>
              <p>
                {TIMELINE[0].note}
              </p>
              <p className="text-base text-[#475569]">
                Nine years later, the group expanded into Indian Oil dealership ({TIMELINE[1].title}). Both fuel businesses remain operational today under standard commercial agreements — serving as the foundational energy core that funded the group&apos;s expansion into passenger vehicle showrooms.
              </p>
              <p className="font-mono text-xs text-[#64748B] uppercase tracking-wider border-t border-[#CBD5E1] pt-4 flex items-center justify-between">
                <span>PHOTOGRAPHED 2026</span>
                <span className="font-bold text-[#0F172A]">AM GROUP HP FORECOURT</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
