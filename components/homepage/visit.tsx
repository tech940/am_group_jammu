import Link from "next/link"
import { Band, Head } from "@/components/system/page-kit"
import { RevealGroup, RevealItem } from "@/components/system/reveal"
import { Grain, GridLines, WaveRibbons } from "@/components/system/backdrops"
import { EnquireCta } from "@/components/system/enquire-cta"
import { Button } from "@/components/ui/button"
import { LOCATIONS, formatHours, whatsappUrl } from "@/lib/locations"

/**
 * Where the group actually is, and the last lead path on the page.
 *
 * Name, address, phone and hours all come from lib/locations.ts and are never
 * retyped here. Local ranking depends on this text matching the Google Business
 * Profile character for character, and the surest way to break that is a second
 * copy of the address living in a component.
 */
export function Visit() {
  return (
    <Band
      ground="ground"
      labelledBy="visit-title"
      id="visit"
      backdrop={
        <>
          <WaveRibbons id="visit" tone="light" layers={4} strength={0.7} />
          <GridLines cell={80} strength={0.03} fade="top" />
          <Grain />
        </>
      }
    >
      <Head
        id="visit-title"
        label="Come and see"
        title="Two offices, open six days"
        lede="All certified pre-owned stock is held in Jammu and can be inspected without an appointment. Cars can be moved to Srinagar on request — call ahead."
      />

      <RevealGroup className="mt-14 grid grid-cols-1 gap-10 border-t border-line-strong pt-10 md:grid-cols-2 md:gap-14">
        {LOCATIONS.map((location) => {
          const waMessage = `Hi AM Group, I'd like to visit your ${location.city} office. What are your timings?`

          return (
            <RevealItem key={location.slug}>
              <h3 className="font-display text-h2 uppercase text-ink">
                {location.shortName}
              </h3>

              <address className="mt-4 not-italic text-body text-ink-2">
                {location.streetAddress}
                <br />
                {location.city}, {location.region} {location.postalCode}
                <br />
                {/* ink-2, not ink-3: this band carries a gradient backdrop, and ink-3
                    measures 3.8:1 at the deepest point of it. See DESIGN.md, Backdrops. */}
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
                      data-track-location={`home-visit-${location.slug}`}
                      className="text-ink underline-offset-4 transition-colors duration-(--duration-1) hover:text-accent-text-light hover:underline"
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
                      data-track-location={`home-visit-${location.slug}`}
                      className="text-ink underline-offset-4 transition-colors duration-(--duration-1) hover:text-accent-text-light hover:underline"
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
                    data-track-location={`home-visit-${location.slug}`}
                  >
                    Call {location.shortName}
                  </a>
                </Button>
                <Button asChild variant="secondary">
                  <a
                    href={whatsappUrl(waMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-track-location={`home-visit-${location.slug}`}
                  >
                    WhatsApp
                  </a>
                </Button>
                <Button asChild variant="secondary">
                  <a
                    href={location.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-track-location={`home-visit-${location.slug}`}
                  >
                    Directions
                  </a>
                </Button>
              </div>
            </RevealItem>
          )
        })}
      </RevealGroup>

      {/* Closing path — the form, for anyone who would rather write than call. */}
      <div className="mt-14 flex flex-wrap items-center gap-3 border-t border-line-strong pt-10">
        <EnquireCta sourceLabel="home-closing" label="Send an enquiry" />
        <Button asChild variant="secondary" size="lg">
          <Link href="/contact">Contact page</Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href="/locations">All branches</Link>
        </Button>
      </div>
    </Band>
  )
}
