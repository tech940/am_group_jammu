import type { Metadata } from "next"
import HomeClient from "./home-client"
import { getHomeInventory } from "@/lib/inventory/server"

export async function generateMetadata(): Promise<Metadata> {
  const { total, facets } = await getHomeInventory()
  const makes = facets.makes.map((m) => m.label).join(", ")

  return {
    title: "AM Group Jammu | New & Used Car Dealerships in Jammu & Kashmir",
    description:
      total > 0
        ? `J&K's largest automotive group since 1968. ${total} certified used cars in stock` +
          `${makes ? ` — ${makes}` : ""}. Authorised showrooms, service workshops and easy car finance in Jammu.`
        : "J&K's largest automotive group since 1968. Certified used cars, authorised showrooms, service workshops and easy car finance in Jammu.",
    alternates: { canonical: "/" },
  }
}

export default async function Page() {
  const inventory = await getHomeInventory()
  return <HomeClient inventory={inventory} />
}
