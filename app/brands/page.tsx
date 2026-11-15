import { linkPhones } from "@/components/system/phone-text"
import type { Metadata } from "next"
import Link from "next/link"
import { PRIMARY_LOCATION } from "@/lib/locations"
import { Button } from "@/components/ui/button"
import { PhoneGlyph } from "@/components/system/marks"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { RelatedLinks } from "@/components/seo/related-links"
import { getInventory } from "@/lib/inventory/server"
import { formatINRShort } from "@/lib/inventory/adapter"
import { getLandingHrefResolver } from "@/lib/seo/landing"
import type { SeoLinkGroup } from "@/lib/seo/links"
import { pageSocial } from "@/lib/seo/site"

/**
 * Every make in stock today, each with its count and its model pages.
 *
 * /brands used to be a 404 above the make pages. This is their index, and the
 * second level of each make page's breadcrumb. It lists only makes with a car
 * in stock, counted from the stock list, and says nothing about being a
 * dealer for any of them: this is a used-car business.
 */

const PATH = "/brands"
const TITLE = "Used Cars by Make in Jammu"

const list = (items: string[]): string =>
  items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`

export async function generateMetadata(): Promise<Metadata> {
  const { facets, total, degraded } = await getInventory()
  const live = !degraded && total > 0
  const makes = facets.makes.map((m) => `${m.label} (${m.count})`)
  const description = live
    ? `Used cars in stock at AM Group, Jammu, by make: ${list(makes)}. Real photos, odometer readings and asking prices.`
    : `Used cars at AM Group, Jammu, by make. Call ${PRIMARY_LOCATION.phone} for the cars in stock today.`

  return {
    title: TITLE,
    description,
    alternates: { canonical: PATH },
    ...(live ? {} : { robots: { index: false, follow: true } }),
    ...pageSocial({ title: TITLE, description, path: PATH }),
  }
}

export default async function BrandsIndexPage() {
  const [{ vehicles, facets, total, degraded }, landingHref] = await Promise.all([
    getInventory(),
    getLandingHrefResolver(),
  ])
  const live = !degraded && total > 0

  // One group per make: the make's own page first, then each of its models.
  const groups: SeoLinkGroup[] = facets.makes.flatMap((make) => {
    const brandHref = landingHref({ kind: "make", value: make.value })
    if (!brandHref) return []
    const cars = vehicles.filter((v) => v.make === make.value)
    const prices = cars.map((v) => v.price).filter((n): n is number => n !== null)
    const models = [...new Set(cars.map((v) => v.model).filter(Boolean))] as string[]
    return [
      {
        title: `Used ${make.label}${prices.length ? `, from ${formatINRShort(Math.min(...prices))}` : ""}`,
        links: [
          { label: `All used ${make.label} cars`, href: brandHref, count: make.count },
          ...models
            .map((model) => ({
              label: `${make.label} ${model}`,
              href: landingHref({ kind: "model", value: model }),
              count: cars.filter((v) => v.model === model).length,
            }))
            // A make with one model in stock has one page, not two.
            .filter((l): l is { label: string; href: string; count: number } => !!l.href && l.href !== brandHref),
        ],
      },
    ]
  })

  return (
    <div className="min-h-screen bg-ground">
      <Breadcrumbs items={[{ label: "Used cars by make" }]} />

      <section className="border-b border-line bg-ground-2">
        <div className="container mx-auto px-4 py-10 md:px-8 md:py-14">
          <h1 className="mb-5 max-w-4xl font-display text-h1 text-ink">Used cars by make in Jammu</h1>

          <div className="max-w-3xl space-y-3">
            {live ? (
              <p className="text-body text-ink-2">
                AM Group has <span data-num>{total}</span> used {total === 1 ? "car" : "cars"} in stock in
                Jammu today, across {list(facets.makes.map((m) => m.label))}. The number beside each link
                is how many of those cars are in stock.
              </p>
            ) : (
              <p className="text-body text-ink-2">
                Our stock list is not loading right now. Call {linkPhones(PRIMARY_LOCATION.phone, "inline-text")} and we will tell you
                which makes are in stock today.
              </p>
            )}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button asChild variant="primary" size="lg">
              <Link href="/used-cars/jammu">Used cars in Jammu</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/used-cars">Browse by budget or type</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href={`tel:${PRIMARY_LOCATION.phoneE164}`} data-track-location="brands-index">
                <PhoneGlyph /> {PRIMARY_LOCATION.phone}
              </a>
            </Button>
          </div>
        </div>
      </section>

      <RelatedLinks title="Makes in stock today" groups={groups} />
    </div>
  )
}
