"use client"

import Image from "next/image"
import Link from "next/link"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import type { InventoryVehicle } from "@/lib/inventory/types"
import { SectionHead, Settle } from "@/components/system/marks"
import { Button } from "@/components/ui/button"

/**
 * Stock held against a branch sheet.
 *
 * The only client island on the branch page: the enquire button opens the
 * shared enquiry modal (useEnquiryModal / submitLead), which cannot be wired
 * from the server component the page otherwise is. Everything else — NAP,
 * hours, schedule of works, the FAQ — stays server-rendered.
 */
export function StockRail({
  vehicles,
  total,
  city,
}: {
  vehicles: InventoryVehicle[]
  total: number
  city: string
}) {
  const { onOpen } = useEnquiryModal()

  if (vehicles.length === 0) return null

  return (
    <section
      aria-labelledby="stock-title"
      data-ground="deep"
      className="bg-ink py-20 text-on-deep md:py-24"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <SectionHead
          tone="print"
          label={`Stock manifest — ${total} cars`}
          heading={<span id="stock-title">Cars you can see in {city}</span>}
          lede="Certified pre-owned stock is held centrally in Jammu. The photographs are of that exact car and the kilometres are the intake reading."
        />
      </div>

      <div
        className="no-scrollbar mt-12 overflow-x-auto overscroll-x-contain"
        role="region"
        aria-label="Certified pre-owned stock, horizontally scrollable"
        tabIndex={0}
      >
        <ul className="flex w-max gap-px bg-line-on-deep px-5 md:px-10">
          {vehicles.map((v, i) => (
            <li key={v.id} className="w-[270px] shrink-0 bg-ink md:w-[300px]">
              <Settle delay={Math.min(i * 0.05, 0.3)} className="flex h-full flex-col">
                <Link href={`/inventory/${v.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-deep-2">
                    {v.primaryImage ? (
                      <Image
                        src={v.primaryImage}
                        alt={`${v.year ?? ""} ${v.title}`.trim()}
                        fill
                        sizes="300px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-meta uppercase text-on-deep-2">
                        Photo pending
                      </span>
                    )}
                    <span data-num className="absolute left-3 top-3 bg-ink px-2 py-1 text-meta text-on-deep">
                      {String(i + 1).padStart(2, "0")} / {vehicles.length}
                    </span>
                  </div>
                  <div className="px-4 pt-4">
                    <p className="truncate font-display text-h3 uppercase text-on-deep transition-colors duration-(--duration-1) group-hover:text-accent-text-dark">
                      {v.year ? `${v.year} ` : ""}
                      {v.title}
                    </p>
                    <p className="mt-1 text-meta uppercase text-on-deep-2">
                      {[v.mileageLabel, v.fuel, v.transmission].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </Link>
                <div className="mt-auto flex items-center justify-between gap-3 px-4 pb-4 pt-3">
                  <span data-num className="font-display text-h2 text-on-deep">
                    {v.priceLabel}
                  </span>
                  <Button
                    type="button"
                    variant="onDeep"
                    onClick={() => onOpen(v, { intent: "Vehicle Enquiry", sourceLabel: "branch-stock" })}
                  >
                    Enquire
                  </Button>
                </div>
              </Settle>
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-10 max-w-[1400px] px-5 md:px-10">
        <Button asChild variant="primary" size="lg">
          <Link href="/inventory">Open the full manifest — {total} cars</Link>
        </Button>
      </div>
    </section>
  )
}
