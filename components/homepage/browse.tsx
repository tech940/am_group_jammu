import Link from "next/link"
import { Band, Head } from "@/components/system/page-kit"
import type { InventoryFacets, InventoryVehicle } from "@/lib/inventory/types"

/**
 * Shop by budget, body type, make and fuel — the four ways people actually
 * narrow a used-car search.
 *
 * Every link carries the count of cars behind it, computed from today's
 * stock, and a link with nothing behind it is not rendered. Budget, body and
 * fuel go to /inventory with the same query parameters the hero form uses;
 * makes go to their /brands page, which is the indexable landing for that
 * make.
 *
 * Four lists, deliberately not four matching cards: the lists are different
 * lengths because the stock is, and padding them to match would mean
 * inventing rows.
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
      <h3 className="border-b border-line-strong pb-3 text-meta uppercase text-ink-2">{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group flex min-h-12 items-center justify-between gap-4 border-b border-line py-3 transition-colors duration-(--duration-1) hover:bg-surface"
            >
              <span className="font-display text-h4 uppercase text-ink transition-colors duration-(--duration-1) group-hover:text-accent">
                {item.label}
              </span>
              <span className="shrink-0 text-small text-ink-2" data-num>
                {item.count} {item.count === 1 ? "car" : "cars"}
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
}: {
  facets: InventoryFacets
  vehicles: InventoryVehicle[]
}) {
  const q = (k: string, v: string) => `/inventory?${k}=${encodeURIComponent(v)}`
  const priced = vehicles.filter((v) => v.price !== null)

  const budgets = BUDGETS.map((b) => ({
    label: `Under ₹${b} lakh`,
    count: priced.filter((v) => (v.price as number) <= b * 100_000).length,
    href: q("budget", String(b)),
  })).filter((b) => b.count > 0 && b.count < vehicles.length)

  const bodies = facets.bodyTypes.map((b) => ({
    label: b.label,
    count: b.count,
    href: q("body", b.value),
  }))
  const makes = facets.makes.map((m) => ({
    label: m.label,
    count: m.count,
    href: `/brands/${m.value.toLowerCase().replace(/\s+/g, "-")}`,
  }))
  const fuels = [
    // The feed calls petrol "Gasoline"; nobody in Jammu does. Display only —
    // the link still carries the feed's own value, which is what filters.
    ...facets.fuels.map((f) => ({
      label: /^gasoline$/i.test(f.label) ? "Petrol" : f.label,
      count: f.count,
      href: q("fuel", f.value),
    })),
    ...facets.transmissions.map((t) => ({
      label: t.label,
      count: t.count,
      href: q("transmission", t.value),
    })),
  ]

  return (
    <Band ground="ground-2" labelledBy="browse-title" id="browse">
      <Head
        id="browse-title"
        label="Find your car"
        title="Start with what matters to you"
        lede="Counts are from today's stock. If a number is here, those cars are on the forecourt right now."
      />
      <div className="mt-12 grid grid-cols-1 gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        <Group title="By budget" items={budgets} />
        <Group title="By body type" items={bodies} />
        <Group title="By make" items={makes} />
        <Group title="By fuel and gearbox" items={fuels} />
      </div>
    </Band>
  )
}
