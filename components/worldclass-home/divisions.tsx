"use client"

import * as React from "react"
import Link from "next/link"
import { DIVISIONS } from "@/components/home/content"

// Editorial numbered table — no images, no cards. Structure through type and whitespace alone.
export function WorldclassDivisions() {
  return (
    <section className="bg-[#F5F5F5] py-24 px-6 md:px-14">
      <div className="max-w-7xl mx-auto">

        {/* Section label */}
        <p className="text-[11px] font-mono tracking-[0.3em] text-[#999999] uppercase mb-16">
          Business Units
        </p>

        {/* Numbered editorial list */}
        <div>
          {DIVISIONS.map((division, idx) => (
            <Link
              key={division.key}
              href={division.href}
              className="group flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-10 py-8 border-t border-[#DDDDDD] hover:bg-white transition-colors duration-200 px-0 sm:px-2 -mx-2"
            >
              {/* Number */}
              <span className="text-[11px] font-mono text-[#CCCCCC] w-8 flex-shrink-0 pt-1">
                {String(idx + 1).padStart(2, "0")}
              </span>

              {/* Division name */}
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#111111] w-52 flex-shrink-0 group-hover:text-[#1D4ED8] transition-colors duration-200">
                {division.name}
              </span>

              {/* Year */}
              <span className="text-[11px] font-mono text-[#999999] w-24 flex-shrink-0 hidden md:block">
                Est. {division.since}{division.sinceApprox ? "*" : ""}
              </span>

              {/* Summary */}
              <span className="text-sm text-[#666666] leading-relaxed flex-1">
                {division.summary}
              </span>

              {/* Arrow */}
              <span className="flex-shrink-0 text-[#CCCCCC] group-hover:text-[#1D4ED8] group-hover:translate-x-1 transition-all duration-200 hidden lg:block">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </Link>
          ))}
          {/* Close border */}
          <div className="border-t border-[#DDDDDD]" />
        </div>

      </div>
    </section>
  )
}
