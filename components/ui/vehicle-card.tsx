"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Lock, ShieldCheck, Zap, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import Image from "next/image"

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

import { useInventoryStore } from "@/store/use-inventory-store"
import Link from "next/link"


export function VehicleCard({ vehicle, index, onUnlock, viewType = "grid" }: { vehicle: VehicleProps; index: number; onUnlock?: (v: VehicleProps) => void; viewType?: "grid" | "list" }) {
  const [currentImg, setCurrentImg] = useState(0)
  const { hasInquired } = useInventoryStore()
  
  // Calculate VIP price
  const basePrice = parseFloat(vehicle.price.replace(/[^\d.]/g, ''))
  const discount = 0.07 // 7% static discount for VIPs
  const vipPrice = !isNaN(basePrice) ? `₹ ${(basePrice * (1 - discount)).toFixed(2)} Lakh*` : vehicle.price

  // For demo purposes, we'll just cycle through the same image
  const images = [vehicle.image, vehicle.image, vehicle.image]


  const nextImg = () => setCurrentImg((prev) => (prev + 1) % images.length)
  const prevImg = () => setCurrentImg((prev) => (prev - 1 + images.length) % images.length)




  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
      viewport={{ once: true }}
      className={`group bg-white rounded-[40px] overflow-hidden border border-black/5 hover:shadow-[0_40px_100px_rgba(0,0,0,0.08)] transition-all duration-700 ${
        viewType === "list" ? "flex flex-row h-auto" : "flex flex-col h-[680px]"
      }`}
    >
      {/* Image Area */}


      <div className={`relative bg-zinc-100 overflow-hidden flex-shrink-0 ${
        viewType === "list" ? "w-2/5 h-auto min-h-[300px]" : "h-[320px]"
      }`}>
        <Link href={`/inventory/${vehicle.id}`} target="_blank" className="absolute inset-0 z-10">
          <Image
            src={images[currentImg]}
            alt={vehicle.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
          />

        </Link>
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 z-20">
          <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
            New Arrival
          </span>
        </div>
        
        <div className="absolute top-4 right-4 z-20 flex gap-2 items-center">
          <span className="bg-[#023468] text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
            {vehicle.type}
          </span>
        </div>

        {/* Carousel Controls */}
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30">
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevImg(); }}
            className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-white shadow-xl cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 text-black" />
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextImg(); }}
            className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-white shadow-xl cursor-pointer"
          >
            <ChevronRight className="h-4 w-4 text-black" />
          </button>
        </div>

        {/* Carousel Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {images.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${i === currentImg ? "bg-[#023468] w-5" : "bg-white/50"}`} 
            />
          ))}
        </div>
      </div>

      {/* Info Area */}
      <div className={`p-6 flex flex-col flex-1 min-h-0 ${
        viewType === "list" ? "w-3/5 justify-center" : ""
      }`}>
        <div className={`flex justify-between items-start mb-4 ${
          viewType === "list" ? "flex-col items-start gap-3" : ""
        }`}>
          <div className={viewType === "list" ? "flex-1" : "flex-1 pr-4"}>
            <span className="text-[10px] font-black text-black/30 uppercase tracking-[0.15em] mb-1 block">
              {vehicle.year || "2025"} • {vehicle.brand}
            </span>
            <Link href={`/inventory/${vehicle.id}`} target="_blank">
              <h3 
                className={`${viewType === "list" ? "text-[28px]" : "text-[20px]"} font-black text-[#023468] leading-tight group-hover:text-[#E31837] transition-colors duration-500 cursor-pointer`}
              >
                {vehicle.name}
              </h3>
            </Link>
          </div>
        </div>

          <div className={`flex-shrink-0 ${viewType === "list" ? "" : "text-right"}`}>
            <span className="text-[9px] font-black text-[#E31837] uppercase tracking-widest mb-1 block">
              {hasInquired ? "Your VIP Price" : "Retail Price"}
            </span>
            {hasInquired ? (
              <div className="flex flex-col">
                <span className={`${viewType === "list" ? "text-[28px]" : "text-[22px]"} font-black text-black leading-none`}>
                  {vipPrice}
                </span>
                <span className="text-[10px] text-black/30 line-through mt-1">
                  {vehicle.price}
                </span>
              </div>
            ) : (
              <span className={`${viewType === "list" ? "text-[28px]" : "text-[22px]"} font-black text-[#023468]`}>
                {vehicle.price}
              </span>
            )}
          </div>




        {/* Features Pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {["New", vehicle.specs.engine || "Electric", vehicle.specs.drive || "AWD"].slice(0, 3).map((tag) => (
            <div key={tag} className="flex items-center gap-2 bg-zinc-50 border border-black/5 px-4 py-2 rounded-xl">
              {tag === "New" ? <Zap className="h-3 w-3 text-black/20" /> : <div className="h-1 w-1 rounded-full bg-black/20" />}
              <span className="text-[10px] font-black uppercase tracking-widest text-black/60">{tag}</span>
            </div>
          ))}
        </div>

        {/* Live Offer Pill */}
        <div className="flex justify-center mb-4">
          <div className="bg-[#E7F8F2] text-[#059669] px-4 py-1.5 rounded-full flex items-center gap-2 border border-[#059669]/10">
            <div className="h-1.5 w-1.5 rounded-full bg-[#059669] animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.15em]">Live Offer Available</span>
          </div>
        </div>

        {/* Secure Message */}
        <div className="text-center mb-4">
          <p className="text-[11px] text-black/60 font-medium mb-2">
            Unlock your best deal in 30 seconds.
          </p>
          <div className="flex justify-center gap-4 text-[9px] font-black uppercase tracking-widest text-black/30">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-2.5 w-2.5" /> Secure
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-2.5 w-2.5" /> Instant
            </div>
          </div>
        </div>

        {/* Main Action */}
        <Button 
          onClick={() => !hasInquired && onUnlock?.(vehicle)}
          className={`w-full h-12 rounded-xl flex items-center justify-between px-6 transition-all duration-500 shadow-xl ${
            hasInquired 
              ? "bg-green-600 hover:bg-green-700 text-white cursor-default" 
              : "bg-[#023468] hover:bg-[#E31837] text-white"
          }`}
        >
          <div className="flex items-center gap-3">
            {hasInquired ? <ShieldCheck className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
            <span className="text-[10px] font-black uppercase tracking-widest">
              {hasInquired ? "Exclusive Price Unlocked" : "Unlock Instant Price"}
            </span>
          </div>
          <ArrowRight className={`h-3.5 w-3.5 ${hasInquired ? "hidden" : "block"}`} />
        </Button>

      </div>
    </motion.div>


  )
}
