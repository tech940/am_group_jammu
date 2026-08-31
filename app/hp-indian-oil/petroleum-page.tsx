import { Band, Head, PageHero, Plate } from "@/components/system/page-kit"
import { ClosingCall } from "@/components/system/closing-call"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"
import {
  Aurora,
  Grain,
  WaveEdge,
  WaveField,
  WaveRibbons,
} from "@/components/system/backdrops"
import { FOUNDED, YEARS_TRADING, TIMELINE } from "@/components/home/content"

/**
 * The petroleum division — where the company started.
 *
 * The page it replaces hot-linked three `amgroupind.com/wp-content/...`
 * photographs from the WordPress site being decommissioned, and filled its body
 * with four unverifiable claims: "Premium Fuel — high-octane and
 * additives-enriched fuels for better engine life", "Certified volume and
 * quality checks for absolute transparency", and so on. Fuel grades and volume
 * certification are the oil marketing companies' claims to make, not a
 * dealer's, and the group has published nothing to support them.
 *
 * What is left is what the company has actually published: two appointments,
 * both dated, and the photography this app owns.
 *
 * BACKDROP SIGNATURE: flow. Ribbons and wave fields throughout — this is the
 * one division whose product literally moves through pipes and hoses, and it is
 * the only route that uses the wave vocabulary on every band.
 */
export function PetroleumPage() {
  const hp = TIMELINE.find((m) => m.year === FOUNDED)
  const iocl = TIMELINE.find((m) => m.title === "Indian Oil")
  const gallery = SUPABASE_MEDIA.branches.petroleum.gallery

  return (
    <>
      <PageHero
        eyebrow={`Petroleum division · since ${FOUNDED}`}
        title={
          <>
            The business
            <br />
            that came first
          </>
        }
        lede={`Before the showrooms, before the property, there was fuel. AM Group's Hindustan Petroleum appointment in ${FOUNDED} is the oldest thing the company does, and the reason every other division exists.`}
        image={SUPABASE_MEDIA.branches.petroleum.exterior}
        caption="An AM Group forecourt in Jammu & Kashmir."
        backdrop={
          <>
            <Aurora />
            <WaveField tone="deep" lines={7} amplitude={34} strength={0.14} />
            <Grain onDeep />
          </>
        }
        stats={[
          { term: "Hindustan Petroleum", detail: String(FOUNDED), note: "the founding appointment" },
          { term: "Indian Oil", detail: "1977", note: "nine years later" },
          { term: "Years in fuel", detail: String(YEARS_TRADING), note: "unbroken" },
          { term: "Divisions since", detail: "3", note: "automobile · property · retail" },
        ]}
      />

      {/* What the division does ----------------------------------------- */}
      <Band
        ground="ground"
        labelledBy="petroleum-title"
        id="petroleum"
        backdrop={
          <>
            <WaveEdge side="top" ground="text-ground" />
            <WaveRibbons id="fuel-a" tone="light" layers={4} />
            <Grain />
          </>
        }
      >
        <Head
          id="petroleum-title"
          label="Fuel retail"
          title="Two oil marketing companies"
          lede="AM Group holds dealer appointments from both Hindustan Petroleum and Indian Oil, and operates forecourts under each."
        />

        <div className="mt-14 grid grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <dl className="border-t border-line">
            {[hp, iocl].filter(Boolean).map((entry) => (
              <div
                key={entry!.year}
                className="flex items-baseline justify-between gap-6 border-b border-line py-6"
              >
                <div className="min-w-0">
                  <dt className="font-display text-h3 uppercase text-ink">{entry!.title}</dt>
                  <dd className="mt-1 text-body text-ink-2">{entry!.note}</dd>
                </div>
                <dd className="shrink-0 font-display text-h2 text-ink" data-num>
                  {entry!.year}
                </dd>
              </div>
            ))}
          </dl>

          <div className="space-y-6 text-body-lg text-ink-2">
            <p>
              {`The group distributes for both companies and runs their retail outlets across the region. It is the least visible part of AM Group and the longest-running: ${YEARS_TRADING} years without a break, through every change in the businesses built on top of it.`}
            </p>
            <p>
              Fuel grades, pricing and volume standards at these forecourts are set by
              Hindustan Petroleum and Indian Oil, not by the dealer. We do not make claims
              on their behalf.
            </p>
            {/* An honest gap, marked as one. DESIGN.md: mark placeholders
                visibly rather than filling them with plausible copy. */}
            <p className="border-t border-line pt-6 text-small text-ink-2">
              Station addresses and opening hours for the petroleum outlets have not been
              published by the company yet. When they are, they will appear here and in
              the locations directory rather than being estimated.
            </p>
          </div>
        </div>
      </Band>

      {/* The forecourts -------------------------------------------------- */}
      <Band
        ground="ground-2"
        labelledBy="forecourts-title"
        id="forecourts"
        backdrop={
          <>
            <WaveRibbons id="fuel-b" tone="light" layers={4} flip strength={0.8} />
            <WaveField tone="light" lines={8} amplitude={22} strength={0.07} />
            <Grain />
          </>
        }
      >
        <Head
          id="forecourts-title"
          label="The sites"
          title="On the forecourt"
          lede="Photography of the group's own stations. Every image here is hosted by this application — nothing is hot-linked from the old site."
        />

        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-3">
          {gallery.map((src, i) => (
            <Plate
              key={src}
              src={src}
              alt={`AM Group fuel station forecourt in Jammu & Kashmir, view ${i + 1}`}
              caption={`AM Group forecourt — plate ${i + 1} of ${gallery.length}.`}
              ratio="aspect-[4/3]"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ))}
        </div>
      </Band>

      <ClosingCall
        sourceLabel="petroleum-closing"
        heading="Ask about the fuel business"
        lede="For dealership, supply or commercial fuel enquiries, the corporate office in Jammu takes them directly."
        image={SUPABASE_MEDIA.branches.petroleum.exterior}
      />
    </>
  )
}
