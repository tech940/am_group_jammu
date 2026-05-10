import { create } from 'zustand'

interface EnquiryModalStore {
  isOpen: boolean
  vehicle: {
    id: string
    name: string
    brand: string
    year?: string
    image: string
    price: string
  } | null

  onOpen: (vehicle?: EnquiryModalStore['vehicle']) => void
  onClose: () => void
}

export const useEnquiryModal = create<EnquiryModalStore>((set) => ({
  isOpen: false,
  vehicle: null,
  onOpen: (vehicle = null) => set({ isOpen: true, vehicle }),
  onClose: () => set({ isOpen: false, vehicle: null }),
}))
