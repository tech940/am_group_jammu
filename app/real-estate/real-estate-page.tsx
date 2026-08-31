import { Band, Head, PageHero, Plate } from "@/components/system/page-kit"
import { ClosingCall } from "@/components/system/closing-call"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"
import {
  ConicSweep,
  Grain,
  GridLines,
  SteppedGradient,
} from "@/components/system/backdrops"
import { PRIMARY_LOCATION, formatAddress } from "@/lib/locations"
import { DIVISIONS } from "@/components/home/content"

/**
 * The property division.
 *
 * Rebuilt from a client component that hot-linked nine
 * `amgroupind.com/wp-content/...` images — including one of a Triumph
 * motorcycle showroom, which is not a property project and which the group has
 * not confirmed it holds a franchise for.
 *
 * The claim that survives from the old copy is the company's own: apartments,
 * villas, automotive dealerships and remodelling. What was cut is the
 * decoration around it ("luxurious residential villas", "a testament to our
 * commitment to excellence") — and the first-project year, which the company
 * has never published, is shown as an estimate rather than a fact.
 *
 * BACKDROP SIGNATURE: blueprint. Grid throughout, at a coarser cell than the
 * automobile page uses, plus stepped plates that read as storeys stacking. It is
 * the only route where the hard-edged set survives on a light ground, because a
 * drawing grid is exactly what this division works on.
 */
export function RealEstatePage() {
  const division = DIVISIONS.find((d) => d.key === "real-estate")!
  const gallery = SUPABASE_MEDIA.branches["real-estate"].gallery

  return (
    <>
      <PageHero
        eyebrow="Real estate division"
        title={
          <>
            The group builds
            <br />
            its own addresses
          </>
        }
        lede="AM Group develops commercial and residential property in Jammu — apartments, villas, dealership buildings and remodelling. The clearest example is the one the company works out of."
        image={SUPABASE_MEDIA.branches["real-estate"].exterior}
        caption="An AM Group development, Jammu."
        backdrop={
          <>
            <GridLines tone="deep" cell={72} strength={0.09} fade="none" />
            <ConicSweep at="76% 16%" tone="deep" strength={0.16} />
            <Grain onDeep />
          </>
        }
        stats={[
          {
            term: "Division active since",
            // The only honest form. content.ts marks this year a placeholder.
            detail: `c. ${division.since}`,
            note: "first-project year unpublished",
          },
          { term: "Flagship address", detail: "AM Business Park", note: "N-H 1 Bye-Pass, Jammu" },
          { term: "Build types", detail: "4", note: "apartments · villas · dealerships · remodelling" },
          { term: "Group divisions", detail: "4", note: "property is one of them" },
        ]}
      />

      {/* What the division builds --------------------------------------- */}
      <Band
        ground="ground"
        labelledBy="property-title"
        id="property"
        backdrop={
          <>
            <GridLines cell={72} strength={0.05} fade="both" />
            <SteppedGradient tone="light" angle="180deg" steps={6} strength={0.55} />
            <Grain />
          </>
        }
      >
        <Head
          id="property-title"
          label="Development"
          title="Commercial and residential"
          lede="Written from what the company publishes about the division, with nothing added."
        />

        <div className="mt-14 grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div className="space-y-6 text-body-lg text-ink-2">
            <p>{division.summary}</p>
            <p>
              The division builds apartments, villas and automotive dealerships, and takes
              on remodelling work. Several of the group&apos;s own showrooms are its
              projects, which is the most direct evidence of what it does — the buildings
              on the automobile page were developed in-house.
            </p>

            <div className="border-t border-line pt-6">
              <p className="text-meta uppercase text-ink-2">The group&apos;s own address</p>
              <p className="mt-3 text-body text-ink">{formatAddress(PRIMARY_LOCATION)}</p>
              <p className="mt-1 text-small text-ink-2">{PRIMARY_LOCATION.landmark}</p>
            </div>

            {/* Marked, not filled in. */}
            <p className="border-t border-line pt-6 text-small text-ink-2">
              A project list with completion dates has not been published by the company.
              Rather than estimate one, this page shows only the developments it can
              photograph and the address it can verify.
            </p>
          </div>

          <Plate
            src={gallery[0]}
            alt="An AM Group commercial development in Jammu"
            caption="AM Group development, Jammu."
            ratio="aspect-[4/3]"
            sizes="(max-width: 1024px) 100vw, 45vw"
          />
        </div>
      </Band>

      {/* The developments ------------------------------------------------ */}
      <Band
        ground="ground-2"
        labelledBy="projects-title"
        id="projects"
        backdrop={
          <>
            <GridLines cell={36} strength={0.035} fade="both" />
            <Grain />
          </>
        }
      >
        <Head
          id="projects-title"
          label="Photographed"
          title="What has been built"
          lede="Group developments the company has photographed. Captions name what is shown and nothing more."
        />

        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-3">
          {gallery.map((src, i) => (
            <Plate
              key={src}
              src={src}
              alt={`An AM Group property development in Jammu, view ${i + 1}`}
              caption={`Group development — plate ${i + 1} of ${gallery.length}.`}
              ratio="aspect-[4/3]"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ))}
        </div>
      </Band>

      <ClosingCall
        sourceLabel="real-estate-closing"
        heading="Talk about a project"
        lede="Development, commercial space and remodelling enquiries go to the corporate office at AM Business Park."
        image={gallery[1] ?? gallery[0]}
      />
    </>
  )
}
