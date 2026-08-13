"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import type { InventoryVehicle } from "@/lib/inventory/types"

export function WorldclassInventoryRail({ vehicles, total }: { vehicles: InventoryVehicle[]; total: number }) {
  const display = vehicles?.length > 0 ? vehicles.slice(0, 4) : []

  return (
    <section className="bg-[#F5F5F5] py-24 px-6 md:px-14">
      <div className="max-w-7xl mx-auto">

        {/* Header row */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[11px] font-mono tracking-[0.3em] text-[#999999] uppercase mb-3">
              Certified Pre-Owned
            </p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#111111]">
              {total > 0 ? total : 27} vehicles in stock
            </h2>
          </div>
          <Link
            href="/inventory"
            className="text-[11px] font-bold uppercase tracking-widest text-[#111111] hover:text-[#1D4ED8] underline underline-offset-4 transition-colors duration-200 hidden sm:block"
          >
            View all
          </Link>
        </div>

        {display.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#DDDDDD]">
            {display.map((car) => (
              <Link
                key={car.id}
                href={`/inventory/${car.slug}`}
                className="bg-white group flex flex-col hover:bg-[#F9F9F9] transition-colors duration-200"
              >
                {/* Photo */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EEEEEE]">
                  {car.primaryImage ? (
                    <Image
                      src={car.primaryImage}
                      alt={car.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#CCCCCC] text-xs font-mono">
                      No image
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <p className="text-[11px] font-mono text-[#999999] mb-2 uppercase tracking-widest">
                      {car.bodyType || "Certified"} &middot; {car.fuel || "Petrol"}
                    </p>
                    <h3 className="text-base font-bold text-[#111111] leading-snug mb-1">
                      {car.year} {car.make} {car.model}
                    </h3>
                    <p className="text-[11px] text-[#999999]">{car.mileageLabel || "—"}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#EEEEEE]">
                    <span className="text-lg font-black text-[#111111]">{car.priceLabel}</span>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#999999] group-hover:text-[#1D4ED8] transition-colors duration-200">
                      Details →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-[#999999] text-sm font-mono mb-6">Inventory loading&hellip;</p>
            <Link
              href="/inventory"
              className="bg-[#1D4ED8] hover:bg-[#1e40af] text-white px-8 py-4 text-sm font-bold uppercase tracking-widest transition-colors duration-200 inline-block"
            >
              Open Inventory
            </Link>
          </div>
        )}

        {/* Mobile view all */}
        <div className="mt-8 sm:hidden">
          <Link
            href="/inventory"
            className="block text-center text-sm font-bold uppercase tracking-widest text-[#111111] hover:text-[#1D4ED8] underline underline-offset-4 transition-colors duration-200 py-4"
          >
            View all {total > 0 ? total : 27} vehicles
          </Link>
        </div>

      </div>
    </section>
  )
}
