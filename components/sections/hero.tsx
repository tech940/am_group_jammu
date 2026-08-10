"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ChevronRight, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import type { InventoryFacets, InventoryVehicle } from "@/lib/inventory/types"
import { formatINRShort } from "@/lib/inventory/adapter"

export function Hero({
  latest,
  facets,
  total,
}: {
  latest: InventoryVehicle[]
  facets: InventoryFacets
  total: number
}) {
  const router = useRouter()
  const { onOpen } = useEnquiryModal()

  // Search form state. Options below are built from live stock, so a search
  // can never land the user on an empty result set.
  const [make, setMake] = React.useState("")
  const [budget, setBudget] = React.useState("")
  const [bodyType, setBodyType] = React.useState("")

  const [activeSlideIdx, setActiveSlideIdx] = React.useState(0)

  // Slides are the newest listings that actually have photographs.
  const heroShowcaseItems = React.useMemo(
    () => latest.filter((v) => v.primaryImage).slice(0, 3),
    [latest],
  )

  const budgetBands = React.useMemo(() => {
    const { min, max } = facets.priceRange
    if (max <= min) return []
    const step = Math.ceil((max - min) / 3)
    return [0, 1, 2].map((i) => {
      const lo = i === 0 ? min : min + i * step
      const hi = i === 2 ? max : min + (i + 1) * step - 1
      return { value: `${lo}-${hi}`, label: `${formatINRShort(lo)} – ${formatINRShort(hi)}` }
    })
  }, [facets.priceRange])

  const currentShowcase = heroShowcaseItems[Math.min(activeSlideIdx, Math.max(0, heroShowcaseItems.length - 1))]

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (make) params.set("make", make)
    if (bodyType) params.set("bodyType", bodyType)
    if (budget) {
      const [lo, hi] = budget.split("-")
      params.set("priceMin", lo)
      params.set("priceMax", hi)
    }
    router.push(`/inventory${params.toString() ? `?${params}` : ""}`)
  }

  return (
    <section className="relative w-full min-h-[600px] sm:min-h-[660px] lg:min-h-[720px] bg-zinc-900 pt-24 md:pt-32 pb-16 overflow-hidden">
      
      {/* CLEAN, BRIGHT OUTDOOR BACKGROUND IMAGE */}
      <div className="absolute inset-0 z-0">
        <Image
          src={currentShowcase.primaryImage as string}
          alt={currentShowcase.title}
          fill
          priority
          quality={75}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
          className="object-cover object-center brightness-[0.98] contrast-[1.02]"
        />
        {/* Subtle bottom gradient only to ensure bottom ticker text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[500px]">
          
          {/* LEFT COLUMN: FLOATING SEARCH FORM CARD (Compulsory Form) */}
          <div className="lg:col-span-5 order-1">
            <div className="bg-white/95 backdrop-blur-md rounded-[28px] p-6 sm:p-8 shadow-2xl border border-black/10 text-left max-w-md mx-auto lg:mx-0">
              <h2 className="text-2xl sm:text-3xl font-black text-[#023468] mb-5 tracking-tight">
                Find your right car
              </h2>

              {/* Segmented Pill Tabs: New Car vs Used Car */}
              <p className="text-xs font-semibold text-black/50 mb-5">
                {total > 0
                  ? `${total} certified pre-owned cars in stock right now.`
                  : "Certified pre-owned cars in Jammu."}
              </p>

              {/* Form Input Controls */}
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                {facets.makes.length > 0 && (
                  <div>
                    <select
                      value={make}
                      onChange={(e) => setMake(e.target.value)}
                      aria-label="Select make"
                      className="w-full bg-zinc-50 border border-black/15 rounded-xl px-4 py-3.5 text-xs font-bold text-black focus:outline-none focus:border-[#023468] focus:bg-white"
                    >
                      <option value="">All Makes</option>
                      {facets.makes.map((m) => (
                        <option key={m.value} value={m.value}>{m.label} ({m.count})</option>
                      ))}
                    </select>
                  </div>
                )}

                {budgetBands.length > 0 && (
                  <div>
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      aria-label="Select budget"
                      className="w-full bg-zinc-50 border border-black/15 rounded-xl px-4 py-3.5 text-xs font-bold text-black focus:outline-none focus:border-[#023468] focus:bg-white"
                    >
                      <option value="">Any Budget</option>
                      {budgetBands.map((b) => (
                        <option key={b.value} value={b.value}>{b.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {facets.bodyTypes.length > 0 && (
                  <div>
                    <select
                      value={bodyType}
                      onChange={(e) => setBodyType(e.target.value)}
                      aria-label="Select body type"
                      className="w-full bg-zinc-50 border border-black/15 rounded-xl px-4 py-3.5 text-xs font-bold text-black focus:outline-none focus:border-[#023468] focus:bg-white"
                    >
                      <option value="">All Body Types</option>
                      {facets.bodyTypes.map((b) => (
                        <option key={b.value} value={b.value}>{b.label} ({b.count})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Main Action Button */}
                <button
                  type="submit"
                  className="w-full bg-[#E31837] hover:bg-[#023468] text-white font-extrabold text-xs uppercase tracking-widest py-4 rounded-xl shadow-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 group"
                >
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </button>
              </form>

              {/* Bottom Advanced Search Link */}
              <div className="mt-4 text-right">
                <Link
                  href="/inventory"
                  className="text-[11px] font-extrabold text-black/60 hover:text-[#023468] transition-colors inline-flex items-center gap-1"
                >
                  <span>Advanced Search</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: CLEAN SHOWCASE OVERLAY (Zero Black Blur Box) */}
          <div className="lg:col-span-7 order-2 text-left text-white pt-4 lg:pt-0">
            <div className="space-y-4 max-w-xl ml-auto">
              {/* Launched Pill Tag */}
              <span className="bg-[#E31837] text-white px-3.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest inline-block shadow-lg">
                {currentShowcase.condition ?? currentShowcase.bodyType ?? "In Stock"}
              </span>

              {/* Big Bold Display Headline with Crisp Shadow */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                {currentShowcase.year ? `${currentShowcase.year} ` : ""}{currentShowcase.title}
              </h1>

              {/* Real price and specs for this listing */}
              <div className="text-white font-medium text-xs sm:text-sm leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] max-w-lg">
                <span className="text-base sm:text-lg font-black">{currentShowcase.priceLabel}</span>
                {currentShowcase.originalPriceLabel && (
                  <span className="ml-2 line-through text-white/60">{currentShowcase.originalPriceLabel}</span>
                )}
                <span className="block mt-1">
                  {[currentShowcase.mileageLabel, currentShowcase.fuel, currentShowcase.transmission]
                    .filter(Boolean)
                    .join(" • ")}
                </span>
              </div>

              {/* Know More Action Button */}
              <div className="pt-2">
                <Link
                  href={`/inventory/${currentShowcase.slug}`}
                  className="bg-white text-[#023468] hover:bg-[#E31837] hover:text-white rounded-full px-8 py-3 font-extrabold text-xs uppercase tracking-widest shadow-2xl transition-all duration-300 cursor-pointer inline-flex items-center gap-2"
                >
                  <span>View This Car</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* BOTTOM SLIDER TICKER TABS (All in one line, scrollbar 100% hidden) */}
              <div className="pt-8 flex flex-nowrap items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden max-w-full">
                {heroShowcaseItems.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSlideIdx(idx)}
                    aria-label={`View ${item.title}`}
                    className={`text-left cursor-pointer pb-1.5 transition-all duration-300 border-b-2 flex-shrink-0 ${
                      activeSlideIdx === idx
                        ? "border-white text-white font-extrabold drop-shadow-md"
                        : "border-transparent text-white/70 hover:text-white font-medium"
                    }`}
                  >
                    <span className="text-xs sm:text-sm block whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {item.year ? `${item.year} ` : ""}{item.title}
                    </span>
                  </button>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

