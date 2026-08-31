"use client"

import { Button } from "@/components/ui/button"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import type { LeadIntent } from "@/lib/leads/types"

/**
 * The homepage's one form-based lead path, kept as a leaf so the closing band
 * around it stays a server component.
 *
 * Every other action on this page is a tel:, wa.me or navigation anchor, which
 * the delegated LinkTracker already instruments. This one goes through the
 * shared enquiry store, so it reports the same intent and source label as every
 * other enquiry in the app.
 */
export function EnquireCta({
  label = "Send an enquiry",
  sourceLabel,
  intent = "General",
  variant = "primary",
}: {
  label?: string
  sourceLabel: string
  /** The CRM already types these — a service enquiry should land as one. */
  intent?: LeadIntent
  variant?: "primary" | "secondary" | "onDeep" | "bright" | "glass"
}) {
  const onOpen = useEnquiryModal((s) => s.onOpen)

  return (
    <Button
      type="button"
      variant={variant}
      size="lg"
      onClick={() => onOpen(null, { intent, sourceLabel })}
    >
      {label}
    </Button>
  )
}
