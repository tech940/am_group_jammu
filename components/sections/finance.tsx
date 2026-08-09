"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"

export function FinanceSection() {
  const { onOpen } = useEnquiryModal()

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Prototype Screenshot 2: Get Pre-Approved Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative bg-[#023468] text-white rounded-[36px] p-8 sm:p-12 md:p-16 shadow-2xl overflow-hidden flex flex-col md:flex-row justify-between items-center gap-10"
        >
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#E31837]/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Left Column: Content */}
          <div className="space-y-4 text-left max-w-xl relative z-10">
            <span className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/10 inline-block">
              INSTANT CREDIT EVALUATION
            </span>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
              Get Pre-Approved in Minutes
            </h2>
            
            <p className="text-white/80 text-sm md:text-base font-normal leading-relaxed">
              No impact on your credit score. Fast, easy, and 100% secure processing with leading partner banks across J&amp;K.
            </p>

            <div className="pt-4">
              <button
                onClick={() => onOpen()}
                className="bg-white text-[#023468] hover:bg-[#E31837] hover:text-white rounded-full px-8 py-4 font-extrabold text-xs uppercase tracking-widest shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Get Pre-Approved</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Credit Score Gauge Graphic (Matching Prototype Screenshot 2) */}
          <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/15 rounded-[32px] p-8 text-center min-w-[280px] sm:min-w-[320px]">
            {/* Credit Score Gauge Semi-Circle Meter with Needle Arrow */}
            <div className="relative w-56 h-36 mx-auto mb-2 flex flex-col items-center justify-start">
              <svg viewBox="0 0 200 135" className="w-56 h-36">
                {/* Background Track Arc */}
                <path
                  d="M 25 80 A 75 75 0 0 1 175 80"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                {/* Colored Score Arc */}
                <path
                  d="M 25 80 A 75 75 0 0 1 175 80"
                  fill="none"
                  stroke="url(#scoreGaugeGradient)"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                {/* Pointer Needle Arrow (Rotated to 720 score point, anchored at 100, 80) */}
                <g transform="translate(100, 80) rotate(38)">
                  <polygon points="-3,0 0,-60 3,0" fill="#FFFFFF" />
                  <circle cx="0" cy="0" r="5" fill="#FFFFFF" />
                  <circle cx="0" cy="0" r="2.5" fill="#023468" />
                </g>
                <defs>
                  <linearGradient id="scoreGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="45%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Score Display Text (Separated below needle pivot) */}
              <div className="-mt-9 text-center relative z-10">
                <span className="text-3xl font-black text-white block leading-none tracking-tight">720</span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 mt-1 block">Good Score</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-white/60 pt-3 border-t border-white/10">
              <span>300</span>
              <span>850</span>
            </div>
          </div>

        </motion.div>

      </div>
    </section>
  )
}

