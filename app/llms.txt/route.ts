import { getInventory } from "@/lib/inventory/server"
import { getLandingDirectory, type LandingEntry } from "@/lib/seo/landing"
import { H_PROMISE, LOCATIONS, formatHours, PRIMARY_LOCATION } from "@/lib/locations"
import { formatINR, slugify } from "@/lib/inventory/adapter"
import { DEALER_NAME } from "@/lib/seo/site"
import { locationAddressLine, locationHeading } from "@/lib/seo/locations"
import { ABOUT_PARAGRAPHS } from "@/app/locations/about-facts"
import { carHeading } from "@/app/inventory/[slug]/car-facts"
import { MARKDOWN_HEADERS, dealerSummary, linkLine as line, stockCheckedAt } from "./shared"

/**
 * /llms.txt — https://llmstxt.org
 *
 * The spec is an H1, an optional blockquote summary, then H2 sections whose
 * bodies are MARKDOWN LINK LISTS. This file is the map; /llms-full.txt is the
 * whole stock in one table, and /api/vehicles is the same stock as JSON.
 *
 * Generated rather than static so the stock counts, prices and vehicle URLs
 * stay true as inventory turns over, exactly like sitemap.xml. A hand-written
 * file would be wrong within a week. It prints the time the stock was read, so
 * a reader can tell how fresh the numbers are.
 */

export const dynamic = "force-static"
export const revalidate = 1800

/** "5 in stock, from ₹15,00,000." — what a landing page holds right now. */
function stockNote(entry: LandingEntry): string {
  const count = `${entry.count} in stock`
  return entry.priceFrom !== null ? `${count}, from ${formatINR(entry.priceFrom)}.` : `${count}.`
}

export async function GET() {
  const [snapshot, directory] = await Promise.all([getInventory(), getLandingDirectory()])
  const { vehicles, facets, total } = snapshot

  const makes = facets.makes.map((m) => `${m.label} (${m.count})`).join(", ")

  // Link text is the landing page's own label ("Used Hyundai Creta", "Under
  // ₹5 Lakh"), not its slug, and each line says what is behind it today.
  const landingLinks = (...kinds: LandingEntry["kind"][]) =>
    directory
      .filter((e) => kinds.includes(e.kind))
      .map((e) => line(`${e.label}${/jammu/i.test(e.label) ? "" : " in Jammu"}`, e.href, stockNote(e)))

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

  // Cap the individual listings: llms.txt is a map, not a dump. Every car is
  // in /llms-full.txt, which is linked above them.
  const vehicleLinks = vehicles
    .slice(0, 25)
    .map((v) =>
      line(
        // The car page's own heading, so five "2024 Kia Carens" links are not
        // five links with the same text.
        carHeading(v, vehicles),
        `/inventory/${v.slug}`,
        // Facts recorded for the car only. The stock's "condition" label is
        // left out: what it certifies has not been stated by the company.
        [v.priceLabel, v.mileage !== null ? v.mileageLabel : null, v.fuel, v.transmission]
          .filter(Boolean)
          .join(", ") + ".",
      ),
    )

  const hPromise = H_PROMISE
    ? ` H Promise (Hyundai certified used cars) line: ${H_PROMISE.phone}.`
    : ""

  const body = `# ${DEALER_NAME}

> ${dealerSummary(snapshot)}

This website is for people buying or selling a used car in Jammu. Every listing is a car in stock: the photographs are of that specific car and the kilometres shown are the odometer reading entered for that car. Prices shown are the asking price; registration transfer and insurance are quoted separately.

Current stock covers ${makes || "a range of makes"}. Stock changes as cars are sold, so the counts and prices in this file are generated from live data, last read on ${stockCheckedAt(snapshot.fetchedAt)}. Each car is kept at one of the ${LOCATIONS.length} sites — phone ${PRIMARY_LOCATION.phone} to confirm where a car is before travelling.${hPromise}

## About
${ABOUT_PARAGRAPHS[2]}

${ABOUT_PARAGRAPHS[3]}

## Stock data
${line("Full stock list (markdown)", "/llms-full.txt", `Every car in stock in one table (year, make, model, kilometres, fuel, transmission, asking price, page), plus the sites, hours, phone and how buying and selling work.`)}
${line("Stock as JSON", "/api/vehicles", "The same cars as JSON. Takes the filters the inventory page takes (make, model, bodyType, fuel, transmission, budget, year, q, sort) plus limit and offset.")}

## Browse used cars
${line("All used cars in Jammu", "/inventory", `Full inventory, ${total} cars, with filters for make, model, budget, body type, fuel, transmission, year and kilometres.`)}
${[...landingLinks("city"), ...landingLinks("budget")].join("\n")}

## By brand
${brandLinks.join("\n")}

## By model
${landingLinks("model").join("\n")}

## By category
${landingLinks("body", "fuel", "transmission").join("\n")}

## Individual listings${vehicles.length > 25 ? ` (first 25 of ${vehicles.length}; all are in /llms-full.txt)` : ""}
${vehicleLinks.join("\n")}

## Locations and contact
${locationLinks.join("\n")}
${line("All locations", "/locations", `The ${LOCATIONS.length} used-car sites in Jammu, with opening hours and phone, and who ${DEALER_NAME} is.`)}
${line(`Contact ${DEALER_NAME}`, "/contact", `Enquiry form, phone and WhatsApp. Phone: ${PRIMARY_LOCATION.phone}. Email: ${PRIMARY_LOCATION.email}.`)}

## Selling a car
${line("Sell your car", "/sell-your-car", "Ask AM Group to value and buy your car, or take it in exchange, at any of the Jammu sites.")}

## Optional
${line("Sitemap", "/sitemap.xml", "Every indexable URL on the site.")}
`

  return new Response(body, { headers: MARKDOWN_HEADERS })
}
