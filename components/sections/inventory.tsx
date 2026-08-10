"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Car } from "lucide-react"
import Link from "next/link"
import { VehicleCard } from "@/components/ui/vehicle-card"
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
  className = "py-20 md:py-28 bg-[#FAFAFA] relative overflow-hidden",
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
            <h2 className="text-3xl md:text-5xl font-black text-[#023468]">{title}</h2>
            <p className="text-black/60 text-sm md:text-base font-normal mt-1">{subtitle}</p>
          </div>

          <Link
            href="/inventory"
            className="text-xs font-extrabold uppercase tracking-widest text-[#023468] hover:text-[#E31837] transition-colors flex items-center gap-1.5"
          >
            <span>View All Inventory</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {shown.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-black/5 max-w-md mx-auto shadow-sm">
            <Car className="h-12 w-12 text-black/25 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-black mb-2">Nothing in stock here yet</h3>
            <p className="text-xs text-black/60 mb-6">{emptyMessage}</p>
            <Link
              href="/inventory"
              className="inline-block bg-[#023468] text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-[#E31837] transition-all"
            >
              Browse Full Inventory
            </Link>
          </div>
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
