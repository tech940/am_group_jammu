"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Send, CheckCircle2, Loader2, AlertTriangle, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { submitLead } from "@/lib/leads/actions"
import { pushEvent } from "@/lib/analytics/gtm"
import { whatsappUrl } from "@/lib/locations"

const EMPTY = { name: "", email: "", phone: "", message: "", consent: false, companyWebsite: "" }

/**
 * The contact form.
 *
 * This previously had no onSubmit and no name attributes at all, so clicking
 * "Send Message" performed a native GET, reloaded the page and cleared the
 * fields — which reads to the visitor as success while nothing was ever sent.
 */
export function ContactForm() {
  const pathname = usePathname()
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const result = await submitLead({
        name: form.name,
        phone: form.phone,
        email: form.email,
        message: form.message,
        intent: "General",
        sourcePath: pathname,
        sourceLabel: "contact-page",
        consent: form.consent,
        companyWebsite: form.companyWebsite,
      })

      if (!result.ok) {
        pushEvent("form_error", {
          form_id: "contact-page",
          error_message: result.error,
          error_code: result.code,
          error_type: "server",
        })
        setError(result.error)
        return
      }

      // Same honeypot/duplicate exclusion as the modal, so the two
      // generate_lead sources reconcile against the admin lead table.
      if (result.data.id !== "ignored" && !result.data.duplicate) {
        pushEvent("generate_lead", {
          currency: "INR",
          value: 0,
          lead_id: result.data.id,
          lead_intent: "General",
          lead_source_label: "contact-page",
          lead_source_path: pathname,
          form_id: "contact-page",
          has_vehicle: false,
          consent: form.consent,
          has_message: Boolean(form.message),
          has_email: Boolean(form.email),
        })
      }

      setForm(EMPTY)
      setSent(true)
    } catch {
      pushEvent("form_error", {
        form_id: "contact-page",
        error_message: "network_exception",
        error_type: "exception",
      })
      setError("Something went wrong. Please call us on +91 94191 00000.")
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="bg-zinc-50 p-12 md:p-16 rounded-[60px] border border-black/5 text-center">
        <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h3 className="text-3xl font-black text-[#023468] mb-3">Message received</h3>
        <p className="text-black/50 text-sm max-w-md mx-auto leading-relaxed">
          Thanks for getting in touch. Our team will call you back within one working day.
          For anything urgent, call us on{" "}
          <a href="tel:+919419100000" className="font-bold text-[#023468]">+91 94191 00000</a>.
        </p>
        <a
          href={whatsappUrl("Hi AM Group, I just sent an enquiry through your website.")}
          target="_blank"
          rel="noopener noreferrer"
          data-track-location="contact-success"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#1da851] px-6 py-3 text-white text-xs font-black uppercase tracking-widest transition-colors"
        >
          <MessageCircle className="h-4 w-4" /> Chat on WhatsApp instead
        </a>

        <button
          onClick={() => setSent(false)}
          className="block mx-auto mt-6 text-xs font-black uppercase tracking-widest text-[#023468] hover:text-[#E31837] transition-colors cursor-pointer"
        >
          Send another message
        </button>
      </div>
    )
  }

  const field = "w-full h-16 bg-white rounded-2xl px-8 border border-black/5 focus:outline-none focus:border-[#E31837] transition-all text-sm font-medium"
  const labelCls = "text-[10px] font-black uppercase tracking-widest text-black/30 ml-4"

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="space-y-8 bg-zinc-50 p-12 md:p-16 rounded-[60px] border border-black/5"
    >
      {/* Offer the faster channel first — for most J&K buyers WhatsApp beats a
          form, and burying it until after submission loses those enquiries. */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-3xl bg-white border border-black/5 p-5">
        <p className="text-xs text-black/50 leading-relaxed flex-1">
          Prefer to chat? Message us on WhatsApp and we will reply during showroom hours.
        </p>
        <a
          href={whatsappUrl("Hi AM Group, I have a question about your used cars in Jammu.")}
          target="_blank"
          rel="noopener noreferrer"
          data-track-location="contact-page"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#1da851] px-6 py-3 text-white text-xs font-black uppercase tracking-widest transition-colors shrink-0"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp us
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label htmlFor="c-name" className={labelCls}>Full Name *</label>
          <input
            id="c-name" name="name" type="text" required
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Rahul Sharma" className={field}
          />
        </div>
        <div className="space-y-3">
          <label htmlFor="c-email" className={labelCls}>Email Address</label>
          <input
            id="c-email" name="email" type="email"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="rahul@example.com" className={field}
          />
        </div>
      </div>

      <div className="space-y-3">
        <label htmlFor="c-phone" className={labelCls}>Phone Number *</label>
        <input
          id="c-phone" name="phone" type="tel" required
          inputMode="numeric" autoComplete="tel"
          value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="+91 XXXXX XXXXX" className={field}
        />
      </div>

      <div className="space-y-3">
        <label htmlFor="c-message" className={labelCls}>Message</label>
        <textarea
          id="c-message" name="message" rows={4}
          value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Tell us what you're thinking..."
          className="w-full bg-white rounded-2xl p-8 border border-black/5 focus:outline-none focus:border-[#E31837] transition-all text-sm font-medium resize-none"
        />
      </div>

      {/* Honeypot */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor="c-company">Company website</label>
        <input
          id="c-company" name="companyWebsite" type="text" tabIndex={-1} autoComplete="off"
          value={form.companyWebsite}
          onChange={(e) => setForm({ ...form, companyWebsite: e.target.value })}
        />
      </div>

      <div className="flex gap-6 items-start">
        <div className="relative mt-1">
          <input
            type="checkbox" id="consent" className="peer sr-only"
            checked={form.consent}
            onChange={(e) => setForm({ ...form, consent: e.target.checked })}
          />
          <div className="h-6 w-6 rounded-lg border-2 border-black/10 peer-checked:bg-[#023468] peer-checked:border-[#023468] transition-all flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
        </div>
        <label htmlFor="consent" className="text-xs text-black/40 leading-relaxed cursor-pointer select-none">
          I agree to be contacted by AM Group via Call, SMS, WhatsApp, RCS, and Email regarding my inquiry,
          offers, and service updates. I understand that I can opt out at any time.
        </label>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl bg-[#E31837]/8 border border-[#E31837]/20 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-[#E31837] shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-[#E31837] leading-relaxed">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={submitting}
        className="w-full h-20 bg-[#023468] hover:bg-[#E31837] disabled:opacity-60 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all duration-500 shadow-2xl shadow-[#023468]/20 flex items-center justify-center gap-4"
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Sending…
          </>
        ) : (
          <>
            Send Message <Send className="h-5 w-5" />
          </>
        )}
      </Button>
    </motion.form>
  )
}
