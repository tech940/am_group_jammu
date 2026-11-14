"use client"

import { useEffect, useRef, useState } from "react"
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

/** A card shows at most this many photos; the car page has the full gallery. */
const MAX_PHOTOS = 8

/** The first photo of the first few cards is above the fold on a phone. */
const EAGER_CARDS = 3

const ARROW =
  "pointer-events-auto h-11 w-11 rounded-sm border border-line bg-surface text-ink flex items-center justify-center " +
  "transition-colors duration-(--duration-1) hover:bg-ground-2 cursor-pointer"

/**
 * Photo strip for a card.
 *
 * The photos sit side by side in a native scroll-snap row, so a finger swipe
 * moves between them — the previous version swapped one image from state and
 * could only be driven by arrows that appear on hover, which a phone never has.
 *
 * - Vertical drags are not captured: the strip has no vertical overflow, so
 *   they pass straight to the page.
 * - `overscroll-x-contain` stops a swipe that reaches the last photo from
 *   dragging a parent rail (the homepage stock rail scrolls sideways too).
 * - Every slide is a link to the car page; only the first is a tab stop and
 *   only the first is exposed to assistive tech, so it reads as one link.
 * - A slide's image is mounted only once the previous slide has been reached,
 *   so a page of 24 cards does not fetch 192 photos nobody swiped to.
 */
function ImageArea({
  vehicle,
  eager,
  className,
}: {
  vehicle: InventoryVehicle
  eager: boolean
  className: string
}) {
  const images = vehicle.images.slice(0, MAX_PHOTOS)
  const count = images.length
  const href = `/inventory/${vehicle.slug}`

  const stripRef = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const [active, setActive] = useState(0)
  /** Furthest slide reached so far; images mount one slide ahead of it. */
  const [reached, setReached] = useState(0)

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  /* Throttled to one read per frame; the dots follow the scroll position. */
  const onScroll = () => {
    if (frame.current) return
    frame.current = requestAnimationFrame(() => {
      frame.current = 0
      const el = stripRef.current
      if (!el || el.clientWidth === 0) return
      const i = Math.min(count - 1, Math.max(0, Math.round(el.scrollLeft / el.clientWidth)))
      setActive(i)
      setReached((r) => Math.max(r, i))
    })
  }

  /* Pointer and keyboard path. Smoothness comes from `motion-safe:scroll-smooth`
     on the strip, so reduced-motion users get an instant jump. */
  const step = (dir: 1 | -1) => {
    const el = stripRef.current
    if (!el) return
    const next = (active + dir + count) % count
    setReached((r) => Math.max(r, next))
    el.scrollTo({ left: next * el.clientWidth })
  }

  return (
    <div className={`relative isolate bg-ground-2 overflow-hidden ${className}`}>
      {count > 0 ? (
        <>
          <div
            ref={stripRef}
            onScroll={count > 1 ? onScroll : undefined}
            className={`absolute inset-0 flex ${
              count > 1
                ? "no-scrollbar snap-x snap-mandatory overflow-x-auto overscroll-x-contain motion-safe:scroll-smooth"
                : "overflow-hidden"
            }`}
          >
            {images.map((src, i) => (
              <Link
                key={i}
                href={href}
                prefetch={i === 0 ? undefined : false}
                tabIndex={i === 0 ? undefined : -1}
                aria-hidden={i === 0 ? undefined : true}
                draggable={false}
                className="relative h-full w-full shrink-0 snap-start snap-always"
              >
                {i <= reached + 1 && (
                  <Image
                    src={src}
                    alt={i === 0 ? vehicle.title : ""}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    loading={i === 0 && eager ? "eager" : "lazy"}
                    draggable={false}
                    className="object-cover"
                  />
                )}
              </Link>
            ))}
          </div>

          {count > 1 && (
            <>
              {/* Arrows are for a mouse or keyboard. On touch the swipe does
                  the job, and an invisible 44px button would swallow taps. */}
              <div className="pointer-events-none absolute inset-x-3 top-1/2 z-30 flex -translate-y-1/2 justify-between opacity-0 transition-opacity duration-(--duration-2) group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:hidden">
                <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className={ARROW}>
                  <ChevronGlyph direction="left" />
                </button>
                <button type="button" onClick={() => step(1)} aria-label="Next photo" className={ARROW}>
                  <ChevronGlyph direction="right" />
                </button>
              </div>
              <div aria-hidden className="pointer-events-none absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 gap-1.5">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full ${i === active ? "w-5 bg-ground" : "w-1.5 bg-ground/50"}`}
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
      <div className="absolute inset-0 bg-gradient-to-t from-deep-2/35 via-transparent to-transparent pointer-events-none z-20" />

      {/* Badges — only rendered when the underlying data exists. They never
          take pointer events: a swipe or tap that starts on one still reaches
          the photo underneath. */}
      <div className="pointer-events-none absolute top-3 left-3 z-30 flex flex-wrap items-center gap-2">
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
        <div className="pointer-events-none absolute top-3 right-3 z-30">
          <span className="inline-flex items-center rounded-sm bg-deep px-2 py-0.5 text-meta uppercase text-on-deep">
            {vehicle.bodyType}
          </span>
        </div>
      )}
      {count > 1 && (
        <div className="pointer-events-none absolute bottom-3 right-3 z-30">
          <span className="inline-flex items-center rounded-sm bg-deep-2 px-2 py-0.5 text-meta text-on-deep" data-num>
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

/** Year, make and the linked title. The link is 44px tall for a thumb. */
function TitleBlock({ vehicle, href }: { vehicle: InventoryVehicle; href: string }) {
  const name = `${vehicle.year ? `${vehicle.year} ` : ""}${vehicle.title}`
  return (
    <div className="min-w-0 flex-1">
      <p className="text-meta uppercase text-ink-2" data-num>
        {[vehicle.year, vehicle.make].filter(Boolean).join(" • ")}
      </p>
      <Link href={href} aria-label={`View ${name}`} className="flex min-h-11 items-center">
        <h3 className="min-w-0 truncate font-display text-h3 text-ink transition-colors duration-(--duration-1) group-hover:text-accent-text-light">
          {name}
        </h3>
      </Link>
    </div>
  )
}

function SpecPills({ specs, className }: { specs: string[]; className: string }) {
  return (
    <div className={`flex flex-wrap ${className}`}>
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
  )
}

/** View Details is the primary action; both are 44px tall. */
function Actions({
  vehicle,
  href,
  onEnquire,
  className = "",
}: {
  vehicle: InventoryVehicle
  href: string
  onEnquire?: (v: InventoryVehicle) => void
  className?: string
}) {
  return (
    <div className={`flex gap-2.5 ${className}`}>
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
  )
}

export function VehicleCard({
  vehicle,
  index = 0,
  onEnquire,
  viewType = "grid",
}: {
  vehicle: InventoryVehicle
  /** Position in its list. The first few cards load their first photo eagerly. */
  index?: number
  onEnquire?: (v: InventoryVehicle) => void
  viewType?: "grid" | "list"
}) {
  const href = `/inventory/${vehicle.slug}`
  const eager = index < EAGER_CARDS

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
      <div className="group bg-surface border border-line rounded-md overflow-hidden transition-colors duration-(--duration-1) hover:border-line-strong flex flex-col sm:flex-row">
        <ImageArea
          vehicle={vehicle}
          eager={eager}
          className="h-52 sm:h-auto sm:min-h-52 sm:w-72 flex-shrink-0"
        />

        <div className="flex min-w-0 flex-1 flex-col justify-between p-5">
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <TitleBlock vehicle={vehicle} href={href} />
              <PriceBlock vehicle={vehicle} />
            </div>
            <SpecPills specs={specs} className="gap-2 mb-4" />
          </div>

          <Actions vehicle={vehicle} href={href} onEnquire={onEnquire} />
        </div>
      </div>
    )
  }

  /* ── GRID VIEW ─────────────────────────────────────────── */
  return (
    <div className="group bg-surface overflow-hidden rounded-md border border-line transition-colors duration-(--duration-1) hover:border-line-strong flex flex-col">
      <ImageArea
        vehicle={vehicle}
        eager={eager}
        className="h-[220px] sm:h-[240px] flex-shrink-0"
      />

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <TitleBlock vehicle={vehicle} href={href} />
          <PriceBlock vehicle={vehicle} />
        </div>

        <SpecPills specs={specs} className="gap-1.5 mb-4" />

        <div className="h-px bg-line mb-4" />

        <Actions vehicle={vehicle} href={href} onEnquire={onEnquire} className="mt-auto" />
      </div>
    </div>
  )
}
