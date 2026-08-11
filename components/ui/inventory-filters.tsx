"use client"

import { useId, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronGlyph } from "@/components/system/marks"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { countActiveFilters } from "@/store/use-inventory-store"
import type { InventoryFilterState, Range } from "@/store/use-inventory-store"
import type { FacetValue, InventoryFacets } from "@/lib/inventory/types"
import { formatINRShort } from "@/lib/inventory/adapter"

/**
 * Every option below is derived from the vehicles currently in stock, so the
 * panel can never offer a filter that returns nothing. Sections with no data
 * are not rendered at all.
 *
 * The overlay is a `Dialog`, which owns the focus trap, Escape, scroll lock,
 * focus restoration and `role="dialog"` wiring this panel previously had none of.
 */

function ChipSelect({
  items,
  selected,
  onSelect,
}: {
  items: FacetValue[]
  selected: string
  onSelect: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isActive = selected === item.value
        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(item.value)}
            className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-sm border px-3.5 text-meta uppercase transition-colors duration-(--duration-1) ${
              isActive
                ? "border-deep bg-deep text-on-deep"
                : "border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink"
            }`}
          >
            {item.label}
            <span data-num className={isActive ? "text-on-deep-2" : "text-ink-3"}>
              {item.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function CollapsibleSection({
  title,
  subtitle,
  defaultOpen = true,
  children,
}: {
  title: string
  subtitle?: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const panelId = useId()

  return (
    <div className="border border-line bg-surface">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-(--duration-1) hover:bg-ground-2"
      >
        <span className="min-w-0">
          <span className="block text-meta uppercase text-ink">{title}</span>
          {subtitle && <span className="mt-0.5 block text-caption text-ink-2">{subtitle}</span>}
        </span>
        <ChevronGlyph direction={isOpen ? "up" : "down"} className="text-ink-2" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-line px-5 pb-5 pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Dual-thumb range bounded by the real min/max of the current inventory. */
function RangeSlider({
  value,
  onChange,
  min,
  max,
  step,
  format,
}: {
  value: Range | null
  onChange: (value: Range | null) => void
  min: number
  max: number
  step: number
  format: (n: number) => string
}) {
  const [lo, hi] = value ?? [min, max]
  const span = Math.max(1, max - min)
  const leftPct = ((lo - min) / span) * 100
  const widthPct = ((hi - lo) / span) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 rounded-sm border border-line bg-ground px-4 py-2.5 text-center">
          <span className="block text-meta uppercase text-ink-2">Min</span>
          <span data-num className="text-h4 text-ink">
            {format(lo)}
          </span>
        </div>
        <div className="h-px w-4 flex-shrink-0 bg-line-strong" />
        <div className="flex-1 rounded-sm border border-line bg-ground px-4 py-2.5 text-center">
          <span className="block text-meta uppercase text-ink-2">Max</span>
          <span data-num className="text-h4 text-ink">
            {format(hi)}
          </span>
        </div>
      </div>

      {/* 44px tall so both thumbs are reachable on a phone. */}
      <div className="relative h-11">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-sm bg-ground-2">
          <div
            className="absolute h-full rounded-sm bg-deep"
            style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
          />
        </div>
        <input
          type="range" min={min} max={max} step={step} value={lo}
          aria-label="Minimum"
          onChange={(e) => {
            const next = Math.min(Number(e.target.value), hi)
            onChange([next, hi])
          }}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          style={{ zIndex: lo > (min + max) / 2 ? 5 : 4 }}
        />
        <input
          type="range" min={min} max={max} step={step} value={hi}
          aria-label="Maximum"
          onChange={(e) => {
            const next = Math.max(Number(e.target.value), lo)
            onChange([lo, next])
          }}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          style={{ zIndex: hi <= (min + max) / 2 ? 5 : 4 }}
        />
        <div
          className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-sm border-2 border-deep bg-surface"
          style={{ left: `calc(${leftPct}% - 10px)` }}
        />
        <div
          className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-sm border-2 border-deep bg-surface"
          style={{ left: `calc(${leftPct + widthPct}% - 10px)` }}
        />
      </div>

      {value !== null && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="inline-flex min-h-11 cursor-pointer items-center text-meta uppercase text-accent-text-light transition-colors duration-(--duration-1) hover:underline"
        >
          Clear this range
        </button>
      )}
    </div>
  )
}

/** Split a numeric span into readable buckets that each contain stock. */
function buildBuckets(min: number, max: number, format: (n: number) => string): { label: string; range: Range }[] {
  if (max <= min) return []
  const steps = 4
  const size = Math.ceil((max - min) / steps)
  const out: { label: string; range: Range }[] = []
  for (let i = 0; i < steps; i++) {
    const lo = min + i * size
    const hi = i === steps - 1 ? max : lo + size - 1
    if (lo > max) break
    out.push({ label: `${format(lo)} – ${format(hi)}`, range: [lo, hi] })
  }
  return out
}

const BUCKET_CHIP =
  "inline-flex min-h-11 cursor-pointer items-center rounded-sm border border-line bg-ground px-3 text-caption text-ink-2 transition-colors duration-(--duration-1) hover:border-line-strong hover:text-ink"

export function InventoryFilters({
  isOpen,
  onClose,
  facets,
  resultCount,
  filters,
  onToggleFilter,
  onSetFilter,
  onReset,
}: {
  isOpen: boolean
  onClose: () => void
  facets: InventoryFacets
  resultCount: number
  filters: InventoryFilterState
  onToggleFilter: (key: keyof InventoryFilterState, value: string) => void
  onSetFilter: <K extends keyof InventoryFilterState>(key: K, value: InventoryFilterState[K]) => void
  onReset: () => void
}) {
  const activeCount = countActiveFilters(filters)

  const handleReset = () => onReset()

  const chip = (key: keyof InventoryFilterState) => (value: string) =>
    onToggleFilter(key, value)

  const priceBuckets = buildBuckets(facets.priceRange.min, facets.priceRange.max, formatINRShort)
  const mileageBuckets = buildBuckets(
    facets.mileageRange.min,
    facets.mileageRange.max,
    (n) => `${Math.round(n / 1000)}k`,
  )

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="Filters"
      description={
        activeCount > 0 ? `${activeCount} active • ${resultCount} match` : `${resultCount} cars in stock`
      }
      size="sm"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleReset}>
            Reset All
          </Button>
          <Button type="button" variant="primary" onClick={onClose}>
            Show {resultCount} {resultCount === 1 ? "car" : "cars"}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {facets.makes.length > 0 && (
          <CollapsibleSection title="Make" subtitle="Brands in stock">
            <ChipSelect items={facets.makes} selected={filters.make} onSelect={chip("make")} />
          </CollapsibleSection>
        )}

        {facets.models.length > 0 && (
          <CollapsibleSection title="Model" subtitle="Specific models available" defaultOpen={false}>
            <ChipSelect items={facets.models} selected={filters.model} onSelect={chip("model")} />
          </CollapsibleSection>
        )}

        {facets.bodyTypes.length > 0 && (
          <CollapsibleSection title="Body Type" subtitle="Body style">
            <ChipSelect items={facets.bodyTypes} selected={filters.bodyType} onSelect={chip("bodyType")} />
          </CollapsibleSection>
        )}

        {facets.priceRange.max > facets.priceRange.min && (
          <CollapsibleSection title="Price" subtitle={`${formatINRShort(facets.priceRange.min)} – ${formatINRShort(facets.priceRange.max)}`}>
            <RangeSlider
              value={filters.priceRange}
              onChange={(v) => onSetFilter("priceRange", v)}
              min={facets.priceRange.min}
              max={facets.priceRange.max}
              step={10000}
              format={formatINRShort}
            />
            <div className="flex flex-wrap gap-2 pt-3">
              {priceBuckets.map((b) => (
                <button key={b.label} type="button" data-num onClick={() => onSetFilter("priceRange", b.range)}
                  className={BUCKET_CHIP}>
                  {b.label}
                </button>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {facets.years.length > 0 && (
          <CollapsibleSection title="Year" subtitle={`${facets.yearRange.min} – ${facets.yearRange.max}`} defaultOpen={false}>
            <ChipSelect
              items={facets.years}
              selected={filters.yearRange ? String(filters.yearRange[0]) : ""}
              onSelect={(value) => {
                const y = Number(value)
                const already = filters.yearRange?.[0] === y && filters.yearRange?.[1] === y
                onSetFilter("yearRange", already ? null : [y, y])
              }}
            />
          </CollapsibleSection>
        )}

        {facets.fuels.length > 0 && (
          <CollapsibleSection title="Fuel" subtitle="Powertrain" defaultOpen={false}>
            <ChipSelect items={facets.fuels} selected={filters.fuel} onSelect={chip("fuel")} />
          </CollapsibleSection>
        )}

        {facets.transmissions.length > 0 && (
          <CollapsibleSection title="Transmission" subtitle="Gearbox" defaultOpen={false}>
            <ChipSelect items={facets.transmissions} selected={filters.transmission} onSelect={chip("transmission")} />
          </CollapsibleSection>
        )}

        {facets.conditions.length > 0 && (
          <CollapsibleSection title="Condition" subtitle="Certification status" defaultOpen={false}>
            <ChipSelect items={facets.conditions} selected={filters.condition} onSelect={chip("condition")} />
          </CollapsibleSection>
        )}

        {facets.mileageRange.max > facets.mileageRange.min && (
          <CollapsibleSection title="KMs Driven" subtitle={`${facets.mileageRange.min.toLocaleString("en-IN")} – ${facets.mileageRange.max.toLocaleString("en-IN")} km`} defaultOpen={false}>
            <RangeSlider
              value={filters.mileageRange}
              onChange={(v) => onSetFilter("mileageRange", v)}
              min={facets.mileageRange.min}
              max={facets.mileageRange.max}
              step={1000}
              format={(n) => `${n.toLocaleString("en-IN")} km`}
            />
            <div className="flex flex-wrap gap-2 pt-3">
              {mileageBuckets.map((b) => (
                <button key={b.label} type="button" data-num onClick={() => onSetFilter("mileageRange", b.range)}
                  className={BUCKET_CHIP}>
                  {b.label} km
                </button>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {facets.colours.length > 0 && (
          <CollapsibleSection title="Colour" subtitle="Exterior colour" defaultOpen={false}>
            <ChipSelect items={facets.colours} selected={filters.colour} onSelect={chip("colour")} />
          </CollapsibleSection>
        )}

        <p className="pb-2 text-center text-meta uppercase text-ink-3">
          Options reflect live stock at AM Group Jammu
        </p>
      </div>
    </Dialog>
  )
}
