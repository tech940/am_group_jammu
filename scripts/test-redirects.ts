/**
 * Verifies the legacy WordPress -> Next.js redirect map against LIVE data.
 *
 *   node scripts/test-redirects.ts
 *   node scripts/test-redirects.ts --sitemap    # re-fetch the WP sitemap first
 *
 * Two things are checked, and both matter for the migration:
 *
 *   1. Every /listings/ URL in the live WordPress sitemap resolves to a real
 *      vehicle page — not to a fallback. A fallback here means a car in the
 *      index would lose its page.
 *   2. No two distinct legacy URLs resolve to the SAME vehicle. That is the
 *      failure mode the emoji-bearing slugs invite, and it is silent: the
 *      redirect still 301s, it just sends the wrong car.
 *
 * Imports by relative path so it runs under plain `node` (Node >= 22 strips the
 * TypeScript types natively) without the Next runtime.
 */

import { fetchInventory } from '../lib/integrations/motors/client.ts'
import { buildFacets, toInventoryVehicle } from '../lib/inventory/adapter.ts'
import { resolveLegacyListing } from '../lib/seo/legacy-listing-urls.ts'

const SITE = 'https://amgroupind.com'

const args = process.argv.slice(2)
const refetch = args.includes('--sitemap')

let failures = 0
const fail = (msg: string) => {
  failures++
  console.log(`  FAIL  ${msg}`)
}

function rule(label = '') {
  console.log(label ? `\n─── ${label} ${'─'.repeat(Math.max(0, 62 - label.length))}` : '─'.repeat(66))
}

/** Pull the live /listings/ URLs straight from the WordPress sitemap. */
async function legacyListingUrls(): Promise<string[]> {
  const res = await fetch(`${SITE}/listings-sitemap.xml`, {
    headers: { 'User-Agent': 'AMGroupMigration/1.0' },
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) throw new Error(`sitemap HTTP ${res.status}`)
  const xml = await res.text()
  return [...xml.matchAll(/<loc>\s*(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?\s*<\/loc>/g)]
    .map((m) => m[1].trim())
    .filter((u) => u.includes('/listings/'))
}

/** Final path segment, decoded, matching what the router hands the route. */
function finalSegment(url: string): string {
  const path = decodeURIComponent(new URL(url).pathname)
  return path.replace(/\/+$/, '').split('/').pop() ?? ''
}

rule('Fetching live data')
const [{ vehicles: raw }, urls] = await Promise.all([
  fetchInventory({ perPage: 50 }),
  refetch ? legacyListingUrls() : legacyListingUrls(),
])
const vehicles = raw.map(toInventoryVehicle)
const facets = buildFacets(vehicles)
console.log(`  ${vehicles.length} vehicles in stock`)
console.log(`  ${urls.length} /listings/ URLs in the WordPress sitemap`)

rule('Resolving every legacy listing URL')
const hits = new Map<string, string[]>()

for (const url of urls) {
  const segment = finalSegment(url)
  const r = resolveLegacyListing(segment, vehicles, facets)

  if (r.kind === 'vehicle') {
    const list = hits.get(r.destination) ?? []
    list.push(url)
    hits.set(r.destination, list)
    console.log(`  ok    ${segment}\n        -> ${r.destination}  (${r.via})`)
  } else {
    fail(`${segment}\n        -> ${r.destination}  (fallback: ${r.via}) — expected a vehicle page`)
  }
}

rule('Checking for collisions')
let collisions = 0
for (const [dest, sources] of hits) {
  if (sources.length > 1) {
    collisions++
    fail(`${sources.length} legacy URLs all resolve to ${dest}:`)
    for (const s of sources) console.log(`          ${decodeURIComponent(s)}`)
  }
}
if (collisions === 0) console.log(`  ok    ${hits.size} destinations, all distinct`)

rule('Numeric ID form')
for (const v of vehicles.slice(0, 3)) {
  const r = resolveLegacyListing(String(v.id), vehicles, facets)
  if (r.kind === 'vehicle' && r.vehicle.id === v.id) {
    console.log(`  ok    /listings/${v.id}/ -> ${r.destination}`)
  } else {
    fail(`/listings/${v.id}/ resolved to ${r.destination}`)
  }
}

rule('Sold-car fallbacks (URLs no longer in stock)')
const retired = [
  '🚗-hyundai-creta-1-5-crdi-sx-sold',
  '🚘-kia-seltos-htx-plus-sold',
  '🚙-maruti-suzuki-swift-vdi',
  'some-totally-unknown-listing',
]
for (const segment of retired) {
  const r = resolveLegacyListing(segment, vehicles, facets)
  console.log(`  ${segment}\n        -> ${r.destination}  (${r.kind === 'fallback' ? r.via : r.via})`)
  if (r.destination.startsWith('/used-cars/') || r.destination.startsWith('/brands/')) {
    // Good: stayed topical instead of dumping on /inventory.
  } else if (r.destination !== '/inventory') {
    fail(`unexpected fallback destination ${r.destination}`)
  }
}

rule('Slug ending in digits must NOT be read as an ID')
const trap = 'carens-g1-5-dct-luxary-plus-7'
const trapped = resolveLegacyListing(trap, vehicles, facets)
if (trapped.kind === 'vehicle' && trapped.via !== 'id') {
  console.log(`  ok    ${trap} -> ${trapped.destination} (${trapped.via}, not misread as listing #7)`)
} else {
  fail(`${trap} resolved via '${trapped.via}' to ${trapped.destination} — trailing digits misread as an ID`)
}

rule()
console.log(failures === 0 ? `PASS — ${urls.length} legacy URLs, 0 failures` : `FAIL — ${failures} problem(s)`)
process.exit(failures === 0 ? 0 : 1)
