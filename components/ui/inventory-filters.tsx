"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronDown, SlidersHorizontal, RotateCcw, Check, Car, Fuel, IndianRupee, Settings2, CalendarDays, Gauge, Palette, ShieldCheck, Shapes } from "lucide-react"
import { countActiveFilters } from "@/store/use-inventory-store"
import type { InventoryFilterState, Range } from "@/store/use-inventory-store"
import type { FacetValue, InventoryFacets } from "@/lib/inventory/types"
import { formatINRShort } from "@/lib/inventory/adapter"

/**
 * Every option below is derived from the vehicles currently in stock, so the
 * panel can never offer a filter that returns nothing. Sections with no data
 * are not rendered at all.
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
            onClick={() => onSelect(item.value)}
            className={`relative px-3.5 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider border transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-[#023468] text-white border-[#023468] shadow-md shadow-[#023468]/20"
                : "bg-white text-black/60 border-black/10 hover:border-[#023468]/40 hover:text-[#023468] hover:bg-[#023468]/5"
            }`}
          >
            {isActive && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#E31837] rounded-full flex items-center justify-center shadow">
                <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
              </span>
            )}
            {item.label}
            <span className={`ml-1.5 font-bold ${isActive ? "text-white/60" : "text-black/30"}`}>
              {item.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/** Maps a marketing colour name onto a swatch, falling back to a neutral dot. */
const SWATCHES: { test: RegExp; hex: string }[] = [
  { test: /white|ivory|polar|atlas|clear/i, hex: "#F5F5F5" },
  { test: /black|phantom|abyss|aurora|midnight/i, hex: "#111111" },
  { test: /silver|platinum/i, hex: "#C0C0C0" },
  { test: /grey|gray|titan|granite|star.?dust/i, hex: "#808080" },
  { test: /red|crimson|intense/i, hex: "#CC2200" },
  { test: /blue|imperial|starry|navy/i, hex: "#1A4FA8" },
  { test: /brown|bronze|copper/i, hex: "#7B3F00" },
  { test: /green|teal/i, hex: "#2D6A4F" },
  { test: /orange/i, hex: "#E2701E" },
  { test: /gold|beige|sand/i, hex: "#C9A227" },
]

function swatchFor(label: string): string {
  return SWATCHES.find((s) => s.test.test(label))?.hex ?? "#9CA3AF"
}

function ColourChipSelect({
  items,
  selected,
  onSelect,
}: {
  items: FacetValue[]
  selected: string
  onSelect: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map((item) => {
        const isActive = selected === item.value
        const hex = swatchFor(item.label)
        return (
          <button
            key={item.value}
            onClick={() => onSelect(item.value)}
            title={item.label}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all duration-200 cursor-pointer ${
              isActive
                ? "border-[#023468] bg-[#023468]/6 text-[#023468]"
                : "border-black/10 bg-white text-black/60 hover:border-[#023468]/30"
            }`}
          >
            <span
              className="h-3.5 w-3.5 rounded-full flex-shrink-0 border border-black/15"
              style={{ backgroundColor: hex }}
            />
            {item.label}
            <span className="text-black/30">{item.count}</span>
            {isActive && <Check className="h-3 w-3 text-[#023468]" strokeWidth={3} />}
          </button>
        )
      })}
    </div>
  )
}

function CollapsibleSection({
  icon,
  title,
  subtitle,
  defaultOpen = true,
  children,
}: {
  icon: React.ReactNode
  title: string
  subtitle?: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="bg-white rounded-2xl border border-black/8 overflow-hidden shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-50/80 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-[#023468]/8 flex items-center justify-center text-[#023468]">
            {icon}
          </div>
          <div className="text-left">
            <span className="text-[11px] font-black uppercase tracking-[0.15em] text-[#023468] block">{title}</span>
            {subtitle && <span className="text-[10px] text-black/35 font-medium">{subtitle}</span>}
          </div>
        </div>
        <div className={`h-7 w-7 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? "bg-[#023468] text-white rotate-180" : "bg-zinc-100 text-black/40"}`}>
          <ChevronDown className="h-3.5 w-3.5" />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-black/5">{children}</div>
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
        <div className="flex-1 bg-zinc-50 border border-black/8 rounded-xl px-4 py-2.5 text-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-black/35 block">Min</span>
          <span className="text-sm font-black text-[#023468]">{format(lo)}</span>
        </div>
        <div className="h-px w-4 bg-black/15 flex-shrink-0" />
        <div className="flex-1 bg-zinc-50 border border-black/8 rounded-xl px-4 py-2.5 text-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-black/35 block">Max</span>
          <span className="text-sm font-black text-[#023468]">{format(hi)}</span>
        </div>
      </div>

      <div className="relative pt-2 pb-4">
        <div className="relative h-1.5 bg-zinc-100 rounded-full">
          <div
            className="absolute h-full bg-[#023468] rounded-full"
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
          className="absolute left-0 right-0 top-2 w-full h-1.5 opacity-0 cursor-pointer"
          style={{ zIndex: lo > (min + max) / 2 ? 5 : 4 }}
        />
        <input
          type="range" min={min} max={max} step={step} value={hi}
          aria-label="Maximum"
          onChange={(e) => {
            const next = Math.max(Number(e.target.value), lo)
            onChange([lo, next])
          }}
          className="absolute left-0 right-0 top-2 w-full h-1.5 opacity-0 cursor-pointer"
          style={{ zIndex: hi <= (min + max) / 2 ? 5 : 4 }}
        />
        <div
          className="absolute h-5 w-5 rounded-full bg-white border-2 border-[#023468] shadow-md pointer-events-none"
          style={{ left: `calc(${leftPct}% - 10px)`, top: "0.375rem" }}
        />
        <div
          className="absolute h-5 w-5 rounded-full bg-white border-2 border-[#023468] shadow-md pointer-events-none"
          style={{ left: `calc(${leftPct + widthPct}% - 10px)`, top: "0.375rem" }}
        />
      </div>

      {value !== null && (
        <button
          onClick={() => onChange(null)}
          className="text-[10px] font-black uppercase tracking-widest text-[#E31837] hover:underline cursor-pointer"
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
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />

          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-[#f8f9fa] shadow-2xl z-[100] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-white border-b border-black/6 px-5 pt-5 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-[#023468] flex items-center justify-center shadow-lg shadow-[#023468]/20">
                    <SlidersHorizontal className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#023468] leading-none">Filters</h2>
                    <p className="text-[10px] text-black/40 font-semibold mt-0.5 uppercase tracking-widest">
                      {activeCount > 0 ? `${activeCount} active • ${resultCount} match` : `${resultCount} cars in stock`}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} aria-label="Close filters"
                  className="h-9 w-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors cursor-pointer">
                  <X className="h-4 w-4 text-black/60" />
                </button>
              </div>

              <div className="flex gap-2.5">
                <button onClick={handleReset}
                  className="flex items-center gap-1.5 flex-1 justify-center px-4 py-2.5 border border-black/10 rounded-xl bg-white hover:bg-zinc-50 text-[11px] font-black uppercase tracking-wider text-black/60 hover:text-black/80 transition-all cursor-pointer">
                  <RotateCcw className="h-3.5 w-3.5" /> Reset All
                </button>
                <button onClick={onClose}
                  className="flex items-center gap-1.5 flex-1 justify-center px-4 py-2.5 bg-[#023468] hover:bg-[#01254a] text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-[#023468]/25">
                  <Check className="h-3.5 w-3.5" /> Show {resultCount}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar">
              {facets.makes.length > 0 && (
                <CollapsibleSection icon={<Car className="h-4 w-4" />} title="Make" subtitle="Brands in stock">
                  <ChipSelect items={facets.makes} selected={filters.make} onSelect={chip("make")} />
                </CollapsibleSection>
              )}

              {facets.models.length > 0 && (
                <CollapsibleSection icon={<Car className="h-4 w-4" />} title="Model" subtitle="Specific models available" defaultOpen={false}>
                  <ChipSelect items={facets.models} selected={filters.model} onSelect={chip("model")} />
                </CollapsibleSection>
              )}

              {facets.bodyTypes.length > 0 && (
                <CollapsibleSection icon={<Shapes className="h-4 w-4" />} title="Body Type" subtitle="Body style">
                  <ChipSelect items={facets.bodyTypes} selected={filters.bodyType} onSelect={chip("bodyType")} />
                </CollapsibleSection>
              )}

              {facets.priceRange.max > facets.priceRange.min && (
                <CollapsibleSection icon={<IndianRupee className="h-4 w-4" />} title="Price" subtitle={`${formatINRShort(facets.priceRange.min)} – ${formatINRShort(facets.priceRange.max)}`}>
                  <RangeSlider
                    value={filters.priceRange}
                    onChange={(v) => onSetFilter("priceRange", v)}
                    min={facets.priceRange.min}
                    max={facets.priceRange.max}
                    step={10000}
                    format={formatINRShort}
                  />
                  <div className="flex flex-wrap gap-1.5 pt-3">
                    {priceBuckets.map((b) => (
                      <button key={b.label} onClick={() => onSetFilter("priceRange", b.range)}
                        className="px-2.5 py-1 bg-zinc-50 hover:bg-[#023468]/8 border border-black/8 hover:border-[#023468]/30 rounded-full text-[10px] font-bold text-black/50 hover:text-[#023468] transition-all cursor-pointer">
                        {b.label}
                      </button>
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {facets.years.length > 0 && (
                <CollapsibleSection icon={<CalendarDays className="h-4 w-4" />} title="Year" subtitle={`${facets.yearRange.min} – ${facets.yearRange.max}`} defaultOpen={false}>
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
                <CollapsibleSection icon={<Fuel className="h-4 w-4" />} title="Fuel" subtitle="Powertrain" defaultOpen={false}>
                  <ChipSelect items={facets.fuels} selected={filters.fuel} onSelect={chip("fuel")} />
                </CollapsibleSection>
              )}

              {facets.transmissions.length > 0 && (
                <CollapsibleSection icon={<Settings2 className="h-4 w-4" />} title="Transmission" subtitle="Gearbox" defaultOpen={false}>
                  <ChipSelect items={facets.transmissions} selected={filters.transmission} onSelect={chip("transmission")} />
                </CollapsibleSection>
              )}

              {facets.conditions.length > 0 && (
                <CollapsibleSection icon={<ShieldCheck className="h-4 w-4" />} title="Condition" subtitle="Certification status" defaultOpen={false}>
                  <ChipSelect items={facets.conditions} selected={filters.condition} onSelect={chip("condition")} />
                </CollapsibleSection>
              )}

              {facets.mileageRange.max > facets.mileageRange.min && (
                <CollapsibleSection icon={<Gauge className="h-4 w-4" />} title="KMs Driven" subtitle={`${facets.mileageRange.min.toLocaleString("en-IN")} – ${facets.mileageRange.max.toLocaleString("en-IN")} km`} defaultOpen={false}>
                  <RangeSlider
                    value={filters.mileageRange}
                    onChange={(v) => onSetFilter("mileageRange", v)}
                    min={facets.mileageRange.min}
                    max={facets.mileageRange.max}
                    step={1000}
                    format={(n) => `${n.toLocaleString("en-IN")} km`}
                  />
                  <div className="flex flex-wrap gap-1.5 pt-3">
                    {mileageBuckets.map((b) => (
                      <button key={b.label} onClick={() => onSetFilter("mileageRange", b.range)}
                        className="px-2.5 py-1 bg-zinc-50 hover:bg-[#023468]/8 border border-black/8 hover:border-[#023468]/30 rounded-full text-[10px] font-bold text-black/50 hover:text-[#023468] transition-all cursor-pointer">
                        {b.label} km
                      </button>
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {facets.colours.length > 0 && (
                <CollapsibleSection icon={<Palette className="h-4 w-4" />} title="Colour" subtitle="Exterior colour" defaultOpen={false}>
                  <ColourChipSelect items={facets.colours} selected={filters.colour} onSelect={chip("colour")} />
                </CollapsibleSection>
              )}

              <p className="text-center text-[10px] text-black/30 font-semibold uppercase tracking-widest pb-2">
                Options reflect live stock at AM Group Jammu
              </p>
            </div>

            <div className="px-4 pt-3 pb-6 md:pb-5 bg-white border-t border-black/10 shadow-2xl">
              <button onClick={onClose}
                className="w-full bg-[#023468] hover:bg-[#01254a] text-white font-black uppercase tracking-widest text-sm rounded-2xl transition-all shadow-xl shadow-[#023468]/30 cursor-pointer py-4">
                Show {resultCount} {resultCount === 1 ? "car" : "cars"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
