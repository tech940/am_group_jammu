import { MetadataRoute } from "next"
import { vehicles } from "@/lib/vehicle-data"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://amgroupind.com"

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/inventory`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/automobile`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/real-estate`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/s-mega-mart`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/hp-indian-oil`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ]

  // Every vehicle detail page — the primary landing pages for car-model searches
  const vehicleUrls: MetadataRoute.Sitemap = vehicles.map((vehicle) => ({
    url: `${baseUrl}/inventory/${vehicle.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  // Brand pages derived from actual inventory so the sitemap never advertises
  // a brand the site has no stock for
  const brandSlugs = [...new Set(vehicles.map((v) => v.brand.toLowerCase()))]
  const brandUrls: MetadataRoute.Sitemap = brandSlugs.map((brand) => ({
    url: `${baseUrl}/brands/${brand}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  const locations = ["jammu", "srinagar", "kathua", "udhampur"]
  const usedCarsUrls: MetadataRoute.Sitemap = locations.map((loc) => ({
    url: `${baseUrl}/used-cars/${loc}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.7,
  }))

  return [...staticPages, ...vehicleUrls, ...brandUrls, ...usedCarsUrls]
}
