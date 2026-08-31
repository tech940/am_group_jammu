"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ChevronGlyph } from "@/components/system/marks"
import { Button } from "@/components/ui/button"
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
    <div className={`relative bg-ground-2 overflow-hidden ${className}`}>
      {hasImages ? (
        <>
          <Link href={href} className="absolute inset-0 z-10">
            <Image
              src={images[currentImg]}
              alt={vehicle.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          </Link>
          {images.length > 1 && (
            <>
              <div className="absolute inset-x-3 top-1/2 z-30 flex -translate-y-1/2 justify-between opacity-0 transition-opacity duration-(--duration-2) group-hover:opacity-100 focus-within:opacity-100">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); onPrev() }}
                  aria-label="Previous photo"
                  className="h-11 w-11 rounded-sm border border-line bg-surface text-ink flex items-center justify-center transition-colors duration-(--duration-1) hover:bg-ground-2 cursor-pointer"
                >
                  <ChevronGlyph direction="left" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); onNext() }}
                  aria-label="Next photo"
                  className="h-11 w-11 rounded-sm border border-line bg-surface text-ink flex items-center justify-center transition-colors duration-(--duration-1) hover:bg-ground-2 cursor-pointer"
                >
                  <ChevronGlyph direction="right" />
                </button>
              </div>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
                {images.slice(0, 8).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full ${i === currentImg ? "bg-ground w-5" : "bg-ground/50 w-1.5"}`}
                  />
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <Link href={href} className="absolute inset-0 flex items-center justify-center text-ink-3">
          <span className="text-meta uppercase">Photos coming soon</span>
        </Link>
      )}

      {/* Scrim over photography, so the plate labels stay legible. */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent pointer-events-none z-20" />

      {/* Badges — only rendered when the underlying data exists */}
      <div className="absolute top-3 left-3 z-30 flex flex-wrap items-center gap-2">
        {vehicle.condition && (
          <span className="inline-flex items-center rounded-sm border border-line bg-surface px-2 py-0.5 text-meta uppercase text-ink">
            {vehicle.condition}
          </span>
        )}
        {vehicle.discountPercent !== null && vehicle.discountPercent > 0 && (
          <span className="inline-flex items-center rounded-sm bg-accent px-2 py-0.5 text-meta uppercase text-on-accent" data-num>
            {vehicle.discountPercent}% off
          </span>
        )}
      </div>
      {vehicle.bodyType && (
        <div className="absolute top-3 right-3 z-30">
          <span className="inline-flex items-center rounded-sm bg-deep px-2 py-0.5 text-meta uppercase text-on-deep">
            {vehicle.bodyType}
          </span>
        </div>
      )}
      {hasImages && images.length > 1 && (
        <div className="absolute bottom-3 right-3 z-30">
          <span className="inline-flex items-center rounded-sm bg-ink px-2 py-0.5 text-meta text-on-deep" data-num>
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
      <p className="text-meta uppercase text-accent-text-light mb-0.5">
        {vehicle.price === null ? "Price" : "Asking Price"}
      </p>
      <p className="font-display text-h3 text-ink" data-num>{vehicle.priceLabel}</p>
      {vehicle.originalPriceLabel && (
        <p className="text-small text-ink-3 line-through mt-0.5" data-num>{vehicle.originalPriceLabel}</p>
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
    vehicle.year !== null && String(vehicle.year),
    vehicle.mileage !== null && vehicle.mileageLabel,
    vehicle.fuel,
    vehicle.transmission,
  ].filter(Boolean) as string[]

  /* ── LIST VIEW ─────────────────────────────────────────── */
  if (viewType === "list") {
    return (
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="group bg-surface border border-line rounded-md overflow-hidden transition-colors duration-(--duration-1) hover:border-line-strong flex flex-col sm:flex-row"
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
                <p className="text-meta uppercase text-ink-2 mb-0.5" data-num>
                  {[vehicle.year, vehicle.make].filter(Boolean).join(" • ")}
                </p>
                <Link href={href} aria-label={`View ${vehicle.year ? `${vehicle.year} ` : ""}${vehicle.title}`}>
                  <h3 className="font-display text-h3 text-ink group-hover:text-accent-text-light transition-colors duration-(--duration-1) truncate">
                    {vehicle.year ? `${vehicle.year} ` : ""}{vehicle.title}
                  </h3>
                </Link>
              </div>
              <PriceBlock vehicle={vehicle} />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {specs.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center rounded-sm border border-line bg-ground-2 px-2.5 py-1 text-meta uppercase text-ink-2"
                  data-num
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2.5">
            <Button asChild variant="primary" className="flex-1">
              <Link href={href}>View Details</Link>
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => onEnquire?.(vehicle)}
            >
              Enquire Now
            </Button>
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
      className="group bg-surface overflow-hidden rounded-md border border-line transition-colors duration-(--duration-1) hover:border-line-strong flex flex-col"
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
            <p className="text-meta uppercase text-ink-2 mb-1" data-num>
              {[vehicle.year, vehicle.make].filter(Boolean).join(" • ")}
            </p>
            <Link href={href} aria-label={`View ${vehicle.year ? `${vehicle.year} ` : ""}${vehicle.title}`}>
              <h3 className="font-display text-h3 text-ink group-hover:text-accent-text-light transition-colors duration-(--duration-1) truncate">
                {vehicle.year ? `${vehicle.year} ` : ""}{vehicle.title}
              </h3>
            </Link>
          </div>
          <PriceBlock vehicle={vehicle} />
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {specs.map((s) => (
            <span
              key={s}
              className="inline-flex items-center rounded-sm border border-line bg-ground-2 px-2.5 py-1 text-meta uppercase text-ink-2"
              data-num
            >
              {s}
            </span>
          ))}
        </div>

        <div className="h-px bg-line mb-4" />

        <div className="mt-auto flex gap-2.5">
          <Button asChild variant="primary" className="flex-1">
            <Link href={href}>View Details</Link>
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => onEnquire?.(vehicle)}
          >
            Enquire Now
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
