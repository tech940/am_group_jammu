/**
 * Real landing pages for the queries people actually type.
 *
 * A filtered listing URL like `/inventory?priceMin=0&priceMax=1000000` returns
 * the right 16 cars but its title and H1 say "16 Used Cars for Sale in Jammu" —
 * the words "under ₹10 lakh" appear nowhere, so it cannot rank for the query it
 * answers. These pages exist to carry that keyword in the URL, title, H1 and
 * body copy.
 *
 * Every slug here is generated from stock that exists, and a band that would
 * return the entire inventory is skipped — a page identical to /inventory is a
 * duplicate, not a landing page.
 */

import { getInventory } from '../inventory/server.ts'
import { formatINR, slugify } from '../inventory/adapter.ts'
import type { InventoryVehicle } from '../inventory/types.ts'
import type { InventoryFilterState } from '../../store/use-inventory-store.ts'
import { EMPTY_FILTERS } from '../../store/use-inventory-store.ts'
import type { FaqItem } from '../../components/seo/faq-section.tsx'

export type LandingKind = 'city' | 'budget' | 'model' | 'body' | 'fuel' | 'transmission'

export interface Landing {
  kind: LandingKind
  slug: string
  /** <h1> */
  heading: string
  /** <title> (site name is appended by the metadata template) */
  title: string
  description: string
  /** Lead paragraphs, rendered above the grid. */
  intro: string[]
  /** Long-form blocks below the grid. */
  sections: { heading: string; body: string }[]
  faqs: FaqItem[]
  vehicles: InventoryVehicle[]
  /** Breadcrumb label. */
  crumb: string
  cityName: string
}

const CITY = 'Jammu'

export const SERVICE_CITY_SLUGS = ['jammu', 'srinagar', 'kathua', 'udhampur'] as const

/** Round budget ceilings Indian buyers actually search for, in rupees. */
const BUDGET_CEILINGS = [200_000, 300_000, 500_000, 700_000, 1_000_000, 1_500_000] as const

const lakh = (n: number) => (n % 100_000 === 0 ? `${n / 100_000} Lakh` : `${(n / 100_000).toFixed(1)} Lakh`)

function list(items: string[], conj = 'and'): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  return `${items.slice(0, -1).join(', ')} ${conj} ${items[items.length - 1]}`
}

function priceSummary(vs: InventoryVehicle[]): string {
  const prices = vs.map((v) => v.price).filter((n): n is number => n !== null)
  if (prices.length === 0) return ''
  return `${formatINR(Math.min(...prices))} to ${formatINR(Math.max(...prices))}`
}

function commonFaqs(scope: string, vs: InventoryVehicle[]): FaqItem[] {
  const prices = vs.map((v) => v.price).filter((n): n is number => n !== null)
  return [
    ...(prices.length
      ? [{
          question: `What is the price range for ${scope}?`,
          answer:
            `Current stock runs from ${formatINR(Math.min(...prices))} to ${formatINR(Math.max(...prices))}. ` +
            `Every price shown is the asking price at our Jammu showroom; registration transfer and insurance are quoted separately.`,
        }]
      : []),
    {
      question: `Can I test drive before buying?`,
      answer:
        'Yes. Every car page has a "Schedule Test Drive" button, or call +91 94191 00000. Test drives are ' +
        'arranged at our Jammu and Srinagar locations at no charge and with no obligation.',
    },
    {
      question: 'Is finance available?',
      answer:
        'Yes. We arrange finance through leading nationalised and private banks and usually give an indicative ' +
        'decision the same day. You are free to arrange finance elsewhere — it does not change the price we quote.',
    },
    {
      question: 'Will you take my existing car in part-exchange?',
      answer:
        'Yes. Bring it to AM Business Park in Jammu and we will value it while you wait, then offset that against ' +
        'whichever car you are buying. Bring the RC, insurance and service records if you have them.',
    },
  ]
}

/* -------------------------------------------------------------------------- */
/* Slug catalogue                                                              */
/* -------------------------------------------------------------------------- */

interface SlugSpec {
  kind: LandingKind
  slug: string
  /** Narrows the inventory for this page. */
  match: (v: InventoryVehicle) => boolean
  /** Value used in copy, e.g. "Creta" or "10 Lakh". */
  label: string
  /** Optional second label, e.g. the make for a model page. */
  make?: string
  ceiling?: number
}

async function buildSpecs(): Promise<SlugSpec[]> {
  const { vehicles, facets, total } = await getInventory()
  const specs: SlugSpec[] = []

  // Cities — the four locations AM Group actually serves.
  for (const slug of SERVICE_CITY_SLUGS) {
    specs.push({
      kind: 'city',
      slug,
      label: slug.charAt(0).toUpperCase() + slug.slice(1),
      match: () => true, // stock is held centrally and available to every city
    })
  }

  // Budget bands. Skipped when the band would return everything (a duplicate of
  // /inventory) or nothing.
  for (const ceiling of BUDGET_CEILINGS) {
    const count = vehicles.filter((v) => v.price !== null && v.price <= ceiling).length
    if (count === 0 || count === total) continue
    specs.push({
      kind: 'budget',
      slug: `under-${ceiling / 100_000}-lakh-in-${CITY.toLowerCase()}`,
      label: lakh(ceiling),
      ceiling,
      match: (v) => v.price !== null && v.price <= ceiling,
    })
  }

  // Models — the highest-intent local query shape after brand.
  for (const model of facets.models) {
    const matching = vehicles.filter((v) => v.model === model.value)
    const make = matching[0]?.make ?? null
    const slugBase = make ? `${slugify(make)}-${slugify(model.value)}` : slugify(model.value)
    specs.push({
      kind: 'model',
      slug: `${slugBase}-in-${CITY.toLowerCase()}`,
      label: model.label,
      make: make ?? undefined,
      match: (v) => v.model === model.value,
    })
  }

  // Body styles.
  for (const body of facets.bodyTypes) {
    if (body.count === total) continue
    specs.push({
      kind: 'body',
      slug: `${slugify(body.value)}-in-${CITY.toLowerCase()}`,
      label: body.label,
      match: (v) => v.bodyType === body.value,
    })
  }

  // Fuel and transmission.
  for (const fuel of facets.fuels) {
    if (fuel.count === total) continue
    specs.push({
      kind: 'fuel',
      slug: `${slugify(fuel.value)}-cars-in-${CITY.toLowerCase()}`,
      label: fuel.label,
      match: (v) => v.fuel === fuel.value,
    })
  }
  for (const tx of facets.transmissions) {
    if (tx.count === total) continue
    specs.push({
      kind: 'transmission',
      slug: `${slugify(tx.value)}-cars-in-${CITY.toLowerCase()}`,
      label: tx.label,
      match: (v) => v.transmission === tx.value,
    })
  }

  // Deduplicate defensively — a model named the same as a body style would clash.
  const seen = new Set<string>()
  return specs.filter((s) => (seen.has(s.slug) ? false : (seen.add(s.slug), true)))
}

export async function getAllLandingSlugs(): Promise<{ slug: string; kind: LandingKind }[]> {
  return (await buildSpecs()).map(({ slug, kind }) => ({ slug, kind }))
}

/* -------------------------------------------------------------------------- */
/* Resolver                                                                    */
/* -------------------------------------------------------------------------- */

export async function resolveLanding(slug: string): Promise<Landing | null> {
  const specs = await buildSpecs()
  const spec = specs.find((s) => s.slug === slug.toLowerCase())
  if (!spec) return null

  const { vehicles: all, facets } = await getInventory()
  const vehicles = all.filter(spec.match)
  if (vehicles.length === 0) return null

  const n = vehicles.length
  const makes = [...new Set(vehicles.map((v) => v.make).filter(Boolean))] as string[]
  const range = priceSummary(vehicles)
  const years = vehicles.map((v) => v.year).filter((y): y is number => y !== null)

  const base = {
    kind: spec.kind,
    slug: spec.slug,
    vehicles,
    cityName: CITY,
  }

  switch (spec.kind) {
    case 'city': {
      const city = spec.label
      return {
        ...base,
        cityName: city,
        crumb: `Used Cars in ${city}`,
        heading: `Used Cars in ${city} — ${n} Certified Cars in Stock`,
        title: `Used Cars in ${city} | ${n} Second Hand Cars for Sale`,
        description:
          `Buy certified second hand cars in ${city} from AM Group. ${n} cars in stock` +
          `${makes.length ? ` — ${list(makes)}` : ''}. Real photos, verified KMs, finance and exchange.`,
        intro: [
          `AM Group has been selling and servicing cars across Jammu & Kashmir since 1968. We currently have ` +
            `${n} certified pre-owned cars available to buyers in ${city}${range ? `, priced from ${range}` : ''}.`,
          `Stock is held centrally and can be moved to whichever of our locations is most convenient for your ` +
            `inspection. Every car is photographed as it actually stands, and the odometer reading shown is the ` +
            `reading recorded at intake.`,
        ],
        sections: [
          {
            heading: `Buying a second hand car in ${city}`,
            body:
              `Roads around ${city} put real demands on a car — stop-start town traffic, then long climbs on the ` +
              `national highway. That makes mechanical condition and honest history more important than the badge. ` +
              `Every car here is inspected, its documentation verified, and its service history checked where available.`,
          },
          {
            heading: 'Paperwork, finance and exchange',
            body:
              `We handle RC transfer, insurance transfer and hypothecation in-house, and arrange finance through ` +
              `leading nationalised and private banks. If you are part-exchanging, we will value your existing car ` +
              `at the showroom while you wait.`,
          },
        ],
        faqs: [
          {
            question: `How many used cars are available in ${city}?`,
            answer: `${n} certified pre-owned cars are in stock right now${makes.length ? `, across ${list(makes)}` : ''}. This page reflects live stock.`,
          },
          ...commonFaqs(`used cars in ${city}`, vehicles),
        ],
      }
    }

    case 'budget': {
      const label = spec.label // e.g. "10 Lakh"
      return {
        ...base,
        crumb: `Under ₹${label}`,
        heading: `Used Cars Under ₹${label} in ${CITY} — ${n} Available`,
        title: `Used Cars Under ₹${label} in ${CITY} | ${n} Second Hand Cars`,
        description:
          `${n} certified used cars under ₹${label} for sale in ${CITY}` +
          `${makes.length ? ` — ${list(makes)}` : ''}. Real photos, verified KMs, finance and exchange at AM Group.`,
        intro: [
          `Looking for a used car under ₹${label} in ${CITY}? We currently have ${n} certified pre-owned ` +
            `${n === 1 ? 'car' : 'cars'} within that budget${range ? `, priced from ${range}` : ''}` +
            `${makes.length ? `, covering ${list(makes)}` : ''}.`,
          `Every price shown is the actual asking price — not a teaser figure. Registration transfer and insurance ` +
            `are quoted separately and honestly, so the number you see here is the number we negotiate from.`,
        ],
        sections: [
          {
            heading: `What ₹${label} buys you in ${CITY}`,
            body:
              `At this budget the sensible priority is condition and service history over badge or trim level. ` +
              `A well-kept car one segment down will usually cost you less over three years than a tired example ` +
              `of something more prestigious. Our team will happily tell you which of the cars on this page has ` +
              `the stronger history, even when that points you at the cheaper one.`,
          },
          {
            heading: 'Costs beyond the sticker price',
            body:
              `Budget for RC transfer, fresh insurance, and any immediate servicing the car is due. We quote these ` +
              `up front rather than at signing. If you are financing, remember the on-road figure — not the asking ` +
              `price — is what the loan is assessed against.`,
          },
        ],
        faqs: [
          {
            question: `How many used cars under ₹${label} are available in ${CITY}?`,
            answer: `${n} ${n === 1 ? 'car is' : 'cars are'} currently in stock under ₹${label} at AM Group ${CITY}. This page updates automatically as cars are sold or added.`,
          },
          ...(makes.length
            ? [{
                question: `Which brands are available under ₹${label}?`,
                answer: `Within this budget we currently stock ${list(makes)}.`,
              }]
            : []),
          ...commonFaqs(`used cars under ₹${label}`, vehicles),
        ],
      }
    }

    case 'model': {
      const name = spec.make ? `${spec.make} ${spec.label}` : spec.label
      return {
        ...base,
        crumb: `Used ${name}`,
        heading: `Used ${name} in ${CITY} — ${n} for Sale`,
        title: `Used ${name} in ${CITY} | ${n} Second Hand ${spec.label} for Sale`,
        description:
          `${n} used ${name} for sale in ${CITY}${range ? `, priced ${range}` : ''}. ` +
          `Real photos, verified KMs, full service history checks, finance and exchange at AM Group.`,
        intro: [
          `We currently have ${n} used ${name} ${n === 1 ? 'listing' : 'listings'} available in ${CITY}` +
            `${range ? `, priced from ${range}` : ''}` +
            `${years.length ? `, with model years from ${Math.min(...years)} to ${Math.max(...years)}` : ''}.`,
          `Each ${spec.label} below is a car physically in our stock — the photographs are of that specific ` +
            `vehicle and the kilometres shown were recorded at intake.`,
        ],
        sections: [
          {
            heading: `What to check on a used ${name}`,
            body:
              `Ask for the service book and confirm the major services were done on schedule. Check tyre wear across ` +
              `all four corners for alignment issues, test every electrical item, and drive the car up an incline to ` +
              `hear the engine under load — a short flat test drive hides a lot. You are welcome to bring your own ` +
              `mechanic to inspect any ${spec.label} on this page.`,
          },
          {
            heading: `Servicing a ${name} in ${CITY}`,
            body:
              `AM Group has run workshops across the region since 1968, so a ${spec.label} bought here can be serviced ` +
              `here too. We can quote for upcoming scheduled servicing before you commit, which is worth doing if a ` +
              `car is close to a major interval.`,
          },
        ],
        faqs: [
          {
            question: `How many used ${name} cars are available in ${CITY}?`,
            answer: `${n} ${n === 1 ? 'is' : 'are'} in stock right now at AM Group ${CITY}${range ? `, priced ${range}` : ''}.`,
          },
          ...(years.length
            ? [{
                question: `Which model years of the ${spec.label} do you have?`,
                answer: `Currently ${Math.min(...years)} to ${Math.max(...years)}. Each listing shows its exact year and kilometres.`,
              }]
            : []),
          ...commonFaqs(`a used ${name}`, vehicles),
        ],
      }
    }

    case 'body':
    case 'fuel':
    case 'transmission': {
      const noun =
        spec.kind === 'body' ? `${spec.label}s` : `${spec.label} cars`
      const nounTitle =
        spec.kind === 'body' ? `Used ${spec.label} Cars` : `Used ${spec.label} Cars`
      return {
        ...base,
        crumb: nounTitle,
        heading: `${nounTitle} in ${CITY} — ${n} Available`,
        title: `${nounTitle} in ${CITY} | ${n} Second Hand ${spec.label} Cars`,
        description:
          `${n} used ${spec.label.toLowerCase()} cars for sale in ${CITY}` +
          `${range ? `, priced ${range}` : ''}. Real photos, verified KMs, finance and exchange at AM Group.`,
        intro: [
          `We have ${n} used ${spec.label.toLowerCase()} ${n === 1 ? 'car' : 'cars'} in stock in ${CITY}` +
            `${range ? `, priced from ${range}` : ''}${makes.length ? `, across ${list(makes)}` : ''}.`,
          `Every listing below is a real car in our stock with its own photographs and recorded odometer reading.`,
        ],
        sections: [
          {
            heading: `Why buyers in ${CITY} choose ${noun}`,
            body:
              spec.kind === 'body'
                ? `A ${spec.label.toLowerCase()} suits the mix of town driving and highway running that most journeys ` +
                  `around ${CITY} involve. Ground clearance and load space matter here more than they would in a flatter city.`
                : spec.kind === 'fuel'
                  ? `${spec.label} suits buyers whose running is mostly in and around town, where the lower purchase ` +
                    `price and simpler maintenance usually outweigh any difference in fuel economy.`
                  : `${spec.label} transmissions take the effort out of stop-start traffic, which is most of what ` +
                    `driving in ${CITY} involves on a weekday.`,
          },
          {
            heading: 'Inspection and paperwork',
            body:
              `Every car here has been inspected mechanically and structurally and its documentation verified before ` +
              `sale. We handle RC transfer, insurance transfer and hypothecation in-house, and can arrange finance ` +
              `through leading nationalised and private banks.`,
          },
        ],
        faqs: [
          {
            question: `How many used ${spec.label.toLowerCase()} cars do you have in ${CITY}?`,
            answer: `${n} in stock right now${makes.length ? `, across ${list(makes)}` : ''}.`,
          },
          ...commonFaqs(`used ${spec.label.toLowerCase()} cars`, vehicles),
        ],
      }
    }
  }
}

/** Filters equivalent to a landing page, for the "refine further" links. */
export function landingFilters(l: Landing): Partial<InventoryFilterState> {
  switch (l.kind) {
    case 'model':
      return { ...EMPTY_FILTERS, model: l.vehicles[0]?.model ?? '' }
    case 'body':
      return { ...EMPTY_FILTERS, bodyType: l.vehicles[0]?.bodyType ?? '' }
    case 'fuel':
      return { ...EMPTY_FILTERS, fuel: l.vehicles[0]?.fuel ?? '' }
    case 'transmission':
      return { ...EMPTY_FILTERS, transmission: l.vehicles[0]?.transmission ?? '' }
    default:
      return { ...EMPTY_FILTERS }
  }
}
