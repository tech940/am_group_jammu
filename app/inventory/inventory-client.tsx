"use client"

import React, { useCallback, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, SlidersHorizontal, Grid, List, ShieldCheck, Award, Zap, Car, X, ArrowUpDown, CloudOff } from "lucide-react"
import { VehicleCard } from "@/components/ui/vehicle-card"
import { InventoryFilters } from "@/components/ui/inventory-filters"
import { countActiveFilters, EMPTY_FILTERS } from "@/store/use-inventory-store"
import type { InventoryFilterState, SortKey } from "@/store/use-inventory-store"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import { FeaturedSpotlight } from "@/components/sections/featured-spotlight"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { FaqSection } from "@/components/seo/faq-section"
import type { FaqItem } from "@/components/seo/faq-section"
import { FrequentSearches, SeoLinkDirectory } from "@/components/seo/frequent-searches"
import { Pagination } from "@/components/seo/pagination"
import type { SeoLink, SeoLinkGroup } from "@/lib/seo/links"
import type { ListingCopy } from "@/lib/seo/content"
import type { InventoryFacets, InventoryVehicle } from "@/lib/inventory/types"
import { pushEvent } from "@/lib/analytics/gtm"

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
  seoGroups,
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
  seoGroups: SeoLinkGroup[]
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

  const pushParams = useCallback(
    (patch: Record<string, string | null>) => {
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
      startTransition(() => router.push(qs ? `/inventory?${qs}` : "/inventory"))
    },
    [router, searchParams],
  )

  const setFilter = useCallback(
    <K extends keyof InventoryFilterState>(key: K, value: InventoryFilterState[K]) => {
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
    [pushParams],
  )

  const toggleFilter = useCallback(
    (key: keyof InventoryFilterState, value: string) => {
      const current = filters[key]
      setFilter(key, (current === value ? "" : value) as never)
    },
    [filters, setFilter],
  )

  const resetFilters = useCallback(() => {
    startTransition(() => router.push("/inventory"))
  }, [router])

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

  const headingScope = [filters.make, filters.model, filters.bodyType].filter(Boolean).join(" ")

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-black">
      <Breadcrumbs items={[{ label: "Used Cars in Jammu" }]} />

      {/* H1 + intro copy. The page previously opened straight into a gallery
          with almost no readable text for a crawler to index. */}
      <section className="container mx-auto px-4 md:px-8 pt-2 pb-8">
        <h1 className="text-3xl md:text-4xl font-black text-[#023468] mb-1">
          {matchedCount > 0
            ? `${matchedCount} Used ${headingScope ? `${headingScope} ` : ""}Cars for Sale in Jammu`
            : `Used ${headingScope ? `${headingScope} ` : ""}Cars for Sale in Jammu`}
        </h1>
      </section>

      {spotlight.length > 0 && <FeaturedSpotlight vehicles={spotlight} isListingPage />}

      {/* TOOLBAR */}
      <section className="sticky top-20 z-40 bg-white/95 backdrop-blur-md border-b border-black/10 py-4 shadow-sm">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
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
                pushParams({ q: searchDraft || null })
              }}
              className="relative flex-1 max-w-md"
            >
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
              <input
                type="search"
                aria-label="Search vehicles"
                placeholder={
                  facets.makes.length > 0
                    ? `Search ${facets.makes.slice(0, 3).map((m) => m.label).join(", ")}...`
                    : "Search vehicles..."
                }
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                className="w-full bg-zinc-100 border border-black/5 rounded-full pl-10 pr-4 py-2.5 text-xs font-bold text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[#023468]/20 focus:bg-white transition-all"
              />
            </form>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
              {makeTabs.map((tab) => (
                <button
                  key={tab.value || "all"}
                  onClick={() => setFilter("make", tab.value)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                    filters.make === tab.value
                      ? "bg-[#023468] text-white shadow-md"
                      : "bg-zinc-100 text-black/70 hover:bg-zinc-200 hover:text-black"
                  }`}
                >
                  {tab.label}
                  <span className="ml-1.5 opacity-50">{tab.count}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/40 pointer-events-none" />
                <select
                  value={sort}
                  onChange={(e) => pushParams({ sort: e.target.value === "recent" ? null : e.target.value })}
                  aria-label="Sort vehicles"
                  className="appearance-none bg-zinc-100 border border-black/5 rounded-full pl-9 pr-8 py-2 text-xs font-bold text-black/80 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#023468]/20"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setIsFilterOpen(true)}
                className="px-4 py-2 rounded-full bg-zinc-100 border border-black/5 text-xs font-bold text-black/80 hover:bg-[#023468] hover:text-white transition-all flex items-center gap-2 cursor-pointer"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Filters</span>
                {activeCount > 0 && (
                  <span className="h-4 min-w-4 px-1 rounded-full bg-[#E31837] text-white text-[9px] font-black flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </button>

              <div className="flex items-center bg-zinc-100 p-1 rounded-full border border-black/5">
                <button onClick={() => setViewType("grid")} aria-label="Grid view"
                  className={`p-1.5 rounded-full transition-all cursor-pointer ${viewType === "grid" ? "bg-white text-[#023468] shadow-sm" : "text-black/40 hover:text-black"}`}>
                  <Grid className="h-4 w-4" />
                </button>
                <button onClick={() => setViewType("list")} aria-label="List view"
                  className={`p-1.5 rounded-full transition-all cursor-pointer ${viewType === "list" ? "bg-white text-[#023468] shadow-sm" : "text-black/40 hover:text-black"}`}>
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-black/5">
              {activeChips.map((chip) => (
                <button key={chip.label} onClick={chip.clear}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#023468]/8 text-[#023468] text-[10px] font-black uppercase tracking-wider hover:bg-[#023468]/15 transition-colors cursor-pointer">
                  {chip.label}
                  <X className="h-3 w-3" />
                </button>
              ))}
              <button onClick={resetFilters}
                className="text-[10px] font-black uppercase tracking-wider text-[#E31837] hover:underline cursor-pointer ml-1">
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* RESULTS */}
      <section className="py-12 md:py-16 bg-[#f8f9fa]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/5">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-[#023468]">Available Vehicles</h2>
              <p className="text-xs text-black/50 font-medium">
                {allVehiclesCount === 0
                  ? "Inventory is temporarily unavailable"
                  : `Showing ${vehicles.length} of ${matchedCount} matching cars${matchedCount !== allVehiclesCount ? ` (${allVehiclesCount} in stock)` : ""}`}
              </p>
            </div>
            {isPending && (
              <span className="text-[10px] font-black uppercase tracking-widest text-black/30">Updating…</span>
            )}
          </div>

          {degraded || allVehiclesCount === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-black/5 max-w-md mx-auto my-12 shadow-sm">
              <CloudOff className="h-12 w-12 text-black/25 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-black mb-2">Inventory temporarily unavailable</h3>
              <p className="text-xs text-black/60 mb-6">
                We could not load live stock just now. Please try again shortly, or call us on{" "}
                <a href="tel:+919419100000" className="font-bold text-[#023468]">+91 94191 00000</a>.
              </p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-black/5 max-w-md mx-auto my-12 shadow-sm">
              <Car className="h-12 w-12 text-black/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-black mb-2">No cars match these filters</h3>
              <p className="text-xs text-black/60 mb-6">
                We currently stock {facets.makes.map((m) => m.label).join(", ")}. Try widening your search.
              </p>
              <button onClick={resetFilters}
                className="bg-[#023468] text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-[#E31837] transition-all cursor-pointer">
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className={viewType === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "flex flex-col gap-6"}>
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
        <section className="bg-[#EBF0F8] border-t-2 border-[#023468]/10">
          <div className="container mx-auto px-4 md:px-8 py-10 max-w-5xl">
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
              {/* Accent bar */}
              <div className="hidden md:block w-1 self-stretch rounded-full bg-gradient-to-b from-[#023468] to-[#E31837] flex-shrink-0" />
              <div className="space-y-3">
                {copy.intro.map((p, i) => (
                  <p key={i} className={`leading-relaxed ${
                    i === 0
                      ? "text-base md:text-lg font-bold text-[#023468]"
                      : "text-sm md:text-[15px] text-black/65"
                  }`}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* LONG-FORM CONTENT */}
      <section className="py-16 bg-white border-t border-black/5">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl space-y-10">
          {copy.outro.map((block) => (
            <article key={block.heading}>
              <h2 className="text-xl md:text-2xl font-black text-[#023468] mb-3">{block.heading}</h2>
              <p className="text-sm md:text-[15px] text-black/60 leading-relaxed">{block.body}</p>
            </article>
          ))}
        </div>
      </section>

      <FaqSection
        items={faqs}
        intro="Answers to the questions we are asked most often about buying a used car from AM Group Jammu."
      />

      {/* VALUE PROPS */}
      <section className="py-16 bg-zinc-50 border-t border-black/5">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#023468] block mb-2">
              Why Buy From AM Group Jammu
            </span>
            <h2 className="text-3xl font-black text-[#023468]">
              Jammu &amp; Kashmir&apos;s Most Trusted Dealer
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: "Certified Pre-owned", body: "Every vehicle undergoes rigorous multi-point mechanical, structural, and electrical diagnostic checks." },
              { icon: Zap, title: "Instant Financing & Insurance", body: "Seamless loan approvals with leading nationalized & private banks at competitive interest rates." },
              { icon: Award, title: "55+ Years Regional Trust", body: "Serving customers across Jammu, Srinagar, Udhampur & Kathua since 1968." },
            ].map((c) => (
              <div key={c.title} className="p-8 rounded-3xl bg-white border border-black/5 text-left">
                <div className="h-10 w-10 bg-[#023468]/10 rounded-2xl flex items-center justify-center mb-4">
                  <c.icon className="h-5 w-5 text-[#023468]" />
                </div>
                <h3 className="text-lg font-bold text-[#023468] mb-2">{c.title}</h3>
                <p className="text-xs text-black/60 leading-relaxed">{c.body}</p>
              </div>
            ))}
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
