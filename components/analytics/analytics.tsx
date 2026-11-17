"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import Script from "next/script"
import { usePathname } from "next/navigation"
import { ANALYTICS_MODE, CLARITY_ID, GA_ID, GTM_ID, META_PIXEL_ID } from "@/lib/analytics/config"
import {
  analyticsLive,
  setInternal,
  shouldAskChoice,
  subscribeChoice,
} from "@/lib/analytics/consent"
import { captureAttribution } from "@/lib/analytics/attribution"
import {
  carFromPath,
  clarityTag,
  pageIntent,
  pageType,
  prepareTags,
  pushEvent,
  resumeTags,
  stopTags,
} from "@/lib/analytics/gtm"
import { ConsentNotice } from "./consent-notice"

/**
 * Everything measurement-related that the root layout mounts, in one place.
 *
 * It decides in the BROWSER, after the page has hydrated, whether any tag may
 * load. That is deliberate:
 *
 *  - The visitor's "No thanks", and the mark on a staff browser, live in
 *    localStorage. Only the browser can read them.
 *  - The root layout stays static. Reading a cookie there to make the same
 *    decision would turn every public page into a per-request render.
 *  - Nothing third-party is in the server HTML, so a browser that refused
 *    never even opens a connection to Google or Microsoft.
 *
 * Which scripts load is decided by the one rule in lib/analytics/config.ts.
 * Strategies, from the bundled Next docs (guides/scripts.md):
 * `afterInteractive` (after hydration has begun) for GA4 and GTM, so the first
 * page view is not missed. Clarity is a recording tool and has no business
 * competing with the page's own load, so it waits for the window's load event
 * and then an idle moment. That wait is done here rather than with next/script's
 * `lazyOnload`, because next/script does not cancel a `lazyOnload` script once
 * it is queued: a visitor who pressed "No thanks" before the page finished
 * loading would still have had Clarity injected a moment later.
 */

/** Scroll depth is only worth knowing where a page is long and has a job to do. */
const SCROLL_PAGE_TYPES = new Set(["home", "vdp", "landing", "brand", "sell"])
const SCROLL_MARKS = [25, 50, 75] as const

const no = () => false

export function Analytics() {
  const pathname = usePathname() ?? ""
  const onAdmin = pathname.startsWith("/admin")

  // False on the server and during hydration, the real answer straight after:
  // the tags never appear in server HTML and there is no hydration mismatch.
  const live = useSyncExternalStore(subscribeChoice, analyticsLive, no)
  const ask = useSyncExternalStore(subscribeChoice, shouldAskChoice, no)

  // Once per full page load, before anything can navigate away from the
  // landing address.
  useEffect(() => {
    // One link marks (or unmarks) a staff phone that never opens /admin:
    //   https://<site>/?am_internal=1     and     ?am_internal=0
    const flag = new URLSearchParams(window.location.search).get("am_internal")
    if (flag === "1") setInternal(true)
    if (flag === "0") setInternal(false)

    captureAttribution()
  }, [])

  // Tags that have loaded cannot be unloaded, so remember that they did.
  const loadedRef = useRef(false)
  const stoppedRef = useRef(false)
  useEffect(() => {
    if (live) {
      prepareTags()
      // Turned back on from the privacy page after being turned off.
      if (stoppedRef.current) resumeTags()
      loadedRef.current = true
      stoppedRef.current = false
    } else if (loadedRef.current && !stoppedRef.current) {
      // "No thanks" part-way through a visit.
      stopTags()
      stoppedRef.current = true
      // Through Tag Manager the site cannot reach the tags themselves: the
      // container holds them, with its own triggers, and stopTags() can only
      // ask it to stop. A reload is the one way to be sure the container is
      // no longer in the document, the same as for /admin below. It cannot
      // loop: the refusal is already stored, so nothing loads next time.
      if (ANALYTICS_MODE === "gtm") window.location.reload()
    }
  }, [live])

  // Clarity: after the page has loaded and the browser is idle, and only
  // while analytics are still allowed. The cleanup cancels a wait in progress,
  // so a refusal in the meantime means the script is never requested.
  const wantClarity = live && ANALYTICS_MODE === "direct" && Boolean(CLARITY_ID)
  const [clarityDue, setClarityDue] = useState(false)
  useEffect(() => {
    if (!wantClarity) return
    let idle: number | undefined
    let timer: number | undefined
    const due = () => setClarityDue(true)
    const whenIdle = () => {
      if (typeof window.requestIdleCallback === "function") {
        idle = window.requestIdleCallback(due, { timeout: 3000 })
      } else {
        timer = window.setTimeout(due, 1500)
      }
    }
    if (document.readyState === "complete") whenIdle()
    else window.addEventListener("load", whenIdle, { once: true })
    return () => {
      window.removeEventListener("load", whenIdle)
      if (idle !== undefined) window.cancelIdleCallback(idle)
      if (timer !== undefined) window.clearTimeout(timer)
    }
  }, [wantClarity])

  // Anyone who opens the admin area is staff. From then on this browser is
  // not measured on the public pages either.
  useEffect(() => {
    if (!onAdmin) return
    setInternal(true)
    // Arriving here by an in-app link leaves a recorder running in this
    // document, and the lead desk shows customers' names and numbers. A
    // reload is the one way to be certain nothing third-party is on the page.
    if (loadedRef.current) window.location.reload()
  }, [onAdmin])

  // Page views: one per real page. Keyed on the PATH, never the query string,
  // so the filters, sort and search on /inventory (which only change the
  // query) are filter events and not pages. `live` is in the key so a visitor
  // who presses "Allow" has the page they are on counted.
  const lastUrlRef = useRef<string | null>(null)
  useEffect(() => {
    if (onAdmin) return
    const type = pageType(pathname)
    const car = carFromPath(pathname)

    // A moment later, so document.title is the new page's and not the last.
    // A zero timeout, not requestAnimationFrame: frames are not drawn for a
    // tab opened in the background, so a car opened in a new tab would have
    // had its view_item counted and its page view not.
    const timer = window.setTimeout(() => {
      pushEvent("page_view", {
        page_location: window.location.href,
        page_path: pathname,
        page_title: document.title,
        page_type: type,
        intent: pageIntent(pathname),
        // The first page keeps the browser's own referrer; later ones are
        // referred by the page before.
        page_referrer:
          lastUrlRef.current && lastUrlRef.current !== window.location.href
            ? lastUrlRef.current
            : undefined,
      })
      lastUrlRef.current = window.location.href

      // Clarity follows page changes itself; these only label the recording.
      clarityTag("page_type", type)
      clarityTag("intent", pageIntent(pathname))
      if (car) clarityTag("car_id", car.id)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [pathname, onAdmin, live])

  // Scroll depth at 25 / 50 / 75%, once each per page. GA4's own 'scroll'
  // event covers 90%.
  useEffect(() => {
    const type = pageType(pathname)
    if (!SCROLL_PAGE_TYPES.has(type)) return

    const sent = new Set<number>()
    let queued = false
    const measure = () => {
      queued = false
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      // A page that fits the screen has no depth to report.
      if (scrollable < 200) return
      const percent = (window.scrollY / scrollable) * 100
      for (const mark of SCROLL_MARKS) {
        if (percent >= mark && !sent.has(mark)) {
          sent.add(mark)
          pushEvent("scroll_depth", { percent: mark, page_type: type, page_path: pathname })
        }
      }
    }
    const onScroll = () => {
      if (queued) return
      queued = true
      window.requestAnimationFrame(measure)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [pathname])

  return (
    <>
      {live && ANALYTICS_MODE === "gtm" && (
        <Script
          id="gtm"
          src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
          strategy="afterInteractive"
        />
      )}
      {live && ANALYTICS_MODE === "direct" && GA_ID && (
        <Script
          id="ga4"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
      )}
      {live && ANALYTICS_MODE === "direct" && META_PIXEL_ID && (
        <Script
          id="meta-pixel"
          src="https://connect.facebook.net/en_US/fbevents.js"
          strategy="afterInteractive"
        />
      )}
      {wantClarity && clarityDue && (
        <Script
          id="clarity"
          src={`https://www.clarity.ms/tag/${CLARITY_ID}`}
          strategy="afterInteractive"
        />
      )}
      {ask && <ConsentNotice />}
    </>
  )
}
