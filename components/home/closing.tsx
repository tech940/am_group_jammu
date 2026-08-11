"use client"

import Image from "next/image"
import Link from "next/link"
import { PRIMARY_LOCATION, whatsappUrl } from "@/lib/locations"
import { FOUNDED, YEARS_TRADING } from "./content"
import { ChatGlyph, DimensionLine, PhoneGlyph, PlateCaption, RegMark } from "@/components/system/marks"

/**
 * Closing plate — the drawing set ends the way a brand film ends: one image,
 * one statement, the door. No "find your dream car".
 */

export function Closing() {
  return (
    <section aria-labelledby="closing-title" className="relative isolate min-h-[88svh] overflow-hidden bg-ink text-paper">
      <Image
        src="/media/showroom-mg.jpg"
        alt="The MG dealership building in Jammu against an open sky"
        fill
        sizes="100vw"
        className="object-cover"
      />
      {/* Two scrims: bottom-up for the caption bar, left-side for the text
          column — the headline's second clause sits over open sky without it. */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/15" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/40 to-transparent" />

      <RegMark className="absolute right-5 top-8 text-paper/40 md:right-10" />

      <div className="relative mx-auto flex min-h-[88svh] max-w-[1400px] flex-col justify-end px-5 pb-14 pt-40 md:px-10 md:pb-20">
        <DimensionLine
          from={String(FOUNDED)}
          to="ongoing"
          label="revision continues"
          tone="print"
          className="max-w-md"
        />
        <h2
          id="closing-title"
          className="mt-6 max-w-[14ch] font-display text-6xl font-bold uppercase leading-[0.92] md:text-8xl"
        >
          Drawn in {FOUNDED}. <span className="text-print-dim">Still being drawn.</span>
        </h2>
        <p className="mt-6 max-w-[52ch] text-[15px] leading-relaxed text-paper/70">
          {YEARS_TRADING} years in, the set is not finished — new franchises, new sites, new sheets.
          If you are buying, selling, servicing or simply passing the bye-pass: the door on NH-44 is
          open six days a week.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/locations"
            className="inline-flex items-center gap-3 bg-redline px-7 py-4 font-anno text-[12px] uppercase tracking-[0.14em] text-paper transition-colors hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
          >
            Visit a showroom
          </Link>
          <a
            href={`tel:${PRIMARY_LOCATION.phoneE164}`}
            data-track-location="home-closing"
            className="inline-flex items-center gap-2 border border-paper/60 px-7 py-4 font-anno text-[12px] uppercase tracking-[0.14em] text-paper transition-colors hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
          >
            <PhoneGlyph /> {PRIMARY_LOCATION.phone}
          </a>
          <a
            href={whatsappUrl("Hi AM Group, I would like to talk about a car.")}
            target="_blank"
            rel="noopener noreferrer"
            data-track-location="home-closing"
            className="inline-flex items-center gap-2 border border-paper/60 px-7 py-4 font-anno text-[12px] uppercase tracking-[0.14em] text-paper transition-colors hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
          >
            <ChatGlyph /> WhatsApp
          </a>
        </div>

        <div className="mt-12 border-t border-paper/20 pt-4">
          <PlateCaption fig="FINAL PLATE" tone="print">
            AMG Autocraft (MG), Jammu — the group&apos;s newest franchise building, 2024
          </PlateCaption>
        </div>
      </div>
    </section>
  )
}
