"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { VehicleCard } from "@/components/ui/vehicle-card"


const vehicles = [
  {
    id: "h-ioniq-5",
    name: "Hyundai IONIQ 5",
    brand: "Hyundai",
    type: "Electric SUV",
    specs: { range: "631 km", acceleration: "7.6s", topSpeed: "185 km/h" },
    price: "₹ 46.05 Lakh*",
    image: "https://images.unsplash.com/photo-1669062092147-380d603e913a?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "k-ev6",
    name: "Kia EV6",
    brand: "Kia",
    type: "Electric Crossover",
    specs: { range: "708 km", acceleration: "5.2s", topSpeed: "192 km/h" },
    price: "₹ 60.95 Lakh*",
    image: "https://images.unsplash.com/photo-1647462400329-8472506b12a8?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "m-gloster",
    name: "MG Gloster",
    brand: "MG",
    type: "Full-Size SUV",
    specs: { engine: "2.0L Diesel", power: "215 PS", acceleration: "12.5s", topSpeed: "180 km/h" },
    price: "₹ 38.80 Lakh*",
    image: "https://images.unsplash.com/photo-1621360241104-799497148512?auto=format&fit=crop&q=80&w=800",
  }
]

export function FeaturedInventory() {
  return (
    <section className="py-32 bg-[#FAFAFA]">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.21, 1.02, 0.47, 0.98] }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <div className="mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E31837] bg-[#E31837]/5 px-4 py-2 rounded-lg">
                Our Fleet
              </span>
            </div>
            <h2 className="text-[40px] md:text-[64px] font-bold text-[#023468] leading-[1.05] tracking-tight">
              Featured <span className="text-[#023468]/30">Used Cars</span>
            </h2>
            <p className="mt-8 text-black/40 text-lg font-light leading-relaxed">
              Discover our handpicked collection of certified used cars, meticulously 
              maintained and ready to redefine your driving experience.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.21, 1.02, 0.47, 0.98] }}
            viewport={{ once: true }}
          >
            <Button asChild variant="outline" className="rounded-2xl border-[#023468]/10 hover:bg-[#023468] hover:text-white px-10 h-16 font-black transition-all duration-500 flex items-center gap-3 cursor-pointer">
              <Link href="/inventory" target="_blank" className="flex items-center gap-3">
                View All Collection
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>


          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-12">
          {vehicles.map((car, index) => (
            <VehicleCard key={car.name} vehicle={car} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
