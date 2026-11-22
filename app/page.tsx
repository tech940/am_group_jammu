import { siteCountWord } from "@/lib/seo/locations"
import type { Metadata } from "next"
import { getHomeInventory, getInventory } from "@/lib/inventory/server"
import { formatINRShort } from "@/lib/inventory/adapter"
import { toCardVehicle } from "@/lib/inventory/filter"
import { Homepage } from "@/components/homepage/homepage"
import { getLandingHrefResolver } from "@/lib/seo/landing"
import { LOCATIONS, PRIMARY_LOCATION } from "@/lib/locations"
import { INDEX_ROBOTS, pageSocial, shareImageFrom } from "@/lib/seo/site"

export async function generateMetadata(): Promise<Metadata> {
  const [{ total, facets, degraded }, { vehicles }] = await Promise.all([getHomeInventory(), getInventory()])
  const live = !degraded && total > 0
  const sites = siteCountWord()

  // ONE PAGE PER SEARCH. Three pages used to chase "used cars in Jammu":
  //   /                  the dealer, and "buy or sell a used car in Jammu"
  //   /used-cars/jammu   THE "used cars in Jammu" page
  //   /inventory         the stock browser, "all used cars in stock"
  // So this title names the dealer and what you can do here, and the H1
  // (components/homepage/used-hero.tsx) says the same thing.
  const title = "AM Group Used Cars | Buy or Sell a Used Car in Jammu"
  const description = live
    ? `Buy or sell a used car in Jammu at AM Group Used Cars. ${total} second hand ${total === 1 ? "car" : "cars"} in stock today` +
      `${facets.priceRange.max > 0 ? ` from ${formatINRShort(facets.priceRange.min)}` : ""}, at ${sites} Jammu sites. ` +
      `Call ${PRIMARY_LOCATION.phone}.`
    : `Buy or sell a used car in Jammu at AM Group Used Cars, at ${sites} Jammu sites. Call ${PRIMARY_LOCATION.phone}.`

  return {
    // `absolute` because the title already carries the dealer's name; the
    // layout's template would append "| AM Group" a second time.
    title: { absolute: title },
    description,
    alternates: { canonical: "/" },
    robots: INDEX_ROBOTS,
    // Set here, not inherited: a page's `openGraph` replaces the layout's
    // rather than merging into it.
    ...pageSocial({ title, description, path: "/", image: shareImageFrom(vehicles) }),
  }
}

export default async function Page() {
  // Both calls read the same cached snapshot; the second is for whole-stock
  // counts (budget bands), which the home summary does not carry.
  const [home, all, landingHref] = await Promise.all([
    getHomeInventory(),
    getInventory(),
    getLandingHrefResolver(),
  ])

  // The value rail only earns its place if it shows different cars.
  const latestIds = new Set(home.latest.map((v) => v.id))
  const bestValue = home.bestValue.some((v) => !latestIds.has(v.id)) ? home.bestValue : []

  // No <main> here. app/layout.tsx already renders one around every route.
  return (
    <Homepage
      // The two rails are client components, so what they are given is written
      // into the page; each card gets only the photos it can show.
      latest={home.latest.map((v) => toCardVehicle(v))}
      bestValue={bestValue.map((v) => toCardVehicle(v))}
      vehicles={all.vehicles}
      facets={home.facets}
      total={home.total}
      degraded={home.degraded}
      landingHref={landingHref}
    />
  )
}
