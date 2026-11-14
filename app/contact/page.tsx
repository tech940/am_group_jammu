import type { Metadata } from "next"
import { LOCATIONS, PRIMARY_LOCATION, formatHours } from "@/lib/locations"
import { locationNames } from "@/lib/seo/locations"
import { pageSocial } from "@/lib/seo/site"
import { ContactPage } from "./contact-page"

const title = "Contact Us | Used Cars in Jammu"
const description =
  `Call ${PRIMARY_LOCATION.phone}, WhatsApp or write to AM Group about buying or selling a used car in Jammu. ` +
  `${LOCATIONS.length} locations: ${locationNames()}. Open ${formatHours(PRIMARY_LOCATION)}.`

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/contact",
  },
  ...pageSocial({ title, description, path: "/contact" }),
}

export default function Page() {
  return <ContactPage />
}
