import type { Metadata } from "next"
import { getHomeInventory } from "@/lib/inventory/server"
import { Homepage } from "@/components/homepage/homepage"

export async function generateMetadata(): Promise<Metadata> {
  const { total, facets, degraded } = await getHomeInventory()
  const makes = facets.makes.map((m) => m.label).join(", ")
  const live = !degraded && total > 0

  return {
    title: "AM Group Jammu | J&K's Automotive & Industrial House Since 1968",
    description: live
      ? // "Seven", not eight: the eighth franchise is Chevrolet, held 2004–2017.
        // The old description said eight while the page itself said seven.
        `26 dealership outlets, seven current vehicle franchises, fuel, real estate and retail across Jammu & Kashmir since 1968. ${total} certified used cars in stock${makes ? ` — ${makes}` : ""}.`
      : "26 dealership outlets, seven current vehicle franchises, fuel, real estate and retail across Jammu & Kashmir since 1968.",
    alternates: { canonical: "/" },
  }
}

export default async function Page() {
  const { latest, total, degraded } = await getHomeInventory()

  // No <main> here. app/layout.tsx already renders one around every route, and
  // two main landmarks means a screen reader's "jump to main content" lands in
  // an ambiguous place.
  return <Homepage vehicles={latest} total={total} degraded={degraded} />
}
