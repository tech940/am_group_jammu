"use client"

import * as React from "react"
import { ChevronRight, ChevronLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"

type VehicleCategory = "SUV" | "Hatchback" | "Sedan" | "MUV" | "Luxury"

const searchedCarsData: Record<VehicleCategory, Array<{
  id: string
  name: string
  price: string
  launchDate?: string
  image: string
}>> = {
  SUV: [
    {
      id: "s-1",
      name: "Hyundai Creta SX",
      price: "₹ 11.00 - 20.15 Lakh*",
      launchDate: "JUL 24, 2026",
      image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "s-2",
      name: "Tata Harrier Fearless",
      price: "₹ 15.49 - 26.44 Lakh*",
      launchDate: "AUG 05, 2026",
      image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "s-3",
      name: "MG Hector Sharp Pro",
      price: "₹ 13.99 - 22.30 Lakh*",
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "s-4",
      name: "Kia Seltos GTX+",
      price: "₹ 10.90 - 20.35 Lakh*",
      image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800"
    }
  ],
  Hatchback: [
    {
      id: "h-1",
      name: "Hyundai i20 N Line",
      price: "₹ 7.04 - 12.21 Lakh*",
      launchDate: "JUN 18, 2026",
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "h-2",
      name: "Tata Altroz Racer",
      price: "₹ 6.65 - 10.80 Lakh*",
      image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "h-3",
      name: "Honda Amaze VX",
      price: "₹ 7.20 - 9.96 Lakh*",
      image: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "h-4",
      name: "Tata Tiago iCNG",
      price: "₹ 5.65 - 8.90 Lakh*",
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800"
    }
  ],
  Sedan: [
    {
      id: "sd-1",
      name: "Honda City e:HEV Hybrid",
      price: "₹ 12.08 - 20.55 Lakh*",
      launchDate: "MAY 14, 2026",
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "sd-2",
      name: "Hyundai Verna SX(O)",
      price: "₹ 11.00 - 17.42 Lakh*",
      image: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "sd-3",
      name: "Honda City 5th Gen",
      price: "₹ 11.82 - 16.35 Lakh*",
      image: "https://images.unsplash.com/photo-1614239521970-8cd8b8941017?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "sd-4",
      name: "Tata Tigor iCNG",
      price: "₹ 6.30 - 9.55 Lakh*",
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800"
    }
  ],
  MUV: [
    {
      id: "m-1",
      name: "Kia Carens Luxury Plus",
      price: "₹ 10.52 - 19.67 Lakh*",
      launchDate: "JUL 10, 2026",
      image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "m-2",
      name: "Tata Safari Accomplished",
      price: "₹ 16.19 - 27.34 Lakh*",
      image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "m-3",
      name: "Hyundai Alcazar Executive",
      price: "₹ 16.77 - 21.28 Lakh*",
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "m-4",
      name: "MG Hector Plus 7-Str",
      price: "₹ 17.50 - 23.00 Lakh*",
      image: "https://images.unsplash.com/photo-1614239521970-8cd8b8941017?auto=format&fit=crop&q=80&w=800"
    }
  ],
  Luxury: [
    {
      id: "l-1",
      name: "MG Gloster Savvy 4x4",
      price: "₹ 38.80 - 43.15 Lakh*",
      launchDate: "AUG 01, 2026",
      image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "l-2",
      name: "Kia EV6 GT-Line",
      price: "₹ 60.95 - 65.95 Lakh*",
      image: "https://images.unsplash.com/photo-1614239521970-8cd8b8941017?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "l-3",
      name: "Hyundai IONIQ 5 EV",
      price: "₹ 46.05 - 48.50 Lakh*",
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "l-4",
      name: "Triumph Speed 400",
      price: "₹ 2.40 - 2.85 Lakh*",
      image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800"
    }
  ]
}

const electricCarsData = [
  {
    id: "ev-1",
    name: "Hyundai IONIQ 5 EV",
    price: "₹ 46.05 - 48.50 Lakh*",
    launchDate: "JUL 23, 2026",
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "ev-2",
    name: "Tata Punch EV",
    price: "₹ 9.69 - 12.79 Lakh*",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "ev-3",
    name: "Tata Nexon EV Max",
    price: "₹ 14.49 - 19.49 Lakh*",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "ev-4",
    name: "Kia EV6 GT-Line",
    price: "₹ 60.95 - 65.95 Lakh*",
    launchDate: "JUL 23, 2026",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800"
  }
]

export function SearchedAndElectricCars() {
  const { onOpen } = useEnquiryModal()
  const [activeCategory, setActiveCategory] = React.useState<VehicleCategory>("SUV")

  return (
    <section className="py-12 md:py-16 bg-[#f8f9fa] border-t border-black/5">
      <div className="container mx-auto px-4 md:px-8 space-y-16">
        
        {/* SECTION 1: THE MOST SEARCHED CARS */}
        <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-black/10 shadow-sm text-left relative">
          
          <h2 className="text-2xl sm:text-3xl font-black text-[#023468] mb-4 tracking-tight">
            The most searched cars
          </h2>

          {/* Category Filter Tabs */}
          <div className="flex items-center space-x-6 border-b border-black/10 pb-2 mb-6 overflow-x-auto no-scrollbar">
            {(["SUV", "Hatchback", "Sedan", "MUV", "Luxury"] as VehicleCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-extrabold uppercase tracking-wider pb-2 transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                  activeCategory === cat
                    ? "border-[#E31837] text-[#023468]"
                    : "border-transparent text-black/50 hover:text-black"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {searchedCarsData[activeCategory].map((car) => (
              <div
                key={car.id}
                className="bg-white rounded-2xl border border-black/10 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Image Area */}
                  <div className="relative h-44 w-full bg-zinc-200 p-3 flex items-center justify-center overflow-hidden">
                    {car.launchDate && (
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[9px] font-black uppercase tracking-wider text-black/60 px-2.5 py-1 rounded-md z-10 border border-black/5 shadow-xs">
                        LAUNCHED ON : {car.launchDate}
                      </span>
                    )}

                    <Image
                      src={car.image}
                      alt={car.name}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Card Content */}
                  <div className="p-4 text-left">
                    <h3 className="text-sm font-extrabold text-[#023468] mb-1 group-hover:text-[#E31837] transition-colors truncate">
                      {car.name}
                    </h3>
                    <p className="text-xs font-bold text-black/70 mb-4">
                      {car.price}
                    </p>
                  </div>
                </div>

                {/* Offer Action Button */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => onOpen()}
                    className="w-full border border-[#E31837] text-[#E31837] hover:bg-[#E31837] hover:text-white rounded-xl py-2.5 text-xs font-extrabold transition-all duration-300 text-center block cursor-pointer"
                  >
                    View August Offers
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Category Link & Chevron Nav */}
          <div className="mt-6 flex items-center justify-between">
            <Link
              href={`/inventory?type=${activeCategory.toLowerCase()}`}
              className="text-xs font-extrabold text-[#E31837] hover:underline flex items-center gap-1"
            >
              <span>View All {activeCategory} Cars</span>
              <ChevronRight className="h-4 w-4" />
            </Link>

            {/* Floating Navigation Chevron */}
            <div className="hidden sm:flex items-center space-x-2">
              <button className="h-9 w-9 rounded-full border border-black/15 flex items-center justify-center text-black/60 hover:bg-[#023468] hover:text-white transition-colors cursor-pointer shadow-sm">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="h-9 w-9 rounded-full border border-black/15 flex items-center justify-center text-black/60 hover:bg-[#023468] hover:text-white transition-colors cursor-pointer shadow-sm">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>

        {/* SECTION 2: ELECTRIC CARS */}
        <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-black/10 shadow-sm text-left relative">
          
          <h2 className="text-2xl sm:text-3xl font-black text-[#023468] mb-6 tracking-tight">
            Electric cars
          </h2>

          {/* EV Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {electricCarsData.map((car) => (
              <div
                key={car.id}
                className="bg-white rounded-2xl border border-black/10 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Image Area */}
                  <div className="relative h-44 w-full bg-zinc-200 p-3 flex items-center justify-center overflow-hidden">
                    {car.launchDate && (
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[9px] font-black uppercase tracking-wider text-black/60 px-2.5 py-1 rounded-md z-10 border border-black/5 shadow-xs">
                        LAUNCHED ON : {car.launchDate}
                      </span>
                    )}

                    <Image
                      src={car.image}
                      alt={car.name}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Card Content */}
                  <div className="p-4 text-left">
                    <h3 className="text-sm font-extrabold text-[#023468] mb-1 group-hover:text-[#E31837] transition-colors truncate">
                      {car.name}
                    </h3>
                    <p className="text-xs font-bold text-black/70 mb-4">
                      {car.price}
                    </p>
                  </div>
                </div>

                {/* Offer Action Button */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => onOpen()}
                    className="w-full border border-[#E31837] text-[#E31837] hover:bg-[#E31837] hover:text-white rounded-xl py-2.5 text-xs font-extrabold transition-all duration-300 text-center block cursor-pointer"
                  >
                    View August Offers
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Category Link & Chevron Nav */}
          <div className="mt-6 flex items-center justify-between">
            <Link
              href="/inventory?type=ev"
              className="text-xs font-extrabold text-[#E31837] hover:underline flex items-center gap-1"
            >
              <span>View All Electric Cars</span>
              <ChevronRight className="h-4 w-4" />
            </Link>

            {/* Floating Navigation Chevron */}
            <div className="hidden sm:flex items-center space-x-2">
              <button className="h-9 w-9 rounded-full border border-black/15 flex items-center justify-center text-black/60 hover:bg-[#023468] hover:text-white transition-colors cursor-pointer shadow-sm">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="h-9 w-9 rounded-full border border-black/15 flex items-center justify-center text-black/60 hover:bg-[#023468] hover:text-white transition-colors cursor-pointer shadow-sm">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
