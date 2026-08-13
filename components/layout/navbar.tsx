"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import type { SeoLinks } from "@/lib/seo/links"
import { PRIMARY_LOCATION, whatsappUrl } from "@/lib/locations"

const navItems = [
  { name: "About Us", href: "/about" },
  { name: "News", href: "/blog" },
  { name: "Contact", href: "/contact" },
]

const businesses = [
  { name: "Automobile Division", href: "/automobile" },
  { name: "HP & Indian Oil Forecourts", href: "/hp-indian-oil" },
  { name: "Real Estate & Infrastructure", href: "/real-estate" },
  { name: "S Mega Mart Retail", href: "/s-mega-mart" },
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
      className="fixed top-0 left-0 right-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200 text-slate-900 shadow-sm"
    >
      <div className="w-full px-5 md:px-10">
        <div className="flex h-16 md:h-20 items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center py-1">
             <Image 
               src="https://amgroupind.com/wp-content/uploads/2023/06/logo-1.png" 
               alt="AM Group" 
               width={160}
               height={40}
               priority
               className="h-9 md:h-10 w-auto object-contain transition-all hover:opacity-85" 
             />
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/90 rounded-full px-3 py-1.5 border border-slate-200">
            
            {/* 1. OUR BUSINESSES DROPDOWN */}
            <div 
              className="relative group"
              onMouseEnter={() => setIsBusinessesOpen(true)}
              onMouseLeave={() => setIsBusinessesOpen(false)}
            >
              <button className={cn(
                "px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-full flex items-center gap-1.5 cursor-pointer",
                isBusinessesOpen ? "bg-blue-600 text-white shadow-sm" : "text-slate-700 hover:text-blue-600"
              )}>
                Our Businesses
                <svg className={cn("h-3.5 w-3.5 transition-transform duration-300", isBusinessesOpen && "rotate-180")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </button>

              <AnimatePresence>
                {isBusinessesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[60] p-2"
                  >
                    <div>
                      {businesses.map((business) => (
                        <Link
                          key={business.name}
                          href={business.href}
                          className="block px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all"
                        >
                          {business.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. LOCATIONS (8 BRANCHES) */}
            <Link
              href="/locations"
              className={cn(
                "px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-full cursor-pointer",
                pathname?.startsWith("/locations")
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-700 hover:text-blue-600"
              )}
            >
              Locations (8 Hubs)
            </Link>

            {/* 3. USED CARS MEGA MENU */}
            <div
              className="relative"
              onMouseEnter={() => setIsCarsOpen(true)}
              onMouseLeave={() => setIsCarsOpen(false)}
            >
              <Link
                href="/inventory"
                className={cn(
                  "px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-full flex items-center gap-1.5 cursor-pointer",
                  pathname?.startsWith("/inventory") || isCarsOpen
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-700 hover:text-blue-600",
                )}
              >
                Used Cars
                <svg className={cn("h-3.5 w-3.5 transition-transform duration-300", isCarsOpen && "rotate-180")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
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
                    <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-6 grid grid-cols-3 gap-6 text-left">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-blue-600 mb-3">
                          By Brand
                        </p>
                        <div className="space-y-2">
                          {makesList.map((l) => (
                            <Link
                              key={l.href}
                              href={l.href}
                              className="block text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors"
                            >
                              {l.label}
                              {typeof l.count === "number" && <span className="text-slate-400 font-normal"> ({l.count})</span>}
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-blue-600 mb-3">
                          By Body Type
                        </p>
                        <div className="space-y-2">
                          {bodyTypesList.map((l) => (
                            <Link
                              key={l.href}
                              href={l.href}
                              className="block text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors"
                            >
                              {l.label}
                              {typeof l.count === "number" && <span className="text-slate-400 font-normal"> ({l.count})</span>}
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-blue-600 mb-3">
                          By City
                        </p>
                        <div className="space-y-2">
                          {citiesList.map((l) => (
                            <Link
                              key={l.href}
                              href={l.href}
                              className="block text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors"
                            >
                              {l.label}
                            </Link>
                          ))}
                        </div>
                        <Link
                          href="/inventory"
                          className="mt-4 inline-block text-[11px] font-bold uppercase tracking-widest text-blue-600 hover:underline"
                        >
                          View all {totalCars} cars →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 4. ABOUT, NEWS, CONTACT */}
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-full cursor-pointer",
                  pathname === item.href
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-700 hover:text-blue-600",
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
              className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-blue-600 transition-colors border border-slate-200 rounded-full px-4 py-2 bg-slate-50"
            >
              <svg className="h-3.5 w-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>{PRIMARY_LOCATION.phone}</span>
            </a>

            <Link
              href="/inventory"
              className="hidden sm:inline-flex bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md shadow-blue-600/20 cursor-pointer"
            >
              Explore Inventory
            </Link>
            
            {/* Mobile Toggle */}
            <div className="md:hidden">
              <button
                className="text-slate-900 hover:text-blue-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Navigation"
              >
                {isOpen ? (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                ) : (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                )}
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
            className="md:hidden mt-2 bg-white text-slate-900 border-b border-slate-200 p-6 shadow-2xl"
          >
            <div className="flex flex-col space-y-5">
              
              {/* 1. Our Businesses */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-blue-600 mb-3">Our Businesses</div>
                <div className="grid grid-cols-2 gap-2">
                  {businesses.map((business) => (
                    <Link
                      key={business.name}
                      href={business.href}
                      onClick={() => setIsOpen(false)}
                      className="bg-slate-50 rounded-xl p-3 text-[11px] font-bold uppercase tracking-wider text-slate-800 hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      {business.name}
                    </Link>
                  ))}
                </div>
              </div>
              
              <hr className="border-slate-200" />

              {/* 2. Locations (8 Branches) */}
              <div>
                <Link
                  href="/locations"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between bg-blue-50 text-blue-600 border border-blue-100 rounded-xl p-3.5 text-xs font-bold uppercase tracking-wider shadow-sm"
                >
                  <span>Locations (8 Hubs)</span>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </Link>
              </div>

              <hr className="border-slate-200" />

              {/* 3. Used Cars */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-blue-600">
                    Used Cars ({totalCars} in Stock)
                  </span>
                  <Link
                    href="/inventory"
                    onClick={() => setIsOpen(false)}
                    className="text-[11px] font-bold uppercase tracking-widest text-blue-600 hover:underline"
                  >
                    View All →
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2.5">
                  <Link
                    href="/inventory"
                    onClick={() => setIsOpen(false)}
                    className="bg-slate-100 text-slate-900 border border-slate-200 rounded-xl p-3 text-xs font-bold uppercase tracking-wider flex items-center justify-between shadow-sm"
                  >
                    <span>All Inventory</span>
                    <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </Link>

                  <Link
                    href="/inventory?bodyType=SUV"
                    onClick={() => setIsOpen(false)}
                    className="bg-slate-50 rounded-xl p-3 text-[11px] font-bold uppercase tracking-wider text-slate-800 hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    Used SUVs
                  </Link>
                </div>
              </div>

              <hr className="border-slate-200" />

              <div className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="text-sm font-bold text-slate-900 hover:text-blue-600 uppercase tracking-wider py-1"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              <hr className="border-slate-200" />

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`tel:${PRIMARY_LOCATION.phoneE164}`}
                  data-track-location="navbar-mobile"
                  className="flex items-center justify-center gap-2 rounded-full border border-slate-200 py-3.5 text-slate-900 font-bold uppercase tracking-widest text-[11px] bg-slate-50"
                >
                  <svg className="h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> Call
                </a>
                <a
                  href={whatsappUrl("Hi AM Group, I'm looking for a used car in Jammu.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track-location="navbar-mobile"
                  className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-white font-bold uppercase tracking-widest text-[11px]"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg> WhatsApp
                </a>
              </div>

              <Link
                href="/inventory"
                onClick={() => setIsOpen(false)}
                className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-full py-4 text-center font-bold uppercase tracking-widest text-xs shadow-md shadow-blue-600/20 transition-colors cursor-pointer block"
              >
                Explore Inventory
              </Link>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
