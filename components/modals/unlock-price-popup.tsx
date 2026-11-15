"use client"

import Image from "next/image"
import { usePathname } from "next/navigation"
import { useActionState, useEffect, useId, useRef, useState } from "react"

import { Dialog } from "@/components/ui/dialog"
import { Field, Input, Textarea } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Alert, Spinner } from "@/components/ui/feedback"
import { ChevronGlyph } from "@/components/system/marks"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import { rememberEnquirySent } from "@/lib/leads/enquiry-memory"
import { submitLead } from "@/lib/leads/actions"
import { validateLead } from "@/lib/leads/validation"
import { CONSENT_TEXT } from "@/lib/leads/types"
import type { CreateLeadInput, LeadIntent } from "@/lib/leads/types"
import type { InventoryVehicle } from "@/lib/inventory/types"
import { useToast } from "@/hooks/use-toast"
import { useInventoryStore } from "@/store/use-inventory-store"
import { leadVehicleParams, pushEvent } from "@/lib/analytics/gtm"
import { attributionParams, getAttribution } from "@/lib/analytics/attribution"

/**
 * The enquiry modal — every lead opened from a button comes through this file.
 *
 * Shape of the form, and why:
 *
 *  - Two required fields, Name and Phone, and nothing else in the way. The
 *    sales desk calls people back; a phone number is the whole lead. Email and
 *    a message are optional and sit behind a collapsed disclosure.
 *  - The submit button lives in the Dialog FOOTER, which is pinned under the
 *    scrolling body. It is on screen the moment the sheet opens on a phone and
 *    stays there however long the body gets. It reaches the form through the
 *    `form` attribute, so it is still a real submit button.
 *  - Heading, button label and success copy all come from the lead intent. They
 *    used to say "Book a test drive" for every enquiry that had no vehicle.
 *
 * The submission contract is unchanged: submitLead's input shape, the
 * `companyWebsite` honeypot, duplicate handling, toasts and analytics events.
 *
 * Consent: the form has no tick box. The sentence under the send button
 * (CONSENT_TEXT.enquiry) is the whole agreement, it covers being called or
 * messaged about this one enquiry, and that is all the lead records. It used
 * to store a bare `consent: true` that the admin read as a ticked marketing
 * box, which no visitor had been shown.
 *
 * Funnel events, in order: enquiry_modal_open (hooks/use-enquiry-modal.ts),
 * form_start (first field touched), form_error, generate_lead, and
 * enquiry_modal_close when the sheet is closed without an enquiry.
 *
 * This file is loaded on demand by ./enquiry-host.tsx, not by the root layout.
 */

/* -------------------------------------------------------------------------- */
/* Copy per intent                                                            */
/* -------------------------------------------------------------------------- */

interface IntentCopy {
  title: string
  submit: string
  /** Completes "Thanks — we have your details. …" on the success view. */
  next: string
  /** Toast body for a new enquiry. */
  toast: string
  messagePlaceholder: string
}

const INTENT_COPY: Record<LeadIntent, IntentCopy> = {
  "Vehicle Enquiry": {
    title: "Enquire about this car",
    submit: "Get best price",
    next: "We will call you with our best price on this car.",
    toast: "We will call you with our best price on this car.",
    messagePlaceholder: "Anything you want to know about this car",
  },
  "Test Drive": {
    title: "Book a test drive",
    submit: "Book test drive",
    next: "We will call you to fix a day and time for your test drive.",
    toast: "We will call you to fix a time for your test drive.",
    messagePlaceholder: "Which car, and when suits you",
  },
  Finance: {
    title: "Ask about finance",
    submit: "Get finance options",
    next: "We will call you to go through the finance options.",
    toast: "We will call you to go through the finance options.",
    messagePlaceholder: "Which car, and the down payment you have in mind",
  },
  Insurance: {
    title: "Get an insurance quote",
    submit: "Get my quote",
    next: "We will call you with an insurance quote.",
    toast: "We will call you with an insurance quote.",
    messagePlaceholder: "Your car's make, model and year",
  },
  "Sell Your Car": {
    title: "Sell or exchange your car",
    submit: "Get my valuation",
    next: "We will call you to arrange a valuation of your car.",
    toast: "We will call you to arrange a valuation of your car.",
    messagePlaceholder: "Your car's make, model, year and km driven",
  },
  Service: {
    title: "Book a service",
    submit: "Book a slot",
    next: "We will call you to confirm a service slot.",
    toast: "We will call you to confirm a service slot.",
    messagePlaceholder: "Your car, and what it needs",
  },
  General: {
    title: "Send an enquiry",
    submit: "Send enquiry",
    next: "We will call you back.",
    toast: "We will call you back.",
    messagePlaceholder: "Tell us what you are looking for",
  },
}

/* -------------------------------------------------------------------------- */
/* Shell — owns the open/close session                                        */
/* -------------------------------------------------------------------------- */

interface Session {
  key: number
  open: boolean
  vehicle: InventoryVehicle | null
  intent: LeadIntent
  sourceLabel: string | null
}

export function UnlockPricePopup() {
  const { isOpen, vehicle, intent, sourceLabel, onClose } = useEnquiryModal()

  // This component is mounted once in the root layout and never unmounts, so
  // anything it holds outlives the dialog. Two consequences are handled here:
  //
  //  1. Each OPEN gets a new key, which remounts the form with fresh action
  //     state. Without it the second enquiry of a visit opened straight onto
  //     the previous one's "Enquiry received" screen.
  //  2. The vehicle and intent are snapshotted at open. The store clears them
  //     on close, which used to swap the heading and drop the car summary
  //     while the sheet was still animating out.
  const [session, setSession] = useState<Session>({
    key: 0,
    open: false,
    vehicle: null,
    intent: "General",
    sourceLabel: null,
  })
  if (isOpen && !session.open) {
    setSession({ key: session.key + 1, open: true, vehicle, intent, sourceLabel })
  } else if (!isOpen && session.open) {
    setSession({ ...session, open: false })
  }

  return (
    <EnquiryDialog
      key={session.key}
      open={isOpen && session.open}
      vehicle={session.vehicle}
      intent={session.intent}
      sourceLabel={session.sourceLabel}
      onClose={onClose}
    />
  )
}

/* -------------------------------------------------------------------------- */
/* Dialog + form                                                              */
/* -------------------------------------------------------------------------- */

interface FormValues {
  name: string
  phone: string
  email: string
  message: string
}

type SubmitState =
  | { status: "idle" }
  | {
      status: "error"
      message: string
      code?: string
      /** Per-field messages, when the failure was validation. */
      fields: Record<string, string>
      /** What the visitor typed, so a failed submit does not empty the form. */
      values: FormValues
    }
  | { status: "success"; duplicate: boolean; leadId: string }

function EnquiryDialog({
  open,
  vehicle,
  intent,
  sourceLabel,
  onClose,
}: {
  open: boolean
  vehicle: InventoryVehicle | null
  intent: LeadIntent
  sourceLabel: string | null
  onClose: () => void
}) {
  const { setHasInquired, setShowConfetti } = useInventoryStore()
  const { toast } = useToast()
  const pathname = usePathname()
  const formId = useId()
  const moreId = useId()
  // "This car" needs a car. A vehicle enquiry opened without one reads as a
  // general enquiry; the intent sent to submitLead is not changed.
  const copy = INTENT_COPY[intent === "Vehicle Enquiry" && !vehicle ? "General" : intent]

  // Driven by useActionState rather than post-await setState.
  //
  // A Server Action called from a plain onSubmit schedules the updates that
  // follow the await at transition priority, tied to the router refresh Next
  // performs after every action. In this app that transition never settled for
  // a component mounted in the ROOT LAYOUT (the toast fired, the lead saved,
  // but the button stayed on "Processing..."). useActionState is the primitive
  // designed for this: React owns the pending flag and commits the returned
  // state when the action resolves.
  const [state, formAction, isSubmitting] = useActionState(
    async (_prev: SubmitState, fd: FormData): Promise<SubmitState> => {
      const values: FormValues = {
        name: String(fd.get("name") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        email: String(fd.get("email") ?? ""),
        message: String(fd.get("message") ?? ""),
      }

      const input: CreateLeadInput = {
        ...values,
        intent,
        sourcePath: pathname,
        sourceLabel,
        // What the sentence at the send button says, and no more than that.
        consent: true,
        consentScope: "enquiry",
        attribution: getAttribution(),
        companyWebsite: String(fd.get("companyWebsite") ?? ""),
        vehicle: vehicle
          ? {
              listingId: vehicle.id,
              title: vehicle.title,
              price: vehicle.price,
              // A car added in the admin has no WordPress page, so the lead
              // carries the car's page on this site instead — the address the
              // visitor was actually looking at.
              url: vehicle.sourceUrl || `${window.location.origin}/inventory/${vehicle.slug}`,
            }
          : null,
      }

      // Same validator the server runs, run here first so each message can be
      // shown against its own field without a round trip. The server still
      // validates; this is only for the visitor's benefit. A honeypot hit is
      // deliberately passed through so submitLead can answer it as it always
      // has.
      const check = validateLead(input)
      if (!check.ok && !check.errors._bot) {
        return {
          status: "error",
          message: Object.values(check.errors)[0] ?? "Please check the form and try again.",
          code: "validation",
          fields: check.errors,
          values,
        }
      }

      const result = await submitLead(input)

      if (!result.ok) {
        return { status: "error", message: result.error, code: result.code, fields: {}, values }
      }
      return { status: "success", duplicate: result.data.duplicate, leadId: result.data.id }
    },
    { status: "idle" },
  )

  const isSuccess = state.status === "success"
  const fields = state.status === "error" ? state.fields : {}
  const values = state.status === "error" ? state.values : null
  // An error that belongs to no single field (rate limit, storage failure).
  const formError =
    state.status === "error" && Object.keys(state.fields).length === 0 ? state.message : null

  // Email and message stay mounted while collapsed so their values submit and
  // survive a toggle. A validation error inside the section opens it — an
  // error the visitor cannot see is a form that will not submit for no reason.
  const [moreToggled, setMoreToggled] = useState(false)
  const moreOpen = moreToggled || Boolean(fields.email || fields.message)

  // Latch on the reported submission. `toast` from useToast() is not
  // guaranteed referentially stable, so this effect can re-run for the same
  // success state — harmless for the idempotent store writes, but it would
  // double-count the conversion.
  const reportedRef = useRef<string | null>(null)
  const reportedErrorRef = useRef<SubmitState | null>(null)

  // The middle of the funnel. `form_start` is the first time a field is
  // touched in this opening of the sheet; without it "opened" and "sent" are
  // all there is, and a form nobody starts looks the same as one nobody
  // finishes.
  const startedRef = useRef(false)
  const reportStart = (e: React.FocusEvent<HTMLFormElement>) => {
    // A field, not the buttons and links that also sit inside the form.
    if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) return
    if (startedRef.current) return
    startedRef.current = true
    pushEvent("form_start", {
      form_id: "enquiry-modal",
      lead_intent: intent,
      lead_source_label: sourceLabel,
      lead_source_path: pathname,
      item_id: vehicle ? String(vehicle.id) : undefined,
    })
  }

  // Closed without an enquiry: the other exit from the funnel. This component
  // stays mounted after the sheet closes (the key only changes on the next
  // open), so the change of `open` is seen here.
  const wasOpenRef = useRef(false)
  useEffect(() => {
    if (open) {
      wasOpenRef.current = true
      return
    }
    if (!wasOpenRef.current) return
    wasOpenRef.current = false
    if (isSuccess) return
    pushEvent("enquiry_modal_close", {
      lead_intent: intent,
      lead_source_label: sourceLabel,
      lead_source_path: pathname,
      form_started: startedRef.current,
      item_id: vehicle ? String(vehicle.id) : undefined,
    })
  }, [open, isSuccess, intent, sourceLabel, pathname, vehicle])

  // Side effects belong here, not in the action reducer.
  useEffect(() => {
    if (state.status === "error") {
      // Once per failed submit: a re-run for the same state would double-count
      // the error and pull focus away from whatever the visitor is typing.
      if (reportedErrorRef.current === state) return
      reportedErrorRef.current = state
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
      // Put the visitor on the field that needs fixing. Its error text is
      // wired through aria-describedby, so focusing it also reads it out.
      document
        .getElementById(formId)
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus()
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
    // Someone who has just enquired is not shown the timed form again.
    rememberEnquirySent()
    if (isRealNewLead) {
      // The lead's row id is deliberately not sent: it would tie the analytics
      // record, and the session recording, to a named person in the lead
      // table. The lead itself already stores its source and attribution.
      pushEvent("generate_lead", {
        lead_intent: intent,
        lead_source_label: sourceLabel,
        lead_source_path: pathname,
        form_id: "enquiry-modal",
        // value 0, with the car's price as listing_price: an enquiry is not
        // a sale, and GA4 would add the asking prices up as revenue.
        ...leadVehicleParams(vehicle),
        ...attributionParams(),
      })
    } else if (state.duplicate) {
      pushEvent("generate_lead_duplicate", {
        lead_intent: intent,
        lead_source_label: sourceLabel,
        form_id: "enquiry-modal",
      })
    }

    toast({
      title: state.duplicate ? "We already have your enquiry" : "Enquiry sent",
      description: state.duplicate
        ? "Our team already has your details and will call you."
        : copy.toast,
    })
  }, [state, setHasInquired, setShowConfetti, toast, intent, sourceLabel, pathname, vehicle, formId, copy])

  const footer = isSuccess ? (
    <div className="w-full pb-[env(safe-area-inset-bottom)]">
      <Button type="button" size="lg" full onClick={onClose}>
        Close
      </Button>
    </div>
  ) : (
    <div className="w-full pb-[env(safe-area-inset-bottom)]">
      <Button type="submit" form={formId} disabled={isSubmitting} size="lg" full>
        {isSubmitting ? (
          <>
            <Spinner label="Sending" />
            Sending…
          </>
        ) : (
          copy.submit
        )}
      </Button>
      {/* The consent wording, at the button that gives it. Both documents
          open in a new tab so a half-filled form is not thrown away. */}
      <p className="mt-2.5 text-caption text-ink-2">
        {CONSENT_TEXT.enquiry}{" "}
        <a
          href="/privacy-policy"
          target="_blank"
          rel="noopener"
          className="text-accent-text-light underline underline-offset-2"
        >
          Privacy policy
        </a>
        {" · "}
        <a
          href="/terms"
          target="_blank"
          rel="noopener"
          className="text-accent-text-light underline underline-offset-2"
        >
          Terms of use
        </a>
      </p>
    </div>
  )

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      title={isSuccess ? "Enquiry received" : copy.title}
      description={isSuccess ? undefined : "Leave your number and we will call you back."}
      footer={footer}
    >
      {isSuccess ? (
        <div>
          <p className="text-body-lg text-ink">
            Thanks — we have your details{vehicle ? ` for the ${vehicle.title}` : ""}. {copy.next}
          </p>
          {vehicle && (
            <p className="mt-3 text-small text-ink-2" data-num>
              Listed asking price {vehicle.priceLabel}
            </p>
          )}
        </div>
      ) : (
        <>
          {vehicle && (
            <div className="mb-4 flex items-center gap-3 rounded-sm border border-line bg-ground p-2">
              <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-sm bg-ground-2">
                {vehicle.primaryImage && (
                  <Image
                    src={vehicle.primaryImage}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-label text-ink">
                  {vehicle.year ? `${vehicle.year} ` : ""}
                  {vehicle.title}
                </p>
                <p className="mt-0.5 truncate text-small text-ink-2" data-num>
                  {vehicle.priceLabel}
                  {vehicle.mileage !== null && ` · ${vehicle.mileageLabel}`}
                </p>
              </div>
            </div>
          )}

          <form
            id={formId}
            className="grid gap-4"
            action={formAction}
            noValidate
            onFocusCapture={reportStart}
            // Clarity never records what is typed into an input, in any of
            // its modes. This also blanks the rest of the form in a replay
            // (error text can repeat what was typed), whatever masking mode
            // the Clarity project is later set to.
            data-clarity-mask="true"
          >
            {formError && <Alert tone="danger">{formError}</Alert>}

            <Field label="Name" required error={fields.name}>
              {(p) => (
                <Input
                  type="text"
                  name="name"
                  autoComplete="name"
                  autoCapitalize="words"
                  enterKeyHint="next"
                  // "Next" must move on, not submit: the footer button is the
                  // form's default submit, so a bare Enter here would send a
                  // form with no phone number in it.
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return
                    e.preventDefault()
                    e.currentTarget.form
                      ?.querySelector<HTMLInputElement>('input[name="phone"]')
                      ?.focus()
                  }}
                  defaultValue={values?.name}
                  required
                  {...p}
                />
              )}
            </Field>

            <Field label="Mobile number" required error={fields.phone}>
              {(p) => (
                <Input
                  type="tel"
                  name="phone"
                  inputMode="numeric"
                  autoComplete="tel"
                  enterKeyHint="send"
                  placeholder="10-digit mobile number"
                  defaultValue={values?.phone}
                  required
                  {...p}
                />
              )}
            </Field>

            <div>
              <button
                type="button"
                aria-expanded={moreOpen}
                aria-controls={moreId}
                onClick={() => setMoreToggled((v) => !v)}
                className="-my-1 inline-flex min-h-11 items-center gap-1.5 text-label text-accent-text-light underline-offset-4 hover:underline"
              >
                Add email or a message (optional)
                <ChevronGlyph direction={moreOpen ? "up" : "down"} />
              </button>

              <div id={moreId} hidden={!moreOpen} className="mt-2 grid gap-4">
                <Field label="Email" error={fields.email}>
                  {(p) => (
                    <Input
                      type="email"
                      name="email"
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      defaultValue={values?.email}
                      {...p}
                    />
                  )}
                </Field>

                <Field label="Message" error={fields.message}>
                  {(p) => (
                    <Textarea
                      name="message"
                      rows={3}
                      placeholder={copy.messagePlaceholder}
                      defaultValue={values?.message}
                      {...p}
                    />
                  )}
                </Field>
              </div>
            </div>

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
          </form>
        </>
      )}
    </Dialog>
  )
}
