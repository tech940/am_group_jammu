"use client"

import Image from "next/image"
import { AWARDS_HYUNDAI, AWARDS_CHEVROLET, SCALE, YEARS_TRADING } from "@/components/home/content"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"

export function EditorialScale({ stockCount }: { stockCount: number }) {
  const totalAwards = AWARDS_HYUNDAI.length + AWARDS_CHEVROLET.length

  const metrics = [
    { value: `${YEARS_TRADING}+`, label: "YEARS OF OPERATION", sub: "Trading Since 1968" },
    { value: `${SCALE.outlets}`, label: "DEALERSHIP OUTLETS", sub: "Across J&K Region" },
    { value: "07", label: "ACTIVE VEHICLE MARQUES", sub: "+1 Heritage Marque" },
    { value: "04", label: "COMMERCIAL SECTORS", sub: "Auto, Fuel, Real Estate, Retail" },
  ]

  if (stockCount > 0) {
    metrics.push({ value: `${stockCount}`, label: "USED CARS IN STOCK", sub: "Live Certified Inventory" })
  }

  return (
    <section className="bg-[#07080A] px-6 py-36 text-white md:px-16 md:py-48 border-t border-white/10">
      <div className="mx-auto max-w-7xl">
        {/* Archival Scale Header */}
        <div className="flex items-center justify-between border-b border-white/15 pb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-[#94A3B8]">
          <span>MEASURE / SCALE</span>
          <span>CHAPTER 07 / SCALE</span>
          <span>VERIFIED METRICS</span>
        </div>

        <div className="mt-16 max-w-3xl">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#38BDF8]">
            THE GROUP MEASURED
          </span>
          <h2 className="mt-4 font-serif text-3xl font-black uppercase tracking-tight text-white sm:text-5xl">
            Verified Operations Today
          </h2>
        </div>

        {/* Display Metrics Grid */}
        <div className="mt-20 border-t border-white/15">
          {metrics.map((m, idx) => (
            <div
              key={m.label}
              className="grid grid-cols-1 items-baseline border-b border-white/15 py-10 md:grid-cols-12 md:gap-8 md:px-6 hover:bg-[#111315] transition-colors"
            >
              <div className="font-mono text-xs font-bold text-[#38BDF8] md:col-span-3">
                METRIC 0{idx + 1}
              </div>
              <div className="md:col-span-6">
                <span className="font-serif text-[clamp(4.5rem,11vw,7.5rem)] font-black leading-none tracking-tight text-white">
                  {m.value}
                </span>
                <p className="mt-3 font-sans text-lg font-bold uppercase tracking-wide text-white">
                  {m.label}
                </p>
              </div>
              <div className="mt-2 text-right font-mono text-xs text-[#94A3B8] md:mt-0 md:col-span-3">
                {m.sub}
              </div>
            </div>
          ))}
        </div>

        {/* OEM Trophies Display */}
        <div className="mt-24 border border-white/15 bg-[#111315] p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#38BDF8]">
                OEM RECOGNITION
              </span>
              <h3 className="mt-4 font-serif text-2xl font-bold uppercase text-white sm:text-3xl">
                {totalAwards} National &amp; Global OEM Awards
              </h3>
              <p className="mt-4 text-base text-[#CBD5E1] leading-relaxed font-sans">
                Awards on record from Hyundai Motor India and General Motors India (2006–2019) across Los Angeles, New York, Paris, Lisbon, and Rio de Janeiro.
              </p>
            </div>
            <div className="relative aspect-[21/9] w-full max-w-md overflow-hidden border border-white/15">
              <Image
                src={SUPABASE_MEDIA.awards}
                alt="AM Group OEM Award Trophies"
                fill
                sizes="450px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
