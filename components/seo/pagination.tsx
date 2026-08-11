import Link from "next/link"
import { ChevronGlyph } from "@/components/system/marks"

/**
 * Crawlable pagination.
 *
 * Real <a href> elements, not buttons calling router.push — a crawler has to be
 * able to walk from page 1 to page N to discover every listing. Each page also
 * self-canonicalises (set by the page's generateMetadata), which is current
 * Google guidance now that rel=prev/next is no longer used.
 */
export function Pagination({
  page,
  totalPages,
  buildHref,
  totalItems,
  pageSize,
}: {
  page: number
  totalPages: number
  buildHref: (page: number) => string
  totalItems: number
  pageSize: number
}) {
  if (totalPages <= 1) return null

  // Windowed page numbers: 1 … 3 4 [5] 6 7 … 12
  const windowSize = 2
  const pages: (number | "gap")[] = []
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= page - windowSize && p <= page + windowSize)) {
      pages.push(p)
    } else if (pages[pages.length - 1] !== "gap") {
      pages.push("gap")
    }
  }

  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, totalItems)

  const base =
    "h-11 min-w-11 px-3 rounded-sm border text-button flex items-center justify-center transition-colors duration-(--duration-1)"
  const enabled = `${base} border-line-strong bg-surface text-ink hover:bg-deep hover:text-on-deep`
  const disabled = `${base} border-line bg-ground-2 text-ink-3`

  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {page > 1 ? (
          <Link
            href={buildHref(page - 1)}
            rel="prev"
            aria-label="Previous page"
            className={enabled}
          >
            <ChevronGlyph direction="left" />
          </Link>
        ) : (
          <span className={disabled} aria-disabled="true">
            <ChevronGlyph direction="left" />
          </span>
        )}

        {pages.map((p, i) =>
          p === "gap" ? (
            <span key={`gap-${i}`} className="px-1 text-ink-3 text-button">
              …
            </span>
          ) : p === page ? (
            <span
              key={p}
              aria-current="page"
              data-num
              className={`${base} border-deep bg-deep text-on-deep`}
            >
              {p}
            </span>
          ) : (
            <Link key={p} href={buildHref(p)} data-num className={enabled}>
              {p}
            </Link>
          ),
        )}

        {page < totalPages ? (
          <Link href={buildHref(page + 1)} rel="next" aria-label="Next page" className={enabled}>
            <ChevronGlyph direction="right" />
          </Link>
        ) : (
          <span className={disabled} aria-disabled="true">
            <ChevronGlyph direction="right" />
          </span>
        )}
      </div>

      <p data-num className="text-small text-ink-2">
        Showing {first}–{last} of {totalItems} cars · Page {page} of {totalPages}
      </p>
    </nav>
  )
}
