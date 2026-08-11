"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

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
    <nav
      aria-label="Breadcrumb"
      tabIndex={0}
      className="container mx-auto px-4 md:px-8 pt-8 pb-1 md:pb-2 flex items-center gap-2 text-ink-2 overflow-x-auto overscroll-x-contain no-scrollbar whitespace-nowrap"
    >
      <Link
        href="/"
        className="text-meta uppercase transition-colors duration-(--duration-1) hover:text-ink"
      >
        Home
      </Link>

      {pathSegments.map((segment, index) => {
        const path = `/${pathSegments.slice(0, index + 1).join("/")}`
        const isLast = index === pathSegments.length - 1

        return (
          <React.Fragment key={path}>
            <span aria-hidden className="text-ink-3">
              /
            </span>
            {isLast ? (
              <span aria-current="page" className="text-meta uppercase text-accent-text-light">
                {formatSegment(segment)}
              </span>
            ) : (
              <Link
                href={path}
                className="text-meta uppercase transition-colors duration-(--duration-1) hover:text-ink"
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
