import type { Metadata } from "next"
import Link from "next/link"
import { LOCATIONS, PRIMARY_LOCATION, formatHours, whatsappUrl } from "@/lib/locations"
import { getInventory } from "@/lib/inventory/server"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { FaqSection } from "@/components/seo/faq-section"
import { HPromiseLine } from "@/components/seo/h-promise-line"
import { Button } from "@/components/ui/button"
import { PhoneGlyph } from "@/components/system/marks"
import {
  closedSundays,
  locationAddressLine,
  locationAddressLines,
  locationHeading,
  locationNames,
} from "@/lib/seo/locations"
import { pageSocial } from "@/lib/seo/site"
import { dealerId, jsonLdString, pageSchema } from "@/lib/seo-schemas"
import { AboutDealer } from "./about"

const COUNT = LOCATIONS.length

const title = "Used Car Locations in Jammu"
// Kept near 155 characters so the phone number is not cut off in a search result.
const description =
  `AM Group sells used cars at ${COUNT} sites in Jammu: ${locationNames()}. ` +
  `Open ${formatHours(PRIMARY_LOCATION)}. Call ${PRIMARY_LOCATION.phone}.`

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/locations" },
  ...pageSocial({ title, description, path: "/locations" }),
}

export default async function LocationsPage() {
  const { total } = await getInventory()

  const confirmed = LOCATIONS.filter((l) => l.addressConfirmed)
  const unconfirmed = LOCATIONS.filter((l) => !l.addressConfirmed)

  const faqs = [
    {
      question: "Where can I see AM Group used cars in Jammu?",
      answer:
        `At ${COUNT} locations in Jammu: ${locationNames()}. ` +
        confirmed.map((l) => `${l.shortName} is at ${locationAddressLine(l)}.`).join(" ") +
        (unconfirmed.length
          ? ` For ${unconfirmed.map((l) => l.shortName).join(" and ")}, call ${PRIMARY_LOCATION.phone} and we will give you exact directions.`
          : ""),
    },
    {
      question: "What are the opening hours?",
      answer:
        `${formatHours(PRIMARY_LOCATION)}` +
        `${closedSundays(PRIMARY_LOCATION) ? ". We are closed on Sundays" : ""}. ` +
        `Call ${PRIMARY_LOCATION.phone} if you need to check before you travel.`,
    },
    {
      question: "Is every car at every location?",
      answer:
        `No. Each car is kept at one of the ${COUNT} sites. Call ${PRIMARY_LOCATION.phone} or send an enquiry from ` +
        "the car's page and we will tell you where it is before you set out.",
    },
    {
      question: "Can I sell my car at any of these locations?",
      answer:
        "Yes. Bring the car with its registration certificate and insurance and we will value it. " +
        "You can also start from the Sell your car page and we will call you back.",
    },
    {
      question: "What should I bring for a test drive?",
      answer:
        "A valid driving licence. If you are exchanging your present car, bring its registration certificate, " +
        "insurance and service records as well.",
    },
  ]

  return (
    <div className="min-h-screen bg-ground">
      {/* Says, by id, that this page is about the dealer. The dealer itself is
          described once, in the site-wide graph the root layout renders. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString(
            pageSchema({ path: "/locations", name: title, description, aboutId: dealerId() }),
          ),
        }}
      />
      <Breadcrumbs items={[{ label: "Locations" }]} />

      <section className="border-b border-line bg-ground-2">
        <div className="container mx-auto px-4 py-10 md:px-8 md:py-14">
          <h1 className="mb-5 max-w-4xl font-display text-h1 text-ink">
            Used Car Locations in Jammu
          </h1>
          <div className="max-w-3xl space-y-3">
            <p className="text-body text-ink-2">
              AM Group sells used cars at {COUNT} locations in Jammu — {locationNames()}
              {total > 0 && (
                <>
                  {" "}
                  — with <span data-num>{total}</span> {total === 1 ? "car" : "cars"} in stock right now
                </>
              )}
              . You can also bring your own car to any of them for a valuation.
            </p>
            <p className="text-body text-ink-2">
              Each car is kept at one site. Call before you travel and we will tell you where the car
              you want is.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button asChild variant="primary" size="lg">
              <a href={`tel:${PRIMARY_LOCATION.phoneE164}`} data-track-location="locations-hub-hero">
                <PhoneGlyph /> Call {PRIMARY_LOCATION.phone}
              </a>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a
                href={whatsappUrl("Hi AM Group, which of your Jammu locations should I visit to see used cars?")}
                target="_blank"
                rel="noopener noreferrer"
                data-track-location="locations-hub-hero"
              >
                WhatsApp
              </a>
            </Button>
          </div>
          <HPromiseLine track="locations-hub-hpromise" className="mt-4" />
        </div>
      </section>

      <section aria-labelledby="sites-title" className="py-14">
        <div className="container mx-auto px-4 md:px-8">
          <h2 id="sites-title" className="sr-only">
            Our {COUNT} Jammu locations
          </h2>
          <ul className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {LOCATIONS.map((loc) => (
              <li
                key={loc.slug}
                className="flex flex-col rounded-md border border-line bg-surface p-6"
              >
                <h3 className="font-display text-h2 text-ink">
                  <Link
                    href={`/locations/${loc.slug}`}
                    className="inline-flex min-h-11 items-center transition-colors duration-(--duration-1) hover:text-accent-text-light"
                  >
                    {loc.shortName}
                  </Link>
                </h3>
                <p className="mt-1 text-small text-ink-2">{locationHeading(loc)}</p>

                <dl className="mt-5 space-y-4">
                  <div>
                    <dt className="text-label text-ink">Address</dt>
                    <dd className="mt-1 text-body text-ink-2">
                      <address className="not-italic">
                        {locationAddressLines(loc).map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                      </address>
                      {!loc.addressConfirmed && (
                        <span className="mt-1 block font-semibold text-ink">
                          Call for exact directions
                        </span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-label text-ink">Hours</dt>
                    <dd className="mt-1 text-body text-ink-2">
                      {formatHours(loc)}
                      {closedSundays(loc) && <span className="block">Closed Sundays</span>}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-label text-ink">Phone</dt>
                    <dd>
                      <a
                        href={`tel:${loc.phoneE164}`}
                        data-track-location={`locations-hub-${loc.slug}`}
                        data-num
                        className="inline-flex min-h-11 items-center font-semibold text-ink transition-colors duration-(--duration-1) hover:text-accent-text-light"
                      >
                        {loc.phone}
                      </a>
                    </dd>
                  </div>
                </dl>

                <div className="mt-auto flex flex-wrap gap-2.5 pt-6">
                  <Button asChild variant="primary" className="flex-1">
                    <Link href={`/locations/${loc.slug}`}>Details</Link>
                  </Button>
                  {loc.addressConfirmed ? (
                    <Button asChild variant="secondary" className="flex-1">
                      <a
                        href={loc.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-track-location={`locations-hub-${loc.slug}`}
                      >
                        Directions
                      </a>
                    </Button>
                  ) : (
                    <Button asChild variant="secondary" className="flex-1">
                      <a href={`tel:${loc.phoneE164}`} data-track-location={`locations-hub-${loc.slug}`}>
                        Call for directions
                      </a>
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild variant="secondary" size="lg">
              <Link href="/inventory">See all used cars</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/sell-your-car">Sell your car</Link>
            </Button>
          </div>
        </div>
      </section>

      <AboutDealer />

      <FaqSection items={faqs} title="Visiting AM Group in Jammu — FAQs" />
    </div>
  )
}
