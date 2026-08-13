"use client"

import * as React from "react"
import { motion, useScroll, useSpring, useTransform } from "framer-motion"

interface EditorialThreadProps {
  founded: number
  currentYear: number
}

export function EditorialThread({ founded, currentYear }: EditorialThreadProps) {
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 25 })
  const scaleY = useTransform(progress, [0, 1], [0, 1])

  const [year, setYear] = React.useState(founded)

  React.useEffect(() => {
    return progress.on("change", (v) => {
      const y = Math.round(founded + v * (currentYear - founded))
      setYear(y)
    })
  }, [progress, founded, currentYear])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-y-0 left-0 z-40 hidden w-16 select-none mix-blend-difference lg:flex lg:flex-col lg:justify-between lg:py-10 lg:pl-6"
    >
      {/* Top catalog code */}
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/80">
          AM GROUP
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/50">
          ARCHIVE
        </span>
      </div>

      {/* Center timeline line + year counter */}
      <div className="relative my-auto flex h-64 flex-col items-center">
        <div className="absolute inset-y-0 w-px bg-white/20" />
        <motion.div
          className="absolute inset-y-0 w-px origin-top bg-white"
          style={{ scaleY }}
        />
        <div className="absolute top-1/2 -translate-y-1/2 bg-black/80 px-1 py-2 backdrop-blur-xs">
          <span
            className="block font-mono text-[11px] font-bold tracking-widest text-white"
            style={{ writingMode: "vertical-rl" }}
          >
            {year}
          </span>
        </div>
      </div>

      {/* Bottom coordinate indicator */}
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/50">
          COORDINATES
        </span>
        <span className="font-mono text-[10px] tracking-wider text-white/80">
          32°43&apos;N
        </span>
      </div>
    </div>
  )
}
