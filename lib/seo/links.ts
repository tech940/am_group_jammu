/**
 * Internal-link graph for SEO.
 *
 * Links prefer a real landing page (`/used-cars/hyundai-creta-in-jammu`) over a
 * raw filter URL (`/inventory?model=Creta`). The filter URL works for a human
 * but is `noindex` — it answers the query without ever naming it — so pointing
 * internal links at it would push equity into a page that cannot rank.
 *
 * Every link is generated from stock that exists, so the site never advertises
 * a facet that returns nothing.
 *
 * Cities are deliberately limited to the four locations AM Group actually
 * serves. Spinning up "used cars in <every city in India>" pages that all
 * render the same Jammu stock is the doorway-page pattern Google penalises.
 */

import { getInventory } from '../inventory/server.ts'
import { formatINRShort, slugify } from '../inventory/adapter.ts'
import { getAllLandingSlugs, SERVICE_CITY_SLUGS } from './landing.ts'

export interface SeoLink {
  label: string
  href: string
  count?: number
}

export interface SeoLinkGroup {
  title: string
  links: SeoLink[]
}

export const SERVICE_CITIES = SERVICE_CITY_SLUGS.map((slug) => ({
  slug,
  label: slug.charAt(0).toUpperCase() + slug.slice(1),
}))

const CITY = 'jammu'

/** Resolve to a landing page when one was generated, else the filter URL. */
function link(
  valid: Set<string>,
  landingSlug: string,
  fallbackHref: string,
  label: string,
  count?: number,
): SeoLink {
  return {
    label,
    count,
    href: valid.has(landingSlug) ? `/used-cars/${landingSlug}` : fallbackHref,
  }
}

export interface SeoLinks {
  groups: SeoLinkGroup[]
  all: SeoLink[]
  total: number
  makes: SeoLink[]
  models: SeoLink[]
  bodyTypes: SeoLink[]
  cities: SeoLink[]
}

export async function getSeoLinks(): Promise<SeoLinks> {
  const [{ facets, total, vehicles }, slugs] = await Promise.all([
    getInventory(),
    getAllLandingSlugs(),
  ])
  const valid = new Set(slugs.map((s) => s.slug))

  const makeOf = (model: string) => vehicles.find((v) => v.model === model)?.make ?? null

  // Brands keep their dedicated /brands/<make> pages.
  const makes: SeoLink[] = facets.makes.map((m) => ({
    label: `Used ${m.label} Cars`,
    href: `/brands/${slugify(m.value)}`,
    count: m.count,
  }))

  const models: SeoLink[] = facets.models.slice(0, 14).map((m) => {
    const make = makeOf(m.value)
    const slug = `${make ? `${slugify(make)}-` : ''}${slugify(m.value)}-in-${CITY}`
    return link(valid, slug, `/inventory?model=${encodeURIComponent(m.value)}`, m.label, m.count)
  })

  const bodyTypes: SeoLink[] = facets.bodyTypes.map((b) =>
    link(valid, `${slugify(b.value)}-in-${CITY}`, `/inventory?bodyType=${encodeURIComponent(b.value)}`, b.label, b.count),
  )

  const fuels: SeoLink[] = facets.fuels.map((f) =>
    link(valid, `${slugify(f.value)}-cars-in-${CITY}`, `/inventory?fuel=${encodeURIComponent(f.value)}`, `${f.label} Cars`, f.count),
  )

  const transmissions: SeoLink[] = facets.transmissions.map((t) =>
    link(valid, `${slugify(t.value)}-cars-in-${CITY}`, `/inventory?transmission=${encodeURIComponent(t.value)}`, `${t.label} Cars`, t.count),
  )

  // Budget bands come straight from the generated landing slugs, so the labels
  // and the pages can never drift apart.
  const budgets: SeoLink[] = slugs
    .filter((s) => s.kind === 'budget')
    .map((s) => {
      const lakhs = s.slug.match(/^under-([\d.]+)-lakh/)?.[1] ?? ''
      const ceiling = Number(lakhs) * 100_000
      return {
        label: `Under ₹${lakhs} Lakh`,
        href: `/used-cars/${s.slug}`,
        count: vehicles.filter((v) => v.price !== null && v.price <= ceiling).length,
      }
    })
    .sort((a, b) => (a.count ?? 0) - (b.count ?? 0))

  const years: SeoLink[] = facets.years.slice(0, 10).map((y) => ({
    label: `${y.label} Models`,
    href: `/inventory?year=${y.value}`,
    count: y.count,
  }))

  const cities: SeoLink[] = SERVICE_CITIES.map((c) => ({
    label: `Used Cars in ${c.label}`,
    href: `/used-cars/${c.slug}`,
  }))

  const groups: SeoLinkGroup[] = [
    { title: 'Used Cars by Brand', links: makes },
    { title: 'Used Cars by Model', links: models },
    { title: 'Used Cars by Budget', links: budgets },
    { title: 'Used Cars by City', links: cities },
    { title: 'Used Cars by Body Type', links: bodyTypes },
    { title: 'Used Cars by Fuel', links: fuels },
    { title: 'Used Cars by Transmission', links: transmissions },
    { title: 'Used Cars by Year', links: years },
  ].filter((g) => g.links.length > 0)

  return {
    groups,
    all: groups.flatMap((g) => g.links),
    total,
    makes,
    models,
    bodyTypes,
    cities,
  }
}

/**
 * "Frequent searches" phrasing — long-tail combinations a buyer would type.
 * Combinations are only emitted when stock exists for both facets.
 */
export async function getFrequentSearches(limit = 40): Promise<SeoLink[]> {
  const [{ vehicles, facets }, slugs] = await Promise.all([getInventory(), getAllLandingSlugs()])
  const valid = new Set(slugs.map((s) => s.slug))
  const out: SeoLink[] = []
  const seen = new Set<string>()

  const push = (label: string, href: string) => {
    if (seen.has(href) || out.length >= limit) return
    seen.add(href)
    out.push({ label, href })
  }

  // Budget queries first — the highest-volume shape after brand.
  for (const s of slugs.filter((x) => x.kind === 'budget')) {
    const lakhs = s.slug.match(/^under-([\d.]+)-lakh/)?.[1] ?? ''
    push(`Used cars under ${lakhs} lakh in Jammu`, `/used-cars/${s.slug}`)
    push(`Second hand cars under ${lakhs} lakh Jammu`, `/used-cars/${s.slug}`)
  }

  // Model-level queries.
  for (const model of facets.models.slice(0, 10)) {
    const make = vehicles.find((v) => v.model === model.value)?.make ?? null
    const slug = `${make ? `${slugify(make)}-` : ''}${slugify(model.value)}-in-jammu`
    const href = valid.has(slug) ? `/used-cars/${slug}` : `/inventory?model=${encodeURIComponent(model.value)}`
    push(`Second hand ${make ? `${make} ` : ''}${model.label} in Jammu`, href)
  }

  // Brand queries.
  for (const make of facets.makes) {
    push(`Used ${make.label} cars in Jammu`, `/brands/${slugify(make.value)}`)
  }

  // Body / fuel / transmission.
  for (const b of facets.bodyTypes) {
    const slug = `${slugify(b.value)}-in-jammu`
    if (valid.has(slug)) push(`Used ${b.label} in Jammu`, `/used-cars/${slug}`)
  }
  for (const f of facets.fuels) {
    const slug = `${slugify(f.value)}-cars-in-jammu`
    if (valid.has(slug)) push(`${f.label} used cars in Jammu`, `/used-cars/${slug}`)
  }
  for (const t of facets.transmissions) {
    const slug = `${slugify(t.value)}-cars-in-jammu`
    if (valid.has(slug)) push(`${t.label} used cars in Jammu`, `/used-cars/${slug}`)
  }

  for (const city of SERVICE_CITIES) {
    push(`Second hand cars in ${city.label}`, `/used-cars/${city.slug}`)
  }

  return out
}

export { formatINRShort }
