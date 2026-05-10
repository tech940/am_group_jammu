import { VehicleSEO } from "@/types/seo"

export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "name": "AM Group",
    "image": "https://amgroup.in/logo.png",
    "@id": "https://amgroup.in",
    "url": "https://amgroup.in",
    "telephone": "+91-191-2480000",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "NH-44, Bye Pass Road",
      "addressLocality": "Jammu",
      "addressRegion": "JK",
      "postalCode": "180015",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 32.7266,
      "longitude": 74.857
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "09:30",
      "closes": "18:30"
    },
    "sameAs": [
      "https://www.facebook.com/amgroupjammu",
      "https://www.instagram.com/amgroupjammu",
      "https://twitter.com/amgroupjammu"
    ]
  }
}

export function generateVehicleSchema(vehicle: VehicleSEO) {
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    "name": vehicle.name,
    "description": vehicle.description,
    "brand": {
      "@type": "Brand",
      "name": vehicle.brand
    },
    "model": vehicle.model,
    "vehicleEngine": {
      "@type": "EngineSpecification",
      "name": vehicle.engine
    },
    "fuelType": vehicle.fuelType,
    "image": vehicle.image,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": vehicle.priceValue,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock"
    }
  }
}
