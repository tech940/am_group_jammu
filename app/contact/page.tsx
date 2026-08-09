import type { Metadata } from "next"
import ContactClient from "./contact-client"

export const metadata: Metadata = {
  title: "Contact Us | Showrooms in Jammu & Srinagar",
  description:
    "Get in touch with AM Group — visit AM Business Park, N-H 1 Bye-Pass Road, Jammu, or AM Tower, Hyderpora, Srinagar. Call +91 94191 00000 for sales, service, and support.",
  alternates: {
    canonical: "/contact",
  },
}

export default function Page() {
  return <ContactClient />
}
