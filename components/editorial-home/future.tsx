"use client"

import Link from "next/link"
import { CIRCUIT, FOUNDED } from "@/components/home/content"
import { PRIMARY_LOCATION } from "@/lib/locations"

export function EditorialFuture() {
  return (
    <section className="bg-[#0B192C] px-6 py-36 text-white md:px-16 md:py-48 border-t border-white/10">
      <div className="mx-auto max-w-7xl">
        {/* Archival Future Header */}
        <div className="flex items-center justify-between border-b border-white/15 pb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-[#94A3B8]">
          <span>THE NEXT CHAPTER</span>
          <span>EST. {FOUNDED}</span>
          <span>CONTINUING THE STORY</span>
        </div>

        {/* Big Future Headline */}
        <div className="mt-16 max-w-4xl">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#38BDF8]">
            FUTURE HORIZON
          </span>
          <h2 className="mt-4 font-serif text-[clamp(2.5rem,7vw,5.5rem)] font-black uppercase leading-[0.95] tracking-tight text-white">
            The Story Is Still Moving.
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-[#CBD5E1] leading-relaxed font-sans">
            In 2024, AM Group delivered its broadest expansion since 1968 — adding Kia, MG, and Bajaj franchises in a single year alongside organised retail.
          </p>
        </div>

        {/* Ownership Circuit Grid */}
        <div className="mt-20 grid grid-cols-1 gap-px border border-white/15 bg-white/15 sm:grid-cols-2 lg:grid-cols-3">
          {CIRCUIT.map((stop, idx) => {
            const Content = (
              <div className="group flex h-full flex-col justify-between bg-[#0F172A] p-8 transition-colors duration-200 hover:bg-[#1E293B]">
                <div>
                  <span className="font-mono text-xs font-bold text-[#38BDF8]">
                    0{idx + 1} / {stop.label.toUpperCase()}
                  </span>
                  <h3 className="mt-3 font-serif text-xl font-bold uppercase text-white group-hover:text-[#38BDF8] transition-colors">
                    {stop.label}
                  </h3>
                  <p className="mt-2 text-sm text-[#CBD5E1] leading-relaxed font-sans">
                    {stop.detail}
                  </p>
                </div>
                <div className="mt-6 pt-4 font-mono text-xs font-bold uppercase text-[#38BDF8] flex items-center gap-1">
                  <span>ACCESS</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            )

            return stop.href ? (
              <Link key={stop.label} href={stop.href}>
                {Content}
              </Link>
            ) : (
              <div key={stop.label}>{Content}</div>
            )
          })}
        </div>

        {/* Primary Action Buttons */}
        <div className="mt-16 flex flex-wrap items-center gap-4 border-t border-white/15 pt-12">
          <Link
            href="/locations"
            className="border border-white bg-white px-8 py-4 font-mono text-xs font-bold uppercase tracking-widest text-[#0B192C] shadow-lg transition-colors hover:bg-white/90"
          >
            VISIT A SHOWROOM →
          </Link>
          <Link
            href="/inventory"
            className="border border-white/30 bg-transparent px-8 py-4 font-mono text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-white/10"
          >
            CERTIFIED USED CARS
          </Link>
          <a
            href={`mailto:${PRIMARY_LOCATION.email}`}
            className="font-mono text-xs font-bold uppercase tracking-widest text-[#94A3B8] underline underline-offset-4 hover:text-white"
          >
            {PRIMARY_LOCATION.email}
          </a>
        </div>
      </div>
    </section>
  )
}
