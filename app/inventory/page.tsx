"use client"



import React, { useState, useMemo, useEffect } from "react"

import { Search, SlidersHorizontal, Grid, List, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRef } from "react"

import { Button } from "@/components/ui/button"

import { VehicleCard } from "@/components/ui/vehicle-card"

import { InventoryFilters } from "@/components/ui/inventory-filters"

import { SkeletonCard } from "@/components/ui/skeleton-card"

import { SkeletonLoading } from "@/components/ui/skeleton-loading"

import { useInventoryStore } from "@/store/use-inventory-store"

import { Vehicle } from "@/lib/vehicle-data"

import { useEnquiryModal } from "@/hooks/use-enquiry-modal"



export default function InventoryPage() {

  const [viewType, setViewType] = useState<"grid" | "list">("grid")

  const [searchQuery, setSearchQuery] = useState("")

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)

  const { onOpen } = useEnquiryModal()
  const { filters, setSearchQuery: setStoreSearchQuery, resetFilters } = useInventoryStore()
  const inventoryRef = useRef<HTMLDivElement>(null)

  const scrollToInventory = () => {

    inventoryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }



  const filteredVehicles = useMemo(() => {

    return vehicles.filter((vehicle) => {

      const searchLower = searchQuery.toLowerCase()

      const matchesSearch = 

        vehicle.name.toLowerCase().includes(searchLower) ||

        vehicle.brand.toLowerCase().includes(searchLower) ||

        vehicle.type.toLowerCase().includes(searchLower)

      

      const matchesBrand = !filters.brand || vehicle.brand === filters.brand

      const matchesType = !filters.type || vehicle.type.toLowerCase().includes(filters.type.toLowerCase())

      const matchesFuel = !filters.fuel || vehicle.specs.engine?.toLowerCase().includes(filters.fuel.toLowerCase())

      const matchesPrice = true

      

      return matchesSearch && matchesBrand && matchesType && matchesFuel && matchesPrice

    })

  }, [searchQuery, filters])



  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])




  const handleUnlock = (vehicle: Vehicle) => {

    onOpen(vehicle)

  }



  const handleSearch = (query: string) => {

    setSearchQuery(query)

    setStoreSearchQuery(query)

  }



  return (
    <div className="min-h-screen bg-white relative">




      <section className="relative min-h-[500px] flex items-center overflow-hidden bg-black">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/inventory_hero_bg.png" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-50 scale-110"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-6 md:px-12 py-20 lg:py-32">
          <div className="max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-center gap-4 mb-10"
            >
              <span className="text-[#E31837] uppercase tracking-[0.4em] text-[10px] font-black px-4 py-2 bg-[#E31837]/10 rounded-full border border-[#E31837]/30 backdrop-blur-sm">
                Premium Collection
              </span>
              <div className="h-[1px] w-32 bg-gradient-to-r from-[#E31837]/50 to-transparent" />
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl md:text-[110px] font-black text-white leading-[0.85] tracking-[-0.05em]"
            >
              Explore Our <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#E31837] via-[#ff4d6d] to-[#ff9aa2] drop-shadow-[0_0_30px_rgba(227,24,55,0.3)]">
                Collection
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-12 text-zinc-400 text-lg md:text-2xl font-light leading-relaxed max-w-2xl"
            >
              Discover the perfect blend of performance, luxury, and technology across our diverse range of premium vehicles.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-12 flex flex-wrap gap-6"
            >
              <div className="flex flex-col">
                <span className="text-white font-bold text-2xl">150+</span>
                <span className="text-zinc-500 text-xs uppercase tracking-widest">Vehicles</span>
              </div>
              <div className="w-[1px] h-10 bg-zinc-800" />
              <div className="flex flex-col">
                <span className="text-white font-bold text-2xl">12</span>
                <span className="text-zinc-500 text-xs uppercase tracking-widest">Brands</span>
              </div>
              <div className="w-[1px] h-10 bg-zinc-800" />
              <div className="flex flex-col">
                <span className="text-white font-bold text-2xl">24/7</span>
                <span className="text-zinc-500 text-xs uppercase tracking-widest">Support</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-0 bottom-0 w-1/3 h-1/2 bg-[#E31837]/5 blur-[120px] rounded-full" />

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-[20%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 cursor-pointer z-30 pointer-events-auto group"
          onClick={scrollToInventory}
        >


          <motion.span 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-white text-[10px] uppercase tracking-[0.5em] font-black group-hover:text-[#E31837] transition-colors"
          >
            Scroll Down
          </motion.span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-start justify-center h-10 w-6 rounded-full border-2 border-white/20 group-hover:border-[#E31837] transition-colors p-1.5"
          >
            <motion.div 
              animate={{ height: [4, 8, 4], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 bg-[#E31837] rounded-full"
            />
          </motion.div>
        </motion.div>
      </section>

      <div ref={inventoryRef} className="container mx-auto px-6 md:px-12 py-20">

         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-16 border-b border-black/5 pb-10">

            <div className="flex items-center gap-6">

              <span className="text-sm text-black font-black uppercase tracking-widest">

                Showing {filteredVehicles.length} Vehicles

              </span>

              <div className="h-4 w-[1px] bg-black/10 hidden sm:block" />

              <div className="hidden sm:flex gap-3">

                {(filters.brand || filters.type || filters.fuel) && (

                  <>

                    {filters.brand && (

                      <span className="text-[10px] font-black uppercase tracking-widest text-[#E31837] bg-[#E31837]/5 px-4 py-1.5 rounded-lg">

                        {filters.brand}

                      </span>

                    )}

                    {filters.type && (

                      <span className="text-[10px] font-black uppercase tracking-widest text-[#E31837] bg-[#E31837]/5 px-4 py-1.5 rounded-lg">

                        {filters.type}

                      </span>

                    )}

                    {filters.fuel && (

                      <span className="text-[10px] font-black uppercase tracking-widest text-[#E31837] bg-[#E31837]/5 px-4 py-1.5 rounded-lg">

                        {filters.fuel}

                      </span>

                    )}

                  </>

                )}

              </div>

            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">

               <div className="relative flex-1 lg:flex-none lg:w-72">

                  {isSearching ? (

                    <SkeletonLoading type="input" />

                  ) : (

                    <>

                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />

                      <input 

                        type="text" 

                        placeholder="Search..."

                        className="pl-10 pr-4 h-10 bg-zinc-100 rounded-xl text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[#023468]/20 focus:border-[#023468] border border-transparent transition-all w-full"

                        value={searchQuery}

                        onChange={(e) => handleSearch(e.target.value)}

                        onFocus={() => setIsSearching(true)}

                        onBlur={() => setIsSearching(false)}

                      />

                    </>

                  )}

               </div>

               <Button 
                 onClick={() => setIsFilterOpen(true)}
                 disabled={isFilterOpen}
                 className="h-10 px-4 bg-zinc-100 hover:bg-zinc-200 text-black rounded-xl transition-all flex items-center gap-2 relative cursor-pointer"
               >


                  {isFilterOpen ? (

                    <Loader2 className="h-4 w-4 animate-spin" />

                  ) : (

                    <>

                      <SlidersHorizontal className="h-4 w-4" />

                      <span className="hidden sm:inline text-xs font-black uppercase tracking-widest">Filters</span>

                      {(filters.brand || filters.type || filters.fuel) && (

                        <span className="h-2 w-2 rounded-full bg-[#E31837]" />

                      )}

                    </>

                  )}

               </Button>

               <div className="flex bg-zinc-100 p-1 rounded-xl">

                  <button 

                    onClick={() => setViewType("grid")}

                    disabled={isLoading}

                    className={`p-2 rounded-lg transition-all duration-500 cursor-pointer ${viewType === "grid" ? "bg-white text-[#023468] shadow-sm" : "text-black/30 hover:text-black"} ${isLoading ? "opacity-50" : ""}`}

                  >

                     {isLoading ? <div className="h-4 w-4 bg-zinc-200 rounded animate-pulse" /> : <Grid className="h-4 w-4" />}

                  </button>

                  <button 

                    onClick={() => setViewType("list")}

                    disabled={isLoading}

                    className={`p-2 rounded-lg transition-all duration-500 cursor-pointer ${viewType === "list" ? "bg-white text-[#023468] shadow-sm" : "text-black/30 hover:text-black"} ${isLoading ? "opacity-50" : ""}`}

                  >

                     {isLoading ? <div className="h-4 w-4 bg-zinc-200 rounded animate-pulse" /> : <List className="h-4 w-4" />}

                  </button>

               </div>

            </div>

         </div>



         <div className={viewType === "grid" 
           ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 xl:gap-12" 
           : "flex flex-col gap-6"
         }>

           {isLoading ? (

             Array.from({ length: 8 }).map((_, index) => (

               <SkeletonCard key={`skeleton-${index}`} />

             ))

           ) : filteredVehicles.length > 0 ? (

             filteredVehicles.map((car, index) => (

               <VehicleCard key={car.name} vehicle={car} index={index} onUnlock={handleUnlock} viewType={viewType} />

             ))

           ) : (

             <div className="col-span-full text-center py-20">

               <p className="text-black/40 text-lg">No vehicles found matching your criteria.</p>

               <Button 

                 onClick={() => {

                   resetFilters()

                   setSearchQuery("")

                 }}

                 variant="outline"

                 className="mt-6"

               >

                 Clear Filters

               </Button>

             </div>

           )}

         </div>

         

         <div className="mt-24 flex justify-center">

            <div className="flex space-x-3">

               {isLoading ? (

                 Array.from({ length: 4 }).map((_, i) => (

                   <div key={`skeleton-page-${i}`} className="h-14 w-14 rounded-2xl bg-zinc-200 animate-pulse" />

                 ))

               ) : (

                 [1, 2, 3, 4].map((i) => (

                    <button key={i} className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-500 border cursor-pointer ${i === 1 ? "bg-[#023468] text-white border-[#023468] shadow-lg" : "text-black/40 border-black/5 hover:border-[#023468] hover:text-[#023468]"}`}>

                       {i}

                    </button>

                 ))

               )}

            </div>

         </div>



         <div className="mt-24 space-y-20">

           <h2 className="text-3xl font-bold text-black mb-6 text-center">Premium Vehicle Collection</h2>

           <p className="text-lg text-black/70 leading-relaxed mb-8 max-w-4xl mx-auto">

             Explore our curated selection of premium vehicles featuring the latest models from world-renowned manufacturers. From electric SUVs to luxury sedans, our inventory represents the pinnacle of automotive excellence with cutting-edge technology, superior performance, and unmatched comfort.

           </p>

           

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">

             <div className="text-center">

               <h3 className="text-xl font-bold text-[#023468] mb-3">Electric Innovation</h3>

               <p className="text-black/60 leading-relaxed">Leading the charge towards sustainable mobility with zero-emission vehicles and advanced battery technology.</p>

             </div>

             <div className="text-center">

               <h3 className="text-xl font-bold text-[#023468] mb-3">Luxury Comfort</h3>

               <p className="text-black/60 leading-relaxed">Experience premium interiors, advanced infotainment systems, and superior craftsmanship in every model.</p>

             </div>

             <div className="text-center">

               <h3 className="text-xl font-bold text-[#023468] mb-3">Performance Excellence</h3>

               <p className="text-black/60 leading-relaxed">Powerful engines, responsive handling, and state-of-the-art safety features for an unmatched driving experience.</p>

             </div>

           </div>

           

           <div className="bg-zinc-50 rounded-2xl p-8 border border-black/5">

             <h3 className="text-2xl font-bold text-[#023468] mb-4">Why Choose AM Group Jammu?</h3>

             <ul className="space-y-3 text-black/70">

               <li className="flex items-start gap-3"><span className="text-[#E31837] mt-1">•</span><span>Authorized dealer with certified pre-owned vehicles</span></li>

               <li className="flex items-start gap-3"><span className="text-[#E31837] mt-1">•</span><span>Competitive financing options and transparent pricing</span></li>

               <li className="flex items-start gap-3"><span className="text-[#E31837] mt-1">•</span><span>Comprehensive warranty and after-sales service</span></li>

               <li className="flex items-start gap-3"><span className="text-[#E31837] mt-1">•</span><span>Expert guidance for finding your perfect vehicle</span></li>

             </ul>

           </div>

         </div>

      </div>

      

      <InventoryFilters isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />


    </div>

  )

}



export const vehicles: Vehicle[] = [

  {

    id: "hyundai-ioniq-5",

    name: "IONIQ 5",

    brand: "Hyundai",

    type: "Electric SUV",

    year: "2025",

    specs: {

      range: "480 km",

      acceleration: "5.2s",

      topSpeed: "185 km/h",

      engine: "Electric",

      power: "225 PS",

      transmission: "Automatic",

      drive: "AWD",

      fuel: "Electric",

      mileage: "480 km/charge",

      seats: "5"

    },

    price: "₹ 46.05 Lakh*",

    image: "https://images.unsplash.com/photo-1614239521970-8cd8b8941017?auto=format&fit=crop&q=80&w=800",

    images: [

      "https://images.unsplash.com/photo-1614239521970-8cd8b8941017?auto=format&fit=crop&q=80&w=800",

      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800",

      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800"

    ],

    description: "The Hyundai IONIQ 5 represents the future of electric mobility with striking design, advanced technology, and impressive performance. This all-electric SUV combines retro-futuristic aesthetics with cutting-edge features.",

    features: [

      "Ultra-fast charging (10-80% in 18 min)",

      "Vehicle-to-Load (V2L) functionality",

      "Augmented reality head-up display",

      "Digital center console",

      "Smart parking assist",

      "Highway Driving Assist 2"

    ],

    colors: ["Phantom Black", "Atlas White", "Gravity Gold", "Digital Teal"]

  },

  {

    id: "kia-ev6",

    name: "EV6",

    brand: "Kia",

    type: "Electric SUV",

    year: "2025",

    specs: {

      range: "528 km",

      acceleration: "5.2s",

      topSpeed: "185 km/h",

      engine: "Electric",

      power: "239 PS",

      transmission: "Automatic",

      drive: "RWD",

      fuel: "Electric",

      mileage: "528 km/charge",

      seats: "5"

    },

    price: "₹ 60.95 Lakh*",

    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800",

    images: [

      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800",

      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800",

      "https://images.unsplash.com/photo-1614239521970-8cd8b8941017?auto=format&fit=crop&q=80&w=800"

    ],

    description: "The Kia EV6 is a groundbreaking all-electric crossover that combines bold design with exceptional performance and ultra-fast charging capabilities.",

    features: [

      "800V ultra-fast charging",

      "E-GMP (Electric Global Modular Platform)",

      "Dual-motor AWD option",

      "Augmented reality navigation",

      "Smart highway driving assist",

      "Vehicle-to-load functionality"

    ],

    colors: ["Snow White Pearl", "Aurora Black", "Gravity Blue", "Yacht Blue"]

  },

  {

    id: "mg-zs-ev",

    name: "ZS EV",

    brand: "MG",

    type: "Electric SUV",

    year: "2025",

    specs: {

      range: "461 km",

      acceleration: "8.5s",

      topSpeed: "140 km/h",

      engine: "Electric",

      power: "176 PS",

      transmission: "Automatic",

      drive: "FWD",

      fuel: "Electric",

      mileage: "461 km/charge",

      seats: "5"

    },

    price: "₹ 27.58 Lakh*",

    image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800",

    images: [

      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800",

      "https://images.unsplash.com/photo-1614239521970-8cd8b8941017?auto=format&fit=crop&q=80&w=800",

      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800"

    ],

    description: "The MG ZS EV offers practical electric mobility with impressive range, advanced safety features, and affordable pricing.",

    features: [

      "Fast charging (0-80% in 42 min)",

      "Connected car technology",

      "PHEV and EV options",

      "Advanced driver assistance",

      "Spacious interior",

      "5-star safety rating"

    ],

    colors: ["Cosmic Silver", "Stark White", "Copenhagen Blue", "Black Pearl"]

  },

  {

    id: "mahindra-xuv400",

    name: "XUV400",

    brand: "Mahindra",

    type: "Electric SUV",

    year: "2025",

    specs: {

      range: "456 km",

      acceleration: "8.3s",

      topSpeed: "160 km/h",

      engine: "Electric",

      power: "150 PS",

      transmission: "Automatic",

      drive: "FWD",

      fuel: "Electric",

      mileage: "456 km/charge",

      seats: "5"

    },

    price: "₹ 15.49 Lakh*",

    image: "https://images.unsplash.com/photo-1549398252-7512a0c4e6d4?auto=format&fit=crop&q=80&w=800",

    images: [

      "https://images.unsplash.com/photo-1549398252-7512a0c4e6d4?auto=format&fit=crop&q=80&w=800",

      "https://images.unsplash.com/photo-1614239521970-8cd8b8941017?auto=format&fit=crop&q=80&w=800",

      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800"

    ],

    description: "The Mahindra XUV400 is India's first all-electric SUV, offering cutting-edge technology, impressive performance, and great value.",

    features: [

      "Fast charging support",

      "Connected car features",

      "Multiple drive modes",

      "Regenerative braking",

      "Spacious cabin",

      "Advanced safety suite"

    ],

    colors: ["Arctic Blue", "Napoli Black", "Electric Blue", "Galaxy Grey"]

  },

  {

    id: "tata-nexon-ev",

    name: "Nexon EV",

    brand: "Tata",

    type: "Electric SUV",

    year: "2025",

    specs: {

      range: "465 km",

      acceleration: "9.0s",

      topSpeed: "140 km/h",

      engine: "Electric",

      power: "143 PS",

      transmission: "Automatic",

      drive: "FWD",

      fuel: "Electric",

      mileage: "465 km/charge",

      seats: "5"

    },

    price: "₹ 14.49 Lakh*",

    image: "https://images.unsplash.com/photo-1551836022-deb716c12ce9?auto=format&fit=crop&q=80&w=800",

    images: [

      "https://images.unsplash.com/photo-1551836022-deb716c12ce9?auto=format&fit=crop&q=80&w=800",

      "https://images.unsplash.com/photo-1549398252-7512a0c4e6d4?auto=format&fit=crop&q=80&w=800",

      "https://images.unsplash.com/photo-1614239521970-8cd8b8941017?auto=format&fit=crop&q=80&w=800"

    ],

  },
]