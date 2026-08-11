"use client"

import Image from "next/image"
import { usePathname } from "next/navigation"
import { useActionState, useEffect, useRef } from "react"

import { Dialog } from "@/components/ui/dialog"
import { Field, Input, Textarea } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Alert, Spinner } from "@/components/ui/feedback"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import { submitLead } from "@/lib/leads/actions"
import { useToast } from "@/hooks/use-toast"
import { useInventoryStore } from "@/store/use-inventory-store"
import { pushEvent, vehicleParams } from "@/lib/analytics/gtm"

/**
 * The enquiry modal — every lead in the business comes through this file.
 *
 * The submission machinery below is unchanged from the previous version and
 * must stay that way; only the presentation was rebuilt. What changed:
 *
 *  - It is now a <Dialog>, so it finally has role="dialog", aria-modal,
 *    aria-labelledby, a focus trap, Escape-to-close, body scroll lock and
 *    focus restoration. It previously had none of those.
 *  - The five real fields are wrapped in <Field>, which binds a real <label>.
 *    Before this, the only htmlFor in the file was on the honeypot, so screen
 *    readers announced the lead form as five unlabelled text boxes.
 *  - Gone: the 900px two-panel slab, rounded-[40px], the 0_50px_150px shadow,
 *    the blur-[100px] red blob, four backdrop-blur glass panels, 8-10px
 *    font-black micro-caps, the 🎉 in an <h2>, and an infinite-loop
 *    PartyPopper animation that ignored prefers-reduced-motion.
 *
 * The vehicle context is now a compact header block rather than a fixed 320px
 * side rail: an enquiry about a car should show the car, but the form is the
 * job, and a side rail forced the dialog to be huge on every screen.
 */
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

  // Inputs are uncontrolled and the form unmounts with the modal, so there is
  // no stale form state to clear — which is what previously let a second
  // enquiry resubmit the last message.
  const handleClose = () => onClose()

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      size="lg"
      title={isSuccess ? "Enquiry received" : vehicle ? "Enquire about this car" : "Book a test drive"}
      description={
        isSuccess
          ? undefined
          : "Leave your details and our team will call you back. Fields marked * are required."
      }
    >
      {isSuccess ? (
        <div className="py-4">
          <p className="max-w-[52ch] text-body-lg text-ink">
            Thanks — we have your details{vehicle ? ` for the ${vehicle.title}` : ""}. Our team will
            call you with the best possible price.
          </p>

          {vehicle && (
            <div className="mt-6 border border-line bg-ground px-5 py-4">
              <p className="text-meta uppercase text-ink-2">Listed asking price</p>
              <p className="mt-1 font-display text-h2 text-ink" data-num>
                {vehicle.priceLabel}
              </p>
              {vehicle.originalPriceLabel && (
                <p className="mt-1 text-small text-ink-3 line-through" data-num>
                  Was {vehicle.originalPriceLabel}
                </p>
              )}
            </div>
          )}

          <p className="mt-6 text-small text-ink-2">
            A relationship manager will be in touch shortly to confirm your booking.
          </p>

          <div className="mt-7">
            <Button type="button" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <>
          {vehicle && (
            <div className="mb-6 flex items-center gap-4 border border-line bg-ground p-3">
              <div className="relative h-20 w-28 shrink-0 overflow-hidden bg-ground-2">
                {vehicle.primaryImage ? (
                  <Image
                    src={vehicle.primaryImage}
                    alt={vehicle.title}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-meta uppercase text-ink-3">
                    No photo
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-h4 uppercase leading-none text-ink">
                  {vehicle.year ? `${vehicle.year} ` : ""}
                  {vehicle.title}
                </p>
                <p className="mt-1.5 text-small text-ink-2" data-num>
                  {vehicle.priceLabel}
                  {vehicle.mileage !== null && ` · ${vehicle.mileageLabel}`}
                </p>
              </div>
            </div>
          )}

          <form className="space-y-5" action={formAction}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="First name" required>
                {(p) => <Input type="text" name="firstName" placeholder="e.g. Rahul" required {...p} />}
              </Field>
              <Field label="Last name">
                {(p) => <Input type="text" name="lastName" placeholder="e.g. Sharma" {...p} />}
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Phone" required help="We will call you on this number.">
                {(p) => (
                  <Input
                    type="tel"
                    name="phone"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+91 XXXXX XXXXX"
                    required
                    {...p}
                  />
                )}
              </Field>
              <Field label="Email" required>
                {(p) => (
                  <Input
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="e.g. rahul@example.com"
                    required
                    {...p}
                  />
                )}
              </Field>
            </div>

            <Field label="Message">
              {(p) => (
                <Textarea
                  name="message"
                  rows={3}
                  placeholder={
                    vehicle
                      ? `I am interested in the ${vehicle.title}...`
                      : "Tell us what you are looking for..."
                  }
                  {...p}
                />
              )}
            </Field>

            {/* Honeypot — visually hidden, never focusable. The field name is a
                contract with submitLead: renaming it disables bot rejection. */}
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

            {fieldError && <Alert tone="danger">{fieldError}</Alert>}

            <div className="border-t border-line pt-5">
              <Button type="submit" disabled={isSubmitting} size="lg" full>
                {isSubmitting ? (
                  <>
                    <Spinner label="Sending" />
                    Sending…
                  </>
                ) : vehicle ? (
                  "Get best price"
                ) : (
                  "Book test drive"
                )}
              </Button>
              <p className="mt-4 text-small text-ink-2">
                By submitting, you agree that AM Group and its affiliates may call or text you about
                your enquiry. See our{" "}
                <a href="/terms" className="text-accent-text-light underline underline-offset-4">
                  terms of use
                </a>
                .
              </p>
            </div>
          </form>
        </>
      )}
    </Dialog>
  )
}
