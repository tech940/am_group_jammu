"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ChevronGlyph } from "@/components/system/marks"
import { useReducedMotionSafe } from "@/components/system/use-reduced-motion"

/**
 * The car's photos as one native horizontal strip.
 *
 * The previous gallery swapped a single image on button press, so on a phone
 * the photo did not respond to a finger at all. This is a plain scroll-snap
 * strip: the browser does the swiping, momentum and snapping, and the only
 * script is the counter (which reads the scroll position) and the prev / next
 * buttons for people using a mouse.
 *
 * Every slide is in the server-rendered HTML. The first image is eager and
 * high priority because it is the page's LCP element; the rest are lazy.
 */
export function VehicleGallery({ images, heading }: { images: string[]; heading: string }) {
  const stripRef = useRef<HTMLDivElement>(null)
  const frame = useRef<number | null>(null)
  const [current, setCurrent] = useState(0)
  const reduce = useReducedMotionSafe()
  const count = images.length

  const goTo = useCallback(
    (index: number) => {
      const strip = stripRef.current
      if (!strip) return
      const clamped = Math.max(0, Math.min(count - 1, index))
      strip.scrollTo({ left: clamped * strip.clientWidth, behavior: reduce ? "auto" : "smooth" })
    },
    [count, reduce],
  )

  const onScroll = () => {
    if (frame.current !== null) return
    frame.current = requestAnimationFrame(() => {
      frame.current = null
      const strip = stripRef.current
      if (!strip || strip.clientWidth === 0) return
      setCurrent(Math.max(0, Math.min(count - 1, Math.round(strip.scrollLeft / strip.clientWidth))))
    })
  }

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current)
    },
    [],
  )

  if (count === 0) {
    return (
      <div className="-mx-6 flex aspect-3/2 items-center justify-center border-y border-line bg-ground-2 px-6 text-center md:mx-0 md:aspect-4/3 md:border-x">
        <p className="text-body text-ink-2">Photos of this car are being added. Call us and we will send them on WhatsApp.</p>
      </div>
    )
  }

  const arrow =
    "h-11 w-11 items-center justify-center rounded-sm border border-line bg-surface text-ink " +
    "transition-colors duration-(--duration-1) hover:bg-ground-2 cursor-pointer " +
    "disabled:cursor-default disabled:opacity-55 " +
    // Finger users swipe; the arrows are for a mouse or trackpad.
    "hidden [@media(hover:hover)_and_(pointer:fine)]:flex"

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
              <Image
                src={src}
                alt={`${heading} — photo ${i + 1} of ${count}`}
                fill
                priority={i === 0}
                loading={i === 0 ? undefined : "lazy"}
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {count > 1 && (
          <>
            <div className="pointer-events-none absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between">
              <button
                type="button"
                onClick={() => goTo(current - 1)}
                disabled={current === 0}
                aria-label="Previous photo"
                className={`pointer-events-auto ${arrow}`}
              >
                <ChevronGlyph direction="left" />
              </button>
              <button
                type="button"
                onClick={() => goTo(current + 1)}
                disabled={current === count - 1}
                aria-label="Next photo"
                className={`pointer-events-auto ${arrow}`}
              >
                <ChevronGlyph direction="right" />
              </button>
            </div>

            {/* Scrim over photography, so the count stays readable on any photo. */}
            <div className="pointer-events-none absolute bottom-3 right-3 rounded-sm bg-ink/80 px-3 py-1">
              <span className="text-caption text-on-deep" data-num>
                {current + 1} / {count}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Thumbnails are a pointer-and-large-screen convenience. On a phone the
          strip above is swiped directly and this row would push the price and
          the enquiry button out of the first screen. */}
      {count > 1 && (
        <div className="custom-scrollbar mt-3 hidden gap-3 overflow-x-auto pb-2 md:flex">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show photo ${i + 1} of ${count}`}
              aria-current={i === current ? "true" : undefined}
              className={`relative aspect-4/3 w-24 shrink-0 cursor-pointer overflow-hidden rounded-sm border-2 transition-colors duration-(--duration-1) ${
                i === current ? "border-accent" : "border-transparent hover:border-line-strong"
              }`}
            >
              <Image src={src} alt="" fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
