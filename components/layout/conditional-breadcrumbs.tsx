"use client"

import { usePathname } from "next/navigation"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"

/**
 * Generic path-derived breadcrumbs for pages that do not supply their own.
 *
 * /inventory and vehicle pages render <Breadcrumbs> from components/seo, which
 * emits BreadcrumbList schema and proper labels, so they are excluded here to
 * avoid two breadcrumb trails (and two sets of structured data) on one page.
 */
const OWN_BREADCRUMBS = ["/inventory", "/brands", "/used-cars"]

export function ConditionalBreadcrumbs() {
  const pathname = usePathname()

  if (!pathname || pathname === "/" || pathname.startsWith("/admin")) return null
  if (OWN_BREADCRUMBS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null

  return <Breadcrumbs />
}
