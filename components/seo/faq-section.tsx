import { HelpCircle } from "lucide-react"

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
    <section className="py-16 bg-white border-t border-black/5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-3">
          <HelpCircle className="h-5 w-5 text-[#E31837]" />
          <h2 className="text-2xl md:text-3xl font-black text-[#023468]">{title}</h2>
        </div>
        {intro && <p className="text-sm text-black/55 leading-relaxed mb-8 max-w-2xl">{intro}</p>}

        <div className="divide-y divide-black/8 border-y border-black/8">
          {items.map((faq) => (
            <details key={faq.question} className="group py-4">
              <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
                <h3 className="text-base font-bold text-[#023468] leading-snug">{faq.question}</h3>
                <span className="text-2xl leading-none text-black/30 group-open:rotate-45 transition-transform shrink-0">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-black/65 leading-relaxed pr-8">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
