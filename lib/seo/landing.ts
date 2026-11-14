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

import { unstable_cache } from 'next/cache'
import { getInventory } from '../inventory/server.ts'
import { formatINR, slugify } from '../inventory/adapter.ts'
import type { InventoryVehicle } from '../inventory/types.ts'
import type { InventoryFilterState } from '../../store/use-inventory-store.ts'
import { EMPTY_FILTERS } from '../../store/use-inventory-store.ts'
import type { FaqItem } from '../../components/seo/faq-section.tsx'
import { carRowToInventoryVehicle } from '../cars/mapper.ts'
import { readAllCars } from '../cars/store.ts'
import { INVENTORY_CACHE_TAG } from '../cars/types.ts'
import { LOCATIONS, PRIMARY_LOCATION } from '../locations.ts'
import { locationNames } from './locations.ts'

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
  /** Heading of the car grid, e.g. "6 used SUVs in stock today". */
  stockHeading: string
  /** Long-form blocks below the grid. */
  sections: { heading: string; body: string }[]
  faqs: FaqItem[]
  vehicles: InventoryVehicle[]
  /** Breadcrumb label. */
  crumb: string
  cityName: string
  /**
   * The page search engines should index for these cars. Usually the page
   * itself. When another page shows exactly the same cars (a "Premium SUV"
   * page whose one car is also the whole Hyundai Alcazar page), this points at
   * the stronger of the two so only one of them is indexed.
   */
  canonicalPath: string
  /** False for a page that should be reachable but kept out of the index. */
  indexable: boolean
  /**
   * True for a model page kept alive after its last car sold. It has no cars
   * of its own; `related` holds cars of the same make that are in stock.
   */
  soldOut: boolean
  related: InventoryVehicle[]
}

const CITY = 'Jammu'

/**
 * City landing pages. Jammu only: all three used-car locations are in Jammu
 * and there is no site in any other city, so a "used cars in <other city>"
 * page would be a doorway page showing Jammu stock under another city's name.
 * Slugs this list used to carry redirect to /used-cars/jammu.
 */
export const SERVICE_CITY_SLUGS = ['jammu'] as const

/** Round budget ceilings Indian buyers actually search for, in rupees. */
const BUDGET_CEILINGS = [200_000, 300_000, 500_000, 700_000, 1_000_000, 1_500_000] as const

const lakh = (n: number) => (n % 100_000 === 0 ? `${n / 100_000} Lakh` : `${(n / 100_000).toFixed(1)} Lakh`)

/**
 * THE ONE RULE FOR "UNDER ₹N LAKH": the asking price is LESS THAN the figure.
 * A car priced exactly ₹5,00,000 is not under ₹5 lakh, so it is on the
 * under-7-lakh page and not the under-5-lakh one. The pages used to pick cars
 * with "at most" and then call the list "under", and printed "priced from
 * ₹3,80,000 to ₹5,00,000" beneath an "Under ₹5 Lakh" heading.
 *
 * Everything that says "under" uses this function or the same comparison: the
 * landing pages, the counts beside budget links (lib/seo/links.ts and the
 * homepage), the homepage search's budget options, and /inventory?budget=N
 * (app/inventory/page.tsx).
 */
export function underBudget(v: { price: number | null }, ceilingRupees: number): boolean {
  return v.price !== null && v.price < ceilingRupees
}

function list(items: string[], conj = 'and'): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  return `${items.slice(0, -1).join(', ')} ${conj} ${items[items.length - 1]}`
}

/** "₹3,80,000 to ₹19,80,000", or one figure when every car costs the same. */
function priceSummary(vs: InventoryVehicle[]): string {
  const prices = vs.map((v) => v.price).filter((n): n is number => n !== null)
  if (prices.length === 0) return ''
  const lo = Math.min(...prices)
  const hi = Math.max(...prices)
  return lo === hi ? formatINR(lo) : `${formatINR(lo)} to ${formatINR(hi)}`
}

/** "priced from A to B" for a range, "priced at A" for a single figure. */
function pricedPhrase(range: string): string {
  if (!range) return ''
  return range.includes(' to ') ? `priced from ${range}` : `priced at ${range}`
}

/**
 * Search results cut a title at roughly 60 characters, and the layout appends
 * " | AM Group" (11) to every title. The first candidate that fits is used, so
 * the count is dropped before the name is.
 */
const TITLE_BUDGET = 49
function fitTitle(...candidates: string[]): string {
  return candidates.find((c) => c.length <= TITLE_BUDGET) ?? candidates[candidates.length - 1]
}

/** "SUV" -> "SUVs", "Hatchback" -> "Hatchbacks". The label keeps its own casing. */
function pluralBody(label: string): string {
  return /s$/i.test(label) ? label : `${label}s`
}

/** "2016 to 2023", or "2021" when every car shares a year. */
function yearSummary(vs: InventoryVehicle[]): string {
  const years = vs.map((v) => v.year).filter((y): y is number => y !== null)
  if (years.length === 0) return ''
  const lo = Math.min(...years)
  const hi = Math.max(...years)
  return lo === hi ? String(lo) : `${lo} to ${hi}`
}

const SITE_COUNT = LOCATIONS.length

function commonFaqs(scope: string, vs: InventoryVehicle[]): FaqItem[] {
  const prices = vs.map((v) => v.price).filter((n): n is number => n !== null)
  return [
    ...(prices.length
      ? [{
          question: `What is the price range for ${scope}?`,
          answer:
            (new Set(prices).size === 1
              ? `The asking price today is ${priceSummary(vs)}. `
              : `Current stock is ${pricedPhrase(priceSummary(vs))}. `) +
            `Every price shown is the asking price; registration transfer and insurance are quoted separately.`,
        }]
      : []),
    {
      question: `Can I test drive before buying?`,
      answer:
        `Yes. Send an enquiry from the car's page or call ${PRIMARY_LOCATION.phone}. Test drives are arranged at ` +
        `our Jammu locations (${locationNames()}) at no charge and with no obligation. Bring a valid driving licence.`,
    },
    {
      question: 'Is finance available?',
      answer:
        'Yes. We can help arrange finance. You are free to arrange finance elsewhere.',
    },
    {
      question: 'Will you take my existing car in part-exchange?',
      answer:
        `Yes. Bring it to any of our ${SITE_COUNT} ${CITY} sites (${locationNames()}) and we will value it, then offset ` +
        'that against whichever car you are buying. Bring the RC, insurance and service records if you have them.',
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
  /** The facet value exactly as it appears in stock, for looking a page up. */
  value: string
  /** Optional second label, e.g. the make for a model page. */
  make?: string
  ceiling?: number
}

/** A spec with its cars, and where search engines should index them. */
interface ResolvedSpec extends SlugSpec {
  vehicles: InventoryVehicle[]
  canonicalPath: string
  indexable: boolean
}

const pathOf = (slug: string) => `/used-cars/${slug}`
const brandPath = (make: string) => `/brands/${slugify(make)}`

/** Two pages show the same cars when these keys are equal. */
const idKey = (vs: InventoryVehicle[]) =>
  vs
    .map((v) => v.id)
    .sort((a, b) => a - b)
    .join(',')

/**
 * When two pages list exactly the same cars, the one further up this list is
 * the page that gets indexed. A make page beats a model page (a make with one
 * model in stock is one page, not two), and a model page beats a body, fuel,
 * gearbox or budget page, because "used Hyundai Alcazar in Jammu" is a search
 * people make and "used premium SUV in Jammu" for the same single car is not.
 */
const CANONICAL_ORDER: LandingKind[] = ['model', 'body', 'fuel', 'transmission', 'budget']

function modelSlug(make: string | null, model: string): string {
  const base = make ? `${slugify(make)}-${slugify(model)}` : slugify(model)
  return `${base}-in-${CITY.toLowerCase()}`
}

async function buildCatalogue(): Promise<{ specs: ResolvedSpec[]; vehicles: InventoryVehicle[] }> {
  const { vehicles, facets, total } = await getInventory()
  const specs: SlugSpec[] = []

  // Cities — Jammu only; see SERVICE_CITY_SLUGS.
  for (const slug of SERVICE_CITY_SLUGS) {
    specs.push({
      kind: 'city',
      slug,
      label: slug.charAt(0).toUpperCase() + slug.slice(1),
      value: slug,
      match: () => true, // every car in stock is in Jammu
    })
  }

  // Budget bands. Skipped when the band would return everything (a duplicate of
  // the city page) or nothing. "Under" is meant literally: see underBudget.
  for (const ceiling of BUDGET_CEILINGS) {
    const count = vehicles.filter((v) => underBudget(v, ceiling)).length
    if (count === 0 || count === total) continue
    specs.push({
      kind: 'budget',
      slug: `under-${ceiling / 100_000}-lakh-in-${CITY.toLowerCase()}`,
      label: lakh(ceiling),
      value: String(ceiling / 100_000),
      ceiling,
      match: (v) => underBudget(v, ceiling),
    })
  }

  // Models — the highest-intent local query shape after brand.
  for (const model of facets.models) {
    const matching = vehicles.filter((v) => v.model === model.value)
    const make = matching[0]?.make ?? null
    specs.push({
      kind: 'model',
      slug: modelSlug(make, model.value),
      label: model.label,
      value: model.value,
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
      value: body.value,
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
      value: fuel.value,
      match: (v) => v.fuel === fuel.value,
    })
  }
  for (const tx of facets.transmissions) {
    if (tx.count === total) continue
    specs.push({
      kind: 'transmission',
      slug: `${slugify(tx.value)}-cars-in-${CITY.toLowerCase()}`,
      label: tx.label,
      value: tx.value,
      match: (v) => v.transmission === tx.value,
    })
  }

  // Deduplicate defensively — a model named the same as a body style would clash.
  const seen = new Set<string>()
  const unique = specs.filter((s) => (seen.has(s.slug) ? false : (seen.add(s.slug), true)))

  // Which page owns each distinct set of cars. Make pages (app/brands) are
  // seeded first, then the kinds in CANONICAL_ORDER; the first page to claim a
  // set keeps it and every later page with the same cars points at it.
  const owner = new Map<string, string>()
  for (const make of facets.makes) {
    owner.set(idKey(vehicles.filter((v) => v.make === make.value)), brandPath(make.value))
  }

  const resolved = new Map<string, ResolvedSpec>()
  for (const kind of CANONICAL_ORDER) {
    for (const spec of unique.filter((s) => s.kind === kind)) {
      const cars = vehicles.filter(spec.match)
      const key = idKey(cars)
      const self = pathOf(spec.slug)
      if (!owner.has(key)) owner.set(key, self)
      const canonicalPath = owner.get(key) ?? self
      resolved.set(spec.slug, {
        ...spec,
        vehicles: cars,
        canonicalPath,
        // A model page is worth indexing with one car: the model name is the
        // search. A body, fuel, gearbox or budget page with a single car is
        // that car's own page under a vaguer name, so it stays out of the index.
        indexable: canonicalPath === self && (kind === 'model' || cars.length >= 2),
      })
    }
  }

  return {
    vehicles,
    specs: unique.map(
      (spec) =>
        resolved.get(spec.slug) ?? {
          // The city page. Always its own canonical; with no cars at all it is
          // kept reachable but out of the index.
          ...spec,
          vehicles,
          canonicalPath: pathOf(spec.slug),
          indexable: vehicles.length > 0,
        },
    ),
  }
}

/**
 * The landing pages that belong in the sitemap, llms.txt and the link graph:
 * pages with stock behind them that are their own canonical. A page that only
 * repeats another page's cars, or a one-car body/fuel/budget page, still
 * resolves at its URL (old links and redirects point there) but is not listed.
 */
export async function getAllLandingSlugs(): Promise<{ slug: string; kind: LandingKind }[]> {
  const { specs } = await buildCatalogue()
  return specs.filter((s) => s.kind === 'city' || s.indexable).map(({ slug, kind }) => ({ slug, kind }))
}

/** Every slug that resolves today, indexed or not — for generateStaticParams. */
export async function getResolvableLandingSlugs(): Promise<string[]> {
  return (await buildCatalogue()).specs.map((s) => s.slug)
}

export interface LandingEntry {
  kind: LandingKind
  href: string
  /** Link text, e.g. "Used Hyundai Creta", "Under ₹5 Lakh", "Used SUVs". */
  label: string
  count: number
  /** Lowest asking price among the page's cars; null when none is priced. */
  priceFrom: number | null
}

function entryLabel(s: SlugSpec): string {
  switch (s.kind) {
    case 'city':
      return `Used Cars in ${s.label}`
    case 'budget':
      return `Under ₹${s.label}`
    case 'model':
      return `Used ${s.make ? `${s.make} ` : ''}${s.label}`
    case 'body':
      return `Used ${pluralBody(s.label)}`
    default:
      return `Used ${s.label} Cars`
  }
}

/** Every indexed landing page with its live count, for the /used-cars index. */
export async function getLandingDirectory(): Promise<LandingEntry[]> {
  const { specs } = await buildCatalogue()
  return specs
    .filter((s) => s.indexable)
    .map((s) => {
      const prices = s.vehicles.map((v) => v.price).filter((n): n is number => n !== null)
      return {
        kind: s.kind,
        href: s.canonicalPath,
        label: entryLabel(s),
        count: s.vehicles.length,
        priceFrom: prices.length ? Math.min(...prices) : null,
      }
    })
}

/* -------------------------------------------------------------------------- */
/* Facet -> page                                                               */
/* -------------------------------------------------------------------------- */

/** One way of narrowing the stock, as a homepage chip or a link names it. */
export type Facet =
  | { kind: 'make' | 'model' | 'body' | 'fuel' | 'transmission'; value: string }
  | { kind: 'budget'; lakhs: number }
  | { kind: 'city' }

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

/**
 * Returns a lookup from a facet to the page that should be linked for it, or
 * null when no such page exists today (the caller then falls back to the
 * /inventory filter URL, which works for a person but is not indexed).
 *
 * The href is the page's canonical: a "Premium SUV" chip whose one car is the
 * Hyundai Alcazar links to the Alcazar page, because that is the page that is
 * indexed for those cars.
 */
export async function getLandingHrefResolver(): Promise<(facet: Facet) => string | null> {
  const { specs, vehicles } = await buildCatalogue()
  return (facet) => {
    if (facet.kind === 'city') return pathOf(SERVICE_CITY_SLUGS[0])
    if (facet.kind === 'make') {
      const hit = vehicles.find((v) => v.make && same(v.make, facet.value))
      return hit?.make ? brandPath(hit.make) : null
    }
    const spec =
      facet.kind === 'budget'
        ? specs.find((s) => s.kind === 'budget' && s.ceiling === facet.lakhs * 100_000)
        : specs.find((s) => s.kind === facet.kind && same(s.value, facet.value))
    return spec ? spec.canonicalPath : null
  }
}

/* -------------------------------------------------------------------------- */
/* Models and makes that have sold out                                         */
/* -------------------------------------------------------------------------- */

/**
 * How long a model or make page stays in the index after its last car sold.
 * A judgment call, not a rule — the owner can change it.
 */
const SOLD_OUT_INDEX_DAYS = 90

interface SoldCar {
  make: string | null
  model: string | null
  soldAt: string
}

/**
 * Cars the dealer has marked sold. The public stock read (lib/inventory/server)
 * drops them, so this is a second, equally cached read of the same table. It
 * returns nothing — and the sold-out pages fall back to a 404 — when the stock
 * is still coming from WordPress or the database does not answer.
 */
const cachedSoldCars = unstable_cache(
  async (): Promise<SoldCar[]> => {
    const all = await readAllCars()
    if (all.state !== 'ok') return []
    return all.rows
      .filter((r) => r.status === 'sold')
      .map((r) => {
        // Through the same mapper as live stock, so names are spelt the same.
        const v = carRowToInventoryVehicle(r)
        return { make: v.make, model: v.model, soldAt: r.updated_at }
      })
  },
  ['used-cars-sold-v1'],
  { revalidate: 300, tags: [INVENTORY_CACHE_TAG] },
)

async function soldCars(): Promise<SoldCar[]> {
  try {
    return await cachedSoldCars()
  } catch {
    return []
  }
}

function soldRecently(soldAt: string | null): boolean {
  const t = soldAt ? Date.parse(soldAt) : Number.NaN
  return Number.isFinite(t) && Date.now() - t < SOLD_OUT_INDEX_DAYS * 86_400_000
}

const latest = (dates: string[]): string | null => (dates.length ? ([...dates].sort().at(-1) ?? null) : null)

/**
 * A make we have sold cars of and have none of today. Used by app/brands to
 * keep the page up with an honest "none in stock" state instead of a 404.
 * That page is never indexed: with none of the make in stock it has nothing of
 * its own to rank with.
 */
export async function resolveSoldOutBrand(slug: string): Promise<{ brandName: string; slug: string } | null> {
  const wanted = slugify(slug)
  const [{ vehicles }, sold] = await Promise.all([getInventory(), soldCars()])
  if (vehicles.some((v) => v.make && slugify(v.make) === wanted)) return null
  const brandName = sold.find((c) => c.make && slugify(c.make) === wanted)?.make
  return brandName ? { brandName, slug: wanted } : null
}

async function resolveSoldOutModel(slug: string): Promise<Landing | null> {
  const [{ vehicles }, sold] = await Promise.all([getInventory(), soldCars()])
  const hits = sold.filter((c) => c.model && modelSlug(c.make, c.model) === slug)
  const model = hits[0]?.model
  if (!model) return null

  const make = hits[0].make
  const name = make ? `${make} ${model}` : model
  const related = make ? vehicles.filter((v) => v.make === make) : []
  const sameMake = related.length
  const phone = PRIMARY_LOCATION.phone

  return {
    kind: 'model',
    slug,
    cityName: CITY,
    vehicles: [],
    related,
    soldOut: true,
    canonicalPath: pathOf(slug),
    // Useful only while there is something to send the reader on to, and only
    // for a while: a page about a car we last had a year ago is not an answer.
    indexable: sameMake > 0 && soldRecently(latest(hits.map((h) => h.soldAt))),
    crumb: `Used ${name}`,
    heading: `Used ${name} in ${CITY}`,
    title: fitTitle(`Used ${name} in ${CITY} | None in Stock Today`, `Used ${name} in ${CITY}`),
    description:
      `No used ${name} is in stock at AM Group in ${CITY} today. Tell us you are looking for one and we will ` +
      `call you when one arrives` +
      `${sameMake ? `, or see the ${sameMake} used ${make} ${sameMake === 1 ? 'car' : 'cars'} in stock now` : ''}.`,
    stockHeading: sameMake ? `Used ${make} cars in stock today` : '',
    intro: [
      `We have no used ${name} in stock in ${CITY} today. The last one we listed has been sold.`,
      `Tell us you are looking for a ${model} and we will call you when one arrives. ` +
        `You can also ring ${phone} and ask what is due in.`,
    ],
    sections: [],
    faqs: [
      {
        question: `Do you have a used ${name} in stock in ${CITY}?`,
        answer:
          `Not today. The last ${model} we listed has been sold. Send an enquiry from this page or call ${phone} ` +
          `and we will call you when one arrives.`,
      },
      ...(sameMake
        ? [
            {
              question: `Which used ${make} cars do you have instead?`,
              answer:
                `${sameMake} used ${make} ${sameMake === 1 ? 'car is' : 'cars are'} in stock right now: ` +
                `${list([...new Set(related.map((v) => v.model).filter(Boolean))] as string[])}. They are listed on this page.`,
            },
          ]
        : []),
    ],
  }
}

/* -------------------------------------------------------------------------- */
/* Resolver                                                                    */
/* -------------------------------------------------------------------------- */

/** "An SUV", "An MPV", "A Hatchback" — the initialisms are read letter by letter. */
function withArticle(label: string): string {
  return `${/^(suv|mpv|muv)\b/i.test(label) || /^[aeiou]/i.test(label) ? 'An' : 'A'} ${label}`
}

export async function resolveLanding(slug: string): Promise<Landing | null> {
  const wanted = slug.toLowerCase()
  const { specs } = await buildCatalogue()
  const spec = specs.find((s) => s.slug === wanted)
  // No stock behind this slug. A model we used to have keeps its page, with
  // an honest "none today" state; anything else is a 404.
  if (!spec) return resolveSoldOutModel(wanted)

  const vehicles = spec.vehicles
  // A facet page with nothing behind it is a thin page and 404s. The city page
  // is different: it is the redirect target of the old site's strongest URL,
  // so it must keep resolving when the feed is briefly empty. The route marks
  // it noindex while it has no cars.
  if (vehicles.length === 0 && spec.kind !== 'city') return null

  const n = vehicles.length
  const makes = [...new Set(vehicles.map((v) => v.make).filter(Boolean))] as string[]
  const range = priceSummary(vehicles)
  const priced = pricedPhrase(range)
  const years = vehicles.map((v) => v.year).filter((y): y is number => y !== null)
  const yearSpan = yearSummary(vehicles)
  const yearsPhrase = yearSpan ? `${yearSpan.includes(' to ') ? 'with model years' : 'model year'} ${yearSpan}` : ''
  const cars = n === 1 ? 'car' : 'cars'

  const base = {
    kind: spec.kind,
    slug: spec.slug,
    vehicles,
    cityName: CITY,
    canonicalPath: spec.canonicalPath,
    indexable: spec.indexable,
    soldOut: false,
    related: [] as InventoryVehicle[],
  }

  switch (spec.kind) {
    case 'city': {
      const city = spec.label
      if (n === 0) {
        return {
          ...base,
          cityName: city,
          crumb: `Used Cars in ${city}`,
          heading: `Used Cars in ${city}`,
          title: `Used Cars in ${city} | Second Hand Cars for Sale`,
          description:
            `Buy second hand cars in ${city} from AM Group. Call ${PRIMARY_LOCATION.phone} for the cars in stock today.`,
          stockHeading: `Used cars in stock in ${city}`,
          intro: [
            `Our stock list for ${city} is being updated. Call ${PRIMARY_LOCATION.phone} and we will tell you ` +
              `which used cars are available today at our ${SITE_COUNT} ${city} locations: ${locationNames()}.`,
          ],
          sections: [],
          faqs: commonFaqs(`used cars in ${city}`, vehicles),
        }
      }
      return {
        ...base,
        cityName: city,
        crumb: `Used Cars in ${city}`,
        heading: `Used Cars in ${city} — ${n} Second Hand ${n === 1 ? 'Car' : 'Cars'} in Stock`,
        title: fitTitle(
          `Used Cars in ${city} | ${n} Second Hand ${n === 1 ? 'Car' : 'Cars'} for Sale`,
          `Used Cars in ${city} | Second Hand Cars for Sale`,
        ),
        description:
          `Buy second hand cars in ${city} from AM Group. ${n} ${cars} in stock` +
          `${makes.length ? ` — ${list(makes)}` : ''}${range ? `, ${priced}` : ''}. ` +
          `Real photos, odometer readings, finance and exchange.`,
        stockHeading: `${n} used ${cars} in stock in ${city} today`,
        intro: [
          `AM Group has ${n} used ${cars} for sale in ${city} right now` +
            `${range ? `, ${priced}` : ''}` +
            `${yearsPhrase ? `, ${yearsPhrase}` : ''}` +
            `${makes.length ? `. Makes in stock: ${list(makes)}` : ''}.`,
          `The cars are kept at our ${SITE_COUNT} ${city} locations — ${locationNames()}. ` +
            `Call ${PRIMARY_LOCATION.phone} before you travel and we will tell you which site a car is at.`,
          `Every car is photographed as it stands, and each listing shows its odometer reading.`,
        ],
        sections: [
          {
            heading: `Buying a second hand car in ${city}`,
            body:
              `Driving around ${city} means stop-start town traffic and then long climbs on the national highway, ` +
              `so mechanical condition and a clear history matter more than the badge. Ask for the service ` +
              `records, drive the car up an incline, and bring your own mechanic if you like.`,
          },
          {
            heading: 'Paperwork, finance and exchange',
            body:
              `We handle the RC transfer and insurance transfer, and can help arrange finance. ` +
              `If you are exchanging your present car, bring it with its RC and insurance and we ` +
              `will value it.`,
          },
        ],
        faqs: [
          {
            question: `How many used cars are available in ${city}?`,
            answer: `${n} used ${cars} ${n === 1 ? 'is' : 'are'} in stock right now${makes.length ? `, across ${list(makes)}` : ''}. This page shows live stock.`,
          },
          {
            question: `Where can I see used cars in ${city}?`,
            answer:
              `At our ${SITE_COUNT} ${city} locations: ${locationNames()}. Call ${PRIMARY_LOCATION.phone} first ` +
              `and we will confirm which site the car you want is at.`,
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
        heading: `Used Cars Under ₹${label} in ${CITY} — ${n} in Stock`,
        title: fitTitle(
          `Used Cars Under ₹${label} in ${CITY} | ${n} in Stock`,
          `Used Cars Under ₹${label} in ${CITY}`,
        ),
        description:
          `${n} second hand ${cars} under ₹${label} for sale in ${CITY}` +
          `${makes.length ? ` — ${list(makes)}` : ''}. Real photos, odometer readings, finance and exchange at AM Group.`,
        stockHeading: `${n} used ${cars} under ₹${label} in stock today`,
        intro: [
          `We have ${n} used ${cars} under ₹${label} in ${CITY} right now` +
            `${range ? `, ${priced}` : ''}` +
            `${yearsPhrase ? `, ${yearsPhrase}` : ''}` +
            `${makes.length ? `. Makes in this budget: ${list(makes)}` : ''}.`,
          `Every price shown is the asking price for that car. Registration transfer and insurance are quoted ` +
            `separately, before you commit.`,
        ],
        sections: [
          {
            heading: `What ₹${label} buys you in ${CITY}`,
            body:
              `At this budget the sensible priority is condition and service history over badge or trim level. ` +
              `A well-kept car one segment down will usually cost you less over three years than a tired example ` +
              `of something more prestigious. Ask us which of the cars on this page has the fuller service history.`,
          },
          {
            heading: 'Costs beyond the sticker price',
            body:
              `Budget for RC transfer, fresh insurance, and any servicing the car is due. Ask for these figures ` +
              `along with the price so you can compare cars on the full amount.`,
          },
        ],
        faqs: [
          {
            question: `How many used cars under ₹${label} are available in ${CITY}?`,
            answer: `${n} ${n === 1 ? 'car is' : 'cars are'} currently in stock under ₹${label} at AM Group in ${CITY}. This page updates as cars are sold or added.`,
          },
          ...(makes.length
            ? [
                {
                  question: `Which brands are available under ₹${label}?`,
                  answer: `Within this budget we currently stock ${list(makes)}.`,
                },
              ]
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
        title: fitTitle(`Used ${name} in ${CITY} | ${n} in Stock`, `Used ${name} in ${CITY}`),
        description:
          `${n} second hand ${name} for sale in ${CITY}${range ? `, ${priced}` : ''}. ` +
          `Real photos, odometer readings, finance and exchange at AM Group.`,
        stockHeading: `${n} used ${name} in stock today`,
        intro: [
          `We have ${n} used ${name} ${cars} for sale in ${CITY} right now` +
            `${range ? `, ${priced}` : ''}` +
            `${yearsPhrase ? `, ${yearsPhrase}` : ''}.`,
          `Each ${spec.label} below is a car in our stock — the photographs are of that car, and the ` +
            `odometer reading is shown on each listing.`,
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
            heading: `Before you pay for a used ${spec.label}`,
            body:
              `Check when the next scheduled service is due and what the tyres and battery have left in them — ` +
              `a ${spec.label} close to a major service interval costs more in its first year than the price suggests. ` +
              `Confirm the RC, insurance and pollution certificate are in order, and ask us for the transfer costs.`,
          },
        ],
        faqs: [
          {
            question: `How many used ${name} cars are available in ${CITY}?`,
            answer: `${n} ${n === 1 ? 'is' : 'are'} in stock right now at AM Group in ${CITY}${range ? `, ${priced}` : ''}.`,
          },
          ...(years.length
            ? [
                {
                  question: `Which model years of the ${spec.label} do you have?`,
                  answer: `Currently ${yearSpan}. Each listing shows its exact year and kilometres.`,
                },
              ]
            : []),
          ...commonFaqs(`a used ${name}`, vehicles),
        ],
      }
    }

    case 'body':
    case 'fuel':
    case 'transmission': {
      // "SUVs" / "petrol cars" in running text. A body style keeps its own
      // casing (SUV, MPV); a fuel or gearbox is an ordinary word.
      const plural = spec.kind === 'body' ? pluralBody(spec.label) : `${spec.label.toLowerCase()} cars`
      const singular = spec.kind === 'body' ? spec.label : `${spec.label.toLowerCase()} car`
      const thing = n === 1 ? singular : plural
      const nounTitle = spec.kind === 'body' ? `Used ${pluralBody(spec.label)}` : `Used ${spec.label} Cars`
      return {
        ...base,
        crumb: nounTitle,
        heading: `${nounTitle} in ${CITY} — ${n} in Stock`,
        title: fitTitle(`${nounTitle} in ${CITY} | ${n} in Stock`, `${nounTitle} in ${CITY}`),
        description:
          `${n} second hand ${thing} for sale in ${CITY}` +
          `${range ? `, ${priced}` : ''}. Real photos, odometer readings, finance and exchange at AM Group.`,
        stockHeading: `${n} used ${thing} in stock today`,
        intro: [
          `We have ${n} used ${thing} in stock in ${CITY} right now` +
            `${range ? `, ${priced}` : ''}` +
            `${yearsPhrase ? `, ${yearsPhrase}` : ''}` +
            `${makes.length ? `. ${makes.length === 1 ? 'Make' : 'Makes'}: ${list(makes)}` : ''}.`,
          `Every listing below is a car in our stock, with its own photographs and its odometer reading.`,
        ],
        sections: [
          {
            heading: `Why buyers in ${CITY} choose ${plural}`,
            body:
              spec.kind === 'body'
                ? `${withArticle(spec.label)} suits the mix of town driving and highway running that most journeys ` +
                  `around ${CITY} involve. Ground clearance and load space matter here more than they would in a flatter city.`
                : spec.kind === 'fuel'
                  ? fuelNote(spec.label, CITY)
                  : `${spec.label} transmissions take the effort out of stop-start traffic, which is most of what ` +
                    `driving in ${CITY} involves on a weekday.`,
          },
          {
            // No sentence about cars being checked before listing: nothing on
            // record describes such a check. These two services are the ones
            // lib/locations.ts lists.
            heading: 'Paperwork and finance',
            body: `We handle the RC transfer and insurance transfer, and can help arrange finance.`,
          },
        ],
        faqs: [
          {
            question: `How many used ${plural} do you have in ${CITY}?`,
            answer: `${n} in stock right now${makes.length ? `, across ${list(makes)}` : ''}.`,
          },
          ...commonFaqs(`used ${plural}`, vehicles),
        ],
      }
    }
  }
}

function fuelNote(label: string, city: string): string {
  const fuel = label.toLowerCase()
  if (fuel === 'petrol')
    return `Petrol suits buyers whose running is mostly in and around ${city}, where the lower purchase price ` +
      `usually outweighs the difference in fuel economy.`
  if (fuel === 'diesel')
    return `Diesel suits buyers who cover long distances on the highway out of ${city}, where the better fuel ` +
      `economy pays back the higher purchase price.`
  return `${label} cars are listed here whenever one is in stock. Ask us about running costs and, for an ` +
    `electric car, the battery condition, before you decide.`
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
