import type { Metadata } from "next"
import AutomobileClient from "./automobile-client"

export const metadata: Metadata = {
  title: "Automobile Division | Authorised Car Dealerships in J&K",
  description:
    "AM Group's automobile division — authorised new car showrooms, certified pre-owned outlets, and full-service workshops across Jammu & Kashmir.",
  alternates: {
    canonical: "/automobile",
  },
}

export default function Page() {
  return <AutomobileClient />
}
