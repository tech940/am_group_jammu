"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"


const sliderImages = [
  "https://amgroupind.com/wp-content/uploads/2024/11/3.jpg",
  "https://amgroupind.com/wp-content/uploads/2024/11/4.jpg",
  "https://amgroupind.com/wp-content/uploads/2024/11/6.jpg",
  "https://amgroupind.com/wp-content/uploads/2024/11/2.jpg",
  "https://amgroupind.com/wp-content/uploads/2024/11/1.jpg"
]

export function Hero() {
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % sliderImages.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const next = () => setCurrent((prev) => (prev + 1) % sliderImages.length)
  const prev = () => setCurrent((prev) => (prev - 1 + sliderImages.length) % sliderImages.length)

  return (
    <section className="relative h-screen w-full bg-[#f8f9fa] px-4 py-4 md:px-8 md:py-8 overflow-hidden">
      {/* Outer rounded container */}
      <div className="relative h-full w-full rounded-[40px] overflow-hidden bg-white border border-black/5 shadow-2xl">
        
        {/* Slider Background */}
        <div className="absolute inset-0 z-0 bg-zinc-100">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={current}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image 
                src={sliderImages[current]} 
                alt={`Slide ${current + 1}`} 
                fill
                priority={current === 0}
                className="object-cover brightness-75 transition-all duration-1000"
                sizes="100vw"
                quality={90}
              />
            </motion.div>
          </AnimatePresence>
          
          {/* Preload Next Image Hidden */}
          <div className="hidden">
             <Image 
                src={sliderImages[(current + 1) % sliderImages.length]} 
                alt="preload" 
                fill
                sizes="1px"
             />
          </div>

          {/* High-Contrast Overlays */}
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />
        </div>

        {/* Content */}
        <div className="container mx-auto relative z-10 flex h-full flex-col justify-center px-8 md:px-16">
          <motion.div
            key={`content-${current}`}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-5xl"
          >
            <span className="mb-6 inline-block text-xs font-bold uppercase tracking-[0.5em] text-black/60 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-black/5">
              Est. 1990 — Jammu & Kashmir
            </span>
            <h1 className="mb-8 text-4xl font-bold leading-[1.1] tracking-tight text-white drop-shadow-lg md:text-6xl lg:text-7xl">
              AM Group
            </h1>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
              <p className="max-w-md text-lg text-white font-medium drop-shadow-md leading-relaxed">
                We team up with the world&apos;s most iconic automotive brands to ensure your journey is nothing short of extraordinary.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="xl" className="bg-[#023468] text-white hover:bg-[#01254a] rounded-full px-10 h-14 font-bold border-none transition-all hover:scale-105 active:scale-95 group shadow-xl cursor-pointer">
                  <Link href="/inventory" target="_blank">
                    Explore Models
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>


                <div className="bg-white/80 backdrop-blur-md rounded-full px-4 py-2 flex items-center space-x-2 border border-white/20">
                   <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-zinc-200" />
                      ))}
                   </div>
                   <span className="text-xs font-bold text-black/80 pr-2">50K+ Happy Customers</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Slider Controls */}
        <div className="absolute bottom-12 right-12 z-20 flex space-x-4">
           <button 
             onClick={prev}
             className="h-12 w-12 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-black hover:bg-white transition-all border border-black/5"
           >
             <ChevronLeft className="h-6 w-6" />
           </button>
           <button 
             onClick={next}
             className="h-12 w-12 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-black hover:bg-white transition-all border border-black/5"
           >
             <ChevronRight className="h-6 w-6" />
           </button>
        </div>

        {/* Feature Bar */}
        <div className="absolute bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-black/5 py-4 md:py-6 px-6 md:px-12">
           <div className="flex flex-wrap justify-center md:justify-between items-center gap-4 md:gap-8">
              {[
                "Authorized Dealer",
                "24/7 Roadside Assistance",
                "Certified Service Center",
                "Genuine Spares"
              ].map((text) => (
                <div key={text} className="flex items-center space-x-2 md:space-x-3">
                   <div className="h-1.5 w-1.5 rounded-full bg-[#023468]" />
                   <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-black/60">{text}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </section>
  )
}
