"use client"

import { usePathname } from "next/navigation"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"

/**
 * Generic path-derived breadcrumbs, for pages that do not supply their own.
 *
 * This is a FALLBACK. Several routes render `<Breadcrumbs>` from
 * components/seo/breadcrumbs themselves, because they emit BreadcrumbList
 * structured data with real labels that a path-derived trail cannot produce
 * (a vehicle's title, a brand's proper name, a landing page's query phrase).
 * Those routes must opt out here, or the page renders two visible trails AND
 * two BreadcrumbList blocks — search engines treat the second as a competing
 * definition of the same page.
 *
 * The list below drifted once already: it named only /inventory, /brands and
 * /used-cars while /locations, /privacy-policy and /terms had since grown their
 * own breadcrumbs, so all three shipped duplicates. If you add `<Breadcrumbs>`
 * to a page, add its route here in the same commit.
 *
 * Verify with:
 *   grep -rln "<Breadcrumbs" app --include=*.tsx
 * Every route in that output must be matched by an entry below.
 */
const OWN_BREADCRUMBS = [
  "/inventory",
  "/brands",
  "/used-cars",
  "/locations",
  "/privacy-policy",
  "/terms",
]

export function ConditionalBreadcrumbs() {
  const pathname = usePathname()

  if (!pathname || pathname === "/" || pathname.startsWith("/admin")) return null
  if (OWN_BREADCRUMBS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null

  return <Breadcrumbs />
}
