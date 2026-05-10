"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { IndianRupee, Calculator, PieChart, Percent, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FinanceSection() {
  const [loanAmount, setLoanAmount] = useState(1000000)
  const [tenure, setTenure] = useState(60)
  const [interestRate, setInterestRate] = useState(8.5)

  const monthlyInterestRate = interestRate / 12 / 100
  const emi = 
    (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, tenure)) /
    (Math.pow(1 + monthlyInterestRate, tenure) - 1)

  const totalAmount = emi * tenure
  const totalInterest = totalAmount - loanAmount

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const formatRawNumber = (val: number) => {
    return new Intl.NumberFormat('en-IN').format(val)
  }

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#023468] hidden lg:block -skew-x-6 translate-x-12" />
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left: Content */}
          <div className="lg:w-[45%]">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.21, 1.02, 0.47, 0.98] }}
              viewport={{ once: true }}
            >
              <div className="mb-6 inline-flex items-center gap-3">
                <div className="h-[1px] w-8 bg-[#E31837]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E31837]">
                  Finance Solutions
                </span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-[#023468] mb-6 leading-tight tracking-tight">
                Premium Finance <br /> 
                <span className="text-black/20">Tailored for You</span>
              </h2>
              
              <p className="text-black/50 text-lg mb-10 max-w-lg leading-relaxed font-light">
                Experience the convenience of customized automotive financing. 
                Our experts ensure you get the best rates with zero hidden hurdles.
              </p>

              <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="space-y-3">
                   <div className="h-10 w-10 bg-[#023468]/5 rounded-xl flex items-center justify-center">
                      <Percent className="h-5 w-5 text-[#023468]" />
                   </div>
                   <h4 className="text-[11px] font-black uppercase tracking-widest text-black">Low Rates</h4>
                   <p className="text-xs text-black/40 leading-relaxed">Starting from 7.9%* p.a.</p>
                </div>
                <div className="space-y-3">
                   <div className="h-10 w-10 bg-[#023468]/5 rounded-xl flex items-center justify-center">
                      <Clock className="h-5 w-5 text-[#023468]" />
                   </div>
                   <h4 className="text-[11px] font-black uppercase tracking-widest text-black">Fast Approval</h4>
                   <p className="text-xs text-black/40 leading-relaxed">Processed within 24 hours.</p>
                </div>
              </div>

              <Button size="xl" className="bg-[#023468] text-white hover:bg-[#E31837] rounded-xl px-10 h-14 font-black uppercase tracking-widest text-[10px] transition-all duration-500 shadow-xl shadow-[#023468]/20">
                Apply for Finance
                <ArrowRight className="ml-3 h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          {/* Right: Modern Calculator */}
          <div className="lg:w-[55%] w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.21, 1.02, 0.47, 0.98] }}
              viewport={{ once: true }}
              className="bg-[#023468] lg:bg-white lg:shadow-[0_40px_100px_rgba(0,0,0,0.12)] rounded-[40px] p-8 md:p-10 border border-black/5"
            >
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-black/5">
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-[#E31837]/10 flex items-center justify-center rounded-xl">
                       <Calculator className="h-5 w-5 text-[#E31837]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#023468] lg:text-[#023468] text-white">EMI Calculator</h3>
                 </div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-white/40 lg:text-black/30">Instantly Calculate</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                {/* Sliders Area */}
                <div className="space-y-6">
                  {/* Loan Amount */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/60 lg:text-black/40">
                      <label>Amount</label>
                      <span className="text-white lg:text-[#023468]" suppressHydrationWarning>₹ {formatRawNumber(loanAmount)}</span>
                    </div>
                    <input 
                      type="range" min="100000" max="10000000" step="50000" value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className="w-full h-1 bg-white/10 lg:bg-black/5 rounded-full appearance-none cursor-pointer accent-[#E31837]"
                    />
                  </div>

                  {/* Tenure */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/60 lg:text-black/40">
                      <label>Tenure</label>
                      <span className="text-white lg:text-[#023468]">{tenure} Mo</span>
                    </div>
                    <input 
                      type="range" min="12" max="84" step="12" value={tenure}
                      onChange={(e) => setTenure(Number(e.target.value))}
                      className="w-full h-1 bg-white/10 lg:bg-black/5 rounded-full appearance-none cursor-pointer accent-[#E31837]"
                    />
                  </div>

                  {/* Interest */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/60 lg:text-black/40">
                      <label>Rate (% PA)</label>
                      <span className="text-white lg:text-[#023468]">{interestRate}%</span>
                    </div>
                    <input 
                      type="range" min="5" max="15" step="0.1" value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full h-1 bg-white/10 lg:bg-black/5 rounded-full appearance-none cursor-pointer accent-[#E31837]"
                    />
                  </div>
                </div>

                {/* Result Area */}
                <div className="bg-white/5 lg:bg-zinc-50 rounded-3xl p-6 flex flex-col justify-center border border-white/5 lg:border-black/5">
                  <div className="mb-6">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40 lg:text-black/30 block mb-2 text-center">Monthly Commitment</span>
                    <div className="text-3xl md:text-4xl font-black text-white lg:text-[#023468] text-center" suppressHydrationWarning>
                      {formatCurrency(Math.round(emi))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10 lg:border-black/5">
                    <div className="text-center">
                      <span className="block text-[8px] font-black uppercase tracking-[0.2em] text-white/30 lg:text-black/20 mb-1">Interest</span>
                      <span className="text-xs font-bold text-white/80 lg:text-[#023468]" suppressHydrationWarning>{formatCurrency(Math.round(totalInterest))}</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-[8px] font-black uppercase tracking-[0.2em] text-white/30 lg:text-black/20 mb-1">Total Pay</span>
                      <span className="text-xs font-bold text-white/80 lg:text-[#023468]" suppressHydrationWarning>{formatCurrency(Math.round(totalAmount))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
