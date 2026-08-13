"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { CIRCUIT, FOUNDED } from "@/components/home/content"
import { PRIMARY_LOCATION } from "@/lib/locations"

export function EditorialFuture() {
  return (
    <section className="bg-[#FFFFFF] px-6 py-28 text-[#0F172A] md:px-16 md:py-40 border-t border-[#E2E8F0]">
      <div className="mx-auto max-w-7xl">
        {/* Archival Future Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between border-b border-[#CBD5E1] pb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-[#64748B]"
        >
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-[#2563EB]" />
            <span>CONTINUING THE RECORD</span>
          </div>
          <span>EST. {FOUNDED}</span>
          <span>THE NEXT CHAPTER</span>
        </motion.div>

        {/* Big Future Headline */}
        <div className="mt-16 max-w-4xl">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#2563EB]">
            FUTURE HORIZON
          </span>
          <h2 className="mt-4 font-sans text-[clamp(2.5rem,7vw,5.5rem)] font-black uppercase leading-[0.95] tracking-tight text-[#0F172A]">
            Drawn In {FOUNDED}. Still Being Drawn.
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-[#475569] leading-relaxed">
            In 2024, the group delivered its broadest expansion since foundation — adding Kia, MG, and Bajaj franchises in a single year alongside organised retail.
          </p>
        </div>

        {/* Ownership Circuit Grid with Hover Motion */}
        <div className="mt-16 grid grid-cols-1 gap-px border border-[#CBD5E1] bg-[#CBD5E1] sm:grid-cols-2 lg:grid-cols-3">
          {CIRCUIT.map((stop, idx) => {
            const Content = (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="group flex h-full flex-col justify-between bg-white p-8 transition-colors duration-200 hover:bg-[#EFF6FF]"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-[#2563EB]">
                    CIRCUIT 0{idx + 1}
                  </span>
                  <h3 className="mt-3 font-sans text-xl font-bold uppercase text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                    {stop.label}
                  </h3>
                  <p className="mt-2 text-sm text-[#475569] leading-relaxed">
                    {stop.detail}
                  </p>
                </div>
                <div className="mt-6 pt-4 font-mono text-xs font-bold uppercase text-[#2563EB] flex items-center gap-1">
                  <span>ACCESS</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </motion.div>
            )

            return stop.href ? (
              <Link key={stop.label} href={stop.href}>
                {Content}
              </Link>
            ) : (
              <div key={stop.label}>{Content}</div>
            )
          })}
        </div>

        {/* Primary Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 flex flex-wrap items-center gap-4 border-t border-[#CBD5E1] pt-12"
        >
          <Link
            href="/locations"
            className="border-2 border-[#2563EB] bg-[#2563EB] px-8 py-4 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-md transition-colors hover:bg-[#1D4ED8]"
          >
            VISIT A SHOWROOM →
          </Link>
          <Link
            href="/inventory"
            className="border-2 border-[#0F172A] bg-white px-8 py-4 font-mono text-xs font-bold uppercase tracking-widest text-[#0F172A] transition-colors hover:bg-[#F8FAFC]"
          >
            CERTIFIED USED CARS
          </Link>
          <a
            href={`mailto:${PRIMARY_LOCATION.email}`}
            className="font-mono text-xs font-bold uppercase tracking-widest text-[#64748B] underline underline-offset-4 hover:text-[#0F172A]"
          >
            {PRIMARY_LOCATION.email}
          </a>
        </motion.div>
      </div>
    </section>
  )
}
