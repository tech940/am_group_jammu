import { VehicleSEO } from "@/types/seo"
import { H_PROMISE, LOCATIONS, PRIMARY_LOCATION, type Location } from "@/lib/locations"
import { SITE_URL, SITE_NAME } from "@/lib/seo/site"
import { locationNames } from "@/lib/seo/locations"
import type { InventoryVehicle } from "@/lib/inventory/types"

// Served by this app, not hot-linked from the old WordPress site. Absolute
// because schema.org consumers do not resolve relative paths.
const LOGO = `${SITE_URL}/logo-am-group.png`

const ORGANIZATION_ID = `${SITE_URL}#organization`
const WEBSITE_ID = `${SITE_URL}#website`

/** Stable @id per location so the Organization can reference them. */
export function locationId(location: Location): string {
  return `${SITE_URL}/locations/${location.slug}#dealer`
}

/**
 * Postal address using only what the company has confirmed.
 *
 * Locality, region and country are always known. Street and PIN are emitted
 * only when `addressConfirmed` is true — a guessed street in structured data
 * would contradict the Google Business Profile, which is worse than leaving
 * the field out. A PostalAddress without streetAddress is still valid.
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
 * AutoDealer (a LocalBusiness subtype) for one used-car location.
 *
 * `geo` and `hasMap` are omitted until the pin is verified against the Google
 * Business Profile: the coordinates on file are locality centres, and a wrong
 * pin sends a buyer to the wrong side of town.
 *
 * Deliberately no `aggregateRating`: inventing review counts is a
 * structured-data violation. Add it only from real, verifiable reviews.
 */
export function generateDealerNode(location: Location) {
  return {
    "@type": "AutoDealer",
    "@id": locationId(location),
    name: location.name,
    image: LOGO,
    logo: LOGO,
    url: `${SITE_URL}/locations/${location.slug}`,
    telephone: location.phoneE164,
    email: location.email,
    currenciesAccepted: "INR",
    address: postalAddress(location),
    ...(location.geo.verified
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: location.geo.latitude,
            longitude: location.geo.longitude,
          },
        }
      : {}),
    ...(location.addressConfirmed ? { hasMap: location.mapUrl } : {}),
    areaServed: [
      { "@type": "City", name: location.city },
      ...location.areasServed.map((a) => ({ "@type": "Place", name: a })),
    ],
    openingHoursSpecification: location.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    makesOffer: location.services.map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: s },
    })),
    parentOrganization: { "@id": ORGANIZATION_ID },
  }
}

/** Standalone (with @context) AutoDealer document for one location. */
export function generateDealerSchema(location: Location) {
  return { "@context": "https://schema.org", ...generateDealerNode(location) }
}

function organizationNode() {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    alternateName: "AM Group Used Cars Jammu",
    url: SITE_URL,
    logo: LOGO,
    image: LOGO,
    description:
      `Used car dealer in Jammu. Buy inspected second hand cars or sell your car at ` +
      `${LOCATIONS.length} Jammu locations: ${locationNames()}.`,
    address: postalAddress(PRIMARY_LOCATION),
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: PRIMARY_LOCATION.phoneE164,
        contactType: "sales",
        areaServed: "IN",
        availableLanguage: ["en", "hi"],
      },
      // Rendered only once the company supplies the number (lib/locations.ts).
      ...(H_PROMISE
        ? [{
            "@type": "ContactPoint",
            name: "H Promise (Hyundai certified used cars)",
            telephone: H_PROMISE.phoneE164,
            contactType: "sales",
            areaServed: "IN",
          }]
        : []),
    ],
    subOrganization: LOCATIONS.map((l) => ({ "@id": locationId(l) })),
    // TODO: add "sameAs" with the real social profile URLs once confirmed.
  }
}

function webSiteNode() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: `${SITE_NAME} Used Cars`,
    inLanguage: "en-IN",
    publisher: { "@id": ORGANIZATION_ID },
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
 * The site-wide graph, rendered once in the root layout: the Organization, the
 * WebSite (with its search action) and one AutoDealer per used-car location.
 * Location pages therefore do not emit their own copy — the same @id twice on
 * a page is noise.
 */
export function generateSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationNode(), webSiteNode(), ...LOCATIONS.map(generateDealerNode)],
  }
}

export function generateOrganizationSchema() {
  return { "@context": "https://schema.org", ...organizationNode() }
}

/** Back-compat name for the site-wide schema. */
export function generateLocalBusinessSchema() {
  return generateSiteSchema()
}

/**
 * CollectionPage + ItemList for a page that lists cars (landing and brand
 * pages). Only cars actually rendered on the page are listed.
 */
export function generateVehicleListSchema({
  name,
  description,
  path,
  vehicles,
}: {
  name: string
  description: string
  /** Site path of the page, e.g. "/used-cars/suv-in-jammu". */
  path: string
  vehicles: InventoryVehicle[]
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: `${SITE_URL}${path}`,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: vehicles.length,
      itemListElement: vehicles.map((v, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/inventory/${v.slug}`,
        name: `${v.year ?? ""} ${v.title}`.trim(),
      })),
    },
  }
}

export function generateVehicleSchema(vehicle: VehicleSEO) {
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: vehicle.name,
    description: vehicle.description,
    brand: {
      "@type": "Brand",
      name: vehicle.brand,
    },
    model: vehicle.model,
    vehicleEngine: {
      "@type": "EngineSpecification",
      name: vehicle.engine,
    },
    fuelType: vehicle.fuelType,
    image: vehicle.image,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: vehicle.priceValue,
      itemCondition: "https://schema.org/UsedCondition",
      availability: "https://schema.org/InStock",
      seller: { "@id": locationId(PRIMARY_LOCATION) },
    },
  }
}
