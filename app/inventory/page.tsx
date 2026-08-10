import type { Metadata } from "next"
import InventoryClient from "./inventory-client"
import { getInventory } from "@/lib/inventory/server"
import { formatINRShort } from "@/lib/inventory/adapter"
import { applyInventoryQuery, filtersFromSearchParams } from "@/lib/inventory/filter"
import { EMPTY_FILTERS } from "@/store/use-inventory-store"
import type { SortKey } from "@/store/use-inventory-store"
import { buildListingCopy, buildListingFaqs } from "@/lib/seo/content"
import { getFrequentSearches, getSeoLinks } from "@/lib/seo/links"

export const PAGE_SIZE = 9

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const one = (sp: Record<string, string | string[] | undefined>, k: string): string => {
  const v = sp[k]
  return (Array.isArray(v) ? v[0] : v) ?? ""
}

/** Rebuild the current query string with a different page number. */
export function buildPageHref(
  sp: Record<string, string | string[] | undefined>,
  page: number,
): string {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(sp)) {
    if (k === "page" || v === undefined) continue
    params.set(k, Array.isArray(v) ? (v[0] ?? "") : v)
  }
  if (page > 1) params.set("page", String(page))
  const qs = params.toString()
  return qs ? `/inventory?${qs}` : "/inventory"
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams
  const { vehicles, facets, total } = await getInventory()

  const filters = { ...EMPTY_FILTERS, ...filtersFromSearchParams(sp, vehicles) }
  const matched = applyInventoryQuery(vehicles, filters, one(sp, "q"), "recent")
  const page = Math.max(1, Number.parseInt(one(sp, "page") || "1", 10) || 1)
  const totalPages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE))

  const FILTER_PARAMS = [
    "make", "model", "bodyType", "fuel", "transmission", "condition", "colour",
    "priceMin", "priceMax", "budget", "year", "kmsMax", "q", "sort",
  ]
  const isFiltered = FILTER_PARAMS.some((k) => one(sp, k) !== "")

  // Describe the actual selection, so a filtered view does not carry the same
  // title as the unfiltered one.
  const bits = [filters.make, filters.model, filters.bodyType, filters.fuel, filters.transmission]
    .filter(Boolean)
    .join(" ")
  const scope = bits ? `${bits} ` : ""
  const suffix = page > 1 ? ` | Page ${page} of ${totalPages}` : ""

  const makes = facets.makes.map((m) => m.label).join(", ")
  const priceFrom = vehicles.length > 0 ? formatINRShort(facets.priceRange.min) : null

  return {
    title:
      matched.length > 0
        ? `${matched.length} Used ${scope}Cars for Sale in Jammu | Certified Pre-owned${suffix}`
        : `Used ${scope}Cars for Sale in Jammu | AM Group`,
    description:
      total > 0
        ? `Browse ${matched.length} certified used ${scope.toLowerCase()}cars in Jammu${makes ? ` — ${makes}` : ""}. ` +
          `${priceFrom ? `Prices from ${priceFrom}. ` : ""}Real photos, verified KMs, finance and exchange at AM Group.`
        : "Browse certified used cars for sale in Jammu at AM Group — real photos, verified KMs, and easy finance.",
    // Faceted-navigation control.
    //
    // Make x model x body x fuel x year x price is hundreds of near-identical
    // URLs. Left indexable they compete with each other, split relevance and
    // burn crawl budget — and none of them can win anyway, because the title
    // and H1 never name the facet ("16 Used Cars for Sale in Jammu" for a
    // ?priceMax=1000000 view). The keyword-matched landing pages under
    // /used-cars/* are what should rank; these stay crawlable so Google can
    // still reach the listings, but out of the index.
    //
    // `follow` is deliberate: equity flows on to the vehicle pages.
    alternates: { canonical: isFiltered ? "/inventory" : buildPageHref(sp, page) },
    robots: isFiltered || page > 1 ? { index: false, follow: true } : undefined,
  }
}

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams
  const { vehicles, facets, degraded } = await getInventory()

  const initialFilters = filtersFromSearchParams(sp, vehicles)
  const filters = { ...EMPTY_FILTERS, ...initialFilters }
  const search = one(sp, "q")
  const sort = (one(sp, "sort") || "recent") as SortKey

  // Filtering, sorting and pagination all happen on the server so the cards for
  // this page are in the served HTML and every page is reachable by a crawler.
  const matched = applyInventoryQuery(vehicles, filters, search, sort)
  const totalPages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE))
  const page = Math.min(Math.max(1, Number.parseInt(one(sp, "page") || "1", 10) || 1), totalPages)
  const pageItems = matched.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const spotlight = [...vehicles].sort((a, b) => b.images.length - a.images.length).slice(0, 3)

  const copy = buildListingCopy(facets, vehicles.length)
  const faqs = buildListingFaqs(facets, vehicles.length)
  const [frequentSearches, seoLinks] = await Promise.all([getFrequentSearches(40), getSeoLinks()])

  // ItemList so Google can read the listing grid as a product collection.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Used Cars for Sale in Jammu",
    description: copy.intro[0],
    url: `https://amgroupind.com${buildPageHref(sp, page)}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: matched.length,
      itemListElement: pageItems.map((v, i) => ({
        "@type": "ListItem",
        position: (page - 1) * PAGE_SIZE + i + 1,
        url: `https://amgroupind.com/inventory/${v.slug}`,
        name: `${v.year ?? ""} ${v.title}`.trim(),
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <InventoryClient
        vehicles={pageItems}
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
        seoGroups={seoLinks.groups}
      />
    </>
  )
}
