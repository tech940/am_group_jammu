"use client"

import { motion } from "framer-motion"

const logos = [
  { name: "Bajaj", url: "https://amgroupind.com/wp-content/uploads/2024/10/bajaj.png" },
  { name: "Honda", url: "https://amgroupind.com/wp-content/uploads/2024/10/honda-motor.png" },
  { name: "Hyundai", url: "https://amgroupind.com/wp-content/uploads/2024/10/hyundai-1.png" },
  { name: "Hyundai Mobis", url: "https://amgroupind.com/wp-content/uploads/2024/10/Hyundai_Mobis.png" },
  { name: "Indian Oil", url: "https://amgroupind.com/wp-content/uploads/2024/10/indian_oil_logo.png" },
  { name: "KTM", url: "https://amgroupind.com/wp-content/uploads/2024/10/KTM-Logo-1.png" },
  { name: "HPCL", url: "https://amgroupind.com/wp-content/uploads/2024/10/HINDPETRO.png" },
  { name: "Kia", url: "https://amgroupind.com/wp-content/uploads/2024/10/kia.png" },
  { name: "Tata", url: "https://amgroupind.com/wp-content/uploads/2024/10/tata-1.png" },
  { name: "Triumph", url: "https://amgroupind.com/wp-content/uploads/2024/10/triumph.png" },
  { name: "MG", url: "https://amgroupind.com/wp-content/uploads/2024/10/MG-1.png" },
]

export function LogoCarousel() {
  return (
    <section className="py-12 bg-white relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}} />
      <div className="container mx-auto px-4 md:px-8 mb-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/30 text-center">
          Our Trusted Brand Partners
        </p>
      </div>
      
      <div className="relative flex overflow-hidden">
        <div className="flex space-x-12 items-center whitespace-nowrap animate-scroll">
          {/* Double the logos for seamless loop */}
          {[...logos, ...logos].map((logo, index) => (
            <div key={index} className="flex-shrink-0 px-8 py-4 bg-zinc-50 rounded-2xl border border-black/5 hover:bg-white hover:shadow-xl transition-all duration-500 group">
              <img
                src={logo.url}
                alt={logo.name}
                className="h-8 md:h-10 w-auto object-contain group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

