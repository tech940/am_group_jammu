import type { Metadata } from "next"
import InventoryClient from "./inventory-client"

export const metadata: Metadata = {
  title: "Car Inventory in Jammu | New & Used Cars with Prices",
  description:
    "Browse AM Group's full car inventory in Jammu — SUVs, sedans, hatchbacks and electric cars with on-road prices, specifications, and instant test drive booking.",
  alternates: {
    canonical: "/inventory",
  },
}

export default function Page() {
  return <InventoryClient />
}
