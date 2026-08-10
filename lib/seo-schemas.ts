import { VehicleSEO } from "@/types/seo"
import { LOCATIONS, PRIMARY_LOCATION, type Location } from "@/lib/locations"

const SITE = "https://amgroupind.com"
const LOGO = "https://amgroupind.com/wp-content/uploads/2023/06/logo-1.png"

/** Stable @id per branch so the Organization can reference them. */
export function locationId(location: Location): string {
  return `${SITE}/locations/${location.slug}#dealer`
}

/**
 * Full AutoDealer entity for one branch.
 *
 * Emitted on that branch's own page — Google's guidance for a multi-location
 * business is one page per location, each carrying its own LocalBusiness
 * markup, rather than stacking every branch onto the homepage.
 *
 * Deliberately omits `aggregateRating`: inventing review counts is a
 * structured-data violation and a manual-action risk. Add it only when it is
 * driven by real, verifiable reviews.
 */
export function generateDealerSchema(location: Location) {
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": locationId(location),
    name: location.name,
    image: LOGO,
    logo: LOGO,
    url: `${SITE}/locations/${location.slug}`,
    telephone: location.phoneE164,
    email: location.email,
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    address: {
      "@type": "PostalAddress",
      streetAddress: location.streetAddress,
      addressLocality: location.city,
      addressRegion: location.region,
      postalCode: location.postalCode,
      addressCountry: "IN",
    },
    // Approximate until each Google Business Profile pin is confirmed.
    geo: {
      "@type": "GeoCoordinates",
      latitude: location.geo.latitude,
      longitude: location.geo.longitude,
    },
    hasMap: location.mapUrl,
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
    parentOrganization: { "@id": `${SITE}#organization` },
  }
}

/**
 * The group itself. Rendered site-wide, with each branch referenced by @id so
 * Google can connect the entity graph.
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE}#organization`,
    name: "AM Group",
    alternateName: "AM Group Jammu",
    url: SITE,
    logo: LOGO,
    image: LOGO,
    foundingDate: "1968",
    description:
      "AM Group is one of Jammu & Kashmir's longest-running automotive groups, trading since 1968. " +
      "Certified pre-owned car sales, service workshops and finance across Jammu and Srinagar.",
    address: {
      "@type": "PostalAddress",
      streetAddress: PRIMARY_LOCATION.streetAddress,
      addressLocality: PRIMARY_LOCATION.city,
      addressRegion: PRIMARY_LOCATION.region,
      postalCode: PRIMARY_LOCATION.postalCode,
      addressCountry: "IN",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: PRIMARY_LOCATION.phoneE164,
        contactType: "sales",
        areaServed: "IN",
        availableLanguage: ["en", "hi", "ur"],
      },
    ],
    subOrganization: LOCATIONS.map((l) => ({ "@id": locationId(l) })),
    // TODO: add "sameAs" with the group's real social profile URLs once confirmed.
  }
}

/**
 * Back-compat wrapper. The site-wide schema is now the Organization; the full
 * per-branch AutoDealer entities live on their own location pages.
 */
export function generateLocalBusinessSchema() {
  return generateOrganizationSchema()
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
