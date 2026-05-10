"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { Handshake, Car, MapPin, Users } from "lucide-react"

const stats = [
  {
    label: "Years of Trust",
    value: 50,
    suffix: "+",
    icon: Handshake,
  },
  {
    label: "Vehicles Sold Per Year",
    value: 10,
    suffix: "K+",
    icon: Car,
  },
  {
    label: "Dealership Locations",
    value: 26,
    suffix: "",
    icon: MapPin,
  },
  {
    label: "Happy Customers",
    value: 5,
    suffix: "L+",
    icon: Users,
  },
]

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      let start = 0
      const end = value
      const duration = 2000
      const increment = end / (duration / 16)
      
      const timer = setInterval(() => {
        start += increment
        if (start >= end) {
          setCount(end)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 16)
      return () => clearInterval(timer)
    }
  }, [isInView, value])

  return (
    <span ref={ref} className="text-5xl md:text-6xl font-black text-[#E31837]">
      {count}{suffix}
    </span>
  )
}

export function WhyUs() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=2000" 
          alt="Why Choose AM Group" 
          className="h-full w-full object-cover brightness-[0.2]" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#023468]/60 via-transparent to-[#023468]/60" />
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-light text-white"
          >
            Why <span className="font-bold">us</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: [0.21, 1.02, 0.47, 0.98] }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center group"
            >
              <div className="mb-8 relative">
                 <div className="absolute inset-0 bg-[#E31837]/20 blur-2xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700" />
                 <stat.icon className="h-12 w-12 text-white relative z-10 stroke-[1.5] group-hover:scale-110 transition-transform duration-500" />
              </div>
              
              <div className="mb-4">
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              
              <p className="text-white/60 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
