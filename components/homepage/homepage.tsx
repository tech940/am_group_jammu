import { UsedHero } from "./used-hero"
import { Doors } from "./doors"
import { Stock } from "./stock"
import { Browse } from "./browse"
import { Why } from "./why"
import { Visit } from "./visit"
import { Answers } from "./answers"
import { ClosingCall } from "@/components/system/closing-call"
import type { InventoryFacets, InventoryVehicle } from "@/lib/inventory/types"
import type { Facet } from "@/lib/seo/landing"

/**
 * The homepage of a used-car shop in Jammu, for two people: someone buying a
 * car and someone selling one.
 *
 *   Hero     the showroom photograph, the live count, one search row
 *   Doors    Buy a car / Sell your car, then six service tiles
 *   Stock    the newest arrivals, then the lowest priced
 *   Browse   by budget, body type, make, fuel — every link with its count
 *   Why      four checkable reasons to buy here, and how buying works
 *   Visit    the three Jammu sites, and one phone number for all of them
 *   Answers  the dealer's basic facts in plain sentences, and the questions
 *            today's stock list can answer
 *
 * Voices (customer reviews) is deliberately NOT mounted: the three reviews in
 * content.ts are of the AM Hyundai new-car showroom and its sales advisors.
 * They are real, but they are not reviews of this used-car business, and
 * presenting them here would imply they are. Remount when the company
 * supplies used-car reviews.
 *
 *   Closing  call, WhatsApp, enquire
 *
 * The structure follows the managing director's reference (a photo hero with
 * a search, two large Buy / Sell tiles, a grid of service tiles, a bottom tab
 * bar on phones) in this project's own palette and type. See DESIGN.md,
 * "Used-car storefront".
 *
 * This is not the company website. Nothing mounted here describes the group's
 * other businesses, other cities or new-car franchises. The older group bands
 * (hero, hero-gallery, marque-rail, divisions, marques, record, journey-*)
 * are still in this folder, unmounted.
 *
 * Grounds alternate all the way down. Everything is a server component except
 * the stock rails and the tiles and buttons that open the enquiry form.
 */
export function Homepage({
  latest,
  bestValue,
  vehicles,
  facets,
  total,
  degraded,
  landingHref,
}: {
  latest: InventoryVehicle[]
  bestValue: InventoryVehicle[]
  /** The whole stock, for counts only — it is never rendered as a list here. */
  vehicles: InventoryVehicle[]
  facets: InventoryFacets
  total: number
  degraded: boolean
  /** The indexable page for a facet, or null; see lib/seo/landing.ts. */
  landingHref: (facet: Facet) => string | null
}) {
  const live = !degraded && total > 0

  return (
    <>
      <UsedHero total={total} degraded={degraded} facets={facets} vehicles={vehicles} />
      <Doors total={total} priceFrom={facets.priceRange.min} live={live} />
      <Stock vehicles={latest} bestValue={bestValue} total={total} degraded={degraded} />
      {live && <Browse facets={facets} vehicles={vehicles} landingHref={landingHref} />}
      <Why />
      <Visit />
      <Answers facets={facets} vehicles={vehicles} total={live ? total : 0} />
      <ClosingCall sourceLabel="home-closing" />
    </>
  )
}
