"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { VehicleCard } from "@/components/ui/vehicle-card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/feedback"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import type { InventoryVehicle } from "@/lib/inventory/types"

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
  subtitle = "Explore our handpicked collection of certified pre-owned vehicles.",
  emptyMessage = "No vehicles match this selection right now.",
  limit,
  className = "py-20 md:py-28 bg-ground",
}: {
  vehicles: InventoryVehicle[]
  title?: string
  subtitle?: string
  emptyMessage?: string
  limit?: number
  className?: string
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
            <Link href="/inventory">View All Inventory</Link>
          </Button>
        </div>

        {shown.length === 0 ? (
          <EmptyState
            title="Nothing in stock here yet"
            description={emptyMessage}
            action={
              <Button asChild variant="primary">
                <Link href="/inventory">Browse Full Inventory</Link>
              </Button>
            }
            className="max-w-md mx-auto"
          />
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {shown.map((vehicle, index) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  index={index}
                  onEnquire={(v) => onOpen(v, { intent: "Vehicle Enquiry", sourceLabel: "inventory-grid" })}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

      </div>
    </section>
  )
}
