/**
 * Stored car row -> the view model every public page renders.
 *
 * The price and discount rules are NOT restated here. A row is first shaped
 * like the old WordPress record and then passed through the same
 * `toInventoryVehicle` the WordPress path uses, so "what counts as a credible
 * discount", the rupee formatting and the Petrol naming have exactly one
 * definition whichever source the car came from.
 */

import { toInventoryVehicle } from '../inventory/adapter.ts'
import type { InventoryVehicle } from '../inventory/types.ts'
import type { MotorsVehicle } from '../integrations/motors/types.ts'
import type { CarRow } from './types.ts'

export function carRowToInventoryVehicle(row: CarRow): InventoryVehicle {
  const images = (row.images ?? []).filter(Boolean)
  const hasHigher =
    row.price !== null && row.original_price !== null && row.original_price > row.price

  const asMotors: MotorsVehicle = {
    id: Number(row.id),
    title: row.title,
    titleRaw: row.year ? `${row.title} ${row.year}` : row.title,
    make: row.make,
    model: row.model,
    year: row.year,
    price: row.price === null ? null : Number(row.price),
    originalPrice: row.original_price === null ? null : Number(row.original_price),
    isDiscounted: hasHigher,
    mileage: row.mileage_km,
    fuel: row.fuel,
    transmission: row.transmission,
    drivetrain: row.drivetrain,
    condition: row.condition,
    url: row.source_url ?? '',
    images,
    primaryImage: images[0] ?? null,
    photoCount: images.length,
    postedAt: row.posted_at,
    // Body type, colour and engine are real columns here, so there is nothing
    // to recognise from taxonomy slugs.
    taxonomies: {},
  }

  return {
    ...toInventoryVehicle(asMotors),
    bodyType: row.body_type,
    colour: row.colour,
    engine: row.engine,
  }
}
