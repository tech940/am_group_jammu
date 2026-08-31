import Link from "next/link"
import { Band, Head, Plate } from "@/components/system/page-kit"
import { Grain, GridLines, WaveRibbons } from "@/components/system/backdrops"
import { FRANCHISES } from "@/components/home/content"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"
import { ArrowGlyph } from "@/components/system/marks"

/**
 * The franchise register.
 *
 * This is genuinely tabular data — marque, trading entity, product type,
 * appointment year — so it is a real <table> with real headers, not a grid of
 * eight identical tiles. The appointment years are the point: a dealer who can
 * date every appointment is making a checkable claim, and a tile cannot say
 * that as economically as a column can.
 *
 * Chevrolet is in the register and ranked last, greyed and dated 2004–2017.
 * Dropping it would be tidier and less honest — the group still services those
 * cars, and the heritage row is why the group's franchise count reads 8 in the
 * archive and 7 in the present tense.
 */
const RANK: Record<string, number> = {
  "Passenger cars": 0,
  "Two-wheelers": 1,
  Heritage: 2,
}

export function Marques() {
  const rows = [...FRANCHISES].sort(
    (a, b) => RANK[a.category] - RANK[b.category] || a.since - b.since,
  )

  // The grid belongs on THIS band specifically: it is a table of appointments,
  // and a fine engineering grid is what tabular data is drawn on. Putting the
  // same grid on the reviews band would make it wallpaper.
  return (
    <Band
      ground="ground-2"
      labelledBy="marques-title"
      id="marques"
      backdrop={
        <>
          {/* Flat colour blocks and hard diagonal hatching were here and both
              are gone: at the low alpha a light ground needs, they read as a
              streaky wash rather than as structure. Broad filled ribbons carry
              the colour instead. */}
          {/* Four layers, not five. At five the deepest overlap measured ink-2
              4.46:1 — a hair under AA. Ribbons stack, so layer count is a
              contrast decision, not just a density one. */}
          <WaveRibbons id="marques" tone="light" layers={4} />
          <GridLines cell={56} strength={0.03} fade="both" />
          <Grain />
        </>
      }
    >
      <Head
        id="marques-title"
        label="Franchise register"
        title="Seven marques, every appointment dated"
        lede="Four passenger-car franchises and three two-wheeler franchises, held under six trading entities across Jammu and Srinagar."
      />

      <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div>
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              AM Group vehicle franchises, trading entity, product type and year of
              appointment.
            </caption>
            <thead>
              <tr className="border-y border-line-strong">
                <th scope="col" className="py-3 pr-4 text-meta uppercase text-ink-2">
                  Marque
                </th>
                <th scope="col" className="py-3 pr-4 text-meta uppercase text-ink-2">
                  Type
                </th>
                <th scope="col" className="py-3 text-right text-meta uppercase text-ink-2">
                  Appointed
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((franchise) => {
                const heritage = franchise.category === "Heritage"
                return (
                  <tr key={franchise.name} className="border-b border-line align-baseline">
                    <th scope="row" className="py-5 pr-4 font-normal">
                      {/* Current appointments link to their showroom pages at
                          the legacy slugs; the heritage row has no page to go
                          to, deliberately. */}
                      {franchise.slug ? (
                        <Link
                          href={`/${franchise.slug}`}
                          className="group/row block"
                        >
                          <span className="block font-display text-h3 uppercase text-ink transition-colors duration-(--duration-1) group-hover/row:text-accent">
                            {franchise.name}
                          </span>
                          <span className="mt-1 block text-small text-ink-2">
                            {franchise.entity}
                          </span>
                        </Link>
                      ) : (
                        <>
                          <span className="block font-display text-h3 uppercase text-ink-2">
                            {franchise.name}
                          </span>
                          <span className="mt-1 block text-small text-ink-2">
                            {franchise.entity}
                          </span>
                        </>
                      )}
                    </th>
                    <td className="py-5 pr-4 text-small text-ink-2">
                      {heritage ? "Ended 2017" : franchise.category}
                    </td>
                    <td
                      className={`py-5 text-right font-display text-h3 ${
                        heritage ? "text-ink-2" : "text-ink"
                      }`}
                    >
                      {franchise.since}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <p className="mt-6 max-w-[62ch] text-small text-ink-2">
            Chevrolet is listed because AM Group held the franchise from 2004 until
            General Motors left India in 2017, and still honours service on those cars.
            It is not a current appointment.
          </p>
        </div>

        <div>
          <Plate
            src={SUPABASE_MEDIA.branches["jammu-hyundai"].exterior}
            alt="The AM Hyundai flagship showroom building in Jammu"
            caption="AM Hyundai, Jammu — appointed 2008, the group's largest car business."
            ratio="aspect-[4/3]"
            sizes="(max-width: 1024px) 100vw, 42vw"
          />

          <Link
            href="/automobile"
            className="mt-8 inline-flex min-h-11 items-center gap-2 text-button uppercase text-accent-text-light transition-colors duration-(--duration-1) hover:text-accent-hover"
          >
            All showrooms and workshops
            <ArrowGlyph />
          </Link>
        </div>
      </div>
    </Band>
  )
}
