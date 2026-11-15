import type { Metadata } from "next"
import Link from "next/link"
import { Band } from "@/components/system/page-kit"
import { Button } from "@/components/ui/button"
import { ClosingCall } from "@/components/system/closing-call"
import { ArrowGlyph } from "@/components/system/marks"
import { IlloPapers, IlloSell, IlloShowroom } from "@/components/system/illustrations"
import { FaqSection } from "@/components/seo/faq-section"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { ValuationWizard } from "./valuation-wizard"
import { SectionHead, TIGHT_BAND } from "@/components/homepage/section-head"
import { Visit } from "@/components/homepage/visit"
import { PRIMARY_LOCATION, whatsappUrl } from "@/lib/locations"
import { pageSocial } from "@/lib/seo/site"
import { jsonLdString, sellServiceSchema } from "@/lib/seo-schemas"
import { SELL_FAQS, SELL_STEPS } from "./content"

/**
 * Sell your car — the second of the two things this site is for.
 *
 * The page follows the company's own valuation page, which the owner gave as
 * the reference: the headline is the seller's question, the three-step form
 * is the opener, then how it works, where to bring the car, and questions.
 *
 * WHAT THIS PAGE DOES NOT SAY. It shows no price and promises no "best
 * price" or payment time: the form collects the car's details and a number,
 * an evaluator calls, and the price follows a look at the car.
 *
 * Server-rendered except the form (valuation-wizard.tsx).
 */

const TITLE = "Sell Your Car in Jammu | Free Car Valuation | AM Group"
const DESCRIPTION =
  `What is your car worth? AM Group in Jammu evaluates any car, any brand, free. Tell us the make, model, ` +
  `year and kilometres and an evaluator calls you. Call ${PRIMARY_LOCATION.phone}.`

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

      {/* The opener is the form. The headline asks the seller's own question
          and the first step is already on screen, so there is nothing to
          press before starting. A light ground, not the photograph: a form
          over a picture is harder to read, and this page is the form. */}
      <section aria-labelledby="sell-title" className="sky-ground relative">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-start gap-8 px-4 pb-12 pt-8 md:px-10 md:pb-20 md:pt-14 lg:grid-cols-[1fr_minmax(0,30rem)] lg:gap-14">
          <div className="lg:pt-6">
            <h1 id="sell-title" className="font-display text-display uppercase text-ink">
              What&rsquo;s your car worth?
            </h1>
            <p className="mt-4 max-w-[44ch] text-body-lg text-ink-2">
              <strong className="font-semibold text-ink">AM Group, Jammu</strong> evaluates any car, any
              brand, free. Sell it, or put it towards a used car from our stock.
            </p>
            <IlloSell className="mt-6 hidden h-56 w-auto lg:block" />
          </div>

          <div id="valuation" className="scroll-mt-24">
            <ValuationWizard />
          </div>
        </div>
      </section>

      {/* One component draws the trail and writes the matching BreadcrumbList,
          so the two cannot disagree. */}
      <Breadcrumbs items={[{ label: "Sell your car" }]} />

      <Band ground="ground" labelledBy="how-title" id="how-it-works" className={TIGHT_BAND}>
        <SectionHead
          id="how-title"
          title="How it works"
          lede="Three steps. We do not quote a price before we have seen the car."
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
          <Button asChild size="lg">
            <a href="#valuation">Get my car&rsquo;s price</a>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <a href={`tel:${PRIMARY_LOCATION.phoneE164}`} data-track-location="sell-steps">
              Call {PRIMARY_LOCATION.phone}
            </a>
          </Button>
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
        title="Or bring the car to us"
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
