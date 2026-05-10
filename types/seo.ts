export interface VehicleSEO {
  name: string
  description: string
  brand: string
  model: string
  engine: string
  fuelType: string
  image: string
  priceValue: string | number
}

export interface BrandSEO {
  name: string
  slug: string
  description?: string
  logo?: string
}
