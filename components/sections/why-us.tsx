"use client"

import { motion } from "framer-motion"
import { ShieldCheck, CircleDollarSign, FileText, Headphones } from "lucide-react"

const whyChooseFeatures = [
  {
    icon: ShieldCheck,
    title: "Quality You Can Trust",
    description: "Every vehicle is thoroughly inspected and reconditioned to ensure top quality."
  },
  {
    icon: CircleDollarSign,
    title: "Best Value Guarantee",
    description: "Competitive pricing and best trade-in value in the market."
  },
  {
    icon: FileText,
    title: "Easy Financing",
    description: "Multiple financing options to fit your budget with instant approvals."
  },
  {
    icon: Headphones,
    title: "Here for You",
    description: "Our dedicated relationship team is here to help before, during, and after the sale."
  }
]

export function WhyUs() {
  return (
    <section className="relative py-24 bg-white overflow-hidden border-t border-black/5">
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#023468] tracking-tight mb-4">
            Why Choose AM Group Jammu?
          </h2>
          <p className="text-black/60 text-base md:text-lg font-normal">
            We make car buying simple, transparent, and satisfying.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {whyChooseFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-white rounded-[32px] p-8 border border-black/10 shadow-sm hover:shadow-xl hover:border-[#023468]/20 transition-all duration-500 text-center flex flex-col items-center justify-between"
            >
              <div className="mb-6">
                <div className="h-16 w-16 rounded-2xl bg-[#023468]/10 flex items-center justify-center text-[#023468]">
                  <feature.icon className="h-8 w-8 stroke-[1.8]" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#023468] mb-3">
                  {feature.title}
                </h3>
                <p className="text-black/60 text-xs md:text-sm leading-relaxed font-normal">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
