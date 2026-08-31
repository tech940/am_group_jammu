import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Band, Head, PageHero, Plate } from "@/components/system/page-kit"
import { ClosingCall } from "@/components/system/closing-call"
import { EnquireCta } from "@/components/system/enquire-cta"
import { Grain, GridLines, RadialWash } from "@/components/system/backdrops"
import { ArrowGlyph } from "@/components/system/marks"
import { Button } from "@/components/ui/button"
import { FRANCHISES, YEARS_TRADING, FOUNDED } from "@/components/home/content"
import { PRIMARY_LOCATION, whatsappUrl, formatHours } from "@/lib/locations"

/**
 * The franchise showroom pages — /hyundai, /am-kia, /ktm-jammu and the rest.
 *
 * These live at the EXACT slugs the old WordPress site ranked under. Until
 * now every one of those URLs sat on a temporary 302 to /automobile,
 * deliberately (next.config.ts): a 302 keeps the URL's ranking parked instead
 * of handing it to a stand-in. This page is the "proper page" that comment
 * was waiting for — the redirects for these seven slugs are deleted in the
 * same change, because a redirect entry would shadow the route.
 *
 * One dynamic segment, `dynamicParams = false`: the seven slugs in
 * FRANCHISES are the only pages that exist, and everything renders from that
 * register — a marque cannot get a page here that the homepage's register
 * does not account for. Chevrolet has `slug: null` and correctly gets no
 * page: a franchise that ended in 2017 gets a row in the record, not a
 * landing page claiming a showroom.
 *
 * Deliberately NOT here: Triumph. The old homepage now carries a Triumph
 * tile, but the franchise is still not in the published register this site
 * documents (content.ts has carried that caveat since the audit), so it gets
 * no page until the client confirms the appointment.
 */

const PAGES = FRANCHISES.filter(
  (f): f is (typeof FRANCHISES)[number] & { slug: string } => f.slug !== null,
)

/** Used-car brand pages exist only for makes actually stocked. */
const USED_STOCK_BRAND: Record<string, string> = {
  Hyundai: "/brands/hyundai",
  Kia: "/brands/kia",
}

export const dynamicParams = false

export function generateStaticParams() {
  return PAGES.map((f) => ({ brand: f.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>
}): Promise<Metadata> {
  const { brand } = await params
  const franchise = PAGES.find((f) => f.slug === brand)
  if (!franchise) return {}
  const wheels = franchise.category === "Two-wheelers" ? "motorcycles" : "cars"
  return {
    title: `${franchise.entity} | Authorised ${franchise.name} Dealership in Jammu`,
    description: `${franchise.entity} — AM Group's authorised ${franchise.name} dealership, appointed ${franchise.since}. New ${wheels}, authorised service, genuine parts, finance and insurance in Jammu & Kashmir.`,
    alternates: { canonical: `/${franchise.slug}` },
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ brand: string }>
}) {
  const { brand } = await params
  const franchise = PAGES.find((f) => f.slug === brand)
  if (!franchise) notFound()

  const bikes = franchise.category === "Two-wheelers"
  const usedStock = USED_STOCK_BRAND[franchise.name]

  // What the desk actually does, phrased per product type. These are the
  // same six functions the group publishes for its dealerships — nothing
  // marque-specific is claimed that the marque page cannot support.
  const services = [
    {
      title: `New ${franchise.name} sales`,
      body: bikes
        ? `The current ${franchise.name} motorcycle and scooter range, on the floor and bookable.`
        : `The current ${franchise.name} passenger range, with test drives from the showroom.`,
    },
    {
      title: "Authorised service",
      body: "Factory-trained technicians and genuine parts, in the group's authorised workshops.",
    },
    {
      title: "Finance",
      body: "Bank finance arranged at the dealership desk, indicative decisions same day.",
    },
    {
      title: "Insurance",
      body: "New policies and renewals handled on site, with the paperwork done for you.",
    },
    {
      title: "Exchange",
      body: bikes
        ? "Part-exchange valued while you wait."
        : "Part-exchange valued while you wait; certified pre-owned stock is held in Jammu.",
    },
  ]

  return (
    <>
      <PageHero
        eyebrow={`${franchise.entity} · appointed ${franchise.since}`}
        title={
          <>
            {franchise.name}
            <br />
            in Jammu
          </>
        }
        lede={franchise.blurb}
        image={franchise.image}
        caption={franchise.imageAlt}
        backdrop={
          <>
            <RadialWash at="82% 20%" tone="deep" strength={0.14} />
            <Grain onDeep />
          </>
        }
        stats={[
          { term: "Appointed", detail: String(franchise.since), note: franchise.entity },
          {
            term: "Years as dealer",
            detail: String(new Date().getFullYear() - franchise.since),
            note: "and counting",
          },
          { term: "Product", detail: bikes ? "2W" : "Cars", note: franchise.category },
          {
            term: "Group trading since",
            detail: String(FOUNDED),
            note: `${YEARS_TRADING} years`,
          },
        ]}
        actions={
          <>
            <Button asChild variant="bright" size="lg">
              <a
                href={`tel:${PRIMARY_LOCATION.phoneE164}`}
                data-track-location={`brand-${franchise.slug}`}
              >
                Call {PRIMARY_LOCATION.phone}
              </a>
            </Button>
            <Button asChild variant="glass" size="lg">
              <a
                href={whatsappUrl(
                  `Hi AM Group, I'm interested in a ${franchise.name}. Can you help?`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                data-track-location={`brand-${franchise.slug}`}
              >
                WhatsApp
              </a>
            </Button>
          </>
        }
      />

      <Band
        ground="ground"
        labelledBy={`${franchise.slug}-services-title`}
        id="showroom"
        backdrop={
          <>
            <GridLines cell={64} strength={0.04} fade="both" />
            <Grain />
          </>
        }
      >
        <Head
          id={`${franchise.slug}-services-title`}
          label="At the showroom"
          title="What this desk does"
          lede={`Hours and directions are the group's: ${formatHours(PRIMARY_LOCATION)}. Walk-ins are fine; call ahead if you want a specific ${bikes ? "model" : "car"} ready.`}
        />

        <div className="mt-14 grid grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <ol className="border-t border-line">
            {services.map((service, i) => (
              <li key={service.title} className="border-b border-line py-5">
                <p className="flex items-baseline gap-4">
                  <span className="font-display text-h4 text-ink-3" data-num>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-h4 uppercase text-ink">
                    {service.title}
                  </span>
                </p>
                <p className="mt-1.5 pl-9 text-body text-ink-2">{service.body}</p>
              </li>
            ))}
          </ol>

          <div>
            <Plate
              src={franchise.image}
              alt={franchise.imageAlt}
              caption={`${franchise.entity} — ${franchise.name}, appointed ${franchise.since}.`}
              ratio="aspect-[4/3]"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <EnquireCta
                label={`Enquire about ${franchise.name}`}
                sourceLabel={`brand-${franchise.slug}`}
              />
              {usedStock && (
                <Button asChild variant="secondary" size="lg">
                  <Link href={usedStock}>Used {franchise.name} in stock</Link>
                </Button>
              )}
            </div>

            <Link
              href="/automobile"
              className="mt-7 inline-flex min-h-11 items-center gap-2 text-button uppercase text-accent transition-colors duration-(--duration-1) hover:text-accent-hover"
            >
              All seven franchises
              <ArrowGlyph />
            </Link>
          </div>
        </div>
      </Band>

      <ClosingCall
        sourceLabel={`brand-${franchise.slug}-closing`}
        heading={`Book a ${franchise.name} ${bikes ? "test ride" : "test drive"}`}
        lede={`Tell us which ${bikes ? "model" : "car"} and we will have it ready. Mon–Sat, 9:30 am to 6:30 pm.`}
        image={franchise.image}
      />
    </>
  )
}
