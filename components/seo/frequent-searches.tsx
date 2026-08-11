import Link from "next/link"
import type { SeoLink, SeoLinkGroup } from "@/lib/seo/links"

/**
 * "Frequent Searches Leading to This Page" — a crawlable block of long-tail
 * internal links.
 *
 * Server-rendered so the anchors are in the served HTML. Every href points at a
 * facet that has stock behind it, so none of these are dead ends.
 */
export function FrequentSearches({
  searches,
  title = "Frequent Searches Leading to This Page",
}: {
  searches: SeoLink[]
  title?: string
}) {
  if (searches.length === 0) return null

  return (
    <section className="py-10 bg-ground-2 border-t border-line">
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="font-display text-h3 text-ink mb-4">{title}</h2>
        <div className="flex flex-wrap gap-x-3 gap-y-2">
          {searches.map((s, i) => (
            <span key={s.href + i} className="flex items-center gap-3">
              <Link
                href={s.href}
                className="text-small text-ink-2 hover:text-accent-text-light hover:underline transition-colors duration-(--duration-1)"
              >
                {s.label}
              </Link>
              {i < searches.length - 1 && (
                <span aria-hidden className="text-ink-3">
                  |
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * The grouped directory block (by brand / city / body type / budget …) used in
 * the footer and at the foot of listing pages.
 */
export function SeoLinkDirectory({
  groups,
  className = "",
}: {
  groups: SeoLinkGroup[]
  className?: string
}) {
  if (groups.length === 0) return null

  return (
    <div className={`space-y-3 ${className}`}>
      {groups.map((group) => (
        <div key={group.title} className="bg-surface p-4 border border-line">
          <h3 className="text-meta uppercase text-ink mb-2.5">{group.title}</h3>
          <div className="flex flex-wrap gap-x-2.5 gap-y-1.5">
            {group.links.map((link, i) => (
              <span key={link.href} className="flex items-center gap-2.5">
                <Link
                  href={link.href}
                  className="text-caption text-ink hover:text-accent-text-light hover:underline transition-colors duration-(--duration-1)"
                >
                  {link.label}
                  {typeof link.count === "number" && (
                    <span data-num className="ml-1 text-accent-text-light">
                      ({link.count})
                    </span>
                  )}
                </Link>
                {i < group.links.length - 1 && (
                  <span aria-hidden className="text-ink-3">
                    |
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
