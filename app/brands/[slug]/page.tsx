import { Metadata } from "next"
import { notFound } from "next/navigation"
import { FeaturedInventory } from "@/components/sections/inventory"
import { getInventory } from "@/lib/inventory/server"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { FaqSection } from "@/components/seo/faq-section"
import { FrequentSearches } from "@/components/seo/frequent-searches"
import { getFrequentSearches, getSeoLinks } from "@/lib/seo/links"
import { ShieldCheck, Wrench, Award, CreditCard } from "lucide-react"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const { facets } = await getInventory()
  return facets.makes.map((m) => ({ slug: m.value.toLowerCase().replace(/\s+/g, "-") }))
}

/** Resolve a URL slug back to the make string as it appears in stock. */
async function resolveBrand(slug: string) {
  const { vehicles, facets } = await getInventory()
  const norm = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
  const match = facets.makes.find((m) => norm(m.value) === norm(slug))
  if (!match) return null
  return {
    brandName: match.label,
    count: match.count,
    vehicles: vehicles.filter((v) => v.make && norm(v.make) === norm(match.value)),
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const brand = await resolveBrand(slug)

  if (!brand) return { title: "Brand Not Found", robots: "noindex" }

  const models = [...new Set(brand.vehicles.map((v) => v.model).filter(Boolean))].join(", ")

  return {
    title: `Used ${brand.brandName} Cars in Jammu | ${brand.count} in Stock`,
    description: `${brand.count} certified pre-owned ${brand.brandName} cars for sale in Jammu at AM Group` + (models ? ` — ${models}.` : ".") + ` Real photos, verified KMs and easy finance.`,
    alternates: { canonical: `/brands/${slug}` },
  }
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params
  const brand = await resolveBrand(slug)

  if (!brand) notFound()

  const { brandName, vehicles: brandVehicles } = brand
  const [frequentSearches] = await Promise.all([getFrequentSearches(30)])

  const models = [...new Set(brandVehicles.map((v) => v.model).filter(Boolean))] as string[]
  const years = brandVehicles.map((v) => v.year).filter((y): y is number => y !== null)
  const prices = brandVehicles.map((v) => v.price).filter((n): n is number => n !== null)

  const brandFaqs = [
    {
      question: `How many used ${brandName} cars are available in Jammu?`,
      answer:
        `AM Group currently has ${brand.count} certified pre-owned ${brandName} ` +
        `${brand.count === 1 ? "car" : "cars"} in stock` +
        `${models.length ? `, covering the ${models.join(", ")}` : ""}. This page reflects live stock.`,
    },
    ...(prices.length
      ? [{
          question: `What is the price of a used ${brandName} in Jammu?`,
          answer:
            `Our ${brandName} stock currently ranges from ₹${Math.min(...prices).toLocaleString("en-IN")} to ` +
            `₹${Math.max(...prices).toLocaleString("en-IN")}, depending on year, variant and kilometres driven.`,
        }]
      : []),
    ...(years.length
      ? [{
          question: `Which ${brandName} model years do you stock?`,
          answer: `Model years currently range from ${Math.min(...years)} to ${Math.max(...years)}.`,
        }]
      : []),
    {
      question: `Do you offer finance and exchange on used ${brandName} cars?`,
      answer:
        "Yes. We arrange finance through leading nationalised and private banks, value your existing car for " +
        "part-exchange at the showroom, and handle the RC and insurance transfer in-house.",
    },
    {
      question: `Can I test drive a used ${brandName} before buying?`,
      answer:
        `Yes — test drives are arranged at our Jammu and Srinagar locations at no charge. ` +
        `Call +91 94191 00000 or submit an enquiry on any ${brandName} listing to book one.`,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] pt-16 md:pt-20">
      
      {/* Clean Light Header */}
      <div className="bg-[#f8f9fa] pt-2 pb-6 border-b border-black/5">
        <div className="container mx-auto px-4 md:px-8">
          <Breadcrumbs
            items={[
              { label: "Used Cars in Jammu", href: "/inventory" },
              { label: `Used ${brandName} Cars` },
            ]}
          />

          <div className="text-center max-w-3xl mx-auto mt-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#023468]/10 text-[#023468] text-[11px] font-black uppercase tracking-wider mb-2.5">
              <Award className="h-3.5 w-3.5" />
              <span>Certified Pre-Owned Brand Stock</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black text-[#023468] tracking-tight">
              Used <span className="text-[#E31837]">{brandName}</span> Cars in Jammu
            </h1>

            <p className="text-xs md:text-sm text-black/60 font-medium leading-relaxed mt-2">
              Explore {brand.count} certified pre-owned {brandName} {brand.count === 1 ? "car" : "cars"} available in stock at AM Group Jammu.
              Every vehicle features real photographs, multi-point inspection, and verified odometer readings.
            </p>
          </div>
        </div>
      </div>

      {/* Brand Specific Vehicle Grid */}
      <FeaturedInventory
        vehicles={brandVehicles}
        title={`Available ${brandName} Stock (${brand.count})`}
        subtitle={`Handpicked certified ${brandName} cars available for immediate delivery in Jammu.`}
        emptyMessage={`We have no ${brandName} listings in stock at the moment.`}
        className="py-8 md:py-12 bg-[#FAFAFA] relative overflow-hidden"
      />

      {/* Redesigned Centered Brand Info Section */}
      <section className="py-20 bg-white border-t border-black/5">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl text-center">
          
          <div className="max-w-2xl mx-auto mb-14">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#023468] bg-[#023468]/5 px-4 py-1.5 rounded-full">
              Why AM Group
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-[#023468] tracking-tight mt-4">
              Buying a Used {brandName} in Jammu
            </h2>
            <p className="text-sm text-black/55 font-medium mt-2">
              AM Group has been Jammu &amp; Kashmir&apos;s trusted automotive group since 1968.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
            
            {/* Card 1 */}
            <div className="bg-[#f8f9fa] rounded-3xl p-8 border border-black/5 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-2xl bg-[#023468] text-white flex items-center justify-center mb-5 shadow-sm">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-[#023468] mb-3">
                Authorized {brandName} Dealer Experience
              </h3>
              <p className="text-xs md:text-sm text-black/60 leading-relaxed font-normal">
                AM Group is proud to be a premier authorized dealership network in Jammu &amp; Kashmir.
                We offer a comprehensive range of pre-owned {brandName} vehicles, from popular compacts to premium SUVs.
                Our state-of-the-art Jammu facility provides a world-class car buying experience.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#f8f9fa] rounded-3xl p-8 border border-black/5 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-2xl bg-[#023468] text-white flex items-center justify-center mb-5 shadow-sm">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-[#023468] mb-3">
                Latest {brandName} Models &amp; Transparent Prices
              </h3>
              <p className="text-xs md:text-sm text-black/60 leading-relaxed font-normal">
                Looking for transparent pricing in Jammu? Contact our sales team for exact on-road price breakdowns,
                low-EMI finance options, instant loan approvals, and seamless RC transfer for all {brandName} models.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#f8f9fa] rounded-3xl p-8 border border-black/5 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-2xl bg-[#023468] text-white flex items-center justify-center mb-5 shadow-sm">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-[#023468] mb-3">
                Certified Quality &amp; Verified Documentation
              </h3>
              <p className="text-xs md:text-sm text-black/60 leading-relaxed font-normal">
                {brandName} vehicles hold their value exceptionally well in J&amp;K.
                Every {brandName} listed here undergoes a rigorous 140+ point structural and mechanical evaluation.
                All odometers are intake-verified, and every vehicle comes with verified documentation.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-[#f8f9fa] rounded-3xl p-8 border border-black/5 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-2xl bg-[#023468] text-white flex items-center justify-center mb-5 shadow-sm">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-[#023468] mb-3">
                Workshop Servicing &amp; Genuine OEM Parts
              </h3>
              <p className="text-xs md:text-sm text-black/60 leading-relaxed font-normal">
                AM Group operates master workshops across Jammu and Srinagar.
                Your pre-owned {brandName} can be serviced directly at our official service centers with 100% genuine OEM parts,
                factory-trained technicians, and transparent maintenance packages.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* FAQs */}
      <FaqSection
        items={brandFaqs}
        title={`Used ${brandName} in Jammu — FAQs`}
      />

      {/* Crawlable Frequent Searches */}
      <FrequentSearches searches={frequentSearches} />

    </div>
  )
}
