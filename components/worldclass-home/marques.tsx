"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { FRANCHISES } from "@/components/home/content"

export function WorldclassMarques() {
  const [selectedIdx, setSelectedIdx] = React.useState(0)
  const current = FRANCHISES[selectedIdx] || FRANCHISES[0]

  return (
    <section className="bg-white">

      {/* Brand tab strip */}
      <div className="border-b border-[#E5E5E5] overflow-x-auto">
        <div className="flex min-w-max px-6 md:px-14">
          {FRANCHISES.map((brand, idx) => (
            <button
              key={brand.name}
              onClick={() => setSelectedIdx(idx)}
              className={`px-6 py-5 text-[11px] font-bold uppercase tracking-[0.15em] border-b-2 whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                idx === selectedIdx
                  ? "border-[#111111] text-[#111111]"
                  : "border-transparent text-[#999999] hover:text-[#111111]"
              }`}
            >
              {brand.name}
            </button>
          ))}
        </div>
      </div>

      {/* Two-column stage: raw photo left, text right — no outer card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[70vh]">

        {/* Photo — full bleed, no rounded, no border, no shadow */}
        <div className="relative min-h-[50vw] lg:min-h-0 order-2 lg:order-1">
          <Image
            src={current.image}
            alt={current.entity}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
          />
        </div>

        {/* Text panel */}
        <div className="order-1 lg:order-2 flex flex-col justify-between px-8 md:px-14 py-14 lg:py-20 border-l border-[#E5E5E5]">

          <div>
            <p className="text-[11px] font-mono tracking-[0.25em] text-[#999999] uppercase mb-10">
              {current.category} &mdash; Appointed {current.since}
            </p>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-0.02em] leading-[0.95] text-[#111111] mb-8">
              {current.entity}
            </h2>

            <p className="text-base text-[#555555] leading-relaxed max-w-prose mb-10">
              Authorized {current.name} dealership in Jammu &amp; Kashmir &mdash; sales, 
              certified service, genuine spare parts, and dedicated customer support 
              across our regional network.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/inventory"
                className="bg-[#1D4ED8] hover:bg-[#1e40af] text-white px-8 py-4 text-sm font-bold uppercase tracking-widest transition-colors duration-200"
              >
                Browse {current.name}
              </Link>
              <Link
                href="/locations"
                className="text-[#111111] hover:text-[#1D4ED8] text-sm font-bold uppercase tracking-widest underline underline-offset-4 transition-colors duration-200"
              >
                Find Showroom
              </Link>
            </div>
          </div>

          {/* Navigation arrows */}
          <div className="flex items-center gap-6 mt-14 pt-8 border-t border-[#E5E5E5]">
            <button
              onClick={() => setSelectedIdx((i) => (i - 1 + FRANCHISES.length) % FRANCHISES.length)}
              className="text-[11px] font-bold uppercase tracking-widest text-[#999999] hover:text-[#111111] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Prev
            </button>
            <span className="text-[11px] font-mono text-[#CCCCCC]">
              {String(selectedIdx + 1).padStart(2, "0")} / {String(FRANCHISES.length).padStart(2, "0")}
            </span>
            <button
              onClick={() => setSelectedIdx((i) => (i + 1) % FRANCHISES.length)}
              className="text-[11px] font-bold uppercase tracking-widest text-[#999999] hover:text-[#111111] transition-colors flex items-center gap-2 cursor-pointer"
            >
              Next
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>

        </div>
      </div>

    </section>
  )
}
