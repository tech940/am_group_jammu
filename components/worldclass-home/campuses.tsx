"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"
import { PRIMARY_LOCATION, whatsappUrl } from "@/lib/locations"

const CAMPUSES = [
  {
    id: "jammu-kia",
    name: "AM Kia Showroom & 3S Workshop",
    city: "Jammu",
    address: "N-H 1 Bye-Pass Road, Opp. Railway Station, Jammu — 180012",
    image: SUPABASE_MEDIA.branches["jammu-kia"].exterior,
    type: "Sales · Authorised Service · Genuine Spares",
  },
  {
    id: "jammu-hyundai",
    name: "AM Hyundai Flagship Campus",
    city: "Jammu",
    address: "N-H 1 Bye-Pass Road, Opp. Railway Station, Jammu — 180012",
    image: SUPABASE_MEDIA.branches["jammu-hyundai"].exterior,
    type: "Principal Hyundai Dealership J&K",
  },
  {
    id: "srinagar-hyundai",
    name: "AM Tower Srinagar Campus",
    city: "Srinagar",
    address: "Hyderpora Bye-Pass, Srinagar — 190014",
    image: SUPABASE_MEDIA.branches["srinagar-hyundai"].exterior,
    type: "Regional Headquarters · 3S Facility",
  },
  {
    id: "central-workshop",
    name: "AM Central Service Workshop",
    city: "Jammu",
    address: "Phase II Industrial Complex, Jammu",
    image: SUPABASE_MEDIA.branches["central-workshop"].exterior,
    type: "OEM Certified Automated Body Shop",
  },
]

export function WorldclassCampuses() {
  const [selected, setSelected] = React.useState(0)
  const current = CAMPUSES[selected] || CAMPUSES[0]

  return (
    <section className="bg-white">

      {/* Two-column: selector left, photo right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 border-b border-[#E5E5E5]">

        {/* Left — selector list */}
        <div className="flex flex-col border-r border-[#E5E5E5]">

          {/* Section label */}
          <div className="px-8 md:px-14 pt-20 pb-8">
            <p className="text-[11px] font-mono tracking-[0.3em] text-[#999999] uppercase">
              Dealership Campuses
            </p>
          </div>

          {/* Campus list */}
          <div className="flex-1">
            {CAMPUSES.map((campus, idx) => (
              <button
                key={campus.id}
                onClick={() => setSelected(idx)}
                className={`w-full text-left px-8 md:px-14 py-7 border-t border-[#E5E5E5] flex items-start justify-between gap-4 transition-colors duration-200 cursor-pointer ${
                  idx === selected ? "bg-[#111111] text-white" : "bg-white text-[#111111] hover:bg-[#F5F5F5]"
                }`}
              >
                <div>
                  <p className={`text-base font-bold mb-1 ${idx === selected ? "text-white" : "text-[#111111]"}`}>
                    {campus.name}
                  </p>
                  <p className={`text-[11px] font-mono tracking-wider uppercase ${idx === selected ? "text-white/50" : "text-[#999999]"}`}>
                    {campus.city} &mdash; {campus.type}
                  </p>
                </div>
                <span className={`text-[11px] font-mono flex-shrink-0 pt-0.5 ${idx === selected ? "text-white/30" : "text-[#CCCCCC]"}`}>
                  0{idx + 1}
                </span>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="px-8 md:px-14 py-8 border-t border-[#E5E5E5] flex flex-wrap items-center gap-4">
            <Link
              href="/locations"
              className="bg-[#1D4ED8] hover:bg-[#1e40af] text-white px-6 py-3 text-sm font-bold uppercase tracking-widest transition-colors duration-200"
            >
              All Locations
            </Link>
            <a
              href={`tel:${PRIMARY_LOCATION.phoneE164}`}
              className="text-[#111111] hover:text-[#1D4ED8] text-sm font-bold uppercase tracking-widest underline underline-offset-4 transition-colors duration-200"
            >
              {PRIMARY_LOCATION.phone}
            </a>
          </div>
        </div>

        {/* Right — raw photo, no rounded corners, no border */}
        <div className="relative min-h-[50vw] lg:min-h-0">
          <Image
            src={current.image}
            alt={current.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
          />
          {/* Address caption */}
          <div className="absolute bottom-0 left-0 right-0 px-8 py-5 bg-[#111111]/80 backdrop-blur-sm">
            <p className="text-white/50 text-[11px] font-mono tracking-wider">{current.address}</p>
          </div>
        </div>

      </div>
    </section>
  )
}
