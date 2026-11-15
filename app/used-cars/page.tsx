import { linkPhones } from "@/components/system/phone-text"
import type { Metadata } from "next"
import Link from "next/link"
import { PRIMARY_LOCATION } from "@/lib/locations"
import { Button } from "@/components/ui/button"
import { PhoneGlyph } from "@/components/system/marks"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { RelatedLinks } from "@/components/seo/related-links"
import { getInventory } from "@/lib/inventory/server"
import { getLandingDirectory, type LandingEntry, type LandingKind } from "@/lib/seo/landing"
import { getSeoLinks, type SeoLinkGroup } from "@/lib/seo/links"
import { pageSocial } from "@/lib/seo/site"

/**
 * The index of every used-car landing page that has stock behind it today.
 *
 * /used-cars used to be a 404 with some thirty pages living beneath it, so the
 * folder had no front door for a visitor who shortened the address or for a
 * crawler walking up from a landing page. It is a directory, not a rival to
 * /used-cars/jammu: its title and heading are about finding a page by budget,
 * model or type, and its first link is to the Jammu page.
 *
 * Every link and count comes from lib/seo/landing.ts, so a page appears here
 * exactly while it is live and indexed.
 */

const PATH = "/used-cars"
const TITLE = "Find a Used Car by Budget, Model or Type in Jammu"

/** Section order and headings. The city page is linked in the intro instead. */
const GROUPS: { kind: LandingKind; title: string }[] = [
  { kind: "budget", title: "By budget" },
  { kind: "model", title: "By model" },
  { kind: "body", title: "By body type" },
  { kind: "fuel", title: "By fuel" },
  { kind: "transmission", title: "By gearbox" },
]

export async function generateMetadata(): Promise<Metadata> {
  const { total, degraded } = await getInventory()
  const live = !degraded && total > 0
  const description =
    `Every used-car page at AM Group, Jammu, with the number of cars in stock today: by budget, make, model, ` +
    `body type, fuel and gearbox.${live ? ` ${total} ${total === 1 ? "car" : "cars"} in stock.` : ""}`

  return {
    title: TITLE,
    description,
    alternates: { canonical: PATH },
    // With no stock there is nothing to list, so the page stays out of the index.
    ...(live ? {} : { robots: { index: false, follow: true } }),
    ...pageSocial({ title: TITLE, description, path: PATH }),
  }
}

const byBudget = (a: LandingEntry, b: LandingEntry) => a.count - b.count
const byCount = (a: LandingEntry, b: LandingEntry) => b.count - a.count || a.label.localeCompare(b.label)

export default async function UsedCarsIndexPage() {
  const [{ total, degraded }, directory, seoLinks] = await Promise.all([
    getInventory(),
    getLandingDirectory(),
    getSeoLinks(),
  ])
  const live = !degraded && total > 0

  const groups: SeoLinkGroup[] = GROUPS.map(({ kind, title }) => ({
    title,
    links: directory
      .filter((e) => e.kind === kind)
      // Budget bands read in rising order; a band's count rises with its ceiling.
      .sort(kind === "budget" ? byBudget : byCount)
      .map((e) => ({ label: e.label, href: e.href, count: e.count })),
  }))
  // Makes have their own pages under /brands; they belong in this list too.
  groups.splice(1, 0, { title: "By make", links: seoLinks.makes })

  return (
    <div className="min-h-screen bg-ground">
      <Breadcrumbs items={[{ label: "Find a used car" }]} />

      <section className="border-b border-line bg-ground-2">
        <div className="container mx-auto px-4 py-10 md:px-8 md:py-14">
          <h1 className="mb-5 max-w-4xl font-display text-h1 text-ink">
            Find a used car by budget, model or type
          </h1>

          <div className="max-w-3xl space-y-3">
            {live ? (
              <p className="text-body text-ink-2">
                AM Group has <span data-num>{total}</span> used {total === 1 ? "car" : "cars"} in stock in
                Jammu today. Each link below opens the cars that match, and the number beside it is how
                many there are. A link is listed only while there is a car behind it.
              </p>
            ) : (
              <p className="text-body text-ink-2">
                Our stock list is not loading right now. Call {linkPhones(PRIMARY_LOCATION.phone, "inline-text")} and we will tell you
                what is in stock today.
              </p>
            )}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button asChild variant="primary" size="lg">
              <Link href="/used-cars/jammu">Used cars in Jammu</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/inventory">All used cars in stock</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href={`tel:${PRIMARY_LOCATION.phoneE164}`} data-track-location="used-cars-index">
                <PhoneGlyph /> {PRIMARY_LOCATION.phone}
              </a>
            </Button>
          </div>
        </div>
      </section>

      <RelatedLinks title="Every used-car page with stock today" groups={groups} />
    </div>
  )
}
