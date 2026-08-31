import Link from "next/link"
import { Aurora, GlowOrbs, GradientSeam, Grain } from "@/components/system/backdrops"
import { ParallaxImage } from "@/components/system/backdrop-motion"
import { Button } from "@/components/ui/button"
import { RuleDraw } from "@/components/system/rule-draw"
import { EnquireCta } from "@/components/system/enquire-cta"
import { SUPABASE_MEDIA } from "@/lib/supabase-media"
import { PRIMARY_LOCATION, whatsappUrl } from "@/lib/locations"

/**
 * The last call. Every public page ends with it.
 *
 * Compact on purpose: one glass panel, one line, four ways to act. It repeats
 * the phone and WhatsApp rather than sending everybody to a form, because on a
 * dealership site in J&K the phone IS the conversion — and it is one component
 * rather than nine hand-written CTA blocks so the lead path cannot quietly
 * differ between routes.
 *
 * `sourceLabel` is what the lead lands in the CRM tagged with, so every page
 * that mounts this reports where the enquiry actually came from.
 */
export function ClosingCall({
  sourceLabel,
  heading = "Someone answers the phone",
  lede = "Mon–Sat, 9:30 am to 6:30 pm, at the Jammu site on the N-H 1 Bye-Pass. No appointment needed to look at the stock.",
  image = SUPABASE_MEDIA.branches["jammu-kia"].exterior,
}: {
  sourceLabel: string
  heading?: string
  lede?: string
  image?: string
}) {
  const waMessage =
    "Hi AM Group, I'd like to speak to someone about a car. Are you free now?"

  return (
    <section
      aria-labelledby="closing-title"
      data-ground="deep"
      className="relative isolate overflow-hidden bg-deep-2 py-20 md:py-28"
    >
      <div aria-hidden className="absolute inset-0 -z-10">
        <ParallaxImage src={image} distance={50} />
        <div className="photo-scrim absolute inset-0" />
      </div>
      <Aurora animate />
      {/* Top only: the footer below is already dark, so a seam there would fade
          one dark ground into another and do nothing but cost a layer. */}
      <GradientSeam side="top" ground="bg-ground-2" />
      <GlowOrbs
        orbs={[
          { at: "12% 76%", size: "34%", strength: 0.18 },
          { at: "88% 22%", size: "28%", strength: 0.12 },
        ]}
      />
      <Grain onDeep />

      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="glass p-7 md:p-12">
          <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-8">
            <div>
              <p className="flex items-center gap-4 text-meta uppercase text-on-deep-2">
                <RuleDraw className="w-10 bg-accent-bright" />
                Talk to us
              </p>
              <h2
                id="closing-title"
                className="mt-5 max-w-[18ch] font-display text-h1 uppercase text-on-deep"
              >
                {heading}
              </h2>
              <p className="mt-4 max-w-[48ch] text-body-lg text-on-deep-2">{lede}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="bright" size="lg">
                <a
                  href={`tel:${PRIMARY_LOCATION.phoneE164}`}
                  data-track-location={sourceLabel}
                >
                  Call {PRIMARY_LOCATION.phone}
                </a>
              </Button>
              <Button asChild variant="glass" size="lg">
                <a
                  href={whatsappUrl(waMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track-location={sourceLabel}
                >
                  WhatsApp
                </a>
              </Button>
              <EnquireCta
                sourceLabel={sourceLabel}
                label="Send an enquiry"
                variant="glass"
              />
              <Button asChild variant="glass" size="lg">
                <Link href="/locations">Find us</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
