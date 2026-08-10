"use client"

import { usePathname } from "next/navigation"
import { Phone, MessageCircle, Car } from "lucide-react"
import Link from "next/link"
import { PRIMARY_LOCATION, whatsappUrl } from "@/lib/locations"

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
    <div className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-black/10 bg-white/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-3">
        <a
          href={`tel:${PRIMARY_LOCATION.phoneE164}`}
          data-track-location="mobile-bar"
          className="flex flex-col items-center justify-center gap-1 py-2.5 text-[#023468] active:bg-zinc-100 transition-colors"
        >
          <Phone className="h-5 w-5" />
          <span className="text-[10px] font-black uppercase tracking-wider">Call</span>
        </a>

        <a
          href={whatsappUrl(waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          data-track-location="mobile-bar"
          className="flex flex-col items-center justify-center gap-1 py-2.5 text-white bg-[#25D366] active:bg-[#1da851] transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-[10px] font-black uppercase tracking-wider">WhatsApp</span>
        </a>

        <Link
          href="/inventory"
          className="flex flex-col items-center justify-center gap-1 py-2.5 text-[#023468] active:bg-zinc-100 transition-colors"
        >
          <Car className="h-5 w-5" />
          <span className="text-[10px] font-black uppercase tracking-wider">Browse</span>
        </Link>
      </div>
    </div>
  )
}
