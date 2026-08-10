"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ImageOff, IndianRupee } from "lucide-react"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import type { InventoryVehicle } from "@/lib/inventory/types"

/**
 * Two discovery rails, both driven entirely by live stock:
 *   1. Browse by body style — tabs are the body types actually in stock.
 *   2. Most affordable — the lowest asking prices in stock.
 *
 * This section previously carried 24 hardcoded cars, including an "Electric
 * cars" panel. There is no EV in the current inventory, so advertising one
 * would send buyers to an empty result set; the panel is now a real
 * "biggest savings" rail instead.
 */

function CarTile({
  vehicle,
  onEnquire,
  badge,
}: {
  vehicle: InventoryVehicle
  onEnquire: (v: InventoryVehicle) => void
  badge?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-black/10 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
      <div>
        <Link href={`/inventory/${vehicle.slug}`} className="block">
          <div className="relative h-44 w-full bg-zinc-100 overflow-hidden">
            {badge}
            {vehicle.primaryImage ? (
              <Image
                src={vehicle.primaryImage}
                alt={vehicle.title}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-black/20">
                <ImageOff className="h-7 w-7" />
              </div>
            )}
          </div>
        </Link>

        <div className="p-4 text-left">
          <Link href={`/inventory/${vehicle.slug}`}>
            <h3 className="text-sm font-extrabold text-[#023468] mb-1 group-hover:text-[#E31837] transition-colors truncate">
              {vehicle.year ? `${vehicle.year} ` : ""}{vehicle.title}
            </h3>
          </Link>
          <p className="text-xs font-bold text-black/70">{vehicle.priceLabel}</p>
          <p className="text-[10px] font-semibold text-black/40 mt-1 truncate">
            {[vehicle.mileageLabel, vehicle.fuel, vehicle.transmission].filter(Boolean).join(" • ")}
          </p>
        </div>
      </div>

      <div className="p-4 pt-0">
        <button
          onClick={() => onEnquire(vehicle)}
          className="w-full border border-[#E31837] text-[#E31837] hover:bg-[#E31837] hover:text-white rounded-xl py-2.5 text-xs font-extrabold transition-all duration-300 text-center block cursor-pointer"
        >
          Get Best Price
        </button>
      </div>
    </div>
  )
}

export function SearchedAndElectricCars({
  byBodyType,
  bestValue,
}: {
  byBodyType: { label: string; slug: string; count: number; vehicles: InventoryVehicle[] }[]
  bestValue: InventoryVehicle[]
}) {
  const { onOpen } = useEnquiryModal()
  const [activeCategory, setActiveCategory] = React.useState(byBodyType[0]?.label ?? "")

  if (byBodyType.length === 0 && bestValue.length === 0) return null

  const activeGroup = byBodyType.find((g) => g.label === activeCategory) ?? byBodyType[0]

  return (
    <section className="py-12 md:py-16 bg-[#f8f9fa] border-t border-black/5">
      <div className="container mx-auto px-4 md:px-8 space-y-16">

        {/* RAIL 1 — browse by body style */}
        {activeGroup && (
          <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-black/10 shadow-sm text-left relative">
            <h2 className="text-2xl sm:text-3xl font-black text-[#023468] mb-4 tracking-tight">
              Browse cars in stock
            </h2>

            <div className="flex items-center space-x-6 border-b border-black/10 pb-2 mb-6 overflow-x-auto no-scrollbar">
              {byBodyType.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(cat.label)}
                  className={`text-xs font-extrabold uppercase tracking-wider pb-2 transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                    activeGroup.label === cat.label
                      ? "border-[#E31837] text-[#023468]"
                      : "border-transparent text-black/75 hover:text-black"
                  }`}
                >
                  {cat.label}
                  <span className="ml-1.5 text-[#023468] font-bold">({cat.count})</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {activeGroup.vehicles.slice(0, 4).map((vehicle) => (
                <CarTile key={vehicle.id} vehicle={vehicle} onEnquire={(v) => onOpen(v, { intent: "Vehicle Enquiry", sourceLabel: "home-rail" })} />
              ))}
            </div>

            <div className="mt-6 text-right">
              <Link
                href={`/inventory?bodyType=${encodeURIComponent(activeGroup.label)}`}
                className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-[#023468] hover:text-[#E31837] transition-colors"
              >
                View all {activeGroup.count} {activeGroup.label} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* RAIL 2 — cheapest stock */}
        {bestValue.length > 0 && (
          <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-black/10 shadow-sm text-left relative">
            <h2 className="text-2xl sm:text-3xl font-black text-[#023468] mb-1 tracking-tight">
              Most affordable in stock
            </h2>
            <p className="text-xs font-semibold text-black/50 mb-6">
              The lowest-priced certified cars available right now at AM Group Jammu.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {bestValue.slice(0, 4).map((vehicle) => (
                <CarTile
                  key={vehicle.id}
                  vehicle={vehicle}
                  onEnquire={(v) => onOpen(v, { intent: "Vehicle Enquiry", sourceLabel: "home-rail" })}
                  badge={
                    <span className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-[#023468] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                      <IndianRupee className="h-3 w-3" />
                      {vehicle.priceShort}
                    </span>
                  }
                />
              ))}
            </div>

            <div className="mt-6 text-right">
              <Link
                href="/inventory"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-[#023468] hover:text-[#E31837] transition-colors"
              >
                View all inventory <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
