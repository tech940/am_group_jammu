import type { ReactNode } from "react"
import Image from "next/image"
import { Settle } from "@/components/system/marks"
import { RuleDraw } from "@/components/system/rule-draw"

/**
 * The furniture every page in this application is built from: the banded
 * section, its header, the photographic glass opener, and the bordered plate.
 *
 * These are section furniture, not UI primitives — Button, Field, Dialog and
 * Table still come from components/ui, and a page composes those. What lives
 * here is the rhythm the whole site shares: one ground per band, one header
 * grammar, one way to open a page, one way to frame a photograph.
 *
 * All of it is server-renderable. Seven public routes used to be marked
 * "use client" at the top, which pushed their entire SEO-load-bearing body —
 * headings, long-form copy, award tables, addresses — out of the served HTML
 * and into a hydration payload.
 */

/** Adjacent bands never share a ground. That is the depth system: no shadow. */
export type Ground = "ground" | "ground-2" | "deep"

const GROUND_CLASS: Record<Ground, string> = {
  ground: "bg-ground text-ink",
  "ground-2": "bg-ground-2 text-ink",
  deep: "bg-deep text-on-deep",
}

export function Band({
  id,
  ground,
  labelledBy,
  className = "",
  backdrop,
  children,
}: {
  id?: string
  ground: Ground
  /** id of the band's own heading, so the section is a named landmark. */
  labelledBy: string
  className?: string
  /**
   * Decorative background layers from components/system/backdrops.tsx. The band
   * becomes `relative isolate` when present, which is what confines their
   * negative z-index to this section instead of letting it escape behind the
   * page.
   */
  backdrop?: ReactNode
  children: ReactNode
}) {
  // One reveal per band, not one per element: the section settles as a unit,
  // which is the "Reveal" row of DESIGN.md's motion table. Settle renders
  // statically under prefers-reduced-motion, so there is nothing to opt out of.
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      // Switches the global focus outline to paper — the accent outline muddies
      // against graphite. Defined once in globals.css, opted into here.
      data-ground={ground === "deep" ? "deep" : undefined}
      className={`${GROUND_CLASS[ground]} py-20 md:py-28 ${
        backdrop ? "relative isolate overflow-hidden" : ""
      } ${className}`}
    >
      {backdrop}
      <Settle className="relative mx-auto max-w-[1400px] px-5 md:px-10">{children}</Settle>
    </section>
  )
}

/**
 * Section opener: a drawn accent rule, a meta label, the heading, and an
 * optional lede set opposite it.
 *
 * The rule uses the ground-specific end of the accent in both directions. The
 * deep end measures 2.7:1 on a dark ground and the pale end 1.6:1 on a light
 * one; a hairline nobody can see is not a hairline (DESIGN.md, The Accent
 * Contrast Rule).
 */
export function Head({
  id,
  label,
  title,
  lede,
  onDeep = false,
}: {
  id: string
  label: string
  title: ReactNode
  lede?: ReactNode
  onDeep?: boolean
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
      <div>
        <p
          className={`flex items-center gap-4 text-meta uppercase ${
            onDeep ? "text-on-deep-2" : "text-ink-2"
          }`}
        >
          <RuleDraw className={`w-10 ${onDeep ? "bg-accent-bright" : "bg-accent"}`} />
          {label}
        </p>
        <h2
          id={id}
          className={`mt-5 max-w-[20ch] font-display text-h1 uppercase ${
            onDeep ? "text-on-deep" : "text-ink"
          }`}
        >
          {title}
        </h2>
      </div>
      {lede && (
        <p className={`max-w-[46ch] text-body-lg ${onDeep ? "text-on-deep-2" : "text-ink-2"}`}>
          {lede}
        </p>
      )}
    </div>
  )
}

/**
 * The page opener: a photograph, a two-stop scrim, and the title on a frosted
 * panel.
 *
 * The panel is what makes this safe. A page title set directly over uncontrolled
 * photography behind a flat tint is the pattern that measured 2.11:1 in the
 * previous build — a scrim cannot guarantee contrast against an image whose
 * brightness it does not control. `.glass` composites a dark tint on top of an
 * already-dark scrim, and falls back to a near-opaque panel wherever
 * `backdrop-filter` is unavailable or the reader has asked for reduced
 * transparency (DESIGN.md, Glass).
 *
 * `stats` is the page's own ledger — the figures that back whatever the title
 * claims. Pages with no numbers to show omit it rather than inventing some.
 */
export function PageHero({
  id = "page-title",
  eyebrow,
  title,
  lede,
  image,
  /** Empty string is correct: the photograph is the band's ground, not content. */
  imageAlt = "",
  caption,
  stats,
  actions,
  backdrop,
  priority = true,
}: {
  id?: string
  eyebrow: string
  title: ReactNode
  lede?: ReactNode
  image: string
  imageAlt?: string
  caption?: ReactNode
  stats?: { term: string; detail: string; note?: string }[]
  actions?: ReactNode
  /**
   * Decorative layers from components/system/backdrops.tsx, painted OVER the
   * scrim and under the glass. Each route passes its own so the openers are not
   * eight copies of one image with the photograph swapped.
   */
  backdrop?: ReactNode
  priority?: boolean
}) {
  return (
    <section
      aria-labelledby={id}
      data-ground="deep"
      className="relative isolate overflow-hidden bg-deep-2"
    >
      <div aria-hidden={imageAlt === "" ? true : undefined} className="absolute inset-0 -z-10">
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority={priority}
          quality={90}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="photo-scrim absolute inset-0" />
      </div>
      {backdrop}

      <div className="relative mx-auto max-w-[1400px] px-5 pb-14 pt-28 md:px-10 md:pb-20 md:pt-36">
        <div className="glass max-w-[64ch] p-6 md:p-10">
          <p className="flex items-center gap-4 text-meta uppercase text-on-deep-2">
            <RuleDraw className="w-10 bg-accent-bright" />
            {eyebrow}
          </p>

          <h1 id={id} className="mt-7 font-display text-display uppercase text-on-deep">
            {title}
          </h1>

          {lede && <p className="mt-7 text-body-lg text-on-deep-2">{lede}</p>}

          {actions && <div className="mt-9 flex flex-wrap gap-3">{actions}</div>}
        </div>

        {caption && (
          <p className="glass mt-6 inline-block px-4 py-3 text-caption text-on-deep-2">
            {caption}
          </p>
        )}

        {stats && stats.length > 0 && (
          <dl className="glass mt-12 grid grid-cols-2 md:mt-14 lg:grid-cols-4">
            {stats.map((item, i) => (
              <div
                key={item.term}
                // Hairlines drawn per cell rather than with `divide-*`: the grid
                // wraps to two columns below lg, and a divide utility leaves a
                // rule hanging off the end of the last row.
                className={`p-5 md:p-6 ${i % 2 === 1 ? "border-l border-line-on-deep" : ""} ${
                  i < stats.length - 2 ? "border-b border-line-on-deep lg:border-b-0" : ""
                } ${i === 2 ? "lg:border-l lg:border-line-on-deep" : ""}`}
              >
                <dt className="text-meta uppercase text-on-deep-2">{item.term}</dt>
                <dd className="mt-2 font-display text-h2 text-on-deep" data-num>
                  {item.detail}
                </dd>
                {item.note && <dd className="mt-1 text-small text-on-deep-2">{item.note}</dd>}
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  )
}

/**
 * A photograph, framed and captioned.
 *
 * Nothing bleeds unframed (DESIGN.md, Shapes). The caption is not decoration
 * either: it names the actual building in the actual city, which is the
 * difference between photography that supports a claim and stock imagery that
 * dilutes it.
 */
export function Plate({
  src,
  alt,
  caption,
  ratio = "aspect-[4/3]",
  sizes,
  priority = false,
  quality,
  onDeep = false,
  className = "",
}: {
  src: string
  alt: string
  caption: ReactNode
  ratio?: string
  sizes: string
  priority?: boolean
  quality?: 75 | 90
  onDeep?: boolean
  className?: string
}) {
  return (
    <figure className={className}>
      <div
        className={`relative ${ratio} overflow-hidden rounded-md border ${
          onDeep ? "border-line-on-deep bg-deep" : "border-line bg-ground-2"
        }`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          quality={quality}
          className="object-cover"
        />
      </div>
      <figcaption className={`mt-3 text-caption ${onDeep ? "text-on-deep-2" : "text-ink-2"}`}>
        {caption}
      </figcaption>
    </figure>
  )
}

/**
 * A hairline register row — the pattern the marque table, the award list and
 * the milestone list all share. Kept here so the three do not drift apart.
 */
export function RegisterRow({
  primary,
  secondary,
  trailing,
  onDeep = false,
  className = "",
}: {
  primary: ReactNode
  secondary?: ReactNode
  trailing?: ReactNode
  onDeep?: boolean
  className?: string
}) {
  const rule = onDeep ? "border-line-on-deep" : "border-line"
  return (
    <li className={`flex items-baseline justify-between gap-6 border-b ${rule} py-4 ${className}`}>
      <span className="min-w-0">
        <span className={`block text-body ${onDeep ? "text-on-deep" : "text-ink"}`}>
          {primary}
        </span>
        {secondary && (
          <span
            className={`mt-0.5 block text-small ${onDeep ? "text-on-deep-2" : "text-ink-2"}`}
          >
            {secondary}
          </span>
        )}
      </span>
      {trailing && (
        <span
          className={`shrink-0 font-display text-h3 ${
            onDeep ? "text-on-deep-2" : "text-ink-2"
          }`}
          data-num
        >
          {trailing}
        </span>
      )}
    </li>
  )
}
