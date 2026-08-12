"use client"

import * as React from "react"
import { motion, useScroll, useSpring, useTransform } from "framer-motion"
import { useStoryMotion } from "./motion"
import { useStage } from "./stage"

/**
 * THE RULE — the one element that connects the whole homepage.
 *
 * A single hairline down the left edge with a year riding it. It is three
 * things at once, which is why it never reads as a bolted-on widget:
 *
 *   - the timeline      (the year counts 1968 → the current year)
 *   - the progress      (the filled portion is how far through the story you are)
 *   - the thread        (it is present in every chapter, so nothing feels separate)
 *
 * It is the page's only scroll-LINKED element besides the chapter dissolves.
 * Everything else is triggered. See motion.ts for why that split matters.
 *
 * On the CH05 handoff: the rule does not literally rotate. A fixed-position
 * element rotating 90deg while staying pinned is fragile across viewports and
 * fights the scroll container. Instead the rule fades its year marker as the
 * geography chapter draws its own horizontal route — the same gesture, read as
 * one object turning, without the layout risk.
 */

export interface Chapter {
  id: string
  /** Short label for the rule's station list. */
  label: string
  /** The year this chapter sits at on the 1968→now scale, for the marker. */
  year: number
}

export function StoryRule({
  chapters,
  founded,
  currentYear,
  /** Chapter ids during which the year marker steps aside for the map. */
  quietFor = [],
}: {
  chapters: Chapter[]
  founded: number
  currentYear: number
  quietFor?: string[]
}) {
  const { reduce } = useStoryMotion()
  const { scrollYProgress } = useScroll()

  // A spring on the raw progress: scroll wheels emit coarse, jumpy deltas and
  // an un-damped bind makes the year flicker between values. bounce is 0 —
  // this is production motion, not a toy.
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })

  const fillScale = useTransform(progress, [0, 1], [0, 1])

  const [year, setYear] = React.useState(founded)

  // The active chapter comes from the STAGE, which learns it from an
  // IntersectionObserver on the real sections.
  //
  // It used to be derived here as `Math.floor(v * chapters.length)` — eight
  // equal bands of document progress. That is wrong for the same reason the
  // stage cannot interpolate evenly: the chapters are nothing like equal.
  // Measured spans run from 0.86vh (origin) to 4.4vh (businesses), so the
  // station labels drifted out of step with what was actually on screen and the
  // rule confidently named the wrong chapter. Observing real positions is the
  // only way this can be right.
  const stage = useStage()
  const activeId = stage?.activeId || chapters[0]?.id || ""

  React.useEffect(() => {
    // Under reduced motion the year is DERIVED (see displayYear below), not
    // set — a synchronous setState in an effect cascades an extra render for a
    // value that never changes.
    if (reduce) return
    // Subscribing to the motion value rather than re-rendering on scroll: this
    // callback runs on the animation frame, and only commits state when the
    // displayed value actually changes, so the year updates ~58 times across
    // the whole page instead of once per frame.
    return progress.on("change", (v) => {
      const span = currentYear - founded
      const next = Math.round(founded + v * span)
      setYear((prev) => (prev === next ? prev : next))
    })
  }, [progress, founded, currentYear, reduce])

  // Reduced motion shows the finished story: the rule is complete and the
  // year has already arrived at today.
  const displayYear = reduce ? currentYear : year
  const quiet = quietFor.includes(activeId)

  return (
    <div
      aria-hidden
      // mix-blend-difference is load-bearing, not an effect. The rule is fixed
      // and crosses both dark and warm-white chapters, and with LIGHT as the
      // accent a white hairline would disappear on the light ones. Difference
      // blending keeps it white over ink and flips it to near-black over paper,
      // so one element stays legible across every ground without JS.
      className="pointer-events-none fixed inset-y-0 left-0 z-30 hidden w-20 select-none mix-blend-difference lg:block"
    >
      {/* Track */}
      <div className="absolute inset-y-0 left-10 w-px bg-current opacity-15" />

      {/* Filled portion — scaleY from the top. transform only, so this is a
          compositor-only paint no matter how long the page gets. */}
      <motion.div
        className="absolute inset-y-0 left-10 w-px origin-top bg-accent"
        style={reduce ? { scaleY: 1 } : { scaleY: fillScale }}
      />

      {/* The year, riding the rule. Vertical text so it reads along the line
          rather than sitting beside it as a label. */}
      <motion.div
        className="absolute left-10 top-1/2 -translate-y-1/2 pl-4"
        animate={{ opacity: quiet ? 0 : 1 }}
        transition={{ duration: 0.24 }}
      >
        <span
          className="block font-display text-h3 leading-none tabular-nums text-accent"
          style={{ writingMode: "vertical-rl" }}
          data-num
        >
          {displayYear}
        </span>
      </motion.div>

      {/* Stations — one tick per chapter, the current one filled. This is the
          progress indicator, but drawn as part of the rule rather than as a
          separate bar. */}
      <ul className="absolute inset-y-0 left-10 flex w-px flex-col justify-between py-[18vh]">
        {chapters.map((c) => (
          <li key={c.id} className="relative">
            <span
              className={`absolute -left-[3px] block h-1.5 w-1.5 rounded-full transition-colors duration-(--duration-2) ${
                activeId === c.id ? "bg-accent" : "bg-current opacity-25"
              }`}
            />
            <span
              className={`absolute left-4 -top-1.5 whitespace-nowrap text-meta uppercase transition-opacity duration-(--duration-2) ${
                activeId === c.id ? "opacity-100 text-accent" : "opacity-0"
              }`}
            >
              {c.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * The mobile rule. The fixed left gutter has nowhere to live under 1024px, so
 * the thread becomes a 2px bar across the top of the viewport carrying the same
 * year. Same object, same data, adapted — not removed.
 */
export function StoryRuleMobile({
  founded,
  currentYear,
}: {
  founded: number
  currentYear: number
}) {
  const { reduce } = useStoryMotion()
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })
  const fill = useTransform(progress, [0, 1], [0, 1])
  const [year, setYear] = React.useState(founded)

  React.useEffect(() => {
    if (reduce) return
    return progress.on("change", (v) => {
      const next = Math.round(founded + v * (currentYear - founded))
      setYear((prev) => (prev === next ? prev : next))
    })
  }, [progress, founded, currentYear, reduce])

  const displayYear = reduce ? currentYear : year

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-16 z-30 flex items-center gap-3 px-5 mix-blend-difference lg:hidden"
    >
      <div className="relative h-px flex-1 bg-current opacity-15">
        <motion.div
          className="absolute inset-y-0 left-0 w-full origin-left bg-accent"
          style={reduce ? { scaleX: 1 } : { scaleX: fill }}
        />
      </div>
      <span className="text-meta tabular-nums text-accent" data-num>
        {displayYear}
      </span>
    </div>
  )
}
