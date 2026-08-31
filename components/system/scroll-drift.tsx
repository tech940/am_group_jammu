"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useReducedMotionSafe } from "@/components/system/use-reduced-motion"

/**
 * Scroll-linked drift for CONTENT — the depth the backdrops' ParallaxImage
 * gives photography, made available to anything.
 *
 * The wrapped element translates a small distance as it crosses the viewport,
 * proportional to scroll. Same stance as the journey scrub: this is direct
 * manipulation (the reader's own scroll position, reversible), not an
 * animation that plays at the reader — and under reduced motion the transform
 * collapses to zero and the element simply sits where it was laid out.
 *
 * The distances are deliberately small. ±16px reads as the page having
 * physical depth; ±60px reads as a theme park. Axis "x" exists for rails that
 * should drift sideways; positive distance moves WITH scroll direction.
 */
export function ScrollDrift({
  distance = 16,
  axis = "y",
  className = "",
  children,
}: {
  /** Total travel in px across the element's trip through the viewport. */
  distance?: number
  axis?: "x" | "y"
  className?: string
  children: React.ReactNode
}) {
  const reduce = useReducedMotionSafe()
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const travel = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [distance, -distance],
  )

  return (
    <motion.div
      ref={ref}
      className={className}
      style={axis === "y" ? { y: travel } : { x: travel }}
    >
      {children}
    </motion.div>
  )
}
