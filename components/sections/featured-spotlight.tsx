"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react"
import Image from "next/image"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"

const spotlightVehicles = [
  {
    id: "spotlight-1",
    badge: "FEATURED SPOTLIGHT",
    title: "2024 MG Gloster Savvy 4x4 Twin-Turbo",
    mileage: "12k Km",
    price: "₹ 38.80 Lakh",
    offerEnd: "Limited Dealer Special",
    mainImage: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1200",
    thumbnails: [
      { label: "Cockpit Interior", src: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=600" },
      { label: "Rear Profile", src: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600" },
      { label: "Engine Powertrain", src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600" },
      { label: "Luxury Seating", src: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=600" }
    ]
  },
  {
    id: "spotlight-2",
    badge: "ELECTRIC FLAGSHIP",
    title: "2024 Hyundai IONIQ 5 AWD Long Range",
    mileage: "6k Km",
    price: "₹ 46.05 Lakh",
    offerEnd: "100% Certified Used",
    mainImage: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=1200",
    thumbnails: [
      { label: "Dashboard", src: "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?auto=format&fit=crop&q=80&w=600" },
      { label: "Rear Tail Lights", src: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=600" },
      { label: "EV Motor Bay", src: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=600" },
      { label: "Panoramic Cabin", src: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600" }
    ]
  }
]

export function FeaturedSpotlight({ isListingPage = false }: { isListingPage?: boolean }) {
  const { onOpen } = useEnquiryModal()
  const [currentIdx, setCurrentIdx] = React.useState(0)

  const activeVehicle = spotlightVehicles[currentIdx]

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % spotlightVehicles.length)
  }

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + spotlightVehicles.length) % spotlightVehicles.length)
  }

  return (
    <section className={`bg-[#f8f9fa] border-t border-black/5 text-black overflow-hidden ${isListingPage ? "pt-2 md:pt-3 pb-8 md:pb-12" : "py-12 md:py-16"}`}>
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Section Title Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#E31837] text-white px-3.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest mb-2 shadow-sm">
              <span>VIP SPOTLIGHT FLEET</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#023468] tracking-tight">
              Featured Vehicle Spotlight
            </h2>
          </div>

          <button
            onClick={() => onOpen()}
            className="bg-[#023468] hover:bg-[#E31837] text-white rounded-full px-6 py-2.5 text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer shadow-md"
          >
            Claim Dealer Price
          </button>
        </div>

        {/* MAIN FEATURED SPOTLIGHT CONTAINER (Clean Light Card) */}
        <div className="bg-white rounded-[28px] border border-black/10 p-3 sm:p-4 overflow-hidden shadow-xl relative">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
            
            {/* LEFT MAIN HERO IMAGE (~60% width - lg:col-span-7) */}
            <div className="lg:col-span-7 relative h-[320px] sm:h-[420px] lg:h-[480px] w-full rounded-2xl overflow-hidden bg-zinc-900 group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeVehicle.id}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={activeVehicle.mainImage}
                    alt={activeVehicle.title}
                    fill
                    priority
                    unoptimized
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover object-center brightness-[0.95] contrast-[1.02] group-hover:scale-105 transition-transform duration-1000"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Ambient Overlays for Badge Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

              {/* Responsive Top Bar: Badge on Left, Title Card on Right (Zero Mobile Overlap) */}
              <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-2 pointer-events-none">
                {/* Top Left Badge */}
                <div className="pointer-events-auto self-start">
                  <span className="bg-[#023468]/90 backdrop-blur-md text-white font-extrabold text-[9px] sm:text-[10px] uppercase tracking-widest px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-white/15 shadow-md">
                    {activeVehicle.badge}
                  </span>
                </div>

                {/* Top Right Title & Mileage */}
                <div className="pointer-events-auto self-end text-right bg-black/75 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-white/15 text-white max-w-[210px] xs:max-w-[240px] sm:max-w-none shadow-lg">
                  <h3 className="text-xs sm:text-base font-black text-white leading-tight">
                    {activeVehicle.title}
                  </h3>
                  <span className="text-[10px] sm:text-[11px] font-bold text-white/80 block mt-0.5">
                    {activeVehicle.mileage}
                  </span>
                </div>
              </div>

              {/* Bottom Left Floating Badge: Price & Guarantee */}
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-black/10 flex items-center space-x-2 sm:space-x-2.5 shadow-xl max-w-[calc(100%-24px)]">
                <ShieldCheck className="h-4 w-4 text-[#023468] flex-shrink-0" />
                <span className="text-[11px] sm:text-xs font-black text-[#023468] truncate">
                  Special Dealer Price: <strong className="text-[#E31837] font-black">{activeVehicle.price}</strong>
                </span>
              </div>
            </div>

            {/* RIGHT 2x2 THUMBNAIL MULTI-ANGLE GRID (~40% width - lg:col-span-5) */}
            <div className="lg:col-span-5 relative grid grid-cols-2 gap-2 sm:gap-3 h-full min-h-[300px] sm:min-h-[420px] lg:min-h-[480px]">
              
              {activeVehicle.thumbnails.map((thumb, index) => (
                <div
                  key={index}
                  className="relative rounded-xl overflow-hidden bg-zinc-100 border border-black/10 group cursor-pointer"
                >
                  <Image
                    src={thumb.src}
                    alt={thumb.label}
                    fill
                    sizes="(max-width: 1024px) 50vw, 20vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700 brightness-[0.92]"
                  />
                  <div className="absolute inset-0 bg-black/25 group-hover:bg-transparent transition-colors" />

                  {/* Thumbnail Label Badge (Padded on 4th thumbnail to prevent arrow collision) */}
                  <div className={`absolute bottom-2 left-2 z-10 max-w-[calc(100%-16px)] ${index === 3 ? "pr-20 sm:pr-0" : ""}`}>
                    <span className="bg-black/75 backdrop-blur-md px-2 py-1 rounded text-[9px] font-extrabold uppercase tracking-wider text-white truncate block">
                      {thumb.label}
                    </span>
                  </div>
                </div>
              ))}

              {/* Floating Bottom Right Navigation Arrow Buttons */}
              <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-20 flex items-center space-x-1.5 bg-white/95 backdrop-blur-md p-1 sm:p-1.5 rounded-xl border border-black/15 shadow-xl">
                <button
                  onClick={handlePrev}
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-zinc-100 hover:bg-[#023468] hover:text-white text-[#023468] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                  aria-label="Previous Featured Vehicle"
                >
                  <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-zinc-100 hover:bg-[#023468] hover:text-white text-[#023468] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                  aria-label="Next Featured Vehicle"
                >
                  <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  )
}
