import type { Metadata } from "next"
import { RealEstatePage } from "./real-estate-page"

export const metadata: Metadata = {
  title: "Real Estate Division | Commercial & Residential Projects in J&K",
  description:
    "Explore AM Group's real estate portfolio — commercial complexes, residential projects, and property development across Jammu & Kashmir.",
  alternates: {
    canonical: "/real-estate",
  },
}

export default function Page() {
  return <RealEstatePage />
}
