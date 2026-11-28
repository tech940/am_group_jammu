import Link from "@/components/system/intent-link"
import { Button } from "@/components/ui/button"
import { StockRail } from "@/components/system/stock-rail"
import { PRIMARY_LOCATION, whatsappUrl } from "@/lib/locations"
import type { InventoryVehicle } from "@/lib/inventory/types"
import { SectionHead, StoreBand } from "./section-head"

/**
 * Live stock — the one band on this page whose contents change without anyone
 * editing a file.
 *
 * When the feed is down it says so. It does not render placeholder cars, and it
 * does not quietly disappear either: a visitor who came to look at cars gets the
 * phone and WhatsApp instead of an empty section (DESIGN.md, Do's — "never fake
 * cars").
 *
 * No backdrop: every card carries its own photograph, price and badges, and
 * anything behind them competes with the one thing this section shows.
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

  return (
    <StoreBand ground="ground-2" labelledBy="stock-title" id="stock">
      <SectionHead
        id="stock-title"
        title={available ? "Just arrived" : "Used cars in stock"}
        lede="The photographs, odometer readings and prices are our own. Stock is spread across several sites in Jammu, so call to confirm which site a car is at."
      />

      <div className="mt-7 md:mt-10">
        {available ? (
          <>
            <StockRail
              vehicles={vehicles}
              sourceLabel="home-stock-rail"
              label="Latest used cars in stock"
            />

            {bestValue.length > 0 && (
              <div className="mt-9 md:mt-12">
                {/* An h2: it heads its own list of cars, whose titles are h3. */}
                <h2 className="mb-5 font-display text-h2 uppercase text-ink">
                  Lowest priced today
                </h2>
                <StockRail
                  vehicles={bestValue}
                  sourceLabel="home-value-rail"
                  label="Lowest priced used cars in stock"
                />
              </div>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-3 md:mt-9">
              <Button asChild variant="primary" size="lg">
                <Link href="/inventory">See all {total} cars in stock</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/inventory">Used cars in Jammu</Link>
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
              The connection to our stock system is down, so we are not showing a list
              rather than showing one we cannot vouch for. The cars are still here — call
              or message and we will tell you exactly what is available today.
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
    </StoreBand>
  )
}
