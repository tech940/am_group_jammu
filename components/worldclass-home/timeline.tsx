"use client"

import * as React from "react"

// Dark section — structural contrast against the surrounding light sections.
// Year numbers as primary visual element. Simple column grid with top borders.
const MILESTONES = [
  {
    year: "1968",
    title: "Petroleum Foundation",
    description: "Hindustan Petroleum and Indian Oil stations begin the group's 58-year history in Jammu & Kashmir.",
  },
  {
    year: "2004",
    title: "First Car Franchise",
    description: "Chevrolet dealership marks the group's entry into passenger vehicles. GM awards follow from 2006.",
  },
  {
    year: "2008",
    title: "AM Hyundai Opens",
    description: "The group's largest automotive business. Multiple national best-seller awards in the decade that follows.",
  },
  {
    year: "2024",
    title: "Kia · MG · Bajaj",
    description: "Three franchise appointments in a single year — the broadest expansion since the company's founding.",
  },
]

export function WorldclassTimeline() {
  return (
    <section className="bg-[#0A0A0A] py-24 px-6 md:px-14">
      <div className="max-w-7xl mx-auto">

        {/* Label */}
        <p className="text-[11px] font-mono tracking-[0.3em] text-white/30 uppercase mb-16">
          58 Years — 1968 to 2025
        </p>

        {/* Milestone grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
          {MILESTONES.map((m) => (
            <div key={m.year} className="bg-[#0A0A0A] p-8">
              {/* Year — large, muted */}
              <p className="text-6xl font-black text-white/10 tracking-tight leading-none mb-8">
                {m.year}
              </p>
              {/* Title */}
              <h3 className="text-base font-bold text-white mb-3">{m.title}</h3>
              {/* Description */}
              <p className="text-sm text-white/40 leading-relaxed">{m.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
