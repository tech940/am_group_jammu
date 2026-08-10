import { create } from 'zustand'
import type { InventoryVehicle } from '@/lib/inventory/types'
import type { LeadIntent } from '@/lib/leads/types'
import { pushEvent } from '@/lib/analytics/gtm'

interface OpenOptions {
  /** What the visitor is actually asking for. */
  intent?: LeadIntent
  /** Which control opened the modal, e.g. "finance-cta". */
  sourceLabel?: string
}

interface EnquiryModalStore {
  isOpen: boolean
  /** The real listing the enquiry is about, or null for a general enquiry. */
  vehicle: InventoryVehicle | null
  intent: LeadIntent
  sourceLabel: string | null

  onOpen: (vehicle?: InventoryVehicle | null, options?: OpenOptions) => void
  onClose: () => void
}

export const useEnquiryModal = create<EnquiryModalStore>((set) => ({
  isOpen: false,
  vehicle: null,
  intent: 'General',
  sourceLabel: null,

  onOpen: (vehicle = null, options = {}) => {
    // A vehicle-specific click defaults to a vehicle enquiry; everything else
    // is General unless the caller says otherwise.
    const intent = options.intent ?? (vehicle ? 'Vehicle Enquiry' : 'General')
    const sourceLabel = options.sourceLabel ?? null

    // Instrumented here rather than at the ~15 CTA call sites: one push covers
    // every button that opens the modal, and it gives generate_lead a
    // denominator — without it you know how many leads arrived but not which
    // button earned them.
    pushEvent('enquiry_modal_open', {
      lead_intent: intent,
      lead_source_label: sourceLabel,
      has_vehicle: Boolean(vehicle),
      item_id: vehicle ? String(vehicle.id) : undefined,
      item_name: vehicle?.title,
      item_brand: vehicle?.make ?? undefined,
      price: vehicle?.price ?? undefined,
      currency: 'INR',
    })

    set({ isOpen: true, vehicle, intent, sourceLabel })
  },

  onClose: () => set({ isOpen: false, vehicle: null, intent: 'General', sourceLabel: null }),
}))
