"use client"

import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import type { InventoryVehicle } from "@/lib/inventory/types"
import { Button } from "@/components/ui/button"

/**
 * The only interactive control on the marque sheet.
 *
 * Kept as a leaf client component so the page itself stays a server component
 * (its H1, copy, FAQ answers and internal links are all SEO-load-bearing and
 * must be in the served HTML). The lead itself still flows through the shared
 * useEnquiryModal → submitLead path, with the same intent and source label the
 * inventory grid has always reported.
 */
export function EnquireButton({ vehicle }: { vehicle: InventoryVehicle }) {
  const onOpen = useEnquiryModal((s) => s.onOpen)
  const name = `${vehicle.year ? `${vehicle.year} ` : ""}${vehicle.title}`

  return (
    <Button
      type="button"
      variant="primary"
      onClick={() => onOpen(vehicle, { intent: "Vehicle Enquiry", sourceLabel: "inventory-grid" })}
      aria-label={`Enquire about the ${name}`}
      className="flex-1"
    >
      Enquire
    </Button>
  )
}
