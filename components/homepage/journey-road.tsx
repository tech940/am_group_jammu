"use client"

import * as React from "react"
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion"
import { useReducedMotionSafe } from "@/components/system/use-reduced-motion"
import {
  BikeGlyph,
  CarGlyph,
  FlagGlyph,
  FuelPumpGlyph,
} from "@/components/system/marks"
import type { Milestone } from "@/components/home/content"

/**
 * The appointments as a journey the reader DRIVES BY SCROLLING.
 *
 * The road runs left to right with a gentle undulation; milestones alternate
 * above and below it, each hung from its stop by a stem — icon chip, year,
 * stage name, and the factual note, all visible inline. Nothing requires a
 * hover to be read.
 *
 * THE SCROLL IS THE ENGINE. Scroll progress through the band maps to journey
 * progress: the centreline draws, the car moves along the path, and each stop
 * lights as the car passes it — unvisited stops sit muted, visited ones lift
 * to full strength. Scrubbing is direct manipulation (the reader's own scroll
 * position, reversible, no scroll-jacking). Travel is still travel, though,
 * so under reduced motion the journey renders finished: road drawn, all stops
 * lit, car parked at today.
 *
 * The car follows the path via getPointAtLength in the SVG's own coordinate
 * space (so it scales with the viewBox — a CSS offset-path in px would not),
 * written straight to a transform attribute from motion-value events, never
 * through React state. The only state is the integer count of stops passed,
 * which changes at most eight times per direction.
 *
 * COLOUR IS DELIBERATELY HELD BACK. The resting band is near-monochrome —
 * muted strokes, on-deep-2 copy — and accent-bright appears only as the
 * PASSED state (stop, chip, year) and on the car itself. Brightness is spent
 * on signalling progress, not on decorating the drawing.
 */

/* The frame both coordinate systems share. */
const W = 1400
const H = 640

/* Stops, evenly spaced along a gently undulating road. `above` alternates the
   side the milestone hangs on. */
const STOPS = [
  { x: 130, y: 316, above: true },
  { x: 302, y: 336, above: false },
  { x: 474, y: 312, above: true },
  { x: 646, y: 340, above: false },
  { x: 818, y: 314, above: true },
  { x: 990, y: 338, above: false },
  { x: 1162, y: 312, above: true },
  { x: 1330, y: 330, above: false },
]

/* The road through those exact points — one drawing with the table above. */
const ROAD =
  `M 40 300 ` +
  `C 70 308, 100 312, 130 316 ` +
  `C 190 324, 244 330, 302 336 ` +
  `C 360 342, 416 320, 474 312 ` +
  `C 532 304, 590 332, 646 340 ` +
  `C 704 348, 760 322, 818 314 ` +
  `C 876 306, 932 330, 990 338 ` +
  `C 1048 346, 1104 320, 1162 312 ` +
  `C 1220 304, 1276 322, 1330 330 ` +
  `C 1352 333, 1372 334, 1392 334`

const KIND_GLYPH: Record<Milestone["kind"], React.ComponentType<{ className?: string }>> = {
  fuel: FuelPumpGlyph,
  car: CarGlyph,
  bike: BikeGlyph,
  multi: FlagGlyph,
}

export function JourneyRoad({ milestones }: { milestones: Milestone[] }) {
  const reduce = useReducedMotionSafe()
  const frameRef = React.useRef<HTMLDivElement>(null)
  const pathRef = React.useRef<SVGPathElement>(null)
  const carRef = React.useRef<SVGGElement>(null)
  const [fractions, setFractions] = React.useState<number[] | null>(null)
  const [passed, setPassed] = React.useState(0)
  const passedRef = React.useRef(0)

  /* Journey progress = scroll progress through the band, over a range chosen
     so the drive completes while the road is comfortably on screen. */
  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ["start 0.92", "end 0.45"],
  })
  const progress = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [0, 1])

  /* Where each stop sits along the path — measured once from the real
     geometry (240 samples of getPointAtLength, nearest wins), not guessed. */
  React.useEffect(() => {
    const el = pathRef.current
    if (!el) return
    const L = el.getTotalLength()
    const fr = STOPS.map((s) => {
      let best = 0
      let bd = Infinity
      for (let t = 0; t <= 240; t++) {
        const pt = el.getPointAtLength((L * t) / 240)
        const d = (pt.x - s.x) ** 2 + (pt.y - s.y) ** 2
        if (d < bd) {
          bd = d
          best = t / 240
        }
      }
      return best
    })
    setFractions(fr)
  }, [])

  /* Drive the car and count the stops — direct attribute writes; the only
     setState is when the passed COUNT changes. */
  const place = React.useCallback(
    (v: number) => {
      const path = pathRef.current
      const car = carRef.current
      if (!path || !car) return
      const L = path.getTotalLength()
      const at = Math.max(0.001, Math.min(0.999, v)) * L
      const p = path.getPointAtLength(at)
      const q = path.getPointAtLength(Math.min(L, at + 2))
      const deg = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI
      car.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${deg})`)

      if (fractions) {
        let n = 0
        for (const f of fractions) if (f <= v + 0.005) n++
        if (n !== passedRef.current) {
          passedRef.current = n
          setPassed(n)
        }
      }
    },
    [fractions],
  )

  useMotionValueEvent(progress, "change", place)

  /* First paint — and the finished journey when reduce asks for it. */
  React.useEffect(() => {
    place(reduce ? 1 : progress.get())
  }, [place, reduce, progress])

  return (
    <div ref={frameRef} className="relative" style={{ aspectRatio: `${W} / ${H}` }}>
      {/* ---- The road -------------------------------------------------- */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 h-full w-full"
        role="presentation"
        aria-hidden
      >
        {/* Road body — always present, muted. */}
        <path
          d={ROAD}
          fill="none"
          stroke="rgb(var(--backdrop-ink) / 0.07)"
          strokeWidth={22}
          strokeLinecap="round"
        />
        {/* Centreline — dashed, scrubbed by scroll. Muted even when drawn:
            progress is signalled by the car and the lit stops, not by a
            bright wire. */}
        <motion.path
          ref={pathRef}
          d={ROAD}
          fill="none"
          stroke="rgb(var(--backdrop-accent) / 0.5)"
          strokeWidth={1.75}
          strokeDasharray="9 11"
          style={{ pathLength: progress }}
        />

        {/* Stems and stop markers — both brighten once the car has passed. */}
        {STOPS.map((stop, i) => {
          const lit = i < passed
          const stemEnd = stop.above ? stop.y - 78 : stop.y + 78
          return (
            <g key={i}>
              <line
                x1={stop.x}
                y1={stop.above ? stop.y - 10 : stop.y + 10}
                x2={stop.x}
                y2={stemEnd}
                stroke={
                  lit
                    ? "rgb(var(--backdrop-accent) / 0.55)"
                    : "rgb(var(--backdrop-ink) / 0.18)"
                }
                strokeWidth={1}
                style={{ transition: "stroke var(--duration-2)" }}
              />
              <circle
                cx={stop.x}
                cy={stop.y}
                r={9}
                fill="rgb(246 247 248)"
                stroke={
                  lit
                    ? "rgb(var(--backdrop-accent) / 0.9)"
                    : "rgb(var(--backdrop-ink) / 0.3)"
                }
                strokeWidth={1.75}
                style={{ transition: "stroke var(--duration-2)" }}
              />
              <circle
                cx={stop.x}
                cy={stop.y}
                r={3}
                fill={
                  lit ? "rgb(var(--backdrop-accent))" : "rgb(var(--backdrop-ink) / 0.35)"
                }
                style={{ transition: "fill var(--duration-2)" }}
              />
            </g>
          )
        })}

        {/* Route ends, named. 13px viewBox units ≥ the 11px floor at any
            rendered size down to md, where this whole drawing hands over to
            the mobile spine. */}
        <text
          x={40}
          y={272}
          fill="rgb(var(--backdrop-ink) / 0.55)"
          fontSize={13}
          letterSpacing={1.6}
        >
          START
        </text>
        <text
          x={1392}
          y={306}
          textAnchor="end"
          fill="rgb(var(--backdrop-ink) / 0.55)"
          fontSize={13}
          letterSpacing={1.6}
        >
          TODAY
        </text>

        {/* The car — top view, so rotate stays honest at every heading. */}
        <g ref={carRef}>
          <g transform="translate(-15, -8)">
            <rect x="2" y="2.5" width="26" height="11" rx="4.5" fill="rgb(var(--backdrop-accent))" />
            <rect x="17.5" y="4" width="4.5" height="8" rx="1.5" fill="rgb(246 247 248 / 0.7)" />
            <rect x="6" y="4.5" width="3" height="7" rx="1.2" fill="rgb(246 247 248 / 0.5)" />
          </g>
        </g>
      </svg>

      {/* ---- The milestones (HTML: real text) --------------------------- */}
      {milestones.map((milestone, i) => {
        const stop = STOPS[i]
        if (!stop) return null
        const lit = i < passed
        const Kind = KIND_GLYPH[milestone.kind]
        const align =
          stop.x / W < 0.12 ? "" : stop.x / W > 0.88 ? "-translate-x-full" : "-translate-x-1/2"

        return (
          <div
            key={milestone.year}
            className={`absolute w-52 ${align} transition-opacity duration-(--duration-3) ${
              lit ? "opacity-100" : "opacity-60"
            }`}
            style={{
              left: `${(stop.x / W) * 100}%`,
              ...(stop.above
                ? { bottom: `${100 - ((stop.y - 84) / H) * 100}%` }
                : { top: `${((stop.y + 84) / H) * 100}%` }),
            }}
          >
            {/* Above-road blocks stack upward from the stem, so the chip row
                sits nearest the road on both sides. */}
            <div className={stop.above ? "flex flex-col-reverse" : ""}>
              <div className={stop.above ? "mt-2" : ""}>
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border transition-colors duration-(--duration-2) ${
                      lit
                        ? "border-accent/60 text-accent"
                        : "border-line-strong text-ink-2"
                    }`}
                  >
                    <Kind className="h-5 w-5" />
                  </span>
                  <span
                    className={`font-display text-h3 transition-colors duration-(--duration-2) ${
                      lit ? "text-accent" : "text-ink-2"
                    }`}
                    data-num
                  >
                    {milestone.year}
                  </span>
                </div>
              </div>
              <div className={stop.above ? "mb-2" : "mt-2"}>
                <p className="font-display text-h4 uppercase text-ink">
                  {milestone.stage}
                </p>
                <p className="mt-1 text-small leading-snug text-ink-2">
                  {milestone.note}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
