"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const showcaseItems = [
  {
    id: 1,
    brand: "Hyundai",
    model: "IONIQ 6",
    tag: "Electric Sedan",
    year: "2025",
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1200",
    href: "/inventory",
  },
  {
    id: 2,
    brand: "Kia",
    model: "EV6",
    tag: "Electric Crossover",
    year: "2025",
    image: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?auto=format&fit=crop&q=80&w=1200",
    href: "/inventory",
  },
  {
    id: 3,
    brand: "Mahindra",
    model: "XEV 9e",
    tag: "Electric SUV",
    year: "2025",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200",
    href: "/inventory",
  },
  {
    id: 4,
    brand: "Tata",
    model: "Harrier EV",
    tag: "Electric SUV",
    year: "2025",
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=1200",
    href: "/inventory",
  },
  {
    id: 5,
    brand: "MG",
    model: "Gloster",
    tag: "Flagship SUV",
    year: "2025",
    image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=1200",
    href: "/inventory",
  },
]

export function ShowcaseCarousel() {
  const [active, setActive] = useState(2)
  const [paused, setPaused] = useState(false)
  const total = showcaseItems.length

  const prev = () => setActive((a) => (a - 1 + total) % total)
  const next = () => setActive((a) => (a + 1) % total)

  // Auto-play every 3.5 s, pause on hover
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      setActive((a) => (a + 1) % total)
    }, 1500)
    return () => clearInterval(id)
  }, [paused, total])

  // Relative position: -2, -1, 0, +1, +2
  const getRelPos = (i: number) => {
    let d = i - active
    if (d > total / 2) d -= total
    if (d < -total / 2) d += total
    return d
  }

  const cardStyles = (rel: number) => {
    const abs = Math.abs(rel)
    if (abs > 2) return null // hide beyond 2 positions

    const x = rel * 310        // horizontal offset px
    const scale = rel === 0 ? 1 : rel === -1 || rel === 1 ? 0.82 : 0.66
    const z = 30 - abs * 10
    const opacity = abs > 1 ? 0.5 : 1
    const rotateY = rel * -12  // subtle 3-D tilt

    return { x, scale, z, opacity, rotateY }
  }

  return (
    <section className="py-24 md:py-32 bg-[#EEF1F8] overflow-hidden relative">
      {/* Background texture */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#023468]/6 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Heading */}
        <div className="text-center mb-14 px-4">
          <div className="inline-flex items-center gap-2 bg-[#023468] text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-5 shadow-lg shadow-[#023468]/20">
            <span>Explore The Collection</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#023468] leading-none tracking-tight mb-4">
            Drive Something<br />
            <span className="text-[#023468]/25">Extraordinary</span>
          </h2>
          <p className="text-black/50 font-medium text-base max-w-md mx-auto">
            From electric crossovers to flagship SUVs — discover J&amp;K&apos;s finest automotive collection at AM Group.
          </p>
        </div>

        {/* Carousel Stage */}
        <div
          className="relative flex items-center justify-center h-[380px] sm:h-[440px] perspective-[1200px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {showcaseItems.map((item, i) => {
            const rel = getRelPos(i)
            const style = cardStyles(rel)
            if (!style) return null

            return (
              <motion.div
                key={item.id}
                animate={{
                  x: style.x,
                  scale: style.scale,
                  opacity: style.opacity,
                  rotateY: style.rotateY,
                  zIndex: style.z,
                }}
                transition={{ type: "spring", damping: 30, stiffness: 200 }}
                className="absolute cursor-pointer"
                onClick={() => {
                  if (rel < 0) prev()
                  else if (rel > 0) next()
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className={`relative w-[260px] sm:w-[320px] h-[330px] sm:h-[400px] rounded-[28px] overflow-hidden shadow-2xl border-2 transition-all duration-300 ${
                    rel === 0
                      ? "border-white shadow-black/25"
                      : "border-white/40 shadow-black/10"
                  }`}
                >
                  <Image
                    src={item.image}
                    alt={`${item.brand} ${item.model}`}
                    fill
                    sizes="320px"
                    className="object-cover"
                    unoptimized
                  />

                  {/* Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  {/* Top Tag */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-md text-[#023468] text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                      {item.tag}
                    </span>
                  </div>

                  {/* Bottom Info — only on active */}
                  <AnimatePresence>
                    {rel === 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                        className="absolute bottom-0 left-0 right-0 p-5"
                      >
                        <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">
                          {item.year} • {item.brand}
                        </p>
                        <h3 className="text-white text-2xl font-black leading-none mb-3">{item.model}</h3>
                        <Link
                          href={item.href}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 bg-white text-[#023468] text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full hover:bg-[#023468] hover:text-white transition-all group"
                        >
                          View Details
                          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            onClick={prev}
            className="h-12 w-12 rounded-full border-2 border-[#023468]/20 bg-white hover:bg-[#023468] hover:border-[#023468] text-[#023468] hover:text-white flex items-center justify-center transition-all shadow-md cursor-pointer group"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Dots */}
          <div className="flex gap-2">
            {showcaseItems.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  i === active
                    ? "w-7 h-2.5 bg-[#023468]"
                    : "w-2.5 h-2.5 bg-[#023468]/20 hover:bg-[#023468]/40"
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="h-12 w-12 rounded-full border-2 border-[#023468]/20 bg-[#023468] hover:bg-[#01254a] border-[#023468] text-white flex items-center justify-center transition-all shadow-md cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10">
          <Link
            href="/inventory"
            className="inline-flex items-center gap-2 text-[#023468] font-black text-[11px] uppercase tracking-widest border-b-2 border-[#023468]/20 hover:border-[#023468] pb-1 transition-all group"
          >
            Browse All Vehicles
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
