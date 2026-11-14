import { Button } from "@/components/ui/button"
import type { Location } from "@/lib/locations"
import { locationAddressLine, locationMapQuery } from "@/lib/seo/locations"

/**
 * A map of one site, with a directions link.
 *
 * Renders nothing for a site whose address is not confirmed: a map of a
 * guessed place sends people to the wrong street.
 *
 * The map is searched by the confirmed ADDRESS, not by coordinates. The
 * coordinates in lib/locations.ts are approximate (geo.verified is false) and
 * a pin dropped on them would look exact while being wrong.
 *
 * Privacy: the map comes from Google, whatever the visitor answered on the
 * analytics notice, and Google sees their IP address when it loads. The
 * privacy policy says so (app/privacy-policy/page.tsx, sections 3 and 4);
 * keep the two in step.
 *
 * Page speed: a plain Google Maps embed needs no API key and no script of
 * ours. `loading="lazy"` means the browser does not request it until the
 * visitor scrolls near it, so it costs the first screen nothing, and the box
 * has a fixed shape so nothing moves when it arrives.
 */
export function SiteMap({ location, track }: { location: Location; track: string }) {
  const query = locationMapQuery(location)
  if (!query) return null

  return (
    <div className="overflow-hidden rounded-md border border-line bg-surface">
      <iframe
        title={`Map showing ${location.shortName}, ${location.city}`}
        src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
        loading="lazy"
        // Google is told nothing about the page the map sits on. The default
        // would send the full address, campaign tags and ad click ids included.
        referrerPolicy="no-referrer"
        className="block aspect-[4/3] w-full md:aspect-[16/9]"
      />
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line p-5">
        <address className="not-italic text-body text-ink-2">{locationAddressLine(location)}</address>
        <Button asChild variant="secondary">
          <a href={location.mapUrl} target="_blank" rel="noopener noreferrer" data-track-location={track}>
            Get directions
          </a>
        </Button>
      </div>
    </div>
  )
}
