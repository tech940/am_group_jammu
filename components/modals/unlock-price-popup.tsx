"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Send, CarFront } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import { useActionState, useEffect, useRef, useState } from "react"
import { submitLead } from "@/lib/leads/actions"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle2, PartyPopper } from "lucide-react"

import { usePathname } from "next/navigation"
import { useInventoryStore } from "@/store/use-inventory-store"
import { pushEvent, vehicleParams } from "@/lib/analytics/gtm"

export function UnlockPricePopup() {
  const { isOpen, vehicle, intent, sourceLabel, onClose } = useEnquiryModal()
  const { setHasInquired, setShowConfetti } = useInventoryStore()
  const { toast } = useToast()
  const pathname = usePathname()
  // Driven by useActionState rather than post-await setState.
  //
  // A Server Action called from a plain onSubmit schedules the updates that
  // follow the await at transition priority, tied to the router refresh Next
  // performs after every action. In this app that transition never settled for
  // a component mounted in the ROOT LAYOUT (the toast fired, the lead saved,
  // but the button stayed on "Processing..."). useActionState is the primitive
  // designed for this: React owns the pending flag and commits the returned
  // state when the action resolves.
  type SubmitState =
    | { status: "idle" }
    | { status: "error"; message: string; code?: string }
    | { status: "success"; duplicate: boolean; leadId: string }

  const [state, formAction, isSubmitting] = useActionState(
    async (_prev: SubmitState, fd: FormData): Promise<SubmitState> => {
      const result = await submitLead({
        name: `${fd.get("firstName") ?? ""} ${fd.get("lastName") ?? ""}`.trim(),
        phone: String(fd.get("phone") ?? ""),
        email: String(fd.get("email") ?? ""),
        message: String(fd.get("message") ?? ""),
        intent,
        sourcePath: pathname,
        sourceLabel,
        consent: true,
        companyWebsite: String(fd.get("companyWebsite") ?? ""),
        vehicle: vehicle
          ? {
              listingId: vehicle.id,
              title: vehicle.title,
              price: vehicle.price,
              url: vehicle.sourceUrl,
            }
          : null,
      })

      if (!result.ok) return { status: "error", message: result.error, code: result.code }
      return { status: "success", duplicate: result.data.duplicate, leadId: result.data.id }
    },
    { status: "idle" },
  )

  const isSuccess = state.status === "success"
  const fieldError = state.status === "error" ? state.message : null

  // Latch on the reported submission. `toast` from useToast() is not
  // guaranteed referentially stable, so this effect can re-run for the same
  // success state — harmless for the idempotent store writes, but it would
  // double-count the conversion.
  const reportedRef = useRef<string | null>(null)

  // Side effects belong here, not in the action reducer.
  useEffect(() => {
    if (state.status === "error") {
      pushEvent("form_error", {
        form_id: "enquiry-modal",
        error_message: state.message,
        // 'storage' means a lead was silently lost — worth alerting on,
        // unlike a 'validation' typo.
        error_code: state.code,
        lead_intent: intent,
        lead_source_label: sourceLabel,
        lead_source_path: pathname,
      })
      return
    }

    if (state.status !== "success") return
    if (reportedRef.current === state.leadId) return
    reportedRef.current = state.leadId

    setHasInquired(true)
    setShowConfetti(true)

    // submitLead answers ok:true for a honeypot hit (id "ignored", nothing
    // written) so a bot cannot detect it was caught, and for a de-duplicated
    // repeat (no new row). Counting either would make GA4 disagree with the
    // admin lead table.
    const isRealNewLead = state.leadId !== "ignored" && !state.duplicate
    if (isRealNewLead) {
      pushEvent("generate_lead", {
        currency: "INR",
        lead_id: state.leadId,
        lead_intent: intent,
        lead_source_label: sourceLabel,
        lead_source_path: pathname,
        form_id: "enquiry-modal",
        ...vehicleParams(vehicle),
      })
    } else if (state.duplicate) {
      pushEvent("generate_lead_duplicate", {
        lead_id: state.leadId,
        lead_intent: intent,
        lead_source_label: sourceLabel,
        form_id: "enquiry-modal",
      })
    }

    toast({
      title: state.duplicate ? "We already have your enquiry" : "Enquiry sent",
      description: state.duplicate
        ? "Our team is already on it and will call you shortly."
        : "Our team will call you shortly with the best price on this car.",
    })
  }, [state, setHasInquired, setShowConfetti, toast, intent, sourceLabel, pathname, vehicle])

  const handleClose = () => {

    onClose()
    // Reset state after a delay to allow exit animation
    // Inputs are uncontrolled and the form unmounts with the modal, so there
    // is no stale form state to clear — which is what previously let a second
    // enquiry resubmit the last message.

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
                 aria-label="Close modal"
                 className="absolute top-4 right-4 h-9 w-9 rounded-full bg-zinc-100/50 backdrop-blur-md flex items-center justify-center hover:bg-zinc-200 transition-colors z-30"
               >
                <X className="h-4 w-4 text-black" />
              </button>


              {/* Left Panel: Vehicle Details */}
              <div className="lg:w-[320px] bg-[#023468] p-6 flex flex-col relative overflow-hidden shrink-0">

                {/* Brand Logo Header */}
                <div className="p-4 rounded-2xl mb-8 flex items-center justify-center relative z-10 bg-black/20 backdrop-blur-md border border-white/10">
                   <Image
                     src="https://amgroupind.com/wp-content/uploads/2023/06/logo-1.png"
                     alt="AM Group"
                     width={110}
                     height={32}
                     className="h-8 w-auto object-contain brightness-0 invert"
                   />
                </div>

                <div className="relative z-10 flex-1 flex flex-col overflow-y-auto no-scrollbar">
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                    {vehicle ? "Enquire About" : "Experience Excellence"}
                  </p>
                  <h3 className="text-white text-2xl font-black mb-6 leading-tight">
                    {vehicle
                      ? `${vehicle.year ? `${vehicle.year} ` : ""}${vehicle.title}`
                      : "Book a Test Drive"}
                  </h3>

                  {/* Visual Card */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-3xl mb-6">
                    <div className="relative h-48 rounded-2xl overflow-hidden mb-5 bg-white/5 flex items-center justify-center">
                      {vehicle?.primaryImage ? (
                        <Image
                          src={vehicle.primaryImage}
                          alt={vehicle.title}
                          fill
                          sizes="320px"
                          className="object-cover"
                        />
                      ) : (
                        <CarFront className="h-20 w-20 text-white/20" />
                      )}
                    </div>
                    {vehicle && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <div className="min-w-0">
                            <span className="block text-[8px] uppercase tracking-widest text-white/40 font-black mb-1">Model</span>
                            <span className="text-white text-xs font-bold truncate block">{vehicle.title}</span>
                          </div>
                          <div className="text-right shrink-0 pl-3">
                            <span className="block text-[8px] uppercase tracking-widest text-white/40 font-black mb-1">Asking Price</span>
                            <span className="text-white text-xs font-bold">{vehicle.priceLabel}</span>
                          </div>
                        </div>
                        {vehicle.mileage !== null && (
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] uppercase tracking-widest text-white/40 font-black">Driven</span>
                            <span className="text-white/80 text-xs font-bold">{vehicle.mileageLabel}</span>
                          </div>
                        )}
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

                <AnimatePresence initial={false}>
                  {!isSuccess ? (
                    <motion.div
                      key="form"
                      initial={false}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="mb-4 lg:mb-6">
                        <h2 className="text-2xl lg:text-3xl font-black text-[#023468] mb-1">Contact Information</h2>
                        <p className="text-black/40 text-[10px] font-bold">All fields marked with <span className="text-[#E31837]">*</span> are required.</p>
                      </div>


                      <form className="space-y-4 lg:space-y-5" action={formAction}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-black/40">First Name *</label>
                            <input 
                              type="text" 
                              required
                              name="firstName"
                              placeholder="e.g. Rahul"
                              className="w-full h-11 lg:h-12 px-6 bg-zinc-50 border border-black/5 rounded-xl focus:outline-none focus:border-[#023468] transition-all text-sm font-medium"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-black/40">Last Name</label>
                            <input 
                              type="text" 
                              name="lastName"
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
                              name="email"
                              placeholder="e.g. rahul@example.com"
                              className="w-full h-11 px-6 bg-zinc-50 border border-black/5 rounded-xl focus:outline-none focus:border-[#023468] transition-all text-sm font-medium"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-black/40">Phone *</label>
                            <input 
                              type="tel" 
                              required
                              name="phone"
                              placeholder="+91 XXXXX XXXXX"
                              className="w-full h-11 px-6 bg-zinc-50 border border-black/5 rounded-xl focus:outline-none focus:border-[#023468] transition-all text-sm font-medium"
                            />
                          </div>
                        </div>


                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-black/40">Message / Comments</label>
                          <textarea 
                            rows={2}
                              name="message"
                            placeholder={vehicle ? `I am interested in the ${vehicle.title}...` : "Tell us about your test drive preference..."}
                            className="w-full bg-zinc-50 border border-black/5 rounded-xl p-4 focus:outline-none focus:border-[#023468] transition-all text-sm font-medium resize-none"
                          />
                        </div>

                        {/* Honeypot - visually hidden, never focusable */}
                        <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
                          <label htmlFor="companyWebsite">Company website</label>
                          <input
                            id="companyWebsite"
                            name="companyWebsite"
                            type="text"
                            tabIndex={-1}
                            autoComplete="off"
                          />
                        </div>

                        {fieldError && (
                          <p className="text-[11px] font-bold text-[#E31837] bg-[#E31837]/8 border border-[#E31837]/20 rounded-xl px-3 py-2">
                            {fieldError}
                          </p>
                        )}

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
                                {vehicle ? "Get Best Price" : "Book Test Drive Now"}
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

                      <h2 className="text-4xl font-black text-[#023468] mb-4">Enquiry received 🎉</h2>
                      <p className="text-black/60 font-medium mb-8">
                        Thanks — we have your details{vehicle ? ` for the ${vehicle.title}` : ""}. Our team will
                        call you with the best possible price on this car.
                      </p>

                      {vehicle && (
                        <div className="bg-zinc-50 border-2 border-dashed border-[#E31837]/30 rounded-3xl p-8 mb-10 w-full relative overflow-hidden group">
                          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#E31837] mb-3 block">
                            Listed Asking Price
                          </span>
                          <div className="text-5xl font-black text-black tracking-tighter mb-2">
                            {vehicle.priceLabel}
                          </div>
                          {vehicle.originalPriceLabel && (
                            <div className="text-[10px] text-zinc-400 line-through">
                              Was {vehicle.originalPriceLabel}
                            </div>
                          )}

                          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <CheckCircle2 className="h-12 w-12 text-[#023468]" />
                          </div>
                        </div>
                      )}

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

