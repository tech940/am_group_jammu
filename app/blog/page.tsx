import type { Metadata } from "next"
import { NewsPage } from "./news-page"

export const metadata: Metadata = {
  title: "News & Updates | AM Group Media Center",
  description:
    "Latest news from AM Group Jammu — new car launches, awards, service clinics, and automotive updates from Jammu & Kashmir.",
  alternates: {
    canonical: "/blog",
  },
}

export default function Page() {
  return <NewsPage />
}
