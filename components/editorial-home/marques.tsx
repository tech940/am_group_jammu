"use client"

import * as React from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { FRANCHISES } from "@/components/home/content"

export function EditorialMarques() {
  const [activeHover, setActiveHover] = React.useState<string | null>(null)
  const currentMarques = FRANCHISES.filter((f) => f.category !== "Heritage")
  const heritageMarques = FRANCHISES.filter((f) => f.category === "Heritage")

  return (
    <section className="bg-[#FFFFFF] px-6 py-28 text-[#0F172A] md:px-16 md:py-40 border-t border-[#E2E8F0]">
      <div className="mx-auto max-w-7xl">
        {/* Archival Catalogue Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between border-b border-[#CBD5E1] pb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-[#64748B]"
        >
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-[#2563EB]" />
            <span>FRANCHISE CATALOGUE</span>
          </div>
          <span>CHAPTER 04 / MARQUES</span>
          <span>7 ACTIVE / 1 HERITAGE</span>
        </motion.div>

        <div className="mt-16 max-w-3xl">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#2563EB]">
            OFFICIAL OEM APPOINTMENTS
          </span>
          <h2 className="mt-3 font-sans text-3xl font-black uppercase tracking-tight text-[#0F172A] sm:text-5xl">
            {currentMarques.length} Regional Appointments
          </h2>
          <p className="mt-4 text-base text-[#475569] leading-relaxed">
            Passenger vehicles and two-wheelers represented under exclusive regional franchises across Jammu &amp; Kashmir.
          </p>
        </div>

        {/* Clean Editorial Table Index */}
        <div className="mt-16 border-t border-[#CBD5E1]">
          {[...currentMarques, ...heritageMarques].map((brand, idx) => {
            const isHovered = activeHover === brand.name
            return (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-5% 0px" }}
                transition={{ duration: 0.4, delay: (idx % 4) * 0.06 }}
                onMouseEnter={() => setActiveHover(brand.name)}
                onMouseLeave={() => setActiveHover(null)}
                className="group relative border-b border-[#E2E8F0] py-6 transition-colors duration-200 hover:bg-[#F8FAFC] md:px-6"
              >
                <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
                  <div className="font-mono text-xs font-bold text-[#2563EB] md:col-span-2">
                    <span>APPOINTED {brand.since}</span>
                  </div>
                  <div className="md:col-span-4">
                    <h3 className="font-sans text-2xl font-bold uppercase text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                      {brand.name}
                    </h3>
                  </div>
                  <div className="md:col-span-3">
                    <span className="font-mono text-xs text-[#64748B]">
                      {brand.entity}
                    </span>
                  </div>
                  <div className="text-right font-mono text-xs text-[#64748B] md:col-span-3">
                    <span className="inline-block border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1 uppercase font-bold text-[#1E3A8A]">
                      {brand.category}
                    </span>
                  </div>
                </div>

                {/* Animated Preview Image Frame on Hover */}
                <AnimatePresence>
                  {isHovered && brand.image && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 z-30 hidden w-72 overflow-hidden border-2 border-[#2563EB] bg-white shadow-2xl lg:block"
                    >
                      <div className="relative aspect-[16/10] w-full">
                        <Image
                          src={brand.image}
                          alt={brand.imageAlt}
                          fill
                          sizes="288px"
                          className="object-cover"
                        />
                      </div>
                      <div className="bg-[#0F172A] p-3 font-mono text-[10px] text-white">
                        {brand.imageAlt}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
