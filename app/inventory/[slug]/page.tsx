"use client"

import React, { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, Shield, Zap, Phone, Mail, MapPin, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { getVehicleById, vehicles } from "@/lib/vehicle-data"
import { VehicleCard } from "@/components/ui/vehicle-card"

export default function VehicleProductPage() {
  const params = useParams()
  const router = useRouter()
  const [currentImage, setCurrentImage] = useState(0)
  const [showContactForm, setShowContactForm] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  })

  const slug = params.slug as string
  const vehicle = getVehicleById(slug)

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Vehicle Not Found</h1>
          <Button onClick={() => router.push("/inventory")}>Back to Inventory</Button>
        </div>
      </div>
    )
  }

  const images = vehicle.images || [vehicle.image]

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length)
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length)

  // Find similar vehicles (same brand or type, excluding current vehicle)
  const similarVehicles = vehicles.filter(v => 
    v.id !== vehicle.id && (v.brand === vehicle.brand || v.type === vehicle.type)
  ).slice(0, 3)

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Contact form submitted:", formData)
    alert("Thank you for your inquiry! We'll contact you soon.")
    setFormData({ name: "", email: "", phone: "", message: "" })
    setShowContactForm(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="container mx-auto px-6 md:px-12 pt-4">

        <button
          onClick={() => router.push("/inventory")}
          className="flex items-center gap-2 text-black/60 hover:text-black transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back to Inventory</span>
        </button>
      </div>

      {/* Product Details - Split Layout */}
      <div className="container mx-auto px-6 md:px-12 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Main Content - 60% width */}
          <div className="lg:col-span-3 space-y-12">
            <div className="relative h-[600px] bg-zinc-100 rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src={images[currentImage]}
                alt={vehicle.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />

              
              {/* Carousel Controls */}
              <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between opacity-0 hover:opacity-100 transition-opacity duration-500 z-20">
                <button
                  onClick={prevImage}
                  className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-white shadow-xl transition-all"
                >
                  <ArrowLeft className="h-5 w-5 text-black" />
                </button>
                <button
                  onClick={nextImage}
                  className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-white shadow-xl transition-all"
                >
                  <ArrowRight className="h-5 w-5 text-black" />
                </button>
              </div>

              {/* Image Thumbnails */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {images.map((_: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`h-2 w-12 rounded-full transition-all ${index === currentImage ? "bg-white" : "bg-white/50"}`}
                  />
                ))}
              </div>
            </div>

            {/* Vehicle Details Content */}
            <div className="space-y-12 pt-4">
              {/* Description */}
              <div>
                <h2 className="text-2xl font-black text-[#023468] mb-6 flex items-center gap-3">
                  <div className="h-8 w-1 bg-[#E31837] rounded-full" />
                  Overview
                </h2>
                <p className="text-black/70 text-lg leading-relaxed font-light">
                  {vehicle.description}
                </p>
              </div>

              {/* Key Features */}
              <div>
                <h2 className="text-2xl font-black text-[#023468] mb-8 flex items-center gap-3">
                  <div className="h-8 w-1 bg-[#E31837] rounded-full" />
                  Key Features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {vehicle.features?.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-4 group">
                      <div className="h-10 w-10 rounded-2xl bg-[#E31837]/5 flex items-center justify-center group-hover:bg-[#E31837] transition-all duration-500">
                        <Check className="h-4 w-4 text-[#E31837] group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-black/70 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specifications */}
              <div className="bg-zinc-50 rounded-[40px] p-8 md:p-12 border border-black/5">
                <h2 className="text-2xl font-black text-[#023468] mb-10">Technical Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-2">
                  <div className="space-y-2">
                    {[
                      { label: "Engine", value: vehicle.specs.engine },
                      { label: "Power", value: vehicle.specs.power },
                      { label: "Transmission", value: vehicle.specs.transmission },
                      { label: "Drive Type", value: vehicle.specs.drive },
                    ].map((spec) => (
                      <div key={spec.label} className="flex justify-between py-4 border-b border-black/5 last:border-0">
                        <span className="text-black/40 text-xs font-bold uppercase tracking-widest">{spec.label}</span>
                        <span className="font-black text-[#023468]">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Range", value: vehicle.specs.range },
                      { label: "Acceleration", value: vehicle.specs.acceleration },
                      { label: "Top Speed", value: vehicle.specs.topSpeed },
                      { label: "Seats", value: vehicle.specs.seats },
                    ].map((spec) => (
                      <div key={spec.label} className="flex justify-between py-4 border-b border-black/5 last:border-0">
                        <span className="text-black/40 text-xs font-bold uppercase tracking-widest">{spec.label}</span>
                        <span className="font-black text-[#023468]">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Price and Details - 40% width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Price */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm font-black uppercase tracking-widest text-black/40">
                  {vehicle.year} • {vehicle.brand}
                </span>
                <span className="px-3 py-1 bg-[#023468] text-white text-xs font-black uppercase tracking-widest rounded-full">
                  {vehicle.type}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#023468] mb-4">
                {vehicle.brand} {vehicle.name}
              </h1>
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold text-black">{vehicle.price}</span>
                <span className="text-sm text-black/60">Ex-showroom</span>
              </div>
            </div>

            {/* Price Card */}
            <div className="bg-zinc-50 rounded-3xl p-8 border border-black/5">
              <div className="text-center mb-6">
                <span className="text-sm text-black/60 uppercase tracking-widest">Starting Price</span>
                <div className="text-3xl font-bold text-[#023468] mt-2">{vehicle.price}</div>
              </div>
              
              <div className="space-y-3">
                <Button className="w-full h-14 bg-[#023468] hover:bg-[#01254a] text-white font-black uppercase tracking-widest text-sm">
                  Get Best Price
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowContactForm(true)}
                  className="w-full h-14 border-black/20 hover:bg-black hover:text-white font-black uppercase tracking-widest text-sm"
                >
                  Schedule Test Drive
                </Button>
              </div>
            </div>

            {/* Quick Contact */}
            <div className="bg-white rounded-3xl p-6 border border-black/5">
              <h3 className="text-lg font-bold text-black mb-4">Quick Contact</h3>
              <div className="space-y-3">
                <a href="tel:+919484200000" className="flex items-center gap-3 text-black/70 hover:text-[#023468] transition-colors">
                  <Phone className="h-5 w-5" />
                  <span>+91 94842 00000</span>
                </a>
                <a href="mailto:info@amgroupjammu.com" className="flex items-center gap-3 text-black/70 hover:text-[#023468] transition-colors">
                  <Mail className="h-5 w-5" />
                  <span>info@amgroupjammu.com</span>
                </a>
                <div className="flex items-center gap-3 text-black/70">
                  <MapPin className="h-5 w-5" />
                  <span>Jammu, Jammu & Kashmir</span>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-white rounded-3xl p-6 border border-black/5">
              <h3 className="text-lg font-bold text-black mb-4">Why Trust Us</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-[#023468]" />
                  <span className="text-black/70">100% Authentic Vehicles</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-[#023468]" />
                  <span className="text-black/70">Quick Paperwork</span>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-[#023468]" />
                  <span className="text-black/70">Best Price Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Similar Vehicles Section */}
      {similarVehicles.length > 0 && (
        <div className="container mx-auto px-6 md:px-12 pb-16">
          <div className="border-t border-black/5 pt-12">
            <h2 className="text-3xl font-bold text-black mb-8">Similar Vehicles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {similarVehicles.map((similarVehicle, index) => (
                <VehicleCard 
                  key={similarVehicle.id} 
                  vehicle={similarVehicle} 
                  index={index} 
                  viewType="grid" 
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contact Form Modal */}
      <AnimatePresence>
        {showContactForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-black">Schedule Test Drive</h3>
                <button
                  onClick={() => setShowContactForm(false)}
                  className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#023468]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#023468]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#023468]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Message</label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#023468]/20"
                  />
                </div>
                <Button type="submit" className="w-full h-14 bg-[#023468] hover:bg-[#01254a] text-white font-black uppercase tracking-widest text-sm">
                  Submit Request
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
