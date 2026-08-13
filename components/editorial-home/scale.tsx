"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { AWARDS_HYUNDAI, AWARDS_CHEVROLET, SCALE, YEARS_TRADING } from "@/components/home/content"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"

export function EditorialScale({ stockCount }: { stockCount: number }) {
  const totalAwards = AWARDS_HYUNDAI.length + AWARDS_CHEVROLET.length

  const metrics = [
    { value: `${YEARS_TRADING}+`, label: "YEARS TRADING", sub: "Since 1968" },
    { value: `${SCALE.outlets}`, label: "DEALERSHIP OUTLETS", sub: "Across J&K" },
    { value: "07", label: "ACTIVE MARQUES", sub: "+1 Heritage Marque" },
    { value: "04", label: "COMMERCIAL SECTORS", sub: "Auto, Fuel, Real Estate, Retail" },
  ]

  if (stockCount > 0) {
    metrics.push({ value: `${stockCount}`, label: "USED CARS IN STOCK", sub: "Live Certified Inventory" })
  }

  return (
    <section className="bg-[#0B192C] px-6 py-28 text-white md:px-16 md:py-40 border-t border-[#1E293B]">
      <div className="mx-auto max-w-7xl">
        {/* Archival Scale Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between border-b border-[#334155] pb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-[#94A3B8]"
        >
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-[#2563EB]" />
            <span>MEASURE / SCALE</span>
          </div>
          <span>CHAPTER 07 / SCALE</span>
          <span>VERIFIED METRICS</span>
        </motion.div>

        <div className="mt-16 max-w-3xl">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#60A5FA]">
            THE GROUP MEASURED
          </span>
          <h2 className="mt-3 font-sans text-3xl font-black uppercase tracking-tight text-white sm:text-5xl">
            Verified Group Operations
          </h2>
        </div>

        {/* Display Metrics Grid with Animated Number Entrance */}
        <div className="mt-16 border-t border-[#334155]">
          {metrics.map((m, idx) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="grid grid-cols-1 items-baseline border-b border-[#334155] py-8 md:grid-cols-12 md:gap-8 md:px-6 hover:bg-[#0F172A]/80 transition-colors"
            >
              <div className="font-mono text-xs font-bold text-[#60A5FA] md:col-span-3">
                METRIC 0{idx + 1}
              </div>
              <div className="md:col-span-6">
                <span className="font-sans text-[clamp(4rem,10vw,7rem)] font-black leading-none tracking-tight text-white">
                  {m.value}
                </span>
                <p className="mt-2 font-sans text-lg font-bold uppercase text-white">
                  {m.label}
                </p>
              </div>
              <div className="mt-2 text-right font-mono text-xs text-[#94A3B8] md:mt-0 md:col-span-3">
                {m.sub}
              </div>
            </motion.div>
          ))}
        </div>

        {/* OEM Trophies Display */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-24 border border-[#334155] bg-[#0F172A] p-8 md:p-12 shadow-2xl"
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#60A5FA]">
                OEM RECOGNITION
              </span>
              <h3 className="mt-3 font-sans text-2xl font-bold uppercase text-white sm:text-3xl">
                {totalAwards} National &amp; Global OEM Awards
              </h3>
              <p className="mt-3 text-sm text-[#CBD5E1] leading-relaxed">
                Awards on record from Hyundai Motor India and General Motors India (2006–2019) across Los Angeles, New York, Paris, Lisbon, and Rio de Janeiro.
              </p>
            </div>
            <div className="relative aspect-[21/9] w-full max-w-md overflow-hidden border border-[#334155]">
              <Image
                src={SUPABASE_MEDIA.awards}
                alt="AM Group OEM Award Trophies"
                fill
                sizes="450px"
                className="object-cover"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
