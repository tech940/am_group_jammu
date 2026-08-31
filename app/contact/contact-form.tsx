"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { ChatGlyph } from "@/components/system/marks"
import { Button } from "@/components/ui/button"
import { Field, Input, Textarea, Checkbox } from "@/components/ui/field"
import { Alert, Spinner } from "@/components/ui/feedback"
import { submitLead } from "@/lib/leads/actions"
import { pushEvent } from "@/lib/analytics/gtm"
import { whatsappUrl, PRIMARY_LOCATION } from "@/lib/locations"

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
      setError(`Something went wrong. Please call us on ${PRIMARY_LOCATION.phone}.`)
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="border border-line bg-surface p-6 text-center md:p-10">
        <h3 className="font-display text-h2 uppercase text-ink">Message received</h3>
        <p className="mx-auto mt-3 max-w-md text-body text-ink-2">
          Thanks for getting in touch. Our team will call you back within one working day.
          For anything urgent, call us on{" "}
          <a
            href={`tel:${PRIMARY_LOCATION.phoneE164}`}
            data-track-location="contact-form"
            className="text-accent-text-light underline-offset-4 hover:underline"
            data-num
          >
            {PRIMARY_LOCATION.phone}
          </a>.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Button asChild variant="secondary">
            <a
              href={whatsappUrl("Hi AM Group, I just sent an enquiry through your website.")}
              target="_blank"
              rel="noopener noreferrer"
              data-track-location="contact-success"
            >
              <ChatGlyph /> Chat on WhatsApp instead
            </a>
          </Button>

          <Button type="button" variant="link" onClick={() => setSent(false)}>
            Send another message
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 border border-line bg-surface p-6 md:p-10"
    >
      {/* Offer the faster channel first — for most J&K buyers WhatsApp beats a
          form, and burying it until after submission loses those enquiries. */}
      <div className="flex flex-col gap-4 border border-line bg-ground p-4 sm:flex-row sm:items-center">
        <p className="flex-1 text-small text-ink-2">
          Prefer to chat? Message us on WhatsApp and we will reply during showroom hours.
        </p>
        <Button asChild variant="secondary" className="shrink-0">
          <a
            href={whatsappUrl("Hi AM Group, I have a question about your used cars in Jammu.")}
            target="_blank"
            rel="noopener noreferrer"
            data-track-location="contact-page"
          >
            <ChatGlyph /> WhatsApp us
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field label="Full Name" required>
          {(a11y) => (
            <Input
              {...a11y}
              name="name" type="text" required
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Rahul Sharma"
            />
          )}
        </Field>
        <Field label="Email Address">
          {(a11y) => (
            <Input
              {...a11y}
              name="email" type="email"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="rahul@example.com"
            />
          )}
        </Field>
      </div>

      <Field label="Phone Number" required>
        {(a11y) => (
          <Input
            {...a11y}
            name="phone" type="tel" required
            inputMode="numeric" autoComplete="tel"
            value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+91 XXXXX XXXXX"
          />
        )}
      </Field>

      <Field label="Message">
        {(a11y) => (
          <Textarea
            {...a11y}
            name="message" rows={4}
            value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Tell us what you're thinking..."
          />
        )}
      </Field>

      {/* Honeypot */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor="c-company">Company website</label>
        <input
          id="c-company" name="companyWebsite" type="text" tabIndex={-1} autoComplete="off"
          value={form.companyWebsite}
          onChange={(e) => setForm({ ...form, companyWebsite: e.target.value })}
        />
      </div>

      <Checkbox
        label="I agree to be contacted by AM Group via Call, SMS, WhatsApp, RCS, and Email regarding my inquiry, offers, and service updates. I understand that I can opt out at any time."
        checked={form.consent}
        onChange={(e) => setForm({ ...form, consent: e.target.checked })}
      />

      {error && <Alert tone="danger">{error}</Alert>}

      <Button type="submit" size="lg" full disabled={submitting}>
        {submitting ? (
          <>
            <Spinner /> Sending…
          </>
        ) : (
          "Send Message"
        )}
      </Button>
    </form>
  )
}
