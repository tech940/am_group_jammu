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
 * The only city page is Jammu, where all three used-car locations are.
 * Spinning up "used cars in <every city>" pages that all
 * render the same Jammu stock is the doorway-page pattern Google penalises.
 */

import { getInventory } from '../inventory/server.ts'
import { formatINRShort } from '../inventory/adapter.ts'
import { getAllLandingSlugs, getLandingHrefResolver, HEAD_PATH, SERVICE_CITY_SLUGS, underBudget } from './landing.ts'
import { LOCATIONS } from '../locations.ts'
import { locationHeading } from './locations.ts'

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

const filterUrl = (param: string, value: string) => `/inventory?${param}=${encodeURIComponent(value)}`

export interface SeoLinks {
  groups: SeoLinkGroup[]
  all: SeoLink[]
  total: number
  makes: SeoLink[]
  models: SeoLink[]
  bodyTypes: SeoLink[]
  budgets: SeoLink[]
  fuels: SeoLink[]
  transmissions: SeoLink[]
  cities: SeoLink[]
  /** One link per used-car location page. */
  locations: SeoLink[]
}

export async function getSeoLinks(): Promise<SeoLinks> {
  const cities: SeoLink[] = SERVICE_CITIES.map((c) => ({
    label: `Used Cars in ${c.label}`,
    href: HEAD_PATH,
  }))
  const locations: SeoLink[] = LOCATIONS.map((l) => ({
    label: locationHeading(l),
    href: `/locations/${l.slug}`,
  }))

  try {
    const [{ facets, total, vehicles }, slugs, landingHref] = await Promise.all([
      getInventory(),
      getAllLandingSlugs(),
      getLandingHrefResolver(),
    ])

    const makeOf = (model: string) => vehicles.find((v) => v.model === model)?.make ?? null

    // Every link goes to the indexable page for its facet when one exists
    // (lib/seo/landing.ts decides), and to the filter URL only when none does.

    // Brands keep their dedicated /brands/<make> pages.
    const makes: SeoLink[] = facets.makes.map((m) => ({
      label: `Used ${m.label} Cars`,
      href: landingHref({ kind: 'make', value: m.value }) ?? filterUrl('make', m.value),
      count: m.count,
    }))

    const models: SeoLink[] = facets.models.map((m) => {
      const make = makeOf(m.value)
      return {
        // "Hyundai Creta", not "Creta": the link text is what the page is about.
        label: make ? `${make} ${m.label}` : m.label,
        href: landingHref({ kind: 'model', value: m.value }) ?? filterUrl('model', m.value),
        count: m.count,
      }
    })

    const bodyTypes: SeoLink[] = facets.bodyTypes.map((b) => ({
      label: b.label,
      href: landingHref({ kind: 'body', value: b.value }) ?? filterUrl('bodyType', b.value),
      count: b.count,
    }))

    const fuels: SeoLink[] = facets.fuels.map((f) => ({
      label: `${f.label} Cars`,
      href: landingHref({ kind: 'fuel', value: f.value }) ?? filterUrl('fuel', f.value),
      count: f.count,
    }))

    const transmissions: SeoLink[] = facets.transmissions.map((t) => ({
      label: `${t.label} Cars`,
      href: landingHref({ kind: 'transmission', value: t.value }) ?? filterUrl('transmission', t.value),
      count: t.count,
    }))

    // Budget bands come straight from the generated landing slugs, so the labels
    // and the pages can never drift apart.
    const budgets: SeoLink[] = slugs
      .filter((s) => s.kind === 'budget')
      .map((s) => {
        const lakhs = s.slug.match(/^under-([\d.]+)-lakh/)?.[1] ?? ''
        const ceiling = Number(lakhs) * 100_000
        return {
          label: `Used cars under ${lakhs} lakh`,
          href: `/used-cars/${s.slug}`,
          // The same "less than" rule that picks the page's cars.
          count: vehicles.filter((v) => underBudget(v, ceiling)).length,
        }
      })
      .sort((a, b) => (a.count ?? 0) - (b.count ?? 0))

    // There is no "by year" group: a model year has no landing page, so those
    // links could only go to filter URLs, which are kept out of the index.
    const groups: SeoLinkGroup[] = [
      { title: 'Used Cars by Brand', links: makes },
      { title: 'Used Cars by Model', links: models },
      { title: 'Used Cars by Budget', links: budgets },
      { title: 'Used Cars by Location', links: [...cities, ...locations] },
      { title: 'Used Cars by Body Type', links: bodyTypes },
      { title: 'Used Cars by Fuel', links: fuels },
      { title: 'Used Cars by Transmission', links: transmissions },
    ].filter((g) => g.links.length > 0)

    return {
      groups,
      all: groups.flatMap((g) => g.links),
      total,
      makes,
      models,
      bodyTypes,
      budgets,
      fuels,
      transmissions,
      cities,
      locations,
    }
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err)
    console.warn(`[seo-links] link resolution degraded (${reason}); serving fallback location link graph`)
    return {
      groups: [{ title: 'Used Cars by Location', links: [...cities, ...locations] }],
      all: [...cities, ...locations],
      total: 0,
      makes: [],
      models: [],
      bodyTypes: [],
      budgets: [],
      fuels: [],
      transmissions: [],
      cities,
      locations,
    }
  }
}

/**
 * "Frequent searches" phrasing — long-tail combinations a buyer would type.
 * Combinations are only emitted when stock exists for both facets.
 */
export async function getFrequentSearches(limit = 40): Promise<SeoLink[]> {
  try {
    const [{ vehicles, facets }, slugs, landingHref] = await Promise.all([
      getInventory(),
      getAllLandingSlugs(),
      getLandingHrefResolver(),
    ])
    const out: SeoLink[] = []
    const seen = new Set<string>()

    // One link per page. A second phrasing of the same search pointing at the
    // same URL is dropped here, which is why each page is named once.
    const push = (label: string, href: string | null) => {
      if (!href || seen.has(href) || out.length >= limit) return
      seen.add(href)
      out.push({ label, href })
    }

    // The head term first.
    for (const city of SERVICE_CITIES) {
      push(`Used cars in ${city.label}`, HEAD_PATH)
    }

    // Budget queries — the highest-volume shape after brand.
    for (const s of slugs.filter((x) => x.kind === 'budget')) {
      const lakhs = s.slug.match(/^under-([\d.]+)-lakh/)?.[1] ?? ''
      push(`Used cars under ${lakhs} lakh in Jammu`, `/used-cars/${s.slug}`)
    }

    // Brand queries.
    for (const make of facets.makes) {
      push(`Used ${make.label} cars in Jammu`, landingHref({ kind: 'make', value: make.value }))
    }

    // Model-level queries. Only models with a page of their own: a filter URL
    // is not a destination worth naming in a list of searches.
    for (const model of facets.models) {
      const make = vehicles.find((v) => v.model === model.value)?.make ?? null
      push(
        `Second hand ${make ? `${make} ` : ''}${model.label} in Jammu`,
        landingHref({ kind: 'model', value: model.value }),
      )
    }

    // Body / fuel / transmission.
    for (const b of facets.bodyTypes) {
      push(`Used ${/s$/i.test(b.label) ? b.label : `${b.label}s`} in Jammu`, landingHref({ kind: 'body', value: b.value }))
    }
    for (const f of facets.fuels) {
      push(`${f.label} used cars in Jammu`, landingHref({ kind: 'fuel', value: f.value }))
    }
    for (const t of facets.transmissions) {
      push(`${t.label} used cars in Jammu`, landingHref({ kind: 'transmission', value: t.value }))
    }

    return out
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err)
    console.warn(`[frequent-searches] search resolution degraded (${reason}); serving city fallbacks`)
    return SERVICE_CITIES.map((c) => ({
      label: `Second hand cars in ${c.label}`,
      href: HEAD_PATH,
    }))
  }
}

export { formatINRShort }
