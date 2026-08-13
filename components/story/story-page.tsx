/**
 * The story page orchestrator.
 *
 * Assembles the eight chapters into one continuous surface. The rule and stage
 * are structural fixtures that persist across every chapter — they are not
 * chapter content. Everything else is sequenced here.
 *
 * This is a Client Component boundary only because StoryStage and StoryRule
 * need scroll position and IntersectionObserver. The chapter components are all
 * Client Components for the same reason. The data (stock count, degraded flag)
 * comes from the parent Server Component as plain props so no chapter fetches
 * for itself.
 */

"use client"

import * as React from "react"
import { StoryStage } from "./stage"
import { StoryRule, StoryRuleMobile } from "./rule"
import { StoryHero } from "./hero"
import { ChapterOrigin, ChapterGrowth } from "./ch-origin-growth"
import { ChapterBusinesses, ChapterBrands } from "./ch-business-brands"
import { ChapterPlaces, ChapterPeople } from "./ch-places-people"
import { ChapterToday, ChapterNext } from "./ch-today-next"
import { GROUND_COLOR } from "./chapter"
import { FOUNDED } from "@/components/home/content"
import type { InventoryVehicle } from "@/lib/inventory/types"

const CHAPTERS: { id: string; label: string; year: number }[] = [
  { id: "origin",     label: "1968",        year: 1968 },
  { id: "growth",     label: "Growth",      year: 1977 },
  { id: "businesses", label: "Businesses",  year: 2004 },
  { id: "brands",     label: "Brands",      year: 2010 },
  { id: "places",     label: "Locations",   year: 2017 },
  { id: "people",     label: "People",      year: 2022 },
  { id: "today",      label: "Today",       year: new Date().getFullYear() - 1 },
  { id: "next",       label: "Next",        year: new Date().getFullYear() },
]

const CURRENT_YEAR = new Date().getFullYear()

/**
 * The story world's opening ground. The hero always opens on void (#0b0e12)
 * so the stage must start there too, otherwise the body briefly shows the
 * default ground (#f4f3ee) behind the transparent hero section.
 */
const OPENING_GROUND = GROUND_COLOR.void

export function StoryPage({
  stockCount,
  degraded,
  vehicles,
}: {
  stockCount: number
  degraded: boolean
  vehicles?: InventoryVehicle[]
}) {
  return (
    <div data-world="story">
      {/* The stage — persistent background that transitions between chapters. */}
      <StoryStage initial={OPENING_GROUND} initialId="origin">

        {/* Desktop rule — fixed left gutter, year counter + chapter stations. */}
        <StoryRule
          chapters={CHAPTERS}
          founded={FOUNDED}
          currentYear={CURRENT_YEAR}
          quietFor={["places"]}
        />

        {/* Mobile rule — horizontal bar across the top. */}
        <StoryRuleMobile founded={FOUNDED} currentYear={CURRENT_YEAR} />

        {/* The opening frame. */}
        <StoryHero founded={FOUNDED} />

        {/* Chapter 01 & 02 — Origin and Growth. */}
        <ChapterOrigin />
        <ChapterGrowth />

        {/* Chapter 03 & 04 — Business Ecosystem and Brands. */}
        <ChapterBusinesses />
        <ChapterBrands />

        {/* Chapter 05 & 06 — Places and People. */}
        <ChapterPlaces />
        <ChapterPeople />

        {/* Chapter 07 & 08 — Today and Next. */}
        <ChapterToday stockCount={stockCount} degraded={degraded} />
        <ChapterNext />

      </StoryStage>
    </div>
  )
}
