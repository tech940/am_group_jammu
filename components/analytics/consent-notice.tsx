"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ANALYTICS_MODE, CLARITY_ID, CONSENT_DEFAULT, GA_ID } from "@/lib/analytics/config"
import { writeChoice } from "@/lib/analytics/consent"
import { carFromPath } from "@/lib/analytics/gtm"

/**
 * The analytics notice.
 *
 * A small panel, not a modal: it does not take focus, does not dim the page
 * and nothing waits on it. It says what is used and offers a real "No thanks",
 * which is stored in this browser (lib/analytics/consent.ts) and from then on
 * stops GA4 and Clarity from loading at all, on this visit and later ones.
 *
 * The wording is built from what is actually configured, so the notice never
 * names a tool the site is not running.
 *
 * Position: on a phone the tab bar (components/layout/mobile-action-bar.tsx)
 * is fixed to the bottom, 4rem tall plus the safe-area inset, at z-50. This
 * sits just above it rather than over it. On wider screens it is bottom-left,
 * because toasts arrive bottom-right. z-40 keeps it under the tab bar, the
 * menu and every dialog.
 *
 * A car page has a second bar on a phone: the "Get best price" bar in
 * app/inventory/[slug]/vehicle-client.tsx, which sticks directly above the
 * tab bar (`sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30`) and
 * measures 61px tall. At the ordinary offset this notice, being z-40, lay on
 * top of it, and a tap aimed at the page's main button landed on "OK" or
 * "No thanks". So on a car page the notice is lifted clear of both bars:
 *
 *   tab bar 4rem (64px) + price bar 61px + a gap  =  4rem + 4.5rem (72px)
 *
 * which leaves 11px of air above the price bar. If that bar's padding or text
 * sizes change, change PHONE_BOTTOM.carPage with it. From md up neither bar
 * exists and the notice sits bottom-left on every page.
 */

// Whole class names, not a number dropped into a template: Tailwind only
// generates a class it can find written out in full in the source.
const PHONE_BOTTOM = {
  page: "bottom-[calc(4rem+env(safe-area-inset-bottom)+0.75rem)]",
  carPage: "bottom-[calc(8.5rem+env(safe-area-inset-bottom))]",
} as const

function sentence(): string {
  if (ANALYTICS_MODE === "direct" && GA_ID && CLARITY_ID) {
    return "We use Google Analytics and Microsoft Clarity to see how this site is used. Clarity records clicks and scrolling. What you type into a form is not recorded."
  }
  if (ANALYTICS_MODE === "direct" && CLARITY_ID) {
    return "We use Microsoft Clarity to see how this site is used. It records clicks and scrolling. What you type into a form is not recorded."
  }
  if (ANALYTICS_MODE === "direct" && GA_ID) {
    return "We use Google Analytics to count visits and see which pages and cars are looked at."
  }
  // Through Tag Manager the site cannot see which tags the container holds,
  // so it does not claim to.
  return "We use analytics tools to see how this site is used. They can include recordings of clicks and scrolling."
}

export function ConsentNotice() {
  // With analytics on by default the first button only acknowledges; with
  // analytics off by default it is the button that turns them on.
  const acceptLabel = CONSENT_DEFAULT === "granted" ? "OK" : "Allow"
  const onCarPage = carFromPath(usePathname() ?? "") !== null
  const phoneBottom = onCarPage ? PHONE_BOTTOM.carPage : PHONE_BOTTOM.page

  return (
    <aside
      aria-label="Analytics on this site"
      className={`fixed inset-x-3 ${phoneBottom} z-40 rounded-md border border-line bg-surface p-4 shadow-raised md:inset-x-auto md:bottom-4 md:left-4 md:max-w-sm`}
    >
      <p className="text-body text-ink-2">
        {sentence()}{" "}
        <Link
          href="/privacy-policy"
          className="text-accent-text-light underline underline-offset-2"
        >
          Privacy policy
        </Link>
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button type="button" variant="secondary" onClick={() => writeChoice("granted")}>
          {acceptLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={() => writeChoice("denied")}>
          No thanks
        </Button>
      </div>
    </aside>
  )
}
