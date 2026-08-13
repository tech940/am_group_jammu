"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"

const HUBS = [
  {
    id: "jammu-kia",
    name: "AM KIA SHOWROOM & WORKSHOP",
    campus: "AM Business Park, Jammu",
    address: "N-H 1 Bye-Pass Road, Opp. Railway Station, Jammu — 180012",
    image: SUPABASE_MEDIA.branches["jammu-kia"].exterior,
    type: "Sales, 3S Service & Spare Parts",
  },
  {
    id: "jammu-hyundai",
    name: "AM HYUNDAI FLAGSHIP DEALERSHIP",
    campus: "AM Business Park, Jammu",
    address: "N-H 1 Bye-Pass Road, Opp. Railway Station, Jammu — 180012",
    image: SUPABASE_MEDIA.branches["jammu-hyundai"].exterior,
    type: "Principal Hyundai Dealership J&K",
  },
  {
    id: "srinagar-hyundai",
    name: "AM TOWER SRINAGAR CAMPUS",
    campus: "Hyderpora Bye-Pass, Srinagar",
    address: "Hyderpora Bye-Pass, Srinagar — 190014",
    image: SUPABASE_MEDIA.branches["srinagar-hyundai"].exterior,
    type: "Regional Headquarters & 3S Facility",
  },
  {
    id: "central-workshop",
    name: "AM CENTRAL SERVICE WORKSHOP",
    campus: "Industrial Estate, Jammu",
    address: "Phase II Industrial Complex, Jammu",
    image: SUPABASE_MEDIA.branches["central-workshop"].exterior,
    type: "OEM Certified Master Workshop",
  },
  {
    id: "luxury-showrooms",
    name: "AM MG MOTOR LUXURY SHOWROOM",
    campus: "AM Business Park, Jammu",
    address: "N-H 1 Bye-Pass Road, Jammu",
    image: SUPABASE_MEDIA.branches["luxury-showrooms"].mg,
    type: "EV & Luxury SUV Experience Center",
  },
  {
    id: "smegamart",
    name: "S MEGA MART RETAIL STOREFRONT",
    campus: "Srinagar Retail Hub",
    address: "Main Commercial Belt, Srinagar",
    image: SUPABASE_MEDIA.branches.smegamart.exterior,
    type: "Organized Departmental Retail",
  },
]

export function FerrariHubs() {
  const [selectedHub, setSelectedHub] = React.useState(0)
  const current = HUBS[selectedHub] || HUBS[0]

  return (
    <section className="bg-[#0E1218] text-white py-24 px-6 md:px-14 border-b border-white/10">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/15 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#D4AF37]">
                DEALERSHIP CAMPUSES • JAMMU &amp; SRINAGAR
              </span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-sans font-bold text-white tracking-tight">
              EIGHT BRANCHES. <span className="text-[#D4AF37]">REAL INFRASTRUCTURE.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm font-sans text-slate-300 leading-relaxed">
            Operating fully equipped authorized 3S dealership facilities with showroom floors, central body shops, automated diagnostics, and customer lounges.
          </p>
        </div>

        {/* Hubs Explorer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Branch List */}
          <div className="lg:col-span-5 space-y-3">
            {HUBS.map((hub, idx) => {
              const isSelected = idx === selectedHub
              return (
                <button
                  key={hub.id}
                  onClick={() => setSelectedHub(idx)}
                  className={`w-full text-left p-4 border transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-[#D4AF37] text-[#080A0E] border-[#D4AF37] font-bold shadow-lg"
                      : "bg-white/5 text-slate-300 hover:bg-white/10 border-white/15"
                  }`}
                >
                  <div className="space-y-1">
                    <p className="text-xs font-mono tracking-wider uppercase">{hub.name}</p>
                    <p className={`text-[11px] ${isSelected ? "text-[#080A0E]/80" : "text-slate-400"}`}>{hub.campus}</p>
                  </div>
                  <span className="text-xs font-mono">0{idx + 1}</span>
                </button>
              )
            })}
          </div>

          {/* Right Selected Campus Feature Plate */}
          <div className="lg:col-span-7 bg-white/5 p-6 md:p-8 border border-white/15 flex flex-col justify-between space-y-6">
            <div className="relative aspect-[16/10] w-full overflow-hidden border border-white/20">
              <Image
                src={current.image}
                alt={current.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center brightness-95"
              />
            </div>

            <div className="space-y-3">
              <span className="text-[11px] font-mono text-[#D4AF37] uppercase tracking-widest bg-[#D4AF37]/10 px-3 py-1 border border-[#D4AF37]/30 inline-block">
                {current.type}
              </span>
              <h3 className="text-2xl font-sans font-bold text-white">{current.name}</h3>
              <p className="text-xs font-mono text-slate-300">{current.address}</p>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-4">
              <Link
                href="/locations"
                className="bg-[#D4AF37] hover:bg-white text-[#080A0E] px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all"
              >
                View Branch Page
              </Link>
              <a
                href="https://maps.google.com/?q=AM+Group+Jammu"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/20 hover:border-[#D4AF37] text-white px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all"
              >
                Get Directions →
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
