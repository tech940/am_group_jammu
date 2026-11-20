import Image from "next/image"
import Link from "@/components/system/intent-link"
import { LOCATIONS, PRIMARY_LOCATION, formatHours, whatsappUrl } from "@/lib/locations"
import { closedSundays, locationAddressLines } from "@/lib/seo/locations"
import type { SeoLinks } from "@/lib/seo/links"
import { HPromiseLine } from "@/components/seo/h-promise-line"
import { ChatGlyph, PhoneGlyph } from "./marks"

/**
 * Site-wide footer for a used-car site. One footer on every public route.
 *
 * Three jobs:
 *  1. Buy and sell — the routes a buyer or seller needs, plus the budget and
 *     make pages generated from live stock, so every indexable landing page is
 *     linked from every page.
 *  2. The three Jammu locations with name, address, phone and hours from
 *     lib/locations.ts (the single NAP source — local ranking depends on it
 *     agreeing everywhere). A site with only a locality on record shows the
 *     locality and "call for exact directions", never a guessed street.
 *  3. Legal — the privacy and terms links ad platforms check for.
 *
 * These are real <Link> anchors in the server-rendered HTML; seoLinks is
 * fetched once in the root layout so they are present before hydration.
 */

const BUY: { label: string; href: string }[] = [
  { label: "All used cars", href: "/inventory" },
  { label: "Used cars in Jammu", href: "/used-cars/jammu" },
]

const SELL_AND_HELP: { label: string; href: string }[] = [
  { label: "Sell your car", href: "/sell-your-car" },
  { label: "Our locations", href: "/locations" },
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
      {/* A paragraph, not a heading. These five titles used to be h2s, so
          every page's outline ended with "Buy a used car", "By budget" and so
          on as if they were sections of that page. The <nav aria-label> above
          already names the block for assistive technology. */}
      <p className="border-b border-line-on-deep pb-2 text-label text-on-deep">{title}</p>
      <ul className="mt-1">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="flex min-h-11 items-center text-body leading-snug text-on-deep-2 transition-colors duration-(--duration-1) hover:text-on-deep"
            >
              {l.label}
              {typeof l.count === "number" && (
                <span className="ml-1.5 text-small text-accent-text-dark" data-num>
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

  return (
    // data-ground switches the global focus outline to paper — the accent
    // outline muddies against ink.
    <footer data-ground="deep" className="bg-deep-2 text-on-deep">
      <div className="mx-auto max-w-[1400px] px-5 pt-14 md:px-10">
        {/* Brand + the two fastest ways to reach us */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            {/* White artwork on transparent — the ink ground is what makes it
                legible, and it is never filtered or recoloured. */}
            <Link href="/" aria-label="AM Group used cars — home" className="inline-block">
              <Image
                src="/logo-am-group.png"
                alt="AM Group"
                width={169}
                height={112}
                className="h-14 w-auto object-contain"
              />
            </Link>
            <p className="mt-4 max-w-[44ch] text-body text-on-deep-2">
              Used cars in Jammu. Buy a second hand car or sell yours at any of our{" "}
              {LOCATIONS.length} locations.
            </p>
          </div>

          <div className="flex flex-col gap-2 md:items-end">
            <div className="flex flex-wrap gap-3">
              <a
                href={`tel:${PRIMARY_LOCATION.phoneE164}`}
                data-track-location="site-footer"
                data-num
                className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-accent-bright px-5 py-3 text-button text-on-accent-bright transition-colors duration-(--duration-1) hover:bg-accent-bright-hover"
              >
                <PhoneGlyph /> {PRIMARY_LOCATION.phone}
              </a>
              <a
                href={whatsappUrl("Hi AM Group, I'm looking for a used car in Jammu.")}
                target="_blank"
                rel="noopener noreferrer"
                data-track-location="site-footer"
                className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-line-on-deep px-5 py-3 text-button text-on-deep transition-colors duration-(--duration-1) hover:bg-ground hover:text-ink"
              >
                <ChatGlyph /> WhatsApp
              </a>
            </div>
            <HPromiseLine track="site-footer-hpromise" onDeep />
            <a
              href={`mailto:${PRIMARY_LOCATION.email}`}
              data-track-location="site-footer"
              className="inline-flex min-h-11 items-center text-body text-on-deep-2 transition-colors duration-(--duration-1) hover:text-on-deep"
            >
              {PRIMARY_LOCATION.email}
            </a>
          </div>
        </div>

        {/* Buy / sell links */}
        <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-line-on-deep pt-10 md:grid-cols-4">
          <LinkColumn title="Buy a used car" links={[...BUY, ...seoLinks.bodyTypes.slice(0, 5)]} />
          <LinkColumn title="By budget" links={seoLinks.budgets} />
          <LinkColumn title="By make" links={seoLinks.makes.slice(0, 8)} />
          <LinkColumn title="Sell and visit" links={SELL_AND_HELP} />
        </div>

        {/* The three locations — NAP */}
        <section aria-labelledby="footer-locations" className="mt-10 border-t border-line-on-deep pt-10">
          {/* Not a heading, for the same reason as the link columns; the id
              still names the section. */}
          <p id="footer-locations" className="text-label text-on-deep">
            Used-car locations in Jammu
          </p>
          <ul className="mt-5 grid grid-cols-1 gap-8 md:grid-cols-3 xl:grid-cols-5">
            {LOCATIONS.map((l) => (
              <li key={l.slug}>
                <Link
                  href={`/locations/${l.slug}`}
                  className="inline-flex min-h-11 items-center font-display text-h3 text-on-deep transition-colors duration-(--duration-1) hover:text-accent-text-dark"
                >
                  {l.shortName}
                </Link>
                <address className="not-italic text-body leading-relaxed text-on-deep-2">
                  {locationAddressLines(l).map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                  {!l.addressConfirmed && (
                    <span className="block text-on-deep">Call for exact directions</span>
                  )}
                </address>
                <p className="mt-2 text-body text-on-deep-2">
                  {formatHours(l)}
                  {closedSundays(l) ? " · Closed Sundays" : ""}
                </p>
                <a
                  href={`tel:${l.phoneE164}`}
                  data-track-location={`site-footer-${l.slug}`}
                  data-num
                  className="inline-flex min-h-11 items-center text-body font-semibold text-on-deep underline-offset-4 hover:underline"
                >
                  {l.phone}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Legal */}
      <div className="mt-12 border-t border-line-on-deep">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-3 px-5 py-5 text-small text-on-deep-2 md:flex-row md:items-center md:px-10">
          <p>© {year} AM Group, Jammu. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href="/privacy-policy"
              className="inline-flex min-h-11 items-center transition-colors duration-(--duration-1) hover:text-on-deep"
            >
              Privacy policy
            </Link>
            <span aria-hidden className="text-on-deep-2/40">
              |
            </span>
            <Link
              href="/terms"
              className="inline-flex min-h-11 items-center transition-colors duration-(--duration-1) hover:text-on-deep"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
