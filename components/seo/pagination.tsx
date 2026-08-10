import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
    "h-10 min-w-10 px-3 rounded-xl border text-xs font-black flex items-center justify-center transition-all"

  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {page > 1 ? (
          <Link
            href={buildHref(page - 1)}
            rel="prev"
            aria-label="Previous page"
            className={`${base} border-black/10 bg-white text-[#023468] hover:bg-[#023468] hover:text-white`}
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <span className={`${base} border-black/5 bg-zinc-50 text-black/20`} aria-disabled="true">
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}

        {pages.map((p, i) =>
          p === "gap" ? (
            <span key={`gap-${i}`} className="px-1 text-black/30 text-xs font-black">
              …
            </span>
          ) : p === page ? (
            <span
              key={p}
              aria-current="page"
              className={`${base} border-[#023468] bg-[#023468] text-white`}
            >
              {p}
            </span>
          ) : (
            <Link
              key={p}
              href={buildHref(p)}
              className={`${base} border-black/10 bg-white text-[#023468] hover:bg-[#023468] hover:text-white`}
            >
              {p}
            </Link>
          ),
        )}

        {page < totalPages ? (
          <Link
            href={buildHref(page + 1)}
            rel="next"
            aria-label="Next page"
            className={`${base} border-black/10 bg-white text-[#023468] hover:bg-[#023468] hover:text-white`}
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className={`${base} border-black/5 bg-zinc-50 text-black/20`} aria-disabled="true">
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>

      <p className="text-xs font-semibold text-black/45">
        Showing {first}–{last} of {totalItems} cars · Page {page} of {totalPages}
      </p>
    </nav>
  )
}
