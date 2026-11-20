import { fitDescription } from "@/lib/seo/site"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import InventoryClient from "./inventory-client"
import { getInventory } from "@/lib/inventory/server"
import { formatINRShort } from "@/lib/inventory/adapter"
import { applyInventoryQuery, filtersFromSearchParams, toCardVehicle } from "@/lib/inventory/filter"
import { EMPTY_FILTERS } from "@/store/use-inventory-store"
import type { SortKey } from "@/store/use-inventory-store"
import { buildListingCopy, buildListingFaqs } from "@/lib/seo/content"
import { getFrequentSearches } from "@/lib/seo/links"
import { generateVehicleListSchema, jsonLdString } from "@/lib/seo-schemas"
import { pageSocial, shareImageFrom } from "@/lib/seo/site"

/**
 * THE STOCK BROWSER: every car in stock, with search, filters and sorting.
 *
 * It is not the "used cars in Jammu" page. That is /used-cars/jammu, and the
 * homepage is the dealer's own page. Three pages used to carry near-identical
 * titles and headings for that one search and competed with each other, so
 * this one is titled for what it is: all the cars, to filter.
 *
 * WHY IT IS RENDERED PER REQUEST. Filters, search, sort and page number arrive
 * as query parameters, and reading `searchParams` makes a route dynamic in this
 * Next version (docs: 03-file-conventions/page.md, "searchParams is a
 * Request-time API"). Serving it static would mean either filtering in the
 * browser, which takes filtered views out of the server HTML, or switching the
 * whole app to Cache Components, which is a project-wide change. The stock
 * read behind it is cached, so a request costs a render, not a database query.
 */

/** Large enough that today's whole stock is in the first page's HTML. */
export const PAGE_SIZE = 24

type SearchParams = Record<string, string | string[] | undefined>

type Props = {
  searchParams: Promise<SearchParams>
}

const one = (sp: SearchParams, k: string): string => {
  const v = sp[k]
  return (Array.isArray(v) ? v[0] : v) ?? ""
}

/** Rebuild the current query string with a different page number. */
export function buildPageHref(sp: SearchParams, page: number): string {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(sp)) {
    if (k === "page" || v === undefined) continue
    params.set(k, Array.isArray(v) ? (v[0] ?? "") : v)
  }
  if (page > 1) params.set("page", String(page))
  const qs = params.toString()
  return qs ? `/inventory?${qs}` : "/inventory"
}

/**
 * Every parameter that narrows or reorders the list, including the aliases
 * lib/inventory/filter.ts accepts (`brand`, `body`, `type`). The aliases were
 * missing from this list, so /inventory?body=SUV was a filtered page that
 * search engines were allowed to index.
 */
const FILTER_PARAMS = [
  "make", "brand", "model", "bodyType", "body", "type", "fuel", "transmission", "condition",
  "colour", "priceMin", "priceMax", "budget", "year", "kmsMax", "q", "sort",
]

/** The request, reduced to what both the metadata and the page need. */
async function readQuery(sp: SearchParams) {
  const { vehicles, facets, degraded } = await getInventory()
  const initialFilters = filtersFromSearchParams(sp, vehicles)
  // ?budget=5 is what the homepage's "Under ₹5 lakh" option and budget links
  // send. "Under" means less than (lib/seo/landing.ts, underBudget), so the
  // top of the range stops one rupee short of the figure and a car priced at
  // exactly ₹5,00,000 is not in it, the same as on /used-cars/under-5-lakh-in-jammu.
  // An explicit priceMin/priceMax (the price slider) is left as the visitor set it.
  const budgetLakh = Number.parseFloat(one(sp, "budget"))
  const hasPriceBounds = [one(sp, "priceMin"), one(sp, "priceMax")].some((p) => Number.isFinite(Number.parseInt(p, 10)))
  if (Number.isFinite(budgetLakh) && budgetLakh > 0 && !hasPriceBounds) {
    initialFilters.priceRange = [0, budgetLakh * 100_000 - 1]
  }
  const filters = { ...EMPTY_FILTERS, ...initialFilters }
  const search = one(sp, "q")
  const sort = (one(sp, "sort") || "recent") as SortKey
  const matched = applyInventoryQuery(vehicles, filters, search, sort)
  const totalPages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE))
  // "?page=abc" and "?page=0" are page 1; a number past the end is no page.
  const page = Math.max(1, Number.parseInt(one(sp, "page") || "1", 10) || 1)
  // Filtered if a filter parameter is present (even one that matched nothing,
  // such as ?make=Chevrolet) or if anything was parsed into a filter.
  const isFiltered =
    FILTER_PARAMS.some((k) => one(sp, k) !== "") || Object.keys(initialFilters).length > 0
  return { vehicles, facets, degraded, initialFilters, filters, search, sort, matched, totalPages, page, isFiltered }
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { vehicles, facets, filters, matched, totalPages, page, isFiltered } = await readQuery(await searchParams)

  // A page number past the last page: the page itself answers 404.
  if (page > totalPages) return { title: "Page not found", robots: { index: false, follow: false } }

  // Describe the actual selection, so a filtered view does not carry the same
  // title as the unfiltered one.
  const scope = [filters.make, filters.model, filters.bodyType, filters.fuel, filters.transmission]
    .filter(Boolean)
    .join(" ")
  const suffix = page > 1 ? ` | Page ${page} of ${totalPages}` : ""
  const n = matched.length

  const title = isFiltered
    ? `${n > 0 ? `${n} ` : ""}Used ${scope ? `${scope} ` : ""}Cars in Stock${suffix}`
    : `All ${n > 0 ? `${n} ` : ""}Used Cars in Stock | Search and Filter${suffix}`

  const makes = facets.makes.map((m) => m.label).join(", ")
  const priceFrom = vehicles.length > 0 && facets.priceRange.max > 0 ? formatINRShort(facets.priceRange.min) : null
  // No "certified" and no "verified kilometres" here: both were claims about
  // every car, and the company has not said what either covers.
  const description =
    vehicles.length > 0
      ? fitDescription([
          `Browse ${isFiltered ? `${n}` : `all ${n}`} used ${scope ? `${scope} ` : ""}cars in stock at AM Group, Jammu` +
            `${!isFiltered && makes ? `: ${makes}` : ""}.`,
          priceFrom && !isFiltered && `Prices from ${priceFrom}.`,
          "Real photos and odometer readings.",
          "Filter by make, budget, fuel and gearbox.",
        ])
      : "Browse the used cars in stock at AM Group, Jammu. Real photos and odometer readings."

  const path = isFiltered || page <= 1 ? "/inventory" : `/inventory?page=${page}`

  return {
    title,
    description,
    // Faceted-navigation control.
    //
    // Make x model x body x fuel x year x price is hundreds of near-identical
    // URLs. Left indexable they compete with each other, split relevance and
    // burn crawl budget — and none of them can win anyway, because the title
    // and H1 never name the facet. The keyword-matched landing pages under
    // /used-cars/* are what should rank; these stay crawlable so Google can
    // still reach the listings, but out of the index.
    //
    // `follow` is deliberate: equity flows on to the vehicle pages.
    // The canonical is built from the page number alone. Passing the query
    // string through let ?fbclid= and ?utm_ links mint their own canonical URLs.
    alternates: { canonical: path },
    robots: isFiltered || page > 1 ? { index: false, follow: true } : { index: true, follow: true },
    ...pageSocial({ title, description, path, image: shareImageFrom(vehicles) }),
  }
}

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams
  const { vehicles, facets, degraded, initialFilters, search, sort, matched, totalPages, page, isFiltered } =
    await readQuery(sp)

  // "?page=99" of 3 used to render the last page under a "Page 99 of 3" title.
  if (page > totalPages) notFound()

  // Filtering, sorting and pagination all happen on the server so the cards for
  // this page are in the served HTML and every page is reachable by a crawler.
  // Each card is handed only the photos it can show; see toCardVehicle.
  const pageItems = matched.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // The spotlight shows one large photo and four small ones.
  const spotlight = [...vehicles]
    .sort((a, b) => b.images.length - a.images.length)
    .slice(0, 3)
    .map((v) => toCardVehicle(v, 5))

  const copy = buildListingCopy(facets, vehicles.length)
  const faqs = buildListingFaqs(facets, vehicles.length)
  const frequentSearches = await getFrequentSearches(40)

  // The list markup describes the one indexable view: unfiltered, page 1.
  // Filtered and later pages are kept out of the index, so they carry none.
  const jsonLd =
    !isFiltered && page === 1 && pageItems.length > 0
      ? generateVehicleListSchema({
          name: "All used cars in stock at AM Group, Jammu",
          description: copy.intro[0],
          path: "/inventory",
          vehicles: pageItems,
        })
      : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
        />
      )}
      <InventoryClient
        vehicles={pageItems.map((v) => toCardVehicle(v))}
        allVehiclesCount={vehicles.length}
        matchedCount={matched.length}
        facets={facets}
        spotlight={spotlight}
        degraded={degraded}
        initialFilters={initialFilters}
        initialSearch={search}
        sort={sort}
        page={page}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        searchParams={sp}
        copy={copy}
        faqs={faqs}
        frequentSearches={frequentSearches}
        isFiltered={isFiltered}
      />
    </>
  )
}
