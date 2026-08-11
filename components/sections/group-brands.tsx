"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowGlyph, Settle } from "@/components/system/marks"
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
    <section className="border-t border-line bg-ground">
      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-28">

        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-display text-h2 uppercase text-ink">
              Explore by Body Style
            </h2>
            <p className="mt-2 text-body text-ink-2">
              Find the perfect category tailored to your driving style.
            </p>
          </div>
          <Link
            href="/inventory"
            className="inline-flex min-h-11 items-center gap-2 text-meta uppercase text-ink transition-colors duration-(--duration-1) hover:text-accent-text-light"
          >
            <span>View All Inventory</span>
            <ArrowGlyph />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {byBodyType.slice(0, 4).map((style, idx) => {
            const cover = style.vehicles.find((v) => v.primaryImage)?.primaryImage ?? null
            return (
              <Settle key={style.slug} delay={idx * 0.08} className="h-full">
                <Link
                  href={`/inventory?bodyType=${encodeURIComponent(style.label)}`}
                  className="group block h-full"
                >
                  <article className="flex h-full flex-col border border-line bg-surface transition-colors duration-(--duration-1) group-hover:border-line-strong">
                    <div className="relative h-48 w-full overflow-hidden bg-ground-2">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={`${style.label} cars available at AM Group Jammu`}
                          fill
                          sizes="(max-width: 768px) 100vw, 25vw"
                          className="object-cover"
                        />
                      ) : (
                        /* Missing photography is declared, never faked. */
                        <span className="absolute inset-0 flex items-center justify-center text-meta uppercase text-ink-3">
                          No photograph
                        </span>
                      )}
                    </div>

                    <div className="p-6 text-left">
                      <h3 className="font-display text-h3 uppercase text-ink transition-colors duration-(--duration-1) group-hover:text-accent-text-light">
                        {style.label}
                      </h3>
                      <p className="mt-1 text-small text-ink-2" data-num>
                        {style.count} {style.count === 1 ? "vehicle" : "vehicles"} in stock
                      </p>
                    </div>
                  </article>
                </Link>
              </Settle>
            )
          })}
        </div>

      </div>
    </section>
  )
}
