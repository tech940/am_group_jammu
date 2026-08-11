import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { FeaturedInventory } from "@/components/sections/inventory"
import { Button } from "@/components/ui/button"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { FaqSection } from "@/components/seo/faq-section"
import { FrequentSearches } from "@/components/seo/frequent-searches"
import { getFrequentSearches } from "@/lib/seo/links"
import { getAllLandingSlugs, resolveLanding } from "@/lib/seo/landing"

/**
 * One route serving every "used cars …" landing page: cities, budget bands,
 * models, body styles, fuel and transmission.
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

  return {
    title: landing.title,
    description: landing.description,
    alternates: { canonical: `/used-cars/${landing.slug}` },
  }
}

export default async function UsedCarsLandingPage({ params }: Props) {
  const { slug } = await params
  const landing = await resolveLanding(slug)

  // A slug with no stock behind it would be a thin page, so it 404s rather
  // than rendering an empty grid.
  if (!landing) notFound()

  const frequentSearches = await getFrequentSearches(30)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: landing.heading,
    description: landing.description,
    url: `https://amgroupind.com/used-cars/${landing.slug}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: landing.vehicles.length,
      itemListElement: landing.vehicles.slice(0, 20).map((v, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://amgroupind.com/inventory/${v.slug}`,
        name: `${v.year ?? ""} ${v.title}`.trim(),
      })),
    },
  }

  return (
    <div className="min-h-screen bg-ground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumbs
        items={[
          { label: "Used Cars in Jammu", href: "/inventory" },
          { label: landing.crumb },
        ]}
      />

      {/* Hero: H1 carries the exact phrase the page targets */}
      <section className="border-b border-line bg-ground-2">
        <div className="container mx-auto px-4 md:px-8 py-10 md:py-14">
          <span className="block text-meta uppercase text-accent-text-light mb-4">
            {landing.cityName}
          </span>

          <h1 className="font-display text-h1 text-ink mb-5 max-w-4xl">
            {landing.heading}
          </h1>

          <div className="max-w-3xl space-y-3">
            {landing.intro.map((p, i) => (
              <p key={i} className="text-body text-ink-2">
                {p}
              </p>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-7">
            <span className="inline-flex items-center rounded-sm border border-line bg-surface px-3 py-1.5 text-meta uppercase text-ink-2">
              Inspected &amp; verified
            </span>
            <span className="inline-flex items-center rounded-sm border border-line bg-surface px-3 py-1.5 text-meta uppercase text-ink-2">
              Since 1968
            </span>
            <Button asChild variant="primary">
              <a href="tel:+919419100000">+91 94191 00000</a>
            </Button>
          </div>
        </div>
      </section>

      <FeaturedInventory
        vehicles={landing.vehicles}
        title={landing.crumb}
        subtitle={`${landing.vehicles.length} ${landing.vehicles.length === 1 ? "car" : "cars"} in stock at AM Group ${landing.cityName}`}
        emptyMessage="Our live inventory is temporarily unavailable. Please call +91 94191 00000."
      />

      {/* Long-form copy */}
      <section className="py-16 bg-ground-2 border-t border-line">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl space-y-9">
          {landing.sections.map((block) => (
            <article key={block.heading}>
              <h2 className="font-display text-h2 text-ink mb-3">{block.heading}</h2>
              <p className="text-body text-ink-2">{block.body}</p>
            </article>
          ))}

          <p className="text-body text-ink-2 border-t border-line pt-6">
            Browse the{" "}
            <Link
              href="/inventory"
              className="font-semibold text-ink underline underline-offset-4 transition-colors duration-(--duration-1) hover:text-accent-text-light"
            >
              full used car inventory in Jammu
            </Link>
            , or call us on{" "}
            <a
              href="tel:+919419100000"
              className="font-semibold text-ink transition-colors duration-(--duration-1) hover:text-accent-text-light"
            >
              +91 94191 00000
            </a>{" "}
            and we will tell you what has just arrived.
          </p>
        </div>
      </section>

      <FaqSection items={landing.faqs} title={`${landing.crumb} — FAQs`} />

      <FrequentSearches searches={frequentSearches} />
    </div>
  )
}
