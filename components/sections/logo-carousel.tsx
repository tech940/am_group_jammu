"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

const logos = [
  { name: "Hyundai", url: "https://amgroupind.com/wp-content/uploads/2024/10/hyundai-1.png" },
  { name: "Tata Motors", url: "https://amgroupind.com/wp-content/uploads/2024/10/tata-1.png" },
  { name: "MG Motors", url: "https://amgroupind.com/wp-content/uploads/2024/10/MG-1.png" },
  { name: "Kia Motors", url: "https://amgroupind.com/wp-content/uploads/2024/10/kia.png" },
  { name: "Honda", url: "https://amgroupind.com/wp-content/uploads/2024/10/honda-motor.png" },
  { name: "Triumph", url: "https://amgroupind.com/wp-content/uploads/2024/10/triumph.png" },
  { name: "KTM", url: "https://amgroupind.com/wp-content/uploads/2024/10/KTM-Logo-1.png" },
  { name: "HPCL", url: "https://amgroupind.com/wp-content/uploads/2024/10/HINDPETRO.png" },
  { name: "Indian Oil", url: "https://amgroupind.com/wp-content/uploads/2024/10/indian_oil_logo.png" },
]

export function LogoCarousel() {
  return (
    <section className="py-10 bg-[#023468] text-white relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 25s linear infinite;
        }
      `}} />
      
      <div className="container mx-auto px-4 md:px-8 mb-6 flex items-center justify-between">
        <h3 className="text-xl font-extrabold uppercase tracking-wider text-white">
          Shop Top Brands
        </h3>
        <Link
          href="/automobile"
          className="text-xs font-bold uppercase tracking-widest text-white/80 hover:text-white transition-colors flex items-center gap-1"
        >
          <span>View All Brands</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      
      <div className="relative flex overflow-hidden">
        <div className="flex space-x-8 items-center whitespace-nowrap animate-scroll">
          {/* Double the logos for seamless loop */}
          {[...logos, ...logos].map((logo, index) => (
            <div key={index} className="flex-shrink-0 px-6 py-3 bg-white rounded-2xl border border-white/20 shadow-md hover:shadow-xl transition-all duration-300 group">
              <img
                src={logo.url}
                alt={logo.name}
                className="h-8 md:h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


