import type { Metadata } from "next"
import { PRIMARY_LOCATION } from "@/lib/locations"
import { ContactPage } from "./contact-page"

export const metadata: Metadata = {
  title: "Contact Us | Showrooms in Jammu & Srinagar",
  description:
    `Get in touch with AM Group — visit AM Business Park, N-H 1 Bye-Pass Road, Jammu, or AM Tower, Hyderpora, Srinagar. Call ${PRIMARY_LOCATION.phone} for sales, service, and support.`,
  alternates: {
    canonical: "/contact",
  },
}

export default function Page() {
  return <ContactPage />
}
