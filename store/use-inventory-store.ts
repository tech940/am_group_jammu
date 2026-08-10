import { create } from 'zustand'

/**
 * Filter shape for the live inventory.
 *
 * Ranges are `null` when untouched. That distinction matters: a listing with a
 * null price or year must stay visible in the default view and only drop out
 * once the user actively filters on that field, otherwise listings with
 * incomplete upstream data silently disappear.
 *
 * NOTE: filter/sort/search state deliberately lives in the listing page's own
 * React state rather than in this store. It is seeded from the URL on the
 * server, and a module-level store would be shared across requests during SSR.
 * This store only holds genuinely cross-component UI state.
 */
export type SortKey =
  | 'recent'
  | 'price-asc'
  | 'price-desc'
  | 'year-desc'
  | 'year-asc'
  | 'mileage-asc'

export type Range = [number, number]

export interface InventoryFilterState {
  make: string
  model: string
  bodyType: string
  fuel: string
  transmission: string
  condition: string
  colour: string
  priceRange: Range | null
  yearRange: Range | null
  mileageRange: Range | null
}

export const EMPTY_FILTERS: InventoryFilterState = {
  make: '',
  model: '',
  bodyType: '',
  fuel: '',
  transmission: '',
  condition: '',
  colour: '',
  priceRange: null,
  yearRange: null,
  mileageRange: null,
}

/** How many filters are currently narrowing the list. */
export function countActiveFilters(f: InventoryFilterState): number {
  return (
    [f.make, f.model, f.bodyType, f.fuel, f.transmission, f.condition, f.colour].filter(Boolean)
      .length +
    [f.priceRange, f.yearRange, f.mileageRange].filter((r) => r !== null).length
  )
}

interface InventoryUiState {
  /** Set once a visitor submits an enquiry; used by the enquiry modal. */
  hasInquired: boolean
  showConfetti: boolean
  setHasInquired: (val: boolean) => void
  setShowConfetti: (val: boolean) => void
}

export const useInventoryStore = create<InventoryUiState>((set) => ({
  hasInquired: false,
  showConfetti: false,
  setHasInquired: (hasInquired) => set({ hasInquired }),
  setShowConfetti: (showConfetti) => set({ showConfetti }),
}))
