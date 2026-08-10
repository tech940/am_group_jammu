"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { pushEvent } from "@/lib/analytics/gtm"

/**
 * Tracks outbound contact clicks (tel:, mailto:, map directions).
 *
 * A single delegated document listener rather than per-link onClick handlers,
 * because most of these anchors live in SERVER components — the location pages,
 * the city landing pages and the 404 page all render tel: links and cannot
 * carry an onClick at all.
 *
 * On a dealership site the phone is the conversion, so these were the highest
 * value untracked events on the whole site.
 */

/** Roadside assistance — a support call, not a sales lead. */
const SUPPORT_NUMBERS = ["18002647687"]

function pageType(pathname: string): string {
  if (pathname === "/") return "home"
  if (pathname.startsWith("/inventory/")) return "vdp"
  if (pathname === "/inventory") return "listing"
  if (pathname.startsWith("/locations")) return "location"
  if (pathname.startsWith("/used-cars/")) return "landing"
  if (pathname.startsWith("/brands/")) return "brand"
  if (pathname === "/contact") return "contact"
  return "other"
}

export function LinkTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Staff dialling a customer from the admin CRM is not a conversion —
    // counting it would fabricate leads.
    if (pathname?.startsWith("/admin")) return

    const handler = (e: Event) => {
      const target = e.target
      if (!(target instanceof Element)) return

      const anchor = target.closest("a")
      if (!anchor) return

      const href = anchor.getAttribute("href") ?? ""
      // Set by callers that want a precise label; otherwise we fall back to
      // the page type, which is enough to tell a VDP call from a footer call.
      const location = anchor.getAttribute("data-track-location") ?? undefined
      const type = pageType(pathname ?? "")

      if (href.startsWith("tel:")) {
        const number = href.slice(4).replace(/[^\d+]/g, "")
        const isSupport = SUPPORT_NUMBERS.some((n) => number.endsWith(n))
        pushEvent(isSupport ? "contact_support" : "contact_call", {
          phone_number: number,
          call_location: location,
          page_type: type,
          page_path: pathname,
        })
        return
      }

      if (href.includes("wa.me/") || href.includes("api.whatsapp.com")) {
        pushEvent("contact_whatsapp", {
          contact_location: location,
          page_type: type,
          page_path: pathname,
        })
        return
      }

      if (href.startsWith("mailto:")) {
        pushEvent("contact_email", {
          email_address: href.slice(7),
          contact_location: location,
          page_type: type,
          page_path: pathname,
        })
        return
      }

      // Directions links specifically — /maps/dir/ — not "view our profile".
      if (href.includes("google.com/maps") && href.includes("/dir")) {
        pushEvent("get_directions", {
          destination_url: href,
          directions_location: location,
          page_type: type,
          page_path: pathname,
        })
      }
    }

    // auxclick covers middle-click; never preventDefault, a tel: link must
    // fire immediately or the call is lost.
    document.addEventListener("click", handler)
    document.addEventListener("auxclick", handler)
    return () => {
      document.removeEventListener("click", handler)
      document.removeEventListener("auxclick", handler)
    }
  }, [pathname])

  return null
}
