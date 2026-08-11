import type { Metadata } from "next"
import { getHomeInventory } from "@/lib/inventory/server"
import { HomeHero } from "@/components/home/hero"
import { Story } from "@/components/home/timeline"
import { Divisions } from "@/components/home/divisions"
import { Brands } from "@/components/home/brands"
import { Locations } from "@/components/home/locations"
import { Manifest } from "@/components/home/manifest"
import { Provenance } from "@/components/home/provenance"
import { Ecosystem } from "@/components/home/ecosystem"
import { Closing } from "@/components/home/closing"

const CONTRACT = `
THESIS: A 58-year family conglomerate presented as its own master drawing set —
measured, annotated, verifiable. Refuses the category default: the dark
navy/gold "luxury dealership" template of hero + card grids.
OWN-WORLD: Drafting paper (#F4F3EE), cyanotype print blue (#133A63), ink
(#14161A), redline (#C13A2A). Barlow Condensed display caps, Archivo text,
Fragment Mono annotation. Title blocks, dimension lines, registration marks,
photography as captioned plates with sharp edges. Recognizable with all
content removed.
STORY: A buyer in J&K understands this is the region's oldest automotive
house, sees the proof drawn to scale (timeline, register, site plan, live
stock), and calls, visits, or opens the inventory.
FIRST VIEWPORT: Split cover sheet — left 7/12 print-blue drawn field with
title block, masthead "Keeping J&K moving since 1968", dimension line
1968⊢58 years⊣2026, facts paragraph, two actions (Read the drawings /
N cars in stock); right 5/12 full-bleed plate FIG.01, real AM Kia showroom.
FORM: Engineering drawing office — candidate 6 of 7 on the ordered list,
seed key 2486ed40.
FINISH: unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, and DESIGN.md
`

export async function generateMetadata(): Promise<Metadata> {
  const { total, facets } = await getHomeInventory()
  const makes = facets.makes.map((m) => m.label).join(", ")

  return {
    title: "AM Group Jammu | J&K's Automotive & Industrial House Since 1968",
    description:
      total > 0
        ? `26 dealership outlets, 8 vehicle franchises, fuel, real estate and retail across Jammu & Kashmir since 1968. ${total} certified used cars in stock${makes ? ` — ${makes}` : ""}.`
        : "26 dealership outlets, 8 vehicle franchises, fuel, real estate and retail across Jammu & Kashmir since 1968.",
    alternates: { canonical: "/" },
  }
}

export default async function Page() {
  const inventory = await getHomeInventory()

  return (
    <div className="bg-ground text-ink">
      <HomeHero stockCount={inventory.total} />
      <Story />
      <Divisions />
      <Brands />
      <Locations />
      <Manifest
        vehicles={inventory.latest.length > 0 ? inventory.latest : inventory.bestValue}
        total={inventory.total}
        degraded={inventory.degraded}
      />
      <Provenance />
      <Ecosystem />
      <Closing />
    </div>
  )
}
