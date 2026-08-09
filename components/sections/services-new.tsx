"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ShieldCheck, Car, Calendar, ArrowRight, Wrench, Building, Landmark, Shield } from "lucide-react"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"

const individualServices = [
  {
    title: "Vehicle Insurance & Claims",
    subtitle: "Complete Protection",
    description: "Tailored motor insurance plans with instant cashless claims settlement across all AM Group service centers.",
    icon: ShieldCheck,
    accent: "bg-[#023468]/10 text-[#023468]",
  },
  {
    title: "Used Car Valuation & Sale",
    subtitle: "Sell or Exchange",
    description: "Transparent live market appraisal for your vehicle with free doorstep evaluation and instant payout.",
    icon: Car,
    accent: "bg-[#023468]/10 text-[#023468]",
  },
  {
    title: "Workshop Service Booking",
    subtitle: "Maintenance & Care",
    description: "Book periodic maintenance, computer diagnostics, wheel alignment, and body shop repairs with OEM certified teams.",
    icon: Calendar,
    accent: "bg-[#023468]/10 text-[#023468]",
  },
]

const corporateServices = [
  {
    title: "Corporate Fleet Mobility",
    subtitle: "Enterprise Solutions",
    description: "Customized commercial and passenger vehicle fleet management for businesses, PSUs, and institutions.",
    icon: Building,
    accent: "bg-[#023468]/10 text-[#023468]",
  },
  {
    title: "Commercial Real Estate",
    subtitle: "Retail Spaces & Infrastructure",
    description: "Leasing prime commercial properties and retail store spaces across major business hubs in Jammu & Srinagar.",
    icon: Landmark,
    accent: "bg-[#023468]/10 text-[#023468]",
  },
  {
    title: "Petroleum Fuel Supply",
    subtitle: "Bulk Energy Logistics",
    description: "Bulk fuel supply and industrial lubricant distribution backed by Hindustan Petroleum & Indian Oil infrastructure.",
    icon: Wrench,
    accent: "bg-[#023468]/10 text-[#023468]",
  },
]

export function FeaturedServices() {
  const [activeSegment, setActiveSegment] = useState<"individual" | "corporate">("individual")
  const { onOpen } = useEnquiryModal()

  const currentServices = activeSegment === "individual" ? individualServices : corporateServices

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#023468]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-16 gap-8">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.21, 1.02, 0.47, 0.98] }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <div className="mb-4 inline-flex items-center space-x-2 bg-[#023468] text-white px-4 py-1.5 rounded-full">
              <Shield className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em]">
                Services & Support
              </span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#023468] leading-[1.1] tracking-tight">
              Vehicle Care & <br />
              <span className="text-black/40">Business Solutions</span>
            </h2>
            
            <p className="mt-4 text-black/60 text-base md:text-lg font-light leading-relaxed">
              Complete lifetime ownership support, service workshops, corporate fleet mobility, and energy supply across Jammu & Kashmir.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="bg-zinc-100 p-1.5 rounded-full border border-black/5 flex items-center shadow-inner">
              <button 
                onClick={() => setActiveSegment("individual")}
                className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${
                  activeSegment === "individual"
                    ? "bg-[#023468] text-white shadow-md"
                    : "text-black/60 hover:text-black"
                }`}
              >
                Individual Customer Care
              </button>
              <button 
                onClick={() => setActiveSegment("corporate")}
                className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${
                  activeSegment === "corporate"
                    ? "bg-[#023468] text-white shadow-md"
                    : "text-black/60 hover:text-black"
                }`}
              >
                Corporate & Business
              </button>
            </div>
          </motion.div>

        </div>

        {/* Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentServices.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.1,
                ease: [0.21, 1.02, 0.47, 0.98]
              }}
              viewport={{ once: true }}
              className="group relative bg-zinc-50 rounded-[32px] p-8 border border-black/5 hover:bg-white hover:shadow-[0_25px_70px_rgba(0,0,0,0.07)] hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between"
            >
              <div>
                {/* Icon Container */}
                <div className={`mb-6 h-14 w-14 rounded-2xl ${service.accent} flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300`}>
                  <service.icon className="h-7 w-7 relative z-10" />
                </div>

                {/* Text Content */}
                <div className="space-y-2.5 mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#023468]/60 block">
                    {service.subtitle}
                  </span>
                  <h3 className="text-xl font-bold text-[#023468] tracking-tight">
                    {service.title}
                  </h3>
                  <p className="text-black/60 text-sm leading-relaxed font-light">
                    {service.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => onOpen()}
                className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[#023468] hover:text-[#E31837] transition-colors duration-300 cursor-pointer pt-4 border-t border-black/5"
              >
                <span>Request Inquiry</span>
                <div className="h-7 w-7 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-[#023468] group-hover:border-[#023468] group-hover:text-white transition-all">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </button>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}


