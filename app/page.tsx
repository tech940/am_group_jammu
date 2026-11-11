import type { Metadata } from "next"
import { getHomeInventory, getInventory } from "@/lib/inventory/server"
import { Homepage } from "@/components/homepage/homepage"

export async function generateMetadata(): Promise<Metadata> {
  const { total, facets, degraded } = await getHomeInventory()
  const makes = facets.makes.map((m) => m.label).join(", ")
  const live = !degraded && total > 0

  // The homepage is a used-car page now, so it is titled like one. It names the
  // dealer first on purpose: /used-cars/jammu and /inventory already target
  // "used cars in Jammu" head-on, and three pages chasing the identical phrase
  // would compete with each other.
  return {
    title: "AM Group Used Cars | Certified Pre-Owned Cars in Jammu & Kashmir",
    description: live
      ? `${total} certified used cars in stock at AM Business Park, Jammu${makes ? ` — ${makes}` : ""}. Real photos, recorded odometer readings and asking prices. Finance, insurance and RC transfer in-house. A dealer since 1968.`
      : "Certified used cars at AM Business Park, Jammu. Real photos, recorded odometer readings and asking prices. Finance, insurance and RC transfer in-house. A dealer since 1968.",
    alternates: { canonical: "/" },
  }
}

export default async function Page() {
  // Both calls read the same cached snapshot; the second is for whole-stock
  // counts (budget bands), which the home summary does not carry.
  const [home, all] = await Promise.all([getHomeInventory(), getInventory()])

  // The hero car: the newest listing that has photographs AND a price, so the
  // first thing on the page is never a car with "price on request".
  const featured = home.latest.find((v) => v.price !== null && v.primaryImage) ?? null

  // The value rail only earns its place if it shows different cars.
  const latestIds = new Set(home.latest.map((v) => v.id))
  const bestValue = home.bestValue.some((v) => !latestIds.has(v.id)) ? home.bestValue : []

  // No <main> here. app/layout.tsx already renders one around every route.
  return (
    <Homepage
      latest={home.latest}
      bestValue={bestValue}
      featured={featured}
      vehicles={all.vehicles}
      facets={home.facets}
      total={home.total}
      degraded={home.degraded}
    />
  )
}
