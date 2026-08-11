"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LOCATIONS, PRIMARY_LOCATION, formatAddress, formatHours } from "@/lib/locations"
import type { SeoLinks } from "@/lib/seo/links"
import { PhoneGlyph } from "./marks"

/**
 * Site-wide footer. One footer on every public route.
 *
 * Three jobs:
 *  1. Site index — where the rest of the company lives. Every page.
 *  2. The stock-derived SEO directory (by brand / model / budget / city / body
 *     / fuel / transmission / year). LISTING AND PRODUCT PAGES ONLY — see
 *     SHOWS_STOCK_DIRECTORY. Its own heading says "backed by live stock", and
 *     that claim only makes sense where the visitor is actually shopping. On a
 *     corporate page it is a wall of long-tail car links under a company story.
 *  3. NAP + legal. Address, phone and hours come from lib/locations.ts (the
 *     single NAP source — local ranking depends on it agreeing everywhere), and
 *     the privacy/terms links ad platforms check for.
 *
 * These stay real <Link> anchors in the server-rendered HTML; seoLinks is
 * fetched once in the root layout so they are present before hydration.
 */

/**
 * Routes that sell cars: the listing pages and the product page.
 *
 * The fuel / transmission / year landing pages are reachable only from this
 * directory, so the set must stay wide enough to keep them linked — it spans
 * /inventory, all 27 vehicle pages, every brand page and every /used-cars
 * landing, which is where a crawler following stock intent actually goes.
 */
const STOCK_ROUTES = ["/inventory", "/used-cars", "/brands"]

function showsStockDirectory(pathname: string | null): boolean {
  if (!pathname) return false
  return STOCK_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

const SITE_INDEX: { label: string; href: string }[] = [
  { label: "About the group", href: "/about" },
  { label: "Automobile division", href: "/automobile" },
  { label: "HP & Indian Oil", href: "/hp-indian-oil" },
  { label: "Real estate", href: "/real-estate" },
  { label: "S Mega Mart", href: "/s-mega-mart" },
  { label: "All used cars", href: "/inventory" },
  { label: "Showrooms & directions", href: "/locations" },
  { label: "News & updates", href: "/blog" },
  { label: "Contact", href: "/contact" },
]

function LinkColumn({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string; count?: number }[]
}) {
  if (links.length === 0) return null
  return (
    <nav aria-label={title}>
      <h3 className="border-b border-line-on-deep pb-2 text-meta uppercase text-on-deep-2">
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-small leading-snug text-on-deep-2 transition-colors duration-(--duration-1) hover:text-on-deep"
            >
              {l.label}
              {typeof l.count === "number" && (
                <span className="ml-1.5 text-meta text-accent-text-dark" data-num>
                  ({l.count})
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function SiteFooter({ seoLinks }: { seoLinks: SeoLinks }) {
  const year = new Date().getFullYear()
  const flagship = PRIMARY_LOCATION
  const withStockDirectory = showsStockDirectory(usePathname())

  return (
    // data-ground switches the global focus outline to paper — the accent
    // outline muddies against ink.
    <footer data-ground="deep" className="bg-ink text-on-deep">
      <div className="mx-auto max-w-[1400px] px-5 pt-16 md:px-10 md:pt-20">
        {withStockDirectory ? (
          <>
            <h2 className="border-b border-line-on-deep pb-4 text-meta uppercase text-on-deep-2">
              Browse the group — every entry backed by live stock
            </h2>

            {/* Every group, untruncated. An earlier version hand-picked five
                columns and sliced them, which silently dropped "by Fuel",
                "by Transmission" and "by Year" — statically generated landing
                pages (/used-cars/diesel-cars-in-jammu and friends) that would
                then have had no inbound link at all. Render what
                lib/seo/links.ts produces; it already drops empty groups. */}
            <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              <LinkColumn title="The group" links={SITE_INDEX} />
              {seoLinks.groups.map((group) => (
                <LinkColumn key={group.title} title={group.title} links={group.links} />
              ))}
            </div>
          </>
        ) : (
          // Off the stock routes the footer is a site index, not a car
          // directory. Same columns component, one group, no stock heading.
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
            <LinkColumn title="The group" links={SITE_INDEX} />
          </div>
        )}
      </div>

      {/* NAP */}
      <div className="mx-auto mt-14 max-w-[1400px] px-5 md:px-10">
        <div className="grid gap-8 border-t border-line-on-deep pt-10 md:grid-cols-[1.4fr_1fr_auto] md:gap-12">
          <div>
            {/* The brand mark. White artwork on transparent — the ink ground is
                what makes it legible, and it is never filtered or recoloured. */}
            <Link href="/" aria-label="AM Group — home" className="inline-block">
              <Image
                src="/logo-am-group.png"
                alt="AM Group"
                width={169}
                height={112}
                className="h-14 w-auto object-contain"
              />
            </Link>
            <p className="mt-4 text-meta uppercase text-on-deep-2">
              Est. 1968 · Jammu &amp; Kashmir
            </p>
            <address className="mt-5 max-w-[46ch] not-italic text-body leading-relaxed text-on-deep-2">
              <strong className="font-semibold text-on-deep">{flagship.name}</strong>
              <br />
              {formatAddress(flagship)}
              <br />
              Open {formatHours(flagship)}.
            </address>
          </div>

          <div className="self-end">
            <h3 className="text-meta uppercase text-on-deep-2">Showrooms</h3>
            <ul className="mt-3 space-y-1.5">
              {LOCATIONS.map((l) => (
                <li key={l.slug}>
                  <Link
                    href={`/locations/${l.slug}`}
                    className="text-small text-on-deep-2 transition-colors duration-(--duration-1) hover:text-on-deep"
                  >
                    {l.shortName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 self-end md:items-end">
            <a
              href={`tel:${flagship.phoneE164}`}
              data-track-location="site-footer"
              className="inline-flex items-center gap-2 rounded-sm border border-line-on-deep px-5 py-3 text-button text-on-deep transition-colors duration-(--duration-1) hover:bg-ground hover:text-ink"
            >
              <PhoneGlyph /> {flagship.phone}
            </a>
            <a
              href={`mailto:${flagship.email}`}
              className="text-small text-on-deep-2 transition-colors duration-(--duration-1) hover:text-on-deep"
            >
              {flagship.email}
            </a>
          </div>
        </div>
      </div>

      {/* Legal */}
      <div className="mt-12 border-t border-line-on-deep">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-3 px-5 py-5 text-meta uppercase text-on-deep-2 md:flex-row md:items-center md:px-10">
          <p>© {year} AM Group Jammu — all rights reserved</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href="/privacy-policy"
              className="transition-colors duration-(--duration-1) hover:text-on-deep"
            >
              Privacy policy
            </Link>
            <span aria-hidden className="text-on-deep-2/40">
              |
            </span>
            <Link
              href="/terms"
              className="transition-colors duration-(--duration-1) hover:text-on-deep"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
