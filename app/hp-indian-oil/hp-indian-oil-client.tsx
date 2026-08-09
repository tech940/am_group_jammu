"use client"

import React from "react"
import { motion } from "framer-motion"
import { Droplets, Fuel, Award, Globe, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EnergyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Official Image */}
      <section className="relative min-h-[70vh] flex items-center bg-[#023468] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://amgroupind.com/wp-content/uploads/2024/10/HP-and-Indian-Oil.jpg" 
            alt="HP and Indian Oil" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#023468] via-[#023468]/80 to-transparent pointer-events-none" />
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10 pt-32">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.21, 1.02, 0.47, 0.98] }}
            >
              <div className="mb-10 inline-flex items-center gap-4">
                <div className="h-[1px] w-12 bg-white/20" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">
                  About Our Energy Vertical
                </span>
              </div>
              
              <h1 className="text-[54px] md:text-[96px] font-bold text-white leading-[0.9] tracking-tight mb-12">
                HP & <br />
                <span className="text-blue-400 italic font-light">Indian Oil</span>
              </h1>
              
              <p className="text-white/60 text-xl md:text-2xl font-light leading-relaxed max-w-2xl border-l border-white/10 pl-10 mb-12">
                Our group owns gas distribution for Indian Oil and Hindustan Petroleum, 
                as well as gas stations for Indian Oil Corp. We are a prominent player in the 
                Indian oil and gas industry, providing essential fuels and petroleum products nationwide.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Section with Side Images */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-[#023468] tracking-tight">
                National <span className="text-black/20">Distribution Network</span>
              </h2>
              <p className="text-black/60 text-lg leading-relaxed font-light">
                Our extensive network of gas stations and gas distribution infrastructure enables us to efficiently transport and distribute fuel to our customers, supporting their energy needs and contributing to the growth of the Indian economy.
              </p>
              <p className="text-black/60 text-lg leading-relaxed font-light">
                Our unwavering commitment to quality and customer satisfaction has established us as a trusted partner in India&apos;s energy sector.
              </p>
              
              <div className="pt-8">
                <div className="flex gap-4">
                  <div className="h-14 w-14 bg-[#023468]/5 rounded-2xl flex items-center justify-center">
                    <Fuel className="h-6 w-6 text-[#023468]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#023468] uppercase tracking-widest text-xs mb-1">Fueling Growth</h4>
                    <p className="text-black/40 text-sm">Supporting the heartbeat of Indian commerce.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="aspect-[3/4] rounded-[40px] overflow-hidden shadow-2xl border border-black/5"
              >
                <img 
                  src="https://amgroupind.com/wp-content/uploads/2024/10/indian-oil-1-1024x768.webp" 
                  alt="Indian Oil Station" 
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="aspect-[3/4] rounded-[40px] overflow-hidden shadow-2xl border border-black/5 mt-12"
              >
                <img 
                  src="https://amgroupind.com/wp-content/uploads/2024/10/hp-1024x683.webp" 
                  alt="HP Station" 
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Shared Services Grid */}
      <section className="py-32 bg-zinc-50">
        <div className="container mx-auto px-6 md:px-12 text-center mb-16">
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#023468] mb-4 block">Our Operations</span>
           <h2 className="text-4xl md:text-5xl font-bold text-[#023468]">Commitment to <span className="text-black/20">Excellence</span></h2>
        </div>
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { icon: Fuel, title: "Premium Fuel", desc: "High-octane and additives-enriched fuels for better engine life." },
              { icon: Droplets, title: "Lubricants", desc: "Full range of high-performance lubricants for all vehicle types." },
              { icon: Award, title: "Trust & Quality", desc: "Certified volume and quality checks for absolute transparency." },
              { icon: Globe, title: "Wide Network", desc: "Strategically located outlets across the region for your convenience." },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group p-8 bg-white rounded-[32px] border border-black/5 hover:border-[#023468]/20 transition-all duration-500 shadow-sm"
              >
                <div className="h-16 w-16 bg-[#023468]/5 rounded-[24px] flex items-center justify-center mb-8 group-hover:bg-[#023468] transition-all duration-500">
                  <item.icon className="h-8 w-8 text-[#023468] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-[#023468] mb-4 uppercase tracking-tight">{item.title}</h3>
                <p className="text-black/50 leading-relaxed font-light">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
