import type { Metadata } from "next"
import Link from "next/link"
import { Band } from "@/components/system/page-kit"
import { Button } from "@/components/ui/button"
import { ClosingCall } from "@/components/system/closing-call"
import { EnquireCta } from "@/components/system/enquire-cta"
import { ArrowGlyph } from "@/components/system/marks"
import { IlloPapers, IlloSell, IlloShowroom } from "@/components/system/illustrations"
import { FaqSection, type FaqItem } from "@/components/seo/faq-section"
import { PhotoHero } from "@/components/homepage/photo-hero"
import { SectionHead, TIGHT_BAND } from "@/components/homepage/section-head"
import { Visit } from "@/components/homepage/visit"
import { LOCATIONS, PRIMARY_LOCATION, formatHours, whatsappUrl } from "@/lib/locations"
import { SITE_URL } from "@/lib/seo/site"

/**
 * Sell your car — the second of the two things this site is for.
 *
 * WHAT THIS PAGE DOES NOT SAY. It names no price, no "best price", no payment
 * time and no doorstep pickup. None of those is established anywhere in the
 * project, and a promise the forecourt cannot keep costs more than the lead it
 * wins. What IS established — in lib/locations.ts and content.ts — is that
 * each site sells or exchanges cars, values a car while the owner waits, and
 * handles payment, RC transfer and insurance transfer in-house. The page says
 * exactly that and nothing wider.
 *
 * Server-rendered throughout; the only client code is the enquiry button.
 */

const SITE = SITE_URL
const SITE_NAMES = LOCATIONS.map((l) => l.shortName)
const HOURS = formatHours(PRIMARY_LOCATION)

const TITLE = "Sell Your Car in Jammu | Free Valuation | AM Group"
const DESCRIPTION =
  `Sell or exchange your car at AM Group in Jammu. Free valuation while you wait at ${SITE_NAMES.length} sites ` +
  `(${SITE_NAMES.join(", ")}). Payment and RC transfer handled in-house. Call ${PRIMARY_LOCATION.phone}.`
const OG_IMAGE = "/inventory_hero_bg.png"

export function generateMetadata(): Metadata {
  return {
    // `absolute`, because the root layout's template would otherwise append a
    // second "| AM Group Jammu" to a title that already names the dealer.
    title: { absolute: TITLE },
    description: DESCRIPTION,
    alternates: { canonical: "/sell-your-car" },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: "/sell-your-car",
      siteName: "AM Group Used Cars",
      title: TITLE,
      description: DESCRIPTION,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "AM Group Used Cars, Jammu" }],
    },
    twitter: {
      card: "summary_large_image",
      title: TITLE,
      description: DESCRIPTION,
      images: [OG_IMAGE],
    },
  }
}

const STEPS = [
  {
    Illo: IlloShowroom,
    title: "Bring the car",
    body: `Come to any of our ${SITE_NAMES.length} sites in Jammu during opening hours (${HOURS}). Bring the registration certificate and the insurance. Calling first means someone is ready for you.`,
  },
  {
    Illo: IlloSell,
    title: "Inspection and offer",
    body: "We look the car over while you wait and tell you what we would pay for it. The valuation is free, and whether you sell is up to you.",
  },
  {
    Illo: IlloPapers,
    title: "Payment and RC transfer",
    body: "If you accept, payment and the RC transfer are handled in-house. You can also put the value towards a car from our stock instead.",
  },
]

const FAQS: FaqItem[] = [
  {
    question: "What does a valuation cost?",
    answer: `Nothing. We value your car free of charge at any of our ${SITE_NAMES.length} sites in Jammu: ${SITE_NAMES.join(", ")}.`,
  },
  {
    question: "Do I need an appointment?",
    answer: `No. You can walk in during opening hours (${HOURS}). We still suggest calling ${PRIMARY_LOCATION.phone} first, so we can tell you which site to come to and give you directions.`,
  },
  {
    question: "What should I bring?",
    answer:
      "The car, its registration certificate and its insurance. Service records help if you have them.",
  },
  {
    question: "Can I exchange my car for one of yours?",
    answer:
      "Yes. We value your car and you can put that amount towards any used car in our stock. Finance for the balance can be arranged at the dealership.",
  },
  {
    question: "Can you give me a price over the phone?",
    answer:
      "Not a firm one. An honest figure depends on seeing the car, so the offer is made after the inspection. You are welcome to call or WhatsApp first with the make, model, year and kilometres.",
  },
]

export default function SellYourCarPage() {
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Sell your car", item: `${SITE}/sell-your-car` },
    ],
  }

  return (
    <>
      {/* Structured data only. The visible trail comes from the layout's
          path-derived breadcrumbs, which emit no BreadcrumbList of their own. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c") }}
      />

      <PhotoHero labelledBy="sell-title">
        <h1 id="sell-title" className="font-display text-display uppercase text-on-deep">
          Sell your car in Jammu
        </h1>
        <p className="mt-4 text-body text-on-deep-2 md:text-body-lg">
          Bring it to one of our {SITE_NAMES.length} sites. We inspect it while you wait and
          make you an offer. The valuation is free.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <EnquireCta
            label="Get a free valuation"
            intent="Sell Your Car"
            sourceLabel="sell-hero"
            variant="bright"
          />
          <Button asChild variant="onDeep" size="lg">
            <a href={`tel:${PRIMARY_LOCATION.phoneE164}`} data-track-location="sell-hero">
              Call {PRIMARY_LOCATION.phone}
            </a>
          </Button>
        </div>
      </PhotoHero>

      <Band ground="ground" labelledBy="valuation-title" id="valuation" className={TIGHT_BAND}>
        <SectionHead
          id="valuation-title"
          title="How selling works"
          lede="Three steps, all at the dealership. We do not quote a price before we have seen the car."
        />

        <ol className="mt-7 grid grid-cols-1 gap-3 md:mt-10 md:grid-cols-3 md:gap-5">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="rounded-md border border-line bg-surface p-5 shadow-raised md:p-7"
            >
              <step.Illo className="h-28 w-auto md:h-40" />
              <h3 className="mt-4 flex items-baseline gap-2.5 font-display text-h2 uppercase text-ink">
                <span className="text-accent" data-num>
                  {i + 1}
                </span>
                {step.title}
              </h3>
              <p className="mt-2 text-body text-ink-2">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-wrap items-center gap-3 md:mt-8">
          <EnquireCta
            label="Ask for a valuation"
            intent="Sell Your Car"
            sourceLabel="sell-steps"
          />
          <Button asChild variant="secondary" size="lg">
            <a
              href={whatsappUrl(
                "Hi AM Group, I'd like to sell my car. Make, model, year and kilometres: ",
              )}
              target="_blank"
              rel="noopener noreferrer"
              data-track-location="sell-steps"
            >
              WhatsApp the details
            </a>
          </Button>
          <Link
            href="/inventory"
            className="inline-flex min-h-11 items-center gap-2 px-2 text-button text-accent transition-colors duration-(--duration-1) hover:text-accent-hover"
          >
            Looking to exchange? See our stock
            <ArrowGlyph />
          </Link>
        </div>
      </Band>

      <Visit
        title="Where to bring your car"
        lede="Any of these sites can value your car. Call first and we will tell you which is best for you and how to get there."
        source="sell-visit"
        ground="ground-2"
      />

      <FaqSection
        items={FAQS}
        title="Questions about selling your car"
      />

      <ClosingCall sourceLabel="sell-closing" above="ground" />
    </>
  )
}
