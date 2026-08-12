"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { useStoryMotion, EASE_OUT, DUR } from "./motion"
import { useStage } from "./stage"

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

/**
 * TEXT COLOUR ONLY — no background.
 *
 * Chapters are transparent so the persistent StoryStage shows through; that is
 * what makes eight chapters read as one continuous surface instead of seven
 * hard seams. The stage is told which ground to paint by whichever chapter owns
 * the viewport (see stage.tsx).
 */
const GROUND_CLASS: Record<Ground, string> = {
  void: "text-on-deep",
  ink: "text-on-deep",
  deep: "text-on-deep",
  "deep-2": "text-on-deep",
  graphite: "text-on-deep",
  ground: "text-ink",
  "ground-2": "text-ink",
}

/** The actual surface colour each ground claims from the stage. */
export const GROUND_COLOR: Record<Ground, string> = {
  void: "#0b0e12",
  ink: "#14161a",
  deep: "#133a63",
  "deep-2": "#0d2a4a",
  graphite: "#1c2229",
  ground: "#f4f3ee",
  "ground-2": "#eae8e0",
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
  /**
   * 0–1. How far the scrim darkens the photograph.
   *
   * THIS VALUE AND THE TEXT COLOUR ARE ONE DECISION. Contrast must hold against
   * the BRIGHTEST patch of the photograph, not its average — a sky, a
   * windscreen or white signage will locally wash out text that measures fine
   * on the mean. Worst case taken as a ~240-luminance patch:
   *
   *   text-on-deep    (#F4F3EE)  needs scrim >= 0.56 for 4.5:1
   *   text-on-deep-2  (#A9BFDD)  needs scrim >= 0.70 for 4.5:1
   *
   * So `on-deep-2` — the secondary tone — is for FLAT dark grounds. Over a
   * plate, prose uses `on-deep` and takes its hierarchy from size and measure
   * instead. Chapter 01 shipped at 0.6 with on-deep-2 and was unreadable over
   * the forecourt's sky; the fix was the text colour, not more black over the
   * photograph.
   */
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
  const stage = useStage()

  // Whichever chapter covers the middle of the viewport owns the stage colour.
  // An observer on a zero-height band at 50% is the cheapest way to ask "which
  // chapter am I actually reading" without measuring on every scroll frame.
  React.useEffect(() => {
    const el = ref.current
    const claim = stage?.claim
    if (!el || !claim) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) claim(id, GROUND_COLOR[ground])
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [stage?.claim, ground, id])

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

  // will-change is promoted ONLY while this chapter is near the viewport.
  // Left unconditional it pinned a GPU layer for every plate on the page at all
  // times — measured with one plate 11,321px away still holding a layer. It is
  // a hint that an element is ABOUT to animate, not a standing declaration, and
  // the layer memory matters most on the midrange Android this audience uses.
  const near = useInView(ref, { margin: "100% 0px 100% 0px" })

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
                  : {
                      opacity: plateOpacity,
                      scale: plateScale,
                      willChange: near ? "opacity, transform" : "auto",
                    }
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
