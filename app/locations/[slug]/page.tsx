import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  LOCATIONS,
  PRIMARY_LOCATION,
  formatHours,
  getLocation,
  whatsappUrl,
  type Location,
} from "@/lib/locations"
import { getInventory } from "@/lib/inventory/server"
import { toCardVehicle } from "@/lib/inventory/filter"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { FaqSection } from "@/components/seo/faq-section"
import { FrequentSearches } from "@/components/seo/frequent-searches"
import { HPromiseLine } from "@/components/seo/h-promise-line"
import { getFrequentSearches } from "@/lib/seo/links"
import { pageSocial } from "@/lib/seo/site"
import { jsonLdString, locationPageSchema } from "@/lib/seo-schemas"
import {
  closedSundays,
  locationAddressLine,
  locationAddressLines,
  locationHeading,
  locationMapQuery,
  locationPlace,
  serviceLabel,
} from "@/lib/seo/locations"
import { SiteMap } from "../site-map"
import { FeaturedInventory } from "@/components/sections/inventory"
import { Button } from "@/components/ui/button"
import { PhoneGlyph } from "@/components/system/marks"

/**
 * One page per used-car location.
 *
 * This is what "near me" needs from a website: a distinct location page with
 * consistent name, phone, hours and service area, so Google can tie it to the
 * Google Business Profile. The AutoDealer structured data for every location
 * is emitted once, site-wide, by the root layout; this page adds one small
 * WebPage node that says which of those sites it is about.
 *
 * Two of the three sites have only a locality on record. For those the page
 * shows the locality and "call for exact directions" — never a street, a PIN,
 * a map or a landmark, because any of those would be a guess. So that the two
 * are not copies of each other with the name swapped, each says what is
 * actually known about it (its own name, if it has one, and its locality) and
 * points to the one site whose address is published.
 */

/** The title and description, shared by the metadata and the page's own node. */
function describe(loc: Location) {
  const title = locationHeading(loc)
  const description = loc.addressConfirmed
    ? // Phone before hours, and no region or landmark, so the number survives
      // where a search result cuts the text at about 155 characters.
      `Buy or sell a used car at AM Group, ${locationMapQuery(loc)}. Call ${loc.phone}. Open ${formatHours(loc)}.`
    : `Buy or sell a used car with AM Group in ${locationPlace(loc)}, ${loc.city}. Open ${formatHours(loc)}. ` +
      `Call ${loc.phone} for exact directions.`
  return { title, description }
}

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return LOCATIONS.map((l) => ({ slug: l.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const loc = getLocation(slug)
  if (!loc) return { title: "Location Not Found", robots: "noindex" }

  const { title, description } = describe(loc)

  return {
    title,
    description,
    alternates: { canonical: `/locations/${loc.slug}` },
    ...pageSocial({ title, description, path: `/locations/${loc.slug}` }),
  }
}

const list = (items: string[]): string =>
  items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`

export default async function LocationPage({ params }: Props) {
  const { slug } = await params
  const loc = getLocation(slug)
  if (!loc) notFound()

  const [{ vehicles, total }, frequentSearches] = await Promise.all([
    getInventory(),
    getFrequentSearches(24),
  ])

  const place = locationPlace(loc)
  const heading = locationHeading(loc)
  const hours = formatHours(loc)
  const sundayNote = closedSundays(loc) ? " We are closed on Sundays." : ""
  const otherLocations = LOCATIONS.filter((l) => l.slug !== loc.slug)
  const { title, description } = describe(loc)
  // A site with its own name ("AM Auto Square") as well as a locality.
  const siteName = loc.shortName.split(",")[0].trim()
  const hasOwnName = siteName !== place

  const faqs = [
    {
      question: `Where is AM Group in ${place}?`,
      answer: loc.addressConfirmed
        ? `${locationAddressLine(loc)}. We are open ${hours}.`
        : `Our used-car location is in ${place}, ${loc.city}. Call ${loc.phone} and we will give you exact ` +
          `directions.`,
    },
    // FaqSection writes every answer into FAQPage structured data. Opening
    // hours are stated there only for a site whose details are confirmed; for
    // the others the hours stay in the visible details block above, which
    // reads them from lib/locations.ts, and are not repeated as an answer.
    ...(loc.addressConfirmed
      ? [
          {
            question: `What are the opening hours at ${loc.shortName}?`,
            answer: `${hours}.${sundayNote} Call ${loc.phone} to check before you travel.`,
          },
        ]
      : []),
    {
      question: `Which used cars can I see at ${loc.shortName}?`,
      answer:
        (total > 0
          ? `We have ${total} used ${total === 1 ? "car" : "cars"} in stock across our ${LOCATIONS.length} Jammu locations. `
          : "") +
        `Each car is kept at one site, so call ${loc.phone} first and we will confirm which cars are at ${loc.shortName}.`,
    },
    {
      question: `Can I sell my car at ${loc.shortName}?`,
      answer:
        "Yes. Bring the car with its registration certificate and insurance and we will value it. " +
        "If you are buying from us as well, the value is set against the car you choose.",
    },
    {
      question: "What should I bring when visiting?",
      answer:
        "For a test drive, bring a valid driving licence. If you are selling or exchanging, bring your car's " +
        "registration certificate, insurance and service records.",
    },
  ]

  return (
    <div className="min-h-screen bg-ground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString(locationPageSchema(loc.slug, title, description)),
        }}
      />
      <Breadcrumbs
        items={[{ label: "Locations", href: "/locations" }, { label: loc.shortName }]}
      />

      {/* Name, phone and hours on the first screen — what a visitor came for. */}
      <section className="border-b border-line bg-ground-2">
        <div className="container mx-auto px-4 py-10 md:px-8 md:py-14">
          <h1 className="mb-5 max-w-4xl font-display text-h1 text-ink">{heading}</h1>

          <div className="max-w-3xl space-y-3">
            <p className="text-body text-ink-2">{loc.blurb}</p>
            <p className="text-body text-ink-2">
              {loc.addressConfirmed ? (
                <>
                  Find us at <strong className="font-semibold text-ink">{locationAddressLine(loc)}</strong>.
                </>
              ) : (
                <>
                  We are in <strong className="font-semibold text-ink">{place}, {loc.city}</strong>. Call
                  for exact directions.
                </>
              )}{" "}
              Open {hours}.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="primary" size="lg">
              <a href={`tel:${loc.phoneE164}`} data-track-location={`location-hero-${loc.slug}`}>
                <PhoneGlyph /> {loc.addressConfirmed ? `Call ${loc.phone}` : "Call for directions"}
              </a>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a
                href={whatsappUrl(`Hi AM Group, I'd like to visit ${loc.shortName} in ${loc.city} to see used cars.`)}
                target="_blank"
                rel="noopener noreferrer"
                data-track-location={`location-hero-${loc.slug}`}
              >
                WhatsApp
              </a>
            </Button>
            {loc.addressConfirmed && (
              <Button asChild variant="secondary" size="lg">
                <a
                  href={loc.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track-location={`location-hero-${loc.slug}`}
                >
                  Directions
                </a>
              </Button>
            )}
            <Button asChild variant="secondary" size="lg">
              <Link href="/inventory">See used cars</Link>
            </Button>
          </div>
          <HPromiseLine track={`location-hpromise-${loc.slug}`} className="mt-4" />
        </div>
      </section>

      {/* Details */}
      <section aria-labelledby="details-title" className="border-b border-line py-12">
        <div className="container mx-auto px-4 md:px-8">
          <h2 id="details-title" className="font-display text-h2 text-ink">
            Address, hours and contact
          </h2>

          <dl className="mt-6 grid grid-cols-1 gap-x-10 gap-y-8 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-label text-ink">Address</dt>
              <dd className="mt-2 text-body text-ink-2">
                <address className="not-italic">
                  {locationAddressLines(loc).map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
                {!loc.addressConfirmed && (
                  <span className="mt-1 block font-semibold text-ink">Call for exact directions</span>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-label text-ink">Opening hours</dt>
              <dd className="mt-2 text-body text-ink-2">
                {hours}
                {closedSundays(loc) && <span className="block">Closed Sundays</span>}
              </dd>
            </div>

            <div>
              <dt className="text-label text-ink">Contact</dt>
              <dd className="mt-1 text-body">
                <a
                  href={`tel:${loc.phoneE164}`}
                  data-track-location={`location-${loc.slug}`}
                  data-num
                  className="flex min-h-11 items-center font-semibold text-ink transition-colors duration-(--duration-1) hover:text-accent-text-light"
                >
                  {loc.phone}
                </a>
                <a
                  href={`mailto:${loc.email}`}
                  data-track-location={`location-${loc.slug}`}
                  className="flex min-h-11 items-center text-ink-2 transition-colors duration-(--duration-1) hover:text-accent-text-light"
                >
                  {loc.email}
                </a>
              </dd>
            </div>

            <div>
              <dt className="text-label text-ink">What you can do here</dt>
              <dd className="mt-2">
                <ul className="space-y-1.5">
                  {loc.services.map((s) => (
                    <li key={s} className="text-body text-ink-2">
                      {serviceLabel(s)}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Map: only for a site whose address is confirmed. */}
      {loc.addressConfirmed && (
        <section aria-labelledby="map-title" className="border-b border-line py-12">
          <div className="container mx-auto max-w-4xl px-4 md:px-8">
            {/* The address is printed once, under the map, by SiteMap. */}
            <h2 id="map-title" className="mb-6 font-display text-h2 text-ink">
              Map and directions
            </h2>
            <SiteMap location={loc} track={`location-map-${loc.slug}`} />
          </div>
        </section>
      )}

      {/* Areas + visiting */}
      <section className="bg-ground-2 py-14">
        <div className="container mx-auto max-w-4xl space-y-9 px-4 md:px-8">
          {!loc.addressConfirmed && (
            <article>
              <h2 className="mb-3 font-display text-h2 text-ink">Finding {loc.shortName}</h2>
              <p className="text-body text-ink-2">
                {hasOwnName
                  ? `This site is called ${siteName}. It is in ${place}, ${loc.city}.`
                  : `This site is in the ${place} locality of ${loc.city} city.`}{" "}
                Its street address and map pin are not published on this website yet, so this page
                has no map. Call{" "}
                <a
                  href={`tel:${loc.phoneE164}`}
                  data-track-location={`location-finding-${loc.slug}`}
                  data-num
                  className="font-semibold text-ink underline underline-offset-4 transition-colors duration-(--duration-1) hover:text-accent-text-light"
                >
                  {loc.phone}
                </a>{" "}
                and we will give you directions from where you are.
              </p>
              {PRIMARY_LOCATION.addressConfirmed && (
                <p className="mt-3 text-body text-ink-2">
                  If you would rather come to an address you can look up, our{" "}
                  <Link
                    href={`/locations/${PRIMARY_LOCATION.slug}`}
                    className="font-semibold text-ink underline underline-offset-4 transition-colors duration-(--duration-1) hover:text-accent-text-light"
                  >
                    {PRIMARY_LOCATION.shortName} site
                  </Link>{" "}
                  has one: {locationAddressLine(PRIMARY_LOCATION)}.
                </p>
              )}
            </article>
          )}

          {loc.areasServed.length > 0 && (
          <article>
              <h2 className="mb-3 font-display text-h2 text-ink">Areas near {place}</h2>
              <p className="text-body text-ink-2">
                Buyers and sellers come to {loc.shortName} from {list(loc.areasServed)}, and from the rest
                of {loc.city}.
              </p>
            </article>
          )}

          <article>
            <h2 className="mb-3 font-display text-h2 text-ink">Before you visit</h2>
            <p className="text-body text-ink-2">
              Each car is kept at one of our {LOCATIONS.length} Jammu sites, so call first and we will
              confirm the car you want is at {loc.shortName}. Bring a valid driving licence for a test
              drive. To{" "}
              <Link
                href="/sell-your-car"
                className="font-semibold text-ink underline underline-offset-4 transition-colors duration-(--duration-1) hover:text-accent-text-light"
              >
                sell or exchange your car
              </Link>
              , bring its registration certificate, insurance and service records.
            </p>
          </article>

          {otherLocations.length > 0 && (
            <article className="border-t border-line pt-6">
              <h2 className="mb-3 font-display text-h2 text-ink">Our other Jammu locations</h2>
              <div className="flex flex-wrap gap-2.5">
                {otherLocations.map((o) => (
                  <Button key={o.slug} asChild variant="secondary">
                    <Link href={`/locations/${o.slug}`}>{o.shortName}</Link>
                  </Button>
                ))}
              </div>
            </article>
          )}
        </div>
      </section>

      {vehicles.length > 0 && (
        <FeaturedInventory
          // Each card is handed only the photos it can show, not all of the
          // car's photos (up to 49 addresses per car were written into this page).
          vehicles={vehicles.slice(0, 6).map((v) => toCardVehicle(v))}
          listId={`location-${loc.slug}`}
          listName={`Used cars at ${loc.shortName}`}
          title="Used cars in stock in Jammu"
          subtitle={`${total} ${total === 1 ? "car" : "cars"} across our ${LOCATIONS.length} locations — call to check which site a car is at`}
        />
      )}

      <FaqSection items={faqs} title={`Visiting ${loc.shortName} — FAQs`} />

      <FrequentSearches searches={frequentSearches} />
    </div>
  )
}
