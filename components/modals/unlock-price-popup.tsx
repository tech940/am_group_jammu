"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Send, ChevronDown, CarFront } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import { useState, useEffect } from "react"
import { createLead, NewLead } from "@/lib/actions/leads"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle2, Sparkles, PartyPopper } from "lucide-react"

import { usePathname } from "next/navigation"
import { useInventoryStore } from "@/store/use-inventory-store"

export function UnlockPricePopup() {
  const { isOpen, vehicle, onClose } = useEnquiryModal()
  const { setHasInquired, setShowConfetti } = useInventoryStore()
  const { toast } = useToast()
  const pathname = usePathname()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [discountedPrice, setDiscountedPrice] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: ""
  })


  // Calculate a "special" discount when success triggers
  useEffect(() => {
    if (isSuccess && vehicle) {
      const basePrice = parseFloat(vehicle.price.replace(/[^\d.]/g, ''))
      if (!isNaN(basePrice)) {
        const discount = Math.floor(Math.random() * (8 - 5 + 1) + 5) // 5-8% discount
        const newPrice = (basePrice * (1 - discount / 100)).toFixed(2)
        
        // Defer state update to avoid cascading renders
        const timer = setTimeout(() => {
          setDiscountedPrice(`₹ ${newPrice} Lakh*`)
        }, 0)
        
        return () => clearTimeout(timer)
      }
    }
  }, [isSuccess, vehicle])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName || !formData.phone) {
      toast({
        title: "Required Fields",
        description: "Please provide your name and phone number.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(vehicle?.id || "")
      
      const leadData: NewLead = {
        customer_name: `${formData.firstName} ${formData.lastName}`.trim(),
        customer_phone: formData.phone,
        customer_email: formData.email,
        message: `📍 SOURCE: ${pathname}\n🚗 VEHICLE: ${vehicle?.name || "N/A"}\n\n💬 MESSAGE: ${formData.message || "No comments"}\n\n✨ DISCOUNT INTEREST: Unlocked 5-8% Special Price`,

        status: "New",
        inquiry_type: vehicle ? "Price Unlock" : "Test Drive",
        vehicle_id: isUUID ? (vehicle?.id as string) : null,
      }

      await createLead(leadData)


      // IMMEDIATE ACTIONS
      setHasInquired(true)
      setShowConfetti(true)
      onClose() // Close immediately as requested
      
      toast({
        title: "VIP Status Unlocked! 🎉",
        description: "Explore exclusive pricing on all vehicles now.",
      })
    } catch (error) {
      console.error("Submission Error:", error)
      toast({
        title: "Error",
        description: "Failed to send enquiry. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {

    onClose()
    // Reset state after a delay to allow exit animation
    setTimeout(() => {
      setIsSuccess(false)
      setDiscountedPrice(null)
      setFormData({ firstName: "", lastName: "", phone: "", email: "", message: "" })
    }, 500)

  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] cursor-pointer"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] overflow-y-auto flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-[900px] rounded-[40px] shadow-[0_50px_150px_rgba(0,0,0,0.3)] overflow-hidden pointer-events-auto flex flex-col lg:flex-row relative z-10"
            >



              {/* Close Button */}
               <button 
                 onClick={handleClose}
                 className="absolute top-4 right-4 h-9 w-9 rounded-full bg-zinc-100/50 backdrop-blur-md flex items-center justify-center hover:bg-zinc-200 transition-colors z-30"
               >
                <X className="h-4 w-4 text-black" />
              </button>


              {/* Left Panel: Vehicle Details */}
              <div className="lg:w-[320px] bg-[#023468] p-6 flex flex-col relative overflow-hidden shrink-0">

                {/* Brand Logo Header */}
                <div className="p-4 rounded-2xl mb-8 flex items-center justify-center relative z-10 bg-black/20 backdrop-blur-md border border-white/10">
                   <img 
                     src="https://amgroupind.com/wp-content/uploads/2023/06/logo-1.png" 
                     alt="AM Group" 
                     className="h-8 w-auto object-contain brightness-0 invert" 
                   />
                </div>

                <div className="relative z-10 flex-1 flex flex-col overflow-y-auto no-scrollbar">
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                    {vehicle ? "Unlock Instant Price For" : "Experience Excellence"}
                  </p>
                  <h3 className="text-white text-2xl font-black mb-6 leading-tight">
                    {vehicle ? `${vehicle.year || "2025"} ${vehicle.name}` : "Book a Test Drive"}
                  </h3>

                  {/* Visual Card */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-3xl mb-6">
                    <div className="relative h-48 rounded-2xl overflow-hidden mb-5 bg-white/5 flex items-center justify-center">
                      {vehicle ? (
                        <Image 
                          src={vehicle.image} 
                          alt={vehicle.name} 
                          fill 
                          className="object-cover"
                        />
                      ) : (
                        <CarFront className="h-20 w-20 text-white/20" />
                      )}
                    </div>
                    {vehicle && (
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="block text-[8px] uppercase tracking-widest text-white/40 font-black mb-1">Model</span>
                          <span className="text-white text-xs font-bold">{vehicle.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[8px] uppercase tracking-widest text-white/40 font-black mb-1">Price</span>
                          <span className="text-white text-xs font-bold">{vehicle.price}</span>
                        </div>
                      </div>
                    )}
                    {!vehicle && (
                       <div className="text-center py-2">
                          <p className="text-white/60 text-[10px] font-medium leading-relaxed uppercase tracking-widest">
                            Join the Elite <br /> AM Group Family
                          </p>
                       </div>
                    )}
                  </div>

                  <div className="mt-auto pt-6 border-t border-white/10">
                    <span className="text-[9px] uppercase tracking-widest text-white/30 font-black">Powered By</span>
                    <p className="text-white text-sm font-black italic tracking-tighter">AM Group Excellence</p>
                  </div>
                </div>

                {/* Aesthetic Background Shapes */}
                <div className="absolute -bottom-20 -right-20 h-64 w-64 bg-[#E31837] rounded-full blur-[100px] opacity-20" />
              </div>

              <div className="flex-1 p-6 lg:p-8 bg-white overflow-y-auto custom-scrollbar">

                <AnimatePresence mode="wait">
                  {!isSuccess ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="mb-4 lg:mb-6">
                        <h2 className="text-2xl lg:text-3xl font-black text-[#023468] mb-1">Contact Information</h2>
                        <p className="text-black/40 text-[10px] font-bold">All fields marked with <span className="text-[#E31837]">*</span> are required.</p>
                      </div>


                      <form className="space-y-4 lg:space-y-5" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-black/40">First Name *</label>
                            <input 
                              type="text" 
                              required
                              value={formData.firstName}
                              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                              placeholder="e.g. Rahul"
                              className="w-full h-11 lg:h-12 px-6 bg-zinc-50 border border-black/5 rounded-xl focus:outline-none focus:border-[#023468] transition-all text-sm font-medium"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-black/40">Last Name</label>
                            <input 
                              type="text" 
                              value={formData.lastName}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                              placeholder="e.g. Sharma"
                              className="w-full h-11 lg:h-12 px-6 bg-zinc-50 border border-black/5 rounded-xl focus:outline-none focus:border-[#023468] transition-all text-sm font-medium"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-black/40">Email Address *</label>
                            <input 
                              type="email" 
                              required
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="e.g. rahul@example.com"
                              className="w-full h-11 px-6 bg-zinc-50 border border-black/5 rounded-xl focus:outline-none focus:border-[#023468] transition-all text-sm font-medium"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-black/40">Phone *</label>
                            <input 
                              type="tel" 
                              required
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="+91 XXXXX XXXXX"
                              className="w-full h-11 px-6 bg-zinc-50 border border-black/5 rounded-xl focus:outline-none focus:border-[#023468] transition-all text-sm font-medium"
                            />
                          </div>
                        </div>


                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-black/40">Message / Comments</label>
                          <textarea 
                            rows={2}
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder={vehicle ? `I am interested in the ${vehicle.name}...` : "Tell us about your test drive preference..."}
                            className="w-full bg-zinc-50 border border-black/5 rounded-xl p-4 focus:outline-none focus:border-[#023468] transition-all text-sm font-medium resize-none"
                          />
                        </div>

                        <div className="pt-4 lg:pt-6 border-t border-black/5">
                          <Button 
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-11 lg:h-12 bg-[#023468] hover:bg-[#E31837] text-white rounded-xl flex items-center justify-center gap-4 text-xs lg:text-sm font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-2xl shadow-[#023468]/20"

                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                {vehicle ? "Unlock Instant Price" : "Book Test Drive Now"}
                                <Send className="h-5 w-5" />
                              </>
                            )}
                          </Button>
                          <p className="text-[9px] text-black/30 text-center mt-5 lg:mt-6 leading-relaxed px-4 lg:px-6">
                            By submitting, you agree that AM Group and its affiliates may call/text you about your inquiry. See our <span className="underline cursor-pointer hover:text-black transition-colors">terms of use</span>.
                          </p>
                        </div>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="h-full flex flex-col items-center justify-center text-center py-10"
                    >
                      <div className="relative mb-8">
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", delay: 0.2 }}
                          className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </motion.div>
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute -top-2 -right-2 bg-[#E31837] text-white p-2 rounded-full shadow-lg"
                        >
                          <PartyPopper className="h-5 w-5" />
                        </motion.div>
                      </div>

                      <h2 className="text-4xl font-black text-[#023468] mb-4">Congratulations! 🎉</h2>
                      <p className="text-black/60 font-medium mb-8">
                        You have successfully unlocked a exclusive dealer-only price for the {vehicle?.name}.
                      </p>

                      <div className="bg-zinc-50 border-2 border-dashed border-[#E31837]/30 rounded-3xl p-8 mb-10 w-full relative overflow-hidden group">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E31837] mb-3 block">Your Unlocked Price</span>
                        <div className="text-5xl font-black text-black tracking-tighter mb-2">
                          {discountedPrice || "Calculating..."}
                        </div>
                        <div className="text-[10px] text-zinc-400 line-through">Original Price: {vehicle?.price}</div>
                        
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Sparkles className="h-12 w-12 text-[#E31837]" />
                        </div>
                      </div>

                      <Button 
                        onClick={handleClose}
                        className="bg-[#023468] hover:bg-black text-white px-10 py-6 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all"
                      >
                        Great, Close This
                      </Button>
                      
                      <p className="mt-8 text-[10px] text-black/40 italic">
                        Our relationship manager will contact you within 15 minutes to finalize your booking.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

