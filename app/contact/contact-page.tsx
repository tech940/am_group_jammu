import Link from "next/link"
import { Band, Head, PageHero } from "@/components/system/page-kit"
import { ContactForm } from "./contact-form"
import { Button } from "@/components/ui/button"
import { HPromiseLine } from "@/components/seo/h-promise-line"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"
import {
  GlowOrbs,
  GradientGround,
  Grain,
  RadialWash,
  WaveField,
} from "@/components/system/backdrops"
import { LOCATIONS, PRIMARY_LOCATION, formatHours, whatsappUrl } from "@/lib/locations"
import { closedSundays, locationAddressLine, locationAddressLines, locationNames } from "@/lib/seo/locations"
import { FaqSection, type FaqItem } from "@/components/seo/faq-section"
import { SiteMap } from "@/app/locations/site-map"

/**
 * Contact — for someone buying or selling a used car in Jammu.
 *
 * Nothing here types an address, a phone number or an opening time: all of it
 * renders from lib/locations.ts, the single NAP source. Disagreement between
 * pages of the same site is one of the things Google penalises for local
 * ranking.
 *
 * Two of the three sites have only a locality on record, so they show the
 * locality and "call for exact directions" rather than a guessed street.
 *
 * BACKDROP SIGNATURE: the calmest on the site. A wash on the locations block
 * and a low wave field behind the form — nothing with an edge anywhere near an
 * input.
 */
/**
 * Short answers to what people ask before they call. Every value is read from
 * lib/locations.ts. Nothing on this page or in its form promises a reply time:
 * the "within one working day" wording was removed until the company confirms
 * it. Put it back, here and in contact-form.tsx, only when it does.
 */
function contactFaqs(): FaqItem[] {
  const hours = formatHours(PRIMARY_LOCATION)
  const unconfirmed = LOCATIONS.filter((l) => !l.addressConfirmed)
  return [
    {
      question: "What is the phone number for AM Group Used Cars?",
      answer: `${PRIMARY_LOCATION.phone}. The same number reaches all ${LOCATIONS.length} of our used-car sites in Jammu. You can also message us on WhatsApp from this page.`,
    },
    {
      question: "What are the opening hours?",
      answer: `${hours}.${closedSundays(PRIMARY_LOCATION) ? " We are closed on Sundays." : ""}`,
    },
    {
      question: "Which site should I visit?",
      answer:
        `Each car is kept at one of our ${LOCATIONS.length} sites, so call first and we will tell you where the car you want is. ` +
        `${PRIMARY_LOCATION.shortName} is at ${locationAddressLine(PRIMARY_LOCATION)}.` +
        (unconfirmed.length > 0
          ? ` For ${unconfirmed.map((l) => l.shortName).join(" and ")}, call for exact directions.`
          : ""),
    },
    {
      question: "Can I email instead?",
      answer: `Yes. Write to ${PRIMARY_LOCATION.email}, or use the form on this page.`,
    },
  ]
}

export function ContactPage() {
  const [days, times] = formatHours(PRIMARY_LOCATION).split(", ")

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            {/* The space before the break matters: without it a text-only
                reader (a crawler, a screen reader) gets "WhatsAppor". */}
            Call, WhatsApp{" "}
            <br />
            or write
          </>
        }
        lede="Phone and WhatsApp reach our used-car team in Jammu during opening hours. The form goes to the same desk."
        image={SUPABASE_MEDIA.branches["jammu-hyundai"].exterior}
        backdrop={
          <>
            <GlowOrbs
              orbs={[
                { at: "16% 34%", size: "34%", strength: 0.22 },
                { at: "88% 74%", size: "26%", strength: 0.12 },
              ]}
            />
            <Grain onDeep />
          </>
        }
        stats={[
          { term: "Locations", detail: String(LOCATIONS.length), note: "all in Jammu" },
          { term: "Open", detail: days, note: times ?? "" },
        ]}
        actions={
          <>
            <Button asChild variant="bright" size="lg">
              <a
                href={`tel:${PRIMARY_LOCATION.phoneE164}`}
                data-track-location="contact-hero"
              >
                Call {PRIMARY_LOCATION.phone}
              </a>
            </Button>
            <Button asChild variant="glass" size="lg">
              <a
                href={whatsappUrl("Hi AM Group, I have a question about a used car.")}
                target="_blank"
                rel="noopener noreferrer"
                data-track-location="contact-hero"
              >
                WhatsApp
              </a>
            </Button>
            <Button asChild variant="glass" size="lg">
              <a href="#enquiry">Send a message</a>
            </Button>
          </>
        }
      />

      {/* Phone, WhatsApp, email ------------------------------------------- */}
      <Band
        ground="ground"
        labelledBy="locations-title"
        id="locations"
        backdrop={
          <>
            <GradientGround tone="light" angle="162deg" strength={0.75} />
            <Grain />
          </>
        }
      >
        <Head
          id="locations-title"
          label="Where we are"
          title={`${LOCATIONS.length} used-car locations in Jammu`}
          lede={`${locationNames()}. Each car is kept at one site — call first and we will tell you where the car you want is.`}
        />

        <dl className="mt-12 grid grid-cols-1 gap-x-10 gap-y-6 border-t border-line pt-8 sm:grid-cols-3">
          <div>
            <dt className="text-label text-ink">Phone</dt>
            <dd>
              <a
                href={`tel:${PRIMARY_LOCATION.phoneE164}`}
                data-track-location="contact-direct"
                data-num
                className="inline-flex min-h-11 items-center text-body-lg font-semibold text-ink underline-offset-4 transition-colors duration-(--duration-1) hover:text-accent hover:underline"
              >
                {PRIMARY_LOCATION.phone}
              </a>
              <HPromiseLine track="contact-hpromise" />
            </dd>
          </div>
          <div>
            <dt className="text-label text-ink">WhatsApp</dt>
            <dd>
              <a
                href={whatsappUrl("Hi AM Group, I have a question about a used car.")}
                target="_blank"
                rel="noopener noreferrer"
                data-track-location="contact-direct"
                className="inline-flex min-h-11 items-center text-body-lg font-semibold text-ink underline-offset-4 transition-colors duration-(--duration-1) hover:text-accent hover:underline"
              >
                Message us on WhatsApp
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-label text-ink">Email</dt>
            <dd>
              <a
                href={`mailto:${PRIMARY_LOCATION.email}`}
                data-track-location="contact-direct"
                className="inline-flex min-h-11 items-center break-all text-body-lg font-semibold text-ink underline-offset-4 transition-colors duration-(--duration-1) hover:text-accent hover:underline"
              >
                {PRIMARY_LOCATION.email}
              </a>
            </dd>
          </div>
        </dl>

        <ul className="mt-10 grid grid-cols-1 gap-10 border-t border-line pt-10 md:grid-cols-3 md:gap-10">
          {LOCATIONS.map((location) => (
            <li key={location.slug} className="flex flex-col">
              <h3 className="font-display text-h2 uppercase text-ink">
                <Link
                  href={`/locations/${location.slug}`}
                  className="inline-flex min-h-11 items-center transition-colors duration-(--duration-1) hover:text-accent"
                >
                  {location.shortName}
                </Link>
              </h3>

              <address className="mt-4 not-italic text-body text-ink-2">
                {locationAddressLines(location).map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
              {!location.addressConfirmed && (
                <p className="mt-1 text-body font-semibold text-ink">Call for exact directions</p>
              )}

              <dl className="mt-6 border-t border-line">
                <div className="flex justify-between gap-6 border-b border-line py-3">
                  <dt className="text-label text-ink-2">Hours</dt>
                  <dd className="text-right text-small text-ink">
                    {formatHours(location)}
                    {closedSundays(location) && <span className="block text-ink-2">Closed Sundays</span>}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-6 border-b border-line">
                  <dt className="text-label text-ink-2">Phone</dt>
                  <dd className="text-right text-small">
                    <a
                      href={`tel:${location.phoneE164}`}
                      data-track-location={`contact-${location.slug}`}
                      data-num
                      className="inline-flex min-h-11 items-center text-ink underline-offset-4 transition-colors duration-(--duration-1) hover:text-accent hover:underline"
                    >
                      {location.phone}
                    </a>
                  </dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <Button asChild variant="secondary">
                  <a
                    href={whatsappUrl(
                      `Hi AM Group, I'd like to visit ${location.shortName} in ${location.city} to see used cars.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-track-location={`contact-${location.slug}`}
                  >
                    WhatsApp
                  </a>
                </Button>
                {location.addressConfirmed ? (
                  <Button asChild variant="secondary">
                    <a
                      href={location.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-track-location={`contact-${location.slug}`}
                    >
                      Directions
                    </a>
                  </Button>
                ) : (
                  <Button asChild variant="secondary">
                    <a
                      href={`tel:${location.phoneE164}`}
                      data-track-location={`contact-${location.slug}`}
                    >
                      Call for directions
                    </a>
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* A map of the one site whose address is confirmed. The component
            renders nothing for the others. */}
        <div className="mt-10 border-t border-line pt-10">
          <h3 className="mb-5 font-display text-h2 uppercase text-ink">
            {PRIMARY_LOCATION.shortName} on the map
          </h3>
          <SiteMap location={PRIMARY_LOCATION} track="contact-map" />
        </div>
      </Band>

      {/* The form -------------------------------------------------------- */}
      {/* Nothing hard-edged behind a form. */}
      <Band
        ground="ground-2"
        labelledBy="form-title"
        id="enquiry"
        backdrop={
          <>
            <RadialWash at="24% 8%" strength={0.12} />
            <WaveField tone="light" lines={7} amplitude={20} strength={0.06} />
            <Grain />
          </>
        }
      >
        <Head
          id="form-title"
          label="Send a message"
          title="Write instead"
          lede="If a call is not convenient, this reaches the same desk. Name and phone are required; everything else is optional."
        />

        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div className="space-y-6">
            <p className="text-body-lg text-ink-2">
              Tell us what you are after — a car you have seen on this site, a budget you are working
              to, or a car you want to sell or exchange — and which of our Jammu locations is easiest
              for you to reach.
            </p>
            <p className="border-t border-line pt-6 text-body text-ink-2">
              Selling a car? The{" "}
              <Link
                href="/sell-your-car"
                className="font-semibold text-ink underline underline-offset-4 transition-colors duration-(--duration-1) hover:text-accent"
              >
                sell your car
              </Link>{" "}
              page asks for the details we need to value it.
            </p>
          </div>

          <ContactForm />
        </div>
      </Band>

      <FaqSection items={contactFaqs()} title="Before you call" />
    </>
  )
}
