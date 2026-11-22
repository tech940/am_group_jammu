import { searchImageUrl } from "@/lib/seo/site"
import { MetadataRoute } from "next"
import { getInventory } from "@/lib/inventory/server"
import { getAllLandingSlugs, resolveLanding } from "@/lib/seo/landing"
import { LOCATIONS } from "@/lib/locations"
import { slugify } from "@/lib/inventory/adapter"
import { CONTENT_REVISED, SITE_URL } from "@/lib/seo/site"
import { newestStockDate } from "@/lib/seo-schemas"
import type { InventoryVehicle } from "@/lib/inventory/types"

/**
 * Only live, indexable URLs belong here: home, the inventory, the two index
 * pages (/used-cars, /brands), sell-your-car, the locations hub and its three
 * location pages, contact, every vehicle, brand and landing page with stock
 * behind it, and the two legal pages.
 *
 * Filtered /inventory views are deliberately excluded: they are noindex, so
 * listing them would just ask Google to crawl pages it has been told not to
 * index. The keyword-matched /used-cars/* landing pages carry that intent
 * instead.
 *
 * DATES. Every lastModified here is a date something actually changed:
 *   a car page          when its row was last edited (price, photos), else
 *                       when it was listed
 *   a page listing cars the newest of those dates among the cars it lists
 *   a hand-written page CONTENT_REVISED in lib/seo/site.ts
 *   the legal pages     no date. They are edited by hand elsewhere and a
 *                       wrong date is worse than none.
 * Nothing uses "now". A date that moves on every fetch teaches a crawler to
 * stop trusting the field.
 *
 * PHOTOS. Each car entry lists its photographs (the `images` field, which
 * Next writes as <image:image>), so image search can tie a photo to its car.
 */

/** A lastModified value, or nothing at all when no real date is known. */
function dated(vehicles: InventoryVehicle[]): { lastModified?: Date } {
  const iso = newestStockDate(vehicles)
  return iso ? { lastModified: new Date(iso) } : {}
}

/** Google reads at most 1,000 images per URL; a car has a few dozen at most. */
// Eight per car: enough for Google Images, and each address here is a new
// image for the optimiser to produce (was 50, all on the storage host).
const MAX_IMAGES_PER_CAR = 8

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL
  const [{ vehicles, facets }, landingSlugs] = await Promise.all([
    getInventory(),
    getAllLandingSlugs(),
  ])
  const hasStock = vehicles.length > 0
  const revised = new Date(CONTENT_REVISED)
  const stockDate = dated(vehicles)

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, ...stockDate, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/inventory`, ...stockDate, changeFrequency: "daily", priority: 0.9 },
    // The two index pages list every landing and brand page, so they change
    // when the stock does. Without stock they have nothing to index.
    ...(hasStock
      ? [
          { url: `${baseUrl}/used-cars`, ...stockDate, changeFrequency: "daily" as const, priority: 0.8 },
          { url: `${baseUrl}/brands`, ...stockDate, changeFrequency: "weekly" as const, priority: 0.7 },
        ]
      : []),
    { url: `${baseUrl}/sell-your-car`, lastModified: revised, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: revised, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/locations`, lastModified: revised, changeFrequency: "monthly", priority: 0.8 },
    ...LOCATIONS.map((l) => ({
      url: `${baseUrl}/locations/${l.slug}`,
      lastModified: revised,
      changeFrequency: "monthly" as const,
      // Location pages are the site-side half of "near me" — they corroborate
      // the Google Business Profile, so they matter more than a brochure page.
      priority: l.isPrimary ? 0.9 : 0.8,
    })),
    // Low priority, but they must be listed and crawlable: Google Ads and Meta
    // lead-form review both check for a reachable privacy policy.
    { url: `${baseUrl}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/privacy-policy`, changeFrequency: "yearly", priority: 0.2 },
  ]

  // One entry per live listing, with its photographs.
  const vehicleUrls: MetadataRoute.Sitemap = vehicles.map((v) => ({
    url: `${baseUrl}/inventory/${v.slug}`,
    ...dated([v]),
    changeFrequency: "weekly",
    priority: 0.8,
    ...(v.images.length > 0
      ? {
          // Through the site's own image route (see searchImageUrl). Next
          // writes <image:loc> without escaping, so "&" is escaped here.
          images: v.images.slice(0, MAX_IMAGES_PER_CAR).map((src) => searchImageUrl(src).replace(/&/g, "&amp;")),
        }
      : {}),
  }))

  // Brand pages only for makes we actually stock — a brand page with no stock
  // is a thin page and should not be advertised.
  const brandUrls: MetadataRoute.Sitemap = facets.makes.map((m) => ({
    url: `${baseUrl}/brands/${slugify(m.value)}`,
    ...dated(vehicles.filter((v) => v.make === m.value)),
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  // Budget / model / body / fuel / transmission landing pages plus the Jammu
  // city page: whatever the landing catalogue says is indexable today, so a
  // new kind of landing page appears here without this file changing. With no
  // stock at all the city page is noindex, so nothing is listed.
  const landings = hasStock
    ? await Promise.all(
        landingSlugs.map(async ({ slug, kind }) => ({ slug, kind, landing: await resolveLanding(slug) })),
      )
    : []
  const landingUrls: MetadataRoute.Sitemap = landings
    .filter((l) => l.landing !== null)
    .map(({ slug, kind, landing }) => ({
      url: `${baseUrl}/used-cars/${slug}`,
      ...dated(landing?.vehicles ?? []),
      changeFrequency: "daily" as const,
      // Budget and model pages carry the highest commercial intent.
      priority: kind === "budget" || kind === "model" ? 0.85 : 0.7,
    }))

  return [...staticPages, ...vehicleUrls, ...brandUrls, ...landingUrls]
}
