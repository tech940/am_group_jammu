"use client"

import { VehicleCard } from "@/components/ui/vehicle-card"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import type { InventoryVehicle } from "@/lib/inventory/types"

/**
 * The stock rail: the one client leaf on every page that shows live cars.
 *
 * It exists for one reason — VehicleCard's "Enquire" needs the shared enquiry
 * store — so the enclosing band, its heading, its copy and its links all stay
 * server-rendered. `sourceLabel` is what the resulting lead is tagged with, so
 * the homepage rail and the automobile rail are distinguishable in the CRM. The rail keeps physical card scale and scrolls sideways on
 * phones rather than shrinking to unreadable thumbnails (DESIGN.md, Layout),
 * which is why it carries the full scroll-region contract: role, label, and a
 * tab stop so a keyboard can reach the overflow.
 */
export function StockRail({
  vehicles,
  sourceLabel = "stock-rail",
  label = "Certified used cars currently in stock",
}: {
  vehicles: InventoryVehicle[]
  sourceLabel?: string
  /** Names the scroll region. Two rails on one page must not share a name. */
  label?: string
}) {
  const onOpen = useEnquiryModal((s) => s.onOpen)

  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className="no-scrollbar overscroll-x-contain -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 md:-mx-10 md:px-10"
    >
      {vehicles.map((vehicle, index) => (
        <div key={vehicle.id} className="w-[300px] shrink-0 snap-start sm:w-[340px]">
          <VehicleCard
            vehicle={vehicle}
            index={index}
            onEnquire={(v) =>
              onOpen(v, { intent: "Vehicle Enquiry", sourceLabel })
            }
          />
        </div>
      ))}
    </div>
  )
}
