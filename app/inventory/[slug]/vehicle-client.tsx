"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, ArrowRight, Check, Shield, Zap, Phone, Mail, MapPin,
  Tag, Calendar, Gauge, Settings2, Fuel, Users, X,
  ChevronLeft, ChevronRight, Share2, Heart, BadgeCheck, FileText, Star
} from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Vehicle, vehicles } from "@/lib/vehicle-data"
import { VehicleCard } from "@/components/ui/vehicle-card"

export default function VehicleClient({ vehicle }: { vehicle: Vehicle }) {
  const router = useRouter()
  const [currentImage, setCurrentImage] = useState(0)
  const [showContactForm, setShowContactForm] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" })

  const images = vehicle.images || [vehicle.image]
  const nextImage = () => setCurrentImage((p) => (p + 1) % images.length)
  const prevImage = () => setCurrentImage((p) => (p - 1 + images.length) % images.length)

  const similarVehicles = vehicles
    .filter((v) => v.id !== vehicle.id && (v.brand === vehicle.brand || v.type === vehicle.type))
    .slice(0, 3)

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Thank you for your inquiry! We'll contact you soon.")
    setFormData({ name: "", email: "", phone: "", message: "" })
    setShowContactForm(false)
  }

  const specs = [
    { icon: <Fuel className="h-4 w-4" />, label: "Engine", value: vehicle.specs.engine ?? "—" },
    { icon: <Zap className="h-4 w-4" />, label: "Power", value: vehicle.specs.power ?? "—" },
    { icon: <Settings2 className="h-4 w-4" />, label: "Transmission", value: vehicle.specs.transmission ?? "—" },
    { icon: <Gauge className="h-4 w-4" />, label: "Drive", value: vehicle.specs.drive ?? "—" },
    { icon: <ArrowRight className="h-4 w-4" />, label: "Range", value: vehicle.specs.range ?? "—" },
    { icon: <Zap className="h-4 w-4" />, label: "0–100 km/h", value: vehicle.specs.acceleration ?? "—" },
    { icon: <Gauge className="h-4 w-4" />, label: "Top Speed", value: vehicle.specs.topSpeed ?? "—" },
    { icon: <Users className="h-4 w-4" />, label: "Seats", value: vehicle.specs.seats ?? "—" },
  ]

  return (
    <div className="min-h-screen bg-[#f8f9fb]">

      {/* ── Top Nav Bar ── */}
      <div className="bg-white border-b border-black/6 sticky top-16 z-30">
        <div className="container mx-auto px-4 md:px-10 h-14 flex items-center justify-between">
          <button
            onClick={() => router.push("/inventory")}
            className="flex items-center gap-2 text-black/50 hover:text-[#023468] transition-colors text-sm font-semibold cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Inventory
          </button>
          <div className="flex items-center gap-2">
            <button className="h-9 w-9 rounded-xl border border-black/10 bg-white hover:bg-zinc-50 flex items-center justify-center transition-colors cursor-pointer">
              <Share2 className="h-4 w-4 text-black/50" />
            </button>
            <button
              onClick={() => setSaved(!saved)}
              className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${saved ? "bg-[#E31837] border-[#E31837] text-white" : "border-black/10 bg-white hover:bg-zinc-50 text-black/50"}`}
            >
              <Heart className={`h-4 w-4 ${saved ? "fill-white" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="container mx-auto px-4 md:px-10 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ════ LEFT COLUMN ════ */}
          <div className="lg:col-span-7 space-y-6">

            {/* ── Gallery ── */}
            <div className="relative rounded-3xl overflow-hidden bg-zinc-900 shadow-xl aspect-[16/10] group">
              <Image
                src={images[currentImage]}
                alt={vehicle.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover transition-all duration-700"
              />

              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2 z-10">
                <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-[#023468]">
                  {vehicle.year}
                </span>
                <span className="bg-[#023468] text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {vehicle.type}
                </span>
              </div>

              {/* Arrows */}
              <button onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-white shadow-xl transition-all cursor-pointer opacity-0 group-hover:opacity-100 z-10">
                <ChevronLeft className="h-5 w-5 text-black" />
              </button>
              <button onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-white shadow-xl transition-all cursor-pointer opacity-0 group-hover:opacity-100 z-10">
                <ChevronRight className="h-5 w-5 text-black" />
              </button>

              {/* Bottom info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">{vehicle.brand}</p>
                    <h1 className="text-white text-3xl font-black leading-none">{vehicle.name}</h1>
                  </div>
                  {/* Dots */}
                  <div className="flex gap-1.5">
                    {images.map((_: string, i: number) => (
                      <button key={i} onClick={() => setCurrentImage(i)}
                        className={`rounded-full transition-all cursor-pointer ${i === currentImage ? "bg-white w-6 h-2" : "bg-white/40 w-2 h-2"}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Thumbnail Strip ── */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setCurrentImage(i)}
                    className={`relative flex-shrink-0 h-18 w-28 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${i === currentImage ? "border-[#023468] shadow-md" : "border-transparent opacity-60 hover:opacity-90"}`}
                    style={{ height: "72px", width: "112px" }}>
                    <Image src={img} alt="" fill className="object-cover" sizes="112px" />
                  </button>
                ))}
              </div>
            )}

            {/* ── Quick Spec Pills ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: <Fuel className="h-4 w-4" />, label: "Fuel", val: vehicle.specs.engine ?? "Electric" },
                { icon: <Settings2 className="h-4 w-4" />, label: "Gearbox", val: vehicle.specs.transmission ?? "Auto" },
                { icon: <Gauge className="h-4 w-4" />, label: "Drive", val: vehicle.specs.drive ?? "AWD" },
                { icon: <Calendar className="h-4 w-4" />, label: "Year", val: vehicle.year ?? "2025" },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-black/8 rounded-2xl px-4 py-3.5 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-[#023468]">
                    {s.icon}
                    <span className="text-[10px] font-black uppercase tracking-widest text-black/35">{s.label}</span>
                  </div>
                  <span className="text-sm font-black text-[#023468]">{s.val}</span>
                </div>
              ))}
            </div>

            {/* ── Overview ── */}
            <div className="bg-white rounded-3xl border border-black/8 p-6 md:p-8">
              <h2 className="text-xl font-black text-[#023468] mb-4 flex items-center gap-3">
                <div className="h-6 w-1 bg-[#E31837] rounded-full" />
                Overview
              </h2>
              <p className="text-black/60 leading-relaxed">{vehicle.description}</p>
            </div>

            {/* ── Key Features ── */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div className="bg-white rounded-3xl border border-black/8 p-6 md:p-8">
                <h2 className="text-xl font-black text-[#023468] mb-6 flex items-center gap-3">
                  <div className="h-6 w-1 bg-[#E31837] rounded-full" />
                  Key Features
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {vehicle.features.map((feature: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 border border-black/5">
                      <div className="h-7 w-7 rounded-lg bg-[#023468]/10 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3.5 w-3.5 text-[#023468]" />
                      </div>
                      <span className="text-sm font-semibold text-black/70">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Technical Specifications ── */}
            <div className="bg-white rounded-3xl border border-black/8 p-6 md:p-8">
              <h2 className="text-xl font-black text-[#023468] mb-6 flex items-center gap-3">
                <div className="h-6 w-1 bg-[#E31837] rounded-full" />
                Technical Specifications
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                {specs.filter(s => s.value && s.value !== "—").map((spec, i) => (
                  <div key={i} className="flex items-center justify-between py-3.5 border-b border-black/5 last:border-0 [&:nth-last-child(2)]:border-0 px-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-black/25">{spec.icon}</span>
                      <span className="text-[11px] font-black uppercase tracking-widest text-black/40">{spec.label}</span>
                    </div>
                    <span className="text-sm font-black text-[#023468]">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ════ RIGHT COLUMN ════ */}
          <div className="lg:col-span-5 space-y-4">

            {/* ── Price Card ── */}
            <div className="bg-white rounded-3xl border border-black/8 p-6 shadow-sm">
              {/* Year / Brand / Type */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-black text-black/35 uppercase tracking-widest">{vehicle.year} • {vehicle.brand}</span>
                <span className="px-2.5 py-0.5 bg-[#023468] text-white text-[9px] font-black uppercase tracking-widest rounded-full">{vehicle.type}</span>
              </div>

              {/* Name */}
              <h1 className="text-3xl font-black text-[#023468] leading-tight mb-4">
                {vehicle.brand} {vehicle.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl font-black text-black">{vehicle.price}</span>
                <span className="text-sm text-black/40 font-medium">Ex-showroom</span>
              </div>
              <p className="text-[10px] text-black/30 font-semibold uppercase tracking-widest mb-6">Starting price • On-road price may vary</p>

              {/* Rating Row */}
              <div className="flex items-center gap-2 mb-6 pb-5 border-b border-black/6">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => <Star key={s} className={`h-3.5 w-3.5 ${s <= 4 ? "text-amber-400 fill-amber-400" : "text-black/15"}`} />)}
                </div>
                <span className="text-[11px] font-bold text-black/40">4.0 / 5 — Verified by AM Group</span>
              </div>

              {/* Starting Price Detail */}
              <div className="bg-zinc-50 rounded-2xl p-4 mb-5 border border-black/6">
                <span className="text-[10px] font-black uppercase tracking-widest text-black/35 block mb-1">Starting Price</span>
                <span className="text-2xl font-black text-[#023468]">{vehicle.price}</span>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowContactForm(true)}
                  className="w-full flex items-center justify-between px-6 py-4 bg-[#023468] hover:bg-[#01254a] text-white rounded-2xl transition-all cursor-pointer shadow-lg shadow-[#023468]/20 group"
                >
                  <div className="flex items-center gap-3">
                    <Tag className="h-4 w-4" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Get Best Price</span>
                  </div>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => setShowContactForm(true)}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3.5 border-2 border-[#023468]/20 hover:border-[#023468] text-[#023468] rounded-2xl transition-all cursor-pointer text-[11px] font-black uppercase tracking-widest"
                >
                  <Calendar className="h-4 w-4" />
                  Schedule Test Drive
                </button>
              </div>
            </div>

            {/* ── Quick Contact ── */}
            <div className="bg-white rounded-3xl border border-black/8 p-5">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-black/35 mb-4">Quick Contact</h3>
              <div className="space-y-3">
                <a href="tel:+919419100000"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-50 border border-black/6 hover:border-[#023468]/30 hover:bg-[#023468]/3 transition-all group">
                  <div className="h-8 w-8 rounded-lg bg-[#023468]/8 flex items-center justify-center">
                    <Phone className="h-3.5 w-3.5 text-[#023468]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Call Us</p>
                    <p className="text-sm font-black text-[#023468]">+91 94191 00000</p>
                  </div>
                </a>
                <a href="mailto:info@amgroupind.com"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-50 border border-black/6 hover:border-[#023468]/30 hover:bg-[#023468]/3 transition-all group">
                  <div className="h-8 w-8 rounded-lg bg-[#023468]/8 flex items-center justify-center">
                    <Mail className="h-3.5 w-3.5 text-[#023468]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Email</p>
                    <p className="text-sm font-black text-[#023468]">info@amgroupind.com</p>
                  </div>
                </a>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-50 border border-black/6">
                  <div className="h-8 w-8 rounded-lg bg-[#023468]/8 flex items-center justify-center">
                    <MapPin className="h-3.5 w-3.5 text-[#023468]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Showroom</p>
                    <p className="text-sm font-black text-[#023468]">Jammu, J&amp;K</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Why Trust Us ── */}
            <div className="bg-white rounded-3xl border border-black/8 p-5">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-black/35 mb-4">Why Trust Us</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { icon: <BadgeCheck className="h-5 w-5" />, label: "100% Authentic" },
                  { icon: <FileText className="h-5 w-5" />, label: "Quick Paperwork" },
                  { icon: <Tag className="h-5 w-5" />, label: "Best Price" },
                ].map((t) => (
                  <div key={t.label} className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-zinc-50 border border-black/5">
                    <div className="h-10 w-10 rounded-xl bg-[#023468]/8 flex items-center justify-center text-[#023468]">
                      {t.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-black/50 leading-tight">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── EMI Banner ── */}
            <div className="rounded-3xl bg-gradient-to-br from-[#023468] to-[#034a90] p-5 flex items-center gap-4 shadow-lg shadow-[#023468]/20">
              <div className="h-12 w-12 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <Tag className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-white font-black text-sm">Easy EMI Options Available</p>
                <p className="text-white/60 text-[11px] mt-0.5">Starting from ₹ 29,999/month* — Zero down payment on select models</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Similar Vehicles ── */}
      {similarVehicles.length > 0 && (
        <div className="container mx-auto px-4 md:px-10 pb-16 mt-4">
          <div className="border-t border-black/6 pt-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-7 w-1 bg-[#E31837] rounded-full" />
              <h2 className="text-2xl font-black text-[#023468]">Similar Vehicles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarVehicles.map((v, i) => (
                <VehicleCard key={v.id} vehicle={v} index={i} viewType="grid" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Contact / Test Drive Modal ── */}
      <AnimatePresence>
        {showContactForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black text-[#023468]">Schedule a Test Drive</h3>
                  <p className="text-sm text-black/40 mt-1">{vehicle.brand} {vehicle.name}</p>
                </div>
                <button onClick={() => setShowContactForm(false)}
                  className="h-9 w-9 rounded-xl bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors cursor-pointer">
                  <X className="h-4 w-4 text-black/60" />
                </button>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                {[
                  { label: "Full Name", key: "name", type: "text" },
                  { label: "Email Address", key: "email", type: "email" },
                  { label: "Phone Number", key: "phone", type: "tel" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-black/40 mb-2">{field.label}</label>
                    <input
                      type={field.type}
                      required
                      value={formData[field.key as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#023468]/20 focus:border-[#023468]/30 text-sm font-medium transition-all"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-black/40 mb-2">Message (Optional)</label>
                  <textarea rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#023468]/20 focus:border-[#023468]/30 text-sm font-medium resize-none transition-all"
                  />
                </div>
                <button type="submit"
                  className="w-full py-4 bg-[#023468] hover:bg-[#01254a] text-white font-black uppercase tracking-widest text-[11px] rounded-2xl transition-all shadow-lg shadow-[#023468]/20 cursor-pointer flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Submit Request
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
