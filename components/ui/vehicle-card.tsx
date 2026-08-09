"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Lock, ShieldCheck, Zap, ChevronLeft, ChevronRight, Fuel, Settings2, Gauge } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useInventoryStore } from "@/store/use-inventory-store"

interface VehicleProps {
  id: string
  name: string
  brand: string
  type: string
  year?: string
  specs: {
    range?: string
    acceleration?: string
    topSpeed?: string
    engine?: string
    power?: string
    transmission?: string
    drive?: string
  }
  price: string
  image: string
}

export function VehicleCard({
  vehicle,
  index,
  onUnlock,
  viewType = "grid",
}: {
  vehicle: VehicleProps
  index: number
  onUnlock?: (v: VehicleProps) => void
  viewType?: "grid" | "list"
}) {
  const [currentImg, setCurrentImg] = useState(0)
  const { hasInquired } = useInventoryStore()

  const basePrice = parseFloat(vehicle.price.replace(/[^\d.]/g, ""))
  const discount = 0.07
  const vipPrice = !isNaN(basePrice) ? `₹ ${(basePrice * (1 - discount)).toFixed(2)} Lakh*` : vehicle.price

  const images = [vehicle.image, vehicle.image, vehicle.image]
  const nextImg = () => setCurrentImg((p) => (p + 1) % images.length)
  const prevImg = () => setCurrentImg((p) => (p - 1 + images.length) % images.length)

  const isElectric = vehicle.specs.engine?.toLowerCase().includes("electric") || vehicle.type?.toLowerCase().includes("electric")

  /* ── LIST VIEW ─────────────────────────────────────────── */
  if (viewType === "list") {
    return (
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="group bg-white rounded-2xl border border-black/8 overflow-hidden hover:shadow-lg hover:shadow-black/6 transition-all duration-400 flex flex-row"
      >
        {/* Image */}
        <Link href={`/inventory/${vehicle.id}`} target="_blank" className="relative w-56 sm:w-72 flex-shrink-0 overflow-hidden bg-zinc-100">
          <Image src={images[currentImg]} alt={vehicle.name} fill sizes="300px"
            className="object-cover group-hover:scale-105 transition-transform duration-700" />
          {/* Type Badge */}
          <div className="absolute top-3 right-3 z-10">
            <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md bg-[#023468] text-white">
              {vehicle.type}
            </span>
          </div>
        </Link>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="text-[10px] font-black text-black/35 uppercase tracking-widest mb-0.5">
                  {vehicle.year || "2025"} • {vehicle.brand}
                </p>
                <Link href={`/inventory/${vehicle.id}`} target="_blank">
                  <h3 className="text-xl font-black text-[#023468] group-hover:text-[#E31837] transition-colors leading-tight">{vehicle.name}</h3>
                </Link>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[9px] font-black text-[#E31837] uppercase tracking-widest mb-0.5">Retail Price</p>
                <p className="text-xl font-black text-[#023468]">{vehicle.price}</p>
              </div>
            </div>

            {/* Spec Pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { icon: <Zap className="h-3 w-3" />, label: vehicle.specs.engine || "Electric" },
                { icon: <Settings2 className="h-3 w-3" />, label: vehicle.specs.transmission || "Auto" },
                { icon: <Gauge className="h-3 w-3" />, label: vehicle.specs.drive || "AWD" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1.5 bg-zinc-50 border border-black/8 px-3 py-1.5 rounded-lg">
                  <span className="text-black/30">{s.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-black/60">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => !hasInquired && onUnlock?.(vehicle)}
            className="flex items-center justify-between w-full px-5 py-3 bg-[#023468] hover:bg-[#E31837] text-white rounded-xl transition-all duration-300 shadow-md cursor-pointer group/btn"
          >
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Unlock Instant Price</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </button>
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
      {/* ── Image ── */}
      <div className="relative h-[220px] sm:h-[240px] bg-zinc-100 overflow-hidden flex-shrink-0">
        <Link href={`/inventory/${vehicle.id}`} target="_blank" className="absolute inset-0 z-10">
          <Image
            src={images[currentImg]}
            alt={vehicle.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </Link>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none z-20" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
          <span className="flex items-center gap-1 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm text-[#023468]">
            New Arrival
          </span>
        </div>
        <div className="absolute top-3 right-3 z-30">
          <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md bg-[#023468] text-white">
            {vehicle.type}
          </span>
        </div>

        {/* Carousel Controls — appear on hover */}
        <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevImg() }}
            className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-white shadow-lg cursor-pointer">
            <ChevronLeft className="h-3.5 w-3.5 text-black" />
          </button>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextImg() }}
            className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-white shadow-lg cursor-pointer">
            <ChevronRight className="h-3.5 w-3.5 text-black" />
          </button>
        </div>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
          {images.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImg ? "bg-white w-5" : "bg-white/45 w-1.5"}`} />
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5 flex flex-col flex-1">

        {/* Year / Brand + Name + Price row */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-black/30 uppercase tracking-widest mb-1">
              {vehicle.year || "2025"} • {vehicle.brand}
            </p>
            <Link href={`/inventory/${vehicle.id}`} target="_blank">
              <h3 className="text-[22px] font-black text-[#023468] group-hover:text-[#E31837] transition-colors leading-none truncate">
                {vehicle.name}
              </h3>
            </Link>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[9px] font-black text-[#E31837] uppercase tracking-widest mb-0.5">
              {hasInquired ? "VIP Price" : "Retail Price"}
            </p>
            {hasInquired ? (
              <div>
                <p className="text-lg font-black text-[#023468] leading-none">{vipPrice}</p>
                <p className="text-[10px] text-black/30 line-through mt-0.5">{vehicle.price}</p>
              </div>
            ) : (
              <p className="text-lg font-black text-[#023468] leading-none">{vehicle.price}</p>
            )}
          </div>
        </div>

        {/* Spec pill row */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {[
            { icon: <Zap className="h-3 w-3" />, label: "New" },
            { icon: <Fuel className="h-3 w-3" />, label: vehicle.specs.engine || "Electric" },
            { icon: <Gauge className="h-3 w-3" />, label: vehicle.specs.drive || "AWD" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5 bg-zinc-50 border border-black/8 px-3 py-1.5 rounded-lg">
              <span className="text-black/30">{s.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-black/55">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-black/5 mb-4" />

        {/* Live Offer */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/60 px-4 py-1.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700">Live Offer Available</span>
          </div>
        </div>

        <p className="text-center text-[11px] text-black/45 font-medium mb-3">
          Unlock your best deal in 30 seconds.
        </p>

        <div className="flex justify-center items-center gap-4 text-[9px] font-black uppercase tracking-widest text-black/25 mb-4">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3" /> Secure
          </div>
          <div className="w-px h-3 bg-black/10" />
          <div className="flex items-center gap-1.5">
            <Zap className="h-3 w-3" /> Instant
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => !hasInquired && onUnlock?.(vehicle)}
          className={`mt-auto w-full flex items-center justify-between px-5 py-3.5 rounded-xl transition-all duration-300 shadow-md cursor-pointer group/btn font-black text-[10px] uppercase tracking-widest ${
            hasInquired
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-[#023468] hover:bg-[#E31837] text-white"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {hasInquired ? <ShieldCheck className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
            <span>{hasInquired ? "Exclusive Price Unlocked" : "Unlock Instant Price"}</span>
          </div>
          {!hasInquired && <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />}
        </button>

      </div>
    </motion.div>
  )
}
