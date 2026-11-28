"use client"

import { linkPhones } from "@/components/system/phone-text"
import { AutoEnquiry } from "@/components/modals/auto-enquiry"
import { siteCountWord } from "@/lib/seo/locations"
import React, { useCallback, useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CloseGlyph, SearchGlyph } from "@/components/system/marks"
import { Button } from "@/components/ui/button"
import { GROUP_ORIGIN } from "@/app/locations/about-facts"
import { LOCATIONS, PRIMARY_LOCATION } from "@/lib/locations"
import { Input, Select } from "@/components/ui/field"
import { VehicleCard } from "@/components/ui/vehicle-card"
import { InventoryFilters } from "@/components/ui/inventory-filters"
import { countActiveFilters, EMPTY_FILTERS } from "@/store/use-inventory-store"
import type { InventoryFilterState, SortKey } from "@/store/use-inventory-store"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import { FeaturedSpotlight } from "@/components/sections/featured-spotlight"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { FaqSection } from "@/components/seo/faq-section"
import type { FaqItem } from "@/components/seo/faq-section"
import { FrequentSearches } from "@/components/seo/frequent-searches"
import { Pagination } from "@/components/seo/pagination"
import type { SeoLink, SeoLinkGroup } from "@/lib/seo/links"
import type { ListingCopy } from "@/lib/seo/content"
import type { InventoryFacets, InventoryVehicle } from "@/lib/inventory/types"
import { pushEvent } from "@/lib/analytics/gtm"
import {
  listItems,
  trackFilter,
  trackFilterReset,
  trackSearchResults,
  trackSort,
} from "@/lib/analytics/events"
import { ListView } from "@/components/analytics/list-view"

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Recently listed" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "year-desc", label: "Year: newest first" },
  { value: "year-asc", label: "Year: oldest first" },
  { value: "mileage-asc", label: "KMs: lowest first" },
]

/** Maps a filter key onto the query-string parameter the server reads. */
const PARAM_FOR: Partial<Record<keyof InventoryFilterState, string>> = {
  make: "make",
  model: "model",
  bodyType: "bodyType",
  fuel: "fuel",
  transmission: "transmission",
  condition: "condition",
  colour: "colour",
}

export default function InventoryClient({
  vehicles,
  allVehiclesCount,
  matchedCount,
  facets,
  spotlight,
  degraded,
  initialFilters,
  initialSearch,
  sort,
  page,
  totalPages,
  pageSize,
  searchParams,
  copy,
  faqs,
  frequentSearches,
  isFiltered,
}: {
  vehicles: InventoryVehicle[]
  allVehiclesCount: number
  matchedCount: number
  facets: InventoryFacets
  spotlight: InventoryVehicle[]
  degraded: boolean
  initialFilters: Partial<InventoryFilterState>
  initialSearch: string
  sort: SortKey
  page: number
  totalPages: number
  pageSize: number
  searchParams: Record<string, string | string[] | undefined>
  copy: ListingCopy
  faqs: FaqItem[]
  frequentSearches: SeoLink[]
  /** True when the URL narrows or reorders the list; decided on the server. */
  isFiltered: boolean
  /**
   * Not rendered here. Still accepted because app/inventory/page.tsx passes it;
   * drop it from both sides together.
   */
  seoGroups?: SeoLinkGroup[]
}) {
  const router = useRouter()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [viewType, setViewType] = useState<"grid" | "list">("grid")
  const [searchDraft, setSearchDraft] = useState(initialSearch)
  const { onOpen } = useEnquiryModal()

  // Filters live in the URL, not component state. That is what lets the server
  // render — and a crawler read — a filtered, paginated page.
  const filters: InventoryFilterState = useMemo(
    () => ({ ...EMPTY_FILTERS, ...initialFilters }),
    [initialFilters],
  )

  // A filter, chip or sort change REPLACES the address instead of adding a
  // history entry, and keeps the scroll position: ten filter taps used to be
  // ten presses of Back to leave the page. A typed search is a new view, so
  // it still adds an entry (`mode: "push"`).
  const pushParams = useCallback(
    (patch: Record<string, string | null>, mode: "replace" | "push" = "replace") => {
      const params = new URLSearchParams()
      for (const [k, v] of Object.entries(searchParams)) {
        if (v === undefined) continue
        params.set(k, Array.isArray(v) ? (v[0] ?? "") : v)
      }
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === "") params.delete(k)
        else params.set(k, v)
      }
      params.delete("page") // any filter change returns to page 1
      const qs = params.toString()
      const href = qs ? `/inventory?${qs}` : "/inventory"
      startTransition(() => (mode === "push" ? router.push(href) : router.replace(href, { scroll: false })))
    },
    [router, searchParams],
  )

  const setFilter = useCallback(
    <K extends keyof InventoryFilterState>(key: K, value: InventoryFilterState[K]) => {
      // Measurement only. It is here and not in toggleFilter, which calls this,
      // so one change is one event. The number of matching cars is not sent:
      // it is not known until the server has answered.
      trackFilter(key, Array.isArray(value) ? value.join("-") : ((value as string | null) ?? ""), {
        activeFilterCount: countActiveFilters({ ...filters, [key]: value }),
      })
      const param = PARAM_FOR[key]
      if (param) {
        pushParams({ [param]: (value as string) || null })
        return
      }
      if (key === "priceRange") {
        const r = value as [number, number] | null
        pushParams({
          priceMin: r ? String(r[0]) : null,
          priceMax: r ? String(r[1]) : null,
          budget: null,
        })
      } else if (key === "yearRange") {
        const r = value as [number, number] | null
        pushParams({ year: r ? String(r[0]) : null })
      } else if (key === "mileageRange") {
        const r = value as [number, number] | null
        pushParams({ kmsMax: r ? String(r[1]) : null })
      }
    },
    [pushParams, filters],
  )

  const toggleFilter = useCallback(
    (key: keyof InventoryFilterState, value: string) => {
      const current = filters[key]
      setFilter(key, (current === value ? "" : value) as never)
    },
    [filters, setFilter],
  )

  const resetFilters = useCallback(() => {
    trackFilterReset()
    startTransition(() => router.replace("/inventory", { scroll: false }))
  }, [router])

  // The results of a typed search, once the server has rendered them: the
  // term and how many cars matched. A search that matched nothing is also
  // reported under its own name, because it says what stock people wanted.
  useEffect(() => {
    if (initialSearch) trackSearchResults(initialSearch, matchedCount)
  }, [initialSearch, matchedCount])

  const activeCount = countActiveFilters(filters)

  const makeTabs = useMemo(
    () => [{ value: "", label: "All", count: allVehiclesCount }, ...facets.makes],
    [facets.makes, allVehiclesCount],
  )

  const activeChips = useMemo(() => {
    const chips: { label: string; clear: () => void }[] = []
    const simple: [keyof InventoryFilterState, string][] = [
      ["make", "Make"], ["model", "Model"], ["bodyType", "Body"], ["fuel", "Fuel"],
      ["transmission", "Transmission"], ["condition", "Condition"], ["colour", "Colour"],
    ]
    for (const [key, label] of simple) {
      const value = filters[key]
      if (typeof value === "string" && value) {
        chips.push({ label: `${label}: ${value}`, clear: () => setFilter(key, "" as never) })
      }
    }
    if (filters.priceRange) {
      chips.push({
        label: `Price: ₹${filters.priceRange[0].toLocaleString("en-IN")} – ₹${filters.priceRange[1].toLocaleString("en-IN")}`,
        clear: () => setFilter("priceRange", null),
      })
    }
    if (filters.yearRange) {
      const [a, b] = filters.yearRange
      chips.push({ label: `Year: ${a === b ? a : `${a}–${b}`}`, clear: () => setFilter("yearRange", null) })
    }
    if (filters.mileageRange) {
      chips.push({
        label: `Under ${filters.mileageRange[1].toLocaleString("en-IN")} km`,
        clear: () => setFilter("mileageRange", null),
      })
    }
    if (initialSearch) {
      chips.push({
        label: `Search: ${initialSearch}`,
        clear: () => { setSearchDraft(""); pushParams({ q: null }) },
      })
    }
    return chips
  }, [filters, setFilter, initialSearch, pushParams])

  const buildPageHref = useCallback(
    (target: number) => {
      const params = new URLSearchParams()
      for (const [k, v] of Object.entries(searchParams)) {
        if (k === "page" || v === undefined) continue
        params.set(k, Array.isArray(v) ? (v[0] ?? "") : v)
      }
      if (target > 1) params.set("page", String(target))
      const qs = params.toString()
      return qs ? `/inventory?${qs}` : "/inventory"
    },
    [searchParams],
  )

  // The same five facets, in the same order, as the title built in page.tsx,
  // so "5 Used Automatic Cars in Stock" is both the title and the heading.
  const headingScope = [filters.make, filters.model, filters.bodyType, filters.fuel, filters.transmission]
    .filter(Boolean)
    .join(" ")

  /* One control, two homes: in the sticky row from md up, below it on phones. */
  const sortSelect = (
    <Select
      value={sort}
      onChange={(e) => {
        trackSort(e.target.value)
        pushParams({ sort: e.target.value === "recent" ? null : e.target.value })
      }}
      aria-label="Sort cars"
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </Select>
  )

  const locationNames = LOCATIONS.map((l) => l.shortName)
  const locationList =
    locationNames.length > 1
      ? `${locationNames.slice(0, -1).join("; ")} and ${locationNames[locationNames.length - 1]}`
      : locationNames[0]

  return (
    <div className="min-h-screen bg-ground text-ink">
      {/* Opens the enquiry form once, a few seconds after landing. */}
      <AutoEnquiry />
      <Breadcrumbs items={[{ label: "Used Cars in Jammu" }]} />

      {/* The H1 carries the search this page is for: "used cars in Jammu" and
          "second hand cars" (see HEAD_PATH in lib/seo/landing.ts). A filtered
          view names its filter instead. */}
      <section className="container mx-auto px-4 md:px-8 pt-2 pb-8">
        <h1 className="font-display text-h1 text-ink mb-1">
          {isFiltered
            ? `${matchedCount > 0 ? `${matchedCount} ` : ""}Used ${headingScope ? `${headingScope} ` : ""}Cars in Stock`
            : `Used Cars in Jammu${matchedCount > 0 ? ` — ${matchedCount} Second Hand ${matchedCount === 1 ? "Car" : "Cars"} in Stock` : ""}`}
        </h1>
      </section>

      {spotlight.length > 0 && <FeaturedSpotlight vehicles={spotlight} isListingPage />}

      {/* STICKY BAR — one row, flush under the fixed nav (h-16, md:h-20).
          z-30 keeps it under the nav (z-50) and the nav's open sheet. On a
          phone it is search + Filters only, about 56px; everything else in the
          toolbar scrolls away with the page. No shadow: the hairline is enough,
          and --shadow-raised is reserved for things that actually float. */}
      <section
        aria-label="Search and filter cars"
        className="sticky top-16 z-30 bg-surface border-b border-line"
      >
        <div className="container mx-auto flex items-center gap-2 px-4 py-1.5 md:gap-3 md:px-8 md:py-3">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (searchDraft.trim()) {
                  // Zero-result searches are customers telling you what stock
                  // to buy — the single most actionable event on this page.
                  pushEvent("search", {
                    search_term: searchDraft.trim(),
                    active_filter_count: activeCount,
                    page_type: "inventory",
                  })
                }
                pushParams({ q: searchDraft || null }, "push")
              }}
              role="search"
              className="relative min-w-0 flex-1 md:max-w-md"
            >
              <SearchGlyph className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
              <Input
                type="search"
                aria-label="Search cars"
                enterKeyHint="search"
                placeholder={
                  facets.makes.length > 0
                    ? `Search ${facets.makes.slice(0, 2).map((m) => m.label).join(", ")}…`
                    : "Search cars…"
                }
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                // 16px on phones: iOS Safari zooms the whole page when a
                // focused input is smaller than that, and does not zoom back.
                className="pl-10 max-md:text-(length:--text-h4)"
              />
            </form>

            <div className="hidden md:block md:ml-auto md:w-56">{sortSelect}</div>

            <Button type="button" variant="secondary" onClick={() => setIsFilterOpen(true)} className="shrink-0">
              <span>Filters</span>
              {activeCount > 0 && (
                <span className="h-5 min-w-5 px-1 rounded-sm bg-accent text-on-accent text-meta flex items-center justify-center" data-num>
                  {activeCount}
                </span>
              )}
            </Button>

            <div className="hidden md:flex shrink-0 items-center overflow-hidden rounded-sm border border-line bg-surface" role="group" aria-label="View type">
              <button type="button" onClick={() => setViewType("grid")} aria-label="Grid view" aria-pressed={viewType === "grid"}
                className={`h-11 px-4 text-button transition-colors duration-(--duration-1) cursor-pointer ${viewType === "grid" ? "bg-deep text-on-deep" : "text-ink-2 hover:bg-ground-2 hover:text-ink"}`}>
                Grid
              </button>
              <button type="button" onClick={() => setViewType("list")} aria-label="List view" aria-pressed={viewType === "list"}
                className={`h-11 px-4 text-button transition-colors duration-(--duration-1) cursor-pointer ${viewType === "list" ? "bg-deep text-on-deep" : "text-ink-2 hover:bg-ground-2 hover:text-ink"}`}>
                List
              </button>
            </div>
        </div>
      </section>

      {/* Scrolls away with the page: make chips, the phone's sort control, and
          whichever filters are active. */}
      <section className="bg-surface border-b border-line">
        <div className="container mx-auto px-4 md:px-8 py-3">
            <div
              role="region"
              tabIndex={0}
              aria-label="Filter by make"
              className="-mx-4 flex items-center gap-1.5 overflow-x-auto overscroll-x-contain px-4 md:mx-0 md:px-0 no-scrollbar"
            >
              {makeTabs.map((tab) => (
                <button
                  key={tab.value || "all"}
                  type="button"
                  onClick={() => setFilter("make", tab.value)}
                  aria-pressed={filters.make === tab.value}
                  className={`h-11 px-4 rounded-sm border text-button transition-colors duration-(--duration-1) cursor-pointer whitespace-nowrap ${
                    filters.make === tab.value
                      ? "bg-deep border-deep text-on-deep"
                      : "bg-surface border-line text-ink-2 hover:bg-ground-2 hover:text-ink"
                  }`}
                >
                  {tab.label}
                  <span className="ml-1.5 opacity-60" data-num>{tab.count}</span>
                </button>
              ))}
            </div>

            <div className="mt-3 md:hidden">{sortSelect}</div>

          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-line">
              {activeChips.map((chip) => (
                <button key={chip.label} type="button" onClick={chip.clear}
                  className="inline-flex min-h-11 items-center gap-1.5 px-3 rounded-sm border border-line bg-surface text-meta uppercase text-ink hover:bg-ground-2 transition-colors duration-(--duration-1) cursor-pointer">
                  {chip.label}
                  <CloseGlyph />
                </button>
              ))}
              <button type="button" onClick={resetFilters}
                className="inline-flex min-h-11 items-center px-2 text-meta uppercase text-accent-text-light hover:underline cursor-pointer ml-1">
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* RESULTS */}
      <section className="py-12 md:py-16 bg-ground">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-line">
            <div>
              <h2 className="font-display text-h2 text-ink">Cars in stock</h2>
              <p className="text-small text-ink-2" data-num>
                {allVehiclesCount === 0
                  ? "Inventory is temporarily unavailable"
                  : `Showing ${vehicles.length} of ${matchedCount} matching cars${matchedCount !== allVehiclesCount ? ` (${allVehiclesCount} in stock)` : ""}`}
              </p>
            </div>
            {isPending && (
              <span className="text-meta uppercase text-ink-3">Updating…</span>
            )}
          </div>

          {degraded || allVehiclesCount === 0 ? (
            <div className="bg-surface border border-line p-12 text-center max-w-md mx-auto my-12">
              <h3 className="font-display text-h3 text-ink mb-2">Inventory temporarily unavailable</h3>
              <p className="text-body text-ink-2 mb-6">
                We could not load live stock just now. Please try again shortly, or call us on{" "}
                <a href={`tel:${PRIMARY_LOCATION.phoneE164}`} data-track-location="inventory-degraded" className="font-semibold text-accent underline underline-offset-4" data-num>{PRIMARY_LOCATION.phone}</a>.
              </p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="bg-surface border border-line p-12 text-center max-w-md mx-auto my-12">
              <h3 className="font-display text-h3 text-ink mb-2">No cars match these filters</h3>
              <p className="text-body text-ink-2 mb-6">
                We currently stock {facets.makes.map((m) => m.label).join(", ")}. Try widening your search.
              </p>
              <Button type="button" variant="primary" onClick={resetFilters}>
                Reset All Filters
              </Button>
            </div>
          ) : (
            <>
              {/* Reports the cars shown as a list, again whenever a filter
                  changes them, and names the list for a click on a card. */}
              <ListView listId="inventory" listName="All used cars" items={listItems(vehicles)} />
              <div
                data-track-list="inventory"
                data-track-list-name="All used cars"
                className={viewType === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "flex flex-col gap-6"}
              >
                {vehicles.map((vehicle, idx) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    index={idx}
                    onEnquire={(v) => onOpen(v, { intent: "Vehicle Enquiry", sourceLabel: "listing-card" })}
                    viewType={viewType}
                  />
                ))}
              </div>

              <Pagination
                page={page}
                totalPages={totalPages}
                buildHref={buildPageHref}
                totalItems={matchedCount}
                pageSize={pageSize}
              />
            </>
          )}
        </div>
      </section>

      {/* INTRO COPY — after listing so buyers see cars first */}
      {copy.intro.length > 0 && (
        <section className="bg-ground-2 border-t border-line">
          <div className="container mx-auto px-4 md:px-8 py-10 max-w-5xl">
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
              {/* Accent rule */}
              <div aria-hidden className="hidden md:block w-1 self-stretch bg-accent shrink-0" />
              <div className="space-y-3">
                {copy.intro.map((p, i) => (
                  <p key={i} className={
                    i === 0
                      ? "text-body-lg font-semibold text-ink"
                      : "text-body text-ink-2"
                  }>{linkPhones(p, "inventory-text")}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* LONG-FORM CONTENT */}
      <section className="py-16 bg-surface border-t border-line">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl space-y-10">
          {copy.outro.map((block) => (
            <article key={block.heading}>
              <h2 className="font-display text-h2 text-ink mb-3">{block.heading}</h2>
              <p className="text-body text-ink-2">{linkPhones(block.body, "inventory-text")}</p>
            </article>
          ))}
        </div>
      </section>

      <FaqSection
        items={faqs}
        intro="Answers to the questions we are asked most often about buying a used car from AM Group Jammu."
      />

      {/* VALUE PROPS */}
      <section className="py-16 bg-ground-2 border-t border-line">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="font-display text-h2 text-ink mb-8 max-w-3xl">
            Buying from AM Group
          </h2>

          {/* Three facts a buyer can check, not three adjectives. */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="rounded-md border border-line bg-surface p-6 md:p-8">
              {/* The one wording of what 1968 is, shared with the homepage,
                  /locations and llms.txt (app/locations/about-facts.ts): the
                  year the group started, in fuel, not the year it began
                  selling cars. */}
              <h3 className="font-display text-h3 text-ink mb-2">Part of AM Group</h3>
              <p className="text-body text-ink-2">
                {GROUP_ORIGIN} You buy from a dealer you can walk in and meet, not from a stranger
                in a classified ad.
              </p>
            </div>

            <div className="rounded-md border border-line bg-surface p-6 md:p-8">
              <h3 className="font-display text-h3 text-ink mb-2">
                {siteCountWord().replace(/^./, (c) => c.toUpperCase())} used-car locations in Jammu
              </h3>
              <p className="text-body text-ink-2">
                {locationList}. Call before you come and we will tell you which location the
                car is at.
              </p>
              <a
                href={`tel:${PRIMARY_LOCATION.phoneE164}`}
                data-track-location="inventory-facts"
                className="mt-2 inline-flex min-h-11 items-center text-body font-semibold text-accent-text-light underline underline-offset-4"
                data-num
              >
                Call {PRIMARY_LOCATION.phone}
              </a>
            </div>

            <div className="rounded-md border border-line bg-surface p-6 md:p-8">
              <h3 className="font-display text-h3 text-ink mb-2">Paperwork done in-house</h3>
              <p className="text-body text-ink-2">
                Our own team handles the RC transfer and the insurance transfer, and helps with
                the loan application if you are financing the car.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FrequentSearches searches={frequentSearches} />

      <InventoryFilters
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        facets={facets}
        resultCount={matchedCount}
        filters={filters}
        onToggleFilter={toggleFilter}
        onSetFilter={setFilter}
        onReset={resetFilters}
      />
    </div>
  )
}
