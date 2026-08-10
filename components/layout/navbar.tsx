"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ChevronDown, ChevronRight, Phone, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import type { SeoLinks } from "@/lib/seo/links"
import { PRIMARY_LOCATION, whatsappUrl } from "@/lib/locations"

const navItems = [
  { name: "Locations", href: "/locations" },
  { name: "News", href: "/blog" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
]

const businesses = [
  { name: "Automobile", href: "/automobile" },
  { name: "HP & Indian Oil", href: "/hp-indian-oil" },
  { name: "Real Estate", href: "/real-estate" },
  { name: "S Mega Mart", href: "/s-mega-mart" },
]

export function Navbar({ seoLinks }: { seoLinks: SeoLinks }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isBusinessesOpen, setIsBusinessesOpen] = React.useState(false)
  const [isCarsOpen, setIsCarsOpen] = React.useState(false)
  const pathname = usePathname()
  const { onOpen } = useEnquiryModal()

  const makesList = seoLinks?.makes?.length
    ? seoLinks.makes.slice(0, 6)
    : [
        { label: "Used Hyundai Cars", href: "/brands/hyundai", count: 13 },
        { label: "Used Kia Cars", href: "/brands/kia", count: 10 },
        { label: "Used Maruti Suzuki Cars", href: "/brands/maruti-suzuki", count: 3 },
        { label: "Used Chevrolet Cars", href: "/brands/chevrolet", count: 1 },
      ]

  const bodyTypesList = seoLinks?.bodyTypes?.length
    ? seoLinks.bodyTypes.slice(0, 6)
    : [
        { label: "SUV", href: "/inventory?bodyType=SUV", count: 12 },
        { label: "Hatchback", href: "/inventory?bodyType=Hatchback", count: 6 },
        { label: "Compact SUV", href: "/inventory?bodyType=Compact+SUV", count: 4 },
        { label: "Sedan", href: "/inventory?bodyType=Sedan", count: 3 },
        { label: "Premium SUV", href: "/inventory?bodyType=Premium+SUV", count: 2 },
      ]

  const citiesList = seoLinks?.cities?.length
    ? seoLinks.cities
    : [
        { label: "Used Cars in Jammu", href: "/used-cars/jammu" },
        { label: "Used Cars in Srinagar", href: "/used-cars/srinagar" },
        { label: "Used Cars in Udhampur", href: "/used-cars/udhampur" },
        { label: "Used Cars in Kathua", href: "/used-cars/kathua" },
      ]

  const totalCars = seoLinks?.total ?? 27

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-black/10 shadow-sm"
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-16 md:h-18 items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center py-1">
             <Image 
               src="https://amgroupind.com/wp-content/uploads/2023/06/logo-1.png" 
               alt="AM Group" 
               width={160}
               height={40}
               priority
               className="h-9 md:h-10 w-auto object-contain brightness-0 transition-all hover:opacity-85" 
             />
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center bg-zinc-100/80 rounded-full px-2 py-1 border border-black/5">
            
            {/* Used Cars Mega Menu Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsCarsOpen(true)}
              onMouseLeave={() => setIsCarsOpen(false)}
            >
              <Link
                href="/inventory"
                className={cn(
                  "px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-full flex items-center gap-1.5 cursor-pointer",
                  pathname?.startsWith("/inventory") || isCarsOpen
                    ? "bg-[#023468] text-white shadow-sm"
                    : "text-black/70 hover:text-[#023468]",
                )}
              >
                Used Cars
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-300", isCarsOpen && "rotate-180")} />
              </Link>

              <AnimatePresence>
                {isCarsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[640px] z-[60]"
                  >
                    <div className="bg-white rounded-2xl shadow-2xl border border-black/10 p-6 grid grid-cols-3 gap-6 text-left">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#023468] mb-3">
                          By Brand
                        </p>
                        <div className="space-y-2">
                          {makesList.map((l) => (
                            <Link
                              key={l.href}
                              href={l.href}
                              className="block text-xs font-bold text-black/70 hover:text-[#E31837] transition-colors"
                            >
                              {l.label}
                              {typeof l.count === "number" && <span className="text-black/40 font-normal"> ({l.count})</span>}
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#023468] mb-3">
                          By Body Type
                        </p>
                        <div className="space-y-2">
                          {bodyTypesList.map((l) => (
                            <Link
                              key={l.href}
                              href={l.href}
                              className="block text-xs font-bold text-black/70 hover:text-[#E31837] transition-colors"
                            >
                              {l.label}
                              {typeof l.count === "number" && <span className="text-black/40 font-normal"> ({l.count})</span>}
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#023468] mb-3">
                          By City
                        </p>
                        <div className="space-y-2">
                          {citiesList.map((l) => (
                            <Link
                              key={l.href}
                              href={l.href}
                              className="block text-xs font-bold text-black/70 hover:text-[#E31837] transition-colors"
                            >
                              {l.label}
                            </Link>
                          ))}
                        </div>
                        <Link
                          href="/inventory"
                          className="mt-4 inline-block text-[10px] font-black uppercase tracking-widest text-[#023468] hover:text-[#E31837]"
                        >
                          View all {totalCars} cars →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Our Businesses Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setIsBusinessesOpen(true)}
              onMouseLeave={() => setIsBusinessesOpen(false)}
            >
              <button className={cn(
                "px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-full flex items-center gap-1.5 cursor-pointer",
                isBusinessesOpen ? "bg-[#023468] text-white shadow-sm" : "text-black/70 hover:text-[#023468]"
              )}>
                Our Businesses
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-300", isBusinessesOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isBusinessesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-black/5 overflow-hidden z-[60] p-1.5"
                  >
                    <div>
                      {businesses.map((business) => (
                        <Link
                          key={business.name}
                          href={business.href}
                          className="block px-4 py-3 text-xs font-bold uppercase tracking-wider text-black/70 hover:text-[#023468] hover:bg-zinc-100 rounded-xl transition-all"
                        >
                          {business.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-full",
                  pathname === item.href 
                    ? "bg-[#023468] text-white shadow-sm" 
                    : "text-black/70 hover:text-[#023468]"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Action CTA */}
          <div className="flex items-center gap-3">
            <a
              href={`tel:${PRIMARY_LOCATION.phoneE164}`}
              data-track-location="navbar"
              className="hidden md:flex items-center gap-2 rounded-full border border-[#023468]/20 px-4 py-2.5 text-[#023468] hover:bg-[#023468] hover:text-white transition-all font-extrabold uppercase tracking-widest text-[11px]"
            >
              <Phone className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">{PRIMARY_LOCATION.phone}</span>
              <span className="lg:hidden">Call</span>
            </a>

            <button
              onClick={() => onOpen(null, { intent: "Test Drive", sourceLabel: "navbar" })}
              className="hidden md:flex bg-[#E31837] text-white hover:bg-[#023468] rounded-full px-6 py-2.5 font-extrabold uppercase tracking-widest text-[11px] shadow-md transition-all active:scale-95 cursor-pointer items-center justify-center"
            >
              Book Test Drive
            </button>
            
            {/* Mobile Toggle */}
            <div className="md:hidden">
              <button
                className="text-black/80 hover:text-black p-2 rounded-full hover:bg-zinc-100 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Navigation"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="md:hidden mt-3 bg-white/95 backdrop-blur-2xl rounded-[32px] border border-black/5 p-6 shadow-2xl text-black"
          >
            <div className="flex flex-col space-y-5">
              
              {/* Dedicated Used Cars Mobile Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#023468]">
                    Used Cars ({totalCars} in Stock)
                  </span>
                  <Link
                    href="/inventory"
                    onClick={() => setIsOpen(false)}
                    className="text-[10px] font-black uppercase tracking-widest text-[#E31837] hover:underline"
                  >
                    View All →
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2.5">
                  <Link
                    href="/inventory"
                    onClick={() => setIsOpen(false)}
                    className="bg-[#023468] text-white rounded-xl p-3 text-xs font-black uppercase tracking-wider flex items-center justify-between shadow-sm"
                  >
                    <span>All Inventory</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href="/inventory?bodyType=SUV"
                    onClick={() => setIsOpen(false)}
                    className="bg-zinc-100 rounded-xl p-3 text-[11px] font-bold uppercase tracking-wider text-black/80 hover:bg-[#023468] hover:text-white transition-colors"
                  >
                    Used SUVs
                  </Link>
                </div>

                {/* Popular Brand Fast Links */}
                <div className="flex flex-wrap gap-1.5">
                  {makesList.map((m) => (
                    <Link
                      key={m.href}
                      href={m.href}
                      onClick={() => setIsOpen(false)}
                      className="bg-zinc-100 px-3 py-1.5 rounded-full text-[10px] font-bold text-black/75 hover:bg-[#E31837] hover:text-white transition-colors"
                    >
                      {m.label} {typeof m.count === "number" && `(${m.count})`}
                    </Link>
                  ))}
                </div>
              </div>

              <hr className="border-black/5" />

              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 mb-3">Our Businesses</div>
                <div className="grid grid-cols-2 gap-2">
                  {businesses.map((business) => (
                    <Link
                      key={business.name}
                      href={business.href}
                      onClick={() => setIsOpen(false)}
                      className="bg-zinc-100 rounded-xl p-3 text-[11px] font-bold uppercase tracking-wider text-black/80 hover:bg-[#023468] hover:text-white transition-colors"
                    >
                      {business.name}
                    </Link>
                  ))}
                </div>
              </div>
              
              <hr className="border-black/5" />

              <div className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="text-sm font-extrabold text-black/80 hover:text-[#E31837] uppercase tracking-wider py-1"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              <hr className="border-black/5" />

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${PRIMARY_LOCATION.phoneE164}`}
                  data-track-location="navbar-mobile"
                  className="flex items-center justify-center gap-2 rounded-full border border-[#023468]/20 py-3.5 text-[#023468] font-extrabold uppercase tracking-widest text-[11px]"
                >
                  <Phone className="h-4 w-4" /> Call
                </a>
                <a
                  href={whatsappUrl("Hi AM Group, I'm looking for a used car in Jammu.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track-location="navbar-mobile"
                  className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-white font-extrabold uppercase tracking-widest text-[11px]"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </div>

              <button
                onClick={() => { onOpen(null, { intent: "Test Drive", sourceLabel: "navbar-mobile" }); setIsOpen(false); }}
                className="w-full bg-[#E31837] text-white hover:bg-[#023468] rounded-full py-4 font-extrabold uppercase tracking-widest text-xs shadow-md transition-colors cursor-pointer"
              >
                Book Test Drive / Inquiry
              </button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
