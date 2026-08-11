"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronGlyph } from "@/components/system/marks"
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
    <section className={`bg-ground-2 border-t border-line text-ink overflow-hidden ${isListingPage ? "pt-2 md:pt-3 pb-8 md:pb-12" : "py-12 md:py-16"}`}>
      <div className="container mx-auto px-4 md:px-8">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <span className="inline-flex items-center bg-accent text-ground px-3 py-1 rounded-sm text-meta uppercase mb-2">
              Featured Stock
            </span>
            <h2 className="font-display text-h2 text-ink">
              Featured Vehicle Spotlight
            </h2>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={() => onOpen(activeVehicle, { intent: "Vehicle Enquiry", sourceLabel: "spotlight" })}
          >
            Get Best Price
          </Button>
        </div>

        <div className="bg-surface border border-line p-3 sm:p-4 overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">

            {/* MAIN IMAGE */}
            <div className={`${thumbnails.length > 0 ? "lg:col-span-7" : "lg:col-span-12"} relative h-[320px] sm:h-[420px] lg:h-[480px] w-full overflow-hidden bg-ink`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeVehicle.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={mainImage}
                    alt={activeVehicle.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover object-center brightness-[0.95] contrast-[1.02]"
                  />
                </motion.div>
              </AnimatePresence>

              <Link href={href} className="absolute inset-0 z-[5]" aria-label={`View ${activeVehicle.title}`} />

              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/40 pointer-events-none" />

              <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-2 pointer-events-none">
                <div className="pointer-events-auto self-start flex flex-wrap gap-2">
                  {activeVehicle.condition && (
                    <span className="bg-deep text-on-deep text-meta uppercase px-2.5 py-1 rounded-sm border border-line-on-deep">
                      {activeVehicle.condition}
                    </span>
                  )}
                  {activeVehicle.discountPercent !== null && activeVehicle.discountPercent > 0 && (
                    <span data-num className="bg-accent text-ground text-meta uppercase px-2.5 py-1 rounded-sm">
                      {activeVehicle.discountPercent}% off
                    </span>
                  )}
                </div>

                <div className="pointer-events-auto self-end text-right bg-ink px-3 py-1.5 sm:px-4 sm:py-2 border border-line-on-deep text-on-deep max-w-[210px] xs:max-w-[240px] sm:max-w-none">
                  <h3 className="font-display text-h4 text-on-deep">
                    {activeVehicle.year ? `${activeVehicle.year} ` : ""}{activeVehicle.title}
                  </h3>
                  <span data-num className="text-caption text-on-deep-2 block mt-0.5">
                    {activeVehicle.mileageLabel}
                    {activeVehicle.fuel ? ` • ${activeVehicle.fuel}` : ""}
                    {activeVehicle.transmission ? ` • ${activeVehicle.transmission}` : ""}
                  </span>
                </div>
              </div>

              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 bg-surface px-3 py-1.5 sm:px-4 sm:py-2 border border-line flex items-center max-w-[calc(100%-24px)]">
                <span data-num className="text-small text-ink truncate">
                  Asking Price: <strong className="text-accent-text-light">{activeVehicle.priceLabel}</strong>
                  {activeVehicle.originalPriceLabel && (
                    <span className="ml-2 text-ink-3 line-through">{activeVehicle.originalPriceLabel}</span>
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
                    className="relative overflow-hidden bg-ground-2 border border-line group cursor-pointer"
                  >
                    <Image
                      src={src}
                      alt={`${activeVehicle.title} photo ${index + 2}`}
                      fill
                      sizes="(max-width: 1024px) 50vw, 20vw"
                      className="object-cover brightness-[0.92]"
                    />
                    <div className="absolute inset-0 bg-ink/25 group-hover:bg-transparent transition-colors duration-(--duration-1)" />
                  </Link>
                ))}

                {activeVehicle.photoCount > thumbnails.length + 1 && (
                  <div className="absolute top-2 left-2 z-10">
                    <span data-num className="bg-ink px-2 py-1 rounded-sm text-meta uppercase text-on-deep">
                      {activeVehicle.photoCount} photos
                    </span>
                  </div>
                )}

                {vehicles.length > 1 && (
                  <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-20 flex items-center gap-1 bg-surface p-1 border border-line">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handlePrev}
                      aria-label="Previous featured vehicle"
                    >
                      <ChevronGlyph direction="left" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleNext}
                      aria-label="Next featured vehicle"
                    >
                      <ChevronGlyph direction="right" />
                    </Button>
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
