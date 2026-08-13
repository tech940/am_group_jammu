"use client"

import * as React from "react"
import Link from "next/link"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import { PRIMARY_LOCATION } from "@/lib/locations"

// Pure typography. No containers. No badges. No decorative elements.
export function WorldclassCTA({ stockCount }: { stockCount: number }) {
  const { onOpen } = useEnquiryModal()

  return (
    <section className="bg-white py-32 px-6 md:px-14 border-t border-[#E5E5E5]">
      <div className="max-w-5xl mx-auto text-center">

        <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-black tracking-[-0.02em] leading-[0.95] text-[#111111] mb-8">
          Come speak with us.<br />
          We are in Jammu &amp; Srinagar.
        </h2>

        <p className="text-base text-[#666666] leading-relaxed max-w-xl mx-auto mb-12">
          {stockCount > 0 ? stockCount : 27} certified vehicles in stock across both cities. 
          Eight franchises. Eight dealership campuses. One team.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            href="/inventory"
            className="bg-[#1D4ED8] hover:bg-[#1e40af] text-white px-10 py-5 text-sm font-bold uppercase tracking-widest transition-colors duration-200"
          >
            Explore Inventory
          </Link>
          <button
            onClick={() => onOpen()}
            className="text-[#111111] hover:text-[#1D4ED8] px-10 py-5 text-sm font-bold uppercase tracking-widest border border-[#E5E5E5] hover:border-[#1D4ED8] transition-colors duration-200 cursor-pointer"
          >
            Book a Visit
          </button>
        </div>

        {/* Contact line */}
        <div className="flex flex-wrap items-center justify-center gap-8 pt-10 border-t border-[#E5E5E5]">
          <a
            href={`tel:${PRIMARY_LOCATION.phoneE164}`}
            className="text-[11px] font-mono tracking-[0.2em] text-[#999999] hover:text-[#111111] transition-colors duration-200 uppercase"
          >
            {PRIMARY_LOCATION.phone}
          </a>
          <Link
            href="/locations"
            className="text-[11px] font-mono tracking-[0.2em] text-[#999999] hover:text-[#111111] underline underline-offset-4 transition-colors duration-200 uppercase"
          >
            View All Locations
          </Link>
          <Link
            href="/contact"
            className="text-[11px] font-mono tracking-[0.2em] text-[#999999] hover:text-[#111111] underline underline-offset-4 transition-colors duration-200 uppercase"
          >
            Contact Us
          </Link>
        </div>

      </div>
    </section>
  )
}
