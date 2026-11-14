/**
 * The words and the structured data of one car page, built from the car.
 *
 * Everything here is a pure function of the stock record: no fetching, no
 * `next/*`, no `@/` alias, so a script can run it against a made-up record
 * (a sold car, a car with owners and a site filled in) without the site
 * running. app/inventory/[slug]/page.tsx is the only caller.
 *
 * THE RULE FOR EVERY FUNCTION BELOW: a sentence, a table row or a schema
 * property exists only when the record holds the fact. A missing fact leaves
 * a gap, never a default. Nothing here states a warranty, an inspection, a
 * rating, a delivery promise or an opening hour.
 */

import type { InventoryVehicle } from '../../../lib/inventory/types.ts'
import type { Location } from '../../../lib/locations.ts'

const CITY = 'Jammu'

/** Search results cut a title at about this many characters. */
const TITLE_BUDGET = 60

/** Search results cut a description at about this many characters. */
const DESCRIPTION_BUDGET = 155

const has = (haystack: string, needle: string) => haystack.toLowerCase().includes(needle.toLowerCase())

/**
 * "2021 Hyundai Creta SX": the car's name as the heading, the last breadcrumb
 * and the structured data all give it, so the three can never disagree. Year
 * and variant are added only when the stored title does not already say them.
 */
export function carName(v: InventoryVehicle): string {
  const year = v.year !== null && !has(v.title, String(v.year)) ? `${v.year} ` : ''
  const variant = v.variant && !has(v.title, v.variant) ? ` ${v.variant}` : ''
  return `${year}${v.title}${variant}`
}

/**
 * What is added to the name when another car on sale has the same name, in
 * the order tried. Fuel and gearbox first because they are what a buyer
 * chooses between; then the kilometres; then the colour; the stock number
 * last, because it always differs but tells a buyer nothing.
 */
const HEADING_APART: ((v: InventoryVehicle, name: string) => string)[] = [
  () => '',
  (v, name) => specWords(v, name),
  (v, name) => [specWords(v, name), v.mileage !== null ? `, ${v.mileageLabel}` : ''].join(''),
  (v, name) =>
    [specWords(v, name), v.mileage !== null ? `, ${v.mileageLabel}` : '', v.colour ? `, ${v.colour}` : ''].join(''),
  (v, name) => `${specWords(v, name)}, stock no. ${v.id}`,
]

/** " Petrol Automatic": the fuel and gearbox, each only if the name lacks it. */
function specWords(v: InventoryVehicle, name: string): string {
  return [v.fuel, v.transmission]
    .filter((word): word is string => Boolean(word) && !has(name, word as string))
    .map((word) => ` ${word}`)
    .join('')
}

/**
 * The car's name as the page's heading, the last breadcrumb, the structured
 * data and the llms.txt link give it.
 *
 * Usually that is just carName(). But five cars in stock were all headed
 * "2024 Kia Carens": five different pages with one heading, one schema name
 * and one link text. When another car on sale has the same name, recorded
 * facts are added until the heading is this car's alone, for example
 * "2024 Kia Carens Petrol Automatic, 2,603 km".
 *
 * This is separate from the browser title's rule (carTitle): a title also
 * carries the price, so two cars can have different titles and still share a
 * name.
 *
 * Use it where the car is NAMED. Sentences about the car ("This 2024 Kia
 * Carens is a petrol automatic...") keep carName(), or the facts are said
 * twice.
 *
 * @param onSale every car on sale; this one may or may not be in it
 */
export function carHeading(v: InventoryVehicle, onSale: InventoryVehicle[]): string {
  const name = carName(v)
  const twins = onSale.filter((o) => o.id !== v.id && carName(o).toLowerCase() === name.toLowerCase())
  if (twins.length === 0) return name
  const label = (car: InventoryVehicle, level: number) =>
    `${carName(car)}${HEADING_APART[level](car, carName(car))}`.toLowerCase()
  const level = HEADING_APART.findIndex((_, i) => !twins.some((o) => label(o, i) === label(v, i)))
  return `${name}${HEADING_APART[level === -1 ? HEADING_APART.length - 1 : level](v, name)}`
}

/** The name with the fuel on the end, for the browser title: "… Creta SX Petrol". */
function nameWithFuel(v: InventoryVehicle): string {
  const name = carName(v)
  return v.fuel && !has(name, v.fuel) ? `${name} ${v.fuel}` : name
}

/**
 * What tells this car apart from another of the same year, model, fuel and
 * price, most useful first. Every one is a recorded fact about the car; the
 * stock number is the last resort because it is always different.
 */
const TELL_APART: ((v: InventoryVehicle) => string | null)[] = [
  () => null,
  (v) => (v.mileage !== null ? v.mileageLabel : null),
  (v) => v.colour || null,
  (v) => [v.mileage !== null ? v.mileageLabel : null, v.colour].filter(Boolean).join(', ') || null,
  (v) => `stock no. ${v.id}`,
]

function titleLabel(v: InventoryVehicle, level: number): string {
  const extra = TELL_APART[level](v)
  return `${nameWithFuel(v)}${extra ? `, ${extra}` : ''}`
}

/** Two cars would get the same title when this string matches. */
const titleKey = (v: InventoryVehicle, level: number) =>
  `${titleLabel(v, level)}|${v.price !== null ? v.priceShort : ''}`.toLowerCase()

/**
 * The browser title of a car on sale.
 *
 * It names the car, the place and the price, stays inside the length a search
 * result shows where it can, and is different for every car: when another car
 * on sale would read the same (two 2024 Kia Seltos petrols at ₹15.00 L), the
 * kilometres are added, then the colour.
 *
 * @param onSale every car on sale, this one included
 */
export function carTitle(v: InventoryVehicle, onSale: InventoryVehicle[]): string {
  const others = onSale.filter((o) => o.id !== v.id)
  const level = TELL_APART.findIndex((_, i) => !others.some((o) => titleKey(o, i) === titleKey(v, i)))
  const label = titleLabel(v, level === -1 ? TELL_APART.length - 1 : level)

  // Fullest first; the first that fits is used. The site name goes before
  // the word "Used" does, because "used" is what people type and the site
  // name is already in the address under the title. The price is never cut.
  const candidates =
    v.price !== null
      ? [
          `Used ${label} in ${CITY} — ${v.priceShort} | AM Group`,
          `Used ${label} in ${CITY} — ${v.priceShort}`,
          `${label} in ${CITY} — ${v.priceShort} | AM Group`,
          `${label} in ${CITY} — ${v.priceShort}`,
        ]
      : [
          `Used ${label} for sale in ${CITY} | AM Group`,
          `Used ${label} in ${CITY} | AM Group`,
          `Used ${label} in ${CITY}`,
          `${label} in ${CITY}`,
        ]
  return candidates.find((c) => c.length <= TITLE_BUDGET) ?? candidates[candidates.length - 1]
}

/** The browser title of a car that has been sold. */
export function soldCarTitle(v: InventoryVehicle): string {
  const candidates = [`${nameWithFuel(v)} (sold) | AM Group Used Cars, ${CITY}`, `${nameWithFuel(v)} (sold) | AM Group`]
  return candidates.find((c) => c.length <= TITLE_BUDGET) ?? candidates[candidates.length - 1]
}

/** "SUV" stays "SUV"; "Premium Hatchback" becomes "premium hatchback". */
function lowerUnlessInitials(phrase: string): string {
  return phrase
    .split(' ')
    .map((word) => (/^[A-Z0-9]+$/.test(word) ? word : word.toLowerCase()))
    .join(' ')
}

const article = (phrase: string) => (/^[aeiou]/i.test(phrase) ? 'an' : 'a')

/**
 * "This 2021 Hyundai Creta is a petrol automatic SUV in Phantom Black that has
 * done 26,675 km." Null when the record holds none of those facts, so the
 * page never prints "This car is a car."
 */
function whatItIs(v: InventoryVehicle, sold: boolean): string | null {
  if (!v.fuel && !v.transmission && !v.bodyType && !v.colour && v.mileage === null) return null
  const kind = [
    v.fuel ? v.fuel.toLowerCase() : null,
    v.transmission ? v.transmission.toLowerCase() : null,
    v.bodyType ? lowerUnlessInitials(v.bodyType) : 'car',
  ]
    .filter(Boolean)
    .join(' ')
  // On a sold car's page this follows "This … has been sold", so it says "It".
  return (
    `${sold ? 'It was' : `This ${carName(v)} is`} ${article(kind)} ${kind}` +
    `${v.colour ? ` in ${v.colour}` : ''}` +
    `${v.mileage !== null ? ` that ${sold ? 'had' : 'has'} done ${v.mileageLabel}` : ''}.`
  )
}

/**
 * The paragraph near the top of the page: the whole car in a few plain
 * sentences that still make sense when lifted out of the page (by a search
 * result, a voice assistant or an AI answer).
 *
 * @param site   the site the car is kept at, or null when the record does not
 *               say. Only then does the paragraph ask the reader to ring and
 *               check; it never guesses a site.
 * @param dealer the business name, from lib/seo/site.ts
 * @param phone  the number to ring, from lib/locations.ts
 */
export function carSummary(
  v: InventoryVehicle,
  { site, dealer, phone, sold }: { site: Location | null; dealer: string; phone: string; sold: boolean },
): string {
  const what = whatItIs(v, sold)

  if (sold) {
    return [
      `This ${carName(v)} has been sold by ${dealer}, ${CITY}.`,
      what,
      v.price !== null ? `It was last listed at ${v.priceLabel}.` : null,
      `Call ${phone} to ask about similar cars in stock.`,
    ]
      .filter(Boolean)
      .join(' ')
  }

  return [
    what ?? `This ${carName(v)} is a used car.`,
    v.price !== null ? `The asking price is ${v.priceLabel}.` : 'The price is given on request.',
    site
      ? `It is for sale from ${dealer} and is kept at the ${site.shortName} site in ${site.city}.`
      : `It is for sale from ${dealer} in ${CITY}.`,
    site
      ? `Call ${phone} to arrange a time to see it.`
      : `Call ${phone} to see it and to check which of our ${CITY} sites it is at.`,
  ].join(' ')
}

/** The <meta name="description"> text. */
export function carMetaDescription(
  v: InventoryVehicle,
  { phone, sold }: { phone: string; sold: boolean },
): string {
  if (sold) {
    return `This ${carName(v)} has been sold. See similar used cars in stock at AM Group, ${CITY}, or call ${phone}.`
  }
  const facts = [v.mileage !== null ? v.mileageLabel : null, v.fuel, v.transmission].filter(Boolean)
  const lead = [
    `Used ${carName(v)} for sale in ${CITY}${facts.length ? `: ${facts.join(', ')}` : ''}.`,
    v.price !== null ? `Price ${v.priceLabel}.` : 'Call for price.',
  ].join(' ')
  // "See the photos" only for a car that has some, and "the best price" only
  // for a car with a price to better. The fullest ending that keeps the whole
  // description inside what a search result shows is used; the phone number
  // is the last thing to go.
  const endings = [
    v.images.length > 0 && v.price !== null
      ? `See the photos and ask AM Group for the best price, or call ${phone}.`
      : v.images.length > 0
        ? `See the photos and ask AM Group about this car, or call ${phone}.`
        : `Ask AM Group about this car, or call ${phone}.`,
    ...(v.images.length > 0 ? [`See the photos, or call ${phone}.`] : []),
    `Call AM Group on ${phone}.`,
    `Call ${phone}.`,
  ]
  const ending = endings.find((e) => lead.length + 1 + e.length <= DESCRIPTION_BUDGET)
  return ending ? `${lead} ${ending}` : lead
}

/** "1st owner", "2nd owner", "3rd owner", "4th owner". */
export function ownersLabel(owners: number): string {
  const tens = owners % 100
  const suffix =
    tens >= 11 && tens <= 13 ? 'th' : owners % 10 === 1 ? 'st' : owners % 10 === 2 ? 'nd' : owners % 10 === 3 ? 'rd' : 'th'
  return `${owners}${suffix} owner`
}

/**
 * Questions that can only be answered when staff have filled the fact in.
 * Each is left out, not answered vaguely, when they have not.
 */
export function carFactFaqs(
  v: InventoryVehicle,
  { site, phone }: { site: Location | null; phone: string },
): { question: string; answer: string }[] {
  const name = carName(v)
  const faqs: { question: string; answer: string }[] = []

  if (v.owners) {
    faqs.push({
      question: `How many owners has this ${name} had?`,
      answer:
        `Our stock record shows ${v.owners === 1 ? 'one owner' : `${v.owners} owners`} for this car. ` +
        'You can check this against the registration certificate when you see it.',
    })
  }
  if (v.registration) {
    faqs.push({
      question: `Where is this ${name} registered?`,
      answer: `It carries a ${v.registration} series registration number.`,
    })
  }
  if (site) {
    faqs.push({
      question: `Which AM Group site is this ${name} at?`,
      answer:
        `It is kept at ${site.shortName} in ${site.city}. ` +
        (site.addressConfirmed ? `The address is ${site.streetAddress}, ${site.landmark}. ` : '') +
        `Call ${phone} before you travel so the car is ready for you.`,
    })
  }
  return faqs
}

/** The dealer's own description as paragraphs. Plain text; React escapes it. */
export function descriptionParagraphs(description: string | null | undefined): string[] {
  return (description ?? '')
    .split(/\r?\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
}

/**
 * The page's structured data: one graph, two things, joined by @id.
 *
 *   <page>#webpage   the page (ItemPage), whose main entity is the car
 *   <page>#car       the car. With a price it is typed BOTH Product and Car:
 *                    Google reads a price only from a Product, and does not
 *                    treat Car as one. Without a price it is a Car only: a
 *                    Product must have an offer, a review or a rating, and a
 *                    car with none of the three is reported as invalid.
 *
 * The seller is not described here. It is named by the @id of the business
 * that the site-wide graph (lib/seo-schemas.ts) describes once, so a search
 * engine sees one dealer and not a second, slightly different copy. A site is
 * named the same way, and only when the record says which site the car is at.
 *
 * No rating and no review of any kind: the site has none that are real.
 */
export function carGraph({
  vehicle: v,
  name,
  pageUrl,
  description,
  site,
  sold,
  ids,
}: {
  vehicle: InventoryVehicle
  /** The page's heading (carHeading), so the name here is the one on the page. */
  name: string
  /** Absolute address of this page. */
  pageUrl: string
  description: string
  site: Location | null
  sold: boolean
  /** The @id scheme, from lib/seo-schemas.ts. */
  ids: { dealer: string; website: string; site: (slug: string) => string }
}) {
  const carId = `${pageUrl}#car`
  // Structured data needs absolute addresses; a photo path that is not one is
  // left out here (the page itself still shows it).
  const images = v.images.filter((src) => /^https?:\/\//i.test(src))

  const offer =
    v.price !== null
      ? {
          '@type': 'Offer',
          '@id': `${pageUrl}#offer`,
          url: pageUrl,
          priceCurrency: 'INR',
          price: v.price,
          availability: sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/UsedCondition',
          seller: { '@id': ids.dealer },
          // Where to collect it, only while there is a car to collect.
          ...(site && !sold
            ? {
                offeredBy: { '@id': ids.site(site.slug) },
                availableAtOrFrom: { '@id': ids.site(site.slug) },
              }
            : {}),
        }
      : null

  const car = {
    '@type': offer ? ['Product', 'Car'] : 'Car',
    '@id': carId,
    name,
    url: pageUrl,
    mainEntityOfPage: { '@id': `${pageUrl}#webpage` },
    sku: String(v.id),
    description,
    ...(v.make ? { brand: { '@type': 'Brand', name: v.make } } : {}),
    ...(v.make ? { manufacturer: { '@type': 'Organization', name: v.make } } : {}),
    ...(v.model ? { model: v.model } : {}),
    ...(v.variant ? { vehicleConfiguration: v.variant } : {}),
    ...(v.year ? { productionDate: String(v.year), vehicleModelDate: String(v.year) } : {}),
    ...(v.fuel ? { fuelType: v.fuel } : {}),
    ...(v.transmission ? { vehicleTransmission: v.transmission } : {}),
    ...(v.drivetrain ? { driveWheelConfiguration: v.drivetrain } : {}),
    ...(v.bodyType ? { bodyType: v.bodyType } : {}),
    ...(v.colour ? { color: v.colour } : {}),
    ...(v.engine ? { vehicleEngine: { '@type': 'EngineSpecification', name: v.engine } } : {}),
    ...(v.mileage !== null
      ? { mileageFromOdometer: { '@type': 'QuantitativeValue', value: v.mileage, unitCode: 'KMT' } }
      : {}),
    // schema.org counts the current owner in this number, as the stock record does.
    ...(v.owners ? { numberOfPreviousOwners: v.owners } : {}),
    ...(images.length > 0 ? { image: images } : {}),
    itemCondition: 'https://schema.org/UsedCondition',
    ...(offer ? { offers: offer } : {}),
  }

  const page = {
    '@type': 'ItemPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name,
    inLanguage: 'en-IN',
    isPartOf: { '@id': ids.website },
    mainEntity: { '@id': carId },
    ...(images.length > 0 ? { primaryImageOfPage: { '@type': 'ImageObject', url: images[0] } } : {}),
    ...(v.postedAt ? { datePublished: v.postedAt } : {}),
    ...(v.updatedAt ? { dateModified: v.updatedAt } : {}),
  }

  return { '@context': 'https://schema.org', '@graph': [page, car] }
}
