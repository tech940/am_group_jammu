import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MapPin, Phone, ShieldCheck, Star } from "lucide-react"
import { FeaturedInventory } from "@/components/sections/inventory"
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
    <div className="min-h-screen bg-white">
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
      <section className="border-b border-black/5 bg-gradient-to-b from-zinc-50 to-white">
        <div className="container mx-auto px-4 md:px-8 py-10 md:py-14">
          <span className="flex items-center text-[#E31837] text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            <MapPin className="h-4 w-4 mr-2" /> {landing.cityName}
          </span>

          <h1 className="text-3xl md:text-5xl font-black text-[#023468] tracking-tight mb-5 max-w-4xl">
            {landing.heading}
          </h1>

          <div className="max-w-3xl space-y-3">
            {landing.intro.map((p, i) => (
              <p key={i} className="text-sm md:text-[15px] text-black/60 leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mt-7">
            <div className="flex items-center gap-2.5 rounded-full border border-black/10 bg-white px-4 py-2">
              <ShieldCheck className="h-4 w-4 text-[#023468]" />
              <span className="text-[11px] font-black uppercase tracking-wider text-black/70">
                Inspected &amp; verified
              </span>
            </div>
            <div className="flex items-center gap-2.5 rounded-full border border-black/10 bg-white px-4 py-2">
              <Star className="h-4 w-4 text-[#023468]" />
              <span className="text-[11px] font-black uppercase tracking-wider text-black/70">
                Since 1968
              </span>
            </div>
            <a
              href="tel:+919419100000"
              className="flex items-center gap-2.5 rounded-full bg-[#023468] px-5 py-2 text-white hover:bg-[#01254a] transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span className="text-[11px] font-black uppercase tracking-wider">+91 94191 00000</span>
            </a>
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
      <section className="py-16 bg-white border-t border-black/5">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl space-y-9">
          {landing.sections.map((block) => (
            <article key={block.heading}>
              <h2 className="text-xl md:text-2xl font-black text-[#023468] mb-3">{block.heading}</h2>
              <p className="text-sm md:text-[15px] text-black/60 leading-relaxed">{block.body}</p>
            </article>
          ))}

          <p className="text-sm text-black/50 leading-relaxed border-t border-black/5 pt-6">
            Browse the{" "}
            <Link href="/inventory" className="font-bold text-[#023468] hover:text-[#E31837] underline">
              full used car inventory in Jammu
            </Link>
            , or call us on{" "}
            <a href="tel:+919419100000" className="font-bold text-[#023468] hover:text-[#E31837]">
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
