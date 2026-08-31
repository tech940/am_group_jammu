"use client"

import { motion } from "framer-motion"
import { useReducedMotionSafe } from "@/components/system/use-reduced-motion"

/**
 * The drawn accent rule that opens every section head.
 *
 * DESIGN.md's motion table has always specified this — "Reveal: scaleX from
 * origin for rules · duration-4" — but every Head rendered its rule static.
 * This is the smallest scroll-triggered animation the system owns: one span,
 * one transform, once, and because it lives in the shared Head it gives every
 * band on every route its enter cue without a single page opting in.
 *
 * Static under reduced motion; the rule is information (a section starts
 * here), the draw is not.
 */
export function RuleDraw({ className = "" }: { className?: string }) {
  const reduce = useReducedMotionSafe()
  return (
    <motion.span
      aria-hidden
      className={`block h-px origin-left ${className}`}
      initial={reduce ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    />
  )
}
