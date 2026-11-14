"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { PRIMARY_LOCATION, whatsappUrl } from "@/lib/locations"
import { ChatGlyph, HomeGlyph, KeyGlyph, PhoneGlyph, TagGlyph } from "@/components/system/marks"

/**
 * The phone tab bar: Home · Buy · Sell · Call · WhatsApp.
 *
 * It used to be three contact actions. The site is now a shop with two jobs —
 * buy a car, sell a car — so the bar is the shop's navigation, the way the
 * managing director's reference app has it, with the two contact actions kept
 * at the thumb's end because on a dealership site in J&K the phone and
 * WhatsApp are the conversion, not the form.
 *
 * Tracking of the tel: and wa.me anchors is handled by the delegated listener
 * in components/analytics/link-tracker.tsx, so these need no onClick.
 *
 * The bar is frosted rather than white. It is fixed over whatever the page is
 * showing, so a white slab reads as a foreign object on the photographic bands
 * and as an unexplained stripe above the dark footer. `.glass-bar` carries its
 * own no-blur and reduced-transparency fallbacks.
 *
 * Height is 64px plus the safe-area inset — app/layout.tsx reserves exactly
 * that with `pb-16`, so change the two together or not at all.
 */
const tab =
  "flex h-16 flex-col items-center justify-center gap-1.5 text-on-deep " +
  "transition-colors duration-(--duration-1) active:bg-accent/10 " +
  "aria-[current=page]:font-semibold aria-[current=page]:text-accent-bright"

// 11px, the system's floor. Sentence case and normal tracking, not the
// uppercase meta style: five columns on a 320px phone are 64px each, and
// "WHATSAPP" with 0.1em tracking does not fit in that.
const label = "text-meta tracking-normal"

function Face({ glyph, children }: { glyph: ReactNode; children: ReactNode }) {
  return (
    <>
      {/* Glyphs are sized in em; this sets them to about 20px. */}
      <span aria-hidden className="text-body-lg leading-none">
        {glyph}
      </span>
      <span className={label}>{children}</span>
    </>
  )
}

export function MobileActionBar() {
  const pathname = usePathname()

  // Never over the admin CRM.
  if (!pathname || pathname.startsWith("/admin")) return null

  const at = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)
  const current = (href: string) => (at(href) ? ("page" as const) : undefined)

  const waMessage =
    "Hi AM Group, I'm looking for a used car in Jammu. Can you help me with what's available?"

  return (
    <nav
      aria-label="Quick actions"
      data-ground="deep"
      className="glass-bar fixed inset-x-0 bottom-0 z-50 border-t border-line-on-deep pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-5">
        <li>
          <Link href="/" aria-current={current("/")} className={tab}>
            <Face glyph={<HomeGlyph />}>Home</Face>
          </Link>
        </li>
        <li>
          <Link href="/inventory" aria-current={current("/inventory")} className={tab}>
            <Face glyph={<KeyGlyph />}>Buy</Face>
          </Link>
        </li>
        <li>
          <Link href="/sell-your-car" aria-current={current("/sell-your-car")} className={tab}>
            <Face glyph={<TagGlyph />}>Sell</Face>
          </Link>
        </li>
        <li>
          <a
            href={`tel:${PRIMARY_LOCATION.phoneE164}`}
            data-track-location="mobile-bar"
            className={tab}
          >
            <Face glyph={<PhoneGlyph />}>Call</Face>
          </a>
        </li>
        <li>
          <a
            href={whatsappUrl(waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            data-track-location="mobile-bar"
            className={tab}
          >
            <Face glyph={<ChatGlyph />}>WhatsApp</Face>
          </a>
        </li>
      </ul>
    </nav>
  )
}
