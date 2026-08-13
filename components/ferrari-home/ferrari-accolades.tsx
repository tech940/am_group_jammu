"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { AWARDS, REVIEWS, NEWS } from "@/components/home/content"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"

export function FerrariAccolades() {
  return (
    <section className="bg-[#080A0E] text-white py-24 px-6 md:px-14 border-b border-white/10">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/15 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#D4AF37]">
                ACCOLADES &amp; OEM RECOGNITIONS
              </span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-sans font-bold text-white tracking-tight">
              NATIONAL &amp; GLOBAL <span className="text-[#D4AF37]">HONOURS.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm font-sans text-slate-300 leading-relaxed">
            Consistently awarded top honors by Hyundai Motor India and General Motors at global conventions across Paris, Los Angeles, and New York.
          </p>
        </div>

        {/* OEM Awards Feature Banner */}
        <div className="bg-white/5 p-8 md:p-12 border border-white/15 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 relative aspect-[16/10] w-full overflow-hidden border border-white/20">
            <Image
              src={SUPABASE_MEDIA.awards}
              alt="AM Group OEM Awards"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>

          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-3xl font-sans font-bold text-white">
              Global Excellence &amp; Service Quality Records
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {AWARDS.slice(0, 4).map((award) => (
                <div key={award.title} className="border-l-2 border-[#D4AF37] pl-4 py-1 space-y-1 bg-white/5 p-3">
                  <p className="text-xs font-bold text-white">{award.title}</p>
                  <p className="text-[11px] font-mono text-[#D4AF37] uppercase">{award.marque} • {award.place} ({award.year})</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Reviews Ticker */}
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <h3 className="text-2xl font-sans font-bold text-white">Client Testimonials</h3>
            <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-widest">VERIFIED GOOGLE REVIEWS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.slice(0, 3).map((review) => (
              <div key={review.name} className="bg-white/5 p-6 border border-white/15 space-y-3 flex flex-col justify-between">
                <p className="text-xs font-sans text-slate-300 leading-relaxed italic">
                  &ldquo;{review.quote}&rdquo;
                </p>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs font-bold text-white">{review.name}</p>
                  <p className="text-[10px] font-mono text-[#D4AF37]">{review.meta} • {review.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
