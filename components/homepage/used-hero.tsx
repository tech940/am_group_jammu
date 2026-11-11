import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { PRIMARY_LOCATION, whatsappUrl } from "@/lib/locations"
import { FOUNDED } from "@/components/home/content"
import type { InventoryFacets, InventoryVehicle } from "@/lib/inventory/types"

/**
 * The used-car opener: say what is for sale, let the visitor narrow it, and
 * show one real car — all before the first scroll.
 *
 * The homepage used to open on the group ("58 years. 26 outlets. 4
 * divisions.") and reach the stock in the fifth band. A visitor who typed
 * "used cars in Jammu" had to scroll past a corporate profile to find a car.
 * The company is still here, but as the reason to trust the stock (one line
 * above the heading, and a band further down) — not as the subject.
 *
 * THE SEARCH IS A PLAIN GET FORM. No client JavaScript: three native selects
 * send `make`, `body` and `budget` to /inventory, which already reads exactly
 * those parameters (lib/inventory/filter.ts). It works before hydration, on a
 * slow phone, and with scripts blocked — and the options are built from the
 * facets of today's stock, so nobody can pick a make that returns nothing.
 *
 * THE PHOTOGRAPH IS A CAR THAT IS ACTUALLY FOR SALE, with its real price, and
 * it links to that car. When the feed is down there is no car to show, so the
 * hero says so and leads with the phone instead of a placeholder.
 */

const BUDGETS = [3, 5, 7, 10, 15]

const selectClass =
  "h-12 w-full rounded-sm border border-line-strong bg-surface px-3 text-body text-ink " +
  "transition-colors duration-(--duration-1) hover:border-ink-2"

export function UsedHero({
  total,
  degraded,
  facets,
  featured,
  vehicles,
}: {
  total: number
  degraded: boolean
  facets: InventoryFacets
  featured: InventoryVehicle | null
  /** Used only to keep budget options that would return at least one car. */
  vehicles: InventoryVehicle[]
}) {
  const live = !degraded && total > 0
  const budgets = BUDGETS.filter((b) =>
    vehicles.some((v) => v.price !== null && v.price <= b * 100_000),
  )
  const from = live && facets.priceRange.min > 0 ? facets.priceRange.min : null
  const waMessage =
    "Hi AM Group, I'm looking for a used car in Jammu. Can you help me with what's available?"

  const facts = [
    { term: "In stock today", detail: String(total), note: "all at one site in Jammu" },
    {
      term: "Prices from",
      detail: from ? `₹${(from / 100_000).toFixed(2)} L` : "—",
      note: "asking price shown on every car",
    },
    {
      term: "Makes",
      detail: String(facets.makes.length),
      note: facets.makes.map((m) => m.label).join(" · "),
    },
    { term: "Open", detail: "Mon–Sat", note: "9:30 am – 6:30 pm, no appointment" },
  ]

  return (
    <section aria-labelledby="hero-title" className="bg-ground">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-12 px-5 pb-16 pt-12 md:px-10 md:pb-20 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div>
          <p className="text-meta uppercase text-ink-2">
            AM Group · Jammu &amp; Kashmir · since {FOUNDED}
          </p>

          <h1 id="hero-title" className="mt-5 font-display text-display uppercase text-ink">
            {live ? (
              <>
                <span data-num>{total}</span> used cars,
                <br />
                ready to see in Jammu
              </>
            ) : (
              <>
                Used cars,
                <br />
                ready to see in Jammu
              </>
            )}
          </h1>

          <p className="mt-6 max-w-[54ch] text-body-lg text-ink-2">
            Every car is at AM Business Park on the N-H 1 Bye-Pass, with its own
            photographs, its recorded odometer reading and its asking price. Walk in and
            inspect any of them without an appointment.
          </p>

          {live ? (
            <form
              action="/inventory"
              method="get"
              role="search"
              aria-label="Search used cars"
              className="mt-9 rounded-md border border-line bg-surface p-4 md:p-5"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1.5 block text-label text-ink">Make</span>
                  <select name="make" defaultValue="" className={selectClass}>
                    <option value="">Any make</option>
                    {facets.makes.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label} ({m.count})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-label text-ink">Body type</span>
                  <select name="body" defaultValue="" className={selectClass}>
                    <option value="">Any body type</option>
                    {facets.bodyTypes.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label} ({b.count})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-label text-ink">Budget</span>
                  <select name="budget" defaultValue="" className={selectClass}>
                    <option value="">Any budget</option>
                    {budgets.map((b) => (
                      <option key={b} value={b}>
                        Under ₹{b} lakh
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                <Button type="submit" variant="primary" size="lg">
                  Search cars
                </Button>
                <Link
                  href="/inventory"
                  className="inline-flex min-h-11 items-center text-button uppercase text-accent underline-offset-4 transition-colors duration-(--duration-1) hover:text-accent-hover hover:underline"
                >
                  Or see all {total}
                </Link>
              </div>
            </form>
          ) : (
            <div className="mt-9 rounded-md border border-line bg-surface p-5 md:p-6">
              <h2 className="font-display text-h3 uppercase text-ink">
                The live stock list is not loading right now
              </h2>
              <p className="mt-2 max-w-[56ch] text-body text-ink-2">
                The cars are still on the forecourt. Call or message and we will tell you
                exactly what is there today.
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant={live ? "secondary" : "primary"} size="lg">
              <a href={`tel:${PRIMARY_LOCATION.phoneE164}`} data-track-location="home-hero">
                Call {PRIMARY_LOCATION.phone}
              </a>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a
                href={whatsappUrl(waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                data-track-location="home-hero"
              >
                WhatsApp
              </a>
            </Button>
          </div>
        </div>

        {/* One real car from today's stock, at its real price. */}
        {live && featured && featured.primaryImage ? (
          <figure>
            <Link
              href={`/inventory/${featured.slug}`}
              className="group block overflow-hidden rounded-md border border-line bg-surface"
            >
              <div className="relative aspect-[4/3] bg-ground-2">
                <Image
                  src={featured.primaryImage}
                  alt={`${featured.year ?? ""} ${featured.title}`.trim()}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 46vw"
                  className="object-cover"
                />
              </div>
              <div className="flex items-end justify-between gap-6 p-5">
                <div className="min-w-0">
                  <p className="text-meta uppercase text-ink-2">Just in</p>
                  <p className="mt-1 truncate font-display text-h3 uppercase text-ink transition-colors duration-(--duration-1) group-hover:text-accent">
                    {featured.year ? `${featured.year} ` : ""}
                    {featured.title}
                  </p>
                  <p className="mt-1 text-small text-ink-2" data-num>
                    {[featured.mileageLabel, featured.fuel, featured.transmission]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <p className="shrink-0 font-display text-h2 text-ink" data-num>
                  {featured.priceLabel}
                </p>
              </div>
            </Link>
            <figcaption className="mt-3 text-caption text-ink-2">
              {`Photographed at the Jammu site. Open the car for all ${featured.photoCount} photos.`}
            </figcaption>
          </figure>
        ) : null}
      </div>

      {/* Four facts about the stock, not about the company. */}
      {live && (
        <div className="border-y border-line bg-surface">
          <dl className="mx-auto grid max-w-[1400px] grid-cols-2 px-5 md:px-10 lg:grid-cols-4">
            {facts.map((item, i) => (
              <div
                key={item.term}
                className={`py-5 md:py-6 ${i % 2 === 1 ? "border-l border-line pl-5" : "pr-5"} ${
                  i < 2 ? "border-b border-line lg:border-b-0" : ""
                } ${i === 2 ? "lg:border-l lg:border-line lg:pl-5" : ""}`}
              >
                <dt className="text-meta uppercase text-ink-2">{item.term}</dt>
                <dd className="mt-1.5 font-display text-h2 text-ink" data-num>
                  {item.detail}
                </dd>
                <dd className="mt-0.5 text-small text-ink-2">{item.note}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  )
}
