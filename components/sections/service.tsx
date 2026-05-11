"use client"

import { motion } from "framer-motion"
import { Wrench, CheckCircle2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"


export function ServiceWorkshop() {
  return (
    <section className="py-24 bg-white overflow-hidden relative">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          {/* Left: Content */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.21, 1.02, 0.47, 0.98] }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <span className="text-sm font-bold uppercase tracking-[0.3em] text-[#023468] mb-4 inline-block">
                Master Service
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-8 tracking-tight">
                Expert Care for Your <br />
                <span className="text-black/20">Masterpiece</span>
              </h2>
              <p className="text-black/60 text-lg mb-12 max-w-lg leading-relaxed font-light">
                Our state-of-the-art workshops are equipped with the latest diagnostic tools and staffed by factory-trained technicians who treat every vehicle like a work of art.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                 <div className="p-8 rounded-[32px] bg-zinc-50 border border-black/5 hover:border-[#023468]/20 transition-all duration-500 group">
                    <div className="flex items-center space-x-4 mb-6">
                       <div className="h-10 w-10 bg-[#023468]/10 flex items-center justify-center rounded-full">
                          <Wrench className="h-5 w-5 text-[#023468]" />
                       </div>
                       <h4 className="text-xl font-bold text-black tracking-tight">Express Service</h4>
                    </div>

                    <div className="space-y-6 mb-10">
                       <div className="flex items-center space-x-3">
                          <CheckCircle2 className="h-4 w-4 text-[#023468]" />
                          <span className="text-sm text-black/60">60-Min Quick Turnaround</span>
                       </div>
                       <div className="flex items-center space-x-3">
                          <CheckCircle2 className="h-4 w-4 text-[#023468]" />
                          <span className="text-sm text-black/60">Genuine OEM Spare Parts</span>
                       </div>
                       <div className="flex items-center space-x-3">
                          <CheckCircle2 className="h-4 w-4 text-[#023468]" />
                          <span className="text-sm text-black/60">Certified Technicians</span>
                       </div>
                    </div>

                    <Button variant="outline" className="w-full rounded-full border-black/10 text-black hover:bg-black hover:text-white transition-all group-hover:scale-[1.02]">
                       Book Now
                    </Button>
                 </div>

                 <div className="p-8 rounded-[32px] bg-zinc-50 border border-black/5 hover:border-[#023468]/20 transition-all duration-500 group">
                    <div className="flex items-center space-x-4 mb-6">
                       <div className="h-10 w-10 bg-[#023468]/10 flex items-center justify-center rounded-full">
                          <ShieldCheck className="h-5 w-5 text-[#023468]" />
                       </div>
                       <h4 className="text-xl font-bold text-black tracking-tight">Body & Paint</h4>
                    </div>

                    <div className="space-y-6 mb-10">
                       <div className="flex items-center space-x-3">
                          <CheckCircle2 className="h-4 w-4 text-[#023468]" />
                          <span className="text-sm text-black/60">Computerized Paint Mix</span>
                       </div>
                       <div className="flex items-center space-x-3">
                          <CheckCircle2 className="h-4 w-4 text-[#023468]" />
                          <span className="text-sm text-black/60">Cashless Insurance Claim</span>
                       </div>
                       <div className="flex items-center space-x-3">
                          <CheckCircle2 className="h-4 w-4 text-[#023468]" />
                          <span className="text-sm text-black/60">Precision Tinkering</span>
                       </div>
                    </div>

                    <Button variant="outline" className="w-full rounded-full border-black/10 text-black hover:bg-black hover:text-white transition-all group-hover:scale-[1.02]">
                       Request Quote
                    </Button>
                 </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Floating Elements & Image */}
          <div className="lg:w-1/2 relative h-[600px] w-full">
             <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 30 }}
               whileInView={{ opacity: 1, scale: 1, y: 0 }}
               transition={{ duration: 1.2, ease: [0.21, 1.02, 0.47, 0.98] }}
               viewport={{ once: true, margin: "-100px" }}
               className="h-full w-full rounded-[40px] overflow-hidden shadow-2xl border border-black/5"
             >
                <Image 
                  src="https://images.unsplash.com/photo-1635334651336-0562e84d4368?auto=format&fit=crop&q=80&w=1000" 
                  alt="Service Bay" 
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="h-full w-full object-cover" 
                />

                
                <div className="absolute top-12 right-12 bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-white/40 shadow-xl max-w-xs">
                   <div className="flex items-center space-x-4 mb-4">
                      <div className="h-10 w-10 bg-[#023468] flex items-center justify-center rounded-full text-white shadow-lg">
                         <div className="text-xl font-bold">A+</div>
                      </div>
                      <h4 className="text-black font-bold">5-Star Rated Service</h4>
                   </div>
                   <p className="text-black/60 text-sm leading-relaxed">Recognized for consistently delivering exceptional service quality across all our locations.</p>
                </div>
                
                <div className="absolute bottom-12 left-12 bg-black/90 p-8 rounded-3xl shadow-2xl max-w-xs">
                   <h4 className="text-white font-bold mb-2">24/7 Roadside</h4>
                   <p className="text-white/60 text-sm mb-4 leading-relaxed">We&apos;re always there when you need us most. Instant assistance anywhere, anytime.</p>
                   <div className="flex items-center space-x-3 text-[#023468] font-bold">
                      <div className="h-2 w-2 rounded-full bg-[#023468] animate-pulse" />
                      <span>Call Now: 1800-AM-GROUP</span>
                   </div>
                </div>
             </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
