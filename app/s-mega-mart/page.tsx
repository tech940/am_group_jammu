import type { Metadata } from "next"
import SMegaMartClient from "./s-mega-mart-client"

export const metadata: Metadata = {
  title: "S Mega Mart | Retail Shopping in Jammu",
  description:
    "S Mega Mart by AM Group — a modern retail shopping destination in Jammu offering groceries, lifestyle products, and daily essentials under one roof.",
  alternates: {
    canonical: "/s-mega-mart",
  },
}

export default function Page() {
  return <SMegaMartClient />
}
