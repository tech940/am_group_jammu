"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"

export function FerrariHero({ stockCount }: { stockCount: number }) {
  const { onOpen } = useEnquiryModal()

  return (
    <section className="relative min-h-screen w-full bg-[#080A0E] text-white flex flex-col justify-between overflow-hidden pt-24 pb-12 px-6 md:px-14 border-b border-white/10">
      
      {/* Full-Bleed Background Media with Carbon Vignette */}
      <div className="absolute inset-0 z-0">
        <Image
          src={SUPABASE_MEDIA.heroBg}
          alt="AM Group Flagship Kia Campus in Jammu"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-[0.35] contrast-[1.15]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080A0E] via-[#080A0E]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080A0E] via-transparent to-black/60" />
      </div>

      {/* Top HUD Status Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between border-b border-white/15 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-[#D4AF37]" />
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#D4AF37]">
            HUD • EST. 1968 • JAMMU &amp; KASHMIR
          </span>
        </div>

        <div className="flex items-center gap-6 text-[11px] font-mono tracking-widest text-slate-300">
          <span>LAT: 32.7266° N</span>
          <span className="hidden sm:inline">LON: 74.8570° E</span>
          <span className="text-[#D4AF37] font-bold">LIVE INVENTORY: {stockCount > 0 ? stockCount : 27} CARS</span>
        </div>
      </div>

      {/* Main Center Supercar Title & Action Block */}
      <div className="relative z-10 my-auto py-12 max-w-5xl space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-[#D4AF37] text-xs font-mono uppercase tracking-widest">
          <span>Automobile</span>
          <span className="text-white/40">•</span>
          <span>Petroleum</span>
          <span className="text-white/40">•</span>
          <span>Real Estate</span>
          <span className="text-white/40">•</span>
          <span>Retail</span>
        </div>

        <h1 className="text-6xl sm:text-8xl lg:text-9xl font-sans font-extrabold uppercase tracking-tight leading-[0.9] text-white">
          AM GROUP <br />
          <span className="text-[#D4AF37]">
            JAMMU
          </span>
        </h1>

        <p className="max-w-2xl text-base sm:text-xl font-sans text-slate-300 leading-relaxed">
          Pioneering Jammu &amp; Kashmir&apos;s automotive and industrial sector for over half a century. Representing eight global vehicle marques, 26 regional outlets, and world-class sales and workshop infrastructure.
        </p>

        {/* Action Triggers */}
        <div className="flex flex-wrap items-center gap-4 pt-4">
          <Link
            href="/inventory"
            className="bg-[#D4AF37] hover:bg-white text-[#080A0E] px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-3 shadow-2xl border border-[#D4AF37]/50"
          >
            <span>Explore Inventory ({stockCount > 0 ? stockCount : 27})</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>

          <button
            onClick={() => onOpen()}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-3 cursor-pointer"
          >
            <span>Book Showroom Visit</span>
            <svg className="w-4 h-4 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom Performance Metrics HUD Bar */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-white/15">
        <div className="border-l-2 border-[#D4AF37] pl-4 space-y-1">
          <span className="text-3xl sm:text-4xl font-sans font-extrabold text-white tracking-tight">55+</span>
          <p className="text-[11px] font-mono uppercase tracking-widest text-[#D4AF37]">Years Heritage</p>
        </div>

        <div className="border-l-2 border-white/20 pl-4 space-y-1">
          <span className="text-3xl sm:text-4xl font-sans font-extrabold text-white tracking-tight">8</span>
          <p className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Dealership Hubs</p>
        </div>

        <div className="border-l-2 border-white/20 pl-4 space-y-1">
          <span className="text-3xl sm:text-4xl font-sans font-extrabold text-white tracking-tight">500,000+</span>
          <p className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Happy Families</p>
        </div>

        <div className="border-l-2 border-white/20 pl-4 space-y-1">
          <span className="text-3xl sm:text-4xl font-sans font-extrabold text-white tracking-tight">26+</span>
          <p className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Regional Outlets</p>
        </div>
      </div>

    </section>
  )
}
