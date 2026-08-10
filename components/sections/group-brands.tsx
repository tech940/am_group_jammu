"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ImageOff } from "lucide-react"
import type { InventoryVehicle } from "@/lib/inventory/types"

/**
 * "Explore by Body Style", built from live stock.
 *
 * Counts and cover images are real: the counts previously shown here ("45
 * Vehicles", "32 Vehicles"…) were hardcoded and unrelated to actual inventory.
 */
export function GroupBrands({
  byBodyType,
}: {
  byBodyType: { label: string; slug: string; count: number; vehicles: InventoryVehicle[] }[]
}) {
  if (byBodyType.length === 0) return null

  return (
    <section className="py-20 bg-white border-t border-black/5">
      <div className="container mx-auto px-4 md:px-8">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-[#023468]">
              Explore by Body Style
            </h2>
            <p className="text-black/60 text-sm font-medium mt-1">
              Find the perfect category tailored to your driving style.
            </p>
          </div>
          <Link
            href="/inventory"
            className="text-xs font-extrabold uppercase tracking-widest text-[#023468] hover:text-[#E31837] transition-colors flex items-center gap-1.5"
          >
            <span>View All Inventory</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {byBodyType.slice(0, 4).map((style, idx) => {
            const cover = style.vehicles.find((v) => v.primaryImage)?.primaryImage ?? null
            return (
              <motion.div
                key={style.slug}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Link
                  href={`/inventory?bodyType=${encodeURIComponent(style.label)}`}
                  className="group block"
                >
                  <div className="bg-white rounded-[28px] overflow-hidden border border-black/10 shadow-sm hover:shadow-xl transition-all duration-500">
                    <div className="relative h-48 w-full bg-zinc-100 overflow-hidden">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={`${style.label} cars available at AM Group Jammu`}
                          fill
                          sizes="(max-width: 768px) 100vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-black/20">
                          <ImageOff className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    <div className="p-6 text-left">
                      <h3 className="text-lg font-extrabold text-[#023468] group-hover:text-[#E31837] transition-colors">
                        {style.label}
                      </h3>
                      <p className="text-xs font-bold text-black/50 mt-1">
                        {style.count} {style.count === 1 ? "vehicle" : "vehicles"} in stock
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
