"use client"

import { usePathname } from "next/navigation"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"

export function ConditionalBreadcrumbs() {
  const pathname = usePathname()
  
  // Hide breadcrumbs on homepage, admin routes, or if pathname is missing
  if (!pathname || pathname === "/" || pathname.startsWith("/admin")) return null


  return <Breadcrumbs />
}
