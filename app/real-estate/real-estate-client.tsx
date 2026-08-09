"use client"

import React from "react"
import { motion } from "framer-motion"
import { Building2, Home, MapPin, Key, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function RealEstatePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Official Image */}
      <section className="relative min-h-[70vh] flex items-center bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://amgroupind.com/wp-content/uploads/2024/10/real-estate.jpg" 
            alt="AM Real Estate" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none" />
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10 pt-32">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.21, 1.02, 0.47, 0.98] }}
            >
              <div className="mb-10 inline-flex items-center gap-4">
                <div className="h-[1px] w-12 bg-amber-400/30" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-400/40">
                  Development Portfolio
                </span>
              </div>
              
              <h1 className="text-[54px] md:text-[96px] font-bold text-white leading-[0.9] tracking-tight mb-12">
                Real <br />
                <span className="text-amber-400 italic font-light">Estate</span>
              </h1>
              
              <p className="text-white/60 text-xl md:text-2xl font-light leading-relaxed max-w-2xl border-l border-white/10 pl-10 mb-12">
                The AM Group specializes in real estate developments, including building apartments, 
                villas, automotive dealerships, and remodeling. We are committed to delivering high-quality 
                properties that meet the specific needs of our clients.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-5xl font-bold text-[#023468] mb-8 tracking-tight">
                  Expertise & <span className="text-black/20">Innovation</span>
                </h2>
                <p className="text-black/60 text-lg leading-relaxed font-light mb-8">
                  With extensive experience in the industry, we bring expertise and innovation to every project. From luxurious residential villas to specialized automotive dealerships, our developments are a testament to our commitment to excellence.
                </p>
                <div className="grid grid-cols-2 gap-8">
                   {[
                     { label: "Design", value: "Modern" },
                     { label: "Quality", value: "Premium" },
                     { label: "Projects", value: "25+" },
                     { label: "Legacy", value: "Decades" }
                   ].map((stat) => (
                     <div key={stat.label} className="border-l border-zinc-100 pl-6">
                        <div className="text-xs font-black uppercase tracking-widest text-black/20 mb-1">{stat.label}</div>
                        <div className="text-xl font-bold text-[#023468]">{stat.value}</div>
                     </div>
                   ))}
                </div>
              </motion.div>

              {/* Video Showcase Placeholder */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative aspect-video rounded-[40px] overflow-hidden shadow-2xl border border-black/5 bg-zinc-950 group"
              >
                <iframe 
                  src="https://www.youtube.com/embed/yQ1dFQMrZuQ?rel=0&showinfo=0" 
                  className="absolute inset-0 w-full h-full"
                  title="The Amaltas One"
                  allowFullScreen
                />
              </motion.div>
           </div>
        </div>
      </section>

      {/* Projects Gallery */}
      <section className="py-32 bg-zinc-50 overflow-hidden">
        <div className="container mx-auto px-6 md:px-12 mb-20 text-center">
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600 mb-4 block">Our Projects</span>
           <h2 className="text-4xl md:text-5xl font-bold text-[#023468]">Architectural <span className="text-black/20">Masterpieces</span></h2>
        </div>
        
        <div className="container mx-auto px-6 md:px-12">
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {[
              "https://amgroupind.com/wp-content/uploads/2024/10/02.jpg",
              "https://amgroupind.com/wp-content/uploads/2024/10/01.png",
              "https://amgroupind.com/wp-content/uploads/2024/10/03.jpg",
              "https://amgroupind.com/wp-content/uploads/2024/10/04.jpg",
              "https://amgroupind.com/wp-content/uploads/2024/10/05.jpg",
              "https://amgroupind.com/wp-content/uploads/2024/10/triumph-1.jpg",
              "https://amgroupind.com/wp-content/uploads/2025/01/be709646-8ac1-43d5-b3aa-01164b776500.jpg",
              "https://amgroupind.com/wp-content/uploads/2025/01/IMG_9035.jpeg"
            ].map((src, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative break-inside-avoid rounded-[32px] overflow-hidden group border border-black/5 shadow-xl"
              >
                <img 
                  src={src} 
                  alt={`Project ${index + 1}`} 
                  className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                   <div className="text-white">
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Signature Project</div>
                      <div className="text-xl font-bold">Premium Development</div>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Highlight (Shared Style) */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { icon: Building2, title: "Modern Design", desc: "Contemporary architectural masterpieces designed for the future." },
              { icon: Home, title: "Luxury Living", desc: "Thoughtfully crafted spaces with premium amenities and finishes." },
              { icon: MapPin, title: "Prime Locations", desc: "Developing properties in the most coveted neighborhoods." },
              { icon: Key, title: "Investment", desc: "High-value real estate opportunities with significant growth potential." },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="h-16 w-16 bg-zinc-50 rounded-[24px] flex items-center justify-center mb-8 group-hover:bg-amber-400 transition-all duration-500">
                  <item.icon className="h-8 w-8 text-[#023468] group-hover:text-black transition-colors" />
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
