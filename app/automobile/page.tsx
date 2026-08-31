import type { Metadata } from "next"
import { AutomobilePage } from "./automobile-page"
import { getHomeInventory } from "@/lib/inventory/server"
import { SCALE } from "@/components/home/content"

export const metadata: Metadata = {
  title: "Automobile Division | Authorised Car Dealerships in J&K",
  description: `AM Group's automobile division — seven current vehicle franchises, authorised new-car showrooms, certified pre-owned stock and full-service workshops across ${SCALE.cities.join(", ")}.`,
  alternates: {
    canonical: "/automobile",
  },
}

export default async function Page() {
  const { latest, total, degraded } = await getHomeInventory()
  return <AutomobilePage vehicles={latest} total={total} degraded={degraded} />
}
