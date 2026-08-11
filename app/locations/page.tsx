import type { Metadata } from "next"
import Link from "next/link"
import { LOCATIONS, formatAddress, formatHours } from "@/lib/locations"
import { getInventory } from "@/lib/inventory/server"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { FaqSection } from "@/components/seo/faq-section"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Our Showrooms in Jammu & Srinagar | Visit AM Group",
  description:
    "Find your nearest AM Group car showroom. Visit us at AM Business Park on the N-H 1 Bye-Pass Road in Jammu, or AM Tower at Hyderpora Bye-Pass in Srinagar. Open Mon–Sat, 9:30 am – 6:30 pm.",
  alternates: { canonical: "/locations" },
}

export default async function LocationsPage() {
  const { total } = await getInventory()

  const faqs = [
    {
      question: "Where is the nearest AM Group car showroom?",
      answer:
        "We have two locations in Jammu & Kashmir. Our main used-car showroom is at AM Business Park on the " +
        "N-H 1 Bye-Pass Road in Jammu, directly opposite the railway station. Our Kashmir Valley office is at " +
        "AM Tower on the Hyderpora Bye-Pass in Srinagar. Both are open Monday to Saturday, 9:30 am to 6:30 pm.",
    },
    {
      question: "Do I need an appointment to visit?",
      answer:
        "No. You are welcome to walk into the Jammu showroom during opening hours and inspect any car in stock. " +
        "For Srinagar we recommend calling ahead on +91 94191 00000 so we can have the specific car you want on site.",
    },
    {
      question: "Can I see a car from the Jammu stock in Srinagar?",
      answer:
        "Yes. Stock is held centrally in Jammu but cars can be moved to Srinagar for inspection. Give us a day or " +
        "two's notice and we will arrange it at no cost to you.",
    },
    {
      question: "Is there parking at the showroom?",
      answer:
        "Yes, there is customer parking on site at both locations. The Jammu site is directly on the bye-pass road " +
        "opposite the railway station, so it is easy to reach from either direction.",
    },
    {
      question: "Which areas do you serve?",
      answer:
        "We regularly serve buyers across Jammu, Srinagar, Kathua and Udhampur, and the surrounding localities — " +
        "including Channi Himmat, Gandhi Nagar, Trikuta Nagar, Bahu Plaza and Satwari around Jammu, and Hyderpora, " +
        "Rawalpora, Bemina and Sanat Nagar around Srinagar.",
    },
  ]

  return (
    <div className="min-h-screen bg-ground">
      <Breadcrumbs items={[{ label: "Locations" }]} />

      <section className="border-b border-line bg-ground-2">
        <div className="container mx-auto px-4 md:px-8 py-10 md:py-14">
          <h1 className="font-display text-h1 text-ink mb-5 max-w-4xl">
            Find Your Nearest AM Group Showroom
          </h1>
          <div className="max-w-3xl space-y-3">
            <p className="text-body text-ink-2">
              AM Group has been trading in Jammu &amp; Kashmir since 1968. We have two locations — our main
              used-car showroom in Jammu and our Kashmir Valley office in Srinagar — and{" "}
              {total > 0 ? (
                <span data-num>{total} certified pre-owned cars</span>
              ) : (
                "certified pre-owned cars"
              )}{" "}
              currently in stock.
            </p>
            <p className="text-body text-ink-2">
              Walk in during opening hours, or call{" "}
              <a
                href="tel:+919419100000"
                className="font-semibold text-ink transition-colors duration-(--duration-1) hover:text-accent-text-light"
              >
                +91 94191 00000
              </a>{" "}
              and we will tell you exactly what is on the forecourt today.
            </p>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {LOCATIONS.map((loc) => (
              <div
                key={loc.slug}
                className="flex flex-col border border-line bg-surface p-6"
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <h2 className="font-display text-h2 text-ink">{loc.shortName}</h2>
                    <p className="text-meta uppercase text-accent-text-light mt-1">
                      {loc.isPrimary ? "Main showroom" : "Valley office"}
                    </p>
                  </div>
                </div>

                <p className="text-body text-ink-2 mb-6">{loc.blurb}</p>

                <dl className="space-y-3 mb-6">
                  <div>
                    <dt className="sr-only">Address</dt>
                    <dd className="text-body text-ink">
                      {formatAddress(loc)}
                      <span className="block text-small text-ink-2 mt-0.5">{loc.landmark}</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="sr-only">Opening hours</dt>
                    <dd className="text-body text-ink">{formatHours(loc)}</dd>
                  </div>
                  <div>
                    <dt className="sr-only">Phone</dt>
                    <dd>
                      <a
                        href={`tel:${loc.phoneE164}`}
                        className="inline-flex min-h-11 items-center font-semibold text-ink transition-colors duration-(--duration-1) hover:text-accent-text-light"
                      >
                        {loc.phone}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="sr-only">Email</dt>
                    <dd>
                      <a
                        href={`mailto:${loc.email}`}
                        className="inline-flex min-h-11 items-center text-ink transition-colors duration-(--duration-1) hover:text-accent-text-light"
                      >
                        {loc.email}
                      </a>
                    </dd>
                  </div>
                </dl>

                <div className="mt-auto flex flex-wrap gap-2.5">
                  <Button asChild variant="primary" className="flex-1 min-w-[140px]">
                    <Link href={`/locations/${loc.slug}`}>Branch details</Link>
                  </Button>
                  <Button asChild variant="secondary" className="flex-1 min-w-[140px]">
                    <a href={loc.mapUrl} target="_blank" rel="noopener noreferrer">
                      Directions
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FaqSection items={faqs} title="Visiting AM Group — FAQs" />
    </div>
  )
}
