"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { ChatGlyph, ChevronGlyph, PhoneGlyph } from "@/components/system/marks"
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
import { whatsappUrl, H_PROMISE, LOCATIONS, PRIMARY_LOCATION } from "@/lib/locations"
import { VehicleGallery } from "./vehicle-gallery"

const pagerLink =
  "h-11 px-3 rounded-sm border border-line-strong flex items-center text-meta uppercase text-ink hover:bg-ground-2 transition-colors duration-(--duration-1)"
const pagerOff =
  "h-11 px-3 rounded-sm border border-line bg-ground-2 flex items-center text-meta uppercase text-ink-3"
const contactLink =
  "flex min-h-11 items-center gap-2 text-body text-ink hover:text-accent-text-light transition-colors duration-(--duration-1)"

export default function VehicleClient({
  vehicle,
  similar,
  sellerNotes,
  faqs,
  frequentSearches,
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

  /* The three facts a buyer checks first, shown directly under the title. */
  const keyFacts = [
    vehicle.mileage !== null ? vehicle.mileageLabel : null,
    vehicle.fuel,
    vehicle.transmission,
  ].filter(Boolean) as string[]

  // Keyed on the vehicle, not []: the prev/next links swap the vehicle without
  // remounting this component, so an empty dep array would miss those views.
  useEffect(() => {
    pushEvent("view_item", {
      ...vehicleParams(vehicle),
      listing_position: position,
      listing_total: total,
    })
  }, [vehicle, position, total])

  const heading = `${vehicle.year ? `${vehicle.year} ` : ""}${vehicle.title}`

  const whatsappHref = whatsappUrl(
    `Hi AM Group, I'm interested in the ${heading}` +
      `${vehicle.price !== null ? ` listed at ${vehicle.priceLabel}` : ""}. ` +
      `Is it still available? (Ref #${vehicle.id})`,
  )

  const showHPromise = H_PROMISE !== null && vehicle.make?.toLowerCase() === "hyundai"

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

      <div className="container mx-auto flex flex-col px-6 md:px-12">
        {/* Back link + prev/next through the full listing. On a phone this row
            sits under the car, so the photo, price and enquiry button are what
            the first screen shows. */}
        <div className="order-2 flex flex-wrap items-center justify-between gap-3 pb-8 md:order-none md:pb-0 md:pt-2">
          <Link
            href="/inventory"
            className="inline-flex min-h-11 items-center gap-1 text-body font-medium text-ink-2 hover:text-ink transition-colors duration-(--duration-1)"
          >
            <ChevronGlyph direction="left" />
            All used cars
          </Link>

          <nav aria-label="Vehicle pagination" className="flex items-center gap-2">
            {prev ? (
              <Link
                href={`/inventory/${prev.slug}`}
                rel="prev"
                title={`${prev.year ?? ""} ${prev.title}`.trim()}
                className={pagerLink}
              >
                Prev
              </Link>
            ) : (
              <span className={pagerOff}>Prev</span>
            )}

            <span className="text-meta text-ink-2 px-1 whitespace-nowrap" data-num>
              Car {position} of {total}
            </span>

            {next ? (
              <Link
                href={`/inventory/${next.slug}`}
                rel="next"
                title={`${next.year ?? ""} ${next.title}`.trim()}
                className={pagerLink}
              >
                Next
              </Link>
            ) : (
              <span className={pagerOff}>Next</span>
            )}
          </nav>
        </div>

        <div className="order-1 grid grid-cols-1 gap-x-12 gap-y-5 pt-2 pb-8 md:order-none md:gap-y-10 md:py-4 lg:grid-cols-5">
          {/* PHOTOS — keyed so moving to the next car starts at its first photo. */}
          <div className="min-w-0 lg:col-span-3 lg:row-start-1">
            <VehicleGallery key={vehicle.id} images={vehicle.images} heading={heading} />
          </div>

          {/* SUMMARY — title, price and the enquiry actions. Directly under the
              photo on a phone, top of the right-hand column on a desktop. */}
          <div className="min-w-0 lg:col-span-2 lg:col-start-4 lg:row-start-1">
            <div className="flex flex-wrap items-center gap-3">
              {(vehicle.year || vehicle.make) && (
                <span className="text-meta uppercase text-ink-2" data-num>
                  {[vehicle.year, vehicle.make].filter(Boolean).join(" • ")}
                </span>
              )}
              {vehicle.condition && <Badge tone="info">{vehicle.condition}</Badge>}
            </div>

            <h1 className="mt-2 font-display text-h2 text-ink md:mt-3 md:text-h1">{vehicle.title}</h1>

            {keyFacts.length > 0 && (
              <p className="mt-1 text-body text-ink-2 md:mt-2" data-num>
                {keyFacts.join(" · ")}
              </p>
            )}

            <div className="mt-3 md:mt-6 md:border md:border-line md:bg-surface md:p-8">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="sr-only">{vehicle.price === null ? "Price" : "Asking price"}</span>
                <span className="font-display text-h1 text-ink" data-num>
                  {vehicle.priceLabel}
                </span>
                {vehicle.originalPriceLabel && (
                  <>
                    <span className="text-small text-ink-3 line-through" data-num>
                      {vehicle.originalPriceLabel}
                    </span>
                    {vehicle.discountPercent !== null && (
                      <span className="px-2 py-0.5 rounded-sm bg-accent text-on-accent text-meta uppercase" data-num>
                        {vehicle.discountPercent}% off
                      </span>
                    )}
                  </>
                )}
              </div>

              <div className="mt-3 space-y-2 md:mt-6 md:space-y-3">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  full
                  onClick={() => onOpen(vehicle, { intent: "Vehicle Enquiry", sourceLabel: "vdp-hero" })}
                >
                  Get best price
                </Button>

                {/* Call and WhatsApp are how most buyers here actually enquire.
                    The WhatsApp message is prefilled with this exact car. */}
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <Button asChild variant="secondary" size="md" full>
                    <a
                      href={`tel:${PRIMARY_LOCATION.phoneE164}`}
                      data-track-location="vdp-hero"
                      aria-label={`Call ${PRIMARY_LOCATION.phone}`}
                    >
                      <PhoneGlyph />
                      Call
                    </a>
                  </Button>
                  <Button asChild variant="secondary" size="md" full>
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-track-location="vdp-hero"
                    >
                      <ChatGlyph />
                      WhatsApp
                    </a>
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  full
                  onClick={() => onOpen(vehicle, { intent: "Test Drive", sourceLabel: "vdp-test-drive" })}
                >
                  Book a test drive
                </Button>
              </div>
            </div>
          </div>

          {/* DETAILS */}
          <div className="min-w-0 space-y-10 lg:col-span-3 lg:row-start-2">
            {specs.length > 0 && (
              <section className="border border-line bg-surface p-6 md:p-10">
                <h2 className="mb-4 font-display text-h2 text-ink md:mb-6">Car details</h2>
                <dl className="grid grid-cols-1 gap-x-16 sm:grid-cols-2">
                  {specs.map((spec) => (
                    <div key={spec.label} className="flex items-center justify-between gap-4 border-b border-line py-4">
                      <dt className="text-meta uppercase text-ink-2">{spec.label}</dt>
                      <dd className="text-right text-body font-semibold text-ink" data-num>
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <section>
              <h2 className="mb-4 font-display text-h2 text-ink">About this car</h2>
              <div className="space-y-4">
                {sellerNotes.map((para, i) => (
                  <p key={i} className="text-body text-ink-2">
                    {para}
                  </p>
                ))}
              </div>

              <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { k: "Listing ID", v: `#${vehicle.id}` },
                  { k: "Condition", v: vehicle.condition ?? "Used" },
                  { k: "Photos", v: String(vehicle.photoCount) },
                  {
                    k: "Listed",
                    v: vehicle.postedAt
                      ? new Date(vehicle.postedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          timeZone: "Asia/Kolkata",
                        })
                      : "—",
                  },
                ].map((item) => (
                  <div key={item.k} className="border border-line bg-surface px-4 py-3">
                    <dt className="text-meta uppercase text-ink-2">{item.k}</dt>
                    <dd className="mt-0.5 text-body font-semibold text-ink" data-num>
                      {item.v}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          {/* SIDE COLUMN */}
          <aside className="min-w-0 space-y-6 lg:col-span-2 lg:col-start-4 lg:row-start-2">
            {/* Where the car is, and who to ring. Stock is spread across three
                sites, so the page does not claim a location for this car. */}
            <section className="border border-line bg-surface p-6">
              <h2 className="mb-2 font-display text-h3 text-ink">Where to see this car</h2>
              <p className="text-body text-ink-2">
                Available at our Jammu sites — call to confirm which location this car is at.
              </p>

              <ul className="mt-4 border-t border-line">
                {LOCATIONS.map((loc) => (
                  <li key={loc.slug} className="border-b border-line">
                    <Link
                      href={`/locations/${loc.slug}`}
                      className="group flex min-h-11 items-center justify-between gap-3 py-3"
                    >
                      <span className="min-w-0">
                        <span className="block text-body font-semibold text-ink transition-colors duration-(--duration-1) group-hover:text-accent-text-light">
                          {loc.shortName}
                        </span>
                        <span className="block text-small text-ink-2">
                          {loc.addressConfirmed
                            ? `${loc.streetAddress}, ${loc.landmark}`
                            : `${loc.landmark} — exact address on request, call for directions`}
                        </span>
                      </span>
                      <ChevronGlyph className="text-ink-3" />
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-2 flex flex-col">
                <a
                  href={`tel:${PRIMARY_LOCATION.phoneE164}`}
                  data-track-location="vdp-contact"
                  className={contactLink}
                  data-num
                >
                  <PhoneGlyph />
                  {PRIMARY_LOCATION.phone}
                </a>
                {showHPromise && H_PROMISE && (
                  <a
                    href={`tel:${H_PROMISE.phoneE164}`}
                    data-track-location="vdp-hpromise"
                    className={contactLink}
                  >
                    <PhoneGlyph />
                    <span>
                      H Promise line: <span data-num>{H_PROMISE.phone}</span>
                    </span>
                  </a>
                )}
                <a href={`mailto:${PRIMARY_LOCATION.email}`} className={contactLink}>
                  {PRIMARY_LOCATION.email}
                </a>
              </div>
            </section>

            <section className="border border-line bg-surface p-6">
              <h2 className="mb-4 font-display text-h3 text-ink">Why buy from us</h2>
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
            </section>

            {/* Related browse links keep this page connected to the wider site */}
            <section className="border border-line bg-surface p-6">
              <h2 className="mb-4 font-display text-h3 text-ink">Browse similar</h2>
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
            </section>
          </aside>
        </div>
      </div>

      {/* SIMILAR */}
      {similar.length > 0 && (
        <div className="container mx-auto px-6 md:px-12 pb-16">
          <div className="border-t border-line pt-12">
            <h2 className="font-display text-h2 text-ink mb-8">Similar cars</h2>
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

      {/* Phone action bar. `sticky`, not `fixed`: it rides directly above the
          site-wide tab bar (4rem + the home-indicator inset) for the whole car
          page, then comes to rest at the end of the page instead of covering
          the footer — so it takes its own space and no extra padding is needed.
          Hidden from md up, where the price panel is already on screen. */}
      <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-line bg-surface md:hidden">
        <div className="flex items-center justify-between gap-4 px-6 py-2">
          <div className="min-w-0">
            <span className="block truncate text-caption text-ink-2">{heading}</span>
            <span className="block font-display text-h3 text-ink" data-num>
              {vehicle.priceLabel}
            </span>
          </div>
          <Button
            type="button"
            variant="primary"
            size="md"
            className="shrink-0"
            onClick={() => onOpen(vehicle, { intent: "Vehicle Enquiry", sourceLabel: "vdp-sticky-bar" })}
          >
            Get best price
          </Button>
        </div>
      </div>
    </div>
  )
}
