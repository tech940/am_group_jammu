"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { carFromPath, pageIntent, pageType, pushEvent } from "@/lib/analytics/gtm"
import { LOCATIONS } from "@/lib/locations"

/**
 * Tracks every click on a link that matters: a phone number, WhatsApp, an
 * email address, map directions, a car, or another website.
 *
 * A single delegated document listener rather than per-link onClick handlers,
 * because most of these anchors live in SERVER components (the location pages,
 * the landing pages, the footer, the 404 page) and cannot carry an onClick at
 * all. A link opts in to more detail with data attributes; the full contract
 * is written out at the top of lib/analytics/events.ts:
 *
 *   data-track-location   where on the page             -> click_location
 *   data-track-branch     which showroom (a slug)        -> location_slug
 *   data-track-item       which car, off a car page      -> item_id
 *   data-track-list, data-track-list-name, data-track-index
 *                         on a car link or around it     -> select_item
 *
 * On a dealership site the phone is the conversion, so every contact event
 * says which page, which car and which showroom it belongs to.
 */

/** Roadside assistance: a support call, not a sales lead. */
const SUPPORT_NUMBERS = ["18002647687"]

const BRANCH_SLUGS = LOCATIONS.map((l) => l.slug)

/**
 * The showroom a link is for. The explicit attribute wins; otherwise the many
 * existing labels that end in a showroom slug ("location-hero-gangyal",
 * "contact-nanak-nagar") are read as they are, so no page had to change.
 */
function branchOf(anchor: Element, location: string | undefined): string | undefined {
  const explicit = anchor.getAttribute("data-track-branch")
  if (explicit) return explicit
  if (!location) return undefined
  return BRANCH_SLUGS.find((slug) => location === slug || location.endsWith(`-${slug}`))
}

export function LinkTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Staff dialling a customer from the admin CRM is not a conversion;
    // counting it would fabricate leads. (pushEvent refuses /admin as well.)
    if (pathname?.startsWith("/admin")) return

    const handler = (e: Event) => {
      // A right-click opens a menu; it is not a call or a visit.
      if (e instanceof MouseEvent && e.button === 2) return
      const target = e.target
      if (!(target instanceof Element)) return

      const anchor = target.closest("a")
      if (!anchor) return

      const href = anchor.getAttribute("href") ?? ""
      const path = pathname ?? ""
      // Set by callers that want a precise label; otherwise the page type is
      // enough to tell a car-page call from a footer call.
      const location = anchor.getAttribute("data-track-location") ?? undefined
      const pageCar = carFromPath(path)

      const common = {
        click_location: location,
        location_slug: branchOf(anchor, location),
        // The car: named on the link, or the one this page is about.
        item_id: anchor.getAttribute("data-track-item") ?? pageCar?.id,
        vehicle_slug: pageCar?.slug,
        intent: pageIntent(path),
        page_type: pageType(path),
        page_path: path,
      }

      if (href.startsWith("tel:")) {
        const number = href.slice(4).replace(/[^\d+]/g, "")
        const isSupport = SUPPORT_NUMBERS.some((n) => number.endsWith(n))
        pushEvent(isSupport ? "contact_support" : "contact_call", {
          ...common,
          // The older name for click_location, kept so a report or GTM
          // variable already built on it keeps working.
          call_location: location,
        })
        return
      }

      if (href.includes("wa.me/") || href.includes("api.whatsapp.com")) {
        pushEvent("contact_whatsapp", { ...common, contact_location: location })
        return
      }

      if (href.startsWith("mailto:")) {
        pushEvent("contact_email", { ...common, contact_location: location })
        return
      }

      // Directions links specifically (/maps/dir/), not "view our profile".
      if (href.includes("google.com/maps") && href.includes("/dir")) {
        pushEvent("get_directions", {
          ...common,
          // Path only: the query is the destination address, already known.
          destination_url: href.split("?")[0],
          directions_location: location,
        })
        return
      }

      let url: URL
      try {
        url = new URL(href, window.location.href)
      } catch {
        return
      }
      if (url.protocol !== "http:" && url.protocol !== "https:") return

      // A link to a car page, from anywhere: a card, a rail, a "similar cars"
      // row. A card has several links to the same car (title, photo, each
      // carousel slide); one click is still one event.
      if (url.host === window.location.host) {
        const car = carFromPath(url.pathname)
        if (!car || url.pathname === path) return
        const list = anchor.closest("[data-track-list]")
        const listId = list?.getAttribute("data-track-list") ?? `${common.page_type}-links`
        const position = anchor.closest("[data-track-index]")?.getAttribute("data-track-index")
        const index = position ? Number(position) : NaN
        pushEvent("select_item", {
          item_list_id: listId,
          item_list_name: list?.getAttribute("data-track-list-name") ?? listId,
          vehicle_slug: car.slug,
          items: [
            {
              item_id: car.id,
              item_list_id: listId,
              index: Number.isFinite(index) ? index : undefined,
            },
          ],
          click_location: location,
          page_type: common.page_type,
          page_path: path,
        })
        return
      }

      // Any other website: the maps profile, a social page.
      pushEvent("outbound_click", {
        ...common,
        link_url: `${url.host}${url.pathname}`,
      })
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
