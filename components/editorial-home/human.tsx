"use client"

import { REVIEWS } from "@/components/home/content"

export function EditorialHuman() {
  return (
    <section className="bg-[#181A1D] px-6 py-36 text-white md:px-16 md:py-48 border-t border-white/10">
      <div className="mx-auto max-w-7xl">
        {/* Archival Testimonial Header */}
        <div className="flex items-center justify-between border-b border-white/15 pb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-[#94A3B8]">
          <span>VERBATIM REVIEWS</span>
          <span>CHAPTER 06 / HUMAN</span>
          <span>STAFF RECOGNITION</span>
        </div>

        <div className="mt-16 max-w-3xl">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#38BDF8]">
            SERVICE RECORDS
          </span>
          <h2 className="mt-4 font-serif text-3xl font-black uppercase tracking-tight text-white sm:text-5xl">
            Customer Testimonials
          </h2>
          <p className="mt-4 text-base text-[#CBD5E1] leading-relaxed font-sans">
            Verbatim Google reviews naming floor advisors on the Jammu showroom floor.
          </p>
        </div>

        {/* 3 Editorial Review Cards */}
        <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {REVIEWS.map((rev, idx) => (
            <div
              key={rev.name}
              className="flex flex-col justify-between border border-white/15 bg-[#111315] p-8 shadow-lg"
            >
              <div>
                <span className="font-mono text-xs font-bold text-[#38BDF8]">
                  RECORD 0{idx + 1} · {rev.date.toUpperCase()}
                </span>
                <blockquote className="mt-6 font-serif text-lg italic leading-relaxed text-white">
                  &ldquo;{rev.quote}&rdquo;
                </blockquote>
              </div>
              <div className="mt-8 border-t border-white/10 pt-4 font-sans">
                <p className="font-serif text-base font-bold text-white">
                  {rev.name}
                </p>
                <p className="mt-1 font-mono text-xs text-[#94A3B8]">
                  {rev.meta}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
