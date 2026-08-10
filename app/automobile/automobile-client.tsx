"use client"

import React from "react"
import { motion } from "framer-motion"
import { Car, Shield, Settings, Zap, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GroupBrands } from "@/components/sections/group-brands"
import type { HomeInventory } from "@/lib/inventory/server"

export default function AutomobilePage({ byBodyType }: { byBodyType: HomeInventory["byBodyType"] }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-white/[0.03] rounded-full blur-[150px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[#E31837]/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-3xl pointer-events-none" />
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10 pt-32">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.21, 1.02, 0.47, 0.98] }}
            >
              <div className="mb-10 inline-flex items-center gap-4">
                <div className="h-[1px] w-12 bg-[#E31837]" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#E31837]">
                  Automotive Excellence
                </span>
              </div>
              
              <h1 className="text-[54px] md:text-[96px] font-bold text-white leading-[0.9] tracking-tight mb-12">
                Redefining the <br />
                <span className="text-[#E31837] italic font-light">Driving</span> Experience
              </h1>
              
              <p className="text-white/40 text-xl md:text-2xl font-light leading-relaxed max-w-2xl border-l border-white/5 pl-10 mb-12">
                AM Group Jammu brings you the world&apos;s most prestigious automotive brands with 
                unparalleled service and expertise.
              </p>

              <Button size="xl" className="bg-[#E31837] hover:bg-[#c4152f] text-white rounded-full px-12 py-8 font-black uppercase tracking-widest text-xs transition-all duration-500 shadow-2xl shadow-[#E31837]/20">
                Explore Brands
                <ArrowRight className="ml-4 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Excellence Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { icon: Car, title: "Premium Fleet", desc: "Curated selection of high-performance and luxury vehicles." },
              { icon: Shield, title: "Certified Quality", desc: "Every vehicle undergoes rigorous multi-point inspections." },
              { icon: Settings, title: "Expert Service", desc: "State-of-the-art service centers with factory-trained technicians." },
              { icon: Zap, title: "Innovation", desc: "Leading the transition to sustainable and electric mobility." },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="h-16 w-16 bg-zinc-50 rounded-[24px] flex items-center justify-center mb-8 group-hover:bg-[#E31837] transition-all duration-500">
                  <item.icon className="h-8 w-8 text-[#023468] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-[#023468] mb-4 uppercase tracking-tight">{item.title}</h3>
                <p className="text-black/50 leading-relaxed font-light">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Gallery Section */}
      <div className="bg-[#FAFAFA] pt-24 pb-12">
        <div className="container mx-auto px-6 md:px-12">
           <div className="mb-16">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E31837] mb-4 block">Our Portfolio</span>
              <h2 className="text-4xl font-bold text-[#023468]">Strategic Brand <span className="text-black/20">Partnerships</span></h2>
           </div>
        </div>
        <GroupBrands byBodyType={byBodyType} />
      </div>
    </div>
  )
}
