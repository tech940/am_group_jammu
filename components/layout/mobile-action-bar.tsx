"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { PRIMARY_LOCATION, whatsappUrl } from "@/lib/locations"
import { PhoneGlyph, ChatGlyph, CompassGlyph } from "@/components/system/marks"

/**
 * Sticky call/WhatsApp bar, mobile only.
 *
 * Most J&K used-car traffic lands on a phone, and on a dealership site the
 * phone and WhatsApp are the conversion — not the form. Previously there was
 * no click-to-call anywhere in the header and no persistent contact affordance
 * at all, so a mobile visitor had to scroll to the footer or into a car page to
 * find a number.
 *
 * Tracking is handled by the delegated listener in
 * components/analytics/link-tracker.tsx, so these need no onClick.
 *
 * The bar is frosted rather than white. It is fixed over whatever the page is
 * showing, so a white slab reads as a foreign object on the dark photographic
 * bands and as an unexplained white stripe above the dark footer; the same
 * material as the header ties it to both. `.glass-bar` carries its own no-blur
 * and reduced-transparency fallbacks, so it never becomes a translucent
 * unreadable strip.
 */
export function MobileActionBar() {
  const pathname = usePathname()

  // Never over the admin CRM. It stays on /contact deliberately: someone who
  // would rather send a WhatsApp than fill a form should not have to submit
  // the form to find out WhatsApp is an option.
  if (!pathname || pathname.startsWith("/admin")) return null

  const waMessage =
    "Hi AM Group, I'm looking for a used car in Jammu. Can you help me with what's available?"

  return (
    <div className="glass-bar fixed inset-x-0 bottom-0 z-50 border-t border-line-on-deep pb-[env(safe-area-inset-bottom)] md:hidden">
      <div data-ground="deep" className="grid grid-cols-3 divide-x divide-line-on-deep">
        <a
          href={`tel:${PRIMARY_LOCATION.phoneE164}`}
          data-track-location="mobile-bar"
          className="flex flex-col items-center justify-center gap-1 py-3 text-on-deep transition-colors duration-(--duration-1) active:bg-white/10"
        >
          <PhoneGlyph />
          <span className="text-meta uppercase">Call</span>
        </a>

        <a
          href={whatsappUrl(waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          data-track-location="mobile-bar"
          className="flex flex-col items-center justify-center gap-1 py-3 text-on-deep transition-colors duration-(--duration-1) active:bg-white/10"
        >
          <ChatGlyph />
          <span className="text-meta uppercase">WhatsApp</span>
        </a>

        <Link
          href="/inventory"
          className="flex flex-col items-center justify-center gap-1 py-3 text-on-deep transition-colors duration-(--duration-1) active:bg-white/10"
        >
          <CompassGlyph />
          <span className="text-meta uppercase">Browse</span>
        </Link>
      </div>
    </div>
  )
}
