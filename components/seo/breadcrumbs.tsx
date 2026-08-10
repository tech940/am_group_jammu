import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

export interface Crumb {
  label: string
  /** Omit on the final crumb. */
  href?: string
}

const SITE = "https://amgroupind.com"

/**
 * Server-rendered breadcrumbs with BreadcrumbList schema.
 *
 * Replaces the client-side version that derived labels from the URL — which
 * turned /inventory/hyundai-alcazar-2022-5099 into the crumb
 * "Hyundai Alcazar 2022 5099" and emitted no structured data at all.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length === 0) return null

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      ...items.map((c, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: c.label,
        ...(c.href ? { item: `${SITE}${c.href}` } : {}),
      })),
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        aria-label="Breadcrumb"
        className="container mx-auto px-4 md:px-8 pt-24 pb-1 md:pb-2 flex items-center gap-2 text-sm text-black/50 overflow-x-auto whitespace-nowrap scrollbar-hide"
      >
        <Link href="/" className="flex items-center gap-1.5 hover:text-black transition-colors">
          <Home className="h-3.5 w-3.5" />
          <span className="font-bold uppercase tracking-widest text-[10px]">Home</span>
        </Link>

        {items.map((crumb, index) => {
          const isLast = index === items.length - 1
          return (
            <span key={`${crumb.label}-${index}`} className="flex items-center gap-2">
              <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
              {isLast || !crumb.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className="font-bold uppercase tracking-widest text-[10px] text-[#E31837]"
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="font-bold uppercase tracking-widest text-[10px] hover:text-black transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          )
        })}
      </nav>
    </>
  )
}
