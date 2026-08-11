import Link from "next/link"

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
        tabIndex={0}
        className="container mx-auto px-4 md:px-8 pt-8 pb-1 md:pb-2 flex items-center gap-2 text-ink-2 overflow-x-auto overscroll-x-contain no-scrollbar whitespace-nowrap"
      >
        <Link
          href="/"
          className="text-meta uppercase transition-colors duration-(--duration-1) hover:text-ink"
        >
          Home
        </Link>

        {items.map((crumb, index) => {
          const isLast = index === items.length - 1
          return (
            <span key={`${crumb.label}-${index}`} className="flex items-center gap-2">
              <span aria-hidden className="text-ink-3">
                /
              </span>
              {isLast || !crumb.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className="text-meta uppercase text-accent-text-light"
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-meta uppercase transition-colors duration-(--duration-1) hover:text-ink"
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
