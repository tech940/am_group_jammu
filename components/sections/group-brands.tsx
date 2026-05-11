"use client"

import { motion } from "framer-motion"
import Image from "next/image"


const brandImages = [
  { 
    name: "Hyundai", 
    logo: "https://amgroupind.com/wp-content/uploads/2024/10/hyundai.png", 
    image: "https://amgroupind.com/wp-content/uploads/2024/10/am-hyundai.webp", 
    link: "/brands/hyundai"
  },
  { 
    name: "Tata", 
    logo: "https://amgroupind.com/wp-content/uploads/2024/10/tata-2.png", 
    image: "https://amgroupind.com/wp-content/uploads/2024/10/am-tata.jpg", 
    link: "/brands/tata"
  },
  { 
    name: "Diamond Honda", 
    logo: "https://amgroupind.com/wp-content/uploads/2024/10/diamond.png", 
    image: "https://amgroupind.com/wp-content/uploads/2024/10/am-honda.jpg", 
    link: "/brands/honda"
  },
  { 
    name: "KTM", 
    logo: "https://amgroupind.com/wp-content/uploads/2024/10/ktm1.png", 
    image: "https://amgroupind.com/wp-content/uploads/2024/10/ktm.jpg", 
    link: "/brands/ktm"
  },
  { 
    name: "MG Motors", 
    logo: "https://amgroupind.com/wp-content/uploads/2024/10/mg-am-1.png", 
    image: "https://amgroupind.com/wp-content/uploads/2024/10/mg-motor-jammu-jammu-motor-dealers-1024x768.jpg", 
    link: "/brands/mg"
  },
  { 
    name: "Bajaj", 
    logo: "https://amgroupind.com/wp-content/uploads/2024/10/bajaj-1-1.png", 
    image: "https://amgroupind.com/wp-content/uploads/2024/10/bajaj-1-1024x977.jpg", 
    link: "/brands/bajaj"
  },
  { 
    name: "Kia", 
    logo: "https://amgroupind.com/wp-content/uploads/2024/10/KIA-Logo-1.png", 
    image: "https://amgroupind.com/wp-content/uploads/2024/10/kia-1024x597.jpg", 
    link: "/brands/kia"
  },
  { 
    name: "Triumph", 
    logo: "https://amgroupind.com/wp-content/uploads/2024/10/Logo_Triumph-2.png", 
    image: "https://amgroupind.com/wp-content/uploads/2024/10/triumph-1-1024x768.jpg", 
    link: "/brands/triumph"
  },

]

export function GroupBrands() {
  return (
    <section className="py-24 bg-[#FAFAFA] overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {brandImages.map((brand, index) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.08,
                ease: "easeOut"
              }}
              viewport={{ once: true, margin: "-50px" }}
              className="relative h-[400px] overflow-hidden group cursor-pointer rounded-[32px] shadow-lg border border-black/[0.03]"
            >
            {/* Background Image with Parallax-like scale */}
            <div className="absolute inset-0 transition-transform duration-1000 ease-out group-hover:scale-110">
              <Image 
                src={brand.image} 
                alt={brand.name} 
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="h-full w-full object-cover" 
              />
            </div>
            
            {/* Dynamic Overlays */}
            <div className="absolute inset-0 bg-[#023468]/40 group-hover:bg-[#023468]/20 transition-colors duration-700" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-[#023468] via-transparent to-transparent transition-opacity duration-700" />
            
            {/* Center Logo Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
               <motion.div 
                 className="relative h-24 w-full max-w-[180px] mb-6"
                 whileHover={{ scale: 1.05 }}
                 transition={{ type: "spring", stiffness: 300 }}
               >
                 <Image 
                   src={brand.logo} 
                   alt={`${brand.name} logo`} 
                   fill
                   sizes="180px"
                   className="h-full w-full object-contain brightness-0 invert transition-all duration-700 group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" 
                 />
               </motion.div>
               
               <div className="overflow-hidden">
                 <p className="text-white font-bold uppercase tracking-[0.3em] text-[10px] translate-y-full group-hover:translate-y-0 transition-transform duration-500 delay-100">
                    AM {brand.name}
                 </p>
               </div>
               
               <div className="mt-8 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200 translate-y-4 group-hover:translate-y-0">
                  <div className="inline-flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-white/80 hover:text-white border-b border-white/20 pb-1">
                    <span>Explore Store</span>
                    <div className="h-1 w-1 rounded-full bg-white animate-pulse" />
                  </div>
               </div>
            </div>

            {/* Corner Accent */}
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
               <div className="h-8 w-8 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-sm">
                  <div className="h-1 w-1 rounded-full bg-white" />
               </div>
            </div>
          </motion.div>
        ))}
        </div>

      </div>
    </section>
  )
}
