import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Band, Head } from "@/components/system/page-kit"
import { GradientGround, Grain, RadialWash } from "@/components/system/backdrops"
import { StockRail } from "@/components/system/stock-rail"
import { PRIMARY_LOCATION, whatsappUrl } from "@/lib/locations"
import type { InventoryVehicle } from "@/lib/inventory/types"

/**
 * Live certified stock — the one band on this page whose contents change
 * without anyone editing a file.
 *
 * When the feed is down it says so. It does not render placeholder cars, and it
 * does not quietly disappear either: a visitor who came to look at cars gets the
 * phone and WhatsApp instead of an empty section (DESIGN.md, Do's — "never fake
 * cars").
 */
export function Stock({
  vehicles,
  bestValue = [],
  total,
  degraded,
}: {
  vehicles: InventoryVehicle[]
  /** Cheapest first. Shown as a second rail when it adds cars the first lacks. */
  bestValue?: InventoryVehicle[]
  total: number
  degraded: boolean
}) {
  const available = !degraded && vehicles.length > 0

  // Deliberately the quietest band on the page: every card carries its own
  // photograph, price and badges, and anything busy behind them competes with
  // the one thing this section exists to show.
  return (
    <Band
      ground="ground"
      labelledBy="stock-title"
      id="stock"
      backdrop={
        <>
          <GradientGround tone="light" angle="180deg" strength={0.5} />
          <RadialWash at="50% 0%" strength={0.09} />
          <Grain />
        </>
      }
    >
      <Head
        id="stock-title"
        label="In stock now"
        title={available ? "Latest arrivals" : "Certified used cars"}
        lede="Every car below is physically at the Jammu site and can be inspected without an appointment. Photographs and odometer readings are the dealership's own."
      />

      <div className="mt-12">
        {available ? (
          <>
            <StockRail
              vehicles={vehicles}
              sourceLabel="home-stock-rail"
              label="Latest used cars in stock"
            />

            {bestValue.length > 0 && (
              <div className="mt-14">
                <h3 className="mb-6 border-b border-line-strong pb-3 font-display text-h3 uppercase text-ink">
                  Lowest priced today
                </h3>
                <StockRail
                  vehicles={bestValue}
                  sourceLabel="home-value-rail"
                  label="Lowest priced used cars in stock"
                />
              </div>
            )}

            <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-8">
              <Button asChild variant="primary" size="lg">
                <Link href="/inventory">See all {total} cars</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/used-cars/jammu">Used cars in Jammu</Link>
              </Button>
            </div>
          </>
        ) : (
          /* The honest degraded state. */
          <div className="rounded-md border border-line bg-surface p-6 md:p-10">
            <h3 className="font-display text-h3 uppercase text-ink">
              Live stock is not loading right now
            </h3>
            <p className="mt-3 max-w-[60ch] text-body text-ink-2">
              The connection to the dealership&apos;s stock system is down, so we are not
              showing a list rather than showing one we cannot vouch for. The cars are
              still on the forecourt — call or message and we will tell you exactly what
              is there today.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild variant="primary" size="lg">
                <a
                  href={`tel:${PRIMARY_LOCATION.phoneE164}`}
                  data-track-location="home-stock-degraded"
                >
                  Call {PRIMARY_LOCATION.phone}
                </a>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <a
                  href={whatsappUrl(
                    "Hi AM Group, what used cars do you have in stock in Jammu today?",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track-location="home-stock-degraded"
                >
                  Ask on WhatsApp
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Band>
  )
}
