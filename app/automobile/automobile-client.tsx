"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { ArrowGlyph, Settle } from "@/components/system/marks"
import { GroupBrands } from "@/components/sections/group-brands"
import type { HomeInventory } from "@/lib/inventory/server"

const PILLARS = [
  { title: "Premium Fleet", desc: "Curated selection of high-performance and luxury vehicles." },
  { title: "Certified Quality", desc: "Every vehicle undergoes rigorous multi-point inspections." },
  { title: "Expert Service", desc: "State-of-the-art service centers with factory-trained technicians." },
  { title: "Innovation", desc: "Leading the transition to sustainable and electric mobility." },
]

export default function AutomobilePage({ byBodyType }: { byBodyType: HomeInventory["byBodyType"] }) {
  return (
    <div className="min-h-screen bg-ground">
      {/* Hero Section */}
      <section data-ground="deep" className="flex min-h-[80vh] items-center bg-deep-2">
        <div className="mx-auto w-full max-w-[1400px] px-5 pt-28 md:px-10 md:pt-32">
          <div className="max-w-4xl">
            <Settle>
              <div className="mb-10 inline-flex items-center gap-4">
                <span aria-hidden className="h-px w-12 bg-accent" />
                <span className="text-meta uppercase text-accent-text-dark">
                  Automotive Excellence
                </span>
              </div>

              <h1 className="mb-12 font-display text-display uppercase text-on-deep">
                Redefining the <br />
                <span className="text-accent-text-dark">Driving</span> Experience
              </h1>

              <p className="mb-12 max-w-2xl border-l border-line-on-deep pl-6 text-body-lg text-on-deep-2 md:pl-10">
                AM Group Jammu brings you the world&apos;s most prestigious automotive brands with
                unparalleled service and expertise.
              </p>

              <Button type="button" size="lg">
                Explore Brands
                <ArrowGlyph />
              </Button>
            </Settle>
          </div>
        </div>
      </section>

      {/* Excellence Section */}
      <section className="bg-ground py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((item, index) => (
              <Settle key={item.title} delay={index * 0.08}>
                <div className="border-t border-line pt-6">
                  <h3 className="font-display text-h3 uppercase text-ink">{item.title}</h3>
                  <p className="mt-3 text-body text-ink-2">{item.desc}</p>
                </div>
              </Settle>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Gallery Section */}
      <section className="bg-ground-2">
        <div className="mx-auto max-w-[1400px] px-5 pb-12 pt-20 md:px-10 md:pt-28">
          <p className="text-meta uppercase text-accent-text-light">Our Portfolio</p>
          <h2 className="mt-4 font-display text-h1 uppercase text-ink">
            Strategic Brand <span className="text-ink-3">Partnerships</span>
          </h2>
        </div>
      </section>
      <GroupBrands byBodyType={byBodyType} />
    </div>
  )
}
