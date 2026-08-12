import type { Metadata } from "next"
import { getHomeInventory } from "@/lib/inventory/server"
import { FOUNDED, SCALE, YEARS_TRADING } from "@/components/home/content"
import { StoryHero } from "@/components/story/hero"
import { StoryRule, StoryRuleMobile, type Chapter } from "@/components/story/rule"
import { ChapterOrigin, ChapterGrowth } from "@/components/story/ch-origin-growth"
import { ChapterBusinesses, ChapterBrands } from "@/components/story/ch-business-brands"
import { ChapterPlaces, ChapterPeople } from "@/components/story/ch-places-people"
import { ChapterToday, ChapterNext } from "@/components/story/ch-today-next"

/**
 * The homepage as one continuous story.
 *
 * Eight chapters, one thread. The reader scrolls from 1968 to now and out the
 * other side; the rule down the left edge counts the years and never unmounts,
 * so chapters overlap and dissolve rather than starting and stopping.
 *
 * `data-world="story"` scopes the homepage palette (see app/globals.css). Red is
 * banned on this page and the accent is champagne; the scope exists so that
 * changing it does not repaint the other 25 routes, and so the site's `danger`
 * colour — which shares a hex with the global accent — is left intact.
 *
 * Everything stated here is sourced. What has no source is absent, not filled:
 * no employee count, no customers-served figure, no roadmap, no archival
 * photograph, and no map pin for the 24 outlets that have no published address.
 */

export async function generateMetadata(): Promise<Metadata> {
  const { total, facets } = await getHomeInventory()
  const makes = facets.makes.map((m) => m.label).join(", ")

  return {
    title: `AM Group Jammu | J&K's Automotive & Industrial House Since ${FOUNDED}`,
    description:
      total > 0
        ? `${SCALE.outlets} dealership outlets, fuel, real estate and retail across Jammu & Kashmir since ${FOUNDED}. ${total} certified used cars in stock${makes ? ` — ${makes}` : ""}.`
        : `${SCALE.outlets} dealership outlets, fuel, real estate and retail across Jammu & Kashmir since ${FOUNDED}.`,
    alternates: { canonical: "/" },
  }
}

const CHAPTERS: Chapter[] = [
  { id: "origin", label: "Started", year: 1968 },
  { id: "growth", label: "Grew", year: 1990 },
  { id: "businesses", label: "Businesses", year: 2004 },
  { id: "brands", label: "Marques", year: 2012 },
  { id: "places", label: "Places", year: 2017 },
  { id: "people", label: "People", year: 2020 },
  { id: "today", label: "Today", year: 2024 },
  { id: "next", label: "Next", year: FOUNDED + YEARS_TRADING },
]

export default async function Page() {
  const inventory = await getHomeInventory()
  const thisYear = FOUNDED + YEARS_TRADING

  return (
    <div data-world="story" className="bg-void text-on-deep">
      {/* The thread. Rendered once, outside every chapter, so it is genuinely
          continuous rather than restarted per section. */}
      <StoryRule
        chapters={CHAPTERS}
        founded={FOUNDED}
        currentYear={thisYear}
        quietFor={["places"]}
      />
      <StoryRuleMobile founded={FOUNDED} currentYear={thisYear} />

      <StoryHero founded={FOUNDED} />

      <ChapterOrigin />
      <ChapterGrowth />
      <ChapterBusinesses />
      <ChapterBrands />
      <ChapterPlaces />
      <ChapterPeople />
      <ChapterToday stockCount={inventory.total} degraded={inventory.degraded} />
      <ChapterNext />
    </div>
  )
}
