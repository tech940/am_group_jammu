import { H_PROMISE, LOCATIONS, PRIMARY_LOCATION, getLocation, type Location } from "@/lib/locations"
import { DEALER_NAME, SITE_NAME, SITE_URL } from "@/lib/seo/site"
import { locationNames, serviceLabel } from "@/lib/seo/locations"
import type { InventoryVehicle } from "@/lib/inventory/types"

/**
 * The dealer, described once.
 *
 * Every page's structured data points at the same three kinds of thing, by id:
 *
 *   <origin>/#dealer                    the business (AutoDealer)
 *   <origin>/#website                   this website
 *   <origin>/locations/<slug>#dealer    one of its sites (AutoDealer)
 *
 * The ids are a contract: the car pages name the seller with dealerId() and
 * will name the site a car is at with siteDealerId(slug). Do not change the
 * scheme, and do not describe the dealer inline anywhere else. A second
 * description with a slightly different name or street is what search engines
 * read as two businesses.
 */

// A square mark on the blue ground. Absolute, because readers of structured
// data do not resolve relative paths.
const LOGO = `${SITE_URL}/logo-am-group-square.png`

/** @id of the business. */
export function dealerId(): string {
  return `${SITE_URL}/#dealer`
}

/** @id of the website. */
export function websiteId(): string {
  return `${SITE_URL}/#website`
}

/** @id of one site, by its slug in lib/locations.ts ("jammu", "nanak-nagar", "gangyal"). */
export function siteDealerId(slug: string): string {
  return `${SITE_URL}/locations/${slug}#dealer`
}

/** Same id, from a Location. Kept for callers that already hold one. */
export function locationId(location: Location): string {
  return siteDealerId(location.slug)
}

/**
 * JSON for a <script type="application/ld+json"> block.
 *
 * "<" is written as < so text typed in the admin panel (a car title, a
 * colour) can never close the script element early. Every JSON-LD block on the
 * site should go through this.
 */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}

/**
 * Postal address from confirmed facts only.
 *
 * Locality, region and country are known for every site. Street and PIN are
 * written only when `addressConfirmed` is true: a guessed street would
 * contradict the Google Business Profile, which is worse than leaving it out.
 */
function postalAddress(location: Location) {
  return {
    "@type": "PostalAddress",
    ...(location.addressConfirmed ? { streetAddress: location.streetAddress } : {}),
    addressLocality: location.city,
    addressRegion: location.region,
    ...(location.addressConfirmed && location.postalCode ? { postalCode: location.postalCode } : {}),
    addressCountry: "IN",
  }
}

/**
 * One site.
 *
 * A site whose address the company has not confirmed gets its name, locality,
 * region, country and the shared phone, and nothing else: no street, map link,
 * opening hours, served localities or list of services. Those would be
 * statements about a place we only know the neighbourhood of.
 *
 * `geo` needs a pin checked against the Google Business Profile; none of the
 * three has one yet, so no site emits coordinates today.
 *
 * No aggregateRating or review anywhere. They may only come from real,
 * attributable reviews.
 */
export function siteDealerNode(location: Location) {
  const base = {
    "@type": "AutoDealer",
    "@id": siteDealerId(location.slug),
    name: location.name,
    url: `${SITE_URL}/locations/${location.slug}`,
    telephone: location.phoneE164,
    address: postalAddress(location),
    parentOrganization: { "@id": dealerId() },
  }
  if (!location.addressConfirmed) return base

  return {
    ...base,
    email: location.email,
    currenciesAccepted: "INR",
    // Real photographs of the site only. The logo is not a picture of a place.
    ...(location.photos && location.photos.length > 0 ? { image: location.photos } : {}),
    ...(location.geo.verified
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: location.geo.latitude,
            longitude: location.geo.longitude,
          },
        }
      : {}),
    hasMap: location.mapUrl,
    areaServed: [
      { "@type": "City", name: location.city },
      ...location.areasServed.map((a) => ({ "@type": "Place", name: a })),
    ],
    ...(location.hours.length > 0
      ? {
          openingHoursSpecification: location.hours.map((h) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: h.days,
            opens: h.opens,
            closes: h.closes,
          })),
        }
      : {}),
    makesOffer: location.services.map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: serviceLabel(s) },
    })),
  }
}

/**
 * The business itself.
 *
 * Left out on purpose until the company supplies them: legalName, founder,
 * sameAs (Google Business Profile and social profiles) and foundingDate. 1968
 * is the year the group began selling fuel, not the year this business began
 * selling used cars, so it is not a founding date for a car dealer.
 */
function dealerNode() {
  return {
    "@type": "AutoDealer",
    "@id": dealerId(),
    name: DEALER_NAME,
    alternateName: SITE_NAME,
    url: SITE_URL,
    logo: LOGO,
    // A photograph of the business, not the logo again: search engines use
    // `image` as a picture of the place, and showed the logo as the thumbnail.
    image: `${SITE_URL}/sell/am-hyundai-showroom.webp`,
    description:
      `Used car dealer in Jammu. Buy a second hand car or sell your car at ` +
      `${LOCATIONS.length} sites in Jammu city: ${locationNames()}.`,
    telephone: PRIMARY_LOCATION.phoneE164,
    email: PRIMARY_LOCATION.email,
    // The one site with a confirmed street address.
    address: postalAddress(PRIMARY_LOCATION),
    areaServed: { "@type": "City", name: PRIMARY_LOCATION.city },
    // The group this dealership belongs to, and its own long-standing website.
    // amgroupind.com now sends its used-car pages here (a 301 on the WordPress
    // side, 2026-11-17), so naming it tells search engines the two are the
    // same business rather than an unrelated new site.
    parentOrganization: { "@type": "Organization", name: "AM Group", url: "https://amgroupind.com" },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: PRIMARY_LOCATION.phoneE164,
        // No areaServed and no availableLanguage here. Neither is on record:
        // "IN" (all of India) contradicted the dealer's own areaServed of
        // Jammu just above, and nobody has said which languages are spoken.
        contactType: "sales",
      },
      // Rendered only once the company supplies the number (lib/locations.ts).
      ...(H_PROMISE
        ? [{
            "@type": "ContactPoint",
            name: "H Promise (Hyundai certified used cars)",
            telephone: H_PROMISE.phoneE164,
            contactType: "sales",
          }]
        : []),
    ],
    subOrganization: LOCATIONS.map((l) => ({ "@id": siteDealerId(l.slug) })),
  }
}

function webSiteNode() {
  return {
    "@type": "WebSite",
    "@id": websiteId(),
    url: SITE_URL,
    name: DEALER_NAME,
    inLanguage: "en-IN",
    publisher: { "@id": dealerId() },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/inventory?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }
}

/**
 * The site-wide graph, rendered once by the root layout: the business, the
 * website and one node per site. Pages refer to these by id and never repeat
 * them.
 */
export function dealerGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [dealerNode(), webSiteNode(), ...LOCATIONS.map(siteDealerNode)],
  }
}

/** The name the root layout imports. Same graph. */
export const generateSiteSchema = dealerGraph

/**
 * A page-level node that says what a page is about, by id.
 *
 *   /locations/<slug>  WebPage      mainEntity: that site
 *   /locations         WebPage      about: the business
 *   /contact           ContactPage  mainEntity: the business
 */
export function pageSchema({
  type = "WebPage",
  path,
  name,
  description,
  mainEntityId,
  aboutId,
  image,
}: {
  type?: "WebPage" | "ContactPage" | "AboutPage"
  /** Site path, e.g. "/contact". */
  path: string
  name: string
  description?: string
  mainEntityId?: string
  aboutId?: string
  /** The page's main photograph, e.g. a car it lists. */
  image?: string | null
}) {
  const url = `${SITE_URL}${path}`
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name,
    ...(description ? { description } : {}),
    inLanguage: "en-IN",
    isPartOf: { "@id": websiteId() },
    ...(mainEntityId ? { mainEntity: { "@id": mainEntityId } } : {}),
    ...(aboutId ? { about: { "@id": aboutId } } : {}),
    ...(image ? { primaryImageOfPage: { "@type": "ImageObject", url: image }, image } : {}),
  }
}

/** WebPage for one site's page, tied to that site's node. */
export function locationPageSchema(slug: string, name: string, description?: string, image?: string | null) {
  const location = getLocation(slug)
  return pageSchema({
    path: `/locations/${slug}`,
    name,
    description,
    image,
    mainEntityId: location ? siteDealerId(location.slug) : dealerId(),
  })
}

/**
 * The "sell or exchange your car" service, offered by the business. No price
 * and no promise: the page it sits on makes none.
 */
export function sellServiceSchema(path: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}${path}#service`,
    name: "Sell or exchange your car",
    serviceType: "Used car buying",
    description,
    url: `${SITE_URL}${path}`,
    provider: { "@id": dealerId() },
    areaServed: { "@type": "City", name: PRIMARY_LOCATION.city },
  }
}

/** Newest "last changed" date among some cars, as an ISO string, or null. */
export function newestStockDate(vehicles: InventoryVehicle[]): string | null {
  let newest = 0
  for (const v of vehicles) {
    // When the row was last edited; a car imported before that was recorded
    // only has the day it was listed.
    const raw = v.updatedAt ?? v.postedAt
    const t = raw ? Date.parse(raw) : NaN
    if (Number.isFinite(t) && t > newest) newest = t
  }
  return newest > 0 ? new Date(newest).toISOString() : null
}

/**
 * CollectionPage + ItemList for a page that lists cars. Only the cars actually
 * rendered on the page are listed, and numberOfItems counts those entries (a
 * count larger than the list reads as an error).
 *
 * `startPosition` lets page 2 of a paged list number on from page 1.
 */
export function generateVehicleListSchema({
  name,
  description,
  path,
  vehicles,
  startPosition = 1,
}: {
  name: string
  description: string
  /** Site path of the page, e.g. "/used-cars/suv-in-jammu". */
  path: string
  vehicles: InventoryVehicle[]
  startPosition?: number
}) {
  const dateModified = newestStockDate(vehicles)
  // The first car's photo as the page's main image, so search shows a car.
  const cover = vehicles.find((v) => v.primaryImage)?.primaryImage ?? null
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: `${SITE_URL}${path}`,
    isPartOf: { "@id": websiteId() },
    ...(dateModified ? { dateModified } : {}),
    ...(cover ? { primaryImageOfPage: { "@type": "ImageObject", url: cover }, image: cover } : {}),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: vehicles.length,
      itemListElement: vehicles.map((v, i) => ({
        "@type": "ListItem",
        position: startPosition + i,
        url: `${SITE_URL}/inventory/${v.slug}`,
        name: `${v.year ?? ""} ${v.title}`.trim(),
      })),
    },
  }
}
