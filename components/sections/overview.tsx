"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Image from "next/image"


export function CompanyOverview() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Left: Content */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.21, 1.02, 0.47, 0.98] }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#E31837] mb-6 inline-block bg-[#E31837]/5 px-3 py-1 rounded">
                About
              </span>
              <h2 className="text-[40px] md:text-[56px] font-bold text-[#023468] mb-8 leading-[1.1] tracking-tight">
                AM <span className="text-[#023468]">Group</span>
              </h2>
              <div className="space-y-6 text-black/70 text-lg leading-relaxed mb-10 font-light">
                <p>
                  The Am Group has 26 dealership outlets across the union territory of Jammu & Kashmir which include two wheelers and passenger vehicles. The group is also diversified in many other businesses which include petroleum business, real estate developments, and logistics.
                </p>
                <p>
                  The group has come a long way since 1968, When the group started with a dealership for Hindustan Petroleum Corporation Ltd. gas stations and kerosene oil. In 1977, the group expanded its presence with Indian Oil Corporation Ltd.
                </p>
                <p className="font-normal text-black">
                  As the only franchisee for Vishal Mega Mart in India, we take pride in bringing exceptional retail experiences to our customers.
                </p>
              </div>

              <Button size="xl" className="bg-[#E31837] text-white hover:bg-[#c4152f] rounded-none px-12 h-14 font-bold transition-all flex items-center gap-2">
                READ MORE <ArrowRight className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>

          {/* Right: Image Mosaic */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.21, 1.02, 0.47, 0.98] }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="relative rounded-2xl overflow-hidden h-[600px]">
                <Image 
                  src="https://amgroupind.com/wp-content/uploads/2024/10/abt-2.webp" 
                  alt="AM Tata Motors" 
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="h-full w-full object-cover" 
                />
              </div>
              <div className="flex flex-col gap-4">
                <div className="relative rounded-2xl overflow-hidden h-[292px]">
                  <Image 
                    src="https://amgroupind.com/wp-content/uploads/2024/10/IMG_4571.webp" 
                    alt="Diamond Honda" 
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="h-full w-full object-cover" 
                  />
                </div>
                <div className="relative rounded-2xl overflow-hidden h-[292px]">
                  <Image 
                    src="https://amgroupind.com/wp-content/uploads/2024/10/abt-4-1024x576.webp" 
                    alt="AM Group Showroom" 
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="h-full w-full object-cover" 
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
