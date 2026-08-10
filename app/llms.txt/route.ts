import { getInventory } from "@/lib/inventory/server"
import { getAllLandingSlugs } from "@/lib/seo/landing"
import { LOCATIONS, formatAddress, formatHours, PRIMARY_LOCATION } from "@/lib/locations"
import { formatINR } from "@/lib/inventory/adapter"

/**
 * /llms.txt — https://llmstxt.org
 *
 * The spec is an H1, an optional blockquote summary, then H2 sections whose
 * bodies are MARKDOWN LINK LISTS. The previous static file in public/ had the
 * H1 and prose but zero links, which is the one thing the format exists to
 * provide — an LLM had nothing to follow.
 *
 * Generated rather than static so the stock counts, prices and vehicle URLs
 * stay true as inventory turns over, exactly like sitemap.xml. A hand-written
 * file would be wrong within a week.
 */

const SITE = "https://amgroupind.com"

export const dynamic = "force-static"
export const revalidate = 1800

export async function GET() {
  const [{ vehicles, facets, total }, landings] = await Promise.all([
    getInventory(),
    getAllLandingSlugs(),
  ])

  const line = (name: string, path: string, desc: string) =>
    `- [${name}](${SITE}${path}): ${desc}`

  const priceRange =
    vehicles.length > 0
      ? `${formatINR(facets.priceRange.min)}–${formatINR(facets.priceRange.max)}`
      : "varies"

  const makes = facets.makes.map((m) => `${m.label} (${m.count})`).join(", ")

  const budgetLinks = landings
    .filter((l) => l.kind === "budget")
    .map((l) => {
      const lakhs = l.slug.match(/^under-([\d.]+)-lakh/)?.[1] ?? ""
      return line(`Used cars under ₹${lakhs} lakh in Jammu`, `/used-cars/${l.slug}`, `Certified pre-owned cars priced under ₹${lakhs} lakh.`)
    })

  const modelLinks = landings
    .filter((l) => l.kind === "model")
    .map((l) => line(l.slug.replace(/-in-jammu$/, "").replace(/-/g, " "), `/used-cars/${l.slug}`, "Model-specific stock, prices and specifications."))

  const bodyLinks = landings
    .filter((l) => l.kind === "body" || l.kind === "fuel" || l.kind === "transmission")
    .map((l) => line(l.slug.replace(/-in-jammu$/, "").replace(/-/g, " "), `/used-cars/${l.slug}`, "Filtered stock for this category."))

  const brandLinks = facets.makes.map((m) =>
    line(
      `Used ${m.label} cars in Jammu`,
      `/brands/${m.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`,
      `${m.count} ${m.count === 1 ? "car" : "cars"} in stock.`,
    ),
  )

  const locationLinks = LOCATIONS.map((l) =>
    line(`${l.city} showroom`, `/locations/${l.slug}`, `${formatAddress(l)}. Open ${formatHours(l)}.`),
  )

  // Cap the individual listings: llms.txt is a map, not a dump. The full set
  // is always available via sitemap.xml, which is linked below.
  const vehicleLinks = vehicles
    .slice(0, 25)
    .map((v) =>
      line(
        `${v.year ?? ""} ${v.title}`.trim(),
        `/inventory/${v.slug}`,
        [
          v.priceLabel,
          v.mileage !== null ? v.mileageLabel : null,
          v.fuel,
          v.transmission,
          v.condition,
        ]
          .filter(Boolean)
          .join(", ") + ".",
      ),
    )

  const body = `# AM Group Jammu

> Certified pre-owned car dealership in Jammu & Kashmir, trading since 1968. ${total} used cars currently in stock, priced ${priceRange}. Showrooms in Jammu and Srinagar.

AM Group sells certified pre-owned cars and operates service workshops, fuel stations and real estate across Jammu, Srinagar, Udhampur and Kathua. Every listing on this site is a real vehicle physically in stock: the photographs are of that specific car and the odometer reading is the figure recorded at intake. Prices shown are the actual asking price.

Current stock covers ${makes || "a range of brands"}. Inventory changes as cars are sold, so counts and prices on these pages are generated from live data rather than hand-maintained.

## Browse used cars
${line("All used cars in Jammu", "/inventory", `Full inventory, ${total} cars, 9 per page with filters for make, model, budget, body type, fuel, transmission, year and kilometres.`)}
${budgetLinks.join("\n")}

## By brand
${brandLinks.join("\n")}

## By model
${modelLinks.join("\n")}

## By category
${bodyLinks.join("\n")}

## Individual listings${vehicles.length > 25 ? ` (first 25 of ${vehicles.length})` : ""}
${vehicleLinks.join("\n")}

## Locations and contact
${locationLinks.join("\n")}
${line("All showrooms", "/locations", "Addresses, opening hours, service areas and directions for both branches.")}
${line("Contact AM Group", "/contact", `Enquiry form, phone and WhatsApp. Phone: ${PRIMARY_LOCATION.phone}. Email: ${PRIMARY_LOCATION.email}.`)}

## About
${line("About AM Group", "/about", "Company history from 1968, milestones and group divisions.")}
${line("Automobile division", "/automobile", "New car dealerships, certified pre-owned outlets and service workshops.")}
${line("News and updates", "/blog", "Announcements, launches and awards.")}

## Optional
${line("Sitemap", "/sitemap.xml", "Every indexable URL on the site.")}
${line("Energy division", "/hp-indian-oil", "HP and Indian Oil fuel stations across J&K.")}
${line("Real estate division", "/real-estate", "Commercial and residential projects.")}
${line("S Mega Mart", "/s-mega-mart", "Retail division.")}
`

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=1800, stale-while-revalidate=3600",
    },
  })
}
