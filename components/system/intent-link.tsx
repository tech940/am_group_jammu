"use client"

import NextLink from "next/link"
import { forwardRef, useState, type ComponentProps } from "react"

/**
 * next/link that prefetches on INTENT, not on sight.
 *
 * WHY (2026-11-20). By default every <Link> prefetches its page as soon as it
 * scrolls into view. The home page carries over 200 links to 46 pages (every
 * car, make, budget and answer), so one scroll from top to bottom made 204
 * background requests, and the browser parsed each streamed answer on the
 * main thread: 5-11ms per chunk, several chunks in one frame. That was the
 * "sudden lag while scrolling" the owner and the MD felt: frames of ~100ms on
 * a mid-range phone, measured with the Long Animation Frames API.
 *
 * This is the pattern from Next's own guide (node_modules/next/dist/docs/
 * 01-app/02-guides/prefetching.md, "Hover-triggered prefetch"): prefetch is
 * off until the visitor shows intent, then restored to the default. Intent is
 * a mouse over the link, a finger landing on it, or keyboard focus, so the
 * page still starts loading a beat before the click.
 *
 * Drop-in: same props as next/link. A caller that sets `prefetch` itself keeps
 * its own setting. The header and tab bar use plain next/link on purpose: a
 * handful of links, and those should be instant.
 */
const IntentLink = forwardRef<HTMLAnchorElement, ComponentProps<typeof NextLink>>(function IntentLink(
  { prefetch, onMouseEnter, onTouchStart, onFocus, ...props },
  ref,
) {
  const [intent, setIntent] = useState(false)
  const own = prefetch !== undefined

  return (
    <NextLink
      ref={ref}
      {...props}
      prefetch={own ? prefetch : intent ? null : false}
      onMouseEnter={(e) => {
        setIntent(true)
        onMouseEnter?.(e)
      }}
      onTouchStart={(e) => {
        setIntent(true)
        onTouchStart?.(e)
      }}
      onFocus={(e) => {
        setIntent(true)
        onFocus?.(e)
      }}
    />
  )
})

export default IntentLink
