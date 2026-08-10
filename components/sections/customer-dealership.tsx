"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Star, MapPin, Phone, Clock, Navigation, ExternalLink } from "lucide-react"
import Link from "next/link"

const testimonials = [
  {
    quote: "I had an excellent experience working with my Sales advisors Rahida and Sheetal. They were knowledgeable and patient. They took the time to understand my preferences, explained all available options clearly, and ensured I felt confident in my purchase decision. Highly recommend!",
    name: "AKASH SURI",
    location: "Local Guide · AM Hyundai Jammu",
    avatar: "https://lh3.googleusercontent.com/a/ACg8ocK4af4puDi2_Kfv4dI6drZ3xlJ_m0b84GFozOneaarV4AcqM64=s64-c-rp-mo-ba12-br100",
    date: "3 months ago"
  },
  {
    quote: "Excellent experience with AM Hyundai. The staff was professional and cooperative, and the overall process was smooth and hassle-free. A special thanks to Shivani Ma'am for her outstanding support, polite behavior, and clear guidance throughout the entire buying journey.",
    name: "Junaid Ahmad",
    location: "4 reviews · AM Hyundai Jammu",
    avatar: "https://lh3.googleusercontent.com/a-/ALV-UjX8zcw7A3eV9g7TTtKuFdXlo_9eVbO1ZI9X-un5FalVVftCdMIr=s64-c-rp-mo-br100",
    date: "7 months ago"
  },
  {
    quote: "I had a wonderful experience purchasing my Hyundai Venue from AM Hyundai. The entire process, from booking to delivery, was smooth and transparent. The sales team was courteous, patient, and answered all my questions regarding the vehicle, insurance, loan, and documentation.",
    name: "Abbu Ayad",
    location: "1 review · AM Hyundai Jammu",
    avatar: "https://lh3.googleusercontent.com/a-/ALV-UjUyoiC7UOiCHQC_Esu9YOkBJvhlsF-kxhqTjxxqAexoWN3P4t-cFA=s64-c-rp-mo-br100",
    date: "4 weeks ago"
  },
  {
    quote: "Outstanding service from AM Kia Jammu! The team helped me select the perfect Seltos for my family. The test drive experience was smooth and the paperwork was handled efficiently. Couldn't be happier with the purchase!",
    name: "Vikas Sharma",
    location: "Local Guide · AM Kia Jammu",
    avatar: "https://lh3.googleusercontent.com/a/default-user=s64-c-rp-mo-br100",
    date: "5 months ago"
  },
  {
    quote: "Bought a pre-owned Hyundai Creta from AM Group's certified used car section. The car was in excellent condition, pricing was fair, and all documents were clear. The sales executive explained every detail patiently. Very trustworthy dealership!",
    name: "Rohit Gupta",
    location: "2 reviews · AM Group Jammu",
    avatar: "https://lh3.googleusercontent.com/a/default-user=s64-c-rp-mo-br100",
    date: "2 months ago"
  },
  {
    quote: "AM Group has been our family's go-to for vehicles for years. Recently serviced our Hyundai Tucson at their workshop — fast turnaround, genuine parts, and courteous staff. The waiting lounge was comfortable and the team kept us updated throughout.",
    name: "Sunita Raina",
    location: "3 reviews · AM Hyundai Jammu",
    avatar: "https://lh3.googleusercontent.com/a/default-user=s64-c-rp-mo-br100",
    date: "1 month ago"
  }
]

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function CustomerDealershipSection() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [imgErrorMap, setImgErrorMap] = useState<Record<number, boolean>>({})
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-advance every 1.5 s; pause when user hovers the card
  useEffect(() => {
    if (isPaused) return
    intervalRef.current = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % testimonials.length)
    }, 1500)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isPaused, activeIdx])

  return (
    <section className="py-20 bg-[#f8f9fa] border-t border-black/5">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: What Our Customers Say */}
          <div
            className="lg:col-span-5 bg-white rounded-[32px] p-8 md:p-10 border border-black/10 shadow-sm flex flex-col justify-between text-left"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-[#023468] mb-4">
                What Our Customers Say
              </h3>

              {/* 5 Stars + Google badge */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <div className="flex items-center gap-1.5 bg-[#f8f9fa] border border-black/8 rounded-full px-3 py-1">
                  <svg width="12" height="12" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <span className="text-[10px] font-bold text-black/75 uppercase tracking-wider">Google</span>
                </div>
              </div>

              {/* Quote — animated on slide change */}
              <motion.blockquote
                key={activeIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="text-black/80 text-base md:text-lg font-medium leading-relaxed italic mb-8 min-h-[100px]"
              >
                &ldquo;{testimonials[activeIdx].quote}&rdquo;
              </motion.blockquote>
            </div>

            {/* Author & Pagination Dots */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-black/5">
              <div className="flex items-center space-x-3 min-w-0">
                {imgErrorMap[activeIdx] ? (
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#023468] to-[#E31837] text-white font-black text-sm flex items-center justify-center shadow-md border-2 border-[#023468]/10 flex-shrink-0">
                    {getInitials(testimonials[activeIdx].name)}
                  </div>
                ) : (
                  <img
                    src={testimonials[activeIdx].avatar}
                    alt={testimonials[activeIdx].name}
                    onError={() => setImgErrorMap((prev) => ({ ...prev, [activeIdx]: true }))}
                    className="h-12 w-12 rounded-full object-cover shadow-md border-2 border-[#023468]/10 flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <div className="text-sm font-extrabold text-[#023468] truncate">{testimonials[activeIdx].name}</div>
                  <div className="text-xs font-semibold text-black/75 truncate">{testimonials[activeIdx].location}</div>
                  <div className="text-[10px] font-bold text-black/70 mt-0.5">{testimonials[activeIdx].date}</div>
                </div>
              </div>

              {/* Pagination Dots */}
              <div className="flex items-center space-x-0.5 self-center sm:self-auto">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setActiveIdx(idx); setIsPaused(true); setTimeout(() => setIsPaused(false), 4000) }}
                    className="p-1.5 flex items-center justify-center cursor-pointer rounded-full"
                    aria-label={`Testimonial ${idx + 1}`}
                  >
                    <span
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        activeIdx === idx ? "w-6 bg-[#023468]" : "w-2.5 bg-black/35"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Google Maps link */}
            <Link
              href="https://www.google.com/maps/place/AM+Hyundai+Jammu"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] font-bold text-[#023468] hover:text-[#E31837] uppercase tracking-wider transition-colors mt-4"
            >
              <svg width="12" height="12" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Read all reviews on Google
              <ExternalLink className="h-2.5 w-2.5" />
            </Link>
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
                      <div className="font-normal text-white/90">Mon - Sat: 9:00 AM - 7:00 PM</div>
                      <div className="font-normal text-white/80">Sunday: Closed</div>
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
