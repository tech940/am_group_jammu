"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { VehicleCard } from "@/components/ui/vehicle-card"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"

const vehicles = [
  {
    id: "h-ioniq-5",
    name: "Hyundai IONIQ 5",
    brand: "Hyundai",
    type: "Electric SUV",
    category: "ev",
    specs: { range: "631 km", acceleration: "7.6s", topSpeed: "185 km/h" },
    price: "₹ 46.05 Lakh*",
    image: "https://images.unsplash.com/photo-1669062092147-380d603e913a?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "k-ev6",
    name: "Kia EV6 GT-Line",
    brand: "Kia",
    type: "Electric Crossover",
    category: "ev",
    specs: { range: "708 km", acceleration: "5.2s", topSpeed: "192 km/h" },
    price: "₹ 60.95 Lakh*",
    image: "https://images.unsplash.com/photo-1647462400329-8472506b12a8?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "m-gloster",
    name: "MG Gloster Savvy 4x4",
    brand: "MG",
    type: "Full-Size SUV",
    category: "suv",
    specs: { engine: "2.0L Twin Turbo", power: "215 PS", acceleration: "11.2s", topSpeed: "185 km/h" },
    price: "₹ 38.80 Lakh*",
    image: "https://images.unsplash.com/photo-1621360241104-799497148512?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "t-harrier",
    name: "Tata Harrier Fearless+",
    brand: "Tata",
    type: "Premium SUV",
    category: "suv",
    specs: { engine: "2.0L Kryotec", power: "170 PS", acceleration: "9.8s", topSpeed: "180 km/h" },
    price: "₹ 24.50 Lakh*",
    image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "h-[#city]",
    name: "Honda City e:HEV",
    brand: "Honda",
    type: "Strong Hybrid Sedan",
    category: "sedan",
    specs: { engine: "1.5L i-VTEC Hybrid", power: "126 PS", acceleration: "8.9s", topSpeed: "176 km/h" },
    price: "₹ 19.80 Lakh*",
    image: "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "t-safari",
    name: "Tata Safari Accomplished",
    brand: "Tata",
    type: "7-Seater Luxury SUV",
    category: "suv",
    specs: { engine: "2.0L Diesel", power: "170 PS", acceleration: "10.1s", topSpeed: "178 km/h" },
    price: "₹ 26.90 Lakh*",
    image: "https://images.unsplash.com/photo-1620217405794-67f0a84976ca?auto=format&fit=crop&q=80&w=800",
  }
]

export function FeaturedInventory() {
  const [filter, setFilter] = useState("all")
  const { onOpen } = useEnquiryModal()

  const filteredVehicles = filter === "all" 
    ? vehicles 
    : vehicles.filter(v => v.category === filter)

  return (
    <section className="py-28 bg-[#FAFAFA] relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-[#023468]">
              Featured Vehicles
            </h2>
            <p className="text-black/60 text-sm md:text-base font-normal mt-1">
              Explore our handpicked collection of certified new &amp; pre-owned vehicles.
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

        {/* Vehicles Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredVehicles.map((car, index) => (
              <VehicleCard 
                key={car.id} 
                vehicle={car} 
                index={index} 
                onUnlock={(v) => onOpen(v)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  )
}


