"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { useReducedMotionSafe } from "@/components/system/use-reduced-motion"

/**
 * The two backdrops that need JavaScript, and nothing else does.
 *
 * Both follow the same contract as the rest of the motion system: reduced
 * motion is an ALTERNATIVE, not an annihilation. The CSS floor in globals.css
 * cannot reach either of these — framer writes transforms from rAF, and the
 * cursor glow writes a custom property — so each reads the preference itself.
 *
 * Both read `prefers-reduced-motion` through `useReducedMotionSafe`, which
 * exists because branching markup on framer's `useReducedMotion()` produces a
 * hydration mismatch React will not patch up. See that file for the full
 * reasoning.
 */

/**
 * Parallax background photograph.
 *
 * The image is rendered 120% tall and translated against the scroll, so it
 * never exposes an edge at either end of the travel — the usual bug with
 * scroll parallax is a strip of empty ground appearing at the bottom of the
 * band.
 *
 * Under reduce the transform collapses to a constant and the photograph is
 * simply a static background, which is what it is anyway.
 */
export function ParallaxImage({
  src,
  distance = 80,
  className = "",
  priority = false,
  quality,
}: {
  src: string
  /** Total travel in px across the band. Kept small; this is depth, not a ride. */
  distance?: number
  className?: string
  priority?: boolean
  quality?: 75 | 90
}) {
  const reduce = useReducedMotionSafe()
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [-distance, distance],
  )

  return (
    <div ref={ref} aria-hidden className={`absolute inset-0 overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="absolute inset-x-0 -top-[10%] h-[120%]">
        <Image
          src={src}
          alt=""
          fill
          priority={priority}
          quality={quality}
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>
    </div>
  )
}

/**
 * A soft light that follows the cursor.
 *
 * Three deliberate limits:
 *
 *  - **Fine pointers only.** On touch there is no cursor to follow, and
 *    attaching a pointermove listener there costs work for an effect nobody can
 *    see.
 *  - **Reduced motion turns it off**, because it is decoration by any
 *    definition — it communicates no state.
 *  - **It writes two custom properties, nothing else.** No React state, so
 *    moving the mouse never re-renders the tree; the paint is a single
 *    compositor-friendly gradient. The listener is passive and the write is
 *    batched into a rAF, so a fast pointer cannot outrun the frame budget.
 */
export function CursorGlow({
  className = "",
  strength = 0.16,
  size = "36%",
}: {
  className?: string
  strength?: number
  size?: string
}) {
  const reduce = useReducedMotionSafe()
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const el = ref.current
    const host = el?.parentElement
    if (!el || !host) return
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return

    // Fade in by writing the style directly rather than through React state.
    // Enabling this is a decision about the environment, not about the render
    // tree, and a setState here would re-render the whole band for a value that
    // only ever changes once.
    el.style.opacity = "1"

    let frame = 0
    let x = 50
    let y = 50

    const paint = () => {
      frame = 0
      el.style.setProperty("--mx", `${x}%`)
      el.style.setProperty("--my", `${y}%`)
    }

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      x = ((e.clientX - r.left) / r.width) * 100
      y = ((e.clientY - r.top) / r.height) * 100
      // Coalesced into one write per frame, so a fast pointer cannot outrun the
      // frame budget by queueing a style write per event.
      if (!frame) frame = requestAnimationFrame(paint)
    }

    host.addEventListener("pointermove", onMove, { passive: true })
    return () => {
      host.removeEventListener("pointermove", onMove)
      if (frame) cancelAnimationFrame(frame)
      el.style.opacity = "0"
    }
  }, [reduce])

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-(--duration-3) ${className}`}
      style={{
        backgroundImage: `radial-gradient(circle ${size} at var(--mx, 50%) var(--my, 50%), rgb(var(--backdrop-bright) / ${strength}) 0%, transparent 70%)`,
      }}
    />
  )
}
