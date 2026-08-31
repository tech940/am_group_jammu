"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { AM_KIA_SHOWROOM } from "@/lib/supabase-media"
import { useEditorialMotion, useParallax } from "./shared/motion"

export function EditorialHero({ founded }: { founded: number }) {
  const { reduce } = useEditorialMotion()
  const ref = React.useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  // Multi-layer parallax scroll transforms. Each collapses to a constant under
  // reduced motion; the opacity fade is kept, since fading the title card out as
  // the reader leaves it moves nothing in the visual field.
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const textY = useParallax(scrollYProgress, [0, -100])
  const imageY = useParallax(scrollYProgress, [0, 140])
  const imageScale = useParallax(scrollYProgress, [1, 1.12])

  return (
    <section
      ref={ref}
      aria-label="AM Group — Premium Automotive Editorial Opener"
      className="relative flex h-svh min-h-[44rem] flex-col justify-between overflow-hidden text-white px-6 py-10 md:px-16 md:py-14"
    >
      {/* Background full-bleed retina photograph (z-0 layer) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          className="relative h-full w-full"
          style={{ y: imageY, scale: imageScale }}
        >
          <Image
            src={AM_KIA_SHOWROOM}
            alt="The AM Kia flagship showroom store in Jammu"
            fill
            priority
            quality={95}
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>
        {/* Subtle dark gradient overlay to ensure 100% text legibility */}
        <div className="absolute inset-0 bg-[#0B192C]/45" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0B192C] via-[#0B192C]/50 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-[#0B192C]/70 to-transparent" />
      </div>

      {/* Content Layer (relative z-10) */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Top Header Annotations */}
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.3em] text-[#94A3B8]">
          <div className="flex items-center gap-3">
            {/* Static, not pulsing — AGENTS.md bans decorative pulsing dots,
                and a loop next to the wordmark earns no meaning. */}
            <span className="h-2.5 w-2.5 rounded-full bg-[#38BDF8]" />
            <span className="font-bold text-white tracking-widest">AM GROUP</span>
          </div>
          <div className="hidden sm:block text-white/70">EST. {founded} · JAMMU &amp; KASHMIR</div>
          <div className="font-bold text-[#38BDF8]">ARCHIVE 1968–{new Date().getFullYear()}</div>
        </div>

        {/* Centerpiece Editorial Statement */}
        <motion.div style={{ opacity: textOpacity, y: textY }} className="my-auto max-w-5xl">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#38BDF8] font-bold">
            AUTOMOTIVE &amp; INDUSTRIAL DOCUMENTARY
          </p>

          <h1 className="mt-6 font-serif text-[clamp(3.5rem,9vw,7.5rem)] font-black uppercase leading-[0.92] tracking-tight text-white drop-shadow-2xl">
            It Started With One Move.
          </h1>

          <p className="mt-8 max-w-2xl text-xl text-[#CBD5E1] font-sans leading-relaxed drop-shadow-md">
            Fifty-eight years of energy distribution, passenger vehicles, commercial real estate, and organized retail across Jammu &amp; Kashmir.
          </p>
        </motion.div>

        {/* Bottom Scroll Prompt */}
        <div className="flex items-end justify-between font-mono text-[11px] uppercase tracking-[0.25em] text-[#94A3B8]">
          <div>GPS: 32°42&apos;59&quot;N 74°51&apos;25&quot;E</div>
          <div className="flex items-center gap-3">
            {/* The bob is a framer loop, not a CSS keyframe, so the global
                `animation-iteration-count: 1` in globals.css could never reach
                it — it ran forever under reduce. Gated here instead. */}
            <motion.div
              animate={reduce ? undefined : { y: [0, 6, 0] }}
              transition={reduce ? undefined : { duration: 1.5, repeat: Infinity }}
              className="flex h-8 w-5 items-start justify-center rounded-full border border-white/40 p-1 bg-[#0B192C]/60"
            >
              <span className="h-1.5 w-1 rounded-full bg-[#38BDF8]" />
            </motion.div>
            <span className="font-bold text-white">SCROLL TO UNFOLD STORY</span>
          </div>
        </div>
      </div>
    </section>
  )
}
