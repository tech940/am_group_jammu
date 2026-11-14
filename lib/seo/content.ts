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

/** Never typed: the switchboard number lives in lib/locations.ts. */
const PHONE = PRIMARY_LOCATION.phone

const list = (items: string[], conj = 'and'): string => {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  return `${items.slice(0, -1).join(', ')} ${conj} ${items[items.length - 1]}`
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
        `and the kilometres shown are the reading recorded when it came in. ` +
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
        `Before a car reaches this page it is checked, its paperwork is verified, and its service history is ` +
        `looked at where available. There is no obligation to arrange finance through us.`,
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
        `We arrange finance through nationalised and private banks, and we handle the RC transfer and ` +
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
          `If the fuel type you want is not listed, call ${PHONE} and we will tell you when one comes in.`,
      })
    }

    if (facets.transmissions.length > 0) {
      faqs.push({
        question: 'Do you have automatic used cars?',
        answer:
          `Yes — ${list(facets.transmissions.map((t) => `${t.count} ${t.label.toLowerCase()}`))} ` +
          `${facets.transmissions.length === 1 ? 'car is' : 'cars are'} listed. Use the transmission filter to see only automatics.`,
      })
    }
  }

  faqs.push(
    {
      question: 'Are these cars certified, and what does that cover?',
      answer:
        'Cars listed as Certified Used have been inspected and their documents verified before being put on sale. ' +
        'Cars listed simply as Used have been checked and are sold as described. The condition of each car is ' +
        'shown on its own page — ask us what the inspection covered for the car you are interested in.',
    },
    {
      question: 'Can I book a test drive before buying?',
      answer:
        `Yes. Send an enquiry from the car's page or call ${PHONE}. Test drives are arranged at our Jammu ` +
        `locations (${locationNames()}) and there is no charge or obligation.`,
    },
    {
      question: 'Do you arrange finance for used cars?',
      answer:
        'Yes. We arrange finance through nationalised and private banks. You are free to arrange your own ' +
        'finance elsewhere — it makes no difference to the price we quote.',
    },
    {
      question: 'Will you buy or part-exchange my existing car?',
      answer:
        `Yes. Bring your car to ${PRIMARY_LOCATION.shortName} in ${PRIMARY_LOCATION.city} and we will value it, then offset that ` +
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

export function buildVehicleFaqs(v: InventoryVehicle): FaqItem[] {
  const name = `${v.year ? `${v.year} ` : ''}${v.title}`
  const faqs: FaqItem[] = []

  if (v.price !== null) {
    faqs.push({
      question: `What is the price of this ${name}?`,
      answer:
        `The asking price is ${v.priceLabel}` +
        `${v.originalPriceLabel ? `, against an originally listed price of ${v.originalPriceLabel}` : ''}. ` +
        `Registration transfer and insurance are quoted separately.`,
    })
  }

  if (v.mileage !== null) {
    faqs.push({
      question: `How many kilometres has this ${v.make ?? 'car'} done?`,
      answer:
        `${v.mileageLabel}, as recorded at intake. You are welcome to inspect the odometer and the service book in person.`,
    })
  }

  const specBits = [
    v.fuel ? `runs on ${v.fuel.toLowerCase()}` : null,
    v.transmission ? `has a ${v.transmission.toLowerCase()} gearbox` : null,
    v.drivetrain ? `is ${v.drivetrain}` : null,
    v.engine ? `and is fitted with the ${v.engine} engine` : null,
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
      answer:
        `Yes. Our used cars are kept at ${LOCATIONS.length} Jammu locations (${locationNames()}). Call ${PHONE} ` +
        'and we will tell you which site this car is at. You are welcome to bring your own mechanic, and we ' +
        'will arrange a test drive on request.',
    },
    {
      question: 'Is finance available on this car?',
      answer:
        'Yes. We can arrange finance through nationalised and private banks, and we handle the RC transfer ' +
        'and insurance transfer.',
    },
  )

  return faqs
}

/** Long-form description used for the "Seller's Notes" block. */
export function buildSellerNotes(v: InventoryVehicle): string[] {
  const paras: string[] = []
  const name = `${v.year ? `${v.year} ` : ''}${v.title}`

  const opening = [
    `This ${name} is available now from AM Group in Jammu`,
    v.condition ? ` and is listed as ${v.condition.toLowerCase()}` : '',
    v.mileage !== null ? `, having covered ${v.mileageLabel}` : '',
    '.',
  ].join('')

  const spec = [
    v.engine ? `It is fitted with the ${v.engine} engine` : 'It is',
    v.fuel ? ` running on ${v.fuel.toLowerCase()}` : '',
    v.transmission ? `, paired with a ${v.transmission.toLowerCase()} gearbox` : '',
    v.drivetrain ? ` driving the ${v.drivetrain === 'FWD' ? 'front wheels' : v.drivetrain}` : '',
    '.',
  ].join('')

  paras.push(`${opening} ${spec}`)

  const detail = [
    v.bodyType ? `As a ${v.bodyType.toLowerCase()}, it suits buyers who need everyday practicality around Jammu as well as the occasional highway run.` : '',
    v.colour ? ` The exterior is finished in ${v.colour}.` : '',
    v.photoCount > 0 ? ` We have published ${v.photoCount} photographs of this exact car — not stock images — so you can assess its condition before visiting.` : '',
  ].join('')

  if (detail.trim()) paras.push(detail.trim())

  paras.push(
    `Documentation has been checked and the vehicle is ready for transfer. Our team can arrange finance, value your ` +
      `present car for exchange, and complete the RC and insurance transfer. To arrange an inspection or ` +
      `a test drive, send an enquiry above or call ${PHONE}.`,
  )

  return paras
}
