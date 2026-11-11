import { UsedHero } from "./used-hero"
import { Stock } from "./stock"
import { Browse } from "./browse"
import { Why } from "./why"
import { Services } from "./services"
import { Visit } from "./visit"
import { Voices } from "./voices"
import { ClosingCall } from "@/components/system/closing-call"
import type { InventoryFacets, InventoryVehicle } from "@/lib/inventory/types"

/**
 * The homepage of a used-car site, in the order a buyer needs it:
 *
 *   Hero      how many cars, a search, one real car at its real price
 *   Stock     the newest arrivals, then the lowest priced
 *   Browse    by budget, body type, make, fuel — every link with its count
 *   Why       four checkable reasons to buy here, and how buying works
 *   Services  exchange, finance, insure — what sits around a purchase
 *   Visit     where the cars are, when it is open, how to get there
 *   Voices    what buyers wrote, just before the last call
 *   Closing   call, WhatsApp, enquire
 *
 * WHAT CHANGED, AND WHY. This page used to be a profile of AM Group — hero on
 * the company's age and size, then divisions, the franchise register, and the
 * appointment journey — with the stock in the fifth band. It now leads with
 * the cars, because that is what the site sells. The company appears as the
 * reason to trust the stock (the Why band) rather than as the subject.
 *
 * The group bands are not deleted. Divisions, Marques, MarqueRail and Record
 * (the journey road) still exist in this folder, unmounted; the same content
 * is on /about and /automobile, which the Why band and the nav link to.
 *
 * Grounds alternate all the way down. Everything is a server component except
 * the stock rails and the enquiry buttons.
 */
export function Homepage({
  latest,
  bestValue,
  featured,
  vehicles,
  facets,
  total,
  degraded,
}: {
  latest: InventoryVehicle[]
  bestValue: InventoryVehicle[]
  featured: InventoryVehicle | null
  /** The whole stock, for counts only — it is never rendered as a list here. */
  vehicles: InventoryVehicle[]
  facets: InventoryFacets
  total: number
  degraded: boolean
}) {
  const live = !degraded && total > 0

  return (
    <>
      <UsedHero
        total={total}
        degraded={degraded}
        facets={facets}
        featured={featured}
        vehicles={vehicles}
      />
      <Stock vehicles={latest} bestValue={bestValue} total={total} degraded={degraded} />
      {live && <Browse facets={facets} vehicles={vehicles} />}
      <Why />
      <Services />
      <Visit />
      <Voices />
      <ClosingCall sourceLabel="home-closing" tone="light" />
    </>
  )
}
