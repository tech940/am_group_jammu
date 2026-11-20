import { linkPhones } from "@/components/system/phone-text"
import type { Metadata } from "next"
import Link from "@/components/system/intent-link"
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
import { toCardVehicle } from "@/lib/inventory/filter"
import { getFrequentSearches, getSeoLinks, type SeoLinkGroup } from "@/lib/seo/links"
import { getResolvableLandingSlugs, resolveLanding, type LandingKind } from "@/lib/seo/landing"
import { generateVehicleListSchema, jsonLdString } from "@/lib/seo-schemas"
import { pageSocial, shareImageFrom } from "@/lib/seo/site"

/**
 * One route serving every "used cars …" landing page: the Jammu city page,
 * budget bands, models, body styles, fuel and transmission.
 *
 * These exist because a filtered listing URL answers the query but never names
 * it — `/inventory?priceMin=0&priceMax=1000000` returns the right 16 cars under
 * a title that does not say "under ₹10 lakh". Here the keyword is in the URL,
 * the title, the H1 and the copy.
 *
 * /used-cars/jammu is THE "used cars in Jammu" page of the site. The homepage
 * is the dealer's page and /inventory is the stock browser; neither is titled
 * for that search, so the three no longer compete.
 *
 * A model page outlives its last car: lib/seo/landing.ts returns a `soldOut`
 * landing for a model the dealer has sold, and this route then says so plainly
 * and offers to call the reader when one arrives.
 */

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return (await getResolvableLandingSlugs()).map((slug) => ({ slug }))
}

const HEAD_PAGE = "/used-cars/jammu"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const landing = await resolveLanding(slug)

  if (!landing) return { title: "Page Not Found", robots: "noindex" }

  const path = `/used-cars/${landing.slug}`
  // Where these cars are indexed. Usually this page; when another page shows
  // exactly the same cars, that page (see Landing.canonicalPath).
  const canonical = landing.canonicalPath

  return {
    title: landing.title,
    description: landing.description,
    alternates: { canonical },
    // Kept out of the index when the page is thin (no cars, or one car under a
    // vague name). A page that points its canonical elsewhere gets no robots
    // tag: "index that page instead" and "do not index" are different
    // instructions, and sending both makes search engines ignore the first.
    ...(!landing.indexable && canonical === path ? { robots: { index: false, follow: true } } : {}),
    ...pageSocial({
      title: landing.title,
      description: landing.description,
      path: canonical,
      image: shareImageFrom(landing.vehicles),
    }),
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

const TEXT_LINK =
  "font-semibold text-ink underline underline-offset-4 transition-colors duration-(--duration-1) hover:text-accent-text-light"

export default async function UsedCarsLandingPage({ params }: Props) {
  const { slug } = await params
  const landing = await resolveLanding(slug)

  // An unknown slug, or a facet with no stock behind it, is a 404 rather than
  // an empty grid.
  if (!landing) notFound()

  const [frequentSearches, seoLinks] = await Promise.all([getFrequentSearches(30), getSeoLinks()])

  const path = `/used-cars/${landing.slug}`
  const count = landing.vehicles.length
  const isHead = path === HEAD_PAGE

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

  // List markup only on the page that is indexed for these cars.
  const jsonLd =
    count > 0 && landing.canonicalPath === path
      ? generateVehicleListSchema({
          name: landing.heading,
          description: landing.description,
          path,
          vehicles: landing.vehicles,
        })
      : null

  // What the grid shows: this page's cars, or, on a sold-out model page, the
  // same make's cars that are in stock. Each card gets only the photos it shows.
  const gridVehicles = (landing.soldOut ? landing.related : landing.vehicles).map((v) => toCardVehicle(v))

  return (
    <div className="min-h-screen bg-ground">
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
      )}

      {/* "Used Cars in Jammu" is the name of one page, /used-cars/jammu, and
          every trail that uses those words points there. On that page itself
          the trail is just Home and the page. */}
      <Breadcrumbs
        items={
          isHead
            ? [{ label: landing.crumb }]
            : [{ label: "Used Cars in Jammu", href: HEAD_PAGE }, { label: landing.crumb }]
        }
      />

      {/* The H1 carries the exact phrase the page targets, and the first
          screen carries a way to enquire. */}
      <section className="border-b border-line bg-ground-2">
        <div className="container mx-auto px-4 py-10 md:px-8 md:py-14">
          <h1 className="mb-5 max-w-4xl font-display text-h1 text-ink">{landing.heading}</h1>

          <div className="max-w-3xl space-y-3">
            {landing.intro.map((p, i) => (
              <p key={i} className="text-body text-ink-2">
                {linkPhones(p, "landing-text")}
              </p>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {landing.soldOut ? (
              // The enquiry records the page it came from, which names the model.
              <EnquireCta
                label="Call me when one arrives"
                intent="Vehicle Enquiry"
                sourceLabel="landing-sold-out"
              />
            ) : (
              <EnquireCta label="Enquire now" sourceLabel="landing-hero" />
            )}
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

      {/* A sold-out model page with nothing of the same make in stock shows no
          grid at all rather than an unrelated one. */}
      {(!landing.soldOut || gridVehicles.length > 0) && (
        <FeaturedInventory
          vehicles={gridVehicles}
          title={landing.stockHeading}
          subtitle={
            landing.soldOut
              ? `In stock at AM Group, ${landing.cityName}`
              : `${count} ${count === 1 ? "car" : "cars"} in stock at AM Group, ${landing.cityName}`
          }
          emptyMessage={`Our stock list is being updated. Please call ${PRIMARY_LOCATION.phone}.`}
          sourceLabel="landing-grid"
          listId={`landing-${landing.slug}`}
          listName={landing.crumb}
        />
      )}

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
            {!isHead && (
              <>
                See all{" "}
                <Link href={HEAD_PAGE} className={TEXT_LINK}>
                  used cars in Jammu
                </Link>
                ,{" "}
              </>
            )}
            {isHead ? "Search and filter " : "search and filter "}
            <Link href="/inventory" className={TEXT_LINK}>
              all used cars in stock
            </Link>
            ,{" "}
            <Link href="/sell-your-car" className={TEXT_LINK}>
              sell or exchange your car
            </Link>
            , see{" "}
            <Link href="/locations" className={TEXT_LINK}>
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
            to ask what is in stock today.
          </p>
        </div>
      </section>

      <RelatedLinks groups={siblings} />

      <FaqSection items={landing.faqs} title={`${landing.crumb} — FAQs`} />

      <FrequentSearches searches={frequentSearches} />
    </div>
  )
}
