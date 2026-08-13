"use client"

import Image from "next/image"
import { motion, useScroll, useSpring, useTransform } from "framer-motion"
import * as React from "react"
import { TIMELINE, YEARS_TRADING } from "@/components/home/content"

export function EditorialTimeline() {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.2"],
  })
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 25 })

  return (
    <section ref={containerRef} className="bg-[#FFFFFF] px-6 py-28 text-[#0F172A] md:px-16 md:py-40 border-t border-[#E2E8F0]">
      <div className="mx-auto max-w-7xl">
        {/* Archival Register Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between border-b border-[#CBD5E1] pb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-[#64748B]"
        >
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-[#2563EB]" />
            <span>CHRONOLOGY 1968–2024</span>
          </div>
          <span>CHAPTER 02 / GROWTH</span>
          <span>8 APPOINTMENTS</span>
        </motion.div>

        {/* Section Heading */}
        <div className="mt-16 max-w-3xl">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#2563EB]">
            58-YEAR CHRONOLOGICAL REGISTER
          </span>
          <h2 className="mt-3 font-sans text-3xl font-black uppercase tracking-tight text-[#0F172A] sm:text-5xl">
            Eight Appointments in {YEARS_TRADING} Years
          </h2>
          <p className="mt-4 text-base text-[#475569] leading-relaxed">
            Petroleum distribution provided the stable capital foundation. 27 years later, the group made its landmark entry into passenger car retail.
          </p>
        </div>

        {/* Dynamic Scroll-Driven Timeline Register */}
        <div className="relative mt-16 border-t border-[#CBD5E1]">
          {/* Scroll-linked progress line */}
          <motion.div
            className="absolute left-0 top-0 w-1 bg-[#2563EB] origin-top hidden md:block"
            style={{ height: "100%", scaleY }}
          />

          {TIMELINE.map((item, idx) => {
            const prev = TIMELINE[idx - 1]
            const gap = prev ? item.year - prev.year : 0
            const isLongGap = gap >= 15

            return (
              <div key={item.year}>
                {isLongGap && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex items-center justify-between border-b border-[#CBD5E1] bg-[#F1F5F9] px-6 py-4 font-mono text-xs font-bold text-[#1E3A8A]"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#2563EB]" />
                      <span>INTERVAL: {gap} YEARS SILENCE</span>
                    </span>
                    <span className="hidden sm:inline">PETROLEUM TRADING FUNDS CAR SHOWROOM MOVE</span>
                    <span>1977 ➔ 2004</span>
                  </motion.div>
                )}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-10% 0px" }}
                  transition={{ duration: 0.5, delay: (idx % 4) * 0.08 }}
                  className="group relative grid grid-cols-1 items-center border-b border-[#E2E8F0] py-8 transition-colors duration-200 hover:bg-[#F8FAFC] md:grid-cols-12 md:gap-8 md:px-8"
                >
                  {/* Year */}
                  <div className="md:col-span-2">
                    <span className="font-sans text-4xl font-black text-[#0F172A] group-hover:text-[#2563EB] transition-colors duration-200">
                      {item.year}
                    </span>
                  </div>

                  {/* Marque Chip */}
                  <div className="my-3 md:my-0 md:col-span-3">
                    {item.mark ? (
                      <div className="flex h-14 w-28 items-center justify-center border border-[#CBD5E1] bg-white p-2 shadow-xs group-hover:border-[#2563EB]/40 transition-colors">
                        <Image
                          src={item.mark}
                          alt={item.title}
                          width={220}
                          height={90}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <span className="font-mono text-xs text-[#94A3B8]">—</span>
                    )}
                  </div>

                  {/* Title & Note */}
                  <div className="md:col-span-5">
                    <h3 className="font-sans text-xl font-bold uppercase text-[#0F172A]">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#475569] leading-relaxed">
                      {item.note}
                    </p>
                  </div>

                  {/* Offset badge */}
                  <div className="mt-2 text-right font-mono text-xs font-bold text-[#2563EB] md:mt-0 md:col-span-2">
                    <span className="rounded-xs bg-[#EFF6FF] px-2.5 py-1 border border-[#BFDBFE]">
                      +{item.year - 1968} YRS
                    </span>
                  </div>
                </motion.div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
