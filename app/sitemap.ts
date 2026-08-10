import { MetadataRoute } from "next"
import { getInventory } from "@/lib/inventory/server"
import { getAllLandingSlugs } from "@/lib/seo/landing"
import { LOCATIONS } from "@/lib/locations"

/**
 * Only indexable URLs belong here.
 *
 * Filtered /inventory views are deliberately excluded: they are noindex, so
 * listing them would just ask Google to crawl pages it has been told not to
 * index. The keyword-matched /used-cars/* landing pages carry that intent
 * instead.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://amgroupind.com"
  const [{ vehicles, facets }, landings] = await Promise.all([
    getInventory(),
    getAllLandingSlugs(),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/inventory`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/locations`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    ...LOCATIONS.map((l) => ({
      url: `${baseUrl}/locations/${l.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      // Location pages are the site-side half of "near me" — they corroborate
      // the Google Business Profile, so they matter more than a brochure page.
      priority: l.isPrimary ? 0.9 : 0.8,
    })),
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/automobile`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/real-estate`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/s-mega-mart`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/hp-indian-oil`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    // Low priority, but they must be listed and crawlable: Google Ads and Meta
    // lead-form review both check for a reachable privacy policy.
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ]

  // One entry per live listing, using its real last-modified date.
  const vehicleUrls: MetadataRoute.Sitemap = vehicles.map((v) => ({
    url: `${baseUrl}/inventory/${v.slug}`,
    lastModified: v.postedAt ? new Date(v.postedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  // Brand pages only for makes we actually stock — a brand page with no stock
  // is a thin page and should not be advertised.
  const brandUrls: MetadataRoute.Sitemap = facets.makes.map((m) => ({
    url: `${baseUrl}/brands/${m.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  // Budget / model / body / fuel / transmission / city landing pages. Each one
  // is only generated when it has stock behind it.
  const landingUrls: MetadataRoute.Sitemap = landings.map(({ slug, kind }) => ({
    url: `${baseUrl}/used-cars/${slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    // Budget and model pages carry the highest commercial intent.
    priority: kind === "budget" || kind === "model" ? 0.85 : 0.7,
  }))

  return [...staticPages, ...vehicleUrls, ...brandUrls, ...landingUrls]
}
