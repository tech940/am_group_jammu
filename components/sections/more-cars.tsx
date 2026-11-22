import Link from "@/components/system/intent-link"
import { Button } from "@/components/ui/button"
import { FeaturedInventory } from "@/components/sections/inventory"
import { toCardVehicle } from "@/lib/inventory/filter"
import { MORE_CARS_BELOW, moreCarsFor } from "@/lib/inventory/similar"
import type { InventoryVehicle } from "@/lib/inventory/types"

/**
 * "Similar used cars in stock": up to four more cars from stock, then a
 * button to the full list. For a page whose own list is short (see
 * lib/inventory/similar.ts), so a visitor always has something more to open.
 *
 * Renders nothing when the page already lists enough cars, or when there is
 * nothing else in stock.
 */
export function MoreCars({
  shown,
  stock,
  listId,
  title = "Similar used cars in stock",
}: {
  /** The cars the page already lists; never repeated here. */
  shown: InventoryVehicle[]
  /** Everything on sale. */
  stock: InventoryVehicle[]
  /** Names this list for measurement, e.g. "more-brand-maruti-suzuki". */
  listId: string
  title?: string
}) {
  if (shown.length >= MORE_CARS_BELOW) return null
  const more = moreCarsFor(shown, stock)
  if (more.length === 0) return null

  return (
    <FeaturedInventory
      vehicles={more.map((v) => toCardVehicle(v))}
      title={title}
      subtitle={`Also in stock at AM Group, Jammu. ${stock.length} used ${stock.length === 1 ? "car" : "cars"} in all.`}
      className="border-t border-line bg-ground-2 py-12 md:py-16"
      sourceLabel="more-cars"
      listId={listId}
      listName={title}
      footer={<SeeAllButton total={stock.length} />}
    />
  )
}

/** The way on to the full list, with the real count so it promises something. */
export function SeeAllButton({ total }: { total: number }) {
  return (
    <Button asChild variant="primary" size="lg">
      <Link href="/inventory">
        See all {total} used {total === 1 ? "car" : "cars"}
      </Link>
    </Button>
  )
}
