import { VehicleSEO } from "@/types/seo"

export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "name": "AM Group Jammu",
    "image": "https://amgroupind.com/wp-content/uploads/2023/06/logo-1.png",
    "logo": "https://amgroupind.com/wp-content/uploads/2023/06/logo-1.png",
    "@id": "https://amgroupind.com",
    "url": "https://amgroupind.com",
    "telephone": "+91-94191-00000",
    "email": "info@amgroupind.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "AM Business Park, N-H 1 Bye-Pass Road, Opp. Railway Station",
      "addressLocality": "Jammu",
      "addressRegion": "Jammu and Kashmir",
      "postalCode": "180012",
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
    }
    // TODO: add "sameAs" with the group's real social profile URLs once confirmed
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
