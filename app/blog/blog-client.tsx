"use client"

import React from "react"
import { motion } from "framer-motion"
import { Calendar, Clock, ArrowRight, Share2, Tag } from "lucide-react"

const newsArticles = [
  {
    title: "AM Hyundai bags two prestigious awards",
    date: "February 26, 2021",
    category: "Awards",
    excerpt: "JAMMU, Feb 25: AM Hyundai today bagged two prestigious awards at Hyundai Motors India Ltd Annual National Digital Dealer Conference...",
    image: "https://amgroupind.com/wp-content/uploads/2024/10/AM-Hyundai-bags-two-prestigious-awards.webp",
    link: "#"
  },
  {
    title: "AM Hyundai inaugurates Smart Car Care Clinic",
    date: "December 15, 2020",
    category: "News",
    excerpt: "JAMMU, Dec 14: AM Hyundai has inaugurated Smart Car Clinic for customers in Jammu from today to December 23. The clinic offers...",
    image: "https://amgroupind.com/wp-content/uploads/2024/10/AM-Hyundai-inaugurates-Smart-Car-Care-Clinic.webp",
    link: "#"
  },
  {
    title: "AM Hyundai launches India’s first fully electric SUV ‘KONA Electric’",
    date: "December 3, 2020",
    category: "Innovation",
    excerpt: "JAMMU, Dec 2: AM Hyundai Jammu today launched India’s first fully electric SUV, KONA Electric. ‘KONA’ Electric is named after...",
    image: "https://amgroupind.com/wp-content/uploads/2024/10/KONA-Electric.webp",
    link: "#"
  },
  {
    title: "AM Hyundai launches all-new i20",
    date: "November 7, 2020",
    category: "Launches",
    excerpt: "JAMMU, Nov 6: AM Hyundai today launched India’s most anticipated car–the all-new i20. Through its sleek styling and futuristic design...",
    image: "https://amgroupind.com/wp-content/uploads/2024/10/AM-Hyundai-launches-all-new-i20.webp",
    link: "#"
  }
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Cinematic Hero Section */}
      <section className="relative min-h-[50vh] flex items-center bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-[#E31837]/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[#023468]/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-3xl pointer-events-none" />
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10 pt-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.21, 1.02, 0.47, 0.98] }}
          >
            <div className="mb-10 inline-flex items-center gap-4">
              <div className="h-[1px] w-12 bg-[#E31837]" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/50">
                Media Center
              </span>
            </div>
            
            <h1 className="text-[44px] sm:text-[64px] md:text-[120px] font-bold text-white leading-[0.8] tracking-tight mb-12">
              News & <br />
              <span className="text-[#E31837] italic font-light">Updates</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 xl:gap-16">
            {newsArticles.map((article, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative aspect-[16/10] rounded-[40px] overflow-hidden mb-10 shadow-2xl group-hover:shadow-[#E31837]/10 transition-all duration-700">
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute top-8 left-8">
                    <span className="bg-white/90 backdrop-blur-xl px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-[#023468]">
                      {article.category}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#023468]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>

                {/* Content */}
                <div className="px-4">
                  <div className="flex items-center gap-6 mb-6 text-[10px] font-black uppercase tracking-widest text-black/30">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-[#E31837]" />
                      {article.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-[#E31837]" />
                      3 Min Read
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-[#023468] mb-6 leading-tight group-hover:text-[#E31837] transition-colors duration-500">
                    {article.title}
                  </h3>

                  <p className="text-black/50 text-base font-light leading-relaxed mb-10 line-clamp-3">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-8 border-t border-black/5">
                    <button className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[#023468] group/btn">
                      Read More
                      <div className="h-10 w-10 rounded-full border border-black/5 flex items-center justify-center group-hover/btn:bg-[#023468] group-hover/btn:text-white transition-all duration-500">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </button>
                    <button className="h-10 w-10 rounded-full border border-black/5 flex items-center justify-center text-black/30 hover:text-[#E31837] hover:border-[#E31837]/20 transition-all duration-500">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Load More / Pagination */}
          <div className="mt-32 text-center">
             <button className="px-12 py-6 bg-[#023468] text-white rounded-full font-black uppercase tracking-[0.2em] text-xs hover:bg-[#E31837] transition-all duration-500 shadow-2xl shadow-[#023468]/20">
               View All Updates
             </button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-32 bg-zinc-50 border-t border-black/5 relative overflow-hidden">
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="max-w-5xl mx-auto bg-white rounded-[60px] p-12 md:p-24 shadow-2xl relative overflow-hidden border border-black/5">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <Tag className="h-64 w-64 text-[#E31837] rotate-12" />
            </div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E31837] mb-4 block">Subscribe</span>
                <h2 className="text-4xl md:text-5xl font-bold text-[#023468] tracking-tight mb-8">Stay Ahead of <br /><span className="text-black/20">The Curve.</span></h2>
                <p className="text-black/40 text-lg font-light leading-relaxed">
                  Get the latest automotive trends, dealership launches, and group updates delivered directly to your inbox.
                </p>
              </div>
              
              <div className="lg:w-1/2 w-full">
                <form className="relative group">
                  <input 
                    type="email" 
                    placeholder="Enter your email address"
                    className="w-full h-20 bg-zinc-50 rounded-[30px] px-10 border border-black/5 focus:outline-none focus:border-[#E31837] transition-all text-sm font-medium pr-40"
                  />
                  <button className="absolute right-3 top-3 bottom-3 px-8 bg-[#023468] text-white rounded-[22px] font-black uppercase tracking-widest text-[10px] hover:bg-[#E31837] transition-all duration-500">
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
