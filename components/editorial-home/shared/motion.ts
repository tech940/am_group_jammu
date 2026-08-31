"use client"

import * as React from "react"
import {
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion"

/**
 * The reduced-motion contract for the editorial homepage.
 *
 * app/globals.css carries a `prefers-reduced-motion` block, but that block is a
 * FLOOR, not a ceiling: it can only reach CSS transitions and CSS keyframes.
 * Every scene on this page animates through framer-motion, which writes
 * `transform` directly on the element each frame from rAF — no CSS transition is
 * involved, so `transition-property: ... !important` never applies to it. The
 * parallax, the pinned crossfades and the infinite scroll-prompt loop therefore
 * all ran at full strength for a reader who had asked the OS to stop them.
 *
 * The stance here matches the rest of the design system: reduced motion is an
 * ALTERNATIVE, not annihilation.
 *
 *  - Travel is removed.       Parallax, slide-ins and drifting layers go static.
 *  - Fades are kept.          Opacity does not move anything in the visual field
 *                             and is what the CSS floor itself keeps in its
 *                             allow-list, so cross-fades still read as designed.
 *  - Loops are stopped.       Anything with `repeat: Infinity` is decoration.
 *  - Indicators stay live.    See useProgress below.
 */
export function useEditorialMotion() {
  const prefers = useReducedMotion() ?? false

  // Deliberately withheld until after mount.
  //
  // framer-motion reads the media query eagerly, so on a machine set to reduce
  // the CLIENT's first render already knows it — while the server, which has no
  // media query at all, always rendered the full-motion branch. Anything whose
  // markup depends on `reduce` (framer writes `initial` as an inline style and
  // pathLength as SVG attributes, both during SSR) then hydrated against
  // different values, and React logged "some attributes of the server rendered
  // HTML didn't match... This won't be patched up" — leaving the server's
  // values stuck in the DOM.
  //
  // Holding false for the first render makes server and client agree, and the
  // effect flips it immediately after. The cost is a single frame of motion
  // before it settles; the alternative is a hydration mismatch that can strand
  // an element in the wrong state entirely.
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  return { reduce: mounted && prefers }
}

/**
 * Scroll-linked progress, with the inertia removed under reduced motion.
 *
 * A bar that follows the reader's own scroll is direct manipulation rather than
 * animation — freezing it would delete the page's only position cue and leave a
 * dead rule on screen. What IS synthetic is the spring: it overshoots and keeps
 * settling after the reader has already stopped. So under `reduce` we hand back
 * the raw scroll value, and the indicator tracks the scroll 1:1 with no bounce.
 */
export function useProgress(source: MotionValue<number>) {
  const { reduce } = useEditorialMotion()
  const eased = useSpring(source, { stiffness: 100, damping: 25 })
  return reduce ? source : eased
}

/**
 * A scroll-linked parallax value that collapses to a constant under reduce.
 *
 * `rest` defaults to the start of the range, which is correct for values that
 * begin at their natural position (scale 1 → 1.12). Ranges that straddle zero
 * (-30 → 30) must pass `rest` explicitly, otherwise the layer would sit frozen
 * at its extreme instead of where it belongs.
 */
export function useParallax(
  source: MotionValue<number>,
  range: [number, number],
  rest: number = range[0],
) {
  const { reduce } = useEditorialMotion()
  return useTransform(source, [0, 1], reduce ? [rest, rest] : range)
}
