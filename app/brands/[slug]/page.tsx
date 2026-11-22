import { INDEX_ROBOTS, fitDescription } from "@/lib/seo/site"
import { linkPhones } from "@/components/system/phone-text"
import type { Metadata } from "next"
import Link from "@/components/system/intent-link"
import { notFound } from "next/navigation"
import { H_PROMISE, LOCATIONS, PRIMARY_LOCATION } from "@/lib/locations"
import { FeaturedInventory } from "@/components/sections/inventory"
import { MoreCars } from "@/components/sections/more-cars"
import { getInventory } from "@/lib/inventory/server"
import { formatINR, slugify } from "@/lib/inventory/adapter"
import { Button } from "@/components/ui/button"
import { PhoneGlyph } from "@/components/system/marks"
import { EnquireCta } from "@/components/system/enquire-cta"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { FaqSection } from "@/components/seo/faq-section"
import { FrequentSearches } from "@/components/seo/frequent-searches"
import { RelatedLinks } from "@/components/seo/related-links"
import { toCardVehicle } from "@/lib/inventory/filter"
import { getFrequentSearches, getSeoLinks, type SeoLink } from "@/lib/seo/links"
import { getLandingHrefResolver, resolveSoldOutBrand } from "@/lib/seo/landing"
import { locationNames } from "@/lib/seo/locations"
import { generateVehicleListSchema, jsonLdString } from "@/lib/seo-schemas"
import { pageSocial, shareImageFrom } from "@/lib/seo/site"

/**
 * One page per make that is actually in stock — "used Hyundai cars in Jammu".
 *
 * Everything quoted here is counted from live stock. The page makes no claim
 * about being an authorised dealer for the make: this is a used-car site, and
 * a used Maruti on the forecourt does not make us a Maruti dealership.
 *
 * A make the dealer has sold out of keeps its page (see SoldOutBrand below)
 * instead of turning into a 404 the day the last car goes.
 */

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const { facets } = await getInventory()
  return facets.makes.map((m) => ({ slug: slugify(m.value) }))
}

/** Resolve a URL slug back to the make as it appears in stock. */
async function resolveBrand(slug: string) {
  const { vehicles, facets } = await getInventory()
  const match = facets.makes.find((m) => slugify(m.value) === slugify(slug))
  if (!match) return null
  const brandVehicles = vehicles.filter((v) => v.make && slugify(v.make) === slugify(match.value))
  const prices = brandVehicles.map((v) => v.price).filter((n): n is number => n !== null)
  const years = brandVehicles.map((v) => v.year).filter((y): y is number => y !== null)
  return {
    brandName: match.label,
    /** Canonical slug, whatever spelling the request used. */
    slug: slugify(match.value),
    count: brandVehicles.length,
    vehicles: brandVehicles,
    models: [...new Set(brandVehicles.map((v) => v.model).filter(Boolean))] as string[],
    priceLow: prices.length ? Math.min(...prices) : null,
    priceHigh: prices.length ? Math.max(...prices) : null,
    yearLow: years.length ? Math.min(...years) : null,
    yearHigh: years.length ? Math.max(...years) : null,
  }
}

const list = (items: string[]): string =>
  items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const brand = await resolveBrand(slug)

  if (!brand) {
    const soldOut = await resolveSoldOutBrand(slug)
    if (!soldOut) return { title: "Brand Not Found", robots: "noindex" }
    const title = `Used ${soldOut.brandName} Cars in Jammu`
    const description =
      `No used ${soldOut.brandName} car is in stock at AM Group in Jammu today. ` +
      `Tell us you are looking for one and we will call you when one arrives.`
    const path = `/brands/${soldOut.slug}`
    return {
      title,
      description,
      alternates: { canonical: path },
      // Nothing of this make to show, so the page is not offered to the index.
      robots: { index: false, follow: true },
      ...pageSocial({ title, description, path }),
    }
  }

  // The layout appends " | AM Group"; past about 49 characters the count goes.
  const withCount = `Used ${brand.brandName} Cars in Jammu | ${brand.count} in Stock`
  const title = withCount.length <= 49 ? withCount : `Used ${brand.brandName} Cars in Jammu`
  const description = fitDescription([
    `${brand.count} used ${brand.brandName} ${brand.count === 1 ? "car" : "cars"} for sale in Jammu at AM Group` +
      (brand.models.length ? ` — ${list(brand.models)}` : "") +
      ".",
    brand.priceLow !== null && brand.priceHigh !== null
      ? brand.priceLow === brand.priceHigh
        ? `Priced at ${formatINR(brand.priceLow)}.`
        : `Priced ${formatINR(brand.priceLow)} to ${formatINR(brand.priceHigh)}.`
      : null,
    "Real photos and odometer readings.",
    "Finance and exchange.",
  ])
  const path = `/brands/${brand.slug}`

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: brand.count === 0 ? { index: false, follow: true } : INDEX_ROBOTS,
    ...pageSocial({ title, description, path, image: shareImageFrom(brand.vehicles) }),
  }
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params
  const brand = await resolveBrand(slug)

  if (!brand) {
    // No car of this make in stock. If we have sold one, say so honestly and
    // offer to call; a make we have never had is a 404.
    const soldOut = await resolveSoldOutBrand(slug)
    if (!soldOut) notFound()
    return <SoldOutBrand brandName={soldOut.brandName} path={`/brands/${soldOut.slug}`} />
  }

  const { brandName, vehicles: brandVehicles, count, models } = brand
  const { vehicles: stock } = await getInventory()
  const path = `/brands/${brand.slug}`
  const cars = count === 1 ? "car" : "cars"

  const [frequentSearches, seoLinks, landingHref] = await Promise.all([
    getFrequentSearches(30),
    getSeoLinks(),
    getLandingHrefResolver(),
  ])

  const priceRange =
    brand.priceLow !== null && brand.priceHigh !== null
      ? brand.priceLow === brand.priceHigh
        ? formatINR(brand.priceLow)
        : `${formatINR(brand.priceLow)} to ${formatINR(brand.priceHigh)}`
      : null
  const yearRange =
    brand.yearLow !== null && brand.yearHigh !== null
      ? brand.yearLow === brand.yearHigh
        ? String(brand.yearLow)
        : `${brand.yearLow} to ${brand.yearHigh}`
      : null
  // One year reads "model year 2016"; a span reads "model years 2016 to 2024".
  const oneYear = brand.yearLow !== null && brand.yearLow === brand.yearHigh

  // Model pages for this make. When the make has a single model in stock,
  // that model's page shows the same cars as this one and points here as its
  // canonical, so there is nothing to link to and the group is left out.
  const modelLinks: SeoLink[] = models
    .map((model) => ({
      label: `Used ${brandName} ${model}`,
      href: landingHref({ kind: "model", value: model }) ?? `/inventory?model=${encodeURIComponent(model)}`,
      count: brandVehicles.filter((v) => v.model === model).length,
    }))
    .filter((l) => l.href !== path)

  const brandFaqs = [
    {
      question: `How many used ${brandName} cars are available in Jammu?`,
      answer:
        `AM Group has ${count} used ${brandName} ${cars} in stock right now` +
        `${models.length ? `: ${list(models)}` : ""}. This page shows live stock.`,
    },
    ...(priceRange
      ? [{
          question: `What is the price of a used ${brandName} in Jammu?`,
          answer:
            `Our ${brandName} stock is currently priced ${priceRange}, depending on year, variant and kilometres driven. ` +
            `Registration transfer and insurance are quoted separately.`,
        }]
      : []),
    ...(yearRange
      ? [{
          question: `Which ${brandName} model years do you have?`,
          answer: `${oneYear ? "Model year" : "Model years"} in stock right now: ${yearRange}. Each listing shows its exact year and kilometres.`,
        }]
      : []),
    {
      question: `Do you offer finance and exchange on used ${brandName} cars?`,
      answer:
        "Yes. We can help arrange finance, value your present car for exchange, " +
        "and handle the RC and insurance transfer.",
    },
    {
      question: `Where can I see and test drive a used ${brandName}?`,
      answer:
        `At our ${LOCATIONS.length} used-car locations in Jammu: ${locationNames()}. ` +
        `Call ${PRIMARY_LOCATION.phone} or send an enquiry from any ${brandName} listing and we will confirm which ` +
        `site the car is at and arrange the drive. Bring a valid driving licence.`,
    },
  ]

  const jsonLd = generateVehicleListSchema({
    name: `Used ${brandName} Cars in Jammu`,
    description: `${count} used ${brandName} ${cars} for sale in Jammu at AM Group.`,
    path,
    vehicles: brandVehicles,
  })

  return (
    <div className="min-h-screen bg-ground">
      {count > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
      )}

      <Breadcrumbs items={[{ label: "Used cars by make", href: "/brands" }, { label: `Used ${brandName} Cars` }]} />

      <section className="border-b border-line bg-ground-2">
        <div className="container mx-auto px-4 py-10 md:px-8 md:py-14">
          <h1 className="mb-5 max-w-4xl font-display text-h1 text-ink">
            Used {brandName} Cars in Jammu — <span data-num>{count}</span> in Stock
          </h1>

          <div className="max-w-3xl space-y-3">
            <p className="text-body text-ink-2">
              AM Group has {count} used {brandName} {cars} for sale in Jammu right now
              {priceRange ? `, priced ${priceRange}` : ""}
              {yearRange ? (oneYear ? `, model year ${yearRange}` : `, with model years ${yearRange}`) : ""}.
              {models.length > 0 && ` Models in stock: ${list(models)}.`}
            </p>
            <p className="text-body text-ink-2">
              Every listing below is a car in our stock, with its own photographs and the odometer
              reading shown on each listing. The cars are kept at our {LOCATIONS.length} Jammu locations —
              call before you travel and we will tell you which site a car is at.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <EnquireCta label={`Enquire about a ${brandName}`} sourceLabel="brand-hero" />
            <Button asChild variant="secondary" size="lg">
              <a href={`tel:${PRIMARY_LOCATION.phoneE164}`} data-track-location="brand-hero">
                <PhoneGlyph /> {PRIMARY_LOCATION.phone}
              </a>
            </Button>
          </div>

          {H_PROMISE && (
            <p className="mt-4 text-small text-ink-2">
              H Promise (Hyundai certified used cars):{" "}
              <a
                href={`tel:${H_PROMISE.phoneE164}`}
                data-track-location="brand-hero-hpromise"
                className="inline-flex min-h-11 items-center font-semibold text-ink underline-offset-4 hover:underline"
              >
                {H_PROMISE.phone}
              </a>
            </p>
          )}
        </div>
      </section>

      <FeaturedInventory
        // Each card is handed only the photos it can show.
        vehicles={brandVehicles.map((v) => toCardVehicle(v))}
        title={`${count} used ${brandName} ${cars} in stock today`}
        subtitle={`At AM Group, Jammu`}
        emptyMessage={`We have no ${brandName} cars in stock at the moment.`}
        className="bg-ground py-12 md:py-16"
        sourceLabel="brand-grid"
        listId={`brand-${brand.slug}`}
        listName={`Used ${brandName} cars`}
      />

      <MoreCars
        shown={brandVehicles}
        stock={stock}
        listId={`more-brand-${brand.slug}`}
        title="Used cars from other makes"
      />

      <section className="border-t border-line bg-ground-2 py-16">
        <div className="container mx-auto max-w-4xl space-y-9 px-4 md:px-8">
          <article>
            <h2 className="mb-3 font-display text-h2 text-ink">
              What to check on a used {brandName}
            </h2>
            <p className="text-body text-ink-2">
              Ask for the service book and confirm the scheduled services were done. Check tyre wear on
              all four corners, test every electrical item, and drive the car up an incline to hear the
              engine under load. You are welcome to bring your own mechanic to look at any {brandName}{" "}
              on this page.
            </p>
          </article>

          <article>
            <h2 className="mb-3 font-display text-h2 text-ink">Paperwork, finance and exchange</h2>
            <p className="text-body text-ink-2">
              We handle the RC transfer and insurance transfer, and can help arrange finance. If you
              want to exchange your present car, bring it with its RC and
              insurance and we will value it — or start on the{" "}
              <Link
                href="/sell-your-car"
                className="font-semibold text-ink underline underline-offset-4 transition-colors duration-(--duration-1) hover:text-accent-text-light"
              >
                sell your car
              </Link>{" "}
              page. Addresses and hours are on the{" "}
              <Link
                href="/locations"
                className="font-semibold text-ink underline underline-offset-4 transition-colors duration-(--duration-1) hover:text-accent-text-light"
              >
                locations
              </Link>{" "}
              page.
            </p>
          </article>
        </div>
      </section>

      <RelatedLinks
        title={`More used cars like these`}
        groups={[
          { title: `${brandName} models`, links: modelLinks },
          { title: "Other makes", links: seoLinks.makes.filter((l) => l.href !== path) },
          { title: "By budget", links: seoLinks.budgets },
        ]}
      />

      <FaqSection items={brandFaqs} title={`Used ${brandName} in Jammu — FAQs`} />

      <FrequentSearches searches={frequentSearches} />
    </div>
  )
}

/**
 * A make with no car in stock today that the dealer has sold before.
 *
 * It says exactly that, and offers the one useful thing: a call when one
 * arrives. It promises nothing about sourcing a car or how long that takes.
 * Other makes in stock are linked so the reader is not left at a dead end.
 */
async function SoldOutBrand({ brandName, path }: { brandName: string; path: string }) {
  const [frequentSearches, seoLinks] = await Promise.all([getFrequentSearches(30), getSeoLinks()])

  return (
    <div className="min-h-screen bg-ground">
      <Breadcrumbs items={[{ label: "Used cars by make", href: "/brands" }, { label: `Used ${brandName} Cars` }]} />

      <section className="border-b border-line bg-ground-2">
        <div className="container mx-auto px-4 py-10 md:px-8 md:py-14">
          <h1 className="mb-5 max-w-4xl font-display text-h1 text-ink">Used {brandName} Cars in Jammu</h1>

          <div className="max-w-3xl space-y-3">
            <p className="text-body text-ink-2">
              We have no used {brandName} car in stock in Jammu today. The last one we listed has been
              sold.
            </p>
            <p className="text-body text-ink-2">
              Tell us you are looking for a {brandName} and we will call you when one arrives. You can
              also ring {linkPhones(PRIMARY_LOCATION.phone, "inline-text")} and ask what is due in.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {/* The enquiry records the page it came from, which names the make. */}
            <EnquireCta label="Call me when one arrives" intent="Vehicle Enquiry" sourceLabel="brand-sold-out" />
            <Button asChild variant="secondary" size="lg">
              <a href={`tel:${PRIMARY_LOCATION.phoneE164}`} data-track-location="brand-hero">
                <PhoneGlyph /> {PRIMARY_LOCATION.phone}
              </a>
            </Button>
          </div>
        </div>
      </section>

      <RelatedLinks
        title="Used cars in stock today"
        groups={[
          { title: "Makes in stock", links: seoLinks.makes.filter((l) => l.href !== path) },
          { title: "By budget", links: seoLinks.budgets },
          { title: "By body type", links: seoLinks.bodyTypes },
        ]}
      />

      <FrequentSearches searches={frequentSearches} />
    </div>
  )
}
