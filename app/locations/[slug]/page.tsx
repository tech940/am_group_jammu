import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { LOCATIONS, formatAddress, formatHours, getLocation, whatsappUrl } from "@/lib/locations"
import { generateDealerSchema } from "@/lib/seo-schemas"
import { getInventory } from "@/lib/inventory/server"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { FaqSection } from "@/components/seo/faq-section"
import { FrequentSearches } from "@/components/seo/frequent-searches"
import { getFrequentSearches } from "@/lib/seo/links"
import { FeaturedInventory } from "@/components/sections/inventory"
import { Button } from "@/components/ui/button"

/**
 * One page per branch, each carrying its own AutoDealer markup.
 *
 * This is what "near me" actually needs from a website: a distinct, complete
 * location entity with consistent NAP, hours, service area and a map link, so
 * Google can tie the page to the Google Business Profile. The GBP itself does
 * most of the work for the map pack — this is the corroborating evidence.
 */

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return LOCATIONS.map((l) => ({ slug: l.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const loc = getLocation(slug)
  if (!loc) return { title: "Location Not Found", robots: "noindex" }

  return {
    title: `Used Car Showroom in ${loc.city} | ${loc.streetAddress.split(",")[0]} — AM Group`,
    description:
      `Visit AM Group's ${loc.city} showroom at ${loc.streetAddress}, ${loc.landmark}. ` +
      `Open ${formatHours(loc)}. Certified pre-owned cars, test drives, finance and part-exchange. Call ${loc.phone}.`,
    alternates: { canonical: `/locations/${loc.slug}` },
  }
}

export default async function LocationPage({ params }: Props) {
  const { slug } = await params
  const loc = getLocation(slug)
  if (!loc) notFound()

  const [{ vehicles, total }, frequentSearches] = await Promise.all([
    getInventory(),
    getFrequentSearches(24),
  ])

  const faqs = [
    {
      question: `Where is the AM Group showroom in ${loc.city}?`,
      answer:
        `We are at ${formatAddress(loc)} — ${loc.landmark.toLowerCase()}. ` +
        `There is customer parking on site, and we are open ${formatHours(loc)}.`,
    },
    {
      question: `What are your opening hours in ${loc.city}?`,
      answer: `${formatHours(loc)}. We are closed on Sundays. Call ${loc.phone} if you need to arrange a visit outside these hours.`,
    },
    {
      question: `How many used cars can I see at the ${loc.city} branch?`,
      answer: loc.isPrimary
        ? `All ${total} cars in our current stock are held here and can be inspected without an appointment.`
        : `Stock is held centrally in Jammu, so we recommend calling ${loc.phone} a day or two ahead and we will bring the specific car you want to ${loc.city} at no cost to you.`,
    },
    {
      question: `Which areas around ${loc.city} do you serve?`,
      answer: `We regularly serve customers from ${loc.areasServed.slice(0, -1).join(", ")} and ${loc.areasServed[loc.areasServed.length - 1]}, as well as the wider ${loc.region} region.`,
    },
    {
      question: "What should I bring when visiting?",
      answer:
        "For a test drive, bring a valid driving licence. If you are part-exchanging, bring your car's registration " +
        "certificate, insurance and service records and we will value it while you wait.",
    },
  ]

  const otherLocations = LOCATIONS.filter((l) => l.slug !== loc.slug)

  return (
    <div className="min-h-screen bg-ground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateDealerSchema(loc)) }}
      />

      <Breadcrumbs
        items={[{ label: "Locations", href: "/locations" }, { label: loc.shortName }]}
      />

      {/* Hero — NAP above the fold, which is what a near-me visitor came for */}
      <section className="border-b border-line bg-ground-2">
        <div className="container mx-auto px-4 md:px-8 py-10 md:py-14">
          <span className="block text-meta uppercase text-accent-text-light mb-4">
            {loc.city}, {loc.region}
          </span>

          <h1 className="font-display text-h1 text-ink mb-5 max-w-4xl">
            Used Car Showroom in {loc.city}
          </h1>

          <div className="max-w-3xl space-y-3">
            <p className="text-body text-ink-2">
              {loc.blurb}
            </p>
            <p className="text-body text-ink-2">
              You will find us at <strong className="font-semibold text-ink">{loc.streetAddress}</strong>,{" "}
              {loc.landmark.toLowerCase()}. We are open {formatHours(loc)}, and there is customer parking on site.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 max-w-3xl">
            <Button asChild variant="primary">
              <a href={`tel:${loc.phoneE164}`} data-track-location="branch-hero">
                Call branch
              </a>
            </Button>
            <Button asChild variant="secondary">
              <a
                href={whatsappUrl(`Hi AM Group, I'd like to visit your ${loc.city} showroom. Can you help?`)}
                target="_blank"
                rel="noopener noreferrer"
                data-track-location="branch-hero"
              >
                WhatsApp
              </a>
            </Button>
            <Button asChild variant="secondary">
              <a
                href={loc.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-track-location="branch-hero"
              >
                Directions
              </a>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/inventory">View stock</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* NAP block + services */}
      <section className="py-12 border-b border-line">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="border border-line bg-surface p-6">
                <h2 className="text-meta uppercase text-ink-2 mb-3">Address</h2>
                <address className="not-italic text-body text-ink">
                  {loc.name}
                  <br />
                  {loc.streetAddress}
                  <br />
                  {loc.city}, {loc.region} {loc.postalCode}
                  <br />
                  <span className="text-ink-2">{loc.landmark}</span>
                </address>
              </div>

              <div className="border border-line bg-surface p-6">
                <h2 className="text-meta uppercase text-ink-2 mb-3">
                  Opening hours
                </h2>
                <p className="text-body text-ink">
                  {formatHours(loc)}
                  <span className="block text-ink-2 mt-1">Closed Sundays</span>
                </p>
              </div>

              <div className="border border-line bg-surface p-6">
                <h2 className="text-meta uppercase text-ink-2 mb-3">Contact</h2>
                <div className="text-body">
                  <a
                    href={`tel:${loc.phoneE164}`}
                    data-track-location={`branch-${loc.slug}`}
                    className="flex min-h-11 items-center font-semibold text-ink transition-colors duration-(--duration-1) hover:text-accent-text-light"
                  >
                    {loc.phone}
                  </a>
                  <a
                    href={`mailto:${loc.email}`}
                    data-track-location={`branch-${loc.slug}`}
                    className="flex min-h-11 items-center text-ink transition-colors duration-(--duration-1) hover:text-accent-text-light"
                  >
                    {loc.email}
                  </a>
                </div>
              </div>

              <div className="border border-line bg-surface p-6">
                <h2 className="text-meta uppercase text-ink-2 mb-3">
                  At this branch
                </h2>
                <ul className="space-y-1.5">
                  {loc.services.map((s) => (
                    <li key={s} className="text-body text-ink-2">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Areas served — how people actually describe where they are */}
            <div className="border border-line bg-ground-2 p-6">
              <h2 className="text-meta uppercase text-ink-2 mb-3">
                Areas we serve around {loc.city}
              </h2>
              <p className="text-body text-ink-2 mb-4">
                Customers travel to us from across {loc.city} and the surrounding districts. If you are in any of
                these areas we are a short drive away.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {loc.areasServed.map((a) => (
                  <span
                    key={a}
                    className="px-2.5 py-1 rounded-sm bg-surface border border-line text-caption text-ink-2"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Getting here */}
      <section className="py-14 bg-ground-2">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl space-y-8">
          <article>
            <h2 className="font-display text-h2 text-ink mb-3">
              Getting to our {loc.city} showroom
            </h2>
            <p className="text-body text-ink-2">
              {loc.isPrimary
                ? "We are directly on the N-H 1 Bye-Pass Road opposite Jammu railway station, so we are easy to reach from either direction and from the airport side of the city. If you are coming in from the Srinagar highway, we are on your left before you reach the railway crossing. Customer parking is on site."
                : "AM Tower is on the Hyderpora Bye-Pass, on the main road out towards the airport. It is a straightforward run from Rawalpora, Natipora and Bemina, and there is parking directly outside."}
            </p>
          </article>

          <article>
            <h2 className="font-display text-h2 text-ink mb-3">What to expect when you visit</h2>
            <p className="text-body text-ink-2">
              No appointment is needed to look around{loc.isPrimary ? "" : ", though calling ahead means we can have a specific car ready for you"}.
              Every car is priced on the windscreen and on this website at the same figure — the price you see online
              is the price we negotiate from. Bring a valid driving licence if you want a test drive, and your existing
              car&apos;s paperwork if you would like a part-exchange valuation while you wait.
            </p>
          </article>

          {otherLocations.length > 0 && (
            <article className="border-t border-line pt-6">
              <h2 className="font-display text-h2 text-ink mb-3">Our other locations</h2>
              <div className="flex flex-wrap gap-2.5">
                {otherLocations.map((o) => (
                  <Button key={o.slug} asChild variant="secondary">
                    <Link href={`/locations/${o.slug}`}>
                      {o.shortName} — {o.streetAddress.split(",")[0]}
                    </Link>
                  </Button>
                ))}
              </div>
            </article>
          )}
        </div>
      </section>

      {vehicles.length > 0 && (
        <FeaturedInventory
          vehicles={vehicles.slice(0, 6)}
          title={`Cars you can see in ${loc.city}`}
          subtitle={`${total} certified pre-owned cars currently in stock`}
        />
      )}

      <FaqSection items={faqs} title={`Visiting our ${loc.city} showroom — FAQs`} />

      <FrequentSearches searches={frequentSearches} />
    </div>
  )
}
