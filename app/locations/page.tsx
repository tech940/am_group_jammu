import type { Metadata } from "next"
import Link from "next/link"
import { MapPin, Phone, Mail, Clock, ArrowRight, Navigation } from "lucide-react"
import { LOCATIONS, formatAddress, formatHours } from "@/lib/locations"
import { getInventory } from "@/lib/inventory/server"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { FaqSection } from "@/components/seo/faq-section"

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
    <div className="min-h-screen bg-white">
      <Breadcrumbs items={[{ label: "Locations" }]} />

      <section className="border-b border-black/5 bg-gradient-to-b from-zinc-50 to-white">
        <div className="container mx-auto px-4 md:px-8 py-10 md:py-14">
          <h1 className="text-3xl md:text-5xl font-black text-[#023468] tracking-tight mb-5 max-w-4xl">
            Find Your Nearest AM Group Showroom
          </h1>
          <div className="max-w-3xl space-y-3">
            <p className="text-sm md:text-[15px] text-black/60 leading-relaxed">
              AM Group has been trading in Jammu &amp; Kashmir since 1968. We have two locations — our main
              used-car showroom in Jammu and our Kashmir Valley office in Srinagar — and{" "}
              {total > 0 ? `${total} certified pre-owned cars` : "certified pre-owned cars"} currently in stock.
            </p>
            <p className="text-sm md:text-[15px] text-black/60 leading-relaxed">
              Walk in during opening hours, or call{" "}
              <a href="tel:+919419100000" className="font-bold text-[#023468] hover:text-[#E31837]">
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
                className="rounded-3xl border border-black/8 bg-white shadow-sm hover:shadow-lg transition-shadow p-7 flex flex-col"
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-2xl font-black text-[#023468]">{loc.shortName}</h2>
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#E31837] mt-1">
                      {loc.isPrimary ? "Main showroom" : "Valley office"}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-black/55 leading-relaxed mb-6">{loc.blurb}</p>

                <dl className="space-y-3 text-sm mb-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-[#023468] shrink-0 mt-0.5" />
                    <dd className="text-black/70">
                      {formatAddress(loc)}
                      <span className="block text-black/40 text-xs mt-0.5">{loc.landmark}</span>
                    </dd>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-[#023468] shrink-0" />
                    <dd className="text-black/70">{formatHours(loc)}</dd>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-[#023468] shrink-0" />
                    <dd>
                      <a href={`tel:${loc.phoneE164}`} className="text-black/70 hover:text-[#023468] font-semibold">
                        {loc.phone}
                      </a>
                    </dd>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-[#023468] shrink-0" />
                    <dd>
                      <a href={`mailto:${loc.email}`} className="text-black/70 hover:text-[#023468]">
                        {loc.email}
                      </a>
                    </dd>
                  </div>
                </dl>

                <div className="mt-auto flex flex-wrap gap-2.5">
                  <Link
                    href={`/locations/${loc.slug}`}
                    className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-[#023468] hover:bg-[#01254a] text-white text-[11px] font-black uppercase tracking-wider transition-colors"
                  >
                    Branch details <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <a
                    href={loc.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 h-11 rounded-xl border border-black/15 hover:bg-black hover:text-white text-[11px] font-black uppercase tracking-wider transition-colors"
                  >
                    <Navigation className="h-3.5 w-3.5" /> Directions
                  </a>
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
