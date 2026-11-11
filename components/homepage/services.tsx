import { Band, Head } from "@/components/system/page-kit"
import { DotMatrix, Grain, RadialWash } from "@/components/system/backdrops"
import { EnquireCta } from "@/components/system/enquire-cta"
import { RevealGroup, RevealItem } from "@/components/system/reveal"
import type { LeadIntent } from "@/lib/leads/types"

/**
 * The three service actions, carried over from the old homepage's "Featured
 * Services" — content, not design.
 *
 * What survived from the old block is what mattered: insurance, selling your
 * car to us, and booking a service are the three things a visitor who is NOT
 * shopping for a car comes to a dealership site to do, and this page had no
 * door for any of them. The Elementor icon boxes, the icon font, and the links
 * into WordPress pages (/insurance-solutions, /book-service, /sell-your-car —
 * all currently parked on temporary redirects) did not survive.
 *
 * Each card opens the shared enquiry modal with the REAL CRM intent — the lead
 * desk has typed Insurance / Service / Sell Your Car lanes already, so these
 * enquiries land sorted instead of arriving as "General" and being triaged by
 * hand. No icons: DESIGN.md's delete-first rule — every label here already
 * says the word.
 */
const SERVICES: {
  intent: LeadIntent
  title: string
  body: string
  action: string
}[] = [
  // Ordered for a used-car buyer: the car they already own comes first,
  // because a part-exchange is what makes most purchases possible.
  {
    intent: "Sell Your Car",
    title: "Sell or exchange your car",
    body: "Bring the car to the Jammu site and have it valued while you wait. Payment and RC transfer are handled in-house.",
    action: "Get a valuation",
  },
  {
    intent: "Finance",
    title: "Car finance",
    body: "Bank finance arranged at the dealership desk for any car in stock. Ask for the EMI on the one you like.",
    action: "Ask about finance",
  },
  {
    intent: "Insurance",
    title: "Motor insurance",
    body: "New policies and renewals handled at the dealership desk — quotes compared for you, paperwork done on site.",
    action: "Get an insurance quote",
  },
]

export function Services() {
  return (
    <Band
      ground="ground-2"
      labelledBy="services-title"
      id="services"
      backdrop={
        <>
          <RadialWash at="80% 0%" strength={0.1} />
          <DotMatrix cell={22} strength={0.05} fade="both" />
          <Grain />
        </>
      }
    >
      <Head
        id="services-title"
        label="Around the purchase"
        title="Exchange, finance, insure"
        lede="The three things that usually sit between liking a car and driving it home. Each button reaches the right desk directly."
      />

      <RevealGroup className="mt-14 grid grid-cols-1 gap-x-12 gap-y-12 border-t border-line-strong pt-10 md:grid-cols-3">
        {SERVICES.map((service, i) => (
          <RevealItem key={service.intent} className="flex flex-col">
            <p className="flex items-baseline gap-4">
              <span className="font-display text-h3 text-ink-2" data-num>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-h3 uppercase text-ink">
                {service.title}
              </span>
            </p>
            <p className="mt-3 flex-1 text-body text-ink-2">{service.body}</p>
            <div className="mt-6">
              <EnquireCta
                label={service.action}
                intent={service.intent}
                sourceLabel={`home-services-${service.intent.toLowerCase().replace(/\s+/g, "-")}`}
                variant="secondary"
              />
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </Band>
  )
}
