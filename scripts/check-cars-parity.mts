/**
 * Parity check: do the published cars in our database say the same thing as
 * the live WordPress stock?
 *
 *   npm run cars:parity
 *
 * Run it straight after the import, before WordPress is switched off. Both
 * sides are turned into the view model the pages render (the database through
 * carRowToInventoryVehicle, WordPress through toInventoryVehicle), so what is
 * compared is what a buyer would see, not how each side happens to store it.
 *
 * Read-only. Exit code 0 when the two agree, 1 on any difference or when the
 * comparison could not be made.
 *
 * Once cars are being edited in the admin, differences are expected - that is
 * the database doing its job, not a fault.
 */

import './lib/load-env.mts'

import { carRowToInventoryVehicle } from '../lib/cars/mapper.ts'
import { readPublishedCars } from '../lib/cars/store.ts'
import { buildSlug } from '../lib/inventory/adapter.ts'
import type { InventoryVehicle } from '../lib/inventory/types.ts'
import { explainTableState, fetchWordPressStock, probeTable, printTable } from './lib/cars-shared.mts'

/** The fields compared, each as the value a page would show. */
const FIELDS: { name: string; pick: (v: InventoryVehicle) => string | number | null }[] = [
  { name: 'slug', pick: (v) => buildSlug(v) },
  { name: 'price', pick: (v) => v.price },
  { name: 'original price', pick: (v) => v.originalPrice },
  { name: 'km', pick: (v) => v.mileage },
  { name: 'fuel', pick: (v) => v.fuel },
  { name: 'body type', pick: (v) => v.bodyType },
  // The number of photos in the gallery. Not the WordPress card badge, which
  // is a separate figure and has no counterpart in the database.
  { name: 'photo count', pick: (v) => v.images.length },
]

const show = (x: string | number | null) => (x === null ? '(none)' : String(x))

async function main(): Promise<number> {
  // probeTable tells "keys missing", "table missing" and "database down"
  // apart; the store's own read cannot.
  const table = await probeTable()
  if (table.state !== 'ok') {
    console.error(`Cannot compare.\n${explainTableState(table)}`)
    return 1
  }
  if (table.rows.length === 0) {
    console.error(
      'Cannot compare: the table public.used_cars exists but is empty. Nothing has been imported yet ' +
        '(npm run cars:import -- --apply), and the site is still reading WordPress.',
    )
    return 1
  }

  const published = await readPublishedCars()
  if (published.state !== 'ok') {
    console.error('Cannot compare: the table stopped answering between two reads.')
    return 1
  }
  const dbCars = new Map(published.rows.map((r) => [r.id, carRowToInventoryVehicle(r)]))
  const notPublished = table.rows.filter((r) => r.status !== 'published')

  const stock = await fetchWordPressStock()
  const wpCars = new Map(stock.cars.map((c) => [c.vehicle.id, c.vehicle]))

  console.log(`Database : ${dbCars.size} published car(s)${notPublished.length ? `, plus ${notPublished.length} draft or sold` : ''}.`)
  console.log(`WordPress: ${wpCars.size} listing(s) via the ${stock.transport} transport.`)
  for (const note of stock.notes) console.log(`  note: ${note}`)

  if (wpCars.size === 0) {
    console.error('\nCannot compare: WordPress returned no listings.')
    return 1
  }

  // 1. The set of ids.
  const statusOf = new Map(notPublished.map((r) => [r.id, r.status]))
  const onlyWordPress = [...wpCars.keys()].filter((id) => !dbCars.has(id)).sort((a, b) => a - b)
  const onlyDatabase = [...dbCars.keys()].filter((id) => !wpCars.has(id)).sort((a, b) => a - b)

  if (onlyWordPress.length) {
    console.log(`\nOn WordPress but not published in the database (${onlyWordPress.length}):`)
    for (const id of onlyWordPress) {
      const status = statusOf.get(id)
      console.log(`  ${id}  ${wpCars.get(id)!.title}${status ? `  - in the database as ${status}` : '  - not in the database'}`)
    }
  }
  if (onlyDatabase.length) {
    console.log(`\nPublished in the database but not on WordPress (${onlyDatabase.length}):`)
    for (const id of onlyDatabase) console.log(`  ${id}  ${dbCars.get(id)!.title}`)
  }

  // 2. Field by field, for cars on both sides.
  const rows: string[][] = []
  let carsDiffering = 0
  let compared = 0
  for (const [id, wp] of [...wpCars.entries()].sort((a, b) => a[0] - b[0])) {
    const db = dbCars.get(id)
    if (!db) continue
    compared++
    let differs = false
    for (const field of FIELDS) {
      const a = field.pick(wp)
      const b = field.pick(db)
      if (a !== b) {
        differs = true
        rows.push([String(id), wp.title, field.name, show(a), show(b)])
      }
    }
    if (differs) carsDiffering++
  }

  if (rows.length) {
    console.log(`\nField differences (${rows.length} across ${carsDiffering} car(s)):`)
    printTable(['id', 'title', 'field', 'WordPress', 'database'], rows, [0])
  }

  const differences = onlyWordPress.length + onlyDatabase.length + rows.length
  if (differences === 0) {
    console.log(`\nParity: all ${compared} car(s) match on id, ${FIELDS.map((f) => f.name).join(', ')}.`)
    return 0
  }
  console.log(
    `\nNOT in parity: ${onlyWordPress.length} only on WordPress, ${onlyDatabase.length} only in the database, ` +
      `${rows.length} field difference(s) across ${carsDiffering} of ${compared} car(s) on both sides.`,
  )
  return 1
}

main()
  .then((code) => {
    process.exitCode = code
  })
  .catch((err) => {
    console.error('The parity check stopped on an error:', err instanceof Error ? err.message : err)
    process.exitCode = 1
  })
