"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { PRIMARY_LOCATION } from "@/lib/locations"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import { PhoneGlyph } from "./marks"

/**
 * Site-wide navigation. One header on every public route.
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
  children?: { label: string; href: string; note?: string }[]
}

const ENTRIES: Entry[] = [
  { label: "About", href: "/about" },
  {
    label: "Businesses",
    href: "/automobile",
    children: [
      { label: "Automobile", href: "/automobile", note: "8 franchises, sales & service" },
      { label: "HP & Indian Oil", href: "/hp-indian-oil", note: "Petroleum, since 1968" },
      { label: "Real Estate", href: "/real-estate", note: "Commercial & residential" },
      { label: "S Mega Mart", href: "/s-mega-mart", note: "Retail" },
    ],
  },
  { label: "Used Cars", href: "/inventory" },
  { label: "Locations", href: "/locations" },
  { label: "News", href: "/blog" },
  { label: "Contact", href: "/contact" },
]

/** Routes whose first viewport is a dark ground, so the header starts transparent. */
const DARK_HERO_ROUTES = new Set(["/"])

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
  const [menu, setMenu] = React.useState<string | null>(null)
  const [scrolled, setScrolled] = React.useState(false)

  const sheetRef = React.useRef<HTMLDivElement>(null)
  const toggleRef = React.useRef<HTMLButtonElement>(null)

  // The header is a lead-capture surface, not just a map. The navbar this
  // replaced opened the enquiry modal from two places, and the first version of
  // this component dropped both — the intent and sourceLabel below are the
  // originals so the GTM funnel and the admin lead source stay continuous.
  const openEnquiry = useEnquiryModal((s) => s.onOpen)
  const bookTestDrive = React.useCallback(() => {
    setOpen(false)
    setMenu(null)
    openEnquiry(null, { intent: "Test Drive", sourceLabel: "navbar" })
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

  // Escape closes whichever layer is open, innermost first.
  React.useEffect(() => {
    if (!open && !menu) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (menu) {
        setMenu(null)
        return
      }
      setOpen(false)
      toggleRef.current?.focus()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, menu])

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
    setMenu(null)
  }, [])

  const filled = !overDarkHero || scrolled || open
  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      {/* data-ground switches the global focus outline to paper — the accent
          outline muddies against ink. */}
      <header
        data-ground="deep"
        className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
          filled ? "border-line-on-deep bg-ink" : "border-transparent bg-transparent"
        }`}
        onMouseLeave={() => setMenu(null)}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-stretch justify-between px-5 md:px-10">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="AM Group — home"
            onClick={closeAll}
          >
            <Logo className="h-9 md:h-10" />
            <span className="hidden border-l border-line-on-deep pl-3 text-meta leading-[1.5] text-on-deep-2 sm:block">
              Est. 1968
              <br />
              Jammu &amp; Kashmir
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
            {ENTRIES.map((e) => {
              const current = isCurrent(e.href)
              const tone = current ? "text-on-deep" : "text-on-deep-2 hover:text-on-deep"

              if (!e.children) {
                return (
                  <Link
                    key={e.label}
                    href={e.href}
                    aria-current={current ? "page" : undefined}
                    onClick={closeAll}
                    className={`text-nav transition-colors duration-(--duration-1) ${tone}`}
                  >
                    {e.label}
                  </Link>
                )
              }

              const expanded = menu === e.label
              return (
                <div key={e.label} className="relative" onMouseEnter={() => setMenu(e.label)}>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-haspopup="true"
                    onClick={() => setMenu(expanded ? null : e.label)}
                    className={`text-nav transition-colors duration-(--duration-1) ${tone}`}
                  >
                    {e.label}
                  </button>
                  {expanded && (
                    <div className="absolute left-1/2 top-full w-72 -translate-x-1/2 border border-line-on-deep bg-ink shadow-overlay">
                      {e.children.map((c) => (
                        <Link
                          key={c.href}
                          href={c.href}
                          onClick={closeAll}
                          className="block border-b border-line-on-deep px-4 py-3 last:border-b-0 hover:bg-deep-2"
                        >
                          <span className="block font-display text-lg font-semibold uppercase leading-none text-on-deep">
                            {c.label}
                          </span>
                          {c.note && (
                            <span className="mt-1 block text-meta text-on-deep-2">{c.note}</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
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
              onClick={bookTestDrive}
              className="inline-flex h-11 items-center rounded-sm bg-accent px-5 text-button text-on-deep transition-colors duration-(--duration-1) hover:bg-accent-hover"
            >
              Book test drive
            </button>
          </nav>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-menu"
            className="self-center rounded-sm border border-line-on-deep px-4 py-2 text-button text-on-deep transition-colors duration-(--duration-1) lg:hidden"
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
          className="fixed inset-0 z-40 bg-ink lg:hidden"
        >
          <div className="flex h-full flex-col px-5 pb-10 pt-24">
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
                  {e.children && (
                    <ul className="-mt-1 pb-3 pl-4">
                      {e.children.map((c) => (
                        <li key={c.href}>
                          <Link
                            href={c.href}
                            onClick={closeAll}
                            className="block py-1.5 text-small text-on-deep-2 hover:text-on-deep"
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </nav>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={bookTestDrive}
                className="inline-flex h-12 items-center justify-center rounded-sm bg-accent px-6 text-button text-on-deep transition-colors duration-(--duration-1) hover:bg-accent-hover"
              >
                Book test drive
              </button>
              <a
                href={`tel:${PRIMARY_LOCATION.phoneE164}`}
                data-track-location="site-menu"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-sm border border-line-on-deep px-6 text-button text-on-deep transition-colors duration-(--duration-1) hover:bg-ground hover:text-ink"
              >
                <PhoneGlyph />
                {PRIMARY_LOCATION.phone}
              </a>
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
