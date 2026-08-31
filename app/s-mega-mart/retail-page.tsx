import { Band, Head, PageHero, Plate } from "@/components/system/page-kit"
import { ClosingCall } from "@/components/system/closing-call"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"
import {
  DotMatrix,
  GlowOrbs,
  GradientGround,
  Grain,
} from "@/components/system/backdrops"
import { getLocation } from "@/lib/locations"
import { DIVISIONS, FOUNDED } from "@/components/home/content"

/**
 * The retail division — S Mega Mart.
 *
 * The newest business and the thinnest page, deliberately. One store has
 * opened, the company has published one photograph of it, and no trading hours
 * or floor area. The previous version padded that out with a "Retail Mission"
 * and a grid of invented value propositions; this one says what exists and
 * marks what does not.
 *
 * BACKDROP SIGNATURE: the lightest on the site — one orb and a dot field. The
 * page has one band and one photograph, and a heavy treatment on a thin page
 * reads as compensation for having nothing to say.
 */
export function RetailPage() {
  const division = DIVISIONS.find((d) => d.key === "retail")!
  const srinagar = getLocation("srinagar")

  return (
    <>
      <PageHero
        eyebrow={`Retail division · since ${division.since}`}
        title={
          <>
            S Mega Mart,
            <br />
            Srinagar
          </>
        }
        lede={`The group's newest business and its first outside automotive and energy. Organised retail in the Kashmir Valley, opened in ${division.since}.`}
        image={SUPABASE_MEDIA.branches.smegamart.exterior}
        caption="S Mega Mart, Srinagar — the storefront."
        backdrop={
          <>
            <GlowOrbs orbs={[{ at: "26% 30%", size: "40%", strength: 0.26 }]} />
            <Grain onDeep />
          </>
        }
        stats={[
          { term: "Opened", detail: String(division.since), note: "the group's newest division" },
          { term: "Stores", detail: "1", note: "Srinagar" },
          { term: "Group divisions", detail: "4", note: "retail is the fourth" },
          {
            term: "Years since founding",
            detail: String(division.since - FOUNDED),
            note: `first non-automotive, non-fuel business`,
          },
        ]}
      />

      <Band
        ground="ground"
        labelledBy="retail-title"
        id="retail"
        backdrop={
          <>
            <GradientGround tone="light" angle="145deg" strength={0.7} />
            <DotMatrix cell={18} strength={0.06} fade="both" />
            <Grain />
          </>
        }
      >
        <Head
          id="retail-title"
          label="The store"
          title="Organised retail in the valley"
          lede="What the company has published about the division, without embellishment."
        />

        <div className="mt-14 grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div className="space-y-6 text-body-lg text-ink-2">
            <p>{division.summary}</p>
            <p>
              {`It is the only division that is not automotive or energy, and it is ${
                division.since - FOUNDED
              } years younger than the company itself — which makes it the clearest measure of where the group is expanding now.`}
            </p>

            {srinagar && (
              <div className="border-t border-line pt-6">
                <p className="text-meta uppercase text-ink-2">The group in Srinagar</p>
                <p className="mt-3 text-body text-ink">
                  {srinagar.streetAddress}, {srinagar.city} {srinagar.postalCode}
                </p>
                <p className="mt-1 text-small text-ink-2">
                  This is the group&apos;s Kashmir Valley office. The S Mega Mart store
                  address is a separate site and has not been published.
                </p>
              </div>
            )}

            <p className="border-t border-line pt-6 text-small text-ink-2">
              Store address, trading hours and departments are not published yet. They will
              appear here — and in the locations directory — when the company supplies
              them, rather than being estimated.
            </p>
          </div>

          <Plate
            src={SUPABASE_MEDIA.branches.smegamart.exterior}
            alt="The S Mega Mart storefront in Srinagar"
            caption="S Mega Mart, Srinagar — the only photograph the company has published of the store."
            ratio="aspect-[4/3]"
            sizes="(max-width: 1024px) 100vw, 45vw"
          />
        </div>
      </Band>

      <ClosingCall
        sourceLabel="retail-closing"
        heading="Ask about S Mega Mart"
        lede="For opening hours, stock or commercial enquiries about the store, the group office takes them directly."
        image={SUPABASE_MEDIA.branches.smegamart.exterior}
      />
    </>
  )
}
