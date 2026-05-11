"use client"

import { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const brands = [
  {
    name: "Hyundai",
    slug: "hyundai",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Hyundai_Motor_Company_logo.svg",
    image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800",
    color: "#002C5F"
  },
  {
    name: "Kia",
    slug: "kia",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/47/Kia_logo.svg",
    image: "https://images.unsplash.com/photo-1630501306349-f54256247df6?auto=format&fit=crop&q=80&w=800",
    color: "#BB162B"
  },
  {
    name: "Ford",
    slug: "ford",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Ford_Motor_Company_Logo.svg",
    image: "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?auto=format&fit=crop&q=80&w=800",
    color: "#003478"
  },
  {
    name: "MG Motors",
    slug: "mg",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/MG_Cars_logo.svg/1200px-MG_Cars_logo.svg.png",
    image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800",
    color: "#C41230"
  },
  {
    name: "Tata Motors",
    slug: "tata",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Tata_logo.svg",
    image: "https://images.unsplash.com/photo-1620217405794-67f0a84976ca?auto=format&fit=crop&q=80&w=800",
    color: "#00539E"
  },
  {
    name: "Mahindra",
    slug: "mahindra",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Mahindra_Rise_logo.svg",
    image: "https://images.unsplash.com/photo-1662458421060-61f434751f89?auto=format&fit=crop&q=80&w=800",
    color: "#ED1C24"
  }
]

export function BrandsShowcase() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener("resize", checkScroll)
    return () => window.removeEventListener("resize", checkScroll)
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current
      const scrollAmount = direction === "left" ? -clientWidth : clientWidth
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4 tracking-tight">
              Our Premium <span className="text-black/20">Partners</span>
            </h2>
            <p className="text-black/60 max-w-xl font-light">
              Curating the world&apos;s finest automotive brands under one roof. 
              Experience excellence across our diverse portfolio.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 mr-4">
               <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full h-12 w-12 border-black/5 disabled:opacity-30 transition-all"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
               >
                 <ChevronLeft className="h-6 w-6" />
               </Button>
               <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full h-12 w-12 border-black/5 disabled:opacity-30 transition-all"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
               >
                 <ChevronRight className="h-6 w-6" />
               </Button>
            </div>
            <Button variant="outline" className="rounded-full border-black/10 hover:bg-black hover:text-white transition-all hidden md:flex">
              View All Brands
            </Button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex space-x-8 overflow-x-auto pb-12 no-scrollbar snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {brands.map((brand, index) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.1,
                ease: [0.21, 1.02, 0.47, 0.98] 
              }}
              viewport={{ once: true, margin: "-50px" }}
              className="flex-shrink-0 w-full md:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)] snap-start group relative h-[450px] rounded-[32px] overflow-hidden border border-black/5 bg-zinc-50"
            >
              <Link href={`/brands/${brand.slug}`} className="block h-full">
                {/* Image Container */}
                <div className="absolute inset-0 z-0">
                  <Image 
                    src={brand.image} 
                    alt={brand.name} 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                
                <div className="relative z-10 h-full flex flex-col justify-end p-10">
                  <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500 border border-black/5">
                    <Image 
                      src={brand.logo} 
                      alt={`${brand.name} logo`} 
                      width={32}
                      height={32}
                      className="h-8 w-8 object-contain" 
                    />
                  </div>

                  
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{brand.name}</h3>
                    <p className="text-xs text-white/60 mb-6 opacity-0 translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 uppercase tracking-widest font-bold">
                      Discover the latest {brand.name} lineup.
                    </p>
                  </div>
                  
                  <div className="flex items-center text-xs font-bold uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">
                    Explore Now
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

