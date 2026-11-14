import type { Metadata } from "next"
import { LOCATIONS, PRIMARY_LOCATION, formatHours } from "@/lib/locations"
import { pageSocial } from "@/lib/seo/site"
import { dealerId, jsonLdString, pageSchema } from "@/lib/seo-schemas"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { ContactPage } from "./contact-page"

// Not "Used Cars in Jammu": those words are the title of one page,
// /used-cars/jammu, and this page should not compete with it for that search.
const title = "Contact Us: Phone, WhatsApp and Directions"
// Phone first and kept near 155 characters, so a search result shows the
// number without the visitor opening the page.
const description =
  `Call ${PRIMARY_LOCATION.phone}, WhatsApp or write to AM Group about buying or selling a used car in Jammu. ` +
  `${LOCATIONS.length} sites, open ${formatHours(PRIMARY_LOCATION)}.`

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/contact",
  },
  ...pageSocial({ title, description, path: "/contact" }),
}

export default function Page() {
  return (
    <>
      {/* ContactPage node: this page is how you reach the dealer, by id. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString(
            pageSchema({
              type: "ContactPage",
              path: "/contact",
              name: title,
              description,
              mainEntityId: dealerId(),
            }),
          ),
        }}
      />
      {/* Draws "Home / Contact" and writes the matching BreadcrumbList. The
          layout's path-derived trail drew the same words with no structured
          data, so /contact is opted out of it in conditional-breadcrumbs. */}
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <ContactPage />
    </>
  )
}
