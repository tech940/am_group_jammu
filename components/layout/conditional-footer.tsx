"use client"

import { usePathname } from "next/navigation"
import { Footer } from "./footer"
import type { SeoLinks } from "@/lib/seo/links"

export function ConditionalFooter({ seoLinks }: { seoLinks: SeoLinks }) {
  const pathname = usePathname()

  // Hide footer on admin pages
  if (pathname?.startsWith("/admin")) return null

  return <Footer seoLinks={seoLinks} />
}
