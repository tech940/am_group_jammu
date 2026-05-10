"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

export function Breadcrumbs() {
  const pathname = usePathname()

  // Don't show breadcrumbs on homepage or if pathname is missing
  if (!pathname || pathname === "/") return null


  // Split path into segments
  const pathSegments = pathname.split("/").filter((segment) => segment !== "")

  // Function to format segments (e.g., "hyundai-ioniq-5" -> "Hyundai Ioniq 5")
  const formatSegment = (segment: string) => {
    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <nav className="container mx-auto px-6 mt-20 md:px-12 py-6 flex items-center gap-2 text-sm text-black/40 overflow-x-auto whitespace-nowrap scrollbar-hide">
      <Link
        href="/"
        className="flex items-center gap-1.5 hover:text-black transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="font-bold uppercase tracking-widest text-[10px]">Home</span>
      </Link>

      {pathSegments.map((segment, index) => {
        const path = `/${pathSegments.slice(0, index + 1).join("/")}`
        const isLast = index === pathSegments.length - 1

        return (
          <React.Fragment key={path}>
            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
            {isLast ? (
              <span className="font-bold uppercase tracking-widest text-[10px] text-[#E31837]">
                {formatSegment(segment)}
              </span>
            ) : (
              <Link
                href={path}
                className="font-bold uppercase tracking-widest text-[10px] hover:text-black transition-colors"
              >
                {formatSegment(segment)}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
