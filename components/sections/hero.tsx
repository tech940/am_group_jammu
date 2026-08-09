"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ChevronRight, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"

const heroShowcaseItems = [
  {
    id: "showcase-1",
    tag: "FEATURED FLEET",
    title: "Hyundai Creta & Tata Harrier 2025",
    subtitle: "Tough & Rugged SUV Fleet with Exclusive AM Group Dealer Offers & Instant Loan Approvals.",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1920",
    link: "/inventory?type=suv"
  },
  {
    id: "showcase-2",
    tag: "POPULAR SUV",
    title: "MG Hector & Kia Seltos GTX",
    subtitle: "Next-gen smart mobility with luxury panoramic sunroof & ADAS level-2 safety.",
    image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=1920",
    link: "/inventory?make=MG"
  },
  {
    id: "showcase-3",
    tag: "ELECTRIC MOBILITY",
    title: "Hyundai IONIQ 5 & Kia EV6 GT",
    subtitle: "Ultra-fast 800V charging with up to 631 km extended driving range in J&K.",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1920",
    link: "/inventory?type=ev"
  }
]

export function Hero() {
  const router = useRouter()
  const { onOpen } = useEnquiryModal()

  // Form State
  const [carType, setCarType] = React.useState<"new" | "used">("new")
  const [filterMode, setFilterMode] = React.useState<"budget" | "brand">("budget")
  const [budget, setBudget] = React.useState("")
  const [vehicleType, setVehicleType] = React.useState("")
  
  // Showcase Slide State
  const [activeSlideIdx, setActiveSlideIdx] = React.useState(0)

  const currentShowcase = heroShowcaseItems[activeSlideIdx]

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/inventory?condition=${carType}&budget=${budget}&type=${vehicleType}`)
  }

  return (
    <section className="relative w-full min-h-[600px] sm:min-h-[660px] lg:min-h-[720px] bg-zinc-900 pt-24 md:pt-32 pb-16 overflow-hidden">
      
      {/* CLEAN, BRIGHT OUTDOOR BACKGROUND IMAGE */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentShowcase.id}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={currentShowcase.image}
            alt={currentShowcase.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center brightness-[0.98] contrast-[1.02]"
          />
          {/* Subtle bottom gradient only to ensure bottom ticker text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[500px]">
          
          {/* LEFT COLUMN: FLOATING SEARCH FORM CARD (Compulsory Form) */}
          <div className="lg:col-span-5 order-1">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/95 backdrop-blur-md rounded-[28px] p-6 sm:p-8 shadow-2xl border border-black/10 text-left max-w-md mx-auto lg:mx-0"
            >
              <h2 className="text-2xl sm:text-3xl font-black text-[#023468] mb-5 tracking-tight">
                Find your right car
              </h2>

              {/* Segmented Pill Tabs: New Car vs Used Car */}
              <div className="grid grid-cols-2 gap-2 bg-zinc-100 p-1.5 rounded-2xl mb-5">
                <button
                  type="button"
                  onClick={() => setCarType("new")}
                  className={`py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    carType === "new"
                      ? "bg-[#023468] text-white shadow-md"
                      : "text-black/60 hover:text-black"
                  }`}
                >
                  New Car
                </button>
                <button
                  type="button"
                  onClick={() => setCarType("used")}
                  className={`py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    carType === "used"
                      ? "bg-[#023468] text-white shadow-md"
                      : "text-black/60 hover:text-black"
                  }`}
                >
                  Used Car
                </button>
              </div>

              {/* Radio Filter Toggle: By Budget vs By Brand */}
              <div className="flex items-center space-x-6 mb-5">
                <label className="flex items-center space-x-2 text-xs font-bold text-black cursor-pointer">
                  <input
                    type="radio"
                    name="filterMode"
                    checked={filterMode === "budget"}
                    onChange={() => setFilterMode("budget")}
                    className="h-4 w-4 accent-[#E31837] cursor-pointer"
                  />
                  <span className={filterMode === "budget" ? "text-[#E31837] font-extrabold" : "text-black/70"}>By Budget</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-bold text-black cursor-pointer">
                  <input
                    type="radio"
                    name="filterMode"
                    checked={filterMode === "brand"}
                    onChange={() => setFilterMode("brand")}
                    className="h-4 w-4 accent-[#E31837] cursor-pointer"
                  />
                  <span className={filterMode === "brand" ? "text-[#E31837] font-extrabold" : "text-black/70"}>By Brand</span>
                </label>
              </div>

              {/* Form Input Controls */}
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-zinc-50 border border-black/15 rounded-xl px-4 py-3.5 text-xs font-bold text-black focus:outline-none focus:border-[#023468] focus:bg-white"
                  >
                    <option value="">Select Budget</option>
                    <option value="10">Under ₹10 Lakh</option>
                    <option value="20">₹10 Lakh - ₹20 Lakh</option>
                    <option value="30">Above ₹20 Lakh</option>
                  </select>
                </div>

                <div>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full bg-zinc-50 border border-black/15 rounded-xl px-4 py-3.5 text-xs font-bold text-black focus:outline-none focus:border-[#023468] focus:bg-white"
                  >
                    <option value="">All Vehicle Types</option>
                    <option value="suv">SUVs &amp; Crossovers</option>
                    <option value="sedan">Sedans &amp; Hatchbacks</option>
                    <option value="ev">Electric &amp; Hybrids</option>
                    <option value="commercial">Commercial Fleet</option>
                  </select>
                </div>

                {/* Main Action Button */}
                <button
                  type="submit"
                  className="w-full bg-[#E31837] hover:bg-[#023468] text-white font-extrabold text-xs uppercase tracking-widest py-4 rounded-xl shadow-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 group"
                >
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </button>
              </form>

              {/* Bottom Advanced Search Link */}
              <div className="mt-4 text-right">
                <Link
                  href="/inventory"
                  className="text-[11px] font-extrabold text-black/60 hover:text-[#023468] transition-colors inline-flex items-center gap-1"
                >
                  <span>Advanced Search</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

            </motion.div>
          </div>

          {/* RIGHT COLUMN: CLEAN SHOWCASE OVERLAY (Zero Black Blur Box) */}
          <div className="lg:col-span-7 order-2 text-left text-white pt-4 lg:pt-0">
            <motion.div
              key={currentShowcase.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4 max-w-xl ml-auto"
            >
              {/* Launched Pill Tag */}
              <span className="bg-[#E31837] text-white px-3.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest inline-block shadow-lg">
                {currentShowcase.tag}
              </span>

              {/* Big Bold Display Headline with Crisp Shadow */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                {currentShowcase.title}
              </h1>

              {/* Subtitle with Shadow */}
              <p className="text-white font-medium text-xs sm:text-sm leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] max-w-lg">
                {currentShowcase.subtitle}
              </p>

              {/* Know More Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => onOpen()}
                  className="bg-white text-[#023468] hover:bg-[#E31837] hover:text-white rounded-full px-8 py-3 font-extrabold text-xs uppercase tracking-widest shadow-2xl transition-all duration-300 cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Know More</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* BOTTOM SLIDER TICKER TABS (All in one line, scrollbar 100% hidden) */}
              <div className="pt-8 flex flex-nowrap items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden max-w-full">
                {heroShowcaseItems.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSlideIdx(idx)}
                    className={`text-left cursor-pointer pb-1.5 transition-all duration-300 border-b-2 flex-shrink-0 ${
                      activeSlideIdx === idx
                        ? "border-white text-white font-extrabold drop-shadow-md"
                        : "border-transparent text-white/70 hover:text-white font-medium"
                    }`}
                  >
                    <span className="text-xs sm:text-sm block whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {item.title}
                    </span>
                  </button>
                ))}
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}

