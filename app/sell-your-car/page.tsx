import type { Metadata } from "next"
import Image from "next/image"
import Link from "@/components/system/intent-link"
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
import { INDEX_ROBOTS, pageSocial } from "@/lib/seo/site"
import { jsonLdString, sellServiceSchema } from "@/lib/seo-schemas"
import { DEALERSHIPS, GROUP_FACTS, SELL_FAQS, SELL_STEPS } from "./content"

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
  `What is your car worth? AM Group, Jammu evaluates any car, any brand, free. ` +
  `Tell us about it and an evaluator calls you. Call ${PRIMARY_LOCATION.phone}.`

export function generateMetadata(): Metadata {
  return {
    // `absolute`, because the root layout's template would otherwise append a
    // second "| AM Group Jammu" to a title that already names the dealer.
    title: { absolute: TITLE },
    description: DESCRIPTION,
    alternates: { canonical: "/sell-your-car" },
    robots: INDEX_ROBOTS,
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
        {/* Three columns on a wide screen, as on the company's own page: the
            question, the evaluator, the form - so his hand points straight at
            the form. Below that width there is no room for him beside it, and
            he is left out rather than squeezed under the text. */}
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-start gap-8 px-4 pb-12 pt-8 md:px-10 md:pb-20 md:pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,30rem)] xl:gap-6">
          <div className="lg:pt-6">
            <h1
              id="sell-title"
              className="font-display text-display uppercase text-ink xl:text-[length:4.25rem]"
            >
              What&rsquo;s your car worth?
            </h1>
            <p className="mt-4 max-w-[44ch] text-body-lg text-ink-2">
              <strong className="font-semibold text-ink">AM Group, Jammu</strong> evaluates any car, any
              brand, free. Sell it, or put it towards a used car from our stock.
            </p>

            {/* Below the three-column width the evaluator cannot stand beside
                the form, so he and the note sit just above it instead (on a
                phone) or under the heading next to it (on a tablet), smaller,
                with the arrow pointing on to the form. Same drawing and the
                same `sizes` as the wide version, so one file serves both. */}
            <div aria-hidden className="mt-6 flex items-end justify-center gap-3 sm:justify-start xl:hidden">
              <div className="mb-6 flex flex-col items-end">
                <p className="w-[10ch] -rotate-6 text-right font-display text-h3 leading-tight text-pop-text">
                  Get your car&rsquo;s value in a minute
                </p>
                <svg
                  viewBox="0 0 60 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-3 h-8 w-12 text-pop-text"
                >
                  <path d="M4 6c14 22 30 26 50 22" />
                  <path d="m46 20 9 8-11 5" />
                </svg>
              </div>
              <Image
                src="/sell/sell-evaluator.webp"
                alt=""
                width={1060}
                height={1180}
                sizes="290px"
                loading="eager"
                className="h-48 w-auto sm:h-56"
              />
            </div>
          </div>

          {/* The company's own drawing of an evaluator. Decorative here: the
              heading and the form already say everything he is pointing at. */}
          <div aria-hidden className="relative hidden self-end xl:block">
            <p className="absolute -right-2 -top-2 w-[10ch] -rotate-6 text-right font-display text-h3 leading-tight text-pop-text">
              Get your car&rsquo;s value in a minute
            </p>
            <svg
              viewBox="0 0 60 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute -right-4 top-24 h-8 w-12 text-pop-text"
            >
              <path d="M4 6c14 22 30 26 50 22" />
              <path d="m46 20 9 8-11 5" />
            </svg>
            <Image
              src="/sell/sell-evaluator.webp"
              alt=""
              width={1060}
              height={1180}
              sizes="290px"
              loading="eager"
              className="mt-20 h-80 w-auto"
            />
          </div>

          <div id="valuation" className="scroll-mt-24">
            <ValuationWizard />
          </div>
        </div>
      </section>

      {/* Who is asking for the car. The sentence and the dealership list are
          the company's own, from its valuation page; the owner asked for them
          here on 2026-11-15. This is the one place on this site that names the
          group's new-vehicle dealerships, because a seller is trusting the
          group with their car, not just a used-car desk. */}
      <section aria-label="About AM Group" className="bg-ground-2">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-8 px-4 py-10 md:grid-cols-[1fr_minmax(0,28rem)] md:px-10 md:py-14">
          <p className="max-w-[40ch] text-body-lg text-ink-2">
            AM Group is a Jammu company that sells Hyundai cars and runs{" "}
            <strong className="font-semibold text-ink" data-num>
              {GROUP_FACTS.showrooms}
            </strong>{" "}
            showrooms across Jammu &amp; Kashmir.
          </p>
          <Image
            src="/sell/am-hyundai-showroom.webp"
            alt="The front of the AM Hyundai showroom, with Hyundai cars on display behind the glass"
            width={920}
            height={546}
            sizes="(max-width: 767px) 100vw, 448px"
            className="h-auto w-full rounded-md border border-line"
          />
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

      <Band ground="ground-2" labelledBy="group-title" id="dealerships" className={TIGHT_BAND}>
        <SectionHead
          id="group-title"
          title={`One group, ${DEALERSHIPS.length === 8 ? "eight" : DEALERSHIPS.length} dealerships`}
          lede="AM Group sells new cars and two-wheelers across Jammu & Kashmir, and the same group evaluates your car."
        />
        <ul className="mt-7 grid grid-cols-2 gap-3 md:mt-10 md:grid-cols-4 md:gap-4">
          {DEALERSHIPS.map((d) => (
            <li key={d.name} className="rounded-md border border-line bg-surface p-4 md:p-5">
              {/* The makers' own marks, shown as the dealer of each. Decorative:
                  the name beside it says the same thing. */}
              <Image
                src={d.logo}
                alt=""
                width={96}
                height={40}
                unoptimized={d.logo.endsWith(".svg")}
                className="h-8 w-auto max-w-24 object-contain object-left"
              />
              <p className="mt-4 text-h4 text-ink">{d.name}</p>
              <p className="mt-0.5 text-small text-ink-2">{d.sells}</p>
            </li>
          ))}
        </ul>
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
