import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { H_PROMISE, PRIMARY_LOCATION } from "@/lib/locations"
import { FeaturedInventory } from "@/components/sections/inventory"
import { Button } from "@/components/ui/button"
import { PhoneGlyph } from "@/components/system/marks"
import { EnquireCta } from "@/components/system/enquire-cta"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { FaqSection } from "@/components/seo/faq-section"
import { FrequentSearches } from "@/components/seo/frequent-searches"
import { RelatedLinks } from "@/components/seo/related-links"
import { getFrequentSearches, getSeoLinks, type SeoLinkGroup } from "@/lib/seo/links"
import { getAllLandingSlugs, resolveLanding, type LandingKind } from "@/lib/seo/landing"
import { generateVehicleListSchema } from "@/lib/seo-schemas"
import { pageSocial } from "@/lib/seo/site"

/**
 * One route serving every "used cars …" landing page: the Jammu city page,
 * budget bands, models, body styles, fuel and transmission.
 *
 * These exist because a filtered listing URL answers the query but never names
 * it — `/inventory?priceMin=0&priceMax=1000000` returns the right 16 cars under
 * a title that says "16 Used Cars for Sale in Jammu". Here the keyword is in the
 * URL, the title, the H1 and the copy.
 */

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return (await getAllLandingSlugs()).map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const landing = await resolveLanding(slug)

  if (!landing) return { title: "Page Not Found", robots: "noindex" }

  const path = `/used-cars/${landing.slug}`

  return {
    title: landing.title,
    description: landing.description,
    alternates: { canonical: path },
    // A page with no cars on it is thin. It stays reachable (links are still
    // followed) but is kept out of the index until stock returns.
    ...(landing.vehicles.length === 0 ? { robots: { index: false, follow: true } } : {}),
    ...pageSocial({ title: landing.title, description: landing.description, path }),
  }
}

/**
 * Which sibling groups a page links to. A page never lists its own kind first:
 * a budget page sends the reader on to body styles and makes, a body page to
 * budgets and makes, and so on.
 */
const SIBLING_ORDER: Record<LandingKind, string[]> = {
  city: ["budget", "body", "make", "model"],
  budget: ["body", "make", "model", "budget"],
  body: ["budget", "make", "model", "body"],
  model: ["make", "budget", "body", "model"],
  fuel: ["budget", "body", "make", "fuel"],
  transmission: ["budget", "body", "make", "transmission"],
}

export default async function UsedCarsLandingPage({ params }: Props) {
  const { slug } = await params
  const landing = await resolveLanding(slug)

  // An unknown slug, or a facet with no stock behind it, is a 404 rather than
  // an empty grid.
  if (!landing) notFound()

  const [frequentSearches, seoLinks] = await Promise.all([getFrequentSearches(30), getSeoLinks()])

  const path = `/used-cars/${landing.slug}`
  const count = landing.vehicles.length

  const pool: Record<string, SeoLinkGroup> = {
    budget: { title: "By budget", links: seoLinks.budgets },
    body: { title: "By body type", links: seoLinks.bodyTypes },
    make: { title: "By make", links: seoLinks.makes },
    model: { title: "By model", links: seoLinks.models.slice(0, 8) },
    fuel: { title: "By fuel", links: seoLinks.fuels },
    transmission: { title: "By transmission", links: seoLinks.transmissions },
  }
  const siblings = SIBLING_ORDER[landing.kind]
    .slice(0, 3)
    .map((key) => ({
      title: pool[key].title,
      // Never link a page to itself.
      links: pool[key].links.filter((l) => l.href !== path),
    }))

  const jsonLd = generateVehicleListSchema({
    name: landing.heading,
    description: landing.description,
    path,
    vehicles: landing.vehicles,
  })

  return (
    <div className="min-h-screen bg-ground">
      {count > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <Breadcrumbs
        items={[
          { label: "Used Cars in Jammu", href: "/inventory" },
          { label: landing.crumb },
        ]}
      />

      {/* The H1 carries the exact phrase the page targets, and the first
          screen carries a way to enquire. */}
      <section className="border-b border-line bg-ground-2">
        <div className="container mx-auto px-4 py-10 md:px-8 md:py-14">
          <h1 className="mb-5 max-w-4xl font-display text-h1 text-ink">{landing.heading}</h1>

          <div className="max-w-3xl space-y-3">
            {landing.intro.map((p, i) => (
              <p key={i} className="text-body text-ink-2">
                {p}
              </p>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <EnquireCta label="Enquire now" sourceLabel="landing-hero" />
            <Button asChild variant="secondary" size="lg">
              <a href={`tel:${PRIMARY_LOCATION.phoneE164}`} data-track-location="landing-hero">
                <PhoneGlyph /> {PRIMARY_LOCATION.phone}
              </a>
            </Button>
          </div>

          {H_PROMISE && (
            <p className="mt-4 text-small text-ink-2">
              H Promise (Hyundai certified used cars):{" "}
              <a
                href={`tel:${H_PROMISE.phoneE164}`}
                data-track-location="landing-hero-hpromise"
                className="inline-flex min-h-11 items-center font-semibold text-ink underline-offset-4 hover:underline"
              >
                {H_PROMISE.phone}
              </a>
            </p>
          )}
        </div>
      </section>

      <FeaturedInventory
        vehicles={landing.vehicles}
        title={landing.crumb}
        subtitle={`${count} ${count === 1 ? "car" : "cars"} in stock at AM Group, ${landing.cityName}`}
        emptyMessage={`Our stock list is being updated. Please call ${PRIMARY_LOCATION.phone}.`}
      />

      {/* Long-form copy */}
      <section className="border-t border-line bg-ground-2 py-16">
        <div className="container mx-auto max-w-4xl space-y-9 px-4 md:px-8">
          {landing.sections.map((block) => (
            <article key={block.heading}>
              <h2 className="mb-3 font-display text-h2 text-ink">{block.heading}</h2>
              <p className="text-body text-ink-2">{block.body}</p>
            </article>
          ))}

          <p className={`text-body text-ink-2 ${landing.sections.length ? "border-t border-line pt-6" : ""}`}>
            Browse{" "}
            <Link
              href="/inventory"
              className="font-semibold text-ink underline underline-offset-4 transition-colors duration-(--duration-1) hover:text-accent-text-light"
            >
              all used cars in Jammu
            </Link>
            ,{" "}
            <Link
              href="/sell-your-car"
              className="font-semibold text-ink underline underline-offset-4 transition-colors duration-(--duration-1) hover:text-accent-text-light"
            >
              sell or exchange your car
            </Link>
            , see{" "}
            <Link
              href="/locations"
              className="font-semibold text-ink underline underline-offset-4 transition-colors duration-(--duration-1) hover:text-accent-text-light"
            >
              where to find us
            </Link>
            , or call{" "}
            <a
              href={`tel:${PRIMARY_LOCATION.phoneE164}`}
              data-track-location="landing-cta"
              className="font-semibold text-ink transition-colors duration-(--duration-1) hover:text-accent-text-light"
            >
              {PRIMARY_LOCATION.phone}
            </a>{" "}
            and we will tell you what has just come in.
          </p>
        </div>
      </section>

      <RelatedLinks groups={siblings} />

      <FaqSection items={landing.faqs} title={`${landing.crumb} — FAQs`} />

      <FrequentSearches searches={frequentSearches} />
    </div>
  )
}
