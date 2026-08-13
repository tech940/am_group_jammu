"use client"

import * as React from "react"
import Image from "next/image"
import { AWARDS, REVIEWS } from "@/components/home/content"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"

export function WorldclassAccolades() {
  return (
    <section className="bg-white py-24 px-6 md:px-14 border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto">

        {/* Two columns: photo + awards list */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

          {/* Left — photo */}
          <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[500px] border border-[#E5E5E5]">
            <Image
              src={SUPABASE_MEDIA.awards}
              alt="AM Group international OEM awards"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Right — awards list */}
          <div className="border border-l-0 border-[#E5E5E5] flex flex-col">
            <div className="px-8 md:px-12 pt-10 pb-8 border-b border-[#E5E5E5]">
              <p className="text-[11px] font-mono tracking-[0.3em] text-[#999999] uppercase mb-3">
                OEM Recognition
              </p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#111111]">
                Recognized by Hyundai &amp; GM across four continents.
              </h2>
            </div>

            <div className="flex-1 divide-y divide-[#EEEEEE]">
              {AWARDS.slice(0, 6).map((award) => (
                <div key={`${award.title}-${award.year}`} className="px-8 md:px-12 py-5 flex items-start justify-between gap-6">
                  <div>
                    <p className="text-sm font-bold text-[#111111] leading-snug">{award.title}</p>
                    <p className="text-[11px] font-mono text-[#999999] mt-1">{award.marque} &mdash; {award.place}</p>
                  </div>
                  <span className="text-[11px] font-mono text-[#CCCCCC] flex-shrink-0 pt-0.5">{award.year}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews — blockquotes, no card containers */}
        <div className="mt-20">
          <p className="text-[11px] font-mono tracking-[0.3em] text-[#999999] uppercase mb-12">
            Verified Customer Reviews &mdash; Google
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E5E5E5]">
            {REVIEWS.slice(0, 3).map((review) => (
              <blockquote key={review.name} className="px-0 md:px-8 py-6 first:pl-0 last:pr-0">
                {/* Large quotation mark — typographic, not decorative */}
                <span className="text-5xl leading-none text-[#EEEEEE] font-serif select-none">&ldquo;</span>
                <p className="text-sm text-[#555555] leading-relaxed mt-2 mb-6">
                  {review.quote}
                </p>
                <footer>
                  <p className="text-sm font-bold text-[#111111]">{review.name}</p>
                  <p className="text-[11px] font-mono text-[#999999] mt-1">{review.meta} &mdash; {review.date}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
