"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronGlyph } from "@/components/system/marks"
import { Button } from "@/components/ui/button"
import type { InventoryVehicle } from "@/lib/inventory/types"
import { trackGalleryInteract } from "@/lib/analytics/events"

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

/**
 * How wide a card's photo is drawn, for the browser's choice of image file.
 * This default is the three-column grid (/inventory, landing and brand pages):
 * full width on a phone, half from 768px, a third from 1024px. A caller that
 * draws cards at a fixed width (the sideways rails) passes its own value.
 */
const GRID_SIZES = "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"

const ARROW =
  "pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface/90 text-ink " +
  "shadow-raised transition-colors duration-(--duration-1) hover:bg-surface hover:text-accent cursor-pointer"

/** A mouse drag shorter than this is still a click on the photo. */
const DRAG_THRESHOLD = 6

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
  sizes,
  className,
}: {
  vehicle: InventoryVehicle
  eager: boolean
  sizes: string
  className: string
}) {
  const images = vehicle.images.slice(0, MAX_PHOTOS)
  const count = images.length
  const href = `/inventory/${vehicle.slug}`
  // Says which car this is. The bare title ("Kia Seltos") was the same text
  // on four different cars; the year and colour tell them apart.
  const photoName =
    `${vehicle.year ? `${vehicle.year} ` : ""}${vehicle.title}` + (vehicle.colour ? `, ${vehicle.colour}` : "")

  const stripRef = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const anim = useRef(0)
  const guard = useRef(0)
  /** The photo an arrow or drag is currently moving to. */
  const target = useRef(0)
  const [active, setActive] = useState(0)
  /** Furthest slide reached so far; images mount one slide ahead of it. */
  const [reached, setReached] = useState(0)

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current)
      cancelAnimationFrame(anim.current)
      window.clearTimeout(guard.current)
    },
    [],
  )

  /* Throttled to one read per frame; the dots follow the scroll position. */
  const onScroll = () => {
    if (frame.current) return
    frame.current = requestAnimationFrame(() => {
      frame.current = 0
      const el = stripRef.current
      if (!el || el.clientWidth === 0 || el.dataset.dragging) return
      const i = Math.min(count - 1, Math.max(0, Math.round(el.scrollLeft / el.clientWidth)))
      setActive(i)
      setReached((r) => Math.max(r, i))
    })
  }

  /* Arrow path. */
  const step = (dir: 1 | -1) => {
    const el = stripRef.current
    if (!el) return
    // From where the strip is heading, not from `active`: that state follows
    // the scroll a frame behind, so two quick clicks would both read the same
    // photo and the second would do nothing.
    const from = el.dataset.dragging ? target.current : Math.round(el.scrollLeft / el.clientWidth)
    settle((from + dir + count) % count)
    // Measurement only, after the move has started. It sends once per car per
    // page however many times the arrows are pressed.
    trackGalleryInteract(vehicle.id, "arrow", "card")
  }

  /* Move the strip to a photo, animating the scroll position by hand.

     The browser's own smooth scroll is not used: inside a scroll-snap strip
     that React is re-rendering (the next image mounts as it is reached) the
     smooth scroll was being cancelled, so the arrows called scrollTo and the
     strip stayed exactly where it was. Here snap is switched off for the
     ~260ms of the move (data-dragging), scrollLeft is set each frame, and snap
     comes back on at rest. Reduced motion jumps straight there. */
  const settle = (next: number) => {
    const el = stripRef.current
    if (!el) return
    target.current = next
    setActive(next)
    setReached((r) => Math.max(r, next))
    cancelAnimationFrame(anim.current)
    window.clearTimeout(guard.current)
    const from = el.scrollLeft
    const to = next * el.clientWidth
    const finish = () => {
      cancelAnimationFrame(anim.current)
      window.clearTimeout(guard.current)
      el.scrollLeft = to
      delete el.dataset.dragging
    }
    el.dataset.dragging = "true"
    if (from === to || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish()
      return
    }
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 260)
      el.scrollLeft = from + (to - from) * (1 - Math.pow(1 - t, 3))
      if (t < 1) anim.current = requestAnimationFrame(tick)
      else finish()
    }
    anim.current = requestAnimationFrame(tick)
    // Frames stop arriving when the tab is in the background. Without this the
    // strip would be left part-way with snapping switched off.
    guard.current = window.setTimeout(finish, 500)
  }

  /* Mouse drag. Touch already scrolls the strip natively, so this handles the
     mouse only: press, drag sideways, release, and it settles on the nearest
     photo. Snap is switched off while the button is down (data-dragging), or
     the browser would fight every pixel of the drag. */
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null)
  const suppressClick = useRef(false)

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return
    const el = stripRef.current
    if (!el) return
    cancelAnimationFrame(anim.current)
    window.clearTimeout(guard.current)
    drag.current = { x: e.clientX, left: el.scrollLeft, moved: false }
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    const el = stripRef.current
    if (!d || !el) return
    const dx = e.clientX - d.x
    if (!d.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return
      d.moved = true
      el.dataset.dragging = "true"
      // Capture keeps the drag alive when the cursor leaves the card. It can
      // throw for a pointer the browser no longer tracks; the drag still works.
      try {
        el.setPointerCapture(e.pointerId)
      } catch {}
      // Mount the neighbours so the drag never reveals an empty slide.
      setReached((r) => Math.max(r, Math.min(count - 1, active + 1)))
    }
    el.scrollLeft = d.left - dx
  }
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    const el = stripRef.current
    drag.current = null
    if (!d || !el || !d.moved) return
    suppressClick.current = true
    const dx = e.clientX - d.x
    const from = Math.round(d.left / el.clientWidth)
    // A short flick is enough to move one photo; otherwise settle on the nearest.
    const target =
      Math.abs(dx) > el.clientWidth * 0.15
        ? from + (dx < 0 ? 1 : -1)
        : Math.round(el.scrollLeft / el.clientWidth)
    const next = Math.min(count - 1, Math.max(0, target))
    try {
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
    } catch {}
    settle(next)
  }
  /* The click that ends a drag must not open the car page. */
  const onClickCapture = (e: React.MouseEvent) => {
    if (!suppressClick.current) return
    suppressClick.current = false
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div className={`relative isolate bg-ground-2 overflow-hidden ${className}`}>
      {count > 0 ? (
        <>
          <div
            ref={stripRef}
            onScroll={count > 1 ? onScroll : undefined}
            onPointerDown={count > 1 ? onPointerDown : undefined}
            onPointerMove={count > 1 ? onPointerMove : undefined}
            onPointerUp={count > 1 ? endDrag : undefined}
            onPointerCancel={count > 1 ? endDrag : undefined}
            onClickCapture={count > 1 ? onClickCapture : undefined}
            className={`absolute inset-0 flex ${
              count > 1
                ? "no-scrollbar snap-x snap-mandatory overflow-x-auto overscroll-x-contain " +
                  "md:cursor-grab data-[dragging]:cursor-grabbing data-[dragging]:snap-none data-[dragging]:scroll-auto data-[dragging]:select-none"
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
                    alt={i === 0 ? photoName : `${photoName}, photo ${i + 1}`}
                    fill
                    sizes={sizes}
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
              {/* Arrows are for a mouse or keyboard, and are always visible
                  from tablet width up: hidden-until-hover arrows were not being
                  found. On a phone the swipe does the job and the arrows would
                  cover a third of the photo, so they are not shown. */}
              <div className="pointer-events-none absolute inset-x-2.5 top-1/2 z-30 flex -translate-y-1/2 justify-between">
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
      <div className="pointer-events-none absolute inset-x-3 top-3 z-30 flex flex-wrap items-center gap-2">
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
        {/* In the same wrapping row as the other badges, pushed to the right:
            as a separate absolutely-placed badge it sat on top of the discount
            on a narrow card ("50%" hidden behind "Premium Hatchback"). */}
        {vehicle.bodyType && (
          <span className="ml-auto inline-flex items-center rounded-sm bg-deep px-2 py-0.5 text-meta uppercase text-on-deep">
            {vehicle.bodyType}
          </span>
        )}
      </div>
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
  sizes = GRID_SIZES,
  eager = index < EAGER_CARDS,
}: {
  vehicle: InventoryVehicle
  /**
   * Position in its list, counted from 0. It is written on the card as
   * data-track-index, which is how a click on the card is reported with its
   * position (components/analytics/link-tracker.tsx).
   */
  index?: number
  onEnquire?: (v: InventoryVehicle) => void
  viewType?: "grid" | "list"
  /** The `sizes` of the photo, when the card is not in the three-column grid. */
  sizes?: string
  /**
   * Whether the first photo loads straight away. By default the first few
   * cards of a list do. A list that sits far down its page passes false.
   */
  eager?: boolean
}) {
  const href = `/inventory/${vehicle.slug}`

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
      <div data-track-index={index} className="group bg-surface border border-line rounded-md overflow-hidden transition-colors duration-(--duration-1) hover:border-line-strong flex flex-col sm:flex-row">
        <ImageArea
          vehicle={vehicle}
          eager={eager}
          // The list row's photo is the full width on a phone and 288px beside the text.
          sizes="(max-width: 639px) 100vw, 288px"
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
    <div data-track-index={index} className="group flex h-full flex-col overflow-hidden rounded-md border border-line bg-surface transition-colors duration-(--duration-1) hover:border-line-strong">
      <ImageArea
        vehicle={vehicle}
        eager={eager}
        sizes={sizes}
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
