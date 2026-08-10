"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, ShieldCheck, ChevronLeft, ChevronRight, Fuel, Settings2, Gauge, Calendar, ImageOff } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { InventoryVehicle } from "@/lib/inventory/types"

/**
 * Renders one real listing.
 *
 * Prices shown here are the actual asking price and the actual pre-discount
 * price from the dealership's own listing — nothing is computed client-side.
 */
/** Gallery area for a card. Hoisted so it is not redefined on every render. */
function ImageArea({
  vehicle,
  currentImg,
  onPrev,
  onNext,
  className,
}: {
  vehicle: InventoryVehicle
  currentImg: number
  onPrev: () => void
  onNext: () => void
  className: string
}) {
  const images = vehicle.images
  const hasImages = images.length > 0
  const href = `/inventory/${vehicle.slug}`

  return (
    <div className={`relative bg-zinc-100 overflow-hidden ${className}`}>
      {hasImages ? (
        <>
          <Link href={href} className="absolute inset-0 z-10">
            <Image
              src={images[currentImg]}
              alt={vehicle.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </Link>
          {images.length > 1 && (
            <>
              <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                <button
                  onClick={(e) => { e.preventDefault(); onPrev() }}
                  aria-label="Previous photo"
                  className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-white shadow-lg cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5 text-black" />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); onNext() }}
                  aria-label="Next photo"
                  className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-white shadow-lg cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-black" />
                </button>
              </div>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
                {images.slice(0, 8).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImg ? "bg-white w-5" : "bg-white/45 w-1.5"}`}
                  />
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <Link href={href} className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-black/25">
          <ImageOff className="h-7 w-7" />
          <span className="text-[10px] font-black uppercase tracking-widest">Photos coming soon</span>
        </Link>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none z-20" />

      {/* Badges — only rendered when the underlying data exists */}
      <div className="absolute top-3 left-3 z-30 flex flex-wrap items-center gap-2">
        {vehicle.condition && (
          <span className="flex items-center gap-1 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm text-[#023468]">
            <ShieldCheck className="h-3 w-3" /> {vehicle.condition}
          </span>
        )}
        {vehicle.discountPercent !== null && vehicle.discountPercent > 0 && (
          <span className="bg-[#E31837] text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
            {vehicle.discountPercent}% off
          </span>
        )}
      </div>
      {vehicle.bodyType && (
        <div className="absolute top-3 right-3 z-30">
          <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md bg-[#023468] text-white">
            {vehicle.bodyType}
          </span>
        </div>
      )}
      {hasImages && images.length > 1 && (
        <div className="absolute bottom-3 right-3 z-30">
          <span className="px-2 py-0.5 rounded-md bg-black/55 backdrop-blur-sm text-white text-[9px] font-bold">
            {vehicle.photoCount} photos
          </span>
        </div>
      )}
    </div>
  )
}

/** Asking price plus the original listed price, when the source shows one. */
function PriceBlock({ vehicle }: { vehicle: InventoryVehicle }) {
  return (
    <div className="text-right flex-shrink-0">
      <p className="text-[9px] font-black text-[#E31837] uppercase tracking-widest mb-0.5">
        {vehicle.price === null ? "Price" : "Asking Price"}
      </p>
      <p className="text-lg font-black text-[#023468] leading-none">{vehicle.priceLabel}</p>
      {vehicle.originalPriceLabel && (
        <p className="text-[10px] text-black/70 font-semibold line-through mt-0.5">{vehicle.originalPriceLabel}</p>
      )}
    </div>
  )
}

export function VehicleCard({
  vehicle,
  index = 0,
  onEnquire,
  viewType = "grid",
}: {
  vehicle: InventoryVehicle
  index?: number
  onEnquire?: (v: InventoryVehicle) => void
  viewType?: "grid" | "list"
}) {
  const [currentImg, setCurrentImg] = useState(0)

  const images = vehicle.images
  const href = `/inventory/${vehicle.slug}`

  const nextImg = () => setCurrentImg((p) => (p + 1) % images.length)
  const prevImg = () => setCurrentImg((p) => (p - 1 + images.length) % images.length)

  /* Spec pills, built only from fields this listing actually has. */
  const specs = [
    vehicle.year !== null && { icon: <Calendar className="h-3 w-3" />, label: String(vehicle.year) },
    vehicle.mileage !== null && { icon: <Gauge className="h-3 w-3" />, label: vehicle.mileageLabel },
    vehicle.fuel && { icon: <Fuel className="h-3 w-3" />, label: vehicle.fuel },
    vehicle.transmission && { icon: <Settings2 className="h-3 w-3" />, label: vehicle.transmission },
  ].filter(Boolean) as { icon: React.ReactNode; label: string }[]

  /* ── LIST VIEW ─────────────────────────────────────────── */
  if (viewType === "list") {
    return (
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="group bg-white rounded-2xl border border-black/8 overflow-hidden hover:shadow-lg hover:shadow-black/6 transition-all duration-400 flex flex-col sm:flex-row"
      >
        <ImageArea
          vehicle={vehicle}
          currentImg={currentImg}
          onPrev={prevImg}
          onNext={nextImg}
          className="h-52 sm:h-auto sm:w-72 flex-shrink-0"
        />

        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black text-black/75 uppercase tracking-widest mb-0.5">
                  {[vehicle.year, vehicle.make].filter(Boolean).join(" • ")}
                </p>
                <Link href={href} aria-label={`View ${vehicle.year ? `${vehicle.year} ` : ""}${vehicle.title}`}>
                  <h3 className="text-xl font-black text-[#023468] group-hover:text-[#E31837] transition-colors leading-tight truncate">
                    {vehicle.year ? `${vehicle.year} ` : ""}{vehicle.title}
                  </h3>
                </Link>
              </div>
              <PriceBlock vehicle={vehicle} />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {specs.map((s) => (
                <div key={s.label} className="flex items-center gap-1.5 bg-zinc-50 border border-black/8 px-3 py-1.5 rounded-lg">
                  <span className="text-black/60">{s.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-black/80">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2.5">
            <Link
              href={href}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-[#023468] hover:bg-[#01254a] text-white rounded-xl transition-all duration-300 text-[10px] font-black uppercase tracking-widest"
            >
              View Details <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={() => onEnquire?.(vehicle)}
              className="flex-1 px-5 py-3 border border-[#023468]/20 hover:bg-[#023468] hover:text-white text-[#023468] rounded-xl transition-all duration-300 text-[10px] font-black uppercase tracking-widest cursor-pointer"
            >
              Enquire Now
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  /* ── GRID VIEW ─────────────────────────────────────────── */
  return (
    <motion.div
      initial={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
      className="group bg-white rounded-[24px] overflow-hidden border border-black/8 hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-1 transition-all duration-400 flex flex-col"
    >
      <ImageArea
        vehicle={vehicle}
        currentImg={currentImg}
        onPrev={prevImg}
        onNext={nextImg}
        className="h-[220px] sm:h-[240px] flex-shrink-0"
      />

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-black/75 uppercase tracking-widest mb-1">
              {[vehicle.year, vehicle.make].filter(Boolean).join(" • ")}
            </p>
            <Link href={href} aria-label={`View ${vehicle.year ? `${vehicle.year} ` : ""}${vehicle.title}`}>
              <h3 className="text-[22px] font-black text-[#023468] group-hover:text-[#E31837] transition-colors leading-none truncate">
                {vehicle.year ? `${vehicle.year} ` : ""}{vehicle.title}
              </h3>
            </Link>
          </div>
          <PriceBlock vehicle={vehicle} />
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {specs.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5 bg-zinc-50 border border-black/8 px-3 py-1.5 rounded-lg">
              <span className="text-black/60">{s.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-black/80">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="h-px bg-black/5 mb-4" />

        <div className="mt-auto flex gap-2.5">
          <Link
            href={href}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-[#023468] hover:bg-[#01254a] text-white transition-all duration-300 shadow-md font-black text-[10px] uppercase tracking-widest"
          >
            View Details <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => onEnquire?.(vehicle)}
            className="flex-1 px-4 py-3.5 rounded-xl border border-[#023468]/20 hover:bg-[#E31837] hover:border-[#E31837] hover:text-white text-[#023468] transition-all duration-300 font-black text-[10px] uppercase tracking-widest cursor-pointer"
          >
            Enquire Now
          </button>
        </div>
      </div>
    </motion.div>
  )
}
