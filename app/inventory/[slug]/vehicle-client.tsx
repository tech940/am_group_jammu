"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, Check, Shield, Zap, Phone, Mail, MapPin, Gauge, Fuel, Settings2, Calendar, Palette, Cog, ImageOff, FileText, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VehicleCard } from "@/components/ui/vehicle-card"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { FaqSection } from "@/components/seo/faq-section"
import type { FaqItem } from "@/components/seo/faq-section"
import { FrequentSearches, SeoLinkDirectory } from "@/components/seo/frequent-searches"
import type { SeoLink, SeoLinkGroup } from "@/lib/seo/links"
import type { VehicleNeighbour } from "@/lib/inventory/server"
import type { InventoryVehicle } from "@/lib/inventory/types"
import { pushEvent, vehicleParams } from "@/lib/analytics/gtm"
import { whatsappUrl } from "@/lib/locations"

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
    vehicle.year !== null && { label: "Year", value: String(vehicle.year), icon: Calendar },
    vehicle.mileage !== null && { label: "KMs Driven", value: vehicle.mileageLabel, icon: Gauge },
    vehicle.fuel && { label: "Fuel", value: vehicle.fuel, icon: Fuel },
    vehicle.transmission && { label: "Transmission", value: vehicle.transmission, icon: Settings2 },
    vehicle.drivetrain && { label: "Drivetrain", value: vehicle.drivetrain, icon: Cog },
    vehicle.bodyType && { label: "Body Type", value: vehicle.bodyType, icon: Shield },
    vehicle.colour && { label: "Colour", value: vehicle.colour, icon: Palette },
    vehicle.engine && { label: "Engine", value: vehicle.engine, icon: Zap },
  ].filter(Boolean) as { label: string; value: string; icon: React.ElementType }[]

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
    <div className="min-h-screen bg-white">
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
            className="inline-flex items-center gap-2 text-black/60 hover:text-black transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back to Inventory</span>
          </Link>

          <nav aria-label="Vehicle pagination" className="flex items-center gap-2">
            {prev ? (
              <Link
                href={`/inventory/${prev.slug}`}
                rel="prev"
                title={`${prev.year ?? ""} ${prev.title}`.trim()}
                className="h-9 px-3 rounded-xl border border-black/10 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#023468] hover:bg-[#023468] hover:text-white transition-all"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </Link>
            ) : (
              <span className="h-9 px-3 rounded-xl border border-black/5 bg-zinc-50 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-black/20">
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </span>
            )}

            <span className="text-[11px] font-bold text-black/40 px-1 whitespace-nowrap">
              Car {position} of {total}
            </span>

            {next ? (
              <Link
                href={`/inventory/${next.slug}`}
                rel="next"
                title={`${next.year ?? ""} ${next.title}`.trim()}
                className="h-9 px-3 rounded-xl border border-black/10 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#023468] hover:bg-[#023468] hover:text-white transition-all"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className="h-9 px-3 rounded-xl border border-black/5 bg-zinc-50 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-black/20">
                Next <ChevronRight className="h-3.5 w-3.5" />
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
            <div className="relative h-[380px] md:h-[560px] bg-zinc-100 rounded-3xl overflow-hidden shadow-2xl">
              {hasImages ? (
                <>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={images[currentImage]}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
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
                        <button onClick={prevImage} aria-label="Previous photo"
                          className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-white shadow-xl transition-all cursor-pointer">
                          <ArrowLeft className="h-5 w-5 text-black" />
                        </button>
                        <button onClick={nextImage} aria-label="Next photo"
                          className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-white shadow-xl transition-all cursor-pointer">
                          <ArrowRight className="h-5 w-5 text-black" />
                        </button>
                      </div>

                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full">
                        <span className="text-white text-xs font-bold">
                          {currentImage + 1} / {images.length}
                        </span>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-black/25">
                  <ImageOff className="h-10 w-10" />
                  <span className="text-xs font-black uppercase tracking-widest">
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
                    onClick={() => setCurrentImage(i)}
                    aria-label={`View photo ${i + 1}`}
                    className={`relative aspect-4/3 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      i === currentImage ? "border-[#023468] scale-95" : "border-transparent hover:border-black/20"
                    }`}
                  >
                    <Image src={src} alt="" fill sizes="120px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Specifications */}
            {specs.length > 0 && (
              <div className="bg-zinc-50 rounded-[40px] p-8 md:p-12 border border-black/5">
                <h2 className="text-2xl font-black text-[#023468] mb-10 flex items-center gap-3">
                  <div className="h-8 w-1 bg-[#E31837] rounded-full" />
                  Vehicle Specifications
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-1">
                  {specs.map((spec) => (
                    <div key={spec.label} className="flex justify-between items-center py-4 border-b border-black/5">
                      <span className="flex items-center gap-2.5 text-black/40 text-xs font-bold uppercase tracking-widest">
                        <spec.icon className="h-4 w-4" />
                        {spec.label}
                      </span>
                      <span className="font-black text-[#023468] text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SELLER'S NOTES */}
            <section>
              <h2 className="text-2xl font-black text-[#023468] mb-6 flex items-center gap-3">
                <div className="h-8 w-1 bg-[#E31837] rounded-full" />
                <FileText className="h-5 w-5" />
                Seller&apos;s Notes
              </h2>
              <div className="space-y-4">
                {sellerNotes.map((para, i) => (
                  <p key={i} className="text-black/70 text-[15px] md:text-base leading-relaxed">
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
                  <div key={item.k} className="rounded-2xl bg-zinc-50 border border-black/5 px-4 py-3">
                    <dt className="text-[9px] font-black uppercase tracking-widest text-black/35">{item.k}</dt>
                    <dd className="text-sm font-black text-[#023468] mt-0.5">{item.v}</dd>
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
                  <span className="text-sm font-black uppercase tracking-widest text-black/40">
                    {[vehicle.year, vehicle.make].filter(Boolean).join(" • ")}
                  </span>
                )}
                {vehicle.condition && (
                  <span className="px-3 py-1 bg-[#023468] text-white text-xs font-black uppercase tracking-widest rounded-full">
                    {vehicle.condition}
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#023468] mb-4">{vehicle.title}</h1>
            </div>

            {/* Price */}
            <div className="bg-zinc-50 rounded-3xl p-8 border border-black/5">
              <div className="text-center mb-6">
                <span className="text-sm text-black/60 uppercase tracking-widest">
                  {vehicle.price === null ? "Price" : "Asking Price"}
                </span>
                <div className="text-4xl font-bold text-[#023468] mt-2">{vehicle.priceLabel}</div>
                {vehicle.originalPriceLabel && (
                  <div className="mt-2 flex items-center justify-center gap-3">
                    <span className="text-sm text-black/35 line-through">{vehicle.originalPriceLabel}</span>
                    {vehicle.discountPercent !== null && (
                      <span className="px-2 py-0.5 rounded-full bg-[#E31837] text-white text-[10px] font-black uppercase tracking-widest">
                        {vehicle.discountPercent}% off
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => onOpen(vehicle, { intent: "Vehicle Enquiry", sourceLabel: "vdp-best-price" })}
                  className="w-full h-14 bg-[#023468] hover:bg-[#01254a] text-white font-black uppercase tracking-widest text-sm"
                >
                  Get Best Price
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onOpen(vehicle, { intent: "Test Drive", sourceLabel: "vdp-test-drive" })}
                  className="w-full h-14 border-black/20 hover:bg-black hover:text-white font-black uppercase tracking-widest text-sm"
                >
                  Schedule Test Drive
                </Button>

                {/* WhatsApp is usually the highest-volume enquiry channel for a
                    J&K dealership — prefilled with this exact car so the buyer
                    does not have to describe it. */}
                <a
                  href={whatsappUrl(
                    `Hi AM Group, I'm interested in the ${heading}` +
                      `${vehicle.price !== null ? ` listed at ${vehicle.priceLabel}` : ""}. ` +
                      `Is it still available? (Ref #${vehicle.id})`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track-location="vdp-whatsapp"
                  className="w-full h-14 rounded-md bg-[#25D366] hover:bg-[#1da851] text-white font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2.5 transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp Us
                </a>
              </div>
            </div>

            {/* Quick contact */}
            <div className="bg-white rounded-3xl p-6 border border-black/5">
              <h2 className="text-lg font-bold text-black mb-4">Quick Contact</h2>
              <div className="space-y-3">
                <a href="tel:+919419100000" data-track-location="vdp-quick-contact" className="flex items-center gap-3 text-black/70 hover:text-[#023468] transition-colors">
                  <Phone className="h-5 w-5" />
                  <span>+91 94191 00000</span>
                </a>
                <a href="mailto:info@amgroupind.com" className="flex items-center gap-3 text-black/70 hover:text-[#023468] transition-colors">
                  <Mail className="h-5 w-5" />
                  <span>info@amgroupind.com</span>
                </a>
                <div className="flex items-start gap-3 text-black/70">
                  <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>AM Business Park, N-H 1 Bye-Pass Road, Jammu</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-black/5">
              <h2 className="text-lg font-bold text-black mb-4">Why Buy From Us</h2>
              <div className="space-y-3">
                {[
                  { icon: Shield, text: "Verified documentation & history" },
                  { icon: Check, text: "Multi-point inspection before sale" },
                  { icon: Zap, text: "Finance & exchange assistance" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-[#023468] shrink-0" />
                    <span className="text-black/70 text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Related browse links keep this page connected to the wider site */}
            <div className="bg-white rounded-3xl p-6 border border-black/5">
              <h2 className="text-lg font-bold text-black mb-4">Browse similar</h2>
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
                    className="px-3 py-1.5 rounded-full border border-black/10 text-[11px] font-bold text-[#023468] hover:bg-[#023468] hover:text-white transition-all"
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
          <div className="border-t border-black/5 pt-12">
            <h2 className="text-3xl font-bold text-black mb-8">Similar Vehicles</h2>
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
        intro="Common questions about this specific car. Call +91 94191 00000 if anything is not covered here."
      />

      <FrequentSearches searches={frequentSearches} />
    </div>
  )
}
