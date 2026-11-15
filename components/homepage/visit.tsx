import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowGlyph } from "@/components/system/marks"
import {
  H_PROMISE,
  LOCATIONS,
  PRIMARY_LOCATION,
  formatHours,
  whatsappUrl,
} from "@/lib/locations"
import { SectionHead, StoreBand } from "./section-head"

/**
 * The three used-car sites in Jammu.
 *
 * Name, address, phone and hours all come from lib/locations.ts and are never
 * retyped here. Local ranking depends on this text matching the Google
 * Business Profile, and the surest way to break that is a second copy of an
 * address living in a component.
 *
 * UNCONFIRMED ADDRESSES ARE SHOWN AS UNCONFIRMED. Only AM Business Park has a
 * street address on record. For a site with `addressConfirmed: false` this
 * prints the locality and "exact address on request", and offers a call
 * instead of a Directions button — that site's `mapUrl` is a search query,
 * not a pin, and sending a customer to a guessed spot is worse than asking
 * them to ring.
 *
 * ONE MAIN CONTACT ROW. The main number, WhatsApp and email appear once
 * under the list. A site that has its own number (AM Hyundai Gandhi Nagar
 * does, since 2026-11-15) also shows that number in its own entry. The H Promise line is printed only when the number
 * has actually been supplied (H_PROMISE is null until then).
 *
 * Used on the homepage and on /sell-your-car; `source` keeps the two apart in
 * call tracking.
 */
export function Visit({
  title = `${LOCATIONS.length} sites in Jammu, open six days`,
  lede = "Stock is spread across all of them. Call to confirm which site a car is at before you set out.",
  source = "home-visit",
  ground = "ground",
}: {
  title?: string
  lede?: string
  /** Prefix for data-track-location. */
  source?: string
  ground?: "ground" | "ground-2"
}) {
  return (
    <StoreBand ground={ground} labelledBy="visit-title" id="visit">
      <SectionHead id="visit-title" title={title} lede={lede} />

      <ul className="mt-7 grid grid-cols-1 border-t border-line-strong md:mt-10 md:grid-cols-3 md:gap-x-10">
        {LOCATIONS.map((location) => (
          <li
            key={location.slug}
            className="flex flex-col border-b border-line py-6 md:border-b-0 md:py-8"
          >
            <h3 className="font-display text-h2 uppercase text-ink">
              <Link
                href={`/locations/${location.slug}`}
                className="inline-flex min-h-11 items-center transition-colors duration-(--duration-1) hover:text-accent"
              >
                {location.shortName}
              </Link>
            </h3>

            <address className="mt-2 flex-1 not-italic text-body text-ink-2">
              {location.addressConfirmed ? (
                <>
                  {location.streetAddress}
                  <br />
                  {[location.city, location.postalCode].filter(Boolean).join(" ")}
                  <br />
                  {location.landmark}
                </>
              ) : (
                <>
                  {location.landmark}
                  <br />
                  Exact address on request — call for directions.
                </>
              )}
            </address>

            <p className="mt-3 text-small text-ink-2">{formatHours(location)}</p>
            {location.phoneE164 !== PRIMARY_LOCATION.phoneE164 && (
              <a
                href={`tel:${location.phoneE164}`}
                data-track-location={`${source}-${location.slug}`}
                data-num
                className="mt-1 inline-flex min-h-11 items-center text-body font-semibold text-ink underline-offset-4 transition-colors duration-(--duration-1) hover:text-accent hover:underline"
              >
                {location.phone}
              </a>
            )}

            <div className="mt-4">
              {location.addressConfirmed ? (
                <Button asChild variant="secondary">
                  <a
                    href={location.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-track-location={`${source}-${location.slug}`}
                  >
                    Directions
                  </a>
                </Button>
              ) : (
                <Button asChild variant="secondary">
                  <a
                    href={`tel:${location.phoneE164}`}
                    data-track-location={`${source}-${location.slug}`}
                  >
                    Call for directions
                  </a>
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* The main number. */}
      <div className="mt-6 flex flex-wrap items-center gap-3 md:mt-2 md:border-t md:border-line md:pt-8">
        <Button asChild variant="primary" size="lg">
          <a href={`tel:${PRIMARY_LOCATION.phoneE164}`} data-track-location={source}>
            Call {PRIMARY_LOCATION.phone}
          </a>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <a
            href={whatsappUrl(
              "Hi AM Group, I'd like to visit one of your used-car sites in Jammu. Which one should I come to?",
            )}
            target="_blank"
            rel="noopener noreferrer"
            data-track-location={source}
          >
            WhatsApp
          </a>
        </Button>
        {H_PROMISE && (
          <Button asChild variant="secondary" size="lg">
            <a href={`tel:${H_PROMISE.phoneE164}`} data-track-location={`${source}-h-promise`}>
              H Promise {H_PROMISE.phone}
            </a>
          </Button>
        )}
        <Link
          href="/locations"
          className="inline-flex min-h-11 items-center gap-2 px-2 text-button text-accent transition-colors duration-(--duration-1) hover:text-accent-hover"
        >
          All locations
          <ArrowGlyph />
        </Link>
      </div>
    </StoreBand>
  )
}
