"use client"
import Link from "next/link"
import {
  Phone,
  Mail,
  Globe,
  Camera,
  Send,
  ChevronUp,
  MessageCircle,
} from "lucide-react"
import { motion } from "framer-motion"

const footerNav = [
  { name: "HOME", href: "/" },
  { name: "ABOUT US", href: "/about" },
  { name: "AWARDS", href: "/awards" },
  { name: "OUR BUSINESSES", href: "/businesses" },
  { name: "NEWS & UPDATES", href: "/blog" },
  { name: "CONTACT US", href: "/contact" },
]

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="relative bg-[#0B0B0B] text-white pt-20 pb-10 overflow-hidden font-sans">
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#023468,transparent)] blur-3xl" />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Top Navigation Row */}
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-20">
          {footerNav.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              target="_blank"
              className="text-[11px] font-black tracking-[0.2em] text-white/60 hover:text-[#E31837] transition-all duration-300"
            >


              {item.name}
            </Link>
          ))}
        </nav>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start pb-20 border-b border-white/5">
          {/* Left Column: Address Details */}
          <div className="space-y-12">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E31837] mb-4">Jammu Office</h4>
              <div className="text-white/60 text-sm leading-loose font-medium">
                <p className="text-white font-bold mb-1">AM BUSINESS PARK</p>
                <p>N-H 1 Bye Pass Road, Jammu</p>
                <p>Jammu and Kashmir 180012</p>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E31837] mb-4">Corporate Office</h4>
              <div className="text-white/60 text-sm leading-loose font-medium">
                <p className="text-white font-bold mb-1">US:</p>
                <p>2105 Murray Hill,</p>
                <p>Cleveland OH, 44102</p>
              </div>
            </div>
          </div>

          {/* Center Column: Logo & Social */}
          <div className="flex flex-col items-center justify-center text-center">
            <Link href="/" target="_blank" className="mb-10 group">
              <img 
                src="https://amgroupind.com/wp-content/uploads/2023/06/logo-1.png" 
                alt="AM Group" 
                className="h-20 w-auto object-contain brightness-0 invert group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="mt-4 text-xl font-black tracking-[0.3em] text-white">AM GROUP</div>
            </Link>
            
            <div className="flex gap-8">
              {[
                { icon: Globe, href: "#" },
                { icon: Camera, href: "#" },
                { icon: Send, href: "#" }
              ].map((social, idx) => (
                <Link 
                  key={idx} 
                  href={social.href}
                  className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-[#E31837] hover:border-[#E31837] transition-all duration-300"
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column: Contact Info */}
          <div className="flex flex-col items-end space-y-8">
            <a href="tel:+919484200000" className="text-right group cursor-pointer block">
              <div className="flex items-center justify-end gap-4 mb-2">
                <span className="text-[10px] font-black text-white/40 tracking-widest uppercase">Call Us</span>
                <Phone className="h-5 w-5 text-[#E31837]" />
              </div>
              <p className="text-xl font-black text-white group-hover:text-[#E31837] transition-colors">+91 9484200000</p>
            </a>

            
            <a href="mailto:info@amgroupind.com" className="text-right group cursor-pointer block">
              <div className="flex items-center justify-end gap-4 mb-2">
                <span className="text-[10px] font-black text-white/40 tracking-widest uppercase">Email Us</span>
                <Mail className="h-5 w-5 text-[#E31837]" />
              </div>
              <p className="text-lg font-bold text-white/80 group-hover:text-[#E31837] transition-colors">info@amgroupind.com</p>
            </a>

          </div>
        </div>

        {/* Bottom Bar Credits */}
        <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
            © {new Date().getFullYear()} All Rights Reserved By AM Group.
          </p>
          
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
            Website Designed & Developed by <span className="text-[#E31837] hover:underline cursor-pointer">Net Soft Lab.</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 right-8 z-[60]">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="h-12 w-12 bg-black/40 backdrop-blur-xl border border-white/10 text-white rounded-xl flex items-center justify-center hover:bg-[#E31837] hover:border-[#E31837] transition-all shadow-2xl"
        >
          <ChevronUp className="h-6 w-6" />
        </motion.button>
      </div>
    </footer>
  )
}
