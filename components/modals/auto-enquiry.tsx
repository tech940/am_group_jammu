"use client"

import { useEffect } from "react"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import type { InventoryVehicle } from "@/lib/inventory/types"
import { enquiryWasShown, markEnquiryShown, recentlyEnquired } from "@/lib/leads/enquiry-memory"

/**
 * Opens the enquiry form by itself a few seconds after a visitor lands on the
 * home page, the car list or a car page. Asked for by the managing director
 * on 2026-11-15.
 *
 * A form that jumps up is an interruption, so it is held to the least
 * annoying version that still does the job:
 *
 *  - ONCE PER VISIT. After the form has been on screen once - because it
 *    opened here, or because the visitor pressed any Enquire button on any
 *    page (the store records that; see hooks/use-enquiry-modal.ts) - it does
 *    not open by itself again until the browser tab is closed.
 *  - NOT TO SOMEONE WHO HAS ALREADY ENQUIRED, from any form on the site, in
 *    the last 30 days.
 *  - NOT ON TOP OF SOMETHING. It waits while another dialog or the menu is
 *    open, while the visitor is typing in a field, and while the tab is in
 *    the background. It gives up after a minute of waiting rather than
 *    springing up late.
 *  - NOT ON A DATA-SAVER CONNECTION, where the form's code is deliberately
 *    not downloaded until asked for.
 *
 * SEARCH RISK, recorded so the next editor knows it was weighed: Google's
 * guidance on intrusive dialogs names a pop-up that covers the content after
 * arriving from search, and documents no "safe" delay. The owner chose the
 * pop-up knowing that. The form is easy to dismiss (close button, Escape, tap
 * outside), which is the part of that guidance within our control.
 *
 * It is the same form every "Enquire" button opens, so the lead, its consent
 * wording and its tracking are identical; the source label "auto-popup" is
 * what tells these leads apart in the admin and in analytics.
 *
 * WHEN. On the home page and the car list, 8 seconds after arriving. On a
 * CAR PAGE (owner, 2026-11-17) it waits for interest instead: nothing happens
 * until the visitor starts scrolling (past SCROLL_START_PX, so a nudge does
 * not count), and the form opens 15 seconds after that. Someone who only
 * glances at the photos and leaves is never interrupted.
 *
 * Renders nothing. Mount it on a page that should have the behaviour.
 */

const DELAY_MS = 8000
const AFTER_SCROLLING_MS = 15_000
const SCROLL_START_PX = 200
const RETRY_MS = 4000
const GIVE_UP_AFTER_MS = 60_000

function busy(): boolean {
  if (document.visibilityState !== "visible") return true
  // Another dialog, or the phone menu sheet, is open.
  if (document.querySelector('[role="dialog"], [aria-modal="true"], #site-menu')) return true
  const el = document.activeElement
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement
}

function dataSaver(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  return connection?.saveData === true
}

export function AutoEnquiry({
  vehicle = null,
  trigger = "delay",
}: {
  vehicle?: InventoryVehicle | null
  /** "delay": 8s after arriving. "scroll": 15s after the visitor starts scrolling. */
  trigger?: "delay" | "scroll"
}) {
  useEffect(() => {
    if (enquiryWasShown() || recentlyEnquired() || dataSaver()) return

    let timer = 0
    const startedAt = Date.now()
    const attempt = () => {
      if (enquiryWasShown() || recentlyEnquired()) return
      if (busy()) {
        if (Date.now() - startedAt < GIVE_UP_AFTER_MS) timer = window.setTimeout(attempt, RETRY_MS)
        return
      }
      // onOpen records that the form has been shown.
      useEnquiryModal.getState().onOpen(vehicle, {
        intent: vehicle ? "Vehicle Enquiry" : "General",
        sourceLabel: "auto-popup",
      })
    }

    if (trigger === "delay") {
      timer = window.setTimeout(attempt, DELAY_MS)
      return () => window.clearTimeout(timer)
    }

    // "scroll": start the countdown the first time the page has been scrolled
    // a real distance, then stop listening.
    const startY = window.scrollY
    const onScroll = () => {
      if (Math.abs(window.scrollY - startY) < SCROLL_START_PX) return
      window.removeEventListener("scroll", onScroll)
      timer = window.setTimeout(attempt, AFTER_SCROLLING_MS)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.clearTimeout(timer)
    }
    // The car is fixed for the life of a car page; a new page mounts a new one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle?.id, trigger])

  return null
}
