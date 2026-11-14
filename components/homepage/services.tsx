import Link from "next/link"
import type { ReactNode } from "react"
import {
  ChatGlyph,
  PercentGlyph,
  PinGlyph,
  RupeeGlyph,
  ShieldGlyph,
  WheelGlyph,
} from "@/components/system/marks"
import { whatsappUrl } from "@/lib/locations"
import { EnquireTile } from "./enquire-tile"

/**
 * The six things around buying or selling a car, as a grid of small tiles.
 *
 * This replaces the old three-column "Exchange, finance, insure" band, which
 * was a heading, a lede and three paragraphs before any button — a lot of
 * scrolling on a phone to reach "ask about finance". A tile is the button.
 *
 * Three tiles open the enquiry form with the CRM's own typed intent (Finance,
 * Insurance, Test Drive), so those leads land sorted. The other three are
 * plain links: the valuation section of /sell-your-car, the locations page,
 * and WhatsApp.
 *
 * The pictograms pass DESIGN.md's delete-first test here because a tile is a
 * target first and a label second — at three across on a phone the shape is
 * what the thumb finds.
 */
const tile =
  "group flex min-h-28 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md " +
  "border border-line bg-surface px-2 py-3 text-center text-label text-ink " +
  "transition-colors duration-(--duration-1) hover:border-pop md:min-h-32"

function Face({ glyph, label }: { glyph: ReactNode; label: string }) {
  return (
    <>
      {/* Glyphs are sized in em, so the wrapper's font-size is the icon size. */}
      <span
        aria-hidden
        className="grid h-12 w-12 place-items-center rounded-full bg-pop-bg text-h3 leading-none text-pop-text transition-colors duration-(--duration-1) group-hover:bg-pop group-hover:text-on-pop"
      >
        {glyph}
      </span>
      <span>{label}</span>
    </>
  )
}

export function Services() {
  return (
    <ul className="grid grid-cols-3 gap-2.5 md:gap-4 lg:grid-cols-6">
      <li>
        <EnquireTile intent="Finance" sourceLabel="home-tile-finance" className={tile}>
          <Face glyph={<PercentGlyph />} label="Car finance" />
        </EnquireTile>
      </li>
      <li>
        <EnquireTile intent="Insurance" sourceLabel="home-tile-insurance" className={tile}>
          <Face glyph={<ShieldGlyph />} label="Insurance" />
        </EnquireTile>
      </li>
      <li>
        <Link href="/sell-your-car#valuation" className={tile}>
          <Face glyph={<RupeeGlyph />} label="Check car price" />
        </Link>
      </li>
      <li>
        <EnquireTile intent="Test Drive" sourceLabel="home-tile-test-drive" className={tile}>
          <Face glyph={<WheelGlyph />} label="Book a test drive" />
        </EnquireTile>
      </li>
      <li>
        <Link href="/locations" className={tile}>
          <Face glyph={<PinGlyph />} label="Our locations" />
        </Link>
      </li>
      <li>
        <a
          href={whatsappUrl(
            "Hi AM Group, I'm looking for a used car in Jammu. Can you help me with what's available?",
          )}
          target="_blank"
          rel="noopener noreferrer"
          data-track-location="home-tile-whatsapp"
          className={tile}
        >
          <Face glyph={<ChatGlyph />} label="WhatsApp us" />
        </a>
      </li>
    </ul>
  )
}
