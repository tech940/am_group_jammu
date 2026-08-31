import type { Metadata } from "next"
import { AboutPage } from "./about-page"
import { FOUNDED, YEARS_TRADING, SCALE } from "@/components/home/content"

export const metadata: Metadata = {
  // Computed, not typed. The title used to read "55+ Years of Trust" and the
  // page body said the same — both hardcoded, and both wrong by three years.
  title: `About Us | ${YEARS_TRADING} Years of Trust in J&K`,
  description: `From a single Hindustan Petroleum forecourt in ${FOUNDED} to ${SCALE.outlets} dealership outlets across Jammu & Kashmir — the story of AM Group, its franchises, divisions and dated manufacturer awards.`,
  alternates: {
    canonical: "/about",
  },
}

export default function Page() {
  return <AboutPage />
}
