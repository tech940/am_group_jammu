"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"

interface ParallaxBannerProps {
  image: string
  title?: string
  subtitle?: string
}

export function ParallaxBanner({ image, title, subtitle }: ParallaxBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  return (
    <section 
      ref={containerRef}
      className="relative h-[60vh] min-h-[400px] w-full overflow-hidden flex items-center justify-center"
    >
      <motion.div 
        style={{ y }}
        className="absolute inset-0 z-0 h-[140%] w-full"
      >
        <Image
          src={image}
          alt="Parallax background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      <motion.div 
        style={{ opacity }}
        className="container mx-auto px-4 md:px-8 relative z-10 text-center"
      >
        {title && (
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-2xl">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-light drop-shadow-lg">
            {subtitle}
          </p>
        )}
      </motion.div>
    </section>
  )
}
