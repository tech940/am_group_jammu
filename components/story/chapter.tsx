"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { useStoryMotion, EASE_OUT, DUR } from "./motion"

/**
 * The chapter shell.
 *
 * The whole point of this file is that chapters OVERLAP rather than replace one
 * another. Each chapter owns a sticky full-height plate that sits behind its
 * own content; as the chapter scrolls out, its plate fades, revealing the next
 * chapter's plate which is already pinned underneath. The reader never sees a
 * hard section boundary — one environment becomes the next.
 *
 * Only opacity and transform are animated, so every transition is
 * compositor-only regardless of how large the photograph is. Nothing here
 * animates width, height, top or filter.
 *
 * Cost control: a plate is `loading="lazy"` unless it is the opening frame, and
 * `sizes="100vw"` so a phone is served a phone-width AVIF of what may be a
 * 4229px original. Only two plates are ever near the viewport at once because
 * the fade window is short.
 */

export type Ground = "void" | "ink" | "deep" | "deep-2" | "graphite" | "ground" | "ground-2"

const GROUND_CLASS: Record<Ground, string> = {
  void: "bg-void text-on-deep",
  ink: "bg-ink text-on-deep",
  deep: "bg-deep text-on-deep",
  "deep-2": "bg-deep-2 text-on-deep",
  graphite: "bg-graphite text-on-deep",
  ground: "bg-ground text-ink",
  "ground-2": "bg-ground-2 text-ink",
}

/** Dark grounds flip the global focus outline to paper via [data-ground]. */
const IS_DARK: Record<Ground, boolean> = {
  void: true,
  ink: true,
  deep: true,
  "deep-2": true,
  graphite: true,
  ground: false,
  "ground-2": false,
}

export interface ChapterPlate {
  src: string
  alt: string
  /** Opening frame only — everything else waits. */
  priority?: boolean
  /** 0–1. How far the scrim darkens the photograph. */
  scrim?: number
  /** object-position, for photographs whose subject is off-centre. */
  position?: string
}

export function Chapter({
  id,
  label,
  ground,
  plate,
  children,
  className = "",
}: {
  id: string
  /** Announced to assistive tech as the chapter's accessible name. */
  label: string
  ground: Ground
  plate?: ChapterPlate
  children: React.ReactNode
  className?: string
}) {
  const ref = React.useRef<HTMLElement>(null)
  const { reduce } = useStoryMotion()

  // Progress across THIS chapter: 0 as its top meets the viewport bottom,
  // 1 as its bottom leaves the viewport top.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  // The dissolve. Held fully opaque through the body of the chapter, then
  // released over the last ~18% so the next plate emerges underneath. The
  // asymmetry is deliberate: the incoming plate is already at rest, so the
  // outgoing one does the work — an exit, and exits are subtler than entrances.
  const plateOpacity = useTransform(scrollYProgress, [0, 0.08, 0.82, 1], [0, 1, 1, 0])

  // A very small drift. 4% over a whole chapter reads as depth, not parallax —
  // large-scale parallax is a vestibular trigger and is disabled under reduce.
  const plateScale = useTransform(scrollYProgress, [0, 1], [1.04, 1])

  return (
    <section
      ref={ref}
      id={id}
      aria-label={label}
      data-ground={IS_DARK[ground] ? "deep" : undefined}
      className={`relative isolate ${GROUND_CLASS[ground]} ${className}`}
    >
      {plate && (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          {/* The sticky element and the fill container must be separate: a
              next/image with `fill` requires its parent to be relative,
              absolute or fixed, and `sticky` is none of those — it silently
              mispositions the plate. Sticky on the outer, relative on the
              inner, animation on the inner so the pin itself is never
              transformed. */}
          <div className="sticky top-0 h-svh w-full">
            <motion.div
              className="relative h-full w-full"
              style={
                reduce
                  ? undefined
                  : { opacity: plateOpacity, scale: plateScale, willChange: "opacity, transform" }
              }
            >
            <Image
              src={plate.src}
              alt={plate.alt}
              fill
              sizes="100vw"
              quality={90}
              priority={plate.priority}
              loading={plate.priority ? undefined : "lazy"}
              className="object-cover"
              style={{ objectPosition: plate.position ?? "center" }}
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, rgb(11 14 18 / ${
                  (plate.scrim ?? 0.55) * 0.9
                }), rgb(11 14 18 / ${plate.scrim ?? 0.55}))`,
              }}
            />
            </motion.div>
          </div>
        </div>
      )}

      {children}
    </section>
  )
}

/**
 * A chapter's opening statement. One per chapter, and deliberately the only
 * place a chapter announces itself — there is no repeated masthead recipe here,
 * which is what made the previous build read as eight of the same section.
 */
export function ChapterMark({
  index,
  kicker,
  className = "",
}: {
  index: string
  kicker: string
  className?: string
}) {
  const { settleProps } = useStoryMotion()
  return (
    <motion.p
      {...settleProps()}
      className={`flex items-center gap-3 text-meta uppercase ${className}`}
    >
      {/* Inherits the chapter's own text colour rather than naming an accent.
          With light AS the accent, a fixed `text-accent` would be warm white on
          the warm-white chapters and vanish; currentColor makes the number the
          brightest thing on a dark ground and the darkest on a light one, which
          is the same idea expressed correctly. */}
      <span data-num>{index}</span>
      <span aria-hidden className="h-px w-8 bg-current opacity-30" />
      <span className="opacity-70">{kicker}</span>
    </motion.p>
  )
}

/**
 * Scroll-scrubbed reveal for a photographic plate inside a chapter. clip-path
 * rather than opacity so the image wipes in like a drawing being uncovered —
 * the one place the drawing language shows up in motion rather than ornament.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const { reduce } = useStoryMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { clipPath: "inset(0 0 100% 0)", opacity: 0 }}
      whileInView={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: DUR.reveal, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  )
}
