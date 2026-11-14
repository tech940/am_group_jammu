import { ABOUT_HEADING, ABOUT_PARAGRAPHS } from "./about-facts"

/**
 * "About AM Group Used Cars": the one place on the site that says who the
 * dealer is. The company pages (/about-us, /our-businesses) were removed when
 * this became a used-car site, which left no page stating it.
 *
 * Plain paragraphs, in the same section grammar as the rest of the locations
 * pages. Every sentence comes from about-facts.ts, which lists its sources.
 */
export function AboutDealer() {
  return (
    <section id="about" aria-labelledby="about-title" className="border-t border-line bg-ground-2 py-14">
      <div className="container mx-auto max-w-4xl px-4 md:px-8">
        <h2 id="about-title" className="mb-4 font-display text-h2 text-ink">
          {ABOUT_HEADING}
        </h2>
        <div className="space-y-4">
          {ABOUT_PARAGRAPHS.map((p) => (
            <p key={p} className="text-body text-ink-2">
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
