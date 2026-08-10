/**
 * Debug harness for the Motors inventory integration.
 *
 *   node scripts/test-motors-inventory.ts                 # default: auto transport
 *   node scripts/test-motors-inventory.ts --transport=ajax
 *   node scripts/test-motors-inventory.ts --transport=html --per-page=6
 *   node scripts/test-motors-inventory.ts --json           # print the vehicles array only
 *
 * Talks to the live site. Uses the uncached client directly so results are
 * always a real sync, and imports by relative path so it runs under plain
 * `node` (Node >= 22 strips the TypeScript types natively) without Next.
 */

import { fetchInventory, getNonce, listingsUrl } from '../lib/integrations/motors/client.ts'
import type { MotorsVehicle } from '../lib/integrations/motors/types.ts'

const args = process.argv.slice(2)
const flag = (name: string): string | undefined =>
  args.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=')
const has = (name: string) => args.includes(`--${name}`)

const transport = (flag('transport') ?? 'auto') as 'auto' | 'ajax' | 'html'
const perPage = Number.parseInt(flag('per-page') ?? '50', 10)
const jsonOnly = has('json')

/** Fields we consider important enough that a null is worth reporting. */
const IMPORTANT: (keyof MotorsVehicle)[] = ['title', 'make', 'model', 'year', 'price', 'mileage', 'url']

function log(...a: unknown[]) {
  if (!jsonOnly) console.log(...a)
}

function rule(label = '') {
  log(label ? `\n─── ${label} ${'─'.repeat(Math.max(0, 62 - label.length))}` : '─'.repeat(66))
}

function inr(n: number | null): string {
  return n === null ? '—' : `₹${n.toLocaleString('en-IN')}`
}

async function main() {
  const started = Date.now()
  let requestFailures = 0

  rule('STEP 1-3  nonce acquisition')
  let nonce: string | null = null
  try {
    // Shown explicitly so the nonce lifecycle is visible when debugging.
    nonce = await getNonce({ forceRefresh: true })
    log(`  cache-busted GET : ${listingsUrl(1, { _: '<random>' }).toString()}`)
    log(`  nonce extracted  : ${nonce.slice(0, 4)}${'*'.repeat(Math.max(0, nonce.length - 4))} (masked, len ${nonce.length})`)
  } catch (err) {
    requestFailures++
    log(`  nonce acquisition FAILED: ${err instanceof Error ? err.message : String(err)}`)
    log('  (the html transport does not need one, so the sync can still succeed)')
  }

  rule('STEP 4-6  fetch + parse all pages')
  log(`  transport requested : ${transport}`)
  log(`  posts_per_page      : ${perPage}`)

  let result
  try {
    result = await fetchInventory({ transport, perPage })
  } catch (err) {
    requestFailures++
    console.error(`\n  SYNC FAILED: ${err instanceof Error ? err.message : String(err)}`)
    process.exitCode = 1
    return
  }

  const { vehicles } = result

  if (jsonOnly) {
    console.log(JSON.stringify(vehicles, null, 2))
    return
  }

  log(`  transport used      : ${result.transport}${result.usedFallback ? ' (fell back)' : ''}`)
  log(`  pages requested     : ${result.pagesRequested}`)
  log(`  elapsed             : ${Date.now() - started}ms`)

  rule('STEP 7  normalized JSON (first 3 listings)')
  console.log(JSON.stringify(vehicles.slice(0, 3), null, 2))

  rule('STEP 7b  all listings, one line each')
  for (const v of vehicles) {
    const discount =
      v.price !== null && v.originalPrice !== null && v.originalPrice > v.price
        ? ` (was ${inr(v.originalPrice)})`
        : ''
    log(
      `  ${String(v.id).padEnd(5)} ${(v.titleRaw || '—').padEnd(34)} ` +
        `${inr(v.price).padStart(12)}${discount.padEnd(18)} ` +
        `${String(v.mileage ?? '—').padStart(7)} km  ` +
        `${(v.fuel ?? '—').padEnd(9)} ${(v.transmission ?? '—').padEnd(10)} ` +
        `${String(v.images.length).padStart(2)} img`,
    )
  }

  rule('STEP 8  report')

  // --- totals ---------------------------------------------------------------
  const ids = vehicles.map((v) => v.id)
  const unique = new Set(ids)
  log(`  total reported by WordPress : ${result.total ?? 'not provided by this transport'}`)
  log(`  vehicles successfully parsed: ${vehicles.length}`)
  log(`  unique listing IDs          : ${unique.size}`)
  log(`  duplicate IDs discarded     : ${result.duplicateIds.length}${result.duplicateIds.length ? ` -> ${result.duplicateIds.join(', ')}` : ''}`)
  log(`  pages requested             : ${result.pagesRequested}`)
  log(`  request failures            : ${requestFailures}`)

  if (result.total !== null) {
    const match = result.total === vehicles.length
    log(`  total vs parsed             : ${match ? 'MATCH' : `MISMATCH (${vehicles.length} of ${result.total})`}`)
    if (!match) process.exitCode = 1
  }

  // --- missing fields --------------------------------------------------------
  rule('vehicles missing important fields')
  const missingByField = new Map<string, number[]>()
  for (const v of vehicles) {
    for (const f of IMPORTANT) {
      if (v[f] === null || v[f] === '') {
        if (!missingByField.has(f)) missingByField.set(f, [])
        missingByField.get(f)!.push(v.id)
      }
    }
    if (v.images.length === 0) {
      if (!missingByField.has('images')) missingByField.set('images', [])
      missingByField.get('images')!.push(v.id)
    }
  }
  if (missingByField.size === 0) {
    log('  none — every listing has all important fields')
  } else {
    for (const [field, listingIds] of missingByField) {
      log(`  ${field.padEnd(12)} missing on ${String(listingIds.length).padStart(2)}: ${listingIds.join(', ')}`)
    }
  }

  // --- optional fields, for context -----------------------------------------
  rule('optional field coverage')
  const cover = (label: string, n: number) =>
    log(`  ${label.padEnd(14)} ${String(n).padStart(3)}/${vehicles.length}`)
  cover('transmission', vehicles.filter((v) => v.transmission).length)
  cover('fuel', vehicles.filter((v) => v.fuel).length)
  cover('drivetrain', vehicles.filter((v) => v.drivetrain).length)
  cover('condition', vehicles.filter((v) => v.condition).length)
  cover('discounted', vehicles.filter((v) => v.isDiscounted).length)
  cover('has images', vehicles.filter((v) => v.images.length > 0).length)

  // --- sanity checks ---------------------------------------------------------
  rule('sanity checks')
  const negative = vehicles.filter((v) => v.price !== null && v.price <= 0)
  const priceAboveList = vehicles.filter(
    (v) => v.price !== null && v.originalPrice !== null && v.price > v.originalPrice,
  )
  const badUrl = vehicles.filter((v) => !v.url.startsWith('https://'))
  const badYear = vehicles.filter((v) => v.year !== null && (v.year < 1950 || v.year > 2100))
  const check = (label: string, bad: MotorsVehicle[]) =>
    log(`  ${bad.length === 0 ? 'PASS' : 'FAIL'}  ${label}${bad.length ? ` -> ${bad.map((v) => v.id).join(', ')}` : ''}`)
  check('all prices are positive', negative)
  check('no sale price exceeds its list price', priceAboveList)
  check('all URLs absolute https', badUrl)
  check('all years plausible', badYear)

  // --- parser issues ---------------------------------------------------------
  rule('parser issues')
  if (result.issues.length === 0) {
    log('  none')
  } else {
    for (const issue of result.issues) {
      log(`  [${issue.listingId ?? 'unknown'}] ${issue.field}: ${issue.detail}`)
    }
  }

  rule('warnings')
  log(result.warnings.length === 0 ? '  none' : result.warnings.map((w) => `  ${w}`).join('\n'))

  if (result.facets) {
    rule('facets (AJAX transport only)')
    for (const [taxonomy, opts] of Object.entries(result.facets).slice(0, 6)) {
      const top = opts
        .filter((o) => o.count !== null)
        .slice(0, 8)
        .map((o) => `${o.label}:${o.count}`)
        .join('  ')
      if (top) log(`  ${taxonomy.padEnd(14)} ${top}`)
    }
  }

  rule()
  log(`  done in ${Date.now() - started}ms`)
}

main().catch((err) => {
  console.error('unhandled failure:', err)
  process.exitCode = 1
})
