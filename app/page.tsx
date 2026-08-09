import type { Metadata } from "next"
import HomeClient from "./home-client"

export const metadata: Metadata = {
  title: "AM Group Jammu | New & Used Car Dealerships in Jammu & Kashmir",
  description:
    "J&K's largest automotive group since 1968. Explore new & certified used cars in Jammu and Srinagar, authorised showrooms, service workshops, easy finance, and exclusive dealer offers.",
  alternates: {
    canonical: "/",
  },
}

export default function Page() {
  return <HomeClient />
}
