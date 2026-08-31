"use client"

import * as React from "react"

/**
 * `prefers-reduced-motion`, read in a way that survives hydration.
 *
 * WHY THIS EXISTS. framer-motion's `useReducedMotion()` reads the media query
 * eagerly, so on a machine set to reduce the client's very first render already
 * knows it while the server — which has no media query at all — always rendered
 * the full-motion branch. Any component that branches its MARKUP on the result
 * then hydrates against different values, and React logs:
 *
 *     "some attributes of the server rendered HTML didn't match the client
 *      properties. This won't be patched up."
 *
 * That last sentence is the dangerous part. `Settle` renders
 * `initial={reduce ? false : { opacity: 0, y: 8 }}`, which framer writes as an
 * inline `opacity: 0` during SSR. When the branch disagrees, React leaves the
 * server's `opacity: 0` in the DOM and does not correct it — so a reduced-motion
 * reader can be served a page whose sections are invisible until something else
 * happens to animate them back. Every band on every page goes through `Settle`,
 * so the blast radius is the whole site.
 *
 * `useSyncExternalStore` is the API this is actually shaped like: a value that
 * lives outside React, differs between server and client, and can change while
 * the page is open. It takes an explicit server snapshot — `false`, which is all
 * the server can honestly know — so the first client render matches the HTML,
 * and React then re-renders with the real value through the normal path instead
 * of through a mismatch.
 *
 * The alternative fix, `useState(false)` plus `useEffect(() => setMounted(true))`,
 * also resolves the mismatch but schedules a second render of the whole subtree
 * and is a setState inside an effect, which React 19 flags.
 */
const QUERY = "(prefers-reduced-motion: reduce)"

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener("change", onChange)
  return () => mq.removeEventListener("change", onChange)
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches
}

/** The server cannot know the preference. Saying so is what keeps SSR honest. */
function getServerSnapshot() {
  return false
}

export function useReducedMotionSafe(): boolean {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
