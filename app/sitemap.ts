import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://amgroup.in"
  
  // These would typically be fetched from your database
  const brands = ["hyundai", "kia", "ford", "mg", "mahindra"]
  const locations = ["jammu", "srinagar", "kathua", "udhampur"]
  
  const brandUrls = brands.map((brand) => ({
    url: `${baseUrl}/brands/${brand}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  const locationUrls = locations.map((loc) => ({
    url: `${baseUrl}/locations/${loc}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  const usedCarsUrls = locations.map((loc) => ({
    url: `${baseUrl}/used-cars/${loc}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/inventory`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/book-service`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...brandUrls,
    ...locationUrls,
    ...usedCarsUrls,
  ]
}
