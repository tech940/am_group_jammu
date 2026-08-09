import type { Metadata } from "next"
import AboutClient from "./about-client"

export const metadata: Metadata = {
  title: "About Us | 55+ Years of Trust in J&K",
  description:
    "From a single fuel station in 1968 to J&K's largest automotive and retail conglomerate — the story of AM Group, its dealerships, people, and milestones.",
  alternates: {
    canonical: "/about",
  },
}

export default function Page() {
  return <AboutClient />
}
