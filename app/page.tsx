import type { Metadata } from "next"
import { getHomeInventory } from "@/lib/inventory/server"
import { EditorialPage } from "@/components/editorial-home/editorial-page"

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
    <main className="min-h-screen">
      <EditorialPage stockCount={inventory.total} />
    </main>
  )
}
