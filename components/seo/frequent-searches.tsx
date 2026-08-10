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
    <section className="py-10 bg-zinc-50 border-t border-black/5">
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="text-base md:text-lg font-black text-[#023468] mb-4">{title}</h2>
        <div className="flex flex-wrap gap-x-3 gap-y-2">
          {searches.map((s, i) => (
            <span key={s.href + i} className="flex items-center gap-3">
              <Link
                href={s.href}
                className="text-xs font-semibold text-black/60 hover:text-[#E31837] hover:underline transition-colors"
              >
                {s.label}
              </Link>
              {i < searches.length - 1 && <span className="text-black/15">|</span>}
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
        <div key={group.title} className="bg-white p-4 rounded-2xl border border-[#023468]/10 shadow-sm">
          <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#023468] mb-2.5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E31837] flex-shrink-0" />
            {group.title}
          </h3>
          <div className="flex flex-wrap gap-x-2.5 gap-y-1.5">
            {group.links.map((link, i) => (
              <span key={link.href} className="flex items-center gap-2.5">
                <Link
                  href={link.href}
                  className="text-[12px] font-bold text-black/80 hover:text-[#E31837] hover:underline transition-colors"
                >
                  {link.label}
                  {typeof link.count === "number" && (
                    <span className="ml-1 text-[#E31837] font-black">({link.count})</span>
                  )}
                </Link>
                {i < group.links.length - 1 && <span className="text-black/15">|</span>}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
