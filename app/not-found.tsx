import Link from "next/link"
import Image from "next/image"
import { getInventory } from "@/lib/inventory/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/feedback"
import { ArrowGlyph, ChevronGlyph } from "@/components/system/marks"

export default async function NotFound() {
  // Pull a few real cars to show as suggestions
  let suggestedCars: Awaited<ReturnType<typeof getInventory>>["vehicles"] = []
  try {
    const { vehicles } = await getInventory()
    // Pick 3 random-ish recent cars
    suggestedCars = vehicles.slice(0, 3)
  } catch {
    // silently degrade — not-found must never throw
  }

  const quickLinks = [
    { label: "Browse All Used Cars", href: "/inventory" },
    { label: "Go to Homepage", href: "/" },
    { label: "Contact Us", href: "/contact" },
  ]

  return (
    <div className="min-h-screen bg-ground">

      {/* ── HERO SECTION ── */}
      <section data-ground="deep" className="bg-deep-2 pt-32 pb-24 px-5 md:px-10">
        <div className="container mx-auto max-w-3xl text-center">
          <p className="mb-8 text-meta uppercase text-accent-text-dark">
            404 — Page Not Found
          </p>

          <h1 className="mb-6 font-display text-h1 uppercase text-on-deep">
            This page has<br />
            <span className="text-accent-text-dark">driven off</span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-body-lg text-on-deep-2">
            The page you are looking for does not exist or may have been moved.
            Our inventory, however, is very much here — explore below.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/inventory">Browse Inventory</Link>
            </Button>
            <Button asChild variant="onDeep" size="lg">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── QUICK LINKS ── */}
      <section className="py-12 px-5 md:px-10 bg-ground">
        <div className="container mx-auto max-w-4xl">
          <p className="mb-8 text-center text-meta uppercase text-ink-2">
            Where would you like to go?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex min-h-11 items-center gap-4 border border-line bg-surface px-5 py-4 transition-colors duration-(--duration-1) hover:border-line-strong hover:bg-ground-2"
              >
                <span className="text-label text-ink">{link.label}</span>
                <ChevronGlyph
                  direction="right"
                  className="ml-auto text-ink-3 transition-colors duration-(--duration-1) group-hover:text-ink"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUGGESTED CARS ── (only if we got data) */}
      {suggestedCars.length > 0 && (
        <section className="py-14 px-5 md:px-10 bg-ground-2 border-t border-line">
          <div className="container mx-auto max-w-5xl">
            <div className="flex items-end justify-between gap-6 mb-8">
              <div>
                <p className="mb-1 text-meta uppercase text-accent-text-light">
                  While you&apos;re here
                </p>
                <h2 className="font-display text-h2 uppercase text-ink">
                  Cars you might like
                </h2>
              </div>
              <Link
                href="/inventory"
                className="hidden sm:inline-flex min-h-11 items-center gap-2 text-meta uppercase text-ink transition-colors duration-(--duration-1) hover:text-accent-text-light"
              >
                View all <ArrowGlyph />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {suggestedCars.map((car) => (
                <Link
                  key={car.id}
                  href={`/inventory/${car.slug}`}
                  className="group flex flex-col border border-line bg-surface transition-colors duration-(--duration-1) hover:border-line-strong"
                >
                  {/* Car image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-ground-2">
                    {car.images?.[0] ? (
                      <Image
                        src={car.images[0]}
                        alt={car.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-meta uppercase text-ink-3">
                          Photos coming soon
                        </span>
                      </div>
                    )}
                    {/* Condition badge */}
                    {car.condition && (
                      <div className="absolute top-3 left-3">
                        <Badge>{car.condition}</Badge>
                      </div>
                    )}
                  </div>

                  {/* Car info */}
                  <div className="p-4">
                    <p data-num className="text-meta uppercase text-ink-2">
                      {car.year} · {car.make}
                    </p>
                    <h3 className="mt-1 mb-2 line-clamp-1 font-display text-h3 uppercase text-ink transition-colors duration-(--duration-1) group-hover:text-accent-text-light">
                      {car.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      {car.fuel && (
                        <span className="rounded-sm border border-line bg-ground px-2 py-0.5 text-meta uppercase text-ink-2">
                          {car.fuel}
                        </span>
                      )}
                      {car.transmission && (
                        <span className="rounded-sm border border-line bg-ground px-2 py-0.5 text-meta uppercase text-ink-2">
                          {car.transmission}
                        </span>
                      )}
                      {car.mileageLabel && (
                        <span
                          data-num
                          className="rounded-sm border border-line bg-ground px-2 py-0.5 text-meta uppercase text-ink-2"
                        >
                          {car.mileageLabel}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p data-num className="font-display text-h3 text-ink">
                        {car.priceLabel}
                      </p>
                      <span className="text-meta uppercase text-accent-text-light">
                        View
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-6 sm:hidden text-center">
              <Link
                href="/inventory"
                className="inline-flex min-h-11 items-center gap-2 text-meta uppercase text-ink transition-colors duration-(--duration-1) hover:text-accent-text-light"
              >
                View all cars <ArrowGlyph />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── CONTACT STRIP ── */}
      <section className="py-12 px-5 md:px-10 bg-ground border-t border-line">
        <div className="container mx-auto max-w-3xl">
          <div data-ground="deep" className="bg-deep p-8 md:p-10 text-center">
            <h2 className="mb-2 font-display text-h2 uppercase text-on-deep">
              Need help finding a car?
            </h2>
            <p className="mx-auto mb-6 max-w-md text-body text-on-deep-2">
              Our team at AM Business Park, Jammu is available to help you find the right vehicle.
            </p>
            <div className="flex justify-center">
              <Button asChild variant="onDeep" size="lg">
                <a href="tel:+919419100000" data-num>
                  +91 94191 00000
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
