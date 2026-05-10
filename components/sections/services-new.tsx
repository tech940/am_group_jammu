"use client"

import { motion } from "framer-motion"
import { ShieldCheck, Car, Calendar, ArrowRight } from "lucide-react"

const services = [
  {
    title: "Elite Insurance",
    subtitle: "Effortless Solutions",
    description: "Secure your masterpiece with quick, reliable, and meticulously tailored coverage plans designed for peace of mind.",
    icon: ShieldCheck,
    accent: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Instant Valuation",
    subtitle: "Sell Your Vehicle",
    description: "Get the true value of your vehicle with our expert appraisal team and a seamless, high-speed transaction process.",
    icon: Car,
    accent: "bg-[#E31837]/10 text-[#E31837]",
  },
  {
    title: "Master Service",
    subtitle: "Schedule Appointment",
    description: "Book world-class maintenance at your absolute convenience, ensuring your vehicle performs at its peak potential.",
    icon: Calendar,
    accent: "bg-emerald-500/10 text-emerald-600",
  },
]

export function FeaturedServices() {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Aesthetic Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#023468]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#E31837]/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-end justify-between mb-24 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.21, 1.02, 0.47, 0.98] }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <div className="mb-6 inline-flex items-center gap-3">
              <div className="h-[1px] w-8 bg-[#E31837]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E31837]">
                Excellence in Motion
              </span>
            </div>
            <h2 className="text-[42px] md:text-[64px] font-bold text-[#023468] leading-[1.1] tracking-tight">
              What Services We <br />
              <span className="text-black/20">Provide For You</span>
            </h2>
            <p className="mt-8 text-black/40 text-lg font-light leading-relaxed max-w-lg">
              Beyond the showroom floor, we provide a complete ecosystem of world-class 
              automotive care and professional advisory services.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.21, 1.02, 0.47, 0.98] }}
            viewport={{ once: true }}
          >
            <div className="bg-zinc-50 border border-black/5 p-2 rounded-2xl flex gap-1">
              <button className="px-6 py-2.5 rounded-xl bg-white shadow-sm text-[10px] font-black uppercase tracking-widest text-[#023468]">Individual</button>
              <button className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-black/30 hover:text-black transition-colors">Corporate</button>
            </div>
          </motion.div>
        </div>

        {/* Dynamic Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 1.2, 
                delay: index * 0.15,
                ease: [0.21, 1.02, 0.47, 0.98]
              }}
              viewport={{ once: true }}
              className="group relative bg-zinc-50/50 rounded-[40px] p-10 border border-black/5 hover:bg-white hover:shadow-[0_40px_100px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-700"
            >
              {/* Icon Container */}
              <div className={`mb-12 h-20 w-20 rounded-3xl ${service.accent} flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform duration-700`}>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <service.icon className="h-9 w-9 relative z-10" />
              </div>

              {/* Text Content */}
              <div className="space-y-4 mb-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-black/30 block group-hover:text-[#E31837] transition-colors">
                  {service.subtitle}
                </span>
                <h3 className="text-3xl font-bold text-[#023468] tracking-tight">
                  {service.title}
                </h3>
                <p className="text-black/50 text-base leading-relaxed font-light">
                  {service.description}
                </p>
              </div>

              {/* Action Button */}
              <button className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-[#023468] group-hover:gap-5 transition-all duration-500">
                Learn More 
                <div className="h-8 w-8 rounded-full border border-black/5 flex items-center justify-center group-hover:bg-[#023468] group-hover:text-white transition-all">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </button>

              {/* Subtle Decorative Line */}
              <div className="absolute bottom-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-[#E31837]/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
