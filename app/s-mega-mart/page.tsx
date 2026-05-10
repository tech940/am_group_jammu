"use client"

import React from "react"
import { motion } from "framer-motion"
import { ShoppingCart, Star, Clock, Heart, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function RetailPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Official Image */}
      <section className="relative min-h-[70vh] flex items-center bg-[#064e3b] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://amgroupind.com/wp-content/uploads/2025/04/2025-04-02-1024x768.jpg" 
            alt="S Mega Mart Storefront" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#064e3b] via-[#064e3b]/80 to-transparent pointer-events-none" />
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10 pt-32">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.21, 1.02, 0.47, 0.98] }}
            >
              <div className="mb-10 inline-flex items-center gap-4">
                <div className="h-[1px] w-12 bg-emerald-400/30" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-400/50">
                  Our Retail Mission
                </span>
              </div>
              
              <h1 className="text-[54px] md:text-[96px] font-bold text-white leading-[0.9] tracking-tight mb-12">
                S Mega <br />
                <span className="text-emerald-400/20 italic font-light">Mart</span>
              </h1>
              
              <p className="text-white/80 text-xl md:text-2xl font-light leading-relaxed max-w-2xl border-l border-emerald-400/20 pl-10 mb-12">
                At S Mega Mart, our mission is to become a trusted, nationwide destination 
                for affordable shopping. We are committed to simplifying daily life 
                through value-driven retail.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Strategy Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-32">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-5xl font-bold text-[#023468] mb-10 tracking-tight">
                  Our <span className="text-black/20">Growth Strategy</span>
                </h2>
                <div className="space-y-8">
                   {[
                     { title: "Pan-India Expansion", desc: "Opening stores in key cities and towns to build a strong national presence." },
                     { title: "Value + Variety", desc: "Offering a wide product range from groceries to home appliances at unbeatable prices." },
                     { title: "Customer First", desc: "Prioritizing great service, clean stores, and a smooth shopping experience." },
                     { title: "Smart Operations", desc: "Leveraging technology for efficient inventory and future e-commerce growth." },
                     { title: "Local Connection", desc: "Hiring locally and stocking region-relevant products to support communities." }
                   ].map((item, i) => (
                     <div key={i} className="flex gap-6 items-start group">
                        <div className="h-6 w-6 rounded-full border-2 border-emerald-500 flex-shrink-0 mt-1 flex items-center justify-center group-hover:bg-emerald-500 transition-all duration-300">
                           <div className="h-2 w-2 rounded-full bg-emerald-500 group-hover:bg-white" />
                        </div>
                        <div>
                           <h4 className="font-bold text-[#023468] uppercase tracking-widest text-[10px] mb-2">{item.title}</h4>
                           <p className="text-black/50 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative aspect-square rounded-[40px] overflow-hidden shadow-2xl border border-black/5"
              >
                <img 
                  src="https://amgroupind.com/wp-content/uploads/2025/04/2025-04-02-1024x768.jpg" 
                  alt="S Mega Mart Operations" 
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent" />
              </motion.div>
           </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-32 bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-3xl pointer-events-none" />
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
           <div className="max-w-4xl mx-auto">
              <div className="text-center mb-20">
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-4 block">Future Outlook</span>
                 <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Mission & <span className="text-white/20">Vision</span></h2>
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-12 rounded-[40px] hover:border-emerald-500/30 transition-all duration-500"
                 >
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-4">
                       <span className="h-2 w-10 bg-emerald-500 rounded-full" />
                       Our Mission
                    </h3>
                    <p className="text-white/60 leading-relaxed font-light text-lg">
                       To provide every Indian household with a smart, affordable, and convenient shopping experience by offering a wide range of quality products under one roof. We aim to simplify daily life through value-driven retail.
                    </p>
                 </motion.div>

                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    viewport={{ once: true }}
                    className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-12 rounded-[40px] hover:border-blue-400/30 transition-all duration-500"
                 >
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-4">
                       <span className="h-2 w-10 bg-blue-400 rounded-full" />
                       Our Vision
                    </h3>
                    <p className="text-white/60 leading-relaxed font-light text-lg">
                       To become India&apos;s most trusted and preferred hypermarket brand—known for affordability, variety, and customer-centric innovation—while creating a positive impact in every community we serve.
                    </p>
                 </motion.div>
              </div>
           </div>
        </div>
      </section>

      {/* Excellence Grid (Shared Style) */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { icon: ShoppingCart, title: "Curated Goods", desc: "A handpicked selection of daily essentials and premium global brands." },
              { icon: Star, title: "Premium Quality", desc: "Rigorous quality checks to ensure the best products for your family." },
              { icon: Clock, title: "Freshness", desc: "Fresh produce and dairy products delivered daily to our shelves." },
              { icon: Heart, title: "Customer Care", desc: "Dedicated support team committed to an exceptional shopping experience." },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="h-16 w-16 bg-emerald-500/5 rounded-[24px] flex items-center justify-center mb-8 group-hover:bg-emerald-500 transition-all duration-500">
                  <item.icon className="h-8 w-8 text-emerald-500 group-hover:text-white transition-colors" />
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
