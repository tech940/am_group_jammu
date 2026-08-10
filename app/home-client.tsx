"use client"

import dynamic from "next/dynamic"
import { Hero } from "@/components/sections/hero"
import { CompanyOverview } from "@/components/sections/overview"
import { ServiceWorkshop } from "@/components/sections/service"
import { FinanceSection } from "@/components/sections/finance"
import { FeaturedServices } from "@/components/sections/services-new"
import { GroupBrands } from "@/components/sections/group-brands"
import { WhyUs } from "@/components/sections/why-us"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import Link from "next/link"
import Image from "next/image"
import { CustomerDealershipSection } from "@/components/sections/customer-dealership"
import { SearchedAndElectricCars } from "@/components/sections/searched-electric-cars"
import { FeaturedSpotlight } from "@/components/sections/featured-spotlight"
import type { HomeInventory } from "@/lib/inventory/server"

const ShowcaseCarousel = dynamic(
  () => import("@/components/sections/showcase-carousel").then((m) => m.ShowcaseCarousel)
)
const ParallaxBanner = dynamic(
  () => import("@/components/sections/parallax-banner").then((m) => m.ParallaxBanner)
)

const journalArticles = [
  {
    id: 1,
    title: "The Future of Electric Mobility in Jammu & Kashmir",
    excerpt: "Exploring how charging infrastructure and EV adoption are accelerating across Jammu & Srinagar.",
    tag: "EV Insights",
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 2,
    title: "55 Years of Customer Trust: The AM Group Story",
    excerpt: "From a single fuel station in 1968 to J&K's largest automotive and retail conglomerate.",
    tag: "Group History",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 3,
    title: "Essential Monsoon Car Maintenance & Workshop Checklist",
    excerpt: "Expert advice on brake inspection, tire tread checks, and wiper maintenance for mountain driving.",
    tag: "Care Tips",
    image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800"
  }
]

export default function Home({ inventory }: { inventory: HomeInventory }) {
  const { onOpen } = useEnquiryModal()

  return (
    <main className="flex flex-col min-h-screen bg-[#f8f9fa]">
      {/* 1. Hero Section (Primary Search & High Intent) */}
      <Hero latest={inventory.latest} facets={inventory.facets} total={inventory.total} />

      {/* 2. Quick Inventory Discovery & Affordable Cars */}
      <SearchedAndElectricCars byBodyType={inventory.byBodyType} bestValue={inventory.bestValue} />

      {/* 3. Featured Vehicle Spotlight */}
      <FeaturedSpotlight vehicles={inventory.spotlight} />

      {/* 4. Real Customer Reviews & Dealership Map (Immediate Trust & Location) */}
      <CustomerDealershipSection />

      {/* 5. Trust & Statistical Milestones */}
      <WhyUs />

      {/* 6. Finance & Loan Assistance (Buying Enablers) */}
      <FinanceSection />

      {/* 7. Workshop & Ecosystem Care Services */}
      <ServiceWorkshop />
      <FeaturedServices />

      {/* 8. Coverflow Vehicle Showcase Carousel */}
      <ShowcaseCarousel vehicles={inventory.latest} />

      {/* 9. Group Divisions & Corporate Heritage */}
      <GroupBrands byBodyType={inventory.byBodyType} />
      <CompanyOverview />

      {/* 10. Parallax Banner */}
      <ParallaxBanner 
        image="https://di-uploads-development.dealerinspire.com/amford/uploads/2025/08/am-ford-banner.webp"
        title="Unmatched Excellence"
        subtitle="Experience the pinnacle of automotive engineering and customer care with AM Group."
      />

      {/* 11. Blog & Journal Section */}
      <section className="py-28 bg-white border-t border-black/5">
        <div className="container mx-auto px-4 md:px-8">
          
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.25em] bg-[#023468] text-white px-4 py-1.5 rounded-full mb-4">
                <span>Editorial &amp; Updates</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-[#023468] tracking-tight">
                Latest From <span className="text-[#023468]/30">AM Journal</span>
              </h2>
            </div>

            <Button asChild variant="outline" className="rounded-full border-black/10 hover:bg-[#023468] hover:text-white transition-all cursor-pointer">
              <Link href="/blog">
                View All Articles <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {journalArticles.map((article, index) => (
              <Link
                key={article.id}
                href="/blog"
                className="block group text-left cursor-pointer"
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="aspect-[16/10] rounded-[28px] overflow-hidden mb-6 border border-black/5 relative shadow-lg bg-zinc-100">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="h-full w-full object-cover group-hover:scale-105 transition-all duration-700"
                    />

                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-[#023468] shadow-sm">
                        {article.tag}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-[#023468] mb-3 group-hover:text-[#E31837] transition-colors leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-black/60 text-sm leading-relaxed font-light line-clamp-2 mb-4">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center text-xs font-bold uppercase tracking-widest text-[#023468] group-hover:text-[#E31837] transition-colors">
                    <span>Read Full Story</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Primary Call To Action Banner */}
      <section className="py-20 md:py-28 bg-[#f8f9fa] relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-8">
           <div className="relative rounded-[36px] md:rounded-[48px] bg-gradient-to-br from-white via-zinc-50 to-zinc-100 p-8 md:p-16 lg:p-20 overflow-hidden shadow-2xl text-[#023468] border border-black/5">
               {/* Soft Light Radial Tint */}
               <div className="absolute top-0 right-0 w-96 h-96 bg-[#023468]/5 rounded-full blur-[100px] pointer-events-none" />
               <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#E31837]/5 rounded-full blur-[80px] pointer-events-none" />

               <div className="flex flex-col lg:flex-row items-center justify-between gap-10 relative z-10 text-center lg:text-left">
                  <div className="max-w-2xl">
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-white bg-[#023468] px-4 py-1.5 rounded-full mb-4 inline-block shadow-sm">
                      Begin Your Journey
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#023468] mb-4 leading-tight">
                       Ready to Experience <br />
                       <span className="text-black/40">The AM Difference?</span>
                    </h2>
                    <p className="text-black/70 text-sm md:text-lg font-normal leading-relaxed max-w-xl">
                       Join over 500,000 satisfied vehicle owners and customers who trust AM Group for automotive luxury, service precision, and retail value.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                     <button 
                        onClick={() => onOpen(null, { intent: "Test Drive", sourceLabel: "home-cta" })}
                        className="w-full sm:w-auto bg-[#E31837] text-white hover:bg-[#023468] rounded-full px-8 py-4 h-14 font-extrabold text-xs uppercase tracking-widest shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2 group"
                      >
                        <span>Book Test Drive / Inquiry</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </button>
                      
                      <Link 
                        href="/contact"
                        className="w-full sm:w-auto bg-[#023468] text-white hover:bg-[#E31837] rounded-full px-8 py-4 h-14 font-extrabold text-xs uppercase tracking-widest shadow-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center"
                      >
                        Contact Group Sales
                      </Link>
                  </div>
               </div>
           </div>
        </div>
      </section>

    </main>
  )
}
