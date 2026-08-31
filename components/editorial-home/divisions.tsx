"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { DIVISIONS } from "@/components/home/content"
import { useEditorialMotion } from "./shared/motion"

export function EditorialDivisions() {
  const { reduce } = useEditorialMotion()
  const [active, setActive] = React.useState(0)
  const current = DIVISIONS[active]

  return (
    <section className="bg-[#FAF9F6] px-6 py-36 text-[#0F172A] md:px-16 md:py-48 border-t border-[#E2E8F0]">
      <div className="mx-auto max-w-7xl">
        {/* Archival Sector Header */}
        <div className="flex items-center justify-between border-b border-[#CBD5E1] pb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-[#64748B]">
          <span>COMMERCIAL ECOSYSTEM</span>
          <span>CHAPTER 03 / WHAT WE DO</span>
          <span>4 SECTORS</span>
        </div>

        <div className="mt-16 max-w-3xl">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#0F172A]">
            COMMERCIAL ECOSYSTEM
          </span>
          <h2 className="mt-4 font-serif text-3xl font-black uppercase tracking-tight text-[#0F172A] sm:text-5xl">
            Four Sectors Under One House
          </h2>
        </div>

        {/* Asymmetric 2-Column Sector Stage */}
        <div className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
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
                        ? "border-[#0F172A] bg-white shadow-md"
                        : "border-transparent bg-white/40 hover:bg-white/80"
                    }`}
                  >
                    <div className="flex items-baseline justify-between font-mono text-xs text-[#64748B]">
                      <span className={isSelected ? "font-bold text-[#0F172A]" : ""}>
                        0{idx + 1} / {div.name.toUpperCase()}
                      </span>
                      <span>SINCE {div.since}</span>
                    </div>
                    <h3 className="mt-2 font-serif text-2xl font-bold uppercase text-[#0F172A]">
                      {div.name}
                    </h3>
                    <p className="mt-2 text-sm text-[#475569] line-clamp-2 leading-relaxed font-sans">
                      {div.summary}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Column — Display Photo Frame with Smooth Crossfade */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[4/3] w-full overflow-hidden border border-[#CBD5E1] bg-[#E2E8F0] shadow-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.key}
                  // The cross-fade survives reduce — opacity shifts nothing in
                  // the visual field. Only the 3% push-in is dropped.
                  initial={{ opacity: 0, scale: reduce ? 1 : 1.03 }}
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
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/40 via-transparent to-transparent" />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-4 flex items-baseline justify-between font-mono text-[11px] text-[#64748B]">
              <span className="font-bold text-[#0F172A]">[SITE] {current.figure}</span>
              <Link
                href={current.href}
                className="group flex items-center gap-1 font-bold text-[#0F172A] hover:underline"
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
