import Link from "next/link"
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
    <div className="bg-white">
      <section className="border-b border-black/5 bg-gradient-to-b from-zinc-50 to-white">
        <div className="container mx-auto px-4 md:px-8 py-10 md:py-14">
          <h1 className="text-3xl md:text-5xl font-black text-[#023468] tracking-tight mb-4">
            {title}
          </h1>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#E31837]">
            Effective {effectiveDate}
          </p>
          <div className="max-w-3xl mt-6 space-y-3">
            {intro.map((p, i) => (
              <p key={i} className="text-sm md:text-[15px] text-black/65 leading-relaxed">
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
                  <h2 className="text-lg md:text-xl font-black text-[#023468] tracking-tight mb-3">
                    {s.heading}
                  </h2>
                )}
                {s.subheading && (
                  <h3 className="text-[13px] font-black uppercase tracking-wider text-black/45 mt-5 mb-2">
                    {s.subheading}
                  </h3>
                )}
                {s.paragraphs?.map((p, j) => (
                  <p key={j} className="text-sm text-black/65 leading-relaxed mb-3">
                    {p}
                  </p>
                ))}
                {s.bullets && (
                  <ul className="mt-2 space-y-1.5">
                    {s.bullets.map((b, j) => (
                      <li key={j} className="flex gap-2.5 text-sm text-black/65 leading-relaxed">
                        <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#E31837] flex-shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            <div className="rounded-2xl border border-black/10 bg-zinc-50 p-6">
              <h2 className="text-lg font-black text-[#023468] tracking-tight mb-3">Contact Us</h2>
              <address className="not-italic text-sm text-black/65 leading-relaxed">
                <strong className="text-black/80">{PRIMARY_LOCATION.name}</strong>
                <br />
                {formatAddress(PRIMARY_LOCATION)}
                <br />
                <a href={`tel:${PRIMARY_LOCATION.phoneE164}`} className="hover:text-[#E31837] transition-colors">
                  {PRIMARY_LOCATION.phone}
                </a>
                {" · "}
                <a href={`mailto:${PRIMARY_LOCATION.email}`} className="hover:text-[#E31837] transition-colors">
                  {PRIMARY_LOCATION.email}
                </a>
              </address>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center h-11 mt-5 px-6 rounded-xl bg-[#023468] hover:bg-[#01254a] text-white text-[11px] font-black uppercase tracking-wider transition-colors"
              >
                Contact AM Group
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
