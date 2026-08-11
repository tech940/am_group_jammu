"use client"

import * as React from "react"
import Image from "next/image"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { FRANCHISES } from "./content"
import { PlateCaption, TitleBlock } from "@/components/system/marks"

/**
 * Sheet 03 — franchise register.
 *
 * Not a logo grid. Each marque is a register entry: number, name, appointment
 * year, category — hovering or focusing a row swaps the photography to that
 * franchise's real facility. The register reads correctly with no pointer at
 * all; the plate is enrichment, not the content.
 */

export function Brands() {
  const [active, setActive] = React.useState(0)
  const reduce = useReducedMotion()
  const franchise = FRANCHISES[active]

  return (
    <section id="brands" aria-labelledby="brands-title" className="scroll-mt-16 bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <TitleBlock sheet="03" title="Franchise register" scale={`${FRANCHISES.length} marques`} />

        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <h2
            id="brands-title"
            className="max-w-[16ch] font-display text-5xl font-bold uppercase leading-[0.95] text-ink md:text-7xl"
          >
            Eight marques, <span className="text-redline">one counter</span>
          </h2>
          <p className="max-w-[44ch] text-[15px] leading-relaxed text-steel">
            Every franchise below is an OEM appointment the group holds today — with the year it was
            won. Chevrolet is kept on the register: its owners are still serviced here.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          {/* Register */}
          <table className="w-full self-start border-collapse">
            <thead>
              <tr className="border-b border-ink/40 text-left font-anno text-[10px] uppercase tracking-[0.14em] text-steel">
                <th scope="col" className="py-2 pr-3 font-normal">No.</th>
                <th scope="col" className="py-2 pr-3 font-normal">Marque</th>
                <th scope="col" className="py-2 pr-3 font-normal">Appointed</th>
                <th scope="col" className="hidden py-2 font-normal sm:table-cell">Category</th>
              </tr>
            </thead>
            <tbody>
              {FRANCHISES.map((f, i) => {
                const selected = i === active
                return (
                  <tr
                    key={f.name}
                    onMouseEnter={() => setActive(i)}
                    className={`cursor-default border-b border-ink/15 transition-colors ${
                      selected ? "bg-ink text-paper" : "text-ink hover:bg-paper-2"
                    }`}
                  >
                    <td className={`py-4 pr-3 font-anno text-[11px] ${selected ? "text-print-dim" : "text-steel"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td className="py-4 pr-3">
                      <button
                        type="button"
                        onClick={() => setActive(i)}
                        onFocus={() => setActive(i)}
                        className="text-left font-display text-2xl font-semibold uppercase leading-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-redline md:text-3xl"
                        aria-label={`Show ${f.name} facility photograph`}
                      >
                        {f.name}
                      </button>
                      <span className={`mt-1 block font-anno text-[10px] uppercase tracking-[0.1em] ${selected ? "text-print-dim" : "text-steel"}`}>
                        {f.entity}
                      </span>
                    </td>
                    <td className="py-4 pr-3 font-display text-2xl font-semibold md:text-3xl">
                      {f.since}
                    </td>
                    <td className={`hidden py-4 font-anno text-[10px] uppercase tracking-[0.1em] sm:table-cell ${selected ? "text-print-dim" : "text-steel"}`}>
                      {f.category}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Plate */}
          <figure className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative aspect-[4/3] overflow-hidden border border-ink/25">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={franchise.name}
                  className="absolute inset-0"
                  initial={reduce ? { opacity: 0 } : { clipPath: "inset(100% 0 0 0)" }}
                  animate={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0 0 0)" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Image
                    src={franchise.image}
                    alt={franchise.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-4">
              <PlateCaption fig={`REG. ${String(active + 1).padStart(2, "0")}`}>
                {franchise.entity} — appointed {franchise.since}
              </PlateCaption>
            </div>
          </figure>
        </div>
      </div>
    </section>
  )
}
