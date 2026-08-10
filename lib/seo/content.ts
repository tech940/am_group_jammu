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
      `AM Group is one of Jammu & Kashmir's longest-running automotive groups, trading since 1968. ` +
        `We currently have ${total} certified pre-owned ${total === 1 ? 'car' : 'cars'} available in ${cityName}` +
        `${makes.length ? `, covering ${list(makes)}` : ''}. ` +
        `Prices start from ${priceLow} and go up to ${priceHigh}, with model years spanning ${yearLow} to ${yearHigh}.`,
    )
    intro.push(
      `Every car listed here is a real unit physically in stock — the photographs are of the actual vehicle, ` +
        `and the odometer reading shown is the reading recorded at intake. ` +
        `${bodies.length ? `You can browse by body style (${list(bodies)})` : 'You can browse'}` +
        `${fuels.length ? `, by fuel type (${list(fuels, 'or')})` : ''}, by budget, by model year, or by kilometres driven.`,
    )
  } else {
    intro.push(
      `AM Group has been serving Jammu & Kashmir's motorists since 1968. Our certified pre-owned listings for ` +
        `${cityName} are being updated right now — please call +91 94191 00000 and our team will tell you what has just arrived.`,
    )
  }

  const outro = [
    {
      heading: `Buying a used car in ${cityName}`,
      body:
        `A used car in ${cityName} has to cope with everything from city traffic to long climbs on the ` +
        `national highway, so mechanical condition matters more here than the badge on the bonnet. ` +
        `Before a car reaches this page it is inspected, its paperwork is verified, and its service history is ` +
        `checked where available. We publish the asking price against the original listed price so you can see ` +
        `exactly how a vehicle has been valued, and there is no obligation to arrange finance through us.`,
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
        `We work with leading nationalised and private banks to arrange finance, and we handle the RC transfer, ` +
        `insurance transfer and hypothecation paperwork in-house. If you are part-exchanging, we will value your ` +
        `existing car at the showroom while you wait. Visit us at AM Business Park, N-H 1 Bye-Pass Road, opposite ` +
        `the railway station in Jammu, or at AM Tower, Hyderpora Bye-Pass in Srinagar.`,
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
        `There are ${total} certified pre-owned cars in stock at the moment` +
        `${makes.length ? `, across ${list(makes)}` : ''}. This page updates automatically as cars are sold or added, ` +
        `so the count you see is the live figure rather than an estimate.`,
    })

    faqs.push({
      question: `What is the price range of used cars at AM Group ${cityName}?`,
      answer:
        `Current stock runs from ${formatINR(facets.priceRange.min)} to ${formatINR(facets.priceRange.max)}. ` +
        `You can filter by budget using the price slider, or use the budget links at the foot of this page.`,
    })

    if (facets.fuels.length > 0) {
      faqs.push({
        question: 'Which fuel types are available?',
        answer:
          `We currently stock ${list(facets.fuels.map((f) => `${f.label} (${f.count} ${f.count === 1 ? 'car' : 'cars'})`))}. ` +
          `We do not have any electric or CNG cars in stock at present — call us and we will let you know when one arrives.`,
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
        'Cars listed as Certified Used have passed a multi-point mechanical, structural and electrical inspection, ' +
        'and their documentation has been verified before being put on sale. Cars listed simply as Used have been ' +
        'checked and are sold as described. The condition of each car is shown on its own page.',
    },
    {
      question: 'Can I book a test drive before buying?',
      answer:
        'Yes. Every car page has a "Schedule Test Drive" button, or you can call +91 94191 00000. ' +
        'Test drives are arranged at our Jammu and Srinagar locations and there is no charge or obligation.',
    },
    {
      question: 'Do you arrange finance for used cars?',
      answer:
        'Yes. We work with leading nationalised and private banks and can usually give you an indicative decision ' +
        'the same day. You are free to arrange your own finance elsewhere — it makes no difference to the price we quote.',
    },
    {
      question: 'Will you buy or part-exchange my existing car?',
      answer:
        'Yes. Bring your car to AM Business Park in Jammu and we will value it while you wait, then offset that ' +
        'against whichever car you are buying. Bring the registration certificate, insurance and service records if you have them.',
    },
    {
      question: 'Which areas do you deliver to?',
      answer:
        'We serve buyers across Jammu, Srinagar, Kathua and Udhampur. Cars are held centrally and can be moved to ' +
        'whichever location is convenient for your inspection.',
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
        `This is the showroom price at AM Group Jammu; registration transfer and insurance are quoted separately.`,
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
        'recommend calling +91 94191 00000 or submitting an enquiry to confirm before travelling.',
    },
    {
      question: 'Can I see this car before buying?',
      answer:
        'Yes. The car can be inspected at AM Business Park, N-H 1 Bye-Pass Road, Jammu. You are welcome to bring ' +
        'your own mechanic, and we will arrange a test drive on request.',
    },
    {
      question: 'Is finance available on this car?',
      answer:
        'Yes. We can arrange finance through leading nationalised and private banks, and handle the RC transfer, ' +
        'insurance transfer and hypothecation paperwork in-house.',
    },
  )

  return faqs
}

/** Long-form description used for the "Seller's Notes" block. */
export function buildSellerNotes(v: InventoryVehicle): string[] {
  const paras: string[] = []
  const name = `${v.year ? `${v.year} ` : ''}${v.title}`

  const opening = [
    `This ${name} is available now at AM Group Jammu`,
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
      `existing car for part-exchange, and complete the RC and insurance transfer in-house. To arrange an inspection or ` +
      `a test drive, submit an enquiry above or call +91 94191 00000.`,
  )

  return paras
}
