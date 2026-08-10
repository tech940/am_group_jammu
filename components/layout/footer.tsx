"use client"

import Link from "next/link"
import {
  Phone,
  Mail,
  Globe,
  Camera,
  Send,
  ChevronUp,
  MapPin,
  HelpCircle
} from "lucide-react"
import { motion } from "framer-motion"
import { SeoLinkDirectory } from "@/components/seo/frequent-searches"
import type { SeoLinks } from "@/lib/seo/links"

const footerNav = [
  { name: "HOME", href: "/" },
  { name: "LOCATIONS", href: "/locations" },
  { name: "ABOUT US", href: "/about" },
  { name: "OUR BUSINESSES", href: "/automobile" },
  { name: "INVENTORY", href: "/inventory" },
  { name: "NEWS & UPDATES", href: "/blog" },
  { name: "CONTACT US", href: "/contact" },
]

export function Footer({ seoLinks }: { seoLinks: SeoLinks }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="relative font-sans" style={{ borderTop: "4px solid #023468" }}>

      {/* ── BROWSE USED CARS SECTION ── Light blue-gray panel */}
      {seoLinks.groups.length > 0 && (
        <section className="bg-[#EBF0F8] py-12 px-4 md:px-8">
          <div className="container mx-auto">
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-black text-[#023468] tracking-tight">Browse Used Cars</h2>
              <p className="text-xs text-[#023468]/60 font-medium mt-1">Explore inventory by brand, model, city, budget, and features</p>
            </div>

            <SeoLinkDirectory groups={seoLinks.groups} />

            {/* Help strip */}
            <div className="mt-8 p-4 rounded-2xl bg-white border border-[#023468]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#023468]/10 flex items-center justify-center text-[#023468] flex-shrink-0">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <p className="text-xs text-black/70 font-medium">
                  Cannot find what you are looking for? Call{" "}
                  <a href="tel:+919419100000" className="font-bold text-[#023468] hover:underline">+91 94191 00000</a>{" "}
                  or send us an enquiry and we will notify you of matching stock.
                </p>
              </div>
              <Link
                href="/contact"
                className="px-5 py-2.5 bg-[#023468] hover:bg-[#E31837] text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all whitespace-nowrap shadow-sm"
              >
                Send Enquiry
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── MAIN FOOTER BODY ── Deep Navy panel */}
      <div className="bg-[#012050] text-white pt-14 pb-8 px-4 md:px-8">
        <div className="container mx-auto">

          {/* Top Navigation Row */}
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-12 pb-8 border-b border-white/10">
            {footerNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-[11px] font-black tracking-[0.2em] text-white/50 hover:text-white transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start pb-12 border-b border-white/10">

            {/* Left: Offices */}
            <div className="space-y-5 text-center lg:text-left">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center lg:text-left">
                <div className="flex items-center gap-2 mb-2 justify-center lg:justify-start">
                  <MapPin className="h-3.5 w-3.5 text-[#E31837]" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E31837]">Jammu Flagship Office</h4>
                </div>
                <p className="text-sm font-bold text-white mt-1">AM BUSINESS PARK</p>
                <p className="text-xs text-white/75 mt-0.5 font-medium">N-H 1 Bye-Pass Road, Opp. Railway Station, Jammu</p>
                <p className="text-xs text-white/75 font-medium mt-0.5">Jammu &amp; Kashmir — 180012</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center lg:text-left">
                <div className="flex items-center gap-2 mb-2 justify-center lg:justify-start">
                  <MapPin className="h-3.5 w-3.5 text-[#E31837]" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E31837]">Srinagar Regional Office</h4>
                </div>
                <p className="text-sm font-bold text-white mt-1">AM TOWER</p>
                <p className="text-xs text-white/75 mt-0.5 font-medium">Hyderpora Bye-Pass, Srinagar</p>
                <p className="text-xs text-white/75 font-medium mt-0.5">Jammu &amp; Kashmir — 190014</p>
              </div>
            </div>

            {/* Center: Logo & Social */}
            <div className="flex flex-col items-center justify-center text-center">
              <Link href="/" className="mb-5 group inline-block">
                <img
                  src="https://amgroupind.com/wp-content/uploads/2023/06/logo-1.png"
                  alt="AM Group"
                  className="h-16 w-auto object-contain brightness-0 invert group-hover:scale-105 transition-transform duration-300 mx-auto"
                />
                <div className="mt-3 text-lg font-black tracking-[0.25em] text-white">AM GROUP JAMMU</div>
                <p className="text-[10px] font-bold text-white/75 tracking-widest uppercase mt-1">J&amp;K&apos;s Largest Automotive Group Since 1968</p>
              </Link>

              <div className="flex gap-3">
                {[
                  { icon: Globe, href: "#", label: "Website" },
                  { icon: Camera, href: "#", label: "Instagram" },
                  { icon: Send, href: "#", label: "Telegram" },
                ].map((social, idx) => (
                  <Link
                    key={idx}
                    href={social.href}
                    aria-label={social.label}
                    className="h-10 w-10 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-[#E31837] hover:border-[#E31837] transition-all duration-300"
                  >
                    <social.icon className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: Contact */}
            <div className="flex flex-col items-center lg:items-end text-center lg:text-right space-y-4">
              <a href="tel:+919419100000" className="group cursor-pointer block p-4 rounded-2xl bg-white/5 border border-white/10 w-full max-w-sm hover:border-[#E31837]/40 transition-all">
                <div className="flex items-center justify-center lg:justify-end gap-2 mb-1">
                  <Phone className="h-4 w-4 text-[#E31837]" />
                  <span className="text-[10px] font-black text-white/75 tracking-widest uppercase">Group Sales &amp; Toll-Free</span>
                </div>
                <p className="text-base md:text-lg font-black text-white group-hover:text-[#E31837] transition-colors leading-snug">1800-AM-GROUP<br />+91 94191 00000</p>
              </a>

              <a href="mailto:info@amgroupind.com" className="group cursor-pointer block p-4 rounded-2xl bg-white/5 border border-white/10 w-full max-w-sm hover:border-[#E31837]/40 transition-all">
                <div className="flex items-center justify-center lg:justify-end gap-2 mb-1">
                  <Mail className="h-4 w-4 text-[#E31837]" />
                  <span className="text-[10px] font-black text-white/75 tracking-widest uppercase">Official Contact Email</span>
                </div>
                <p className="text-sm font-bold text-white group-hover:text-[#E31837] transition-colors">info@amgroupind.com</p>
              </a>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/75">
              © {new Date().getFullYear()} ALL RIGHTS RESERVED BY AM GROUP JAMMU.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/75">
              {/* Ad platforms check for a reachable privacy policy, and both
                  documents were live on the previous site — they should not
                  become harder to find after the migration. */}
              <Link href="/privacy-policy" className="hover:text-[#E31837] transition-colors">
                PRIVACY POLICY
              </Link>
              <span aria-hidden="true" className="text-white/25">|</span>
              <Link href="/terms" className="hover:text-[#E31837] transition-colors">
                TERMS
              </Link>
              <span aria-hidden="true" className="text-white/25">|</span>
              <span>
                WEBSITE DESIGNED &amp; DEVELOPED BY <span className="text-[#E31837]">NET SOFT LAB.</span>
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Scroll to top */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="h-11 w-11 bg-[#023468] text-white rounded-xl flex items-center justify-center hover:bg-[#E31837] transition-all shadow-xl cursor-pointer"
        >
          <ChevronUp className="h-5 w-5" />
        </motion.button>
      </div>
    </footer>
  )
}
