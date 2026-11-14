import { Button } from "@/components/ui/button"
import { ChevronGlyph, SearchGlyph } from "@/components/system/marks"
import { PRIMARY_LOCATION, whatsappUrl } from "@/lib/locations"
import type { InventoryFacets, InventoryVehicle } from "@/lib/inventory/types"
import { PhotoHero } from "./photo-hero"

/**
 * The opener of a used-car shop: the showroom photograph, how many cars there
 * are, and a search — nothing else.
 *
 * THE SEARCH IS A PLAIN GET FORM. No client JavaScript. It sends `q`, `make`,
 * `body` and `budget` to /inventory, which already reads exactly those
 * parameters (app/inventory/page.tsx, lib/inventory/filter.ts) and ignores the
 * empty ones. It works before hydration, on a slow phone, and with scripts
 * blocked.
 *
 * ONE ROW FIRST. The previous form was three stacked selects and a button,
 * which filled a phone screen before the visitor had typed anything. It now
 * leads with a single text field and a Search button; the three selects are
 * behind "More filters" in a native <details>, which also needs no script.
 * Their options are built from today's stock, so nobody can pick a make that
 * returns nothing.
 *
 * Inputs are 17px on purpose: iOS Safari zooms the page when a focused field
 * is under 16px, and this was reviewed on an iPhone. (Only the placeholder is
 * smaller, so "Search make or model" fits beside the button at 360px; the
 * magnifier inside the field appears from `sm` up for the same reason.)
 *
 * When the feed is down there is nothing honest to search, so the hero says so
 * and leads with the phone.
 */

const BUDGETS = [3, 5, 7, 10, 15]

const fieldClass =
  "h-12 w-full rounded-sm border border-line-strong bg-surface text-body-lg text-ink " +
  "placeholder:text-body placeholder:text-ink-3"

/**
 * A hand-drawn stroke under one word, in the action colour. Decorative: the
 * word reads the same without it, so the stroke is hidden from assistive tech.
 */
function Underlined({ children }: { children: string }) {
  return (
    <span className="relative inline-block">
      {children}
      <svg
        aria-hidden
        viewBox="0 0 200 14"
        preserveAspectRatio="none"
        className="absolute -bottom-[0.14em] left-0 h-[0.16em] w-full text-pop"
        fill="none"
      >
        <path d="M3 9C40 3 92 2 197 7" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      </svg>
    </span>
  )
}

export function UsedHero({
  total,
  degraded,
  facets,
  vehicles,
}: {
  total: number
  degraded: boolean
  facets: InventoryFacets
  /** Used only to keep budget options that would return at least one car. */
  vehicles: InventoryVehicle[]
}) {
  const live = !degraded && total > 0
  const budgets = BUDGETS.filter((b) =>
    vehicles.some((v) => v.price !== null && v.price <= b * 100_000),
  )

  return (
    <PhotoHero labelledBy="hero-title" overlap>
      <h1 id="hero-title" className="font-display text-display uppercase text-on-deep">
        {live ? (
          <>
            <span data-num>{total}</span> used cars in <Underlined>Jammu</Underlined>
          </>
        ) : (
          <>
            Used cars in <Underlined>Jammu</Underlined>
          </>
        )}
      </h1>

      {live ? (
        <>
          <p className="mt-4 text-body text-on-deep-2 md:text-body-lg">
            Our own photos, recorded kilometres and asking prices, straight from the stock list.
          </p>

          <form
            action="/inventory"
            method="get"
            role="search"
            aria-label="Search used cars"
            className="mt-6"
          >
            <div className="flex gap-2">
              <label className="relative block min-w-0 flex-1">
                <span className="sr-only">Search make or model</span>
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-3.5 hidden items-center text-body-lg text-ink-2 sm:flex"
                >
                  <SearchGlyph />
                </span>
                <input
                  type="search"
                  name="q"
                  placeholder="Search make or model"
                  autoComplete="off"
                  enterKeyHint="search"
                  className={`${fieldClass} appearance-none pl-3.5 pr-3 sm:pl-11`}
                />
              </label>
              <Button type="submit" variant="bright" size="lg" className="px-4 md:px-7">
                Search
              </Button>
            </div>

            <details className="group mt-2">
              <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 text-button text-on-deep [&::-webkit-details-marker]:hidden">
                More filters
                <ChevronGlyph
                  direction="down"
                  className="transition-transform duration-(--duration-2) group-open:rotate-180"
                />
              </summary>
              <div className="grid grid-cols-1 gap-3 pb-1 pt-2 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1.5 block text-label text-on-deep">Make</span>
                  <select name="make" defaultValue="" className={`${fieldClass} px-3`}>
                    <option value="">Any make</option>
                    {facets.makes.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label} ({m.count})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-label text-on-deep">Body type</span>
                  <select name="body" defaultValue="" className={`${fieldClass} px-3`}>
                    <option value="">Any body type</option>
                    {facets.bodyTypes.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label} ({b.count})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-label text-on-deep">Budget</span>
                  <select name="budget" defaultValue="" className={`${fieldClass} px-3`}>
                    <option value="">Any budget</option>
                    {budgets.map((b) => (
                      <option key={b} value={b}>
                        Under ₹{b} lakh
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </details>
          </form>
        </>
      ) : (
        <>
          <p className="mt-4 text-body text-on-deep-2 md:text-body-lg">
            The live stock list is not loading right now. The cars are still here — call or
            message and we will tell you what is available today.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="bright" size="lg">
              <a href={`tel:${PRIMARY_LOCATION.phoneE164}`} data-track-location="home-hero">
                Call {PRIMARY_LOCATION.phone}
              </a>
            </Button>
            <Button asChild variant="onDeep" size="lg">
              <a
                href={whatsappUrl(
                  "Hi AM Group, what used cars do you have in stock in Jammu today?",
                )}
                target="_blank"
                rel="noopener noreferrer"
                data-track-location="home-hero"
              >
                WhatsApp
              </a>
            </Button>
          </div>
        </>
      )}
    </PhotoHero>
  )
}
