"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { AM_KIA_SHOWROOM } from "@/lib/supabase-media"

export function EditorialHero({ founded }: { founded: number }) {
  const ref = React.useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  // Multi-layer parallax scroll transforms
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const textY = useTransform(scrollYProgress, [0, 1], [0, -100])
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 150])
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15])

  return (
    <section
      ref={ref}
      aria-label="AM Group — Cinematic Opener"
      className="relative flex h-svh min-h-[42rem] flex-col justify-between overflow-hidden text-white px-6 py-10 md:px-16 md:py-14"
    >
      {/* Background Kia Showroom Store Image Layer (z-0) — No bg color blocking it! */}
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
        {/* Subtle dark gradient scrim to keep text legible without obscuring the showroom photo */}
        <div className="absolute inset-0 bg-[#0B192C]/40" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0B192C] via-[#0B192C]/60 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-[#0B192C]/70 to-transparent" />
      </div>

      {/* Content Layer (relative z-10) */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Top Header Annotations */}
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.3em] text-[#94A3B8]">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB] animate-pulse" />
            <span className="font-bold text-white drop-shadow-sm">AM KIA SHOWROOM · JAMMU</span>
          </div>
          <div className="hidden sm:block">FLAGSHIP STORE 1968–{new Date().getFullYear()}</div>
          <div className="font-bold text-[#60A5FA]">EST. {founded}</div>
        </div>

        {/* Centerpiece Display Composition with Parallax Elevation */}
        <motion.div style={{ opacity: textOpacity, y: textY }} className="my-auto max-w-5xl">
          <div>
            <span className="inline-block rounded-xs bg-[#1E3A8A]/90 px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.25em] text-[#93C5FD] border border-[#3B82F6]/60 shadow-xl backdrop-blur-xs">
              AM KIA SHOWROOM STORE · JAMMU
            </span>
          </div>

          <h1 className="mt-6 font-sans text-[clamp(3.5rem,10vw,8.5rem)] font-black uppercase leading-[0.9] tracking-tight text-white drop-shadow-2xl">
            Keeping J&amp;K Moving
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-white font-sans leading-relaxed drop-shadow-md">
            Energy distribution, passenger vehicles, commercial real estate, and organized retail serving Jammu &amp; Kashmir for over 58 years.
          </p>
        </motion.div>

        {/* Bottom Architectural Callout & Animated Scroll Prompt */}
        <div className="flex items-end justify-between font-mono text-[11px] uppercase tracking-[0.25em] text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <span className="text-[#3B82F6] font-bold">GPS:</span>
            <span className="text-white">32°42&apos;59&quot;N 74°51&apos;25&quot;E</span>
          </div>
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex h-8 w-5 items-start justify-center rounded-full border border-[#3B82F6] p-1 bg-[#0B192C]/50"
            >
              <span className="h-1.5 w-1 rounded-full bg-[#2563EB]" />
            </motion.div>
            <span className="font-bold text-white">PARALLAX SCROLL STORY</span>
          </div>
        </div>
      </div>
    </section>
  )
}
