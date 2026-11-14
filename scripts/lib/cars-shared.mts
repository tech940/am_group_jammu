/**
 * Pieces the car importer and the parity check both need: reading the live
 * WordPress stock the way the site reads it, and finding out what state the
 * new table is in before anything depends on it.
 */

import './load-env.mts'

import { fetchInventory } from '../../lib/integrations/motors/client.ts'
import type { MotorsVehicle } from '../../lib/integrations/motors/types.ts'
import { toInventoryVehicle } from '../../lib/inventory/adapter.ts'
import type { InventoryVehicle } from '../../lib/inventory/types.ts'
import { readAllCars } from '../../lib/cars/store.ts'
import type { CarRow } from '../../lib/cars/types.ts'

export const MIGRATION_FILE = 'supabase/migrations/20261114120000_used_cars.sql'

export interface WordPressCar {
  raw: MotorsVehicle
  /** The same view model the public site renders today. */
  vehicle: InventoryVehicle
}

export interface WordPressStock {
  cars: WordPressCar[]
  total: number | null
  transport: string
  /** Fetch warnings and per-card parse problems, already worded for printing. */
  notes: string[]
}

/**
 * The live WordPress stock, mapped through the site's own adapter so body
 * type, colour, engine and the Petrol naming are derived exactly once, by the
 * same code the pages use.
 */
export async function fetchWordPressStock(): Promise<WordPressStock> {
  // The site uses 8s because a page render is waiting on it; a script can wait.
  const result = await fetchInventory({ timeoutMs: 30_000 })
  const notes = [
    ...result.warnings,
    ...result.issues.map((i) => `listing ${i.listingId ?? '?'}: ${i.field} - ${i.detail}`),
    ...(result.duplicateIds.length ? [`duplicate listing ids ignored: ${result.duplicateIds.join(', ')}`] : []),
  ]
  const cars = result.vehicles
    .map((raw) => ({ raw, vehicle: toInventoryVehicle(raw) }))
    .sort((a, b) => a.vehicle.id - b.vehicle.id)
  return { cars, total: result.total, transport: result.transport, notes }
}

export type TableState =
  | { state: 'no-env'; missing: string[] }
  | { state: 'absent' }
  | { state: 'unreachable'; message: string }
  | { state: 'ok'; rows: CarRow[] }

/**
 * What state is `used_cars` in? Read-only.
 *
 * The store answers "absent" both when the keys are missing and when the table
 * has not been created, and throws when the database cannot be reached. The
 * person running the script has a different thing to do in each case, so the
 * three are told apart here.
 */
export async function probeTable(): Promise<TableState> {
  const missing = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'].filter((k) => !process.env[k])
  if (missing.length) return { state: 'no-env', missing }
  try {
    // Every status, not just published: a draft or sold row is still a row the
    // importer must not write over.
    const read = await readAllCars()
    return read.state === 'ok' ? { state: 'ok', rows: read.rows } : { state: 'absent' }
  } catch (err) {
    return { state: 'unreachable', message: err instanceof Error ? err.message : String(err) }
  }
}

/** One plain sentence (or two) for each state that is not "ok". */
export function explainTableState(t: Exclude<TableState, { state: 'ok' }>): string {
  if (t.state === 'no-env') {
    return `The database is not configured: ${t.missing.join(' and ')} ${t.missing.length > 1 ? 'are' : 'is'} not set in .env.`
  }
  if (t.state === 'absent') {
    return (
      `The table public.used_cars does not exist yet. Apply the migration first:\n` +
      `  ${MIGRATION_FILE}\n` +
      `(paste it into the Supabase SQL editor, or run it with the Supabase CLI), then run this again.`
    )
  }
  return `The database is configured but did not answer: ${t.message}`
}

/** Fixed-width text table. Numeric columns are right-aligned. */
export function printTable(headers: string[], rows: string[][], rightAlign: number[] = []): void {
  const widths = headers.map((h, i) => Math.max(h.length, ...rows.map((r) => (r[i] ?? '').length)))
  const line = (cells: string[]) =>
    cells
      .map((c, i) => (rightAlign.includes(i) ? c.padStart(widths[i]) : c.padEnd(widths[i])))
      .join('  ')
      .trimEnd()
  console.log(line(headers))
  console.log(widths.map((w) => '-'.repeat(w)).join('  '))
  for (const r of rows) console.log(line(r))
}

export function rupees(n: number | null): string {
  return n === null ? '-' : n.toLocaleString('en-IN')
}
