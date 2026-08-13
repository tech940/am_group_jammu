"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { FRANCHISES, DIVISIONS } from "@/components/home/content"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"

export function FerrariMarques() {
  const [selectedBrandIndex, setSelectedBrandIndex] = React.useState(0)
  const [activeTab, setActiveTab] = React.useState<"marques" | "divisions">("marques")

  const currentBrand = FRANCHISES[selectedBrandIndex] || FRANCHISES[0]

  const getBrandImage = (name: string) => {
    const lower = name.toLowerCase()
    if (lower.includes("kia")) return SUPABASE_MEDIA.branches["jammu-kia"].exterior
    if (lower.includes("mg")) return SUPABASE_MEDIA.branches["luxury-showrooms"].mg
    if (lower.includes("hyundai")) return SUPABASE_MEDIA.branches["jammu-hyundai"].exterior
    if (lower.includes("ktm")) return SUPABASE_MEDIA.branches["two-wheelers"].ktm
    if (lower.includes("honda")) return SUPABASE_MEDIA.branches["two-wheelers"].honda
    if (lower.includes("bajaj")) return SUPABASE_MEDIA.branches["two-wheelers"].bajaj
    return SUPABASE_MEDIA.branches["central-workshop"].exterior
  }

  return (
    <section className="relative bg-[#0E1218] text-white py-24 px-6 md:px-14 border-b border-white/10">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/15 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#D4AF37]">
                MARQUE PORTFOLIO • AUTHORIZED DEALERSHIPS
              </span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-sans font-bold text-white tracking-tight">
              EIGHT MARQUES. <span className="text-[#D4AF37]">ONE STANDARD.</span>
            </h2>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 bg-white/5 p-1 border border-white/15">
            <button
              onClick={() => setActiveTab("marques")}
              className={`px-5 py-2.5 text-xs font-mono uppercase tracking-widest transition-all ${
                activeTab === "marques"
                  ? "bg-[#D4AF37] text-[#080A0E] font-bold shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              8 Vehicle Marques
            </button>
            <button
              onClick={() => setActiveTab("divisions")}
              className={`px-5 py-2.5 text-xs font-mono uppercase tracking-widest transition-all ${
                activeTab === "divisions"
                  ? "bg-[#D4AF37] text-[#080A0E] font-bold shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              4 Business Sectors
            </button>
          </div>
        </div>

        {activeTab === "marques" ? (
          <div className="space-y-12">
            {/* Brand Horizontal Selector Marquee */}
            <div className="flex flex-wrap items-center gap-3">
              {FRANCHISES.map((brand, idx) => {
                const isSelected = idx === selectedBrandIndex
                return (
                  <button
                    key={brand.name}
                    onClick={() => setSelectedBrandIndex(idx)}
                    className={`px-5 py-3 text-xs font-mono uppercase tracking-widest transition-all border ${
                      isSelected
                        ? "bg-[#D4AF37] text-[#080A0E] font-bold border-[#D4AF37] shadow-xl"
                        : "bg-white/5 text-slate-300 hover:bg-white/10 border-white/15"
                    }`}
                  >
                    {brand.name} ({brand.since})
                  </button>
                )
              })}
            </div>

            {/* Selected Marque Supercar Stage */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-white/5 p-8 md:p-12 border border-white/15 relative overflow-hidden">
              <div className="lg:col-span-6 space-y-6 relative z-10">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 border border-[#D4AF37]/30">
                    {currentBrand.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    APPOINTED {currentBrand.since}
                  </span>
                </div>

                <h3 className="text-4xl sm:text-6xl font-sans font-bold text-white tracking-tight">
                  {currentBrand.entity}
                </h3>

                <p className="text-base text-slate-300 leading-relaxed">
                  Authorized dealership representing {currentBrand.name} in Jammu &amp; Kashmir. Delivering sales, certified maintenance, spare parts, and dedicated customer support across our regional network.
                </p>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <Link
                    href="/inventory"
                    className="bg-[#D4AF37] hover:bg-white text-[#080A0E] px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-3"
                  >
                    <span>View Stock ({currentBrand.name})</span>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                  <Link
                    href="/locations"
                    className="border border-white/20 hover:border-[#D4AF37] text-white px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300"
                  >
                    Locate Showroom
                  </Link>
                </div>
              </div>

              {/* Marque Image Showcase */}
              <div className="lg:col-span-6 relative aspect-[16/10] w-full overflow-hidden border border-white/20 shadow-2xl">
                <Image
                  src={getBrandImage(currentBrand.name)}
                  alt={currentBrand.entity}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center brightness-90 transition-all duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1218] via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-white/80 bg-black/60 backdrop-blur-md px-4 py-2 border border-white/10">
                  <span>SHOWROOM PHOTOGRAPHY</span>
                  <span className="text-[#D4AF37]">JAMMU &amp; SRINAGAR</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Business Divisions Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {DIVISIONS.map((division) => (
              <div key={division.name} className="bg-white/5 p-8 border border-white/15 space-y-4 hover:border-[#D4AF37] transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#D4AF37] uppercase tracking-widest">
                    EST. {division.since}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                    {division.figure}
                  </span>
                </div>

                <h3 className="text-2xl font-sans font-bold text-white">{division.name}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{division.summary}</p>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <Link href={division.href} className="text-xs font-mono uppercase tracking-widest text-white hover:text-[#D4AF37]">
                    Explore Sector →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
