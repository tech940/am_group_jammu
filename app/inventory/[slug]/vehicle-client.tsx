"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronGlyph } from "@/components/system/marks"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/feedback"
import { VehicleCard } from "@/components/ui/vehicle-card"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { FaqSection } from "@/components/seo/faq-section"
import type { FaqItem } from "@/components/seo/faq-section"
import { FrequentSearches } from "@/components/seo/frequent-searches"
import type { SeoLink, SeoLinkGroup } from "@/lib/seo/links"
import type { VehicleNeighbour } from "@/lib/inventory/server"
import type { InventoryVehicle } from "@/lib/inventory/types"
import { pushEvent, vehicleParams } from "@/lib/analytics/gtm"
import { whatsappUrl, PRIMARY_LOCATION } from "@/lib/locations"

export default function VehicleClient({
  vehicle,
  similar,
  sellerNotes,
  faqs,
  frequentSearches,
  seoGroups,
  position,
  total,
  prev,
  next,
}: {
  vehicle: InventoryVehicle
  similar: InventoryVehicle[]
  sellerNotes: string[]
  faqs: FaqItem[]
  frequentSearches: SeoLink[]
  seoGroups: SeoLinkGroup[]
  position: number
  total: number
  prev: VehicleNeighbour | null
  next: VehicleNeighbour | null
}) {
  const { onOpen } = useEnquiryModal()
  const [currentImage, setCurrentImage] = useState(0)

  const images = vehicle.images
  const hasImages = images.length > 0

  const nextImage = () => setCurrentImage((p) => (p + 1) % images.length)
  const prevImage = () => setCurrentImage((p) => (p - 1 + images.length) % images.length)

  /* Every spec is conditional — this listing only shows what it actually has. */
  const specs = [
    vehicle.year !== null && { label: "Year", value: String(vehicle.year) },
    vehicle.mileage !== null && { label: "KMs Driven", value: vehicle.mileageLabel },
    vehicle.fuel && { label: "Fuel", value: vehicle.fuel },
    vehicle.transmission && { label: "Transmission", value: vehicle.transmission },
    vehicle.drivetrain && { label: "Drivetrain", value: vehicle.drivetrain },
    vehicle.bodyType && { label: "Body Type", value: vehicle.bodyType },
    vehicle.colour && { label: "Colour", value: vehicle.colour },
    vehicle.engine && { label: "Engine", value: vehicle.engine },
  ].filter(Boolean) as { label: string; value: string }[]

  // Keyed on vehicle.id, not []: the prev/next links swap the vehicle without
  // remounting this component, so an empty dep array would miss those views.
  useEffect(() => {
    pushEvent("view_item", {
      ...vehicleParams(vehicle),
      listing_position: position,
      listing_total: total,
    })
  }, [vehicle, position, total])

  const heading = `${vehicle.year ? `${vehicle.year} ` : ""}${vehicle.title}`

  return (
    <div className="min-h-screen bg-ground">
      <Breadcrumbs
        items={[
          { label: "Used Cars in Jammu", href: "/inventory" },
          ...(vehicle.make
            ? [{ label: vehicle.make, href: `/inventory?make=${encodeURIComponent(vehicle.make)}` }]
            : []),
          { label: heading },
        ]}
      />

      {/* Back link + prev/next through the full listing */}
      <div className="container mx-auto px-6 md:px-12 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/inventory"
            className="inline-flex min-h-11 items-center text-body font-medium text-ink-2 hover:text-ink transition-colors duration-(--duration-1)"
          >
            Back to Inventory
          </Link>

          <nav aria-label="Vehicle pagination" className="flex items-center gap-2">
            {prev ? (
              <Link
                href={`/inventory/${prev.slug}`}
                rel="prev"
                title={`${prev.year ?? ""} ${prev.title}`.trim()}
                className="h-11 px-3 rounded-sm border border-line-strong flex items-center text-meta uppercase text-ink hover:bg-ground-2 transition-colors duration-(--duration-1)"
              >
                Prev
              </Link>
            ) : (
              <span className="h-11 px-3 rounded-sm border border-line bg-ground-2 flex items-center text-meta uppercase text-ink-3">
                Prev
              </span>
            )}

            <span className="text-meta text-ink-2 px-1 whitespace-nowrap" data-num>
              Car {position} of {total}
            </span>

            {next ? (
              <Link
                href={`/inventory/${next.slug}`}
                rel="next"
                title={`${next.year ?? ""} ${next.title}`.trim()}
                className="h-11 px-3 rounded-sm border border-line-strong flex items-center text-meta uppercase text-ink hover:bg-ground-2 transition-colors duration-(--duration-1)"
              >
                Next
              </Link>
            ) : (
              <span className="h-11 px-3 rounded-sm border border-line bg-ground-2 flex items-center text-meta uppercase text-ink-3">
                Next
              </span>
            )}
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* MAIN COLUMN */}
          <div className="lg:col-span-3 space-y-12">
            {/* Gallery */}
            <div className="relative h-[380px] md:h-[560px] bg-ground-2 border border-line overflow-hidden">
              {hasImages ? (
                <>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={images[currentImage]}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={images[currentImage]}
                        alt={`${heading} — photo ${currentImage + 1} of ${images.length}`}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className="object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>

                  {images.length > 1 && (
                    <>
                      <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between z-20">
                        <button type="button" onClick={prevImage} aria-label="Previous photo"
                          className="h-11 w-11 rounded-sm border border-line bg-surface text-ink flex items-center justify-center hover:bg-ground-2 transition-colors duration-(--duration-1) cursor-pointer">
                          <ChevronGlyph direction="left" />
                        </button>
                        <button type="button" onClick={nextImage} aria-label="Next photo"
                          className="h-11 w-11 rounded-sm border border-line bg-surface text-ink flex items-center justify-center hover:bg-ground-2 transition-colors duration-(--duration-1) cursor-pointer">
                          <ChevronGlyph direction="right" />
                        </button>
                      </div>

                      {/* Scrim over photography — legitimate, so the count stays readable. */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-ink/80 px-3 py-1 rounded-sm">
                        <span className="text-on-deep text-caption" data-num>
                          {currentImage + 1} / {images.length}
                        </span>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-ink-3">
                  <span className="text-meta uppercase">
                    Photos for this car are coming soon
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 -mt-6">
                {images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setCurrentImage(i)}
                    aria-label={`View photo ${i + 1}`}
                    aria-pressed={i === currentImage}
                    className={`relative aspect-4/3 rounded-sm overflow-hidden border-2 transition-colors duration-(--duration-1) cursor-pointer ${
                      i === currentImage ? "border-accent" : "border-transparent hover:border-line-strong"
                    }`}
                  >
                    <Image src={src} alt="" fill sizes="120px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Specifications */}
            {specs.length > 0 && (
              <div className="bg-surface p-8 md:p-12 border border-line">
                <h2 className="font-display text-h2 text-ink mb-10 flex items-center gap-3">
                  <span aria-hidden className="h-7 w-1 bg-accent shrink-0" />
                  Vehicle Specifications
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-1">
                  {specs.map((spec) => (
                    <div key={spec.label} className="flex justify-between items-center py-4 border-b border-line">
                      <span className="text-meta uppercase text-ink-2">
                        {spec.label}
                      </span>
                      <span className="text-body font-semibold text-ink text-right" data-num>{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SELLER'S NOTES */}
            <section>
              <h2 className="font-display text-h2 text-ink mb-6 flex items-center gap-3">
                <span aria-hidden className="h-7 w-1 bg-accent shrink-0" />
                Seller&apos;s Notes
              </h2>
              <div className="space-y-4">
                {sellerNotes.map((para, i) => (
                  <p key={i} className="text-body text-ink-2">
                    {para}
                  </p>
                ))}
              </div>

              <dl className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { k: "Listing ID", v: `#${vehicle.id}` },
                  { k: "Condition", v: vehicle.condition ?? "Used" },
                  { k: "Photos", v: String(vehicle.photoCount) },
                  {
                    k: "Listed",
                    v: vehicle.postedAt
                      ? new Date(vehicle.postedAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })
                      : "—",
                  },
                ].map((item) => (
                  <div key={item.k} className="bg-surface border border-line px-4 py-3">
                    <dt className="text-meta uppercase text-ink-2">{item.k}</dt>
                    <dd className="text-body font-semibold text-ink mt-0.5" data-num>{item.v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          {/* SIDEBAR */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {(vehicle.year || vehicle.make) && (
                  <span className="text-meta uppercase text-ink-2" data-num>
                    {[vehicle.year, vehicle.make].filter(Boolean).join(" • ")}
                  </span>
                )}
                {vehicle.condition && <Badge tone="info">{vehicle.condition}</Badge>}
              </div>
              <h1 className="font-display text-h1 text-ink mb-4">{vehicle.title}</h1>
            </div>

            {/* Price */}
            <div className="bg-surface p-8 border border-line">
              <div className="text-center mb-6">
                <span className="text-meta uppercase text-ink-2">
                  {vehicle.price === null ? "Price" : "Asking Price"}
                </span>
                <div className="font-display text-h1 text-ink mt-2" data-num>{vehicle.priceLabel}</div>
                {vehicle.originalPriceLabel && (
                  <div className="mt-2 flex items-center justify-center gap-3">
                    <span className="text-small text-ink-3 line-through" data-num>{vehicle.originalPriceLabel}</span>
                    {vehicle.discountPercent !== null && (
                      <span className="px-2 py-0.5 rounded-sm bg-accent text-on-accent text-meta uppercase" data-num>
                        {vehicle.discountPercent}% off
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  full
                  onClick={() => onOpen(vehicle, { intent: "Vehicle Enquiry", sourceLabel: "vdp-best-price" })}
                >
                  Get Best Price
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  full
                  onClick={() => onOpen(vehicle, { intent: "Test Drive", sourceLabel: "vdp-test-drive" })}
                >
                  Schedule Test Drive
                </Button>

                {/* WhatsApp is usually the highest-volume enquiry channel for a
                    J&K dealership — prefilled with this exact car so the buyer
                    does not have to describe it. */}
                <Button asChild variant="secondary" size="lg" full>
                  <a
                    href={whatsappUrl(
                      `Hi AM Group, I'm interested in the ${heading}` +
                        `${vehicle.price !== null ? ` listed at ${vehicle.priceLabel}` : ""}. ` +
                        `Is it still available? (Ref #${vehicle.id})`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-track-location="vdp-whatsapp"
                  >
                    WhatsApp Us
                  </a>
                </Button>
              </div>
            </div>

            {/* Quick contact */}
            <div className="bg-surface p-6 border border-line">
              <h2 className="font-display text-h3 text-ink mb-4">Quick Contact</h2>
              <div className="flex flex-col">
                <a href={`tel:${PRIMARY_LOCATION.phoneE164}`} data-track-location="vdp-quick-contact" className="flex min-h-11 items-center text-body text-ink hover:text-accent-text-light transition-colors duration-(--duration-1)" data-num>
                  {PRIMARY_LOCATION.phone}
                </a>
                <a href="mailto:info@amgroupind.com" className="flex min-h-11 items-center text-body text-ink hover:text-accent-text-light transition-colors duration-(--duration-1)">
                  info@amgroupind.com
                </a>
                <address className="not-italic py-3 text-body text-ink-2">
                  AM Business Park, N-H 1 Bye-Pass Road, Jammu
                </address>
              </div>
            </div>

            <div className="bg-surface p-6 border border-line">
              <h2 className="font-display text-h3 text-ink mb-4">Why Buy From Us</h2>
              <ul className="border-t border-line">
                {[
                  "Verified documentation & history",
                  "Multi-point inspection before sale",
                  "Finance & exchange assistance",
                ].map((text) => (
                  <li key={text} className="border-b border-line py-3 text-body text-ink-2">
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Related browse links keep this page connected to the wider site */}
            <div className="bg-surface p-6 border border-line">
              <h2 className="font-display text-h3 text-ink mb-4">Browse similar</h2>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    vehicle.make && { label: `All ${vehicle.make}`, href: `/inventory?make=${encodeURIComponent(vehicle.make)}` },
                    vehicle.model && { label: `All ${vehicle.model}`, href: `/inventory?model=${encodeURIComponent(vehicle.model)}` },
                    vehicle.bodyType && { label: `${vehicle.bodyType}s`, href: `/inventory?bodyType=${encodeURIComponent(vehicle.bodyType)}` },
                    vehicle.fuel && { label: `${vehicle.fuel} cars`, href: `/inventory?fuel=${encodeURIComponent(vehicle.fuel)}` },
                    vehicle.transmission && { label: `${vehicle.transmission} cars`, href: `/inventory?transmission=${encodeURIComponent(vehicle.transmission)}` },
                    vehicle.year && { label: `${vehicle.year} models`, href: `/inventory?year=${vehicle.year}` },
                  ].filter(Boolean) as { label: string; href: string }[]
                ).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex min-h-11 items-center px-3 rounded-sm border border-line-strong text-small font-medium text-ink hover:bg-ground-2 transition-colors duration-(--duration-1)"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SIMILAR */}
      {similar.length > 0 && (
        <div className="container mx-auto px-6 md:px-12 pb-16">
          <div className="border-t border-line pt-12">
            <h2 className="font-display text-h2 text-ink mb-8">Similar Vehicles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {similar.map((v, index) => (
                <VehicleCard
                  key={v.id}
                  vehicle={v}
                  index={index}
                  onEnquire={(x) => onOpen(x, { intent: "Vehicle Enquiry", sourceLabel: "vdp-similar" })}
                  viewType="grid"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <FaqSection
        items={faqs}
        title={`${heading} — Questions & Answers`}
        intro={`Common questions about this specific car. Call ${PRIMARY_LOCATION.phone} if anything is not covered here.`}
      />

      <FrequentSearches searches={frequentSearches} />
    </div>
  )
}
