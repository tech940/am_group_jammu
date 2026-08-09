"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star, MapPin, Phone, Clock, Navigation } from "lucide-react"

const testimonials = [
  {
    quote: "Great experience! The team at AM Group Jammu was professional, helpful, and made the vehicle delivery process so easy. Highly recommend!",
    name: "Jason M.",
    location: "Jammu, J&K",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
  },
  {
    quote: "Bought our Tata Harrier from AM Group. Transparent pricing, instant financing, and smooth registration. Best dealer in J&K!",
    name: "Rahul Sharma",
    location: "Srinagar, J&K",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
  },
  {
    quote: "Exceptional service at their master workshop. Quick turnaround and genuine OEM parts every single time.",
    name: "Priya Verma",
    location: "Udhampur, J&K",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
  }
]

export function CustomerDealershipSection() {
  const [activeIdx, setActiveIdx] = useState(0)

  return (
    <section className="py-20 bg-[#f8f9fa] border-t border-black/5">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: What Our Customers Say (Prototype Screenshot 2) */}
          <div className="lg:col-span-5 bg-white rounded-[32px] p-8 md:p-10 border border-black/10 shadow-sm flex flex-col justify-between text-left">
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-[#023468] mb-6">
                What Our Customers Say
              </h3>

              {/* 5 Stars Rating */}
              <div className="flex items-center space-x-1 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-amber-500 fill-amber-500" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-black/80 text-base md:text-lg font-medium leading-relaxed italic mb-8 min-h-[100px]">
                &ldquo;{testimonials[activeIdx].quote}&rdquo;
              </blockquote>
            </div>

            {/* Author & Pagination Dots */}
            <div className="flex items-center justify-between pt-6 border-t border-black/5">
              <div className="flex items-center space-x-3">
                <img
                  src={testimonials[activeIdx].avatar}
                  alt={testimonials[activeIdx].name}
                  className="h-12 w-12 rounded-full object-cover shadow-md"
                />
                <div>
                  <div className="text-sm font-extrabold text-[#023468]">{testimonials[activeIdx].name}</div>
                  <div className="text-xs font-medium text-black/50">{testimonials[activeIdx].location}</div>
                </div>
              </div>

              {/* Pagination Dots */}
              <div className="flex space-x-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIdx(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      activeIdx === idx ? "w-6 bg-[#023468]" : "w-2.5 bg-black/20"
                    }`}
                    aria-label={`Testimonial ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Visit Our Dealership & Map Card (Prototype Screenshot 2) */}
          <div className="lg:col-span-7 bg-[#023468] rounded-[32px] overflow-hidden border border-black/10 shadow-2xl text-white grid grid-cols-1 md:grid-cols-2">
            
            {/* Info Text */}
            <div className="p-8 md:p-10 flex flex-col justify-between text-left space-y-6">
              <div>
                <h3 className="text-2xl font-black text-white mb-6">
                  Visit Our Dealership
                </h3>

                <div className="space-y-5 text-xs text-white/90">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-[#E31837] flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-extrabold uppercase tracking-wider text-white mb-0.5">Main Flagship Showroom</div>
                      <div className="font-normal text-white/70">Opp. Railway Station, Highway By-pass, Jammu, J&amp;K - 180012</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-[#E31837] flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-extrabold uppercase tracking-wider text-white mb-0.5">Call Us</div>
                      <div className="font-normal text-white/70">1800-AM-GROUP / +91 94191 00000</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-[#E31837] flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-extrabold uppercase tracking-wider text-white mb-0.5">Business Hours</div>
                      <div className="font-normal text-white/70">Mon - Sat: 9:00 AM - 7:00 PM</div>
                      <div className="font-normal text-white/50">Sunday: Closed</div>
                    </div>
                  </div>
                </div>
              </div>

              <a
                href="https://maps.google.com/?q=Jammu"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-[#023468] hover:bg-[#E31837] hover:text-white rounded-full px-6 py-3 font-extrabold text-xs uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Navigation className="h-4 w-4" />
                <span>Get Directions</span>
              </a>
            </div>

            {/* Map Preview */}
            <div className="relative min-h-[260px] md:min-h-full bg-zinc-800 border-t md:border-t-0 md:border-l border-white/10">
              <iframe
                title="AM Group Jammu Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d53696.58156114133!2d74.8251!3d32.7266!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391e84e72750e395%3A0xb304b772c72b2170!2sJammu!5e0!3m2!1sen!2sin!4v1700000000000"
                className="w-full h-full border-0 brightness-[0.9] contrast-[1.1]"
                loading="lazy"
              />
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
