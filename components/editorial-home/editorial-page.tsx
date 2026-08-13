"use client"

import * as React from "react"
import { EditorialThread } from "./shared/editorial-thread"
import { EditorialHero } from "./hero"
import { EditorialOrigin } from "./origin"
import { EditorialTimeline } from "./timeline"
import { EditorialDivisions } from "./divisions"
import { EditorialMarques } from "./marques"
import { EditorialGeography } from "./geography"
import { EditorialHuman } from "./human"
import { EditorialScale } from "./scale"
import { EditorialFuture } from "./future"
import { FOUNDED } from "@/components/home/content"

export function EditorialPage({
  stockCount,
}: {
  stockCount: number
}) {
  const currentYear = new Date().getFullYear()

  return (
    <div className="relative min-h-screen bg-[#FFFFFF] font-sans antialiased">
      {/* Fixed Technical Coordinate & Timeline Thread */}
      <EditorialThread founded={FOUNDED} currentYear={currentYear} />

      {/* Scene 01 — Exhibition Cover (Hero Opener) */}
      <EditorialHero founded={FOUNDED} />

      {/* Scene 02 — Archival Origin (1968) */}
      <EditorialOrigin />

      {/* Scene 03 — Chronological Register (1977–2024 Timeline) */}
      <EditorialTimeline />

      {/* Scene 04 — Sector Divisions (Automobile, Petroleum, Real Estate, Retail) */}
      <EditorialDivisions />

      {/* Scene 05 — Franchise Catalogue (Marque Index) */}
      <EditorialMarques />

      {/* Scene 06 — NH 44 Geographic Route (Jammu to Srinagar) */}
      <EditorialGeography />

      {/* Scene 07 — Human Records (Customer Reviews) */}
      <EditorialHuman />

      {/* Scene 08 — Scale in Numbers & OEM Trophies */}
      <EditorialScale stockCount={stockCount} />

      {/* Scene 09 — Continuing Record & Ownership Circuit */}
      <EditorialFuture />
    </div>
  )
}
