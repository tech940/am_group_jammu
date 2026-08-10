"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "./navbar"
import type { SeoLinks } from "@/lib/seo/links"

export function ConditionalNavbar({ seoLinks }: { seoLinks: SeoLinks }) {
  const pathname = usePathname()

  // Hide navbar on admin pages
  if (pathname?.startsWith("/admin")) return null

  return <Navbar seoLinks={seoLinks} />
}
