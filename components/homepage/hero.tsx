import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plate } from "@/components/system/page-kit"
import {
  Aurora,
  GlowOrbs,
  GradientMesh,
  Grain,
  LightBeams,
  Veil,
  WaveRibbons,
} from "@/components/system/backdrops"
import { CursorGlow } from "@/components/system/backdrop-motion"
import { RuleDraw } from "@/components/system/rule-draw"
import { ScrollDrift } from "@/components/system/scroll-drift"
import { AM_KIA_SHOWROOM } from "@/lib/supabase-media"
import { FOUNDED, YEARS_TRADING, SCALE } from "@/components/home/content"
import { PRIMARY_LOCATION, whatsappUrl } from "@/lib/locations"

/**
 * The opening claim, and the first lead path — now built on a gradient rather
 * than on a photograph.
 *
 * Three consequences of that change, none of them cosmetic:
 *
 * 1. THE GLASS PANEL IS GONE. Glass needs something behind it to refract; over a
 *    gradient it is a bordered grey box, which is the rule this system already
 *    holds itself to (DESIGN.md, Glass). The type sits directly on the gradient
 *    instead — and because every stop here is authored rather than photographed,
 *    the contrast floor is *known* rather than defended against. That was the
 *    whole reason the panel existed.
 *
 * 2. THE PHOTOGRAPH BECOMES CONTENT. It is the evidence that this is a real
 *    company with a real building, which is the page's entire argument, so it
 *    stays — as a bordered captioned plate, which is what DESIGN.md says
 *    photography is. It is no longer load-bearing for legibility.
 *
 * 3. THE LEDGER IS RULED, NOT FROSTED. Hairlines on the gradient, for the same
 *    reason as (1).
 *
 * Call, WhatsApp and browse-stock stay in the first viewport. The previous
 * homepage carried no `tel:` or `wa.me` anchor on its entire 19,000px, so the
 * delegated LinkTracker recorded nothing and the page produced no attributable
 * leads at all.
 */
export function Hero({ stockCount }: { stockCount: number }) {
  const waMessage =
    "Hi AM Group, I found you through your website. Can you help me with a car?"

  const ledger = [
    { term: "Founded", detail: String(FOUNDED), note: "Hindustan Petroleum, Jammu" },
    // SEVEN, not eight. FRANCHISES holds 8 rows because Chevrolet (2004–2017)
    // is carried as heritage; anything in the present tense says seven.
    { term: "Current franchises", detail: "7", note: "plus Chevrolet, held 2004–2017" },
    {
      term: "Cities served",
      detail: String(SCALE.cities.length),
      note: SCALE.cities.join(" · "),
    },
    {
      term: "Used cars in stock",
      // Never a fabricated figure. A degraded sync renders an em dash, which the
      // stock band then explains in words.
      detail: stockCount > 0 ? String(stockCount) : "—",
      note: stockCount > 0 ? "certified, held in Jammu" : "stock feed unavailable",
    },
  ]

  return (
    <section
      aria-labelledby="hero-title"
      data-ground="deep"
      className="relative isolate overflow-hidden bg-deep-2"
    >
      {/*
        The gradient, bottom to top. Six layers and not one photograph:

          1  gradient mesh     four soft radials, the base colour field
          2  wave ribbons      broad filled sheets, the structure in the field
          3  aurora (animated) slow movement across 28s, reduced-motion gated
          4  glow orbs         two points of light, one behind each column
          5  light beams       directional streaks
          6  cursor glow       follows a fine pointer only
          7  veil              seats the whole stack on a known floor
          8  grain             over everything, unifying the stack

        All of it is built from `accent` and `accent-bright` — the same two ends
        of the one hue the buttons use. None of it uses filter: blur().
      */}
      <GradientMesh tone="deep" />
      <WaveRibbons id="hero" tone="deep" layers={5} strength={0.9} />
      <Aurora animate />
      <GlowOrbs
        orbs={[
          { at: "18% 34%", size: "42%", strength: 0.26 },
          { at: "82% 66%", size: "34%", strength: 0.16 },
        ]}
      />
      <LightBeams />
      <CursorGlow strength={0.14} />
      {/* Five sources of light accumulate. Untreated, the brightest region
          measured on-deep-2 2.91:1 — under AA — so the stack is seated on a
          floor, the same way a photograph is seated under `.photo-scrim`.

          0.54 is solved, not chosen. The first solve (0.40) fixed the headline
          region but not the ledger, which sits where the second glow orb and the
          mesh's bottom radial peak together. Backing out the pre-veil colour and
          re-solving against THAT point gave 0.50, which still landed the worst
          pixel at 4.47:1 — inside measurement noise of the 4.5 threshold, which
          is not a pass. 0.54 puts it at 5.3:1 and costs almost nothing
          visually. */}
      <Veil strength={0.54} />
      <Grain onDeep animate />

      <div className="relative mx-auto max-w-[1400px] px-5 pb-14 pt-28 md:px-10 md:pb-20 md:pt-36">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.08fr_1fr] lg:gap-16">
          <div>
            <p className="flex items-center gap-4 text-meta uppercase text-on-deep-2">
              <RuleDraw className="w-10 bg-accent-bright" />
              Jammu &amp; Kashmir · since {FOUNDED}
            </p>

            {/* The heading IS the data. Every line is a figure this site can show
                its working for, which is the whole argument of the page. */}
            <h1
              id="hero-title"
              className="mt-7 font-display text-display uppercase text-on-deep"
            >
              <span data-num>{YEARS_TRADING}</span> years.
              <br />
              <span data-num>{SCALE.outlets}</span> outlets.
              <br />
              <span data-num>{SCALE.divisions}</span> divisions.
            </h1>

            <p className="mt-8 max-w-[52ch] text-body-lg text-on-deep-2">
              AM Group opened a Hindustan Petroleum forecourt in Jammu in {FOUNDED}. It
              now runs seven vehicle franchises, fuel stations, property and retail
              across the union territory — and publishes the numbers behind all of it.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild variant="bright" size="lg">
                <Link href="/inventory">
                  {stockCount > 0 ? `Browse ${stockCount} used cars` : "Browse used cars"}
                </Link>
              </Button>

              {/* data-track-location rather than onClick: the delegated listener
                  in components/analytics/link-tracker.tsx reads it, which is what
                  keeps this whole band a server component. */}
              <Button asChild variant="glass" size="lg">
                <a href={`tel:${PRIMARY_LOCATION.phoneE164}`} data-track-location="home-hero">
                  Call {PRIMARY_LOCATION.phone}
                </a>
              </Button>

              <Button asChild variant="glass" size="lg">
                <a
                  href={whatsappUrl(waMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track-location="home-hero"
                >
                  WhatsApp
                </a>
              </Button>
            </div>
          </div>

          {/* Content, not ground. The building is the evidence behind every
              number to the left of it. The drift gives the plate a different
              scroll speed from the type beside it — depth, read only while
              scrolling, zero under reduce. */}
          <ScrollDrift distance={20}>
          <Plate
            onDeep
            priority
            quality={90}
            src={AM_KIA_SHOWROOM}
            alt="The AM Kia showroom floor in Jammu, with cars on display under the roof lights"
            caption="AM Kia, Jammu — appointed 2024, the group's newest passenger-car franchise."
            ratio="aspect-[4/3] lg:aspect-[5/4]"
            sizes="(max-width: 1024px) 100vw, 45vw"
          />
          </ScrollDrift>
        </div>

        {/* Four figures on one hairline, closing the first viewport with
            verifiable scale instead of a scroll prompt. */}
        <dl className="mt-14 grid grid-cols-2 border-t border-line-on-deep md:mt-16 lg:grid-cols-4">
          {ledger.map((item, i) => (
            <div
              key={item.term}
              // Rules drawn per cell rather than with `divide-*`: the grid wraps
              // to two columns below lg, and a divide utility leaves a rule
              // hanging off the end of the last row.
              className={`py-6 md:py-7 ${i % 2 === 1 ? "border-l border-line-on-deep pl-5 md:pl-6" : "pr-5"} ${
                i < 2 ? "border-b border-line-on-deep lg:border-b-0" : ""
              } ${i === 2 ? "lg:border-l lg:border-line-on-deep lg:pl-6" : ""}`}
            >
              <dt className="text-meta uppercase text-on-deep-2">{item.term}</dt>
              <dd className="mt-2 font-display text-h2 text-on-deep" data-num>
                {item.detail}
              </dd>
              <dd className="mt-1 text-small text-on-deep-2">{item.note}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
