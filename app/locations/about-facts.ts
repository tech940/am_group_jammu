import { LOCATIONS, PRIMARY_LOCATION, formatHours } from "@/lib/locations"
import { closedSundays, locationAddressLine, locationNames } from "@/lib/seo/locations"
import { DEALER_NAME } from "@/lib/seo/site"

/**
 * Who the dealer is, in sentences that are each backed by a file in this
 * repository. Printed on /locations, in /llms.txt and in /llms-full.txt.
 *
 * SOURCES
 *   Sites, address, phone, hours   lib/locations.ts
 *   Group history and franchises   components/home/content.ts (TIMELINE and
 *                                  FRANCHISES, which that file took from the
 *                                  company's own About page)
 *
 * WHAT 1968 MEANS. The group's first business, in 1968, was Hindustan
 * Petroleum fuel stations and kerosene distribution. Its first car franchise
 * came in 2004. The site used to say "a dealer since 1968", which reads as 58
 * years of selling cars; the sentence below says what the year is.
 *
 * NOT HERE, because no file states them: the registered legal name, who owns
 * or runs the business, a GST number, awards, the year the used-car business
 * or any of its sites opened, and any social or Google Business Profile link.
 * Add each only when the company supplies it.
 */

const unconfirmed = LOCATIONS.filter((l) => !l.addressConfirmed)

/**
 * What 1968 is, in one wording for the whole site. The homepage, /inventory,
 * /locations and both llms files all print this text and nothing else about
 * the year. It used to be worded three ways ("in business in Jammu & Kashmir
 * since 1968", "in business in Jammu since 1968" and this one), and only this
 * one says the business then was fuel, not cars.
 */
export const GROUP_ORIGIN =
  "AM Group began in Jammu in 1968 with Hindustan Petroleum fuel stations and kerosene distribution. " +
  "That is the year the group started, in fuel, not the year it began selling cars."

export const ABOUT_HEADING = `About ${DEALER_NAME}`

export const ABOUT_PARAGRAPHS: string[] = [
  `${DEALER_NAME} is AM Group's used-car business in Jammu, Jammu and Kashmir. It sells second hand cars, ` +
    `and buys cars or takes them in exchange, at ${LOCATIONS.length} sites in Jammu city: ${locationNames()}.`,

  `The street address on record is ${locationAddressLine(PRIMARY_LOCATION)}.` +
    (unconfirmed.length > 0
      ? ` For ${unconfirmed.map((l) => l.shortName).join(" and ")}, call for exact directions.`
      : "") +
    ` All ${LOCATIONS.length} sites use one phone number, ${PRIMARY_LOCATION.phone}, and are open ` +
    `${formatHours(PRIMARY_LOCATION)}${closedSundays(PRIMARY_LOCATION) ? ", closed on Sundays" : ""}.`,

  `${GROUP_ORIGIN} Its first passenger-car ` +
    "franchise was Chevrolet in 2004, held until 2017. Hyundai followed in 2008, Tata Motors in 2017, and Kia " +
    "and MG in 2024. The group also holds two-wheeler franchises: Honda since 2010, KTM since 2012 and Bajaj " +
    "since 2024.",

  "This website covers the used-car business only: the cars in stock, the sites where you can see them, " +
    "and selling or exchanging your own car.",
]
