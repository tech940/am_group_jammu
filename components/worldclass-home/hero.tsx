"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"

export function WorldclassHero({ stockCount }: { stockCount: number }) {
  const { onOpen } = useEnquiryModal()

  return (
    <section className="relative min-h-screen w-full bg-[#0A0A0A] text-white flex flex-col overflow-hidden">

      {/* Full-bleed background */}
      <div className="absolute inset-0 z-0">
        <Image
          src={SUPABASE_MEDIA.heroBg}
          alt="AM Group flagship showroom campus"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-[0.28]"
        />
        {/* Gradient only on left side so the photo reads on the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/95 via-[#0A0A0A]/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
      </div>

      {/* Top rule */}
      <div className="relative z-10 flex items-center justify-between px-6 md:px-14 pt-28 pb-4 border-b border-white/10">
        <span className="text-[11px] font-mono tracking-[0.25em] text-white/50 uppercase">
          Est. 1968 &mdash; Jammu &amp; Kashmir
        </span>
        <span className="text-[11px] font-mono tracking-[0.2em] text-white/50 uppercase hidden sm:block">
          {stockCount > 0 ? stockCount : 27} vehicles in stock
        </span>
      </div>

      {/* Main content — anchored to left, vertically centered */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 md:px-14 py-16 max-w-4xl">

        {/* Year stamp — structural, not decorative */}
        <p className="text-[11px] font-mono tracking-[0.3em] text-white/40 uppercase mb-8">
          Since 1968
        </p>

        <h1 className="text-[clamp(3rem,8vw,7rem)] font-black tracking-[-0.02em] leading-[0.92] text-white mb-8">
          AM GROUP<br />
          JAMMU &amp;<br />
          KASHMIR.
        </h1>

        <p className="text-base text-white/60 leading-relaxed max-w-lg mb-12">
          Region&apos;s principal automotive conglomerate &mdash; eight vehicle franchises, 
          26 regional outlets, 3S workshops, energy forecourts, and real estate 
          across Jammu &amp; Kashmir.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/inventory"
            className="bg-[#1D4ED8] hover:bg-[#1e40af] text-white px-8 py-4 text-sm font-bold uppercase tracking-widest transition-colors duration-200"
          >
            Explore Inventory
          </Link>
          <button
            onClick={() => onOpen()}
            className="text-white/70 hover:text-white px-8 py-4 text-sm font-bold uppercase tracking-widest border border-white/20 hover:border-white/40 transition-colors duration-200 cursor-pointer"
          >
            Book a Visit
          </button>
        </div>
      </div>

      {/* Bottom stats rule */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 border-t border-white/10 px-6 md:px-14">
        {[
          { n: "55+", label: "Years" },
          { n: "8", label: "Dealership Hubs" },
          { n: "500,000+", label: "Customers" },
          { n: "26", label: "Regional Outlets" },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={`py-8 pr-8 ${i > 0 ? "border-l border-white/10 pl-8" : ""}`}
          >
            <div className="text-2xl font-black text-white tracking-tight">{stat.n}</div>
            <div className="text-[11px] font-mono tracking-[0.15em] text-white/40 uppercase mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

    </section>
  )
}
