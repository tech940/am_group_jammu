"use client"

import React from "react"
import { motion } from "framer-motion"
import { MapPin, Phone, Mail, Send, Building2, MessageSquare, CheckCircle2 } from "lucide-react"
import { ContactForm } from "./contact-form"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Minimalist Cinematic Hero */}
      <section className="relative min-h-[50vh] flex items-center bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[1200px] h-[1200px] bg-[#E31837]/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-[#023468]/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />
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
                Get In Touch
              </span>
            </div>
            
            <h1 className="text-[44px] sm:text-[64px] md:text-[120px] font-bold text-white leading-[0.8] tracking-tight mb-12">
              Contact <br />
              <span className="text-[#E31837] italic font-light">Us</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Offices Section */}
      <section className="py-32 bg-white relative">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32">
            
            {/* Jammu Corporate Office */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group bg-zinc-50 rounded-[48px] p-12 border border-black/5 hover:border-[#023468]/20 transition-all duration-500 hover:shadow-2xl hover:shadow-[#023468]/5"
            >
              <div className="h-20 w-20 bg-[#023468] rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-[#023468]/20">
                <Building2 className="text-white h-10 w-10" />
              </div>
              <h2 className="text-3xl font-bold text-[#023468] mb-8">Corporate <span className="text-black/20">Office</span></h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-black/5 shrink-0 group-hover:border-[#E31837] transition-colors">
                    <MapPin className="h-4 w-4 text-[#E31837]" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-black/30 mb-2">Location</span>
                    <p className="text-black/70 font-medium leading-relaxed">
                      AM Business Park, N-H 1 Bye Pass Road,<br />
                      Jammu, Jammu and Kashmir 180012
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-black/5 shrink-0 group-hover:border-[#E31837] transition-colors">
                    <Phone className="h-4 w-4 text-[#E31837]" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-black/30 mb-2">Phone</span>
                    <p className="text-black/70 font-bold text-xl">+91 9484200000</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-black/5 shrink-0 group-hover:border-[#E31837] transition-colors">
                    <Mail className="h-4 w-4 text-[#E31837]" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-black/30 mb-2">Email</span>
                    <p className="text-black/70 font-medium">info@amgroupind.com</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* New Delhi Office */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group bg-zinc-50 rounded-[48px] p-12 border border-black/5 hover:border-emerald-500/20 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/5"
            >
              <div className="h-20 w-20 bg-emerald-600 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-emerald-600/20">
                <Building2 className="text-white h-10 w-10" />
              </div>
              <h2 className="text-3xl font-bold text-emerald-900 mb-8">New Delhi <span className="text-black/20">Office</span></h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-black/5 shrink-0 group-hover:border-emerald-500 transition-colors">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-black/30 mb-2">Location</span>
                    <p className="text-black/70 font-medium leading-relaxed">
                      B-2/8 Amaltas Marg, DLF Phase 1, Sector 26A,<br />
                      Gurugram, Haryana 122002, India
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-black/5 shrink-0 group-hover:border-emerald-500 transition-colors">
                    <Mail className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-black/30 mb-2">Email</span>
                    <p className="text-black/70 font-medium">info@amgroupind.com</p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Feedback Form Section */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
              
              <div className="lg:col-span-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E31837] mb-4 block">Feedback</span>
                  <h2 className="text-4xl md:text-5xl font-bold text-[#023468] tracking-tight mb-8">We Welcome <br /><span className="text-black/20">Your Voice.</span></h2>
                  <p className="text-black/40 text-lg font-light leading-relaxed mb-10">
                    Do you have questions or comments for us? We’d love to hear them! 
                    Fill out the form and our representative will get back to you as soon as possible.
                  </p>
                  <div className="flex items-center gap-4 text-[#023468] font-black text-[10px] uppercase tracking-widest">
                    <MessageSquare className="h-5 w-5 text-[#E31837]" />
                    Human support in 24 hours
                  </div>
                </motion.div>
              </div>

              <div className="lg:col-span-8">
                <ContactForm />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Aesthetic Background Shape */}
      <div className="fixed bottom-0 right-0 p-32 opacity-[0.02] pointer-events-none z-0">
         <Building2 className="h-[600px] w-[600px] text-black -rotate-12" />
      </div>
    </div>
  )
}
