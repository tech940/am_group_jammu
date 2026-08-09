"use client"
import Link from "next/link"
import {
  Phone,
  Mail,
  Globe,
  Camera,
  Send,
  ChevronUp,
} from "lucide-react"
import { motion } from "framer-motion"

const footerNav = [
  { name: "HOME", href: "/" },
  { name: "ABOUT US", href: "/about" },
  { name: "OUR BUSINESSES", href: "/automobile" },
  { name: "INVENTORY", href: "/inventory" },
  { name: "NEWS & UPDATES", href: "/blog" },
  { name: "CONTACT US", href: "/contact" },
]

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="relative bg-[#0B0B0B] text-white pt-16 pb-8 overflow-hidden font-sans">
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#023468,transparent)] blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        {/* Top Navigation Row */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-12">
          {footerNav.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className="text-[10px] font-black tracking-[0.2em] text-white/60 hover:text-[#E31837] transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start pb-12 border-b border-white/10">
          
          {/* Left Column: J&K Offices */}
          <div className="space-y-6 text-center lg:text-left">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E31837] mb-2">Jammu Flagship Office</h4>
              <div className="text-white/70 text-xs leading-relaxed font-normal">
                <p className="text-white font-bold mb-0.5">AM BUSINESS PARK</p>
                <p>N-H 1 Bye-Pass Road, Opp. Railway Station, Jammu</p>
                <p>Jammu and Kashmir - 180012</p>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E31837] mb-2">Srinagar Regional Office</h4>
              <div className="text-white/70 text-xs leading-relaxed font-normal">
                <p className="text-white font-bold mb-0.5">AM TOWER</p>
                <p>Hyderpora Bye-Pass, Srinagar</p>
                <p>Jammu and Kashmir - 190014</p>
              </div>
            </div>
          </div>

          {/* Center Column: Brand Logo & Social */}
          <div className="flex flex-col items-center justify-center text-center">
            <Link href="/" className="mb-6 group inline-block">
              <img 
                src="https://amgroupind.com/wp-content/uploads/2023/06/logo-1.png" 
                alt="AM Group" 
                className="h-16 w-auto object-contain brightness-0 invert group-hover:scale-105 transition-transform duration-300 mx-auto" 
              />
              <div className="mt-3 text-lg font-black tracking-[0.25em] text-white">AM GROUP JAMMU</div>
            </Link>
            
            <div className="flex gap-4">
              {[
                { icon: Globe, href: "#" },
                { icon: Camera, href: "#" },
                { icon: Send, href: "#" }
              ].map((social, idx) => (
                <Link 
                  key={idx} 
                  href={social.href}
                  className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-[#E31837] hover:border-[#E31837] transition-all duration-300"
                >
                  <social.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column: Contact Info (Centered on mobile, right-aligned on desktop) */}
          <div className="flex flex-col items-center lg:items-end text-center lg:text-right space-y-6">
            <a href="tel:+919419100000" className="group cursor-pointer block">
              <div className="flex items-center justify-center lg:justify-end gap-2 mb-1">
                <Phone className="h-4 w-4 text-[#E31837]" />
                <span className="text-[10px] font-black text-white/40 tracking-widest uppercase">Group Sales &amp; Toll-Free</span>
              </div>
              <p className="text-xl font-black text-white group-hover:text-[#E31837] transition-colors">1800-AM-GROUP / +91 94191 00000</p>
            </a>

            <a href="mailto:info@amgroupind.com" className="group cursor-pointer block">
              <div className="flex items-center justify-center lg:justify-end gap-2 mb-1">
                <Mail className="h-4 w-4 text-[#E31837]" />
                <span className="text-[10px] font-black text-white/40 tracking-widest uppercase">Official Contact Email</span>
              </div>
              <p className="text-sm font-bold text-white/80 group-hover:text-[#E31837] transition-colors">info@amgroupind.com</p>
            </a>
          </div>

        </div>

        {/* Bottom Bar Credits */}
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/40">
            © {new Date().getFullYear()} ALL RIGHTS RESERVED BY AM GROUP JAMMU.
          </p>
          
          <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/40">
            WEBSITE DESIGNED &amp; DEVELOPED BY <span className="text-[#E31837] hover:underline cursor-pointer">NET SOFT LAB.</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-[60]">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={scrollToTop}
          className="h-11 w-11 bg-black/60 backdrop-blur-xl border border-white/15 text-white rounded-xl flex items-center justify-center hover:bg-[#E31837] hover:border-[#E31837] transition-all shadow-2xl cursor-pointer"
        >
          <ChevronUp className="h-5 w-5" />
        </motion.button>
      </div>
    </footer>
  )
}

