"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useReducedMotionSafe } from "@/components/system/use-reduced-motion"

/**
 * Per-section entrance choreography: a group whose children settle in
 * sequence as the section scrolls into view.
 *
 * `Settle` (which every Band already uses) moves a section as ONE unit; these
 * two give a band internal rhythm — cards, rows and quotes arriving in order
 * rather than as a block. Same motion vocabulary as everything else: opacity
 * and a few pixels of travel, once, ease-out, and under reduced motion the
 * children render laid-out and still.
 *
 * Server bands can use these directly — the children stay server-rendered;
 * only the wrappers hydrate.
 */
const GROUP_VARIANTS = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
}

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
  },
}

export function RevealGroup({
  className = "",
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const reduce = useReducedMotionSafe()
  return (
    <motion.div
      className={className}
      variants={GROUP_VARIANTS}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({
  className = "",
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <motion.div className={className} variants={ITEM_VARIANTS}>
      {children}
    </motion.div>
  )
}
