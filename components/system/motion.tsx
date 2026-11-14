"use client"

import { useEffect, useRef, type ReactNode, type RefObject } from "react"

/**
 * Scroll reveals that never hide content from a reader without JavaScript.
 *
 * WHY THIS FILE EXISTS. The previous reveal (`Settle` in marks.tsx, built on
 * framer-motion) wrote `style="opacity:0"` into the server HTML and relied on
 * script to bring the content back. Three homepage bands, the car rail among
 * them, were therefore invisible to anything that reads the page without
 * running it, and to a visitor whose script was slow or blocked.
 *
 * Here the server HTML is plain and visible. Motion is added afterwards, in an
 * effect, and only to elements the visitor has not seen yet:
 *
 *   - already on screen when the script arrives  -> left alone, no animation
 *   - below the fold                             -> hidden, then eased in the
 *                                                   first time it scrolls into view
 *   - reduced motion, or no IntersectionObserver -> left alone
 *
 * Nothing is branched in the markup, so there is no server/client mismatch for
 * React to leave unpatched (see use-reduced-motion.ts for that trap): the
 * preference is read inside the effect, where only the browser runs.
 */

/** The system's one easing curve (DESIGN.md, Motion). */
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)"

function useReveal(
  ref: RefObject<HTMLElement | null>,
  from: Keyframe,
  { duration, delay = 0 }: { duration: number; delay?: number },
) {
  // `from` is a fresh object on every render; the effect must run once.
  const fromRef = useRef(from)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined" || typeof el.animate !== "function") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    // Anything the visitor can already see stays exactly as the server sent it.
    if (el.getBoundingClientRect().top < window.innerHeight) return

    const start = fromRef.current
    const hidden = Object.entries(start) as [string, string | number][]
    for (const [prop, value] of hidden) el.style.setProperty(prop, String(value))
    const show = () => {
      for (const [prop] of hidden) el.style.removeProperty(prop)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        observer.disconnect()
        show()
        // `backwards` holds the first frame through the delay, so there is no
        // flash of the finished state before the move begins.
        try {
          el.animate([start, {}], { duration, delay, easing: EASE, fill: "backwards" })
        } catch {
          // A browser without implicit end keyframes: the content is already
          // showing, it just does not move.
        }
      },
      // 40px inside the bottom edge before it starts. The top margin is
      // effectively endless on purpose: a jump straight to the foot of the page
      // (an in-page link, End, find-in-page) passes a band without ever
      // showing it, and with an ordinary margin that band would stay hidden
      // until the visitor scrolled back up to it.
      { rootMargin: "100000px 0px -40px 0px" },
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      show()
    }
  }, [ref, duration, delay])
}

/**
 * The page's one entrance: a block settles up 8px as it scrolls into view.
 * Same props as the `Settle` it replaces, so a caller only changes its import.
 */
export function Settle({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode
  /** Seconds. */
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  useReveal(ref, { opacity: 0, transform: "translateY(8px)" }, { duration: 550, delay: delay * 1000 })
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

/** A rule that draws itself from the left as it scrolls into view. */
export function DrawnRule({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useReveal(ref, { transform: "scaleX(0)" }, { duration: 400 })
  return <span ref={ref} aria-hidden className={`block h-px origin-left ${className}`} />
}
