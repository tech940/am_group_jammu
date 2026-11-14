import type { Metadata } from "next"
import { getHomeInventory, getInventory } from "@/lib/inventory/server"
import { Homepage } from "@/components/homepage/homepage"

// The same share image the root layout uses; restated because setting
// `openGraph` on a page replaces the parent object rather than merging into it.
const OG_IMAGE = "/inventory_hero_bg.png"

export async function generateMetadata(): Promise<Metadata> {
  const { total, facets, degraded } = await getHomeInventory()
  const makes = facets.makes.map((m) => m.label).join(", ")
  const live = !degraded && total > 0

  // A used-car shop's title: what you can do here (buy, sell), and where. It
  // names the dealer first on purpose — /used-cars/jammu and /inventory already
  // target "used cars in Jammu" head-on, and three pages chasing the identical
  // phrase would compete with each other.
  const title = "AM Group Used Cars | Buy or Sell a Used Car in Jammu"
  const description = live
    ? `${total} used cars in stock in Jammu${makes ? ` — ${makes}` : ""}. Our own photos, recorded odometer readings and asking prices. Sell or exchange your car with a free valuation. Finance, insurance and RC transfer in-house.`
    : "Buy or sell a used car in Jammu. Our own photos, recorded odometer readings and asking prices, and a free valuation for your car. Finance, insurance and RC transfer in-house."

  // openGraph and twitter are set here, not inherited: the root layout's
  // defaults still describe the group and name another city.
  return {
    title,
    description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: "/",
      siteName: "AM Group Used Cars",
      title,
      description,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "AM Group Used Cars, Jammu" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE] },
  }
}

export default async function Page() {
  // Both calls read the same cached snapshot; the second is for whole-stock
  // counts (budget bands), which the home summary does not carry.
  const [home, all] = await Promise.all([getHomeInventory(), getInventory()])

  // The value rail only earns its place if it shows different cars.
  const latestIds = new Set(home.latest.map((v) => v.id))
  const bestValue = home.bestValue.some((v) => !latestIds.has(v.id)) ? home.bestValue : []

  // No <main> here. app/layout.tsx already renders one around every route.
  return (
    <Homepage
      latest={home.latest}
      bestValue={bestValue}
      vehicles={all.vehicles}
      facets={home.facets}
      total={home.total}
      degraded={home.degraded}
    />
  )
}
