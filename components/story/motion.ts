"use client"

import { useReducedMotion } from "framer-motion"

/**
 * The homepage's motion language.
 *
 * One easing family, four durations, and a hard split between two kinds of
 * motion — the distinction the whole page rests on:
 *
 *   SCRUBBED  motion is bound to scroll position. Use it ONLY for the story's
 *             passage of time: the rule extending, the year counting, one
 *             chapter dissolving into the next, the route drawing across the
 *             map. Scroll-linked motion inherits scroll SPEED, which is wrong
 *             for interface feedback but exactly right for "you are moving
 *             through 58 years" — the reader sets the pace of the story.
 *
 *   TRIGGERED motion fires once when an element enters and runs for a fixed
 *             duration regardless of how fast the reader scrolled. Everything
 *             that is CONTENT — headings, paragraphs, register rows, plates —
 *             is triggered, so text never feels rubber-banded to the wheel.
 *
 * Getting this backwards is the classic scroll-story failure: text that
 * stutters because the reader flicked, and transitions that feel arbitrary
 * because they are not anchored to anything.
 */

/** Entrances, expansions, reveals. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const
/** Exits. Shorter and smaller than the matching entrance. */
export const EASE_IN = [0.4, 0, 1, 1] as const
/** Position changes that travel in both directions. */
export const EASE_MOVE = [0.65, 0, 0.35, 1] as const

export const DUR = {
  /** press, hover, colour */
  press: 0.12,
  /** small UI, chips, captions */
  quick: 0.18,
  /** standard content settle */
  settle: 0.55,
  /** photographic reveal, line draw */
  reveal: 0.9,
} as const

/**
 * The single entrance in the system. Opacity plus an 8px rise — no scale, no
 * blur on large photographic surfaces (blur on a full-bleed plate is a paint
 * cost, not a polish), and never a bounce.
 */
export const settle = {
  hidden: { opacity: 0, y: 8 },
  shown: { opacity: 1, y: 0 },
} as const

export function settleTransition(delay = 0) {
  return { duration: DUR.settle, delay, ease: EASE_OUT }
}

/** Stagger step for a list of settling children. Small: 8 rows should not take 2s. */
export const STAGGER = 0.06

/** Viewport config for triggered motion. Fires once, slightly before entry. */
export const ONCE = { once: true, margin: "-15% 0px -10% 0px" } as const

/**
 * Reduced motion is not "no motion" here — it is "no travel".
 *
 * The narrative survives: the rule renders complete, the year shows its final
 * value, chapters stack and scroll normally. What goes is everything that
 * moves through space — pinning, parallax, dissolves, the 8px rise. Opacity and
 * colour still transition so state changes stay legible.
 */
export function useStoryMotion() {
  const reduce = useReducedMotion() ?? false
  return {
    reduce,
    /** Spread onto a motion element for the standard triggered entrance. */
    settleProps(delay = 0) {
      if (reduce) return { initial: false as const }
      return {
        initial: settle.hidden,
        whileInView: settle.shown,
        viewport: ONCE,
        transition: settleTransition(delay),
      }
    },
  }
}
