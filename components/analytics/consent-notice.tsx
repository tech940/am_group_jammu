"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { META_PIXEL_ID, ANALYTICS_MODE, CLARITY_ID, CONSENT_DEFAULT, GA_ID } from "@/lib/analytics/config"
import { writeChoice } from "@/lib/analytics/consent"
import { carFromPath } from "@/lib/analytics/gtm"

/**
 * The analytics notice.
 *
 * A slim strip, not a modal: it does not take focus, does not dim the page
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

/**
 * One short line, so the notice is a strip and not a card. It still names
 * every tool that is running (Meta's and Microsoft's terms require telling
 * visitors), and the privacy policy carries the detail: what each records,
 * that typing in forms is not recorded, and how to turn it off later.
 * (Owner, 2026-11-17: the four-line card was "very blocky".)
 */
function sentence(): string {
  const tools = [
    ANALYTICS_MODE === "direct" && GA_ID ? "Google Analytics" : null,
    ANALYTICS_MODE === "direct" && CLARITY_ID ? "Clarity" : null,
    ANALYTICS_MODE === "direct" && META_PIXEL_ID ? "the Meta Pixel" : null,
  ].filter(Boolean) as string[]
  if (tools.length === 0) return "We use analytics tools to see how this site is used."
  const list = tools.length === 1 ? tools[0] : `${tools.slice(0, -1).join(", ")} and ${tools[tools.length - 1]}`
  return `We use ${list} to improve this site${META_PIXEL_ID && ANALYTICS_MODE === "direct" ? " and our ads" : ""}.`
}

export function ConsentNotice() {
  const acceptLabel = CONSENT_DEFAULT === "granted" ? "OK" : "Allow"
  const onCarPage = carFromPath(usePathname() ?? "") !== null
  const phoneBottom = onCarPage ? PHONE_BOTTOM.carPage : PHONE_BOTTOM.page

  return (
    <aside
      aria-label="Analytics on this site"
      className={`fixed inset-x-3 ${phoneBottom} z-40 flex items-center gap-3 rounded-md border border-line bg-surface py-2 pl-3 pr-2 shadow-raised md:inset-x-auto md:bottom-4 md:left-4 md:max-w-md`}
    >
      <p className="min-w-0 flex-1 text-small text-ink-2">
        {sentence()}{" "}
        <Link href="/privacy-policy" className="text-accent-text-light underline underline-offset-2">
          Privacy
        </Link>
      </p>
      <div className="flex shrink-0 gap-1.5">
        <Button type="button" variant="secondary" size="sm" onClick={() => writeChoice("granted")}>
          {acceptLabel}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => writeChoice("denied")}>
          No thanks
        </Button>
      </div>
    </aside>
  )
}
