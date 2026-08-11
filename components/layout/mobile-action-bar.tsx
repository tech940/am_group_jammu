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
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-3 divide-x divide-line">
        <a
          href={`tel:${PRIMARY_LOCATION.phoneE164}`}
          data-track-location="mobile-bar"
          className="flex flex-col items-center justify-center gap-1 py-3 text-ink transition-colors duration-(--duration-1) active:bg-ground-2"
        >
          <PhoneGlyph />
          <span className="text-meta uppercase">Call</span>
        </a>

        <a
          href={whatsappUrl(waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          data-track-location="mobile-bar"
          className="flex flex-col items-center justify-center gap-1 py-3 text-ink transition-colors duration-(--duration-1) active:bg-ground-2"
        >
          <ChatGlyph />
          <span className="text-meta uppercase">WhatsApp</span>
        </a>

        <Link
          href="/inventory"
          className="flex flex-col items-center justify-center gap-1 py-3 text-ink transition-colors duration-(--duration-1) active:bg-ground-2"
        >
          <CompassGlyph />
          <span className="text-meta uppercase">Browse</span>
        </Link>
      </div>
    </div>
  )
}
