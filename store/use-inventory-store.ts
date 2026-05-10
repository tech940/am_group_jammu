import { create } from 'zustand'

interface InventoryState {
  filters: {
    brand: string
    type: string
    fuel: string
    priceRange: [number, number]
  }
  searchQuery: string
  viewType: 'grid' | 'list'
  hasInquired: boolean
  showConfetti: boolean
  
  setBrand: (brand: string) => void
  setType: (type: string) => void
  setFuel: (fuel: string) => void
  setPriceRange: (range: [number, number]) => void
  setSearchQuery: (query: string) => void
  setHasInquired: (val: boolean) => void
  setShowConfetti: (val: boolean) => void
  toggleViewType: () => void
  resetFilters: () => void
}

export const useInventoryStore = create<InventoryState>((set) => ({
  filters: {
    brand: '',
    type: '',
    fuel: '',
    priceRange: [0, 10000000],
  },
  searchQuery: '',
  viewType: 'grid',
  hasInquired: false,
  showConfetti: false,

  setBrand: (brand) => set((state) => ({ 
    filters: { ...state.filters, brand } 
  })),

  setType: (type) => set((state) => ({ 
    filters: { ...state.filters, type } 
  })),

  setFuel: (fuel) => set((state) => ({ 
    filters: { ...state.filters, fuel } 
  })),

  setPriceRange: (range) => set((state) => ({ 
    filters: { ...state.filters, priceRange: range } 
  })),

  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setHasInquired: (val) => set({ hasInquired: val }),
  setShowConfetti: (val) => set({ showConfetti: val }),

  toggleViewType: () => set((state) => ({ 
    viewType: state.viewType === 'grid' ? 'list' : 'grid' 
  })),


  resetFilters: () => set({
    filters: {
      brand: '',
      type: '',
      fuel: '',
      priceRange: [0, 10000000],
    }
  })
}))
