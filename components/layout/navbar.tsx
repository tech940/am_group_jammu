"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"

const navItems = [
  { name: "Used Cars", href: "/inventory" },
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

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isBusinessesOpen, setIsBusinessesOpen] = React.useState(false)
  const pathname = usePathname()
  const { onOpen } = useEnquiryModal()
  
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-4 z-50 w-full px-4 md:px-8"
    >
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between bg-white/90 rounded-full px-6 md:px-8 border border-black/5 shadow-xl backdrop-blur-xl transition-all">
          
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
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onOpen()}
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

              <button 
                onClick={() => { onOpen(); setIsOpen(false); }}
                className="w-full bg-[#E31837] text-white hover:bg-[#023468] rounded-full py-4 font-extrabold uppercase tracking-widest text-xs shadow-md transition-colors cursor-pointer"
              >
                Book Test Drive / Inquiry
              </button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
