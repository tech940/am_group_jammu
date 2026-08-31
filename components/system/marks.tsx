"use client"

import { motion } from "framer-motion"
import { useReducedMotionSafe } from "@/components/system/use-reduced-motion"
import type { ReactNode } from "react"

/**
 * The drawing office's furniture: title blocks, dimension lines, registration
 * marks, stamps. Every icon on the homepage is drawn here as SVG in one stroke
 * grammar (1.5px, square caps) — no icon library anywhere on this page.
 */

/* ------------------------------------------------------------------ */
/* Title block — the bordered stamp that opens every sheet             */
/* ------------------------------------------------------------------ */

export function TitleBlock({
  sheet,
  title,
  scale,
  tone = "ink",
}: {
  sheet: string
  title: string
  scale: string
  tone?: "ink" | "print"
}) {
  const border = tone === "ink" ? "border-ink/70" : "border-print-line/60"
  const dim = tone === "ink" ? "text-steel" : "text-print-dim"
  const strong = tone === "ink" ? "text-ink" : "text-paper"

  return (
    <div className={`inline-grid grid-cols-[auto_1fr_auto] border ${border} text-meta uppercase`}>
      <div className={`px-3 py-2 border-r ${border} ${dim}`}>
        <span className="block text-meta">Sheet</span>
        <span className={`block text-small ${strong}`}>{sheet}</span>
      </div>
      <div className={`px-3 py-2 border-r ${border} min-w-0`}>
        <span className={`block text-meta ${dim}`}>Title</span>
        <span className={`block text-small truncate ${strong}`}>{title}</span>
      </div>
      <div className="px-3 py-2">
        <span className={`block text-meta ${dim}`}>Scale</span>
        <span className={`block text-small ${strong}`}>{scale}</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Sheet header — the opening block of every inner page                */
/* ------------------------------------------------------------------ */

/**
 * Standard page opener: title block, oversized display heading, and a lede.
 * Every non-home route uses this so the set reads as one document. `tone`
 * picks the ground; `sheet` is the drawing number shown in the title block.
 */
export function SheetHeader({
  sheet,
  blockTitle,
  scale,
  heading,
  accent,
  lede,
  tone = "paper",
  children,
}: {
  sheet: string
  blockTitle: string
  scale: string
  heading: ReactNode
  /** Trailing part of the heading, set in the accent colour. */
  accent?: ReactNode
  lede?: ReactNode
  tone?: "paper" | "print" | "ink"
  children?: ReactNode
}) {
  const onDark = tone !== "paper"
  return (
    <header
      className={
        tone === "paper"
          ? "bg-paper text-ink"
          : tone === "print"
            ? "bg-print text-paper"
            : "bg-ink text-paper"
      }
    >
      <div className="mx-auto max-w-[1400px] px-5 pb-12 pt-24 md:px-10 md:pb-16 md:pt-28">
        <TitleBlock sheet={sheet} title={blockTitle} scale={scale} tone={onDark ? "print" : "ink"} />
        <div className="mt-8 flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <h1
            className={`max-w-[16ch] font-display text-5xl font-bold uppercase leading-[0.95] md:text-7xl ${
              onDark ? "text-paper" : "text-ink"
            }`}
          >
            {heading}
            {accent && (
              <>
                {" "}
                <span className={onDark ? "text-redline-hi" : "text-redline"}>{accent}</span>
              </>
            )}
          </h1>
          {lede && (
            <p
              className={`max-w-[46ch] text-body leading-relaxed ${
                onDark ? "text-print-dim" : "text-steel"
              }`}
            >
              {lede}
            </p>
          )}
        </div>
        {children}
      </div>
    </header>
  )
}

/** Section opener inside a page — smaller than SheetHeader, same grammar. */
export function SectionHead({
  label,
  heading,
  lede,
  tone = "paper",
}: {
  label: string
  heading: ReactNode
  lede?: ReactNode
  tone?: "paper" | "print"
}) {
  const onDark = tone === "print"
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
      <div>
        <p
          className={`border-b pb-2 text-meta uppercase ${
            onDark ? "border-print-line/40 text-print-dim" : "border-ink/30 text-steel"
          }`}
        >
          {label}
        </p>
        <h2
          className={`mt-4 max-w-[18ch] font-display text-4xl font-semibold uppercase leading-[0.98] md:text-5xl ${
            onDark ? "text-paper" : "text-ink"
          }`}
        >
          {heading}
        </h2>
      </div>
      {lede && (
        <p
          className={`max-w-[44ch] text-body leading-relaxed ${
            onDark ? "text-print-dim" : "text-steel"
          }`}
        >
          {lede}
        </p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Dimension line — ⊢———— label ————⊣                                  */
/* ------------------------------------------------------------------ */

export function DimensionLine({
  from,
  to,
  label,
  tone = "ink",
  className = "",
}: {
  from: string
  to: string
  label: string
  tone?: "ink" | "print" | "redline"
  className?: string
}) {
  const reduce = useReducedMotionSafe()
  const color =
    tone === "print" ? "text-print-dim" : tone === "redline" ? "text-redline" : "text-steel"
  const lineColor =
    tone === "print" ? "bg-print-line/60" : tone === "redline" ? "bg-redline" : "bg-ink/50"
  const tickColor = lineColor

  return (
    <div className={`flex items-center gap-3 text-meta uppercase ${color} ${className}`}>
      <span aria-hidden className={`w-px h-3.5 ${tickColor}`} />
      <span className="shrink-0">{from}</span>
      <motion.span
        aria-hidden
        className={`h-px flex-1 origin-left ${lineColor}`}
        initial={reduce ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
      <span className="shrink-0">{label}</span>
      <motion.span
        aria-hidden
        className={`h-px flex-1 origin-right ${lineColor}`}
        initial={reduce ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
      <span className="shrink-0">{to}</span>
      <span aria-hidden className={`w-px h-3.5 ${tickColor}`} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Registration mark — the printer's crosshair                         */
/* ------------------------------------------------------------------ */

export function RegMark({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={`h-4 w-4 ${className}`} fill="none">
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1" />
      <path d="M12 0v24M0 12h24" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Figure caption for photography plates                               */
/* ------------------------------------------------------------------ */

export function PlateCaption({
  fig,
  children,
  tone = "ink",
}: {
  fig: string
  children: ReactNode
  tone?: "ink" | "print"
}) {
  return (
    // The caption WRAPS; it is never truncated. This is the fix for the
    // horizontal scroll (and the pale strip down the right edge) that appeared
    // on every phone-width page carrying a plate.
    //
    // The old version put `truncate` on the text span, which sets
    // white-space: nowrap. Adding `min-w-0` is not enough to contain that: it
    // lets a FLEX ITEM shrink, but it does not change the element's min-content
    // contribution when an `auto` GRID TRACK is sized. The track therefore grew
    // to fit the entire unwrapped caption — measured at 425px inside a 335px
    // column — and pushed the document 127px wider than the viewport.
    //
    // Wrapping is also simply the better answer: a caption clipped to
    // "HP & Indian Oil forec…" on a phone tells the reader nothing.
    <figcaption
      className={`flex min-w-0 items-baseline gap-3 text-meta uppercase ${
        tone === "print" ? "text-print-dim" : "text-steel"
      }`}
    >
      <span className={`shrink-0 ${tone === "print" ? "text-paper" : "text-ink"}`}>{fig}</span>
      <span className="min-w-0">{children}</span>
    </figcaption>
  )
}

/* ------------------------------------------------------------------ */
/* Drawn glyphs — one stroke grammar, square caps, 1.5px               */
/* ------------------------------------------------------------------ */

function Glyph({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={`h-[1.1em] w-[1.1em] shrink-0 ${className}`}
    >
      {children}
    </svg>
  )
}

export function ArrowGlyph({ className = "" }: { className?: string }) {
  return (
    <Glyph className={className}>
      <path d="M2 10h15M12 4.5 17.5 10 12 15.5" />
    </Glyph>
  )
}

export function ArrowDownGlyph({ className = "" }: { className?: string }) {
  return (
    <Glyph className={className}>
      <path d="M10 2v15M4.5 12 10 17.5 15.5 12" />
    </Glyph>
  )
}

export function PhoneGlyph({ className = "" }: { className?: string }) {
  return (
    <Glyph className={className}>
      <path d="M4 3h4l1.5 4L7 9c1 2.5 2.5 4 5 5l2-2.5 4 1.5v4c-7 .5-14.5-7-15-14Z" strokeLinejoin="miter" />
    </Glyph>
  )
}

export function ChatGlyph({ className = "" }: { className?: string }) {
  return (
    <Glyph className={className}>
      <path d="M3 4h14v9H8l-4 3.5V4Z" strokeLinejoin="miter" />
    </Glyph>
  )
}

export function LoopGlyph({ className = "" }: { className?: string }) {
  return (
    <Glyph className={className}>
      <path d="M16 10a6 6 0 1 1-2-4.5M14 2.5v3h3" />
    </Glyph>
  )
}

export function CompassGlyph({ className = "" }: { className?: string }) {
  return (
    <Glyph className={className}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="m13 7-2 5-4 1 2-5 4-1Z" strokeLinejoin="miter" />
    </Glyph>
  )
}

/* ------------------------------------------------------------------ */
/* Approval stamp — for the awards register                            */
/* ------------------------------------------------------------------ */

export function Stamp({ year, className = "" }: { year: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-flex h-12 w-12 shrink-0 rotate-[-8deg] items-center justify-center rounded-full border-[1.5px] border-accent/70 text-meta text-accent/90 ${className}`}
    >
      {year}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Reveal — the page's one entrance: content settles up 8px after the  */
/* lines around it have drawn. Reduced motion renders statically.      */
/* ------------------------------------------------------------------ */

export function Settle({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotionSafe()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Glyph set, continued.                                               */
/*                                                                     */
/* These exist so lucide-react can be removed, but they are NOT a 1:1  */
/* replacement for it. DESIGN.md's icon policy is delete-first: an icon */
/* beside a label that already says the word is noise. The 77 lucide    */
/* icons this app imported decorated words like "Car", "Award",         */
/* "Users", "Fuel" — those get deleted, not redrawn.                    */
/*                                                                     */
/* What survives is the short list where a mark carries meaning a word  */
/* cannot at that size: direction, dismissal, search, validity, alarm,  */
/* rating, place. Same construction as the originals — 20x20 viewBox,   */
/* 1.5px stroke, square caps, miter joins, sized 1.1em.                 */
/* ------------------------------------------------------------------ */

export function PinGlyph({ className = "" }: { className?: string }) {
  return (
    <Glyph className={className}>
      <path d="M10 18s6-5.5 6-10a6 6 0 1 0-12 0c0 4.5 6 10 6 10Z" strokeLinejoin="miter" />
      <circle cx="10" cy="8" r="2.25" />
    </Glyph>
  )
}

/** Direction is a prop, not four separate components. */
export function ChevronGlyph({
  direction = "right",
  className = "",
}: {
  direction?: "up" | "down" | "left" | "right"
  className?: string
}) {
  const rotation = { right: 0, down: 90, left: 180, up: 270 }[direction]
  return (
    <Glyph className={className}>
      <path d="m8 4.5 5.5 5.5L8 15.5" transform={`rotate(${rotation} 10 10)`} />
    </Glyph>
  )
}

export function CloseGlyph({ className = "" }: { className?: string }) {
  return (
    <Glyph className={className}>
      <path d="m4.5 4.5 11 11M15.5 4.5l-11 11" />
    </Glyph>
  )
}

export function SearchGlyph({ className = "" }: { className?: string }) {
  return (
    <Glyph className={className}>
      <circle cx="8.75" cy="8.75" r="5.25" />
      <path d="m12.75 12.75 4 4" />
    </Glyph>
  )
}

export function CheckGlyph({ className = "" }: { className?: string }) {
  return (
    <Glyph className={className}>
      <path d="m3.5 10.5 4.5 4.5 8.5-10" />
    </Glyph>
  )
}

export function AlertGlyph({ className = "" }: { className?: string }) {
  return (
    <Glyph className={className}>
      <path d="M10 2.5 18.5 17.5H1.5L10 2.5Z" strokeLinejoin="miter" />
      <path d="M10 8v3.5M10 14.25v.5" />
    </Glyph>
  )
}

/* ------------------------------------------------------------------ */
/* Journey pictograms — what kind of stop this is on the route.        */
/*                                                                     */
/* These pass the delete-first test because they carry category, not   */
/* decoration: on the journey road each stop shows only a year, and    */
/* "1977" says nothing about WHAT arrived in 1977 — the pump does.     */
/* Same construction as everything above: 20x20, 1.5px, square caps.   */
/* ------------------------------------------------------------------ */

export function FuelPumpGlyph({ className = "" }: { className?: string }) {
  return (
    <Glyph className={className}>
      {/* Pump body, display window, base, and the hose over the side. */}
      <path d="M4 17.25 V3.5 h8.5 v13.75 M2.5 17.25 h11.5" strokeLinejoin="miter" />
      <path d="M6.25 6 h4 v3.25 h-4 Z" strokeLinejoin="miter" />
      <path d="M12.5 8 h2.25 a1.5 1.5 0 0 1 1.5 1.5 v4.75 a1.15 1.15 0 0 0 2.3 0 V9" />
    </Glyph>
  )
}

export function CarGlyph({ className = "" }: { className?: string }) {
  return (
    <Glyph className={className}>
      <path
        d="M2.5 13.5 v-2 l2.75-1 2.25-3 h5 l2.25 3 2.75 1 v2 h-1.75 M8.75 13.5 h2.5 M4.5 13.5 h-2"
        strokeLinejoin="miter"
      />
      <circle cx="6.5" cy="13.75" r="1.9" />
      <circle cx="13.5" cy="13.75" r="1.9" />
    </Glyph>
  )
}

export function BikeGlyph({ className = "" }: { className?: string }) {
  return (
    <Glyph className={className}>
      <circle cx="5" cy="14" r="2.6" />
      <circle cx="15" cy="14" r="2.6" />
      {/* Frame, seat, and bars. */}
      <path d="M5 14 L8.5 8.25 h3.25 L15 14 M8.5 8.25 6.75 6.5 h-2 M11.75 8.25 13.5 6 h1.75" />
    </Glyph>
  )
}

/** A waypoint flag — for the stop where no single vehicle is honest. */
export function FlagGlyph({ className = "" }: { className?: string }) {
  return (
    <Glyph className={className}>
      <path d="M5.5 17.5 V2.75" />
      <path d="M5.5 3.5 h9 l-2.5 3.25 2.5 3.25 h-9" strokeLinejoin="miter" />
    </Glyph>
  )
}

export function StarGlyph({ className = "" }: { className?: string }) {
  return (
    <Glyph className={className}>
      <path d="m10 2.5 2.35 4.9 5.15.72-3.75 3.7.9 5.18L10 14.55 5.35 17l.9-5.18L2.5 8.12l5.15-.72L10 2.5Z" strokeLinejoin="miter" />
    </Glyph>
  )
}
