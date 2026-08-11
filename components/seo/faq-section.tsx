export interface FaqItem {
  question: string
  answer: string
}

/**
 * FAQ block with FAQPage schema.
 *
 * Rendered as <details>/<summary> rather than a JS accordion so the answer text
 * is present in the served HTML — a click-to-open accordion that mounts its
 * answers client-side gives Google nothing to read, which defeats the point of
 * marking it up as an FAQ.
 */
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
    <section className="py-16 bg-ground border-t border-line">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <h2 className="font-display text-h2 text-ink mb-3">{title}</h2>
        {intro && <p className="text-body text-ink-2 mb-8 max-w-2xl">{intro}</p>}

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
      </div>
    </section>
  )
}
