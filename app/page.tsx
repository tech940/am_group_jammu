"use client"

import { Hero } from "@/components/sections/hero"
import { LogoCarousel } from "@/components/sections/logo-carousel"
import { BrandsShowcase } from "@/components/sections/brands"
import { FeaturedInventory } from "@/components/sections/inventory"
import { CompanyOverview } from "@/components/sections/overview"
import { ServiceWorkshop } from "@/components/sections/service"
import { FinanceSection } from "@/components/sections/finance"
import { ParallaxBanner } from "@/components/sections/parallax-banner"
import { FeaturedServices } from "@/components/sections/services-new"
import { GroupBrands } from "@/components/sections/group-brands"
import { WhyUs } from "@/components/sections/why-us"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import Link from "next/link"
import Image from "next/image"



export default function Home() {
  const { onOpen } = useEnquiryModal()
  return (
    <main className="flex flex-col">
      <Hero />
      <LogoCarousel />
      <GroupBrands />
      <CompanyOverview />
      <FeaturedServices />
      
      <ParallaxBanner 
        image="https://di-uploads-development.dealerinspire.com/amford/uploads/2025/08/am-ford-banner.webp"
        title="Unmatched Excellence"
        subtitle="Experience the pinnacle of automotive engineering and customer care with AM Group."
      />

      <FeaturedInventory />
      <BrandsShowcase />
      <WhyUs />
      <ServiceWorkshop />
      <FinanceSection />
      
      {/* Blog Teaser Section */}
      <section className="py-24 bg-white border-t border-black/5">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Latest from <span className="text-black/20">AM Journal</span>
          </h2>
          <p className="text-black/60 mb-16 max-w-xl mx-auto font-light leading-relaxed">
            Stay updated with the latest automotive trends, expert reviews, and group news from the heart of Jammu & Kashmir.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Link
                key={i}
                href="/blog"
                target="_blank"
                className="block group text-left cursor-pointer"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="aspect-[4/3] rounded-[32px] overflow-hidden mb-6 border border-black/5 relative shadow-xl">
                    <Image
                      src={`https://images.unsplash.com/photo-1493238507126-134b13efd958?auto=format&fit=crop&q=80&w=800&sig=${i}`}
                      alt="Blog Post"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="h-full w-full object-cover group-hover:scale-110 transition-all duration-700"
                    />

                    <div className="absolute top-6 left-6">
                      <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-black shadow-sm">
                        Insights
                      </span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-4 group-hover:text-primary transition-colors leading-snug">The Future of Electric Mobility in Jammu & Kashmir</h3>
                  <p className="text-black/40 text-sm leading-relaxed line-clamp-2 font-light uppercase tracking-widest mb-6">
                    Exploring how the landscape of transportation is shifting towards a sustainable future with the rise of EVs.
                  </p>
                  <div className="flex items-center text-xs font-bold uppercase tracking-widest text-black/40 group-hover:text-black transition-colors">
                    Read Article <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-zinc-50 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-8">
           <div className="relative rounded-[40px] bg-white p-12 md:p-24 overflow-hidden border border-black/5 shadow-2xl">
               <div className="absolute top-0 right-0 w-1/2 h-full bg-zinc-50 -skew-x-12 translate-x-1/2 z-0" />
               
               <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10 text-center md:text-left">
                  <div className="max-w-2xl">
                    <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
                       Ready to begin your <br />
                       <span className="text-black/20">Elite Journey?</span>
                    </h2>
                    <p className="text-black/60 text-lg font-light leading-relaxed">
                       Join the family of 500,000+ satisfied owners who experience excellence every day with AM Group.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                     <Button 
                        size="xl" 
                        onClick={() => onOpen()}
                        className="bg-[#023468] text-white hover:bg-[#01254a] rounded-full px-12 h-16 font-bold shadow-xl transition-all hover:scale-105 active:scale-95"
                      >
                        Book Test Drive
                     </Button>
                     <Button asChild variant="outline" size="xl" className="rounded-full px-12 h-16 font-bold border-black/10 hover:bg-black hover:text-white transition-all cursor-pointer">
                        <Link href="/contact" target="_blank">
                           Contact Sales
                        </Link>
                     </Button>
                  </div>
               </div>
           </div>
        </div>
      </section>

    </main>
  )
}
