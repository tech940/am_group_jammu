"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronDown, SlidersHorizontal, RotateCcw, Check, Zap, Car, Fuel, IndianRupee, Settings2, CalendarDays, Gauge, Palette } from "lucide-react"
import { useInventoryStore } from "@/store/use-inventory-store"

const brands = ["Hyundai", "Kia", "MG", "Mahindra", "Tata", "Toyota", "Jeep", "Audi", "Skoda", "Ford", "Maruti", "Honda"]
const types = ["SUV", "Sedan", "Hatchback", "Crossover", "Electric", "Luxury", "MUV", "Pickup"]
const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid", "CNG", "LPG"]
const transmissions = ["Automatic", "Manual", "CVT", "DCT", "AMT"]
const yearRanges = ["2024–2025", "2022–2023", "2020–2021", "2018–2019", "Before 2018"]
const mileageRanges = ["Under 10K km", "10K–30K km", "30K–60K km", "60K–90K km", "90K+ km"]
const colours = ["White", "Black", "Silver", "Grey", "Red", "Blue", "Brown", "Green"]

interface ChipSelectProps {
  items: string[]
  selected: string
  onSelect: (item: string) => void
}

function ChipSelect({ items, selected, onSelect }: ChipSelectProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isActive = selected === item
        return (
          <button
            key={item}
            onClick={() => onSelect(isActive ? "" : item)}
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
            {item}
          </button>
        )
      })}
    </div>
  )
}

// Colour dot chips
function ColourChipSelect({ items, selected, onSelect }: ChipSelectProps) {
  const colourMap: Record<string, string> = {
    White: "#FFFFFF",
    Black: "#111111",
    Silver: "#C0C0C0",
    Grey: "#808080",
    Red: "#CC2200",
    Blue: "#1A4FA8",
    Brown: "#7B3F00",
    Green: "#2D6A4F",
  }
  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map((item) => {
        const isActive = selected === item
        return (
          <button
            key={item}
            onClick={() => onSelect(isActive ? "" : item)}
            title={item}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all duration-200 cursor-pointer ${
              isActive
                ? "border-[#023468] bg-[#023468]/6 text-[#023468]"
                : "border-black/10 bg-white text-black/60 hover:border-[#023468]/30"
            }`}
          >
            <span
              className={`h-3.5 w-3.5 rounded-full flex-shrink-0 border ${item === "White" ? "border-black/20" : "border-transparent"}`}
              style={{ backgroundColor: colourMap[item] }}
            />
            {item}
            {isActive && <Check className="h-3 w-3 text-[#023468]" strokeWidth={3} />}
          </button>
        )
      })}
    </div>
  )
}

interface CollapsibleSectionProps {
  icon: React.ReactNode
  title: string
  subtitle?: string
  badge?: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function CollapsibleSection({ icon, title, subtitle, badge, defaultOpen = true, children }: CollapsibleSectionProps) {
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
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-[0.15em] text-[#023468]">{title}</span>
              {badge && (
                <span className="px-1.5 py-0.5 bg-[#E31837] text-white text-[9px] font-black uppercase tracking-wider rounded-full">
                  {badge}
                </span>
              )}
            </div>
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
            <div className="px-5 pb-5 pt-1 border-t border-black/5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface PriceRangeSliderProps {
  value: [number, number]
  onChange: (value: [number, number]) => void
  min: number
  max: number
}

function PriceRangeSlider({ value, onChange, min, max }: PriceRangeSliderProps) {
  const [minVal, setMinVal] = useState(value[0])
  const [maxVal, setMaxVal] = useState(value[1])

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Number(e.target.value)
    if (newVal <= maxVal) { setMinVal(newVal); onChange([newVal, maxVal]) }
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Number(e.target.value)
    if (newVal >= minVal) { setMaxVal(newVal); onChange([minVal, newVal]) }
  }

  const formatPrice = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(0)}Cr`
    if (val >= 100000) return `₹${(val / 100000).toFixed(0)}L`
    return `₹${(val / 1000).toFixed(0)}K`
  }

  const leftPct = ((minVal - min) / (max - min)) * 100
  const widthPct = ((maxVal - minVal) / (max - min)) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-zinc-50 border border-black/8 rounded-xl px-4 py-2.5 text-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-black/35 block">Min</span>
          <span className="text-sm font-black text-[#023468]">{formatPrice(minVal)}</span>
        </div>
        <div className="h-px w-4 bg-black/15 flex-shrink-0" />
        <div className="flex-1 bg-zinc-50 border border-black/8 rounded-xl px-4 py-2.5 text-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-black/35 block">Max</span>
          <span className="text-sm font-black text-[#023468]">{formatPrice(maxVal)}</span>
        </div>
      </div>

      <div className="relative pt-2">
        <div className="relative h-1.5 bg-zinc-100 rounded-full">
          <div
            className="absolute h-full bg-[#023468] rounded-full"
            style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
          />
        </div>
        <div className="flex gap-0 relative">
          <input type="range" min={min} max={max} value={minVal} onChange={handleMinChange}
            className="absolute inset-0 w-full h-1.5 opacity-0 cursor-pointer"
            style={{ zIndex: minVal > max / 2 ? 5 : 4 }} />
          <input type="range" min={min} max={max} value={maxVal} onChange={handleMaxChange}
            className="absolute inset-0 w-full h-1.5 opacity-0 cursor-pointer"
            style={{ zIndex: maxVal <= max / 2 ? 5 : 4 }} />
          <div className="absolute h-5 w-5 rounded-full bg-white border-2 border-[#023468] shadow-md pointer-events-none"
            style={{ left: `calc(${leftPct}% - 10px)`, top: "calc(0.375rem)" }} />
          <div className="absolute h-5 w-5 rounded-full bg-white border-2 border-[#023468] shadow-md pointer-events-none"
            style={{ left: `calc(${leftPct + widthPct}% - 10px)`, top: "calc(0.375rem)" }} />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {[
          { label: "Under ₹5L", min: 0, max: 500000 },
          { label: "₹5L–₹10L", min: 500000, max: 1000000 },
          { label: "₹10L–₹20L", min: 1000000, max: 2000000 },
          { label: "₹20L+", min: 2000000, max: 10000000 },
        ].map((range) => (
          <button key={range.label}
            onClick={() => { setMinVal(range.min); setMaxVal(range.max); onChange([range.min, range.max]) }}
            className="px-2.5 py-1 bg-zinc-50 hover:bg-[#023468]/8 border border-black/8 hover:border-[#023468]/30 rounded-full text-[10px] font-bold text-black/50 hover:text-[#023468] transition-all cursor-pointer">
            {range.label}
          </button>
        ))}
      </div>
    </div>
  )
}

interface InventoryFiltersProps {
  isOpen: boolean
  onClose: () => void
}

export function InventoryFilters({ isOpen, onClose }: InventoryFiltersProps) {
  const { filters, setBrand, setType, setFuel, setTransmission, setYear, setMileage, setPriceRange, resetFilters } = useInventoryStore()
  const [colour, setColour] = useState("")

  const handleReset = () => { resetFilters(); setColour(""); onClose() }

  const activeCount = [filters.brand, filters.type, filters.fuel, filters.transmission, filters.year, filters.mileage, colour].filter(Boolean).length

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />

          {/* Filter Panel */}
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-[#f8f9fa] shadow-2xl z-50 overflow-hidden flex flex-col"
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
                      {activeCount > 0 ? `${activeCount} active filter${activeCount > 1 ? "s" : ""}` : "Find your perfect car"}
                    </p>
                  </div>
                </div>
                <button onClick={onClose}
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
                  <Check className="h-3.5 w-3.5" /> Apply Filters
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar">

              {/* Brand */}
              <CollapsibleSection icon={<Car className="h-4 w-4" />} title="Brand" subtitle="Select a car brand" defaultOpen={true}>
                <ChipSelect items={brands} selected={filters.brand} onSelect={(v) => setBrand(filters.brand === v ? "" : v)} />
              </CollapsibleSection>

              {/* Vehicle Type */}
              <CollapsibleSection icon={<SlidersHorizontal className="h-4 w-4" />} title="Vehicle Type" subtitle="Body style preference" defaultOpen={true}>
                <ChipSelect items={types} selected={filters.type} onSelect={(v) => setType(filters.type === v ? "" : v)} />
              </CollapsibleSection>

              {/* Fuel Type */}
              <CollapsibleSection icon={<Fuel className="h-4 w-4" />} title="Fuel Type" subtitle="Powertrain preference" badge="EV Ready" defaultOpen={false}>
                <ChipSelect items={fuelTypes} selected={filters.fuel} onSelect={(v) => setFuel(filters.fuel === v ? "" : v)} />
              </CollapsibleSection>

              {/* Transmission */}
              <CollapsibleSection icon={<Settings2 className="h-4 w-4" />} title="Transmission" subtitle="Gearbox type" defaultOpen={false}>
                <ChipSelect items={transmissions} selected={filters.transmission} onSelect={(v) => setTransmission(filters.transmission === v ? "" : v)} />
              </CollapsibleSection>

              {/* Price Range */}
              <CollapsibleSection icon={<IndianRupee className="h-4 w-4" />} title="Price Range" subtitle="Set your budget" defaultOpen={true}>
                <PriceRangeSlider value={filters.priceRange} onChange={setPriceRange} min={0} max={10000000} />
              </CollapsibleSection>

              {/* Year */}
              <CollapsibleSection icon={<CalendarDays className="h-4 w-4" />} title="Year" subtitle="Manufacturing year range" defaultOpen={false}>
                <ChipSelect items={yearRanges} selected={filters.year} onSelect={(v) => setYear(filters.year === v ? "" : v)} />
              </CollapsibleSection>

              {/* Mileage */}
              <CollapsibleSection icon={<Gauge className="h-4 w-4" />} title="Mileage / KMs Driven" subtitle="Odometer reading" defaultOpen={false}>
                <ChipSelect items={mileageRanges} selected={filters.mileage} onSelect={(v) => setMileage(filters.mileage === v ? "" : v)} />
              </CollapsibleSection>

              {/* Colour */}
              <CollapsibleSection icon={<Palette className="h-4 w-4" />} title="Colour" subtitle="Exterior colour preference" defaultOpen={false}>
                <ColourChipSelect items={colours} selected={colour} onSelect={setColour} />
              </CollapsibleSection>

              {/* Electric Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-[#023468] to-[#034a90] p-4 flex items-center gap-4 shadow-lg shadow-[#023468]/15">
                <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-black text-[11px] uppercase tracking-widest">Electric Vehicles</div>
                  <div className="text-white/70 text-[10px] font-medium mt-0.5">Browse our full EV collection with special offers</div>
                </div>
              </div>

              <p className="text-center text-[10px] text-black/30 font-semibold uppercase tracking-widest pb-2">
                🔒 Your filters are private &amp; secure
              </p>
            </div>

            {/* Bottom CTA */}
            <div className="px-4 pb-5 pt-3 bg-white border-t border-black/6">
              <button onClick={onClose}
                className="w-full bg-[#023468] hover:bg-[#01254a] text-white font-black uppercase tracking-widest text-sm rounded-2xl transition-all shadow-xl shadow-[#023468]/30 cursor-pointer py-3.5">
                Apply Filters {activeCount > 0 && `(${activeCount})`}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
