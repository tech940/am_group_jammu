import Link from "@/components/system/intent-link"
import type { SeoLinkGroup } from "@/lib/seo/links"

/**
 * Sibling links for landing and brand pages: budget ↔ body ↔ make ↔ model,
 * plus the two pages every buyer or seller eventually needs.
 *
 * Server-rendered so the anchors are in the served HTML. Each link is a 44px
 * target because most of this audience is on a phone. Groups with no links are
 * dropped by the caller's data, not hidden here with CSS.
 */
export function RelatedLinks({
  groups,
  title = "More ways to browse used cars in Jammu",
}: {
  groups: SeoLinkGroup[]
  title?: string
}) {
  const shown = groups.filter((g) => g.links.length > 0)

  return (
    <section aria-labelledby="related-links-title" className="border-t border-line bg-ground py-14">
      <div className="container mx-auto px-4 md:px-8">
        <h2 id="related-links-title" className="font-display text-h2 text-ink">
          {title}
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h3 className="border-b border-line pb-2 text-label text-ink">{group.title}</h3>
              <ul>
                {group.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="flex min-h-11 items-center justify-between gap-3 border-b border-line text-body text-ink-2 transition-colors duration-(--duration-1) hover:text-accent-text-light"
                    >
                      <span>{l.label}</span>
                      {typeof l.count === "number" && (
                        <span data-num className="text-small text-ink-3">
                          {l.count}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <nav aria-label="Sell and visit">
            <h3 className="border-b border-line pb-2 text-label text-ink">Sell and visit</h3>
            <ul>
              {[
                { label: "Sell your car in Jammu", href: "/sell-your-car" },
                { label: "Our used-car locations", href: "/locations" },
                // The stock list is the "used cars in Jammu" page (HEAD_PATH).
                { label: "Used cars in Jammu", href: "/inventory" },
                { label: "Browse by budget, model and type", href: "/used-cars" },
                { label: "All used cars in stock", href: "/inventory" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="flex min-h-11 items-center border-b border-line text-body text-ink-2 transition-colors duration-(--duration-1) hover:text-accent-text-light"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  )
}
