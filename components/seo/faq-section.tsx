import { jsonLdString } from "@/lib/seo-schemas"

export interface FaqItem {
  question: string
  answer: string
}

/**
 * The questions and answers themselves, with FAQPage schema.
 *
 * Rendered as <details>/<summary> rather than a JS accordion so the answer text
 * is present in the served HTML — a click-to-open accordion that mounts its
 * answers client-side gives a search engine or an AI assistant nothing to read.
 *
 * Google stopped showing FAQ rich results in 2026, so the markup is not here
 * to win one. It stays because it labels each answer with its question for any
 * program that reads the page.
 *
 * Exported on its own so a page with its own section furniture (the homepage)
 * can place the list inside it; `FaqSection` below is the ready-made section.
 */
export function FaqList({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        // "<" is escaped so a question or answer containing "</script>" (car
        // names and colours come from the admin panel) cannot end the block.
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <div className="divide-y divide-line border-y border-line">
        {items.map((faq) => (
          <details key={faq.question} className="group py-4">
            <summary className="flex min-h-11 items-center justify-between gap-4 cursor-pointer list-none">
              <h3 className="font-display text-h3 text-ink">{faq.question}</h3>
              <span
                aria-hidden
                className="text-h3 leading-none text-ink-3 group-open:rotate-45 transition-transform duration-(--duration-2) shrink-0"
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-body text-ink-2 pr-8">{faq.answer}</p>
          </details>
        ))}
      </div>
    </>
  )
}

/** FAQ block as a full-width section, used by listing, landing and car pages. */
export function FaqSection({
  items,
  title = "Frequently Asked Questions",
  intro,
}: {
  items: FaqItem[]
  title?: string
  intro?: string
}) {
  if (items.length === 0) return null

  return (
    <section className="py-16 bg-ground border-t border-line">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <h2 className="font-display text-h2 text-ink mb-3">{title}</h2>
        {intro && <p className="text-body text-ink-2 mb-8 max-w-2xl">{intro}</p>}
        <FaqList items={items} />
      </div>
    </section>
  )
}
