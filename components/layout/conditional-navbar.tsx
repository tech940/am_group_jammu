"use client"

import { usePathname } from "next/navigation"
import { SiteNav } from "@/components/system/site-nav"
import type { SeoLinks } from "@/lib/seo/links"

/**
 * seoLinks is still accepted so the root layout's call site is unchanged, but
 * the nav does not consume it — the crawlable stock-derived link graph lives in
 * the footer, which is where it was already server-rendered.
 */
export function ConditionalNavbar({ seoLinks: _seoLinks }: { seoLinks: SeoLinks }) {
  const pathname = usePathname()

  // The admin area has its own shell; a marketing header above a lead desk is
  // just noise.
  if (pathname?.startsWith("/admin")) return null

  return <SiteNav />
}
