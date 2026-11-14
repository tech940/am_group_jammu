/**
 * The website's own car record — one row of `public.used_cars`
 * (supabase/migrations/20261114120000_used_cars.sql).
 *
 * This is the STORED shape. Pages never see it: lib/cars/mapper.ts turns a row
 * into the `InventoryVehicle` view model every public surface already renders,
 * so the listing page, the car page, the filters, the SEO landings and the
 * Meta feed did not have to change when the stock moved out of WordPress.
 */

export const CAR_STATUSES = ['draft', 'published', 'sold'] as const
export type CarStatus = (typeof CAR_STATUSES)[number]

export interface CarRow {
  /** WordPress listing id for imported cars; 100000+ for cars added in the admin. */
  id: number
  status: CarStatus
  /** Make and model as shown, without the year: "Hyundai i20". */
  title: string
  make: string | null
  model: string | null
  variant: string | null
  year: number | null
  /** Asking price, rupees. */
  price: number | null
  /** The higher, struck-through price, rupees. */
  original_price: number | null
  mileage_km: number | null
  fuel: string | null
  transmission: string | null
  drivetrain: string | null
  body_type: string | null
  colour: string | null
  engine: string | null
  condition: string | null
  owners: number | null
  /** Registration series only ("JK02"), never the full plate. */
  registration: string | null
  /** A slug from lib/locations.ts. */
  location_slug: string | null
  description: string | null
  /** Public photo URLs in display order; the first is the cover. */
  images: string[]
  source: 'wordpress' | 'admin' | string
  /** The car's old WordPress address, kept so old links still redirect. */
  source_url: string | null
  posted_at: string
  created_at: string
  updated_at: string
}

/** What the admin form sends. Everything the server sets itself is absent. */
export type CarInput = Omit<CarRow, 'id' | 'created_at' | 'updated_at' | 'posted_at' | 'source' | 'source_url'> & {
  posted_at?: string
}

/** Used by the importer, which also sets the id and provenance. */
export type CarUpsert = Partial<CarRow> & Pick<CarRow, 'id' | 'title'>

export const CAR_TABLE = 'used_cars'
export const CAR_PHOTO_BUCKET = 'car-photos'

/** One tag for every cached read of the stock, whichever source served it. */
export const INVENTORY_CACHE_TAG = 'inventory'

/** Choices offered by the admin form. Free text is still accepted by the table. */
export const FUELS = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'] as const
export const TRANSMISSIONS = ['Manual', 'Automatic'] as const
export const BODY_TYPES = [
  'Hatchback',
  'Premium Hatchback',
  'Sedan',
  'Compact SUV',
  'SUV',
  'Premium SUV',
  'MPV',
  'MUV',
] as const
export const CONDITIONS = ['Certified Used', 'Used Cars'] as const
