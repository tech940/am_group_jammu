"use client"

import { useEffect } from "react"
import { trackNotFound } from "@/lib/analytics/events"

/**
 * Reports a 404 (event `page_not_found`, with the address asked for and where
 * the visitor came from). Renders nothing.
 *
 * The server already answers a missing page with a real 404 status; this is
 * what tells the owner WHICH old links and mistyped addresses people arrive
 * on. Render it once in app/not-found.tsx:
 *
 *   <NotFoundBeacon />
 */
export function NotFoundBeacon() {
  useEffect(() => {
    trackNotFound()
  }, [])
  return null
}
