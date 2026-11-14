"use client"

import type { ReactNode } from "react"
import { useEnquiryModal } from "@/hooks/use-enquiry-modal"
import type { LeadIntent } from "@/lib/leads/types"

/**
 * A tile that opens the shared enquiry form with the right CRM intent.
 *
 * The only client code in the storefront's tile grid. The pictogram and label
 * arrive as children, so they are rendered on the server with the rest of the
 * grid and this file ships nothing but the click handler.
 */
export function EnquireTile({
  intent,
  sourceLabel,
  className,
  children,
}: {
  intent: LeadIntent
  /** What the lead is tagged with, so each tile is distinguishable in the CRM. */
  sourceLabel: string
  className?: string
  children: ReactNode
}) {
  const onOpen = useEnquiryModal((s) => s.onOpen)

  return (
    <button
      type="button"
      className={className}
      onClick={() => onOpen(null, { intent, sourceLabel })}
    >
      {children}
    </button>
  )
}
