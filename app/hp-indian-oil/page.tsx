import type { Metadata } from "next"
import EnergyClient from "./hp-indian-oil-client"

export const metadata: Metadata = {
  title: "HP & Indian Oil Fuel Stations | Energy Division",
  description:
    "AM Group's energy division operates HP and Indian Oil fuel stations across Jammu & Kashmir — where the group's journey began in 1968.",
  alternates: {
    canonical: "/hp-indian-oil",
  },
}

export default function Page() {
  return <EnergyClient />
}
