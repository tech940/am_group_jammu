"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, User, ShoppingBag, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Image from "next/image"


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

import { useEnquiryModal } from "@/hooks/use-enquiry-modal"

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
        <div className="flex h-16 items-center justify-between bg-black/40 rounded-full px-8 border border-white/5 shadow-2xl backdrop-blur-2xl">
          {/* Logo */}
          <Link href="/" target="_blank" className="flex items-center h-full py-2 relative w-32">
             <Image 
               src="https://amgroupind.com/wp-content/uploads/2023/06/logo-1.png" 
               alt="AM Group" 
               fill
               priority
               className="object-contain brightness-0 invert" 
             />
          </Link>


          {/* Desktop Nav - Centered like screenshot */}
          <div className="hidden md:flex items-center bg-white/5 rounded-full px-2 py-1 border border-white/5">
            {/* Our Businesses Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setIsBusinessesOpen(true)}
              onMouseLeave={() => setIsBusinessesOpen(false)}
            >
              <button className={cn(
                "px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-full flex items-center gap-2",
                isBusinessesOpen ? "text-white" : "text-white/60 hover:text-white"
              )}>
                Our Businesses
                <ChevronDown className={cn("h-3 w-3 transition-transform duration-500", isBusinessesOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isBusinessesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-black/5 overflow-hidden z-[60]"
                  >
                    <div className="py-2">
                      {businesses.map((business) => (
                        <Link
                          key={business.name}
                          href={business.href}
                          target="_blank"
                          className="block px-6 py-4 text-[10px] font-black uppercase tracking-widest text-black/60 hover:text-[#023468] hover:bg-zinc-50 transition-all border-b border-black/[0.03] last:border-0"
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
                target="_blank"
                className={cn(
                  "px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-full",
                  pathname === item.href 
                    ? "bg-white text-[#023468]" 
                    : "text-white/60 hover:text-white"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6">
            <Button asChild className="hidden md:flex bg-white text-[#023468] rounded-full px-8 py-5 font-bold uppercase tracking-widest text-[10px] hover:bg-white/90 transition-all active:scale-95 shadow-lg border-none cursor-pointer">
              <Link href="/inventory" target="_blank">
                Book Test Drive
              </Link>
            </Button>
            
            {/* Mobile Toggle */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-white h-8 w-8"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="md:hidden mt-4 bg-black/90 backdrop-blur-2xl rounded-[32px] border border-white/10 p-8 shadow-2xl"
          >

            <div className="flex flex-col space-y-6">
              <div className="space-y-4">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-4">Our Businesses</div>
                <div className="grid grid-cols-2 gap-3">
                  {businesses.map((business) => (
                    <Link
                      key={business.name}
                      href={business.href}
                      target="_blank"
                      onClick={() => setIsOpen(false)}
                      className="bg-white/5 rounded-xl p-4 text-[10px] font-black uppercase tracking-widest text-white/80"
                    >
                      {business.name}
                    </Link>
                  ))}
                </div>
              </div>
              
              <hr className="border-white/10" />

              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-bold text-white/80 hover:text-white uppercase tracking-widest"
                >
                  {item.name}
                </Link>
              ))}
              <hr className="border-white/10" />
              <Button 
                onClick={() => { onOpen(); setIsOpen(false); }}
                className="w-full bg-white text-[#023468] rounded-full py-6 font-bold uppercase tracking-widest text-xs border-none hover:bg-white/90 transition-colors"
              >
                Book Test Drive
              </Button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
