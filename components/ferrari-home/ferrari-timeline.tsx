"use client"

import * as React from "react"
import Link from "next/link"

const TIMELINE_MILESTONES = [
  {
    year: "1968",
    title: "FOUNDATION & ENERGY DISTRIBUTION",
    subtitle: "HPCL & Indian Oil Forecourts",
    description: "Inaugurated initial energy distribution station in Jammu, establishing essential petroleum supply lines for Jammu & Kashmir."
  },
  {
    year: "2008",
    title: "HYUNDAI MOTOR APPOINTMENT",
    subtitle: "Principal Dealer in J&K",
    description: "Appointed official Hyundai dealer in J&K, constructing world-class sales, 3S service, and genuine spare parts infrastructure in Jammu and Srinagar."
  },
  {
    year: "2024",
    title: "LUXURY & MULTI-BRAND EXPANSION",
    subtitle: "Kia, MG Motor, KTM & Honda 2W",
    description: "Expanded automotive portfolio with state-of-the-art Kia and MG Motor luxury showrooms, alongside KTM, Bajaj, and Diamond Honda two-wheeler outlets."
  },
  {
    year: "2025",
    title: "RETAIL & INFRASTRUCTURE",
    subtitle: "S Mega Mart & AM Business Park",
    description: "Launched S Mega Mart organized retail department store in Srinagar and commercial real estate developments at AM Business Park, Jammu."
  }
]

export function FerrariTimeline() {
  return (
    <section className="bg-[#080A0E] text-white py-24 px-6 md:px-14 border-b border-white/10">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/15 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#D4AF37]">
                HERITAGE &amp; PROVENANCE • 1968 ─── 2026
              </span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-sans font-bold text-white tracking-tight">
              FORGED OVER <span className="text-[#D4AF37]">55+ YEARS.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm font-sans text-slate-300 leading-relaxed">
            From a single energy station in 1968 to an enterprise group spanning 8 dealership hubs, 26 regional outlets, and 500,000+ customer relationships.
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {TIMELINE_MILESTONES.map((item, idx) => (
            <div 
              key={item.year} 
              className="bg-white/5 p-6 border border-white/15 relative hover:border-[#D4AF37] transition-all group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-3xl font-sans font-extrabold text-[#D4AF37] tracking-tight">
                    {item.year}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    STAGE 0{idx + 1}
                  </span>
                </div>

                <h3 className="text-lg font-sans font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider">
                  {item.subtitle}
                </p>

                <p className="text-xs font-sans text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">VERIFIED HERITAGE</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
