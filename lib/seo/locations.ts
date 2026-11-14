/**
 * How a used-car location is described in titles, headings and address blocks.
 *
 * Two of the three sites have only a locality on record (`addressConfirmed` is
 * false in lib/locations.ts). Everything that prints an address goes through
 * here so an unconfirmed site can never be shown with a street, a PIN, a map
 * pin or a landmark that belongs to another site.
 */

import { LOCATIONS, PRIMARY_LOCATION, type Location } from '../locations.ts'

/**
 * The place name a buyer would search for.
 *
 * Confirmed site   → its own name:   "AM Business Park"
 * Unconfirmed site → the locality:   "Nanak Nagar", "Gangyal"
 *
 * For an unconfirmed site `landmark` holds "<locality>, <city>" — that is all
 * the company has supplied — so the locality is its first part.
 */
export function locationPlace(location: Location): string {
  if (location.addressConfirmed) return location.shortName
  return location.landmark.split(',')[0].trim() || location.shortName
}

/** "Used Cars in Nanak Nagar, Jammu" / "Used Cars at AM Business Park, Jammu". */
export function locationHeading(location: Location): string {
  const place = locationPlace(location)
  return `Used Cars ${location.addressConfirmed ? 'at' : 'in'} ${place}, ${location.city}`
}

/**
 * Address lines safe to print.
 *
 * Confirmed: street, then city / region / PIN, then the landmark.
 * Unconfirmed: the site name and locality only. No street, PIN or landmark.
 */
export function locationAddressLines(location: Location): string[] {
  if (!location.addressConfirmed) {
    const lines = [location.shortName]
    const locality = `${locationPlace(location)}, ${location.city}`
    if (!location.shortName.includes(locationPlace(location))) lines.push(locality)
    else lines[0] = `${location.shortName}, ${location.city}`
    return lines
  }
  return [
    location.streetAddress,
    [location.city, location.region, location.postalCode].filter(Boolean).join(', '),
    location.landmark,
  ].filter(Boolean)
}

/** One line, for meta descriptions, llms.txt and FAQ answers. */
export function locationAddressLine(location: Location): string {
  return locationAddressLines(location).join(', ')
}

/**
 * "AM Business Park, Nanak Nagar and AM Auto Square, Gangyal", joined for prose.
 *
 * Each site by its own short name, the same form the page headings, footer and
 * structured data use. (The Gangyal site used to appear here as plain
 * "Gangyal" and everywhere else as "AM Auto Square, Gangyal".)
 */
export function locationNames(): string {
  const names = LOCATIONS.map((l) => l.shortName)
  if (names.length <= 1) return names[0] ?? PRIMARY_LOCATION.shortName
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

/**
 * A service name as it may be shown and marked up.
 *
 * lib/locations.ts lists "Certified pre-owned car sales". Nothing on record
 * says who certifies the cars or what the check covers, so until the company
 * answers that the service is described as what it certainly is: used car
 * sales. Everything else passes through unchanged.
 */
export function serviceLabel(service: string): string {
  return /certified/i.test(service) ? 'Used car sales' : service
}

/**
 * The address as one search string, for a map embed or a directions link.
 * Null for a site whose address is not confirmed: a map of a guessed place is
 * worse than no map.
 */
export function locationMapQuery(location: Location): string | null {
  if (!location.addressConfirmed) return null
  return [location.streetAddress, location.city, location.postalCode].filter(Boolean).join(', ')
}

/** True when the published hours include no Sunday. */
export function closedSundays(location: Location): boolean {
  return !location.hours.some((h) => h.days.includes('Sunday'))
}
