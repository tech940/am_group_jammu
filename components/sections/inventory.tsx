"use client"

import Link from "@/components/system/intent-link"
import { VehicleCard } from "@/components/ui/vehicle-card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/feedback"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import type { InventoryVehicle } from "@/lib/inventory/types"
import { listItems } from "@/lib/analytics/events"
import { ListView } from "@/components/analytics/list-view"

/**
 * Vehicle grid used by the brand and city landing pages.
 *
 * It takes its listings as a prop so each caller can pass its own filtered set
 * — previously it rendered the same six hardcoded cars regardless of which
 * brand or city page was being viewed.
 */
export function FeaturedInventory({
  vehicles,
  title = "Featured Vehicles",
  subtitle = "Cars in stock at AM Group, Jammu.",
  emptyMessage = "No vehicles match this selection right now.",
  limit,
  className = "py-20 md:py-28 bg-ground",
  sourceLabel = "inventory-grid",
  listId,
  listName,
}: {
  vehicles: InventoryVehicle[]
  title?: string
  subtitle?: string
  emptyMessage?: string
  limit?: number
  className?: string
  /** What an enquiry from one of these cards is tagged with in the lead list. */
  sourceLabel?: string
  /**
   * Names this grid for measurement, e.g. "brand-kia" or "landing-suv-in-jammu".
   * When given, the grid is reported as a list when shown, and a click on one
   * of its cards is reported against the same list.
   */
  listId?: string
  /** What a person would call the list, e.g. "Used Kia cars". */
  listName?: string
}) {
  const { onOpen } = useEnquiryModal()
  const shown = typeof limit === "number" ? vehicles.slice(0, limit) : vehicles

  return (
    <section className={className}>
      <div className="container mx-auto px-4 md:px-8">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
          <div>
            <h2 className="font-display text-h1 text-ink">{title}</h2>
            <p className="text-body text-ink-2 mt-1">{subtitle}</p>
          </div>

          <Button asChild variant="link">
            <Link href="/inventory">All used cars in stock</Link>
          </Button>
        </div>

        {shown.length === 0 ? (
          <EmptyState
            title="Nothing in stock here yet"
            description={emptyMessage}
            action={
              <Button asChild variant="primary">
                <Link href="/inventory">All used cars in stock</Link>
              </Button>
            }
            className="max-w-md mx-auto"
          />
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            data-track-list={listId}
            data-track-list-name={listId ? (listName ?? listId) : undefined}
          >
            {listId && <ListView listId={listId} listName={listName} items={listItems(shown)} />}
            {/* A plain grid. It used to be wrapped in an animation library's
                layout container, which animated nothing here (the list never
                changes after load) and cost every landing page its download. */}
            {shown.map((vehicle, index) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                index={index}
                onEnquire={(v) => onOpen(v, { intent: "Vehicle Enquiry", sourceLabel })}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
