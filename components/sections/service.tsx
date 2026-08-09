"use client"

import { motion } from "framer-motion"
import { Wrench, CheckCircle2, ShieldCheck, PhoneCall } from "lucide-react"
import Image from "next/image"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"

export function ServiceWorkshop() {
  const { onOpen } = useEnquiryModal()

  return (
    <section className="py-12 md:py-20 bg-white overflow-hidden relative border-t border-black/5">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
          
          {/* Left: Content */}
          <div className="lg:w-1/2 space-y-5 text-left">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.2em] bg-[#023468] text-white px-4 py-1.5 rounded-full mb-4">
                <Wrench className="h-3.5 w-3.5" />
                <span>Master Service &amp; Workshop</span>
              </div>
              
              <h2 className="text-[29px] sm:text-[37px] md:text-[45px] font-extrabold text-[#023468] mb-4 tracking-tight leading-[1.12]">
                Expert Care for Your <br />
                <span className="text-[#E31837]">Vehicle Masterpiece</span>
              </h2>
              
              <p className="text-black/70 text-xs sm:text-sm md:text-base mb-8 max-w-lg leading-relaxed font-normal">
                Our state-of-the-art workshops are equipped with the latest OEM diagnostic tools and staffed by certified master technicians.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                 {/* Express Service Card */}
                 <div className="p-6 rounded-[28px] bg-zinc-50 border border-black/5 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-4">
                         <div className="h-10 w-10 bg-[#023468]/10 flex items-center justify-center rounded-2xl">
                            <Wrench className="h-5 w-5 text-[#023468]" />
                         </div>
                         <h3 className="text-base font-extrabold text-[#023468]">Express Service</h3>
                      </div>

                      <div className="space-y-3 mb-6">
                         <div className="flex items-center space-x-2">
                            <CheckCircle2 className="h-4 w-4 text-[#023468] flex-shrink-0" />
                            <span className="text-xs font-semibold text-black/70">60-Min Quick Turnaround</span>
                         </div>
                         <div className="flex items-center space-x-2">
                            <CheckCircle2 className="h-4 w-4 text-[#023468] flex-shrink-0" />
                            <span className="text-xs font-semibold text-black/70">Genuine OEM Spare Parts</span>
                         </div>
                         <div className="flex items-center space-x-2">
                            <CheckCircle2 className="h-4 w-4 text-[#023468] flex-shrink-0" />
                            <span className="text-xs font-semibold text-black/70">Certified Technicians</span>
                         </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => onOpen()}
                      className="w-full rounded-full bg-[#023468] hover:bg-[#E31837] text-white font-extrabold text-xs uppercase tracking-widest py-3.5 shadow-md transition-all cursor-pointer"
                    >
                       Book Express Service
                    </button>
                 </div>

                 {/* Body & Paint Card */}
                 <div className="p-6 rounded-[28px] bg-zinc-50 border border-black/5 hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-4">
                         <div className="h-10 w-10 bg-[#023468]/10 flex items-center justify-center rounded-2xl">
                            <ShieldCheck className="h-5 w-5 text-[#023468]" />
                         </div>
                         <h3 className="text-base font-extrabold text-[#023468]">Body &amp; Paint</h3>
                      </div>

                      <div className="space-y-3 mb-6">
                         <div className="flex items-center space-x-2">
                            <CheckCircle2 className="h-4 w-4 text-[#023468] flex-shrink-0" />
                            <span className="text-xs font-semibold text-black/70">Computerized Paint Mix</span>
                         </div>
                         <div className="flex items-center space-x-2">
                            <CheckCircle2 className="h-4 w-4 text-[#023468] flex-shrink-0" />
                            <span className="text-xs font-semibold text-black/70">Cashless Insurance Claims</span>
                         </div>
                         <div className="flex items-center space-x-2">
                            <CheckCircle2 className="h-4 w-4 text-[#023468] flex-shrink-0" />
                            <span className="text-xs font-semibold text-black/70">Precision Tinkering</span>
                         </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => onOpen()}
                      className="w-full rounded-full bg-[#023468] hover:bg-[#E31837] text-white font-extrabold text-xs uppercase tracking-widest py-3.5 shadow-md transition-all cursor-pointer"
                    >
                       Request Quote
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Working High-Res Showcase Image & Floating Badges */}
          <div className="lg:w-1/2 relative h-[340px] sm:h-[440px] md:h-[500px] w-full">
             <motion.div
               initial={{ opacity: 0, scale: 0.96 }}
               whileInView={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.8 }}
               viewport={{ once: true }}
               className="h-full w-full rounded-[36px] overflow-hidden shadow-xl border border-black/10 relative bg-zinc-900 group"
             >
                <Image 
                  src="https://amgroupind.com/wp-content/uploads/2024/11/3.jpg" 
                  alt="AM Group Service Bay Workshop" 
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  className="h-full w-full object-cover brightness-[0.9] transition-transform duration-1000 group-hover:scale-105" 
                />

                {/* 5-Star Service Rating Badge - Hidden on small mobile screens */}
                <div className="hidden sm:block absolute top-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-black/5 shadow-xl max-w-xs z-10">
                   <div className="flex items-center space-x-3 mb-2">
                      <div className="h-8 w-8 bg-[#023468] flex items-center justify-center rounded-full text-white shadow-md flex-shrink-0">
                         <div className="text-xs font-black">A+</div>
                      </div>
                      <h4 className="text-[#023468] font-bold text-xs">5-Star Rated Service</h4>
                   </div>
                   <p className="text-black/60 text-[11px] leading-relaxed">Recognized for consistently delivering exceptional service quality across J&amp;K.</p>
                </div>
                
                {/* High Contrast 24/7 Roadside Card */}
                <div className="absolute bottom-6 left-6 right-6 sm:right-auto bg-[#023468] p-5 rounded-2xl shadow-2xl max-w-xs z-10 text-white border border-white/15">
                   <div className="flex items-center space-x-2.5 mb-2">
                      <PhoneCall className="h-4 w-4 text-[#E31837]" />
                      <h4 className="font-extrabold text-xs tracking-wider uppercase text-white">24/7 Roadside Care</h4>
                   </div>
                   
                   <p className="text-white/80 text-[11px] leading-relaxed mb-3">
                      Instant roadside breakdown assistance anywhere across Jammu &amp; Srinagar.
                   </p>

                   <a
                     href="tel:18002647687"
                     className="bg-white/15 border border-white/20 hover:bg-[#E31837] text-white rounded-full py-2 px-4 text-[10px] font-extrabold uppercase tracking-wider block text-center transition-all"
                   >
                     Call Now: 1800-AM-GROUP
                   </a>
                </div>
             </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}

