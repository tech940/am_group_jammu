import { Hero } from "./hero"
import { MarqueRail } from "./marque-rail"
import { Divisions } from "./divisions"
import { Marques } from "./marques"
import { Stock } from "./stock"
import { Services } from "./services"
import { Record } from "./record"
import { Voices } from "./voices"
import { Visit } from "./visit"
import { ClosingCall } from "@/components/system/closing-call"
import type { InventoryVehicle } from "@/lib/inventory/types"

/**
 * The homepage, in the order a stranger needs it:
 *
 *   Hero      who this is, how long they have been here, and three ways to act
 *   Rail      every marque's own mark — instant proof under the claim
 *   Divisions what the company actually does
 *   Marques   the franchise register, every appointment dated
 *   Stock     live certified cars — the commercial reason the site exists
 *   Services  insurance, sell-your-car, book-a-service — the non-buyer doors
 *   Record    the appointments and awards behind the claims
 *   Voices    what customers wrote
 *   Visit     where to go, when it is open, and the branch lead paths
 *   Closing   one loud final call, on glass
 *
 * Grounds alternate the whole way down and no two adjacent bands share one.
 * Three of them are photographic and dark — hero, record, closing — and those
 * are the only three that carry frosted panels, because glass over a flat
 * ground has nothing to refract and is just a bordered grey box. The five bands
 * between them are light and flat, which is what long-form registers, a stock
 * grid and an address block actually want to be read on.
 *
 * Everything here is a server component except two leaves (the stock rail's
 * enquire handler and the closing enquiry button), so the timeline, the
 * register, the award table and the addresses are all in the served HTML.
 */
export function Homepage({
  vehicles,
  total,
  degraded,
}: {
  vehicles: InventoryVehicle[]
  total: number
  degraded: boolean
}) {
  return (
    <>
      <Hero stockCount={degraded ? 0 : total} />
      <MarqueRail />
      <Divisions />
      <Marques />
      <Stock vehicles={vehicles} total={total} degraded={degraded} />
      <Services />
      <Record />
      <Voices />
      <Visit />
      <ClosingCall sourceLabel="home-closing" />
    </>
  )
}
