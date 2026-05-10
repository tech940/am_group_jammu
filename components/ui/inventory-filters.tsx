"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useInventoryStore } from "@/store/use-inventory-store"

const brands = ["Hyundai", "Kia", "MG", "Mahindra", "Tata", "Toyota", "Jeep", "Audi", "Skoda", "Ford"]
const types = ["SUV", "Sedan", "Hatchback", "Crossover", "Electric", "Luxury"]
const fuelTypes = ["Electric", "Petrol", "Diesel", "Hybrid"]

interface FilterSectionProps {
  title: string
  items: string[]
  selected: string
  onSelect: (item: string) => void
  defaultOpen?: boolean
}

function FilterSection({ title, items, selected, onSelect, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-black/5 pb-6 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full mb-5 group"
      >
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#023468]">{title}</h3>
        <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? "bg-[#023468] rotate-180" : "bg-zinc-100 group-hover:bg-zinc-200"}`}>
          <ChevronDown className="h-4 w-4 transition-colors" />
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3">
              {items.map((item) => (
                <label key={item} className="relative cursor-pointer group">
                  <input
                    type="radio"
                    name={title}
                    checked={selected === item}
                    onChange={() => onSelect(item)}
                    className="peer sr-only"
                  />
                  <div className="p-3 rounded-xl border-2 border-zinc-100 peer-checked:border-[#023468] peer-checked:bg-[#023468]/5 transition-all duration-300 hover:border-[#023468]/30">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-zinc-200 peer-checked:border-[#023468] peer-checked:bg-[#023468] transition-all flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-xs font-medium text-black/60 peer-checked:text-[#023468] transition-colors">{item}</span>
                    </div>
                  </div>
                </label>
              ))}
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
    if (newVal <= maxVal) {
      setMinVal(newVal)
      onChange([newVal, maxVal])
    }
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Number(e.target.value)
    if (newVal >= minVal) {
      setMaxVal(newVal)
      onChange([minVal, newVal])
    }
  }

  const formatPrice = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(0)}Cr+`
    if (val >= 100000) return `₹${(val / 100000).toFixed(0)}L`
    return `₹${(val / 1000).toFixed(0)}K`
  }

  return (
    <div className="border-b border-black/5 pb-6 last:border-0">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#023468] mb-5">Price Range</h3>
      
      <div className="space-y-5">
        <div className="flex items-center justify-between bg-zinc-50 p-4 rounded-xl border border-zinc-100">
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-black/40 block mb-1">Min</span>
            <span className="text-sm font-bold text-[#023468]">{formatPrice(minVal)}</span>
          </div>
          <div className="h-px flex-1 bg-zinc-200 mx-4" />
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-black/40 block mb-1">Max</span>
            <span className="text-sm font-bold text-[#023468]">{formatPrice(maxVal)}</span>
          </div>
        </div>
        
        <div className="relative h-2 bg-zinc-100 rounded-full overflow-hidden">
          <div 
            className="absolute h-full bg-gradient-to-r from-[#023468] to-[#023468]/70 rounded-full transition-all duration-300"
            style={{ 
              left: `${((minVal - min) / (max - min)) * 100}%`,
              width: `${((maxVal - minVal) / (max - min)) * 100}%`
            }}
          />
        </div>
        
        <div className="flex gap-4">
          <input
            type="range"
            min={min}
            max={max}
            value={minVal}
            onChange={handleMinChange}
            className="flex-1 h-2 bg-transparent appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#023468] [&::-webkit-slider-thumb]:shadow-xl [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <input
            type="range"
            min={min}
            max={max}
            value={maxVal}
            onChange={handleMaxChange}
            className="flex-1 h-2 bg-transparent appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#023468] [&::-webkit-slider-thumb]:shadow-xl [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}

interface InventoryFiltersProps {
  isOpen: boolean
  onClose: () => void
}

export function InventoryFilters({ isOpen, onClose }: InventoryFiltersProps) {
  const { filters, setBrand, setType, setFuel, setPriceRange, resetFilters } = useInventoryStore()

  const handleBrandToggle = (brand: string) => {
    setBrand(filters.brand === brand ? '' : brand)
  }

  const handleTypeToggle = (type: string) => {
    setType(filters.type === type ? '' : type)
  }

  const handleFuelToggle = (fuel: string) => {
    setFuel(filters.fuel === fuel ? '' : fuel)
  }

  const handleReset = () => {
    resetFilters()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          
          {/* Filter Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-white to-zinc-50 shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-black/5 p-6 z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-[#023468]">Filters</h2>
                  <p className="text-xs text-black/40 uppercase tracking-widest mt-1">Refine your search</p>
                </div>
                <button
                  onClick={onClose}
                  className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-[#023468] hover:text-white transition-all duration-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1 border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300 transition-all text-xs font-black uppercase tracking-widest"
                >
                  Reset All
                </Button>
                <Button
                  onClick={onClose}
                  className="flex-1 bg-[#023468] hover:bg-[#01254a] text-white transition-all text-xs font-black uppercase tracking-widest shadow-lg"
                >
                  Apply Filters
                </Button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <FilterSection
                title="Brand"
                items={brands}
                selected={filters.brand}
                onSelect={handleBrandToggle}
              />
              
              <FilterSection
                title="Vehicle Type"
                items={types}
                selected={filters.type}
                onSelect={handleTypeToggle}
              />
              
              <FilterSection
                title="Fuel Type"
                items={fuelTypes}
                selected={filters.fuel}
                onSelect={handleFuelToggle}
              />
              
              <PriceRangeSlider
                value={filters.priceRange}
                onChange={setPriceRange}
                min={0}
                max={10000000}
              />
            </div>

            {/* Bottom Action - Mobile */}
            <div className="p-6 border-t border-black/5 bg-white/80 backdrop-blur-xl">
              <Button
                onClick={onClose}
                className="w-full h-14 bg-[#023468] hover:bg-[#01254a] text-white transition-all text-sm font-black uppercase tracking-widest shadow-xl"
              >
                Apply Filters
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
