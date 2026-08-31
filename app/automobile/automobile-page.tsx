import Link from "next/link"
import Image from "next/image"
import { Band, Head, PageHero, Plate } from "@/components/system/page-kit"
import { ClosingCall } from "@/components/system/closing-call"
import { StockRail } from "@/components/system/stock-rail"
import { Button } from "@/components/ui/button"
import { ArrowGlyph } from "@/components/system/marks"
import {
  DotMatrix,
  GradientMesh,
  Grain,
  GridLines,
  LightBeams,
  PerspectiveGrid,
  RadialWash,
  WaveEdge,
} from "@/components/system/backdrops"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"
import { PRIMARY_LOCATION, whatsappUrl } from "@/lib/locations"
import { FRANCHISES, CIRCUIT, SCALE } from "@/components/home/content"
import type { InventoryVehicle } from "@/lib/inventory/types"

/**
 * The automobile division.
 *
 * The page it replaces was marketing copy with nothing behind it — "Redefining
 * the Driving Experience", "Premium Fleet: curated selection of high-performance
 * and luxury vehicles", "Innovation: leading the transition to sustainable and
 * electric mobility". None of those four pillars was a fact about this business,
 * and the group does not sell high-performance luxury cars: it sells Hyundai,
 * Tata, Kia, MG, Bajaj, KTM and Honda.
 *
 * Everything on this page is now either a franchise appointment with a date, a
 * service the dealership actually performs, or a car physically in stock.
 *
 * BACKDROP SIGNATURE: grids and road. The vehicle division gets the most
 * technical set on the site — beams in the opener, a fine grid on the register,
 * and a perspective grid receding under the service list, which is the closest
 * the vocabulary comes to a road. No ribbons here; those are the softer routes.
 */

/** Ranked so current appointments lead and the heritage row closes. */
const RANK: Record<string, number> = {
  "Passenger cars": 0,
  "Two-wheelers": 1,
  Heritage: 2,
}

export function AutomobilePage({
  vehicles,
  total,
  degraded,
}: {
  vehicles: InventoryVehicle[]
  total: number
  degraded: boolean
}) {
  const marques = [...FRANCHISES].sort(
    (a, b) => RANK[a.category] - RANK[b.category] || a.since - b.since,
  )
  const current = marques.filter((m) => m.category !== "Heritage")
  const liveStock = !degraded && vehicles.length > 0

  return (
    <>
      <PageHero
        eyebrow="Automobile division · since 2004"
        title={
          <>
            Seven marques,
            <br />
            one group
          </>
        }
        lede="Four passenger-car franchises and three two-wheeler franchises, held under six trading entities across Jammu and Srinagar — with authorised service, genuine parts and certified pre-owned stock behind all of them."
        image={SUPABASE_MEDIA.branches["jammu-kia"].exterior}
        caption="AM Kia, Jammu — appointed 2024."
        backdrop={
          <>
            <GradientMesh tone="deep" />
            <LightBeams />
            <Grain onDeep />
          </>
        }
        stats={[
          { term: "Current franchises", detail: String(current.length), note: "plus Chevrolet, 2004–2017" },
          { term: "Dealership outlets", detail: String(SCALE.outlets), note: SCALE.cities.join(" · ") },
          { term: "First car franchise", detail: "2004", note: "Chevrolet" },
          {
            term: "Used cars in stock",
            detail: liveStock ? String(total) : "—",
            note: liveStock ? "certified, held in Jammu" : "stock feed unavailable",
          },
        ]}
        actions={
          <>
            <Button asChild variant="bright" size="lg">
              <Link href="/inventory">
                {liveStock ? `Browse ${total} used cars` : "Browse used cars"}
              </Link>
            </Button>
            <Button asChild variant="glass" size="lg">
              <a
                href={`tel:${PRIMARY_LOCATION.phoneE164}`}
                data-track-location="automobile-hero"
              >
                Call {PRIMARY_LOCATION.phone}
              </a>
            </Button>
            <Button asChild variant="glass" size="lg">
              <a
                href={whatsappUrl(
                  "Hi AM Group, I'd like to ask about a new car. Which showroom should I visit?",
                )}
                target="_blank"
                rel="noopener noreferrer"
                data-track-location="automobile-hero"
              >
                WhatsApp
              </a>
            </Button>
          </>
        }
      />

      {/* The marques ---------------------------------------------------- */}
      <Band
        ground="ground"
        labelledBy="marques-title"
        id="marques"
        backdrop={
          <>
            <GridLines cell={60} strength={0.045} fade="both" />
            <RadialWash at="10% 4%" strength={0.13} />
            <Grain />
          </>
        }
      >
        <Head
          id="marques-title"
          label="Franchise register"
          title="Every appointment dated"
          lede="The trading entity matters: each franchise is held by a named company, and that is the one you sign with."
        />

        <ul className="mt-14 grid grid-cols-1 gap-x-16 border-t border-line md:grid-cols-2">
          {marques.map((marque) => {
            const heritage = marque.category === "Heritage"
            return (
              <li
                key={marque.name}
                className="flex items-center gap-5 border-b border-line py-5"
              >
                {/* The heritage row gets a reserved plate, not a photograph.
                    content.ts carries a stand-in image for Chevrolet — the
                    franchise ended in 2017 and no photograph of it survives —
                    and rendering it put a Tata Motors storefront next to the
                    word CHEVROLET. A marked gap is honest; a wrong building is
                    not. */}
                {heritage ? (
                  <span className="flex h-16 w-24 shrink-0 items-center justify-center rounded-md border border-dashed border-line-strong bg-ground-2 text-meta uppercase text-ink-3">
                    No photo
                  </span>
                ) : (
                  <span className="relative block h-16 w-24 shrink-0 overflow-hidden rounded-md border border-line bg-ground-2">
                    <Image
                      src={marque.image}
                      alt=""
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span
                    className={`block font-display text-h3 uppercase ${
                      heritage ? "text-ink-2" : "text-ink"
                    }`}
                  >
                    {marque.name}
                  </span>
                  <span className="mt-0.5 block text-small text-ink-2">{marque.entity}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span
                    className={`block font-display text-h3 ${
                      heritage ? "text-ink-2" : "text-ink"
                    }`}
                    data-num
                  >
                    {marque.since}
                  </span>
                  <span className="block text-meta uppercase text-ink-2">
                    {heritage ? "Ended 2017" : marque.category}
                  </span>
                </span>
              </li>
            )
          })}
        </ul>

        <p className="mt-6 max-w-[68ch] text-small text-ink-2">
          Chevrolet is listed because AM Group held the franchise from 2004 until General
          Motors left India in 2017, and still honours service on those cars. It is not a
          current appointment, which is why the present-tense count on this page is seven.
        </p>
      </Band>

      {/* What the dealership actually does ------------------------------ */}
      {/* The perspective grid recedes toward a horizon, which is the nearest this
          vocabulary gets to a road — and this is the band about what happens
          when you drive in. */}
      <Band
        ground="ground-2"
        labelledBy="services-title"
        id="services"
        backdrop={
          <>
            <PerspectiveGrid tone="light" height="66%" />
            <RadialWash at="50% 0%" strength={0.1} />
            <Grain />
          </>
        }
      >
        <Head
          id="services-title"
          label="At the dealership"
          title="Six things we do under one roof"
          lede="Not a feature list — these are the desks that exist in the building, in the order most people meet them."
        />

        <ol className="mt-14 grid grid-cols-1 gap-x-16 border-t border-line md:grid-cols-2">
          {CIRCUIT.map((stop, i) => {
            const body = (
              <>
                <span className="flex items-baseline gap-4">
                  <span className="font-display text-h3 text-ink-3" data-num>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-h3 uppercase text-ink">{stop.label}</span>
                </span>
                <span className="mt-2 block text-body text-ink-2">{stop.detail}</span>
              </>
            )
            return (
              <li key={stop.label} className="border-b border-line py-6">
                {stop.href ? (
                  <Link
                    href={stop.href}
                    className="group block transition-colors duration-(--duration-1) hover:text-accent"
                  >
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </li>
            )
          })}
        </ol>
      </Band>

      {/* Live stock ------------------------------------------------------ */}
      {/* Quiet, like the homepage stock band: the cards carry photographs,
          prices and badges of their own. */}
      <Band
        ground="ground"
        labelledBy="stock-title"
        id="stock"
        backdrop={
          <>
            <RadialWash at="50% 0%" strength={0.08} />
            <Grain />
          </>
        }
      >
        <Head
          id="stock-title"
          label="Certified pre-owned"
          title={liveStock ? `${total} cars in stock now` : "Certified used cars"}
          lede="Every car is physically at the Jammu site and can be inspected without an appointment. Photographs and odometer readings are the dealership's own."
        />

        <div className="mt-12">
          {liveStock ? (
            <>
              <StockRail vehicles={vehicles} sourceLabel="automobile-stock-rail" />
              <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-8">
                <Button asChild variant="primary" size="lg">
                  <Link href="/inventory">See all {total} cars</Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/used-cars/jammu">Used cars in Jammu</Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="rounded-md border border-line bg-surface p-6 md:p-10">
              <h3 className="font-display text-h3 uppercase text-ink">
                Live stock is not loading right now
              </h3>
              <p className="mt-3 max-w-[60ch] text-body text-ink-2">
                The connection to the dealership&apos;s stock system is down, so we are not
                showing a list rather than showing one we cannot vouch for. Call or message
                and we will tell you exactly what is on the forecourt today.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild variant="primary" size="lg">
                  <a
                    href={`tel:${PRIMARY_LOCATION.phoneE164}`}
                    data-track-location="automobile-stock-degraded"
                  >
                    Call {PRIMARY_LOCATION.phone}
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </Band>

      {/* Where the buildings are ---------------------------------------- */}
      <Band
        ground="ground-2"
        labelledBy="showrooms-title"
        id="showrooms"
        backdrop={
          <>
            <WaveEdge side="top" ground="text-ground-2" />
            <DotMatrix cell={20} strength={0.06} fade="both" />
            <Grain />
          </>
        }
      >
        <Head
          id="showrooms-title"
          label="The buildings"
          title="Showrooms and workshops"
          lede="Sales and authorised service sit on the same sites. Directions and opening hours for every branch are on the locations page."
        />

        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          <Plate
            src={SUPABASE_MEDIA.branches["jammu-hyundai"].exterior}
            alt="The AM Hyundai showroom building in Jammu"
            caption="AM Hyundai, Jammu — appointed 2008, the group's largest car business."
            ratio="aspect-[4/3]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {/* NOT the srinagar-hyundai key: that file is a Tata Motors building
              despite its path. See the note in lib/supabase-media.ts. */}
          <Plate
            src={SUPABASE_MEDIA.branches["two-wheelers"].honda}
            alt="The Diamond Honda two-wheeler showroom"
            caption="Diamond Honda — two-wheelers, appointed 2010."
            ratio="aspect-[4/3]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <Plate
            src={SUPABASE_MEDIA.branches["luxury-showrooms"].mg}
            alt="The AMG Autocraft MG Motor dealership building in Jammu"
            caption="AMG Autocraft, Jammu — MG Motor, appointed 2024."
            ratio="aspect-[4/3]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>

        <Link
          href="/locations"
          className="mt-10 inline-flex min-h-11 items-center gap-2 text-button uppercase text-accent transition-colors duration-(--duration-1) hover:text-accent-hover"
        >
          Addresses, hours and directions
          <ArrowGlyph />
        </Link>
      </Band>

      <ClosingCall
        sourceLabel="automobile-closing"
        heading="Book a test drive"
        lede="Tell us which marque and we will have the car ready. Mon–Sat, 9:30 am to 6:30 pm."
        image={SUPABASE_MEDIA.branches["two-wheelers"].ktm}
      />
    </>
  )
}
