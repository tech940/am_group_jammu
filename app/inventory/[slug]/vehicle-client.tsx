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
import type { SeoLink } from "@/lib/seo/links"
import type { VehicleNeighbour } from "@/lib/inventory/server"
import type { InventoryVehicle } from "@/lib/inventory/types"
import { pushEvent, vehicleParams } from "@/lib/analytics/gtm"
import { listItems } from "@/lib/analytics/events"
import { ListView } from "@/components/analytics/list-view"
import { whatsappUrl, H_PROMISE, LOCATIONS, PRIMARY_LOCATION } from "@/lib/locations"
import { ownersLabel } from "./car-facts"
import { VehicleGallery } from "./vehicle-gallery"

/** A link the server has already checked leads to a live, indexable page. */
export interface CarLink {
  label: string
  href: string
}

/** The one site a car is kept at, when the stock record names it. */
export interface CarSite {
  slug: string
  shortName: string
  city: string
  /** Null for a site whose street address is not confirmed. */
  address: string | null
}


const pagerLink =
  "h-11 px-3 rounded-sm border border-line-strong flex items-center text-meta uppercase text-ink hover:bg-ground-2 transition-colors duration-(--duration-1)"
const pagerOff =
  "h-11 px-3 rounded-sm border border-line bg-ground-2 flex items-center text-meta uppercase text-ink-3"
const contactLink =
  "flex min-h-11 items-center gap-2 text-body text-ink hover:text-accent-text-light transition-colors duration-(--duration-1)"

export default function VehicleClient({
  vehicle,
  name,
  sold,
  summary,
  dealerNotes,
  sellerNotes,
  faqs,
  crumbs,
  browseLinks,
  upLink,
  site,
  similar,
  frequentSearches,
  position,
  total,
  prev,
  next,
}: {
  vehicle: InventoryVehicle
  /**
   * The heading, the last crumb and the schema name: "2021 Hyundai Creta SX",
   * or with a fact added when another car on sale shares that name
   * ("2024 Kia Carens Petrol Automatic, 2,603 km").
   */
  name: string
  /**
   * True for a car that has been sold and still has a page. The page then
   * says so, drops every way of enquiring about THIS car, and points at
   * similar cars instead.
   */
  sold: boolean
  /** The car in a few plain sentences; see carSummary(). */
  summary: string
  /** The dealer's own description, one entry per paragraph. Often empty. */
  dealerNotes: string[]
  sellerNotes: string[]
  faqs: FaqItem[]
  crumbs: { label: string; href?: string }[]
  browseLinks: CarLink[]
  /** The closest page with cars on it, for the sold state. */
  upLink: CarLink
  site: CarSite | null
  similar: InventoryVehicle[]
  frequentSearches: SeoLink[]
  position: number
  total: number
  prev: VehicleNeighbour | null
  next: VehicleNeighbour | null
}) {
  const { onOpen } = useEnquiryModal()

  /* Every spec is conditional — this listing only shows what it actually has. */
  const specs = [
    vehicle.year !== null && { label: "Year", value: String(vehicle.year) },
    vehicle.variant && { label: "Variant", value: vehicle.variant },
    vehicle.mileage !== null && { label: "KMs Driven", value: vehicle.mileageLabel },
    vehicle.owners && { label: "Owners", value: ownersLabel(vehicle.owners) },
    // The series only ("JK02"). The full number plate is never stored or shown.
    vehicle.registration && { label: "Registration", value: vehicle.registration },
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
    // A sold car cannot be bought, so looking at its page is not a product view.
    if (sold) return
    pushEvent("view_item", {
      ...vehicleParams(vehicle),
      listing_position: position,
      listing_total: total,
    })
  }, [vehicle, position, total, sold])

  // One name for the heading, the photo alt text, the WhatsApp message and
  // the phone bar, so they cannot drift apart.
  const heading = name

  const whatsappHref = whatsappUrl(
    `Hi AM Group, I'm interested in the ${heading}` +
      `${vehicle.price !== null ? ` listed at ${vehicle.priceLabel}` : ""}. ` +
      `Is it still available? (Ref #${vehicle.id})`,
  )

  const showHPromise = H_PROMISE !== null && vehicle.make?.toLowerCase() === "hyundai"

  return (
    <div className="min-h-screen bg-ground">
      {/* The trail is resolved on the server (page.tsx) so that every level
          is a page that exists and may be indexed: the brand page and the
          model page, never a filtered search. */}
      <Breadcrumbs items={crumbs} />

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

          {/* A sold car has no place in the list of cars on sale. */}
          {!sold && (
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
          )}
        </div>

        <div className="order-1 grid grid-cols-1 gap-x-12 gap-y-5 pt-2 pb-8 md:order-none md:gap-y-10 md:py-4 lg:grid-cols-5">
          {/* PHOTOS — keyed so moving to the next car starts at its first photo. */}
          <div className="min-w-0 lg:col-span-3 lg:row-start-1">
            <VehicleGallery key={vehicle.id} images={vehicle.images} heading={heading} vehicleId={vehicle.id} />
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
              {sold ? (
                <Badge tone="neutral">Sold</Badge>
              ) : (
                vehicle.condition && <Badge tone="info">{vehicle.condition}</Badge>
              )}
            </div>

            {/* Year, make, model and variant in the heading itself: this line
                is what a search result or an assistant quotes as the car. */}
            <h1 className="mt-2 font-display text-h2 text-ink md:mt-3 md:text-h1">
              {heading}
              {sold && " (sold)"}
            </h1>

            {keyFacts.length > 0 && (
              <p className="mt-1 text-body text-ink-2 md:mt-2" data-num>
                {keyFacts.join(" · ")}
              </p>
            )}

            {sold ? (
              /* SOLD. No price to act on and no way to enquire about this
                 car: the one loud control goes to cars that can be bought. */
              <div className="mt-3 md:mt-6 md:border md:border-line md:bg-surface md:p-8">
                <p className="font-display text-h1 text-ink">Sold</p>
                <p className="mt-1 text-body text-ink-2">
                  This car has been sold and is no longer available.
                </p>
                <div className="mt-3 space-y-2 md:mt-6 md:space-y-3">
                  <Button asChild variant="primary" size="lg" full>
                    <Link href={upLink.href}>See similar cars</Link>
                  </Button>
                  <Button asChild variant="secondary" size="md" full>
                    <a
                      href={`tel:${PRIMARY_LOCATION.phoneE164}`}
                      data-track-location="vdp-sold"
                      aria-label={`Call ${PRIMARY_LOCATION.phone}`}
                    >
                      <PhoneGlyph />
                      Call
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
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
            )}

            {/* The whole car in plain sentences: what it is, what it costs,
                where it is and the number to ring. Built on the server only
                from facts the stock record holds. Under the buttons so that
                on a phone the photo, price and enquiry stay on the first
                screen. */}
            <p className="mt-4 text-body text-ink-2 md:mt-6">{summary}</p>
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
              {/* What the dealer wrote about this car comes first: it is the
                  only text on the page a person wrote about this one car.
                  Nothing is shown in its place when they have written none. */}
              <div className="space-y-4">
                {dealerNotes.map((para, i) => (
                  <p key={`dealer-${i}`} className="text-body text-ink">
                    {para}
                  </p>
                ))}
                {sellerNotes.map((para, i) => (
                  <p key={i} className="text-body text-ink-2">
                    {para}
                  </p>
                ))}
              </div>

              <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { k: "Listing ID", v: `#${vehicle.id}` },
                  { k: "Condition", v: sold ? "Sold" : (vehicle.condition ?? "Used") },
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
            {/* Where the car is, and who to ring. When the stock record names
                the site, that one site is shown. When it does not, the page
                lists all three and asks the buyer to ring: it never claims a
                location it has not been told. A sold car is nowhere to be
                seen, so the heading changes and only the sites are listed. */}
            <section className="border border-line bg-surface p-6">
              <h2 className="mb-2 font-display text-h3 text-ink">
                {sold ? "Our Jammu sites" : "Where to see this car"}
              </h2>
              <p className="text-body text-ink-2">
                {sold
                  ? "Similar cars are kept at our Jammu sites. Call and we will tell you what is in stock."
                  : site
                    ? `This car is kept at our ${site.shortName} site in ${site.city}. Call before you travel so it is ready for you.`
                    : "Available at our Jammu sites — call to confirm which location this car is at."}
              </p>

              <ul className="mt-4 border-t border-line">
                {(!sold && site
                  ? [{ slug: site.slug, shortName: site.shortName, line: site.address ?? "Exact address on request, call for directions" }]
                  : LOCATIONS.map((loc) => ({
                      slug: loc.slug,
                      shortName: loc.shortName,
                      line: loc.addressConfirmed
                        ? `${loc.streetAddress}, ${loc.landmark}`
                        : `${loc.landmark} — exact address on request, call for directions`,
                    }))
                ).map((loc) => (
                  <li key={loc.slug} className="border-b border-line">
                    <Link
                      href={`/locations/${loc.slug}`}
                      className="group flex min-h-11 items-center justify-between gap-3 py-3"
                    >
                      <span className="min-w-0">
                        <span className="block text-body font-semibold text-ink transition-colors duration-(--duration-1) group-hover:text-accent-text-light">
                          {loc.shortName}
                        </span>
                        <span className="block text-small text-ink-2">{loc.line}</span>
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
              {/* Two lines about verified history and a multi-point inspection
                  were removed: nothing on record describes either. The line
                  left is a service every site lists in lib/locations.ts. */}
              <ul className="border-t border-line">
                {[
                  "Finance & exchange assistance",
                ].map((text) => (
                  <li key={text} className="border-b border-line py-3 text-body text-ink-2">
                    {text}
                  </li>
                ))}
              </ul>
            </section>

            {/* Links up to the brand, model, body, fuel and gearbox pages.
                The server chose them (page.tsx): each is a real page that may
                be indexed, with link text that says what is on it, so a car
                page passes its weight to the page for its make and model. */}
            <section className="border border-line bg-surface p-6">
              <h2 className="mb-4 font-display text-h3 text-ink">Browse similar</h2>
              <div className="flex flex-wrap gap-2">
                {browseLinks.map((link) => (
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
            <h2 className="font-display text-h2 text-ink mb-8">
              {sold ? "Similar cars in stock" : "Similar cars"}
            </h2>
            {/* Reports the row as a list, and names it for a click on a card. */}
            <ListView listId="vdp-similar" listName="Similar cars" items={listItems(similar)} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8" data-track-list="vdp-similar" data-track-list-name="Similar cars">
              {similar.map((v, index) => (
                <VehicleCard
                  key={v.id}
                  vehicle={v}
                  index={index}
                  // These sit below a full gallery, so none of them loads its
                  // photo ahead of time: the car's own first photo is the only
                  // image the browser is asked to hurry.
                  eager={false}
                  onEnquire={(x) => onOpen(x, { intent: "Vehicle Enquiry", sourceLabel: "vdp-similar" })}
                  viewType="grid"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* The questions are about buying this car, so a sold car has none. */}
      {faqs.length > 0 && (
        <FaqSection
          items={faqs}
          title={`${heading} — Questions & Answers`}
          intro={`Common questions about this specific car. Call ${PRIMARY_LOCATION.phone} if anything is not covered here.`}
        />
      )}

      <FrequentSearches searches={frequentSearches} />

      {/* Phone action bar. `sticky`, not `fixed`: it rides directly above the
          site-wide tab bar (4rem + the home-indicator inset) for the whole car
          page, then comes to rest at the end of the page instead of covering
          the footer — so it takes its own space and no extra padding is needed.
          Hidden from md up, where the price panel is already on screen.
          Not shown for a sold car: there is nothing to ask the price of. */}
      {!sold && (
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
      )}
    </div>
  )
}
