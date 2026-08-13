"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { DIVISIONS } from "@/components/home/content"

export function EditorialDivisions() {
  const [active, setActive] = React.useState(0)
  const current = DIVISIONS[active]

  return (
    <section className="bg-[#F8FAFC] px-6 py-28 text-[#0F172A] md:px-16 md:py-40 border-t border-[#E2E8F0]">
      <div className="mx-auto max-w-7xl">
        {/* Archival Sector Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between border-b border-[#CBD5E1] pb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-[#64748B]"
        >
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-[#2563EB]" />
            <span>COMMERCIAL ECOSYSTEM</span>
          </div>
          <span>CHAPTER 03 / DIVISIONS</span>
          <span>4 SECTORS</span>
        </motion.div>

        <div className="mt-16 max-w-3xl">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#2563EB]">
            COMMERCIAL ECOSYSTEM
          </span>
          <h2 className="mt-3 font-sans text-3xl font-black uppercase tracking-tight text-[#0F172A] sm:text-5xl">
            Four Sectors Under One House
          </h2>
        </div>

        {/* Asymmetric 2-Column Sector Stage */}
        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column — Sector List Ledger */}
          <div className="lg:col-span-5">
            <div className="space-y-4">
              {DIVISIONS.map((div, idx) => {
                const isSelected = idx === active
                return (
                  <button
                    key={div.key}
                    onClick={() => setActive(idx)}
                    className={`w-full border-l-4 p-6 text-left transition-all duration-300 ${
                      isSelected
                        ? "border-[#2563EB] bg-white shadow-md"
                        : "border-transparent bg-white/40 hover:bg-white/80"
                    }`}
                  >
                    <div className="flex items-baseline justify-between font-mono text-xs text-[#64748B]">
                      <span className={isSelected ? "font-bold text-[#2563EB]" : ""}>
                        SEC 0{idx + 1}
                      </span>
                      <span>SINCE {div.since}</span>
                    </div>
                    <h3 className="mt-2 font-sans text-2xl font-bold uppercase text-[#0F172A]">
                      {div.name}
                    </h3>
                    <p className="mt-2 text-sm text-[#475569] line-clamp-2 leading-relaxed">
                      {div.summary}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Column — Display Photo Frame with Smooth Crossfade */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[4/3] w-full overflow-hidden border-2 border-[#1E3A8A]/20 bg-[#E2E8F0] shadow-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.key}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative h-full w-full"
                >
                  <Image
                    src={current.image}
                    alt={current.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/50 via-transparent to-transparent" />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-4 flex items-baseline justify-between font-mono text-[11px] text-[#64748B]">
              <span className="font-bold text-[#0F172A]">[SITE] {current.figure}</span>
              <Link
                href={current.href}
                className="group flex items-center gap-1 font-bold text-[#2563EB] hover:underline"
              >
                <span>EXPLORE {current.name.toUpperCase()}</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
