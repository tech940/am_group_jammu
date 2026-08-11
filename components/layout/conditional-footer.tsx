"use client"

import { usePathname } from "next/navigation"
import { SiteFooter } from "@/components/system/site-footer"
import type { SeoLinks } from "@/lib/seo/links"

export function ConditionalFooter({ seoLinks }: { seoLinks: SeoLinks }) {
  const pathname = usePathname()

  // Hide footer on admin pages
  if (pathname?.startsWith("/admin")) return null

  return <SiteFooter seoLinks={seoLinks} />
}
