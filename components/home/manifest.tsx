"use client"

import Image from "next/image"
import Link from "next/link"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import type { InventoryVehicle } from "@/lib/inventory/types"
import { ArrowGlyph, TitleBlock } from "@/components/system/marks"
import { Settle } from "@/components/system/marks"

/**
 * Sheet 05 — current stock manifest.
 *
 * This is a corporate homepage, not a listing page, so the live inventory
 * appears as a manifest: a horizontal rail of real cars with the running
 * count, and one route into /inventory. Every row is a real vehicle from the
 * live scrape — photographs of that specific car, odometer as recorded.
 */

export function Manifest({
  vehicles,
  total,
  degraded,
}: {
  vehicles: InventoryVehicle[]
  total: number
  degraded: boolean
}) {
  const { onOpen } = useEnquiryModal()

  return (
    <section id="preowned" aria-labelledby="preowned-title" className="scroll-mt-16 bg-ink py-20 text-paper md:py-28">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <TitleBlock sheet="05" title="Current stock manifest" scale={degraded ? "sync down" : `${total} vehicles`} tone="print" />

        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <h2
            id="preowned-title"
            className="max-w-[18ch] font-display text-5xl font-bold uppercase leading-[0.95] md:text-7xl"
          >
            Certified pre-owned, <span className="text-redline-hi">counted live</span>
          </h2>
          <p className="max-w-[46ch] text-[15px] leading-relaxed text-paper/60">
            Every entry is a physical car in the Jammu flagship. The photographs are of that exact
            vehicle; the kilometres are the intake reading. This manifest updates as stock turns
            over.
          </p>
        </div>
      </div>

      {degraded || vehicles.length === 0 ? (
        <div className="mx-auto mt-12 max-w-[1400px] px-5 md:px-10">
          <div className="border border-paper/25 p-8">
            <p className="font-anno text-[12px] uppercase tracking-[0.12em] text-paper/70">
              Stock sync temporarily unavailable — the full manifest is at{" "}
              <Link href="/inventory" className="text-redline-hi underline-offset-4 hover:underline">
                /inventory
              </Link>
              , or call the flagship and we will read it to you.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div
            className="no-scrollbar mt-12 overflow-x-auto overscroll-x-contain"
            role="region"
            aria-label="Current pre-owned stock, horizontally scrollable"
            tabIndex={0}
          >
            <ul className="flex w-max gap-px bg-paper/20 px-5 md:px-10">
              {vehicles.map((v, i) => (
                <li key={v.id} className="w-[270px] shrink-0 bg-ink md:w-[300px]">
                  <Settle delay={Math.min(i * 0.05, 0.3)} className="flex h-full flex-col">
                    <Link href={`/inventory/${v.slug}`} className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-redline">
                      <div className="relative aspect-[4/3] overflow-hidden bg-print-deep">
                        {v.primaryImage ? (
                          <Image
                            src={v.primaryImage}
                            alt={`${v.year ?? ""} ${v.title}`.trim()}
                            fill
                            sizes="300px"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center font-anno text-[10px] uppercase tracking-[0.12em] text-paper/40">
                            Photo pending
                          </span>
                        )}
                        <span className="absolute left-3 top-3 bg-ink/85 px-2 py-1 font-anno text-[10px] text-paper">
                          {String(i + 1).padStart(2, "0")} / {vehicles.length}
                        </span>
                      </div>
                      <div className="px-4 pt-4">
                        <p className="truncate font-display text-xl font-semibold uppercase leading-tight text-paper group-hover:text-redline transition-colors">
                          {v.year ? `${v.year} ` : ""}
                          {v.title}
                        </p>
                        <p className="mt-1 font-anno text-[11px] uppercase tracking-[0.08em] text-paper/60">
                          {[v.mileageLabel, v.fuel, v.transmission].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </Link>
                    <div className="mt-auto flex items-center justify-between gap-3 px-4 pb-4 pt-3">
                      <span className="font-display text-2xl font-bold text-paper">{v.priceLabel}</span>
                      <button
                        type="button"
                        onClick={() => onOpen(v, { intent: "Vehicle Enquiry", sourceLabel: "home-manifest" })}
                        className="border border-paper/40 px-3 py-2 font-anno text-[10px] uppercase tracking-[0.1em] text-paper transition-colors hover:bg-redline hover:border-redline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-redline"
                      >
                        Enquire
                      </button>
                    </div>
                  </Settle>
                </li>
              ))}
            </ul>
          </div>

          <div className="mx-auto mt-10 max-w-[1400px] px-5 md:px-10">
            <Link
              href="/inventory"
              className="group inline-flex items-center gap-3 bg-redline px-7 py-4 font-anno text-[12px] uppercase tracking-[0.14em] text-paper transition-colors hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
            >
              Open the full manifest — {total} cars
              <ArrowGlyph className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </>
      )}
    </section>
  )
}
