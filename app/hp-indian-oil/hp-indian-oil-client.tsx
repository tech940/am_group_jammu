"use client"

import React from "react"
import Image from "next/image"
import { PlateCaption, Settle } from "@/components/system/marks"

const OPERATIONS = [
  { title: "Premium Fuel", desc: "High-octane and additives-enriched fuels for better engine life." },
  { title: "Lubricants", desc: "Full range of high-performance lubricants for all vehicle types." },
  { title: "Trust & Quality", desc: "Certified volume and quality checks for absolute transparency." },
  { title: "Wide Network", desc: "Strategically located outlets across the region for your convenience." },
]

export default function EnergyPage() {
  return (
    <div className="min-h-screen bg-ground">
      {/* Hero Section with Official Image */}
      <section
        data-ground="deep"
        className="relative flex min-h-[70vh] items-center overflow-hidden bg-deep"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="https://amgroupind.com/wp-content/uploads/2024/10/HP-and-Indian-Oil.jpg"
            alt="HP and Indian Oil"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
          {/* Directional scrim over photography — legitimate, and kept. */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-deep via-deep/80 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 pt-28 md:px-10 md:pt-32">
          <div className="max-w-4xl">
            <Settle>
              <div className="mb-10 inline-flex items-center gap-4">
                <span aria-hidden className="h-px w-12 bg-line-on-deep" />
                <span className="text-meta uppercase text-on-deep-2">
                  About Our Energy Vertical
                </span>
              </div>

              <h1 className="mb-12 font-display text-display uppercase text-on-deep">
                HP & <br />
                <span className="text-on-deep-2">Indian Oil</span>
              </h1>

              <p className="mb-12 max-w-2xl border-l border-line-on-deep pl-6 text-body-lg text-on-deep-2 md:pl-10">
                Our group owns gas distribution for Indian Oil and Hindustan Petroleum,
                as well as gas stations for Indian Oil Corp. We are a prominent player in the
                Indian oil and gas industry, providing essential fuels and petroleum products nationwide.
              </p>
            </Settle>
          </div>
        </div>
      </section>

      {/* Content Section with Side Images */}
      <section className="bg-ground py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <Settle className="space-y-8">
              <h2 className="font-display text-h1 uppercase text-ink">
                National <span className="text-ink-3">Distribution Network</span>
              </h2>
              <p className="text-body-lg text-ink-2">
                Our extensive network of gas stations and gas distribution infrastructure enables us to efficiently transport and distribute fuel to our customers, supporting their energy needs and contributing to the growth of the Indian economy.
              </p>
              <p className="text-body-lg text-ink-2">
                Our unwavering commitment to quality and customer satisfaction has established us as a trusted partner in India&apos;s energy sector.
              </p>

              <div className="border-t border-line pt-6">
                <h4 className="text-meta uppercase text-ink">Fueling Growth</h4>
                <p className="mt-2 text-small text-ink-2">Supporting the heartbeat of Indian commerce.</p>
              </div>
            </Settle>

            <div className="grid grid-cols-2 gap-6">
              <Settle>
                <figure className="border border-line bg-surface p-2">
                  <div className="relative mb-2 aspect-[3/4] overflow-hidden bg-ground-2">
                    <Image
                      src="https://amgroupind.com/wp-content/uploads/2024/10/indian-oil-1-1024x768.webp"
                      alt="Indian Oil Station"
                      fill
                      sizes="(max-width: 1024px) 45vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                  <PlateCaption fig="FIG. 01">Indian Oil Station</PlateCaption>
                </figure>
              </Settle>
              <Settle delay={0.12} className="mt-12">
                <figure className="border border-line bg-surface p-2">
                  <div className="relative mb-2 aspect-[3/4] overflow-hidden bg-ground-2">
                    <Image
                      src="https://amgroupind.com/wp-content/uploads/2024/10/hp-1024x683.webp"
                      alt="HP Station"
                      fill
                      sizes="(max-width: 1024px) 45vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                  <PlateCaption fig="FIG. 02">HP Station</PlateCaption>
                </figure>
              </Settle>
            </div>
          </div>
        </div>
      </section>

      {/* Shared Services Grid */}
      <section className="bg-ground-2 py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10">
          <div className="mb-16 text-center">
            <p className="text-meta uppercase text-ink-2">Our Operations</p>
            <h2 className="mt-4 font-display text-h1 uppercase text-ink">
              Commitment to <span className="text-ink-3">Excellence</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {OPERATIONS.map((item, index) => (
              <Settle key={item.title} delay={index * 0.08} className="h-full">
                <div className="h-full border border-line bg-surface p-6">
                  <h3 className="font-display text-h3 uppercase text-ink">{item.title}</h3>
                  <p className="mt-3 text-body text-ink-2">{item.desc}</p>
                </div>
              </Settle>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
