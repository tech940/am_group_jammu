"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { H_PROMISE, PRIMARY_LOCATION } from "@/lib/locations"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import { PhoneGlyph } from "./marks"

/**
 * Site-wide navigation for a used-car site. One header on every public route.
 * Four flat entries — buy, sell, locations, contact — and no dropdowns.
 *
 * The header is a dark object in every state. That is not a style preference —
 * the AM Group logo is white artwork on a transparent ground, so it is only
 * legible on ink. Recolouring the mark per background would mean shipping the
 * logo two ways; keeping the header dark means shipping it once, unfiltered,
 * exactly as the brand supplies it.
 *
 * Over a dark hero (the homepage) it starts transparent and fills in on scroll.
 * Everywhere else it is solid from the top and renders its own spacer, so no
 * page has to remember to pad for a fixed header.
 *
 * tel: tracking is handled by the global delegated LinkTracker — the
 * data-track-location attribute is the whole contract, there is no onClick.
 */

interface Entry {
  label: string
  href: string
}

const ENTRIES: Entry[] = [
  { label: "Buy a used car", href: "/inventory" },
  { label: "Sell your car", href: "/sell-your-car" },
  { label: "Locations", href: "/locations" },
  { label: "Contact", href: "/contact" },
]

/** Routes whose first viewport is a dark ground, so the header starts transparent. */
// Empty since the homepage went light: no route starts with a dark
// photographic hero any more, so the header is always its filled self and
// always reserves its 64px. The machinery stays for any future dark opener.
const DARK_HERO_ROUTES = new Set<string>([])

/**
 * The brand mark. White artwork, transparent ground — never filtered, never
 * recoloured, never replaced with a text wordmark.
 */
function Logo({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/logo-am-group.png"
      alt="AM Group"
      width={169}
      height={112}
      priority
      className={`w-auto object-contain ${className}`}
    />
  )
}

export function SiteNav() {
  const pathname = usePathname() ?? "/"
  const [open, setOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  const sheetRef = React.useRef<HTMLDivElement>(null)
  const toggleRef = React.useRef<HTMLButtonElement>(null)

  // The header is a lead-capture surface, not just a map. This is a used-car
  // site, so the control says "Enquire" and opens a general enquiry — the
  // old "Book test drive" label read as a new-car showroom. The sourceLabel is
  // unchanged so the GTM funnel and the admin lead source stay continuous.
  const openEnquiry = useEnquiryModal((s) => s.onOpen)
  const enquire = React.useCallback(() => {
    setOpen(false)
    openEnquiry(null, { intent: "General", sourceLabel: "navbar" })
  }, [openEnquiry])

  const overDarkHero = DARK_HERO_ROUTES.has(pathname)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Scroll lock while the sheet is open.
  React.useEffect(() => {
    if (!open) return
    const previous = document.documentElement.style.overflow
    document.documentElement.style.overflow = "hidden"
    return () => {
      document.documentElement.style.overflow = previous
    }
  }, [open])

  // Escape closes the sheet and returns focus to its toggle.
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      setOpen(false)
      toggleRef.current?.focus()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  // Move focus into the sheet on open so the keyboard path continues where the
  // eye does. The sheet is conditionally rendered, so there is nothing
  // focusable behind it while it is closed.
  React.useEffect(() => {
    if (open) sheetRef.current?.focus()
  }, [open])

  // Closed from the controls that navigate rather than from an effect on
  // pathname — a setState in that effect cascades an extra render.
  const closeAll = React.useCallback(() => {
    setOpen(false)
  }, [])

  const filled = !overDarkHero || scrolled || open
  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      {/* data-ground switches the global focus outline to paper — the accent
          outline muddies against ink. */}
      {/* The homepage no longer runs its own "story" colour world — it is
          built on the shared token set like every other route — so there is no
          data-world stamp here any more. The header simply stays transparent
          over the homepage's deep hero until the reader scrolls. */}
      <header
        data-ground="deep"
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          filled ? "border-b border-line-on-deep bg-deep-2" : "glass-bar border-b border-line-on-deep"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-stretch justify-between px-5 md:px-10">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="AM Group used cars — home"
            onClick={closeAll}
          >
            <Logo className="h-9 md:h-10" />
            <span className="hidden border-l border-line-on-deep pl-3 text-meta leading-[1.5] text-on-deep-2 sm:block">
              Used cars
              <br />
              Jammu
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
            {ENTRIES.map((e) => {
              const current = isCurrent(e.href)
              return (
                <Link
                  key={e.label}
                  href={e.href}
                  aria-current={current ? "page" : undefined}
                  onClick={closeAll}
                  className={`inline-flex h-11 items-center text-nav transition-colors duration-(--duration-1) ${
                    current ? "text-on-deep" : "text-on-deep-2 hover:text-on-deep"
                  }`}
                >
                  {e.label}
                </Link>
              )
            })}

            <a
              href={`tel:${PRIMARY_LOCATION.phoneE164}`}
              data-track-location="site-nav"
              className="ml-2 inline-flex h-11 items-center gap-2 rounded-sm border border-line-on-deep px-4 text-button text-on-deep transition-colors duration-(--duration-1) hover:bg-ground hover:text-ink"
            >
              <PhoneGlyph />
              {PRIMARY_LOCATION.phone}
            </a>
            <button
              type="button"
              onClick={enquire}
              className="inline-flex h-11 items-center rounded-sm bg-accent-bright px-5 text-button text-on-accent-bright transition-colors duration-(--duration-1) hover:bg-accent-bright-hover"
            >
              Enquire
            </button>
          </nav>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-menu"
            className="my-auto flex h-11 items-center rounded-sm border border-line-on-deep px-4 text-button text-on-deep transition-colors duration-(--duration-1) lg:hidden"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </header>

      {/* Mobile menu.
          Conditionally rendered rather than kept mounted at opacity-0: an
          invisible panel left in the DOM is still in the tab order, which sent
          keyboard users into a menu they could not see. */}
      {open && (
        <div
          id="site-menu"
          ref={sheetRef}
          tabIndex={-1}
          data-ground="deep"
          className="fixed inset-0 z-40 bg-deep-2 lg:hidden"
        >
          <div className="flex h-full flex-col px-5 pb-[calc(4rem+env(safe-area-inset-bottom)+1.5rem)] pt-24 md:pb-10">
            <nav aria-label="Site" className="flex-1 overflow-y-auto">
              {ENTRIES.map((e) => (
                <div key={e.label} className="border-t border-line-on-deep last:border-b">
                  <Link
                    href={e.href}
                    onClick={closeAll}
                    aria-current={isCurrent(e.href) ? "page" : undefined}
                    className="group flex items-baseline justify-between py-4"
                  >
                    <span className="font-display text-h1 font-semibold uppercase leading-none text-on-deep transition-colors group-hover:text-accent-text-dark">
                      {e.label}
                    </span>
                    {isCurrent(e.href) && (
                      <span className="text-meta text-accent-text-dark">Current</span>
                    )}
                  </Link>
                </div>
              ))}
            </nav>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={enquire}
                className="inline-flex h-12 items-center justify-center rounded-sm bg-accent-bright px-6 text-button text-on-accent-bright transition-colors duration-(--duration-1) hover:bg-accent-bright-hover"
              >
                Enquire
              </button>
              <a
                href={`tel:${PRIMARY_LOCATION.phoneE164}`}
                data-track-location="site-menu"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-sm border border-line-on-deep px-6 text-button text-on-deep transition-colors duration-(--duration-1) hover:bg-ground hover:text-ink"
              >
                <PhoneGlyph />
                {PRIMARY_LOCATION.phone}
              </a>
              {/* Rendered only once the company supplies the number. */}
              {H_PROMISE && (
                <a
                  href={`tel:${H_PROMISE.phoneE164}`}
                  data-track-location="site-menu-hpromise"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border border-line-on-deep px-6 py-2 text-center text-button leading-snug text-on-deep transition-colors duration-(--duration-1) hover:bg-ground hover:text-ink"
                >
                  <PhoneGlyph />
                  H Promise (Hyundai certified used cars) {H_PROMISE.phone}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* The header is fixed, so ordinary pages get their 64px back here rather
          than each page remembering to pad for it. Dark-hero routes are built
          full-bleed under a transparent header and opt out. */}
      {!overDarkHero && <div aria-hidden className="h-16" />}
    </>
  )
}
