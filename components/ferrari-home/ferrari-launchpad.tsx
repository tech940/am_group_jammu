"use client"

import * as React from "react"
import Link from "next/link"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"

export function FerrariLaunchpad({ stockCount }: { stockCount: number }) {
  const { onOpen } = useEnquiryModal()

  return (
    <section className="bg-[#0E1218] text-white py-24 px-6 md:px-14 border-b border-white/10 relative overflow-hidden">
      
      {/* Background Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 via-transparent to-[#E31837]/10 pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Title */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-mono uppercase tracking-widest">
            <span>PRE-OWNED INVENTORY LAUNCHPAD</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-sans font-bold text-white tracking-tight">
            DRIVING JAMMU &amp; KASHMIR <br />
            <span className="text-[#D4AF37]">INTO THE FUTURE.</span>
          </h2>

          <p className="text-base text-slate-300">
            Certified used vehicles, bank financing, motor insurance, and factory-authorized servicing under one roof.
          </p>
        </div>

        {/* Action Triggers Bar */}
        <div className="bg-white/5 p-8 border border-white/15 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          
          <div className="space-y-3 p-4 border border-white/10 bg-white/5">
            <span className="text-2xl font-sans font-bold text-[#D4AF37] block">
              {stockCount > 0 ? stockCount : 27} CARS
            </span>
            <p className="text-xs font-mono uppercase tracking-wider text-slate-300">Certified In Stock</p>
            <Link
              href="/inventory"
              className="inline-block mt-2 bg-[#D4AF37] text-[#080A0E] hover:bg-white px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors w-full"
            >
              Browse Stock
            </Link>
          </div>

          <div className="space-y-3 p-4 border border-white/10 bg-white/5">
            <span className="text-2xl font-sans font-bold text-white block">
              8 HUBS
            </span>
            <p className="text-xs font-mono uppercase tracking-wider text-slate-300">Showrooms &amp; Service</p>
            <Link
              href="/locations"
              className="inline-block mt-2 border border-white/20 text-white hover:border-[#D4AF37] hover:text-[#D4AF37] px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors w-full"
            >
              Locate Branch
            </Link>
          </div>

          <div className="space-y-3 p-4 border border-white/10 bg-white/5">
            <span className="text-2xl font-sans font-bold text-white block">
              DIRECT
            </span>
            <p className="text-xs font-mono uppercase tracking-wider text-slate-300">Advisor Desk</p>
            <button
              onClick={() => onOpen()}
              className="inline-block mt-2 bg-white/10 text-white hover:bg-white/20 border border-white/20 px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors w-full cursor-pointer"
            >
              Send Enquiry
            </button>
          </div>

        </div>

      </div>
    </section>
  )
}
