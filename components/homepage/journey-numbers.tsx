"use client"

import * as React from "react"
import { animate, useInView } from "framer-motion"
import { useReducedMotionSafe } from "@/components/system/use-reduced-motion"

/**
 * The journey in numbers — the strip under the road.
 *
 * Each figure counts up from zero once, when the strip enters the viewport:
 * an entrance behaviour for data, not a loop, and the final value is the only
 * state that matters. Under reduced motion the number simply IS its value.
 *
 * The count writes textContent directly from the animation frame rather than
 * through setState — sixty re-renders a second to change a digit is the kind
 * of cost this codebase keeps out on principle. `data-num` gives it tabular
 * numerals so the width does not wobble while it runs.
 *
 * Every figure is passed in from the server band and sourced from content.ts.
 * The reference design this strip echoes had a "1000+ people" cell; the
 * company has published no headcount, so no such cell exists here.
 */
function CountUp({ value }: { value: number }) {
  const reduce = useReducedMotionSafe()
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduce || !inView) {
      if (reduce) el.textContent = String(value)
      return
    }
    const controls = animate(0, value, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = String(Math.round(v))
      },
    })
    return () => controls.stop()
  }, [inView, reduce, value])

  return (
    <span ref={ref} data-num>
      {/* Server-rendered at full value: correct for crawlers and for any
          reader whose JavaScript never arrives. The effect rewinds and rolls
          it only once it is on screen. */}
      {value}
    </span>
  )
}

export function JourneyNumbers({
  items,
}: {
  items: { value: number; suffix?: string; label: string; note?: string }[]
}) {
  return (
    <dl className="grid grid-cols-2 gap-y-8 border-y border-line-strong py-8 lg:grid-cols-4">
      {items.map((item, i) => (
        <div
          key={item.label}
          className={`px-1 ${i % 2 === 1 ? "border-l border-line-strong pl-6" : ""} ${
            i === 2 ? "lg:border-l lg:border-line-strong lg:pl-6" : ""
          }`}
        >
          <dd className="font-display text-h1 text-ink">
            <CountUp value={item.value} />
            {/* The suffix is typographic, not counted: "10K+" rolls the 10 and
                holds the K+, the way the figure is actually read. */}
            {item.suffix && <span>{item.suffix}</span>}
          </dd>
          <dt className="mt-1 text-meta uppercase text-ink-2">{item.label}</dt>
          {item.note && <dd className="mt-1 text-small text-ink-2">{item.note}</dd>}
        </div>
      ))}
    </dl>
  )
}
