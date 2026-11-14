import type { Metadata } from "next"
import Link from "next/link"
import { Band } from "@/components/system/page-kit"
import { Button } from "@/components/ui/button"
import { ClosingCall } from "@/components/system/closing-call"
import { EnquireCta } from "@/components/system/enquire-cta"
import { ArrowGlyph } from "@/components/system/marks"
import { IlloPapers, IlloSell, IlloShowroom } from "@/components/system/illustrations"
import { FaqSection } from "@/components/seo/faq-section"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { PhotoHero } from "@/components/homepage/photo-hero"
import { SectionHead, TIGHT_BAND } from "@/components/homepage/section-head"
import { Visit } from "@/components/homepage/visit"
import { PRIMARY_LOCATION, whatsappUrl } from "@/lib/locations"
import { pageSocial } from "@/lib/seo/site"
import { jsonLdString, sellServiceSchema } from "@/lib/seo-schemas"
import { SELL_FAQS, SELL_SITE_NAMES, SELL_STEPS } from "./content"

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

const SITE_NAMES = SELL_SITE_NAMES

const TITLE = "Sell Your Car in Jammu | Free Valuation | AM Group"
const DESCRIPTION =
  `Sell or exchange your car at AM Group in Jammu. Free valuation while you wait at ${SITE_NAMES.length} sites. ` +
  `Payment and RC transfer handled in-house. Call ${PRIMARY_LOCATION.phone}.`

export function generateMetadata(): Metadata {
  return {
    // `absolute`, because the root layout's template would otherwise append a
    // second "| AM Group Jammu" to a title that already names the dealer.
    title: { absolute: TITLE },
    description: DESCRIPTION,
    alternates: { canonical: "/sell-your-car" },
    ...pageSocial({ title: TITLE, description: DESCRIPTION, path: "/sell-your-car" }),
  }
}

// The words are in content.ts (shared with /llms-full.txt); the drawings are
// matched to them here, in order.
const STEP_ILLOS = [IlloShowroom, IlloSell, IlloPapers]
const STEPS = SELL_STEPS.map((step, i) => ({ ...step, Illo: STEP_ILLOS[i] }))
const FAQS = SELL_FAQS

export default function SellYourCarPage() {
  return (
    <>
      {/* The service this page is about, tied to the dealer by id. It states
          no price and no promise, because the page states none. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString(sellServiceSchema("/sell-your-car", DESCRIPTION)),
        }}
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

      {/* Under the hero so the photograph stays full-bleed at the top. This
          one component draws the trail and writes the matching BreadcrumbList,
          so the two cannot disagree (the page used to emit the list with no
          visible trail at all). */}
      <Breadcrumbs items={[{ label: "Sell your car" }]} />

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
