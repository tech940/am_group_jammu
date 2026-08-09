"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, History, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function CompanyOverview() {
  return (
    <section className="py-12 md:py-20 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          
          {/* Left: Content */}
          <div className="lg:w-1/2 space-y-5 text-left">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.2em] bg-[#023468] text-white px-4 py-1.5 rounded-full mb-4">
                <History className="h-3.5 w-3.5" />
                <span>Our Heritage &amp; Vision</span>
              </div>
              
              <h2 className="text-[29px] sm:text-[37px] md:text-[45px] font-extrabold text-[#023468] mb-4 leading-[1.12] tracking-tight">
                Pioneering Excellence <br />
                <span className="text-[#E31837]">Across Jammu &amp; Kashmir</span>
              </h2>

              <div className="space-y-4 text-black/80 text-xs sm:text-sm leading-relaxed font-normal mb-6">
                <p>
                  Founded in 1968, <strong>AM Group</strong> has evolved into one of Jammu &amp; Kashmir&apos;s most respected business conglomerates. Starting with Hindustan Petroleum (HPCL) and Indian Oil (IOCL) energy stations, the group has expanded into 26+ state-of-the-art automotive dealership outlets.
                </p>
                <p>
                  We proudly represent iconic automotive leaders—<strong>Hyundai, Tata Motors, MG, Diamond Honda, Kia, Triumph, KTM, and Bajaj</strong>—alongside holding exclusive regional retail rights for <strong>Vishal Mega Mart</strong>.
                </p>
              </div>

              {/* Highlights Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {[
                  "26+ State-of-the-art Showrooms",
                  "500,000+ Satisfied Owners",
                  "HPCL & IOCL Energy Logistics",
                  "Exclusive J&K Retail Partner"
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-2 text-xs font-bold text-[#023468]">
                    <CheckCircle2 className="h-4 w-4 text-[#E31837] flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div>
                <Button 
                  asChild 
                  className="bg-[#023468] text-white hover:bg-[#E31837] rounded-full px-8 py-3.5 h-12 font-extrabold text-xs uppercase tracking-widest transition-all shadow-md hover:scale-105"
                >
                  <Link href="/about">
                    Discover Our Story <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Right: Image Mosaic (Optimized responsive heights for mobile) */}
          <div className="lg:w-1/2 w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div className="relative rounded-[28px] overflow-hidden h-[260px] sm:h-[340px] md:h-[440px] shadow-lg border border-black/5 bg-zinc-100">
                <Image 
                  src="https://amgroupind.com/wp-content/uploads/2024/10/abt-2.webp" 
                  alt="AM Tata Motors Showroom" 
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" 
                />
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="relative rounded-[24px] overflow-hidden h-[180px] sm:h-[162px] md:h-[212px] shadow-md border border-black/5 bg-zinc-100">
                  <Image 
                    src="https://amgroupind.com/wp-content/uploads/2024/10/IMG_4571.webp" 
                    alt="Diamond Honda Facility" 
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" 
                  />
                </div>
                <div className="relative rounded-[24px] overflow-hidden h-[180px] sm:h-[162px] md:h-[212px] shadow-md border border-black/5 bg-zinc-100">
                  <Image 
                    src="https://amgroupind.com/wp-content/uploads/2024/10/abt-4-1024x576.webp" 
                    alt="AM Group Infrastructure" 
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" 
                  />
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
