"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Search, SlidersHorizontal, Grid, List, ShieldCheck, Award, Zap, Phone, User, Car, MapPin, CheckCircle2, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { VehicleCard } from "@/components/ui/vehicle-card"
import { InventoryFilters } from "@/components/ui/inventory-filters"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { useInventoryStore } from "@/store/use-inventory-store"
import { Vehicle, vehicles } from "@/lib/vehicle-data"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import { FeaturedSpotlight } from "@/components/sections/featured-spotlight"

export default function InventoryPage() {
  const [viewType, setViewType] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBrandTab, setSelectedBrandTab] = useState<string>("All")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Claim Offer Form State
  const [claimFormData, setClaimFormData] = useState({
    name: "",
    phone: "",
    model: "Hyundai Creta",
    location: "Jammu Main Branch"
  })
  const [isFormSubmitted, setIsFormSubmitted] = useState(false)

  const { onOpen } = useEnquiryModal()
  const { filters, setSearchQuery: setStoreSearchQuery } = useInventoryStore()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        vehicle.name.toLowerCase().includes(searchLower) ||
        vehicle.brand.toLowerCase().includes(searchLower) ||
        vehicle.type.toLowerCase().includes(searchLower)

      const matchesBrandTab =
        selectedBrandTab === "All"
          ? true
          : selectedBrandTab === "Electric/EV"
          ? vehicle.type.toLowerCase().includes("electric") || vehicle.type.toLowerCase().includes("ev")
          : vehicle.brand.toLowerCase() === selectedBrandTab.toLowerCase()

      const matchesStoreBrand = !filters.brand || vehicle.brand === filters.brand
      const matchesType = !filters.type || vehicle.type.toLowerCase().includes(filters.type.toLowerCase())
      const matchesFuel = !filters.fuel || vehicle.specs.engine?.toLowerCase().includes(filters.fuel.toLowerCase())

      return matchesSearch && matchesBrandTab && matchesStoreBrand && matchesType && matchesFuel
    })
  }, [searchQuery, selectedBrandTab, filters])

  const handleClaimOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!claimFormData.name || !claimFormData.phone) return
    setIsFormSubmitted(true)
  }

  const handleUnlock = (vehicle: Vehicle) => {
    onOpen(vehicle)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setStoreSearchQuery(query)
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-black">
      
      {/* FEATURED VEHICLE MULTI-ANGLE SPOTLIGHT GALLERY HERO */}
      <FeaturedSpotlight isListingPage />

      {/* SEARCH BAR & BRAND FILTER TOOLBAR */}
      <section className="sticky top-20 z-40 bg-white/95 backdrop-blur-md border-b border-black/10 py-4 shadow-sm">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
              <input
                type="text"
                placeholder="Search by vehicle name, brand (Hyundai, Tata, MG...)"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-zinc-100 border border-black/5 rounded-full pl-10 pr-4 py-2.5 text-xs font-bold text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[#023468]/20 focus:bg-white transition-all"
              />
            </div>

            {/* Brand Filter Pill Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {["All", "Hyundai", "Tata", "MG", "Kia", "Honda", "Electric/EV"].map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrandTab(brand)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer whitespace-nowrap ${
                    selectedBrandTab === brand
                      ? "bg-[#023468] text-white shadow-md"
                      : "bg-zinc-100 text-black/70 hover:bg-zinc-200 hover:text-black"
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>

            {/* View Switcher & Filter Trigger */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="px-4 py-2 rounded-full bg-zinc-100 border border-black/5 text-xs font-bold text-black/80 hover:bg-[#023468] hover:text-white transition-all flex items-center gap-2 cursor-pointer"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Filters</span>
              </button>

              <div className="flex items-center bg-zinc-100 p-1 rounded-full border border-black/5">
                <button
                  onClick={() => setViewType("grid")}
                  className={`p-1.5 rounded-full transition-all cursor-pointer ${
                    viewType === "grid" ? "bg-white text-[#023468] shadow-sm" : "text-black/40 hover:text-black"
                  }`}
                  aria-label="Grid view"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewType("list")}
                  className={`p-1.5 rounded-full transition-all cursor-pointer ${
                    viewType === "list" ? "bg-white text-[#023468] shadow-sm" : "text-black/40 hover:text-black"
                  }`}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* VEHICLES GRID SECTION */}
      <section className="py-12 md:py-16 bg-[#f8f9fa]">
        <div className="container mx-auto px-4 md:px-8">
          
          {/* Results Count Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/5">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-[#023468]">Available Vehicles</h2>
              <p className="text-xs text-black/50 font-medium">
                Showing {filteredVehicles.length} of {vehicles.length} premium models in Jammu & Kashmir
              </p>
            </div>
          </div>

          {/* Grid / List Display */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-black/5 max-w-md mx-auto my-12 shadow-sm">
              <Car className="h-12 w-12 text-black/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-black mb-2">No Vehicles Match Your Search</h3>
              <p className="text-xs text-black/60 mb-6">
                Try resetting your filters or searching for alternative models like Hyundai, Tata, or MG.
              </p>
              <button
                onClick={() => { setSearchQuery(""); setSelectedBrandTab("All"); }}
                className="bg-[#023468] text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-[#E31837] transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className={
              viewType === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                : "flex flex-col gap-6"
            }>
              {filteredVehicles.map((vehicle, idx) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  index={idx}
                  onUnlock={handleUnlock}
                  viewType={viewType}
                />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* BOTTOM VALUE PROPOSITION CARDS */}
      <section className="py-16 bg-white border-t border-black/5">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#023468] block mb-2">
              Why Buy From AM Group Jammu
            </span>
            <h2 className="text-3xl font-black text-[#023468]">
              Jammu & Kashmir&apos;s Most Trusted Dealer
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-zinc-50 border border-black/5 text-left">
              <div className="h-10 w-10 bg-[#023468]/10 rounded-2xl flex items-center justify-center mb-4">
                <ShieldCheck className="h-5 w-5 text-[#023468]" />
              </div>
              <h3 className="text-lg font-bold text-[#023468] mb-2">150-Point Quality Assurance</h3>
              <p className="text-xs text-black/60 leading-relaxed">
                Every vehicle undergoes rigorous multi-point mechanical, structural, and electrical diagnostic checks.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-zinc-50 border border-black/5 text-left">
              <div className="h-10 w-10 bg-[#023468]/10 rounded-2xl flex items-center justify-center mb-4">
                <Zap className="h-5 w-5 text-[#023468]" />
              </div>
              <h3 className="text-lg font-bold text-[#023468] mb-2">Instant Financing & Insurance</h3>
              <p className="text-xs text-black/60 leading-relaxed">
                Seamless loan approvals with leading nationalized & private banks at competitive interest rates.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-zinc-50 border border-black/5 text-left">
              <div className="h-10 w-10 bg-[#023468]/10 rounded-2xl flex items-center justify-center mb-4">
                <Award className="h-5 w-5 text-[#023468]" />
              </div>
              <h3 className="text-lg font-bold text-[#023468] mb-2">55+ Years Regional Trust</h3>
              <p className="text-xs text-black/60 leading-relaxed">
                Serving over 500,000+ satisfied vehicle owners across Jammu, Srinagar, Udhampur & Kathua since 1968.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INVENTORY FILTERS DRAWER */}
      <InventoryFilters isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />

    </div>
  )
}