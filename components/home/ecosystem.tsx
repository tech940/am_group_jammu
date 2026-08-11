"use client"

import * as React from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { CIRCUIT, NEWS } from "./content"
import { LoopGlyph, Settle, TitleBlock } from "@/components/system/marks"

/**
 * Sheet 07 — the ownership circuit + revision history.
 *
 * The circuit: what the group does for an owner after the sale, drawn as a
 * process line whose last station feeds the first — part-exchange restarts
 * the loop. Every stop is a service that exists today.
 *
 * The revision history: the four real news posts, entered as a drawing's
 * revision table.
 */

export function Ecosystem() {
  const reduce = useReducedMotion()

  return (
    <section id="news" aria-labelledby="circuit-title" className="scroll-mt-16 bg-print-deep py-20 text-paper md:py-28">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <TitleBlock sheet="07" title="Ownership circuit" scale="closed loop" tone="print" />

        <h2
          id="circuit-title"
          className="mt-8 max-w-[20ch] font-display text-5xl font-bold uppercase leading-[0.95] md:text-7xl"
        >
          The sale is the <span className="text-print-dim">midpoint</span>
        </h2>

        {/* The circuit */}
        <ol className="mt-14 grid gap-px bg-print-line/25 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {CIRCUIT.map((stop, i) => {
            const last = i === CIRCUIT.length - 1
            const body = (
              <>
                <div className="flex items-baseline justify-between">
                  <span className="font-anno text-[10px] tracking-[0.12em] text-print-dim">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <motion.span
                    aria-hidden
                    className="h-px w-8 origin-left bg-redline"
                    initial={reduce ? false : { scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <p className="mt-4 flex items-center gap-2 font-display text-3xl font-semibold uppercase leading-none">
                  {stop.label}
                  {last && <LoopGlyph className="text-redline-hi" />}
                </p>
                <p className="mt-3 text-[13px] leading-relaxed text-print-dim">{stop.detail}</p>
              </>
            )
            return (
              <li key={stop.label} className="bg-print-deep">
                {stop.href ? (
                  <Link
                    href={stop.href}
                    className="block h-full p-6 transition-colors hover:bg-print focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-paper"
                  >
                    {body}
                  </Link>
                ) : (
                  <div className="h-full p-6">{body}</div>
                )}
              </li>
            )
          })}
        </ol>

        {/* Revision history */}
        <div className="mt-20 grid gap-8 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <div>
            <h3 className="font-display text-3xl font-semibold uppercase leading-tight md:text-4xl">
              Revision history
            </h3>
            <p className="mt-3 max-w-[40ch] text-[14px] leading-relaxed text-print-dim">
              Milestones from the group&apos;s record. The full log lives on the news page.
            </p>
            <Link
              href="/blog"
              className="mt-6 inline-flex items-center gap-2 border border-paper/50 px-5 py-3 font-anno text-[11px] uppercase tracking-[0.12em] text-paper transition-colors hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
            >
              Open the log
            </Link>
          </div>

          <table className="w-full self-start border-collapse">
            <thead>
              <tr className="border-b border-print-line/50 text-left font-anno text-[10px] uppercase tracking-[0.14em] text-print-dim">
                <th scope="col" className="py-2 pr-4 font-normal">Rev.</th>
                <th scope="col" className="py-2 pr-4 font-normal">Date</th>
                <th scope="col" className="py-2 font-normal">Description</th>
              </tr>
            </thead>
            <tbody>
              {NEWS.map((n, i) => (
                <tr key={n.title} className="border-b border-print-line/25 align-top">
                  <td className="py-4 pr-4 font-anno text-[11px] text-redline-hi">
                    {String(NEWS.length - i).padStart(2, "0")}
                  </td>
                  <td className="whitespace-nowrap py-4 pr-4 font-anno text-[11px] text-print-dim">
                    {n.date}
                  </td>
                  <td className="py-4">
                    <Settle delay={i * 0.04}>
                      <p className="font-display text-xl font-semibold uppercase leading-tight md:text-2xl">
                        {n.title}
                      </p>
                      <p className="mt-1 text-[13px] leading-relaxed text-print-dim">{n.note}</p>
                    </Settle>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
