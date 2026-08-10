"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import type { InventoryVehicle } from "@/lib/inventory/types"

/**
 * Spotlights real listings. The 2x2 grid shows this car's actual gallery
 * photos, so it renders nothing when a listing has no images rather than
 * padding the grid with stock imagery.
 */
export function FeaturedSpotlight({
  vehicles,
  isListingPage = false,
}: {
  vehicles: InventoryVehicle[]
  isListingPage?: boolean
}) {
  const { onOpen } = useEnquiryModal()
  const [currentIdx, setCurrentIdx] = React.useState(0)

  if (vehicles.length === 0) return null

  const activeVehicle = vehicles[Math.min(currentIdx, vehicles.length - 1)]
  const [mainImage, ...restImages] = activeVehicle.images
  const thumbnails = restImages.slice(0, 4)

  const handleNext = () => setCurrentIdx((prev) => (prev + 1) % vehicles.length)
  const handlePrev = () => setCurrentIdx((prev) => (prev - 1 + vehicles.length) % vehicles.length)

  const href = `/inventory/${activeVehicle.slug}`

  return (
    <section className={`bg-[#f8f9fa] border-t border-black/5 text-black overflow-hidden ${isListingPage ? "pt-2 md:pt-3 pb-8 md:pb-12" : "py-12 md:py-16"}`}>
      <div className="container mx-auto px-4 md:px-8">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-[#E31837] text-white px-3.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest mb-2 shadow-sm">
              <span>Featured Stock</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#023468] tracking-tight">
              Featured Vehicle Spotlight
            </h2>
          </div>

          <button
            onClick={() => onOpen(activeVehicle, { intent: "Vehicle Enquiry", sourceLabel: "spotlight" })}
            className="bg-[#023468] hover:bg-[#E31837] text-white rounded-full px-6 py-2.5 text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer shadow-md"
          >
            Get Best Price
          </button>
        </div>

        <div className="bg-white rounded-[28px] border border-black/10 p-3 sm:p-4 overflow-hidden shadow-xl relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">

            {/* MAIN IMAGE */}
            <div className={`${thumbnails.length > 0 ? "lg:col-span-7" : "lg:col-span-12"} relative h-[320px] sm:h-[420px] lg:h-[480px] w-full rounded-2xl overflow-hidden bg-zinc-900 group`}>
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
                    src={mainImage}
                    alt={activeVehicle.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover object-center brightness-[0.95] contrast-[1.02] group-hover:scale-105 transition-transform duration-1000"
                  />
                </motion.div>
              </AnimatePresence>

              <Link href={href} className="absolute inset-0 z-[5]" aria-label={`View ${activeVehicle.title}`} />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

              <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-2 pointer-events-none">
                <div className="pointer-events-auto self-start flex flex-wrap gap-2">
                  {activeVehicle.condition && (
                    <span className="bg-[#023468]/90 backdrop-blur-md text-white font-extrabold text-[9px] sm:text-[10px] uppercase tracking-widest px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-white/15 shadow-md">
                      {activeVehicle.condition}
                    </span>
                  )}
                  {activeVehicle.discountPercent !== null && activeVehicle.discountPercent > 0 && (
                    <span className="bg-[#E31837] text-white font-extrabold text-[9px] sm:text-[10px] uppercase tracking-widest px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg shadow-md">
                      {activeVehicle.discountPercent}% off
                    </span>
                  )}
                </div>

                <div className="pointer-events-auto self-end text-right bg-black/75 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-white/15 text-white max-w-[210px] xs:max-w-[240px] sm:max-w-none shadow-lg">
                  <h3 className="text-xs sm:text-base font-black text-white leading-tight">
                    {activeVehicle.year ? `${activeVehicle.year} ` : ""}{activeVehicle.title}
                  </h3>
                  <span className="text-[10px] sm:text-[11px] font-bold text-white/80 block mt-0.5">
                    {activeVehicle.mileageLabel}
                    {activeVehicle.fuel ? ` • ${activeVehicle.fuel}` : ""}
                    {activeVehicle.transmission ? ` • ${activeVehicle.transmission}` : ""}
                  </span>
                </div>
              </div>

              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-black/10 flex items-center space-x-2 sm:space-x-2.5 shadow-xl max-w-[calc(100%-24px)]">
                <ShieldCheck className="h-4 w-4 text-[#023468] flex-shrink-0" />
                <span className="text-[11px] sm:text-xs font-black text-[#023468] truncate">
                  Asking Price: <strong className="text-[#E31837] font-black">{activeVehicle.priceLabel}</strong>
                  {activeVehicle.originalPriceLabel && (
                    <span className="ml-2 text-black/35 line-through font-bold">{activeVehicle.originalPriceLabel}</span>
                  )}
                </span>
              </div>
            </div>

            {/* GALLERY THUMBNAILS — this listing's own photos */}
            {thumbnails.length > 0 && (
              <div className="lg:col-span-5 relative grid grid-cols-2 gap-2 sm:gap-3 h-full min-h-[300px] sm:min-h-[420px] lg:min-h-[480px]">
                {thumbnails.map((src, index) => (
                  <Link
                    key={src}
                    href={href}
                    className="relative rounded-xl overflow-hidden bg-zinc-100 border border-black/10 group cursor-pointer"
                  >
                    <Image
                      src={src}
                      alt={`${activeVehicle.title} photo ${index + 2}`}
                      fill
                      sizes="(max-width: 1024px) 50vw, 20vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-700 brightness-[0.92]"
                    />
                    <div className="absolute inset-0 bg-black/25 group-hover:bg-transparent transition-colors" />
                  </Link>
                ))}

                {activeVehicle.photoCount > thumbnails.length + 1 && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="bg-black/75 backdrop-blur-md px-2 py-1 rounded text-[9px] font-extrabold uppercase tracking-wider text-white">
                      {activeVehicle.photoCount} photos
                    </span>
                  </div>
                )}

                {vehicles.length > 1 && (
                  <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-20 flex items-center space-x-1.5 bg-white/95 backdrop-blur-md p-1 sm:p-1.5 rounded-xl border border-black/15 shadow-xl">
                    <button
                      onClick={handlePrev}
                      className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-zinc-100 hover:bg-[#023468] hover:text-white text-[#023468] flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="Previous featured vehicle"
                    >
                      <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-zinc-100 hover:bg-[#023468] hover:text-white text-[#023468] flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="Next featured vehicle"
                    >
                      <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
