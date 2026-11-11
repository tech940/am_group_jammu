"use client"

import * as React from "react"
import Image from "next/image"
import { useReducedMotionSafe } from "@/components/system/use-reduced-motion"

/**
 * The hero gallery — an automatic showcase of the group's own sites.
 *
 * An auto-advancing carousel is a loop, which this system normally bans, so
 * the loop is fenced in the ways that stop it being hostile (the same rules
 * the trust-landing pattern specifies for rotating media):
 *
 *  - CROSSFADE, never slide. Opacity is the one property that moves nothing
 *    in the visual field, so the rotation reads as light changing on one
 *    plate, not as content flying past.
 *  - PAUSES the moment anyone engages — hover, or focus anywhere inside —
 *    because advancing an image someone is trying to look at is theft.
 *  - STOPS ENTIRELY under reduced motion and when the tab is hidden. Reduce
 *    gets a static photograph with working manual dots.
 *  - MANUAL CONTROLS are real buttons with pressed state; the dots are the
 *    keyboard path and 44px targets.
 *
 * Every slide is the group's own photography with the caption naming the real
 * site — the captions travel with the images from the caller, which keeps the
 * caption/photo pairing in one reviewable place.
 */
export interface GallerySlide {
  src: string
  alt: string
  caption: string
}

const INTERVAL_MS = 4500

export function HeroGallery({ slides }: { slides: GallerySlide[] }) {
  const reduce = useReducedMotionSafe()
  const [index, setIndex] = React.useState(0)
  const [engaged, setEngaged] = React.useState(false)

  React.useEffect(() => {
    if (reduce || engaged || slides.length < 2) return
    const timer = setInterval(() => {
      // A hidden tab keeps its interval, but the rotation waits for the
      // reader to come back.
      if (document.hidden) return
      setIndex((i) => (i + 1) % slides.length)
    }, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [reduce, engaged, slides.length])

  const current = slides[index]

  return (
    <figure
      role="group"
      aria-roledescription="carousel"
      aria-label="AM Group sites"
      onMouseEnter={() => setEngaged(true)}
      onMouseLeave={() => setEngaged(false)}
      onFocus={() => setEngaged(true)}
      onBlur={() => setEngaged(false)}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-line bg-ground-2 lg:aspect-[5/4]">
        {slides.map((slide, i) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={i === index ? slide.alt : ""}
            fill
            priority={i === 0}
            quality={i === 0 ? 90 : undefined}
            sizes="(max-width: 1024px) 100vw, 45vw"
            aria-hidden={i !== index}
            className={`object-cover transition-opacity duration-(--duration-4) ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Slide position, on its own chip so it never fights the photo. */}
        <span
          className="absolute right-3 top-3 rounded-sm bg-surface/90 px-2 py-1 text-meta uppercase text-ink-2"
          data-num
          aria-hidden
        >
          {index + 1} / {slides.length}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-4">
        <figcaption className="min-w-0 truncate text-caption text-ink-2" aria-live="polite">
          {current.caption}
        </figcaption>

        {/* The dots: the manual and keyboard path. 44px targets around 8px
            marks; round because a position dot is a dot in life. */}
        <div className="flex shrink-0" role="tablist" aria-label="Choose slide">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Slide ${i + 1}: ${slide.caption}`}
              onClick={() => setIndex(i)}
              className="flex h-11 w-6 cursor-pointer items-center justify-center"
            >
              <span
                className={`block h-2 rounded-full transition-all duration-(--duration-2) ${
                  i === index ? "w-5 bg-accent" : "w-2 bg-line-strong hover:bg-ink-3"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </figure>
  )
}
