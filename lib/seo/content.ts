/**
 * Data-driven page copy.
 *
 * Every figure quoted here comes from live stock, so the prose cannot drift
 * out of date the way hand-written "we have 150+ cars" copy does. If the
 * inventory is empty the copy degrades to generic statements rather than
 * claiming a stock level that does not exist.
 */

import { formatINR, formatINRShort } from '../inventory/adapter.ts'
import type { InventoryFacets, InventoryVehicle } from '../inventory/types.ts'
import type { FaqItem } from '../../components/seo/faq-section.tsx'
import { LOCATIONS, PRIMARY_LOCATION } from '../locations.ts'
import { locationAddressLine, locationNames } from './locations.ts'

/*
 * WHAT THIS FILE MAY NOT SAY. Nothing on record describes an inspection, a
 * document or history check, how or when an odometer reading is taken, which
 * lenders are used, or any promise to ring back when a car arrives. Until the
 * owner states those, the copy below says only what the stock record and
 * lib/locations.ts hold: the odometer reading on the listing, "finance
 * assistance", and the RC and insurance transfer.
 */

/** Never typed: the switchboard number lives in lib/locations.ts. */
const PHONE = PRIMARY_LOCATION.phone

const list = (items: string[], conj = 'and'): string => {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  return `${items.slice(0, -1).join(', ')} ${conj} ${items[items.length - 1]}`
}

/** "an automatic", "a manual", "an SUV" — initialisms are read letter by letter. */
function withArticle(word: string, capital = false): string {
  const an = /^(suv|mpv|muv)\b/i.test(word) || /^[aeiou]/i.test(word)
  return `${capital ? (an ? 'An' : 'A') : an ? 'an' : 'a'} ${word}`
}

export interface ListingCopy {
  intro: string[]
  outro: { heading: string; body: string }[]
}

export function buildListingCopy(
  facets: InventoryFacets,
  total: number,
  cityName = 'Jammu',
): ListingCopy {
  const makes = facets.makes.map((m) => m.label)
  const bodies = facets.bodyTypes.map((b) => b.label)
  const fuels = facets.fuels.map((f) => f.label)
  const priceLow = formatINRShort(facets.priceRange.min)
  const priceHigh = formatINRShort(facets.priceRange.max)
  const yearLow = facets.yearRange.min
  const yearHigh = facets.yearRange.max

  const intro: string[] = []

  if (total > 0) {
    intro.push(
      `AM Group has ${total} used ${total === 1 ? 'car' : 'cars'} for sale in ${cityName} right now` +
        `${makes.length ? `, covering ${list(makes)}` : ''}. ` +
        `Prices start from ${priceLow} and go up to ${priceHigh}, with model years spanning ${yearLow} to ${yearHigh}.`,
    )
    intro.push(
      `Every car listed here is in stock — the photographs are of that car, ` +
        `and the kilometres shown are the odometer reading. ` +
        `${bodies.length ? `You can browse by body style (${list(bodies)})` : 'You can browse'}` +
        `${fuels.length ? `, by fuel type (${list(fuels, 'or')})` : ''}, by budget, by model year, or by kilometres driven.`,
    )
  } else {
    intro.push(
      `Our used car listings for ${cityName} are being updated right now — please call ${PHONE} and ` +
        `we will tell you what is in stock today.`,
    )
  }

  const outro = [
    {
      heading: `Buying a used car in ${cityName}`,
      body:
        `A used car in ${cityName} has to cope with everything from city traffic to long climbs on the ` +
        `national highway, so mechanical condition matters more here than the badge on the bonnet. ` +
        `There is no obligation to arrange finance through us.`,
    },
    {
      heading: 'What to check before you buy',
      body:
        `Ask to see the registration certificate, the insurance status and the pollution certificate, and confirm ` +
        `whether the car has ever been transferred between states — a J&K registration transferred from another ` +
        `state carries extra paperwork. Take the car up an incline to listen to the engine under load, check tyre ` +
        `wear across all four corners, and test every electrical item. Our team will walk you through each of these ` +
        `on any car listed here, and you are welcome to bring your own mechanic.`,
    },
    {
      heading: 'Finance, exchange and paperwork',
      body:
        `We can help arrange finance, and we handle the RC transfer and ` +
        `insurance transfer. If you are exchanging your present car, bring it along and we will value it. ` +
        `Visit us at ${locationAddressLine(PRIMARY_LOCATION)}. We also sell used cars at ` +
        `${LOCATIONS.filter((l) => !l.isPrimary).map((l) => l.shortName).join(' and ')} — call ${PHONE} for directions.`,
    },
  ]

  return { intro, outro }
}

export function buildListingFaqs(
  facets: InventoryFacets,
  total: number,
  cityName = 'Jammu',
): FaqItem[] {
  const makes = facets.makes.map((m) => m.label)
  const faqs: FaqItem[] = []

  if (total > 0) {
    faqs.push({
      question: `How many used cars does AM Group have in ${cityName} right now?`,
      answer:
        `There ${total === 1 ? 'is' : 'are'} ${total} used ${total === 1 ? 'car' : 'cars'} in stock at the moment` +
        `${makes.length ? `, across ${list(makes)}` : ''}. This page updates as cars are sold or added, ` +
        `so the count you see is the live figure.`,
    })

    faqs.push({
      question: `What is the price range of used cars at AM Group in ${cityName}?`,
      answer:
        `Current stock runs from ${formatINR(facets.priceRange.min)} to ${formatINR(facets.priceRange.max)}. ` +
        `You can filter by budget using the price slider, or use the budget links at the foot of this page.`,
    })

    if (facets.fuels.length > 0) {
      faqs.push({
        question: 'Which fuel types are available?',
        answer:
          `We currently stock ${list(facets.fuels.map((f) => `${f.label} (${f.count} ${f.count === 1 ? 'car' : 'cars'})`))}. ` +
          `If the fuel type you want is not listed, call ${PHONE} to ask about it.`,
      })
    }

    if (facets.transmissions.length > 0) {
      const automatics = facets.transmissions.find((t) => /auto/i.test(t.value))?.count ?? 0
      faqs.push({
        question: 'Do you have automatic used cars?',
        answer:
          automatics > 0
            ? `Yes. ${automatics} of the ${total} ${total === 1 ? 'car' : 'cars'} in stock ${automatics === 1 ? 'is an automatic' : 'are automatics'}. ` +
              `Use the transmission filter to see only those.`
            : `None in stock today. Call ${PHONE} to ask about automatics.`,
      })
    }
  }

  // There is no question here about what "Certified Used" covers: the company
  // has not said who looks at the cars or against what list, so any answer
  // would be a guess. Add one when it does.
  faqs.push(
    {
      question: 'Can I book a test drive before buying?',
      answer:
        `Yes. Send an enquiry from the car's page or call ${PHONE}. Test drives are arranged at our Jammu ` +
        `locations (${locationNames()}) and there is no charge or obligation.`,
    },
    {
      question: 'Do you arrange finance for used cars?',
      answer:
        'Yes. We can help arrange finance. You are free to arrange your own finance elsewhere.',
    },
    {
      question: 'Will you buy or part-exchange my existing car?',
      answer:
        `Yes. Bring your car to any of our ${LOCATIONS.length} Jammu sites (${locationNames()}) and we will value it, then offset that ` +
        'against whichever car you are buying. Bring the registration certificate, insurance and service records if you have them.',
    },
    {
      question: 'Where can I see the cars?',
      answer:
        `At our ${LOCATIONS.length} used-car locations in Jammu: ${locationNames()}. Call ${PHONE} before you ` +
        'travel and we will confirm which site the car you want is at.',
    },
  )

  return faqs
}

/**
 * @param site the one site this car is kept at, when the stock record names
 *             it. The "can I see it" answer then names that site instead of
 *             asking the reader to ring and find out. It is passed in, rather
 *             than patched on afterwards by matching the question's wording,
 *             so rewording the question cannot silently lose the answer.
 */
export function buildVehicleFaqs(
  v: InventoryVehicle,
  site: { shortName: string; city: string } | null = null,
): FaqItem[] {
  const name = `${v.year ? `${v.year} ` : ''}${v.title}`
  const faqs: FaqItem[] = []

  if (v.price !== null) {
    faqs.push({
      question: `What is the price of this ${name}?`,
      // The asking price only. Some cars also carry a higher second figure;
      // until the owner says what that figure is, no answer presents it as a
      // previous price or a saving.
      answer: `The asking price is ${v.priceLabel}. Registration transfer and insurance are quoted separately.`,
    })
  }

  if (v.mileage !== null) {
    faqs.push({
      question: `How many kilometres has this ${v.make ?? 'car'} done?`,
      answer:
        `${v.mileageLabel} on the odometer. You are welcome to inspect the odometer and the service book in person.`,
    })
  }

  const specBits = [
    v.fuel ? `runs on ${v.fuel.toLowerCase()}` : null,
    v.transmission ? `has ${withArticle(v.transmission.toLowerCase())} gearbox` : null,
    v.drivetrain ? `is ${v.drivetrain}` : null,
    v.engine ? `is fitted with the ${v.engine} engine` : null,
  ].filter(Boolean) as string[]

  if (specBits.length > 0) {
    faqs.push({
      question: `What are the key specifications of this ${name}?`,
      answer: `It ${list(specBits)}.${v.bodyType ? ` The body style is ${v.bodyType}.` : ''}${v.colour ? ` The exterior colour is ${v.colour}.` : ''}`,
    })
  }

  faqs.push(
    {
      question: 'Is this car still available?',
      answer:
        'This page reflects live stock — if the car is shown here it has not been sold. Stock moves quickly, so we ' +
        `recommend calling ${PHONE} or sending an enquiry to confirm before travelling.`,
    },
    {
      question: 'Can I see this car before buying?',
      answer: site
        ? `Yes. It is kept at ${site.shortName} in ${site.city}. Call ${PHONE} before you travel so the ` +
          'car is ready for you. You are welcome to bring your own mechanic, and we will arrange a test ' +
          'drive on request.'
        : `Yes. Our used cars are kept at ${LOCATIONS.length} Jammu locations (${locationNames()}). Call ${PHONE} ` +
          'and we will tell you which site this car is at. You are welcome to bring your own mechanic, and we ' +
          'will arrange a test drive on request.',
    },
    {
      question: 'Is finance available on this car?',
      answer: 'Yes. We can help arrange finance, and we handle the RC transfer and insurance transfer.',
    },
  )

  return faqs
}

/** Long-form description used for the "Seller's Notes" block. */
export function buildSellerNotes(v: InventoryVehicle): string[] {
  const paras: string[] = []
  const name = `${v.year ? `${v.year} ` : ''}${v.title}`

  // The stored condition label ("Certified Used", "Used Cars") is not turned
  // into a sentence: it read "is listed as used cars", and as prose it
  // repeated a certification nobody has defined. The page shows the label in
  // its Condition row.
  const opening = [
    `This ${name} is available now from AM Group in Jammu`,
    v.mileage !== null ? `, having covered ${v.mileageLabel}` : '',
    '.',
  ].join('')

  // Built only from the fields this car has, so a car with no engine or fuel
  // on record never produces half a sentence ("It is, paired with ...").
  const specBits = [
    v.engine ? `is fitted with the ${v.engine} engine` : '',
    v.fuel ? `runs on ${v.fuel.toLowerCase()}` : '',
    v.transmission ? `has ${withArticle(v.transmission.toLowerCase())} gearbox` : '',
    v.drivetrain ? `drives the ${v.drivetrain === 'FWD' ? 'front wheels' : v.drivetrain}` : '',
  ].filter(Boolean)
  const spec = specBits.length ? `It ${list(specBits)}.` : ''

  paras.push(`${opening} ${spec}`.trim())

  const detail = [
    // The body style is printed as stored: "SUV" and "MPV" are not lower-cased.
    v.bodyType ? `${withArticle(v.bodyType, true)} like this suits buyers who need everyday practicality around Jammu as well as the occasional highway run.` : '',
    v.colour ? ` The exterior is finished in ${v.colour}.` : '',
    v.photoCount > 0 ? ` We have published ${v.photoCount} photographs of this exact car — not stock images — so you can assess its condition before visiting.` : '',
  ].join('')

  if (detail.trim()) paras.push(detail.trim())

  paras.push(
    `Our team can help arrange finance, value your present car for exchange, and complete the RC and ` +
      `insurance transfer. To see the car or take a test drive, send an enquiry above or call ${PHONE}.`,
  )

  return paras
}

/* -------------------------------------------------------------------------- */
/* Homepage: the dealer's basic facts, and the questions it can answer today   */
/* -------------------------------------------------------------------------- */

const SITES = LOCATIONS.length
const SITES_WORD = SITES === 3 ? 'three' : String(SITES)

/** "9:30 am" from "09:30". */
function clock(t: string): string {
  const [hh, mm] = t.split(':').map(Number)
  return `${hh % 12 === 0 ? 12 : hh % 12}:${String(mm).padStart(2, '0')} ${hh >= 12 ? 'pm' : 'am'}`
}

/** "Monday to Saturday, 9:30 am to 6:30 pm", from the primary site's hours. */
function openingHours(): string {
  return PRIMARY_LOCATION.hours
    .map((h) => {
      const days = h.days.length > 1 ? `${h.days[0]} to ${h.days[h.days.length - 1]}` : h.days[0]
      return `${days}, ${clock(h.opens)} to ${clock(h.closes)}`
    })
    .join('; ')
}

/**
 * Who the dealer is, where, how much stock and at what prices, when it is open
 * and how to reach it — in sentences that can be lifted whole. Every figure is
 * from today's stock or lib/locations.ts; with no live stock the stock
 * sentence is left out rather than guessed.
 */
export function buildDealerFacts(facets: InventoryFacets, total: number): string {
  const hours = openingHours()
  return [
    `AM Group Used Cars sells and buys second-hand cars at ${SITES_WORD} sites in Jammu city: ${locationNames()}.`,
    total > 0
      ? `${total} ${total === 1 ? 'car is' : 'cars are'} in stock today` +
        `${facets.priceRange.max > 0 ? `, with asking prices from ${formatINR(facets.priceRange.min)} to ${formatINR(facets.priceRange.max)}` : ''}.`
      : '',
    hours ? `Open ${hours}.` : '',
    `Call ${PHONE}.`,
  ]
    .filter(Boolean)
    .join(' ')
}

/**
 * Homepage questions. Each answer is built from the stock list or from
 * lib/locations.ts and nothing else: no warranty, certification, delivery or
 * bank is named, because the company has not supplied those facts.
 */
export function buildHomeFaqs(
  facets: InventoryFacets,
  vehicles: InventoryVehicle[],
  total: number,
): FaqItem[] {
  const faqs: FaqItem[] = []
  const makes = facets.makes.map((m) => `${m.label} (${m.count})`)
  const hours = openingHours()

  faqs.push({
    question: 'Where can I buy a used car in Jammu?',
    answer:
      `AM Group Used Cars sells second-hand cars at ${SITES_WORD} sites in Jammu city: ${locationNames()}. ` +
      `${total > 0 ? `${total} ${total === 1 ? 'car is' : 'cars are'} in stock today. ` : ''}` +
      `Call ${PHONE} before you travel and we will tell you which site a car is at.`,
  })

  if (total > 0) {
    faqs.push({
      question: 'How many used cars does AM Group have in stock, and at what prices?',
      answer:
        `${total} used ${total === 1 ? 'car' : 'cars'} today` +
        `${facets.priceRange.max > 0 ? `, with asking prices from ${formatINR(facets.priceRange.min)} to ${formatINR(facets.priceRange.max)}` : ''}. ` +
        `The stock list on this site is live, so the count changes as cars are sold or added.`,
    })

    const cheapest = vehicles
      .filter((v) => v.price !== null)
      .sort((a, b) => (a.price as number) - (b.price as number))[0]
    if (cheapest) {
      faqs.push({
        question: 'What is the lowest-priced used car at AM Group today?',
        answer:
          `The ${cheapest.year ? `${cheapest.year} ` : ''}${cheapest.title}, at an asking price of ${cheapest.priceLabel}` +
          `${cheapest.mileage !== null ? `, with ${cheapest.mileageLabel} on the odometer` : ''}. ` +
          `Registration transfer and insurance are quoted separately.`,
      })
    }

    if (makes.length > 0) {
      faqs.push({
        question: 'Which makes of used car are in stock?',
        answer: `Today's stock is ${list(makes)}. The number after each make is how many of its cars are in stock.`,
      })
    }

    const automatics = facets.transmissions.find((t) => /auto/i.test(t.value))?.count ?? 0
    const diesels = facets.fuels.find((f) => /diesel/i.test(f.value))?.count ?? 0
    faqs.push({
      question: 'Does AM Group have automatic or diesel used cars?',
      answer:
        `${automatics > 0 ? `${automatics} ${automatics === 1 ? 'automatic is' : 'automatics are'} in stock today` : 'No automatic is in stock today'}, and ` +
        `${diesels > 0 ? `${diesels} diesel ${diesels === 1 ? 'car' : 'cars'}` : 'no diesel car'}. ` +
        `Call ${PHONE} if the one you want is not listed.`,
    })
  }

  faqs.push(
    {
      question: "What are AM Group's opening hours and phone number?",
      answer:
        `${hours ? `The used-car sites are open ${hours}. ` : ''}` +
        `The phone number for all ${SITES_WORD} sites is ${PHONE}.`,
    },
    {
      question: 'Can I sell or exchange my car at AM Group?',
      answer:
        `Yes. Bring your car to any of our ${SITES_WORD} Jammu sites and we will value it. You can sell it outright or ` +
        `offset the value against a car you are buying from us. Bring the registration certificate, insurance and ` +
        `service records if you have them.`,
    },
    {
      // The wording lib/locations.ts supports: "Car finance assistance" and
      // "RC & insurance transfer". No lender, no new insurance policy and no
      // statement about the price.
      question: 'Are finance and the RC and insurance transfer handled at the dealership?',
      answer:
        'Yes. Finance help and the RC and insurance transfer are handled at the dealership. ' +
        'You are free to arrange your own finance elsewhere.',
    },
  )

  return faqs
}
