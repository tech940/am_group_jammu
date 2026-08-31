import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { PRIMARY_LOCATION, formatAddress } from "@/lib/locations"

/**
 * Renderer for the two legal documents.
 *
 * These are the client's own text, carried over verbatim from the WordPress
 * site — the wording is a legal position, not copy to be improved, so the
 * content lives in the page files and this component only lays it out.
 *
 * The contact block is built from lib/locations.ts rather than transcribed.
 * The WordPress originals quote +91 9484200000, which disagrees with the
 * +91 94191 00000 used everywhere else on this site; rendering from the single
 * NAP source keeps the legal pages from adding a third variant.
 */

export interface LegalSection {
  /** Omitted for the lead-in paragraphs before the first numbered heading. */
  heading?: string
  /** Sub-heading, e.g. "a) Personal Information". */
  subheading?: string
  paragraphs?: string[]
  bullets?: string[]
}

export function LegalDocument({
  title,
  effectiveDate,
  intro,
  sections,
}: {
  title: string
  effectiveDate: string
  intro: string[]
  sections: LegalSection[]
}) {
  return (
    <div className="bg-ground">
      <section className="border-b border-line bg-ground-2">
        <div className="container mx-auto px-4 md:px-8 py-10 md:py-14">
          <h1 className="font-display text-h1 text-ink mb-4">{title}</h1>
          <p className="text-meta uppercase text-accent-text-light">
            Effective <span data-num>{effectiveDate}</span>
          </p>
          <div className="max-w-3xl mt-6 space-y-3">
            {intro.map((p, i) => (
              <p key={i} className="text-body text-ink-2">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl space-y-9">
            {sections.map((s, i) => (
              <div key={i}>
                {s.heading && (
                  <h2 className="font-display text-h3 text-ink mb-3">{s.heading}</h2>
                )}
                {s.subheading && (
                  <h3 className="text-meta uppercase text-ink-2 mt-5 mb-2">{s.subheading}</h3>
                )}
                {s.paragraphs?.map((p, j) => (
                  <p key={j} className="text-body text-ink-2 mb-3">
                    {p}
                  </p>
                ))}
                {s.bullets && (
                  <ul className="mt-2 space-y-1.5">
                    {s.bullets.map((b, j) => (
                      <li key={j} className="flex gap-2.5 text-body text-ink-2">
                        <span aria-hidden className="mt-2 h-1.5 w-1.5 bg-accent flex-shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            <div className="border border-line bg-surface p-6">
              <h2 className="font-display text-h3 text-ink mb-3">Contact Us</h2>
              <address className="not-italic text-body text-ink-2">
                <strong className="text-ink">{PRIMARY_LOCATION.name}</strong>
                <br />
                {formatAddress(PRIMARY_LOCATION)}
                <br />
                <a
                  href={`tel:${PRIMARY_LOCATION.phoneE164}`}
                  data-track-location="legal"
                  data-num
                  className="transition-colors duration-(--duration-1) hover:text-accent-text-light"
                >
                  {PRIMARY_LOCATION.phone}
                </a>
                {" · "}
                <a
                  href={`mailto:${PRIMARY_LOCATION.email}`}
                  data-track-location="legal"
                  className="transition-colors duration-(--duration-1) hover:text-accent-text-light"
                >
                  {PRIMARY_LOCATION.email}
                </a>
              </address>
              <Link href="/contact" className={`${buttonVariants({ variant: "primary" })} mt-5`}>
                Contact AM Group
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
