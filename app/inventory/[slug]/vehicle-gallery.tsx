"use client"

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"
import Image from "next/image"
import { ChevronGlyph } from "@/components/system/marks"
import { useReducedMotionSafe } from "@/components/system/use-reduced-motion"
import { trackGalleryDepth, trackGalleryInteract } from "@/lib/analytics/events"

/**
 * The car's photos as one native horizontal strip.
 *
 * It is a plain scroll-snap strip: the browser does the swiping, momentum and
 * snapping, and the only script is the counter (which reads the scroll
 * position) and the prev / next buttons for people using a mouse.
 *
 * WHICH PHOTOS ARE IN THE PAGE. A car has up to 49 photos. Rendering every one
 * as a slide and again as a thumbnail put about a hundred images and 350 KB of
 * markup into each car page. Now:
 *
 *   - Every slide's box is always there, so the strip is its full width and
 *     swiping, snapping and the counter behave exactly as before.
 *   - A slide's image is mounted only once the visitor is within two photos of
 *     it. The furthest photo reached is remembered, so going back never
 *     unloads anything.
 *   - Thumbnail images are mounted only on a screen wide enough to show the
 *     thumbnail row at all. On a phone that row is hidden, and its images used
 *     to be in the page for nobody.
 *
 * Search engines still get every photo address: the page's structured data
 * lists them all (app/inventory/[slug]/car-facts.ts).
 *
 * THE FIRST PHOTO is the largest thing on the first screen. It alone is loaded
 * eagerly and marked high priority; nothing else on the page is.
 */

/** Photos kept loaded ahead of the one on screen. */
const AHEAD = 2

/**
 * How wide the photo is drawn, so the browser picks a file that size and no
 * larger. Below 1024px it runs the width of the screen. From there it takes
 * three of the layout's five columns: about 55% of the screen, and no wider
 * than 845px once the page stops growing at 1536px.
 */
const PHOTO_SIZES = "(max-width: 1023px) 100vw, (max-width: 1535px) 55vw, 845px"

/** The thumbnail row is shown from this width up (the `md:` breakpoint). */
const THUMBS_QUERY = "(min-width: 768px)"

function subscribeToWidth(onChange: () => void) {
  const mq = window.matchMedia(THUMBS_QUERY)
  mq.addEventListener("change", onChange)
  return () => mq.removeEventListener("change", onChange)
}
const isWide = () => window.matchMedia(THUMBS_QUERY).matches
/** The server cannot know the screen, so it renders no thumbnail images. */
const isWideOnServer = () => false

export function VehicleGallery({
  images,
  heading,
  vehicleId,
}: {
  images: string[]
  heading: string
  /** The car's stock number, for the two gallery measurements. */
  vehicleId: number
}) {
  const stripRef = useRef<HTMLDivElement>(null)
  const frame = useRef<number | null>(null)
  const [current, setCurrent] = useState(0)
  /** The furthest photo the visitor has got to. Only ever grows. */
  const [reached, setReached] = useState(0)
  const reachedRef = useRef(0)
  const depthSent = useRef(false)
  const reduce = useReducedMotionSafe()
  const showThumbs = useSyncExternalStore(subscribeToWidth, isWide, isWideOnServer)
  const count = images.length

  const reach = useCallback((index: number) => {
    reachedRef.current = Math.max(reachedRef.current, index)
    setReached((r) => Math.max(r, index))
  }, [])

  const goTo = useCallback(
    (index: number, method: "arrow" | "thumb") => {
      const strip = stripRef.current
      if (!strip) return
      const clamped = Math.max(0, Math.min(count - 1, index))
      // Mount the target before scrolling to it, so the photo is already
      // loading while the strip moves.
      reach(clamped)
      trackGalleryInteract(vehicleId, method)
      strip.scrollTo({ left: clamped * strip.clientWidth, behavior: reduce ? "auto" : "smooth" })
    },
    [count, reduce, reach, vehicleId],
  )

  const onScroll = () => {
    if (frame.current !== null) return
    frame.current = requestAnimationFrame(() => {
      frame.current = null
      const strip = stripRef.current
      if (!strip || strip.clientWidth === 0) return
      const index = Math.max(0, Math.min(count - 1, Math.round(strip.scrollLeft / strip.clientWidth)))
      setCurrent(index)
      reach(index)
      // Counted once per car. If an arrow or thumbnail caused this scroll it
      // has already been counted under that name and this call does nothing.
      if (index > 0) trackGalleryInteract(vehicleId, "swipe")
    })
  }

  useEffect(() => {
    // How many photos were looked at, sent once: when the visitor leaves the
    // page or puts the tab away. Not once per swipe.
    // Nothing is sent, and nothing is used up, while only the first photo has
    // been seen: putting the tab away early must not stop a later count.
    depthSent.current = false
    const sendDepth = () => {
      if (depthSent.current || reachedRef.current === 0) return
      depthSent.current = true
      trackGalleryDepth(vehicleId, reachedRef.current + 1, count)
    }
    const onHide = () => {
      if (document.visibilityState === "hidden") sendDepth()
    }
    document.addEventListener("visibilitychange", onHide)
    return () => {
      document.removeEventListener("visibilitychange", onHide)
      if (frame.current !== null) cancelAnimationFrame(frame.current)
      sendDepth()
    }
  }, [vehicleId, count])

  if (count === 0) {
    return (
      <div className="-mx-6 flex aspect-3/2 items-center justify-center border-y border-line bg-ground-2 px-6 text-center md:mx-0 md:aspect-4/3 md:border-x">
        <p className="text-body text-ink-2">Photos of this car are being added. Call us and we will send them on WhatsApp.</p>
      </div>
    )
  }

  // Shown on phones too (owner, 2026-11-17): swiping works, but nothing else
  // on a phone said there was more than one photo. On a touch screen they are
  // smaller and let the photo show through; with a mouse they are full size.
  const arrow =
    "flex h-9 w-9 items-center justify-center rounded-sm border border-line bg-surface/85 text-ink " +
    "transition-colors duration-(--duration-1) hover:bg-ground-2 cursor-pointer " +
    "disabled:cursor-default disabled:opacity-40 " +
    "[@media(hover:hover)_and_(pointer:fine)]:h-11 [@media(hover:hover)_and_(pointer:fine)]:w-11 " +
    "[@media(hover:hover)_and_(pointer:fine)]:bg-surface"

  return (
    <div>
      <div className="relative -mx-6 border-y border-line bg-ground-2 md:mx-0 md:border-x">
        <div
          ref={stripRef}
          onScroll={onScroll}
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label={`Photos of ${heading}`}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        >
          {images.map((src, i) => (
            <div
              key={src}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              className="relative aspect-3/2 w-full shrink-0 snap-center snap-always md:aspect-4/3"
            >
              {i <= reached + AHEAD && (
                <Image
                  src={src}
                  alt={`${heading} — photo ${i + 1} of ${count}`}
                  fill
                  // The first photo is the page's largest paint. It is the
                  // only image asked for eagerly and at high priority.
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : undefined}
                  sizes={PHOTO_SIZES}
                  className="object-cover"
                />
              )}
            </div>
          ))}
        </div>

        {count > 1 && (
          <>
            <div className="pointer-events-none absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between md:inset-x-4">
              <button
                type="button"
                onClick={() => goTo(current - 1, "arrow")}
                disabled={current === 0}
                aria-label="Previous photo"
                className={`pointer-events-auto ${arrow}`}
              >
                <ChevronGlyph direction="left" />
              </button>
              <button
                type="button"
                onClick={() => goTo(current + 1, "arrow")}
                disabled={current === count - 1}
                aria-label="Next photo"
                className={`pointer-events-auto ${arrow}`}
              >
                <ChevronGlyph direction="right" />
              </button>
            </div>

            {/* Scrim over photography, so the count stays readable on any photo. */}
            <div className="pointer-events-none absolute bottom-3 right-3 rounded-sm bg-deep-2/80 px-3 py-1">
              <span className="text-caption text-on-deep" data-num>
                {current + 1} / {count}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Thumbnails are a pointer-and-large-screen convenience. On a phone the
          strip above is swiped directly and this row would push the price and
          the enquiry button out of the first screen. The buttons are always
          rendered, so the row keeps its height and nothing below it moves
          when the images arrive; the images themselves are added only on a
          screen that shows the row. */}
      {count > 1 && (
        <div className="custom-scrollbar mt-3 hidden gap-3 overflow-x-auto pb-2 md:flex">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => goTo(i, "thumb")}
              aria-label={`Show photo ${i + 1} of ${count}`}
              aria-current={i === current ? "true" : undefined}
              className={`relative aspect-4/3 w-24 shrink-0 cursor-pointer overflow-hidden rounded-sm border-2 bg-ground-2 transition-colors duration-(--duration-1) ${
                i === current ? "border-accent" : "border-transparent hover:border-line-strong"
              }`}
            >
              {showThumbs && <Image src={src} alt="" fill sizes="96px" className="object-cover" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
