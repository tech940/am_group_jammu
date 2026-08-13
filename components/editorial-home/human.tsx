"use client"

import { motion } from "framer-motion"
import { REVIEWS } from "@/components/home/content"

export function EditorialHuman() {
  return (
    <section className="bg-[#F8FAFC] px-6 py-28 text-[#0F172A] md:px-16 md:py-40 border-t border-[#E2E8F0]">
      <div className="mx-auto max-w-7xl">
        {/* Archival Testimonial Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between border-b border-[#CBD5E1] pb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-[#64748B]"
        >
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-[#2563EB]" />
            <span>VERBATIM REVIEWS</span>
          </div>
          <span>CHAPTER 06 / HUMAN</span>
          <span>STAFF RECOGNITION</span>
        </motion.div>

        <div className="mt-16 max-w-3xl">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#2563EB]">
            SERVICE RECORDS
          </span>
          <h2 className="mt-3 font-sans text-3xl font-black uppercase tracking-tight text-[#0F172A] sm:text-5xl">
            Customer Testimonials
          </h2>
          <p className="mt-4 text-base text-[#475569] leading-relaxed">
            Verbatim Google reviews naming floor advisors on the Jammu showroom floor.
          </p>
        </div>

        {/* 3 Editorial Review Cards with Staggered Spring Motion */}
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {REVIEWS.map((rev, idx) => (
            <motion.div
              key={rev.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.6, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col justify-between border border-[#CBD5E1] bg-white p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <span className="font-mono text-xs font-bold text-[#2563EB]">
                  RECORD 0{idx + 1} · {rev.date.toUpperCase()}
                </span>
                <blockquote className="mt-6 text-base italic leading-relaxed text-[#334155]">
                  &ldquo;{rev.quote}&rdquo;
                </blockquote>
              </div>
              <div className="mt-8 border-t border-[#E2E8F0] pt-4">
                <p className="font-sans text-base font-bold text-[#0F172A]">
                  {rev.name}
                </p>
                <p className="mt-1 font-mono text-xs text-[#64748B]">
                  {rev.meta}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
