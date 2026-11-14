import Link from "next/link"
import { Band } from "@/components/system/page-kit"
import type { InventoryFacets, InventoryVehicle } from "@/lib/inventory/types"
import { SectionHead, TIGHT_BAND } from "./section-head"

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
          <li key={item.href}>
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
    ...facets.fuels.map((f) => ({ label: f.label, count: f.count, href: q("fuel", f.value) })),
    ...facets.transmissions.map((t) => ({
      label: t.label,
      count: t.count,
      href: q("transmission", t.value),
    })),
  ]

  return (
    <Band ground="ground" labelledBy="browse-title" id="browse" className={TIGHT_BAND}>
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
    </Band>
  )
}
