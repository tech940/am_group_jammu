import type { Metadata } from "next"
import { RetailPage } from "./retail-page"

export const metadata: Metadata = {
  // Srinagar, not Jammu. content.ts has always said the store is in the Kashmir
  // Valley; the title and description said Jammu, which is a different city
  // 260km away and the wrong one to rank for.
  title: "S Mega Mart | Organised Retail in Srinagar",
  description:
    "S Mega Mart by AM Group — organised retail in Srinagar, Kashmir. The group's newest division and its first business outside automotive and energy.",
  alternates: {
    canonical: "/s-mega-mart",
  },
}

export default function Page() {
  return <RetailPage />
}
