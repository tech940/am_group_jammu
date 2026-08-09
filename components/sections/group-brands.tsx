"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const bodyStyles = [
  {
    name: "SUVs",
    count: "45 Vehicles",
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=800",
    href: "/inventory?type=suv"
  },
  {
    name: "Commercial & Fleet",
    count: "32 Vehicles",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800",
    href: "/inventory?type=truck"
  },
  {
    name: "Sedans & Hatchbacks",
    count: "28 Vehicles",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800",
    href: "/inventory?type=sedan"
  },
  {
    name: "Vans & Luxury MUVs",
    count: "12 Vehicles",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800",
    href: "/inventory?type=van"
  }
]

export function GroupBrands() {
  return (
    <section className="py-20 bg-white border-t border-black/5">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-[#023468]">
              Explore by Body Style
            </h2>
            <p className="text-black/60 text-sm font-medium mt-1">
              Find the perfect category tailored to your driving style.
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

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bodyStyles.map((style) => (
            <div key={style.name}>
              <Link href={style.href} className="group block">
                <div className="bg-white rounded-[28px] overflow-hidden border border-black/10 shadow-sm hover:shadow-xl transition-all duration-500">
                  
                  {/* Image Area */}
                  <div className="relative h-48 w-full bg-zinc-200 overflow-hidden">
                    <Image
                      src={style.image}
                      alt={style.name}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  {/* Text Content */}
                  <div className="p-6 text-left">
                    <h3 className="text-lg font-extrabold text-[#023468] group-hover:text-[#E31837] transition-colors">
                      {style.name}
                    </h3>
                    <p className="text-xs font-bold text-black/50 mt-1">
                      {style.count}
                    </p>
                  </div>

                </div>
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
