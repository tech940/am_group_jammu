import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  GradientMesh,
  Grain,
  RadialWash,
  WaveRibbons,
} from "@/components/system/backdrops"
import { CursorGlow } from "@/components/system/backdrop-motion"
import { RuleDraw } from "@/components/system/rule-draw"
import { ScrollDrift } from "@/components/system/scroll-drift"
import { HeroGallery } from "./hero-gallery"
import { SUPABASE_MEDIA, AM_KIA_SHOWROOM } from "@/lib/supabase-media"
import { FOUNDED, YEARS_TRADING, SCALE } from "@/components/home/content"
import { PRIMARY_LOCATION, whatsappUrl } from "@/lib/locations"

/**
 * The opening claim, now on a LIGHT ground with a rotating gallery of the
 * group's own sites.
 *
 * Light changes the arithmetic, not the argument. Ink on these pale ribbon
 * tints measures 12:1 with 5:1 for secondary — the same family measured when
 * the light bands got their gradients — so the veil that seated the dark
 * version is simply not needed and is gone. The nav no longer overlays this
 * band either (DARK_HERO_ROUTES lost "/"), so the filled header and its
 * spacer sit above and the hero starts on its own ground.
 *
 * The gallery replaces the single plate: six real sites, captioned, rotating
 * on a fenced loop (see hero-gallery.tsx for the pause/reduce/manual rules).
 * The captions live HERE, next to the image list, because a caption that
 * drifts from its photograph is how this site once told readers a Hyundai
 * showroom was a workshop.
 */
const GALLERY = [
  {
    src: AM_KIA_SHOWROOM,
    alt: "The AM Kia showroom floor in Jammu, cars on display under the roof lights",
    caption: "AM Kia, Jammu — appointed 2024.",
  },
  {
    src: SUPABASE_MEDIA.branches["jammu-hyundai"].exterior,
    alt: "The AM Hyundai showroom building in Jammu",
    caption: "AM Hyundai, Jammu — appointed 2008.",
  },
  {
    src: SUPABASE_MEDIA.branches.petroleum.exterior,
    alt: "An AM Group fuel station forecourt",
    caption: "AM Group forecourt — fuel since 1968.",
  },
  {
    src: SUPABASE_MEDIA.branches["two-wheelers"].ktm,
    alt: "The KTM Jammu showroom",
    caption: "KTM Jammu — the only KTM showroom in Jammu.",
  },
  {
    src: SUPABASE_MEDIA.branches["real-estate"].exterior,
    alt: "An AM Group commercial development in Jammu",
    caption: "AM Group development, Jammu.",
  },
  {
    src: SUPABASE_MEDIA.branches["srinagar-hyundai"].exterior,
    alt: "The AM Hyundai showroom in Srinagar",
    caption: "AM Hyundai, Srinagar — the Kashmir Valley site.",
  },
]

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
      className="relative isolate overflow-hidden bg-ground"
    >
      {/* The light gradient field: pale ribbons and a mesh in the same two
          token ends as everything else, no veil needed — every layer here was
          measured against ink when the light bands were tuned. */}
      <GradientMesh tone="light" />
      <WaveRibbons id="hero" tone="light" layers={4} flip />
      <RadialWash at="16% 0%" strength={0.12} />
      <CursorGlow strength={0.2} />
      <Grain />

      <div className="relative mx-auto max-w-[1400px] px-5 pb-14 pt-12 md:px-10 md:pb-20 md:pt-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.08fr_1fr] lg:gap-16">
          <div>
            <p className="flex items-center gap-4 text-meta uppercase text-ink-2">
              <RuleDraw className="w-10 bg-accent" />
              Jammu &amp; Kashmir · since {FOUNDED}
            </p>

            {/* The heading IS the data. Every line is a figure this site can
                show its working for. */}
            <h1
              id="hero-title"
              className="mt-7 font-display text-display uppercase text-ink"
            >
              <span data-num>{YEARS_TRADING}</span> years.
              <br />
              <span data-num>{SCALE.outlets}</span> outlets.
              <br />
              <span data-num>{SCALE.divisions}</span> divisions.
            </h1>

            <p className="mt-8 max-w-[52ch] text-body-lg text-ink-2">
              AM Group opened a Hindustan Petroleum forecourt in Jammu in {FOUNDED}. It
              now runs seven vehicle franchises, fuel stations, property and retail
              across the union territory — and publishes the numbers behind all of it.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild variant="primary" size="lg">
                <Link href="/inventory">
                  {stockCount > 0 ? `Browse ${stockCount} used cars` : "Browse used cars"}
                </Link>
              </Button>

              {/* data-track-location rather than onClick: the delegated
                  listener in link-tracker.tsx reads it, which is what keeps
                  this whole band a server component. */}
              <Button asChild variant="secondary" size="lg">
                <a href={`tel:${PRIMARY_LOCATION.phoneE164}`} data-track-location="home-hero">
                  Call {PRIMARY_LOCATION.phone}
                </a>
              </Button>

              <Button asChild variant="secondary" size="lg">
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

          {/* The gallery drifts at a slightly different rate from the type
              beside it — depth, read only while scrolling, zero under reduce. */}
          <ScrollDrift distance={20}>
            <HeroGallery slides={GALLERY} />
          </ScrollDrift>
        </div>

        {/* Four figures on one hairline, closing the first viewport with
            verifiable scale instead of a scroll prompt. */}
        <dl className="mt-14 grid grid-cols-2 border-t border-line-strong md:mt-16 lg:grid-cols-4">
          {ledger.map((item, i) => (
            <div
              key={item.term}
              // Rules drawn per cell rather than with `divide-*`: the grid
              // wraps to two columns below lg, and a divide utility leaves a
              // rule hanging off the end of the last row.
              className={`py-6 md:py-7 ${i % 2 === 1 ? "border-l border-line pl-5 md:pl-6" : "pr-5"} ${
                i < 2 ? "border-b border-line lg:border-b-0" : ""
              } ${i === 2 ? "lg:border-l lg:border-line lg:pl-6" : ""}`}
            >
              <dt className="text-meta uppercase text-ink-2">{item.term}</dt>
              <dd className="mt-2 font-display text-h2 text-ink" data-num>
                {item.detail}
              </dd>
              <dd className="mt-1 text-small text-ink-2">{item.note}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
