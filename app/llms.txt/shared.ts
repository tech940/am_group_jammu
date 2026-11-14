import { LOCATIONS, PRIMARY_LOCATION, formatHours, whatsappUrl } from "@/lib/locations"
import { closedSundays, locationAddressLine } from "@/lib/seo/locations"
import { formatINR } from "@/lib/inventory/adapter"
import type { InventorySnapshot } from "@/lib/inventory/types"
import { DEALER_NAME, SITE_URL } from "@/lib/seo/site"

/**
 * The parts /llms.txt and /llms-full.txt both print, so the two files cannot
 * disagree about the dealer, the date or the number of cars.
 */

/** "15 November 2026, 1:10 am IST": the stock snapshot's time, in Indian time. */
export function stockCheckedAt(fetchedAt: string): string {
  const d = new Date(fetchedAt)
  if (Number.isNaN(d.getTime())) return "date not available"
  const text = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d)
  return `${text} IST`
}

/** "₹3,80,000 to ₹19,80,000", one figure when all cars cost the same, or "". */
export function priceRangeText(snapshot: InventorySnapshot): string {
  const prices = snapshot.vehicles.map((v) => v.price).filter((n): n is number => n !== null)
  if (prices.length === 0) return ""
  const lo = Math.min(...prices)
  const hi = Math.max(...prices)
  return lo === hi ? formatINR(lo) : `${formatINR(lo)} to ${formatINR(hi)}`
}

/**
 * The opening summary: who, where, how many cars, when counted, hours, phone.
 * One paragraph a reader can lift whole. An unconfirmed site is named with
 * "call for exact directions", never with a street.
 */
export function dealerSummary(snapshot: InventorySnapshot): string {
  const range = priceRangeText(snapshot)
  const stock = snapshot.degraded
    ? "The stock list could not be read when this file was made, so no count is given."
    : `${snapshot.total} used ${snapshot.total === 1 ? "car" : "cars"} in stock as of ${stockCheckedAt(snapshot.fetchedAt)}` +
      `${range ? `, priced ${range}` : ""}.`

  const sites = LOCATIONS.map((l) =>
    l.addressConfirmed
      ? `${l.shortName} (${locationAddressLine(l)})`
      : `${l.shortName} (call for exact directions)`,
  ).join("; ")

  return (
    `${DEALER_NAME} is a used-car dealer in Jammu, Jammu and Kashmir, India. ${stock} ` +
    `${LOCATIONS.length} sites, all in Jammu city: ${sites}. ` +
    `Open ${formatHours(PRIMARY_LOCATION)}${closedSundays(PRIMARY_LOCATION) ? ", closed Sundays" : ""}. ` +
    `Phone ${PRIMARY_LOCATION.phone}. WhatsApp: ${whatsappUrl("Hi AM Group, I have a question about a used car.")} ` +
    `Email ${PRIMARY_LOCATION.email}. It buys cars and takes them in exchange as well as selling them.`
  )
}

/** A markdown link line: "- [name](absolute url): description". */
export function linkLine(name: string, path: string, desc: string): string {
  return `- [${name}](${SITE_URL}${path}): ${desc}`
}

/** Headers for both files: markdown, cached at the CDN for half an hour. */
export const MARKDOWN_HEADERS = {
  "Content-Type": "text/markdown; charset=utf-8",
  // Browsers always re-ask; the CDN keeps a copy for 30 minutes and may serve
  // it for another hour while it fetches a fresh one. A sold car can therefore
  // linger here for a short while, which is why each file prints its date.
  "Cache-Control": "public, max-age=0, s-maxage=1800, stale-while-revalidate=3600",
}
