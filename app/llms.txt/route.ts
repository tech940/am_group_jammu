import { getInventory } from "@/lib/inventory/server"
import { getAllLandingSlugs } from "@/lib/seo/landing"
import { H_PROMISE, LOCATIONS, formatHours, PRIMARY_LOCATION } from "@/lib/locations"
import { formatINR, slugify } from "@/lib/inventory/adapter"
import { SITE_URL } from "@/lib/seo/site"
import { locationAddressLine, locationHeading, locationNames } from "@/lib/seo/locations"

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

const SITE = SITE_URL

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
      return line(`Used cars under ₹${lakhs} lakh in Jammu`, `/used-cars/${l.slug}`, `Used cars in stock priced under ₹${lakhs} lakh.`)
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
      `/brands/${slugify(m.value)}`,
      `${m.count} ${m.count === 1 ? "car" : "cars"} in stock.`,
    ),
  )

  const locationLinks = LOCATIONS.map((l) =>
    line(
      locationHeading(l),
      `/locations/${l.slug}`,
      `${locationAddressLine(l)}.${l.addressConfirmed ? "" : " Exact address on request — call for directions."} Open ${formatHours(l)}. Phone ${l.phone}.`,
    ),
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

  const hPromise = H_PROMISE
    ? ` H Promise (Hyundai certified used cars) line: ${H_PROMISE.phone}.`
    : ""

  const body = `# AM Group Used Cars, Jammu

> Used car dealer in Jammu, India. ${total} used cars currently in stock, priced ${priceRange}. ${LOCATIONS.length} used-car locations, all in Jammu: ${locationNames()}.

This website is for people buying or selling a used car in Jammu. Every listing is a car in stock: the photographs are of that specific car and the kilometres shown are the reading recorded when it came in. Prices shown are the asking price; registration transfer and insurance are quoted separately. AM Group also buys cars and takes them in exchange.

Current stock covers ${makes || "a range of makes"}. Stock changes as cars are sold, so the counts and prices on these pages are generated from live data. Each car is kept at one of the ${LOCATIONS.length} locations — phone ${PRIMARY_LOCATION.phone} to confirm where a car is before travelling.${hPromise}

## Browse used cars
${line("All used cars in Jammu", "/inventory", `Full inventory, ${total} cars, with filters for make, model, budget, body type, fuel, transmission, year and kilometres.`)}
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
${line("All locations", "/locations", `The ${LOCATIONS.length} used-car locations in Jammu, with opening hours and phone.`)}
${line("Contact AM Group", "/contact", `Enquiry form, phone and WhatsApp. Phone: ${PRIMARY_LOCATION.phone}. Email: ${PRIMARY_LOCATION.email}.`)}

## Selling a car
${line("Sell your car", "/sell-your-car", "Ask AM Group to value and buy your car, or take it in exchange, at any of the Jammu locations.")}

## Optional
${line("Sitemap", "/sitemap.xml", "Every indexable URL on the site.")}
`

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=1800, stale-while-revalidate=3600",
    },
  })
}
