/**
 * GET /api/vehicles/<id>
 *
 * One car on sale, by its number ("5099") or by its page slug
 * ("hyundai-alcazar-2022-5099"). A slug is matched on the number it ends in —
 * the same rule the car page uses — so an edited title does not break a link;
 * the `slug` in the response is the current one.
 *
 * 404 when no car on sale has that number. A draft or sold car is a 404 too:
 * it is not in the public snapshot, so this route cannot tell it apart from a
 * car that never existed, and a visitor is not entitled to more than that.
 */

import type { NextRequest } from 'next/server'
import { getInventory, getInventorySource, getVehicleBySlug } from '@/lib/inventory/server'
import { CACHE_OK, toPublicVehicle, unavailable } from '../public-vehicle'

export const maxDuration = 30

export async function GET(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params

  // Checked before the lookup: getVehicleBySlug turns an outage into "no such
  // car", and answering 404 for a car that is still on sale would be wrong.
  const [snapshot, source] = await Promise.all([getInventory(), getInventorySource()])
  if (snapshot.degraded || source === 'unavailable') return unavailable(snapshot)

  const { vehicle } = await getVehicleBySlug(id)
  if (!vehicle) {
    return Response.json(
      { error: 'not_found', message: 'No car on sale has that id.' },
      // Not cached: a car published a moment from now must not stay "missing".
      { status: 404, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  return Response.json(
    { source, fetchedAt: snapshot.fetchedAt, vehicle: toPublicVehicle(vehicle) },
    { headers: { 'Cache-Control': CACHE_OK } },
  )
}
