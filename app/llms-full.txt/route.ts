import { getInventory } from "@/lib/inventory/server"
import { LOCATIONS, PRIMARY_LOCATION, formatHours } from "@/lib/locations"
import { closedSundays, locationAddressLine } from "@/lib/seo/locations"
import { DEALER_NAME, SITE_URL } from "@/lib/seo/site"
import type { FacetValue, InventoryVehicle } from "@/lib/inventory/types"
import { ABOUT_PARAGRAPHS } from "@/app/locations/about-facts"
import { SELL_FAQS, SELL_STEPS } from "@/app/sell-your-car/content"
import { MARKDOWN_HEADERS, dealerSummary, stockCheckedAt } from "../llms.txt/shared"

/**
 * /llms-full.txt: the whole stock and the dealer's facts in one fetch.
 *
 * /llms.txt is a map of links. An assistant asked "does anyone in Jammu have a
 * diesel automatic under ten lakh" should not have to open thirty pages to
 * answer, so this file puts every car in one markdown table, followed by the
 * sites, the hours, the phone number and how buying and selling work.
 *
 * Nothing here is written for this file alone. The cars are the same snapshot
 * the pages render; the sites come from lib/locations.ts; the selling steps
 * and answers are the sell page's own; the buying notes repeat what the
 * listing and location pages already say. Claims the company has not yet
 * confirmed (which banks finance, what "certified" covers, reply times) are
 * left out here even where an older page still makes them.
 *
 * Cached like /llms.txt: rebuilt at most every 30 minutes.
 */

export const dynamic = "force-static"
export const revalidate = 1800

/** A table cell: no pipes or line breaks, and a dash for a value not on record. */
function cell(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—"
  return String(value).replace(/\|/g, "\\|").replace(/\s+/g, " ").trim()
}

function stockTable(vehicles: InventoryVehicle[]): string {
  const head =
    "| Year | Make | Model | Kilometres | Fuel | Transmission | Asking price | Page |\n" +
    "| --- | --- | --- | --- | --- | --- | --- | --- |"
  const rows = vehicles.map((v) =>
    [
      cell(v.year),
      cell(v.make),
      cell(v.model ?? v.title),
      cell(v.mileage !== null ? v.mileageLabel : null),
      cell(v.fuel),
      cell(v.transmission),
      cell(v.price !== null ? v.priceLabel : "Ask the dealer"),
      `${SITE_URL}/inventory/${v.slug}`,
    ].join(" | "),
  )
  return [head, ...rows.map((r) => `| ${r} |`)].join("\n")
}

/** "Kia 11, Hyundai 6" from a facet list. */
const tally = (values: FacetValue[]) => values.map((f) => `${f.label} ${f.count}`).join(", ")

function stockSummary(vehicles: InventoryVehicle[], makes: FacetValue[], fuels: FacetValue[], gearboxes: FacetValue[]): string[] {
  const priced = vehicles.filter((v) => v.price !== null).sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
  const years = vehicles.map((v) => v.year).filter((y): y is number => y !== null)
  const name = (v: InventoryVehicle) => `${v.year ?? ""} ${v.title}`.trim()
  const lines: string[] = []
  if (makes.length) lines.push(`- By make: ${tally(makes)}.`)
  if (fuels.length) lines.push(`- By fuel: ${tally(fuels)}.`)
  if (gearboxes.length) lines.push(`- By transmission: ${tally(gearboxes)}.`)
  if (priced.length) {
    const lo = priced[0]
    const hi = priced[priced.length - 1]
    lines.push(`- Lowest asking price: ${lo.priceLabel} (${name(lo)}, ${SITE_URL}/inventory/${lo.slug}).`)
    lines.push(`- Highest asking price: ${hi.priceLabel} (${name(hi)}, ${SITE_URL}/inventory/${hi.slug}).`)
  }
  if (years.length) lines.push(`- Model years: ${Math.min(...years)} to ${Math.max(...years)}.`)
  return lines
}

export async function GET() {
  const snapshot = await getInventory()
  const { vehicles, facets, total } = snapshot
  const checked = stockCheckedAt(snapshot.fetchedAt)

  const stock = snapshot.degraded
    ? `The stock list could not be read when this file was made. Nothing has been removed from sale; ` +
      `call ${PRIMARY_LOCATION.phone} or try again shortly.`
    : total === 0
      ? "No cars are listed at the moment."
      : `${stockTable(vehicles)}\n\nA dash means the value is not recorded for that car, not that it is zero.`

  const sites = LOCATIONS.map((l) =>
    [
      `### ${l.name}`,
      l.addressConfirmed
        ? `- Address: ${locationAddressLine(l)}`
        : `- Where: ${locationAddressLine(l)}. The street address is not published; call for exact directions.`,
      `- Hours: ${formatHours(l)}${closedSundays(l) ? " (closed Sundays)" : ""}`,
      `- Phone: ${l.phone}`,
      `- Page: ${SITE_URL}/locations/${l.slug}`,
    ].join("\n"),
  ).join("\n\n")

  const body = `# ${DEALER_NAME}: full stock list and dealer facts

> ${dealerSummary(snapshot)}

## Stock as of ${checked}

${stock}

## Stock summary

${snapshot.degraded || total === 0 ? "Not available." : stockSummary(vehicles, facets.makes, facets.fuels, facets.transmissions).join("\n")}

## Sites

${sites}

Each car is kept at one of the ${LOCATIONS.length} sites. Phone ${PRIMARY_LOCATION.phone} to confirm where a car is before travelling.

## About ${DEALER_NAME}

${ABOUT_PARAGRAPHS.join("\n\n")}

## Buying a car

- Every listing is a car in stock. The photographs are of that specific car, and the kilometres shown are the odometer reading entered for that car.
- The price shown is the asking price. Registration (RC) transfer and insurance are quoted separately.
- To ask about a car, use the enquiry button on its page, call ${PRIMARY_LOCATION.phone}, or send a WhatsApp message.
- For a test drive, bring a valid driving licence. Call first so the car is at the site you are coming to.
- If you are exchanging your present car, bring its registration certificate, insurance and service records.

## Selling or exchanging a car

${SELL_STEPS.map((s, i) => `${i + 1}. **${s.title}.** ${s.body}`).join("\n")}

${SELL_FAQS.map((f) => `**${f.question}**\n${f.answer}`).join("\n\n")}

Sell page: ${SITE_URL}/sell-your-car

## Data

- This file: ${SITE_URL}/llms-full.txt (markdown, rebuilt from the stock list about every 30 minutes).
- The same cars as JSON: ${SITE_URL}/api/vehicles. It takes make, model, bodyType, fuel, transmission, budget (in lakh), priceMin, priceMax, year, kmsMax, q and sort, plus limit (at most 100) and offset. One car: ${SITE_URL}/api/vehicles/<id>.
- Site map: ${SITE_URL}/sitemap.xml. Link map: ${SITE_URL}/llms.txt.
`

  return new Response(body, { headers: MARKDOWN_HEADERS })
}
