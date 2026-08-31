import { Band, Head, PageHero } from "@/components/system/page-kit"
import { ContactForm } from "./contact-form"
import { Button } from "@/components/ui/button"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"
import {
  GlowOrbs,
  GradientGround,
  Grain,
  RadialWash,
  WaveField,
} from "@/components/system/backdrops"
import { LOCATIONS, PRIMARY_LOCATION, formatHours, whatsappUrl } from "@/lib/locations"

/**
 * Contact.
 *
 * The page it replaces printed `+91 9484200000` as the corporate number while
 * every other surface in the application printed `+91 94191 00000` from
 * lib/locations.ts. NAP disagreement across your own site is one of the things
 * Google actively penalises for local ranking, and it is exactly the drift that
 * file exists to stop — so nothing here types an address, a phone number or an
 * opening time. All of it renders from LOCATIONS.
 *
 * The Gurugram address below is kept, because it is a real company office, but
 * it is deliberately NOT in lib/locations.ts: that list drives the location
 * pages, the sitemap and the LocalBusiness schema, and a corporate office with
 * no showroom and no published hours should not become a landing page claiming
 * to serve customers.
 *
 * BACKDROP SIGNATURE: the calmest of the eight. A wash on the branch block and a
 * low wave field behind the form — nothing with an edge anywhere near an input.
 * This page's job is to be filled in and sent, and a decorated form field is a
 * form field people abandon.
 */
const CORPORATE_OFFICE = {
  label: "Gurugram",
  role: "Corporate office",
  address: "B-2/8 Amaltas Marg, DLF Phase 1, Sector 26A, Gurugram, Haryana 122002",
  note: "Head-office correspondence only — no showroom, no service, and no walk-in stock.",
}

export function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title={
          <>
            Someone
            <br />
            answers
          </>
        }
        lede="Phone and WhatsApp reach the Jammu site directly during opening hours. The form goes to the same desk and is answered within one working day."
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
          { term: "Branches", detail: String(LOCATIONS.length), note: "Jammu · Srinagar" },
          { term: "Open", detail: "Mon–Sat", note: "9:30 am – 6:30 pm" },
          { term: "Corporate office", detail: "1", note: "Gurugram" },
          { term: "Reply target", detail: "1", note: "working day" },
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
                href={whatsappUrl("Hi AM Group, I have a question.")}
                target="_blank"
                rel="noopener noreferrer"
                data-track-location="contact-hero"
              >
                WhatsApp
              </a>
            </Button>
          </>
        }
      />

      {/* Branches -------------------------------------------------------- */}
      <Band
        ground="ground"
        labelledBy="branches-title"
        id="branches"
        backdrop={
          <>
            <GradientGround tone="light" angle="162deg" strength={0.75} />
            <Grain />
          </>
        }
      >
        <Head
          id="branches-title"
          label="Where we are"
          title="Two branches, one corporate office"
          lede="Both branches take walk-ins during opening hours. All certified pre-owned stock is held in Jammu."
        />

        <div className="mt-14 grid grid-cols-1 gap-10 border-t border-line pt-10 md:grid-cols-2 md:gap-14">
          {LOCATIONS.map((location) => (
            <div key={location.slug}>
              <h3 className="font-display text-h2 uppercase text-ink">{location.shortName}</h3>

              <address className="mt-4 not-italic text-body text-ink-2">
                {location.streetAddress}
                <br />
                {location.city}, {location.region} {location.postalCode}
                <br />
                <span className="text-ink-2">{location.landmark}</span>
              </address>

              <dl className="mt-6 border-t border-line">
                <div className="flex justify-between gap-6 border-b border-line py-3">
                  <dt className="text-meta uppercase text-ink-2">Hours</dt>
                  <dd className="text-right text-small text-ink">{formatHours(location)}</dd>
                </div>
                <div className="flex justify-between gap-6 border-b border-line py-3">
                  <dt className="text-meta uppercase text-ink-2">Phone</dt>
                  <dd className="text-right text-small">
                    <a
                      href={`tel:${location.phoneE164}`}
                      data-track-location={`contact-${location.slug}`}
                      className="text-ink underline-offset-4 transition-colors duration-(--duration-1) hover:text-accent hover:underline"
                    >
                      {location.phone}
                    </a>
                  </dd>
                </div>
                <div className="flex justify-between gap-6 border-b border-line py-3">
                  <dt className="text-meta uppercase text-ink-2">Email</dt>
                  <dd className="text-right text-small">
                    <a
                      href={`mailto:${location.email}`}
                      data-track-location={`contact-${location.slug}`}
                      className="text-ink underline-offset-4 transition-colors duration-(--duration-1) hover:text-accent hover:underline"
                    >
                      {location.email}
                    </a>
                  </dd>
                </div>
              </dl>

              <p className="mt-5 text-small text-ink-2">{location.blurb}</p>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <Button asChild variant="secondary">
                  <a
                    href={`tel:${location.phoneE164}`}
                    data-track-location={`contact-${location.slug}`}
                  >
                    Call {location.shortName}
                  </a>
                </Button>
                <Button asChild variant="secondary">
                  <a
                    href={whatsappUrl(
                      `Hi AM Group, I'd like to contact your ${location.city} office.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-track-location={`contact-${location.slug}`}
                  >
                    WhatsApp
                  </a>
                </Button>
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
              </div>
            </div>
          ))}
        </div>

        {/* Kept separate from the branches, and labelled, so nobody drives to
            Gurugram expecting a showroom. */}
        <div className="mt-12 border-t border-line pt-8">
          <p className="text-meta uppercase text-ink-2">{CORPORATE_OFFICE.role}</p>
          <h3 className="mt-3 font-display text-h3 uppercase text-ink">
            {CORPORATE_OFFICE.label}
          </h3>
          <address className="mt-2 not-italic text-body text-ink-2">
            {CORPORATE_OFFICE.address}
          </address>
          <p className="mt-2 max-w-[60ch] text-small text-ink-2">{CORPORATE_OFFICE.note}</p>
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
          lede="If a call is not convenient, this reaches the same desk. Required fields are marked; everything else is optional."
        />

        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div className="space-y-6">
            <p className="text-body-lg text-ink-2">
              Tell us what you are after — a specific car, a service booking, a part, a
              property enquiry — and which branch is easiest for you to reach.
            </p>
            <p className="border-t border-line pt-6 text-meta uppercase text-ink-2">
              Answered within one working day
            </p>
          </div>

          <ContactForm />
        </div>
      </Band>
    </>
  )
}
