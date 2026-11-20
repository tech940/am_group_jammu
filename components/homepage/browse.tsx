import Link from "@/components/system/intent-link"
import type { InventoryFacets, InventoryVehicle } from "@/lib/inventory/types"
import { underBudget, type Facet } from "@/lib/seo/landing"
import { SectionHead, StoreBand } from "./section-head"

/**
 * Shop by budget, body type, make and fuel — the four ways people actually
 * narrow a used-car search.
 *
 * Every link carries the count of cars behind it, computed from today's
 * stock, and a link with nothing behind it is not rendered.
 *
 * WHERE THE LINKS GO. To the page built for that search: /brands/<make> for a
 * make, /used-cars/<...> for a budget, body type, fuel or gearbox. Those pages
 * name the search in their title and heading and are indexed. A filter URL on
 * /inventory shows the same cars but is kept out of the index, so it is used
 * only when no such page exists today (`landingHref` returns null).
 *
 * Chips, not rows. The previous version listed every option as a full-width
 * 48px row, which on a phone was some twenty rows stacked — the longest band
 * on the page. Chips wrap, so the same links take a quarter of the height and
 * each is still a 44px target.
 */
const BUDGETS = [3, 5, 7, 10, 15]

function Group({
  title,
  items,
}: {
  title: string
  items: { label: string; count: number; href: string }[]
}) {
  if (items.length === 0) return null
  return (
    <div>
      <h3 className="font-display text-h3 uppercase text-ink">{title}</h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="inline-flex min-h-11 items-center gap-2.5 rounded-sm border border-line-strong bg-surface px-3.5 text-body text-ink transition-colors duration-(--duration-1) hover:border-accent hover:text-accent"
            >
              {item.label}
              <span className="text-small text-ink-2" data-num>
                {item.count}
                <span className="sr-only">{item.count === 1 ? " car" : " cars"}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Browse({
  facets,
  vehicles,
  landingHref,
}: {
  facets: InventoryFacets
  vehicles: InventoryVehicle[]
  /** From lib/seo/landing.ts: the indexable page for a facet, or null. */
  landingHref: (facet: Facet) => string | null
}) {
  const q = (k: string, v: string) => `/inventory?${k}=${encodeURIComponent(v)}`
  const priced = vehicles.filter((v) => v.price !== null)

  const budgets = BUDGETS.map((b) => ({
    label: `Under ₹${b} lakh`,
    // "Under" is less than the figure, the rule the linked page picks its cars by.
    count: priced.filter((v) => underBudget(v, b * 100_000)).length,
    href: landingHref({ kind: "budget", lakhs: b }) ?? q("budget", String(b)),
  })).filter((b) => b.count > 0 && b.count < vehicles.length)

  const bodies = facets.bodyTypes.map((b) => ({
    label: b.label,
    count: b.count,
    href: landingHref({ kind: "body", value: b.value }) ?? q("bodyType", b.value),
  }))
  const makes = facets.makes.map((m) => ({
    label: m.label,
    count: m.count,
    href: landingHref({ kind: "make", value: m.value }) ?? q("make", m.value),
  }))
  const fuels = [
    ...facets.fuels.map((f) => ({
      label: f.label,
      count: f.count,
      href: landingHref({ kind: "fuel", value: f.value }) ?? q("fuel", f.value),
    })),
    ...facets.transmissions.map((t) => ({
      label: t.label,
      count: t.count,
      href: landingHref({ kind: "transmission", value: t.value }) ?? q("transmission", t.value),
    })),
  ]

  return (
    <StoreBand ground="ground" labelledBy="browse-title" id="browse">
      <SectionHead
        id="browse-title"
        title="Find your car"
        lede="The number on each button is how many cars match in today's stock."
      />
      <div className="mt-7 grid grid-cols-1 gap-x-12 gap-y-7 md:mt-10 md:grid-cols-2 md:gap-y-10">
        <Group title="By budget" items={budgets} />
        <Group title="By body type" items={bodies} />
        <Group title="By make" items={makes} />
        <Group title="By fuel and gearbox" items={fuels} />
      </div>
    </StoreBand>
  )
}
