"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronGlyph } from "@/components/system/marks"
import { cn } from "@/lib/utils"
import { logout } from "@/lib/admin/actions"

// No icons: every destination is a word, and a word beside its own pictogram is
// noise. When the rail is collapsed the initial stands in for the word — the
// seven initials (D V I L C R S) are unique — and the full name is carried on
// `aria-label` / `title` so it is never lost.
const navItems = [
  { name: "Dashboard", href: "/admin" },
  { name: "Vehicles", href: "/admin/vehicles" },
  { name: "Inventory", href: "/admin/inventory" },
  { name: "Leads", href: "/admin/leads" },
  { name: "Customers", href: "/admin/customers" },
  { name: "Reports", href: "/admin/reports" },
  { name: "Settings", href: "/admin/settings" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Two independent states, because the rail means two different things.
  // On desktop it is a column that can be narrowed to initials; on a phone it
  // is an off-canvas drawer that is shut until asked for. Driving both from one
  // boolean meant the drawer was open on every phone page load.
  const [isRailCollapsed, setIsRailCollapsed] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const pathname = usePathname()

  // The sign-in page lives under /admin but must not render the admin chrome —
  // a sidebar full of links you cannot use is worse than no sidebar.
  if (pathname === "/admin/login") return <>{children}</>

  const showLabels = isDrawerOpen || !isRailCollapsed
  const closeDrawer = () => setIsDrawerOpen(false)

  return (
    <div className="min-h-screen bg-ground">
      {/* Backdrop — mobile only, where the rail overlays content. Without it,
          tapping away from an open drawer does nothing. */}
      {isDrawerOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeDrawer}
          className="fixed inset-0 z-40 bg-ink/60 md:hidden"
        />
      )}

      {/* Sidebar.
          Below md this is an off-canvas drawer, not a column: the rail is 256px
          and a phone is 375px, so reserving that width left roughly 119px for
          the lead table. It slides in over the content instead, and the main
          column takes no margin at all until md. */}
      <aside
        data-ground="deep"
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 bg-deep text-on-deep transition-transform duration-(--duration-3) md:transition-[width]",
          isDrawerOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
          isRailCollapsed ? "md:w-20" : "md:w-64",
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex h-16 items-center gap-2 border-b border-line-on-deep px-3",
            showLabels ? "justify-between" : "justify-center"
          )}
        >
          {/* Local copy, not the wp-content hot-link this replaced: the
              WordPress host is being decommissioned, and the logo is already
              in the repo. Byte-identical asset, no filter needed — the
              artwork is white to begin with. Hidden while collapsed: an 80px
              rail cannot hold the mark and the toggle side by side. */}
          {showLabels && (
            <div className="flex min-w-0 items-center gap-3">
              <Image
                src="/logo-am-group.png"
                alt="AM Group"
                width={169}
                height={112}
                priority
                className="h-8 w-auto object-contain"
              />
              <span className="text-label text-on-deep">Admin Panel</span>
            </div>
          )}
          {/* Same control, two jobs: dismiss the drawer on a phone, narrow the
              rail to initials on desktop. */}
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close navigation"
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-sm text-on-deep transition-colors duration-(--duration-1) hover:bg-line-on-deep md:hidden"
          >
            <ChevronGlyph direction="left" />
          </button>
          <button
            type="button"
            onClick={() => setIsRailCollapsed(!isRailCollapsed)}
            aria-label={isRailCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isRailCollapsed}
            className="hidden h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-sm text-on-deep transition-colors duration-(--duration-1) hover:bg-line-on-deep md:flex"
          >
            <ChevronGlyph direction={isRailCollapsed ? "right" : "left"} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                aria-label={showLabels ? undefined : item.name}
                title={showLabels ? undefined : item.name}
                onClick={closeDrawer}
                className={cn(
                  "flex min-h-11 items-center rounded-sm transition-colors duration-(--duration-1)",
                  showLabels ? "px-4" : "justify-center px-0",
                  isActive
                    ? "bg-ground text-ink"
                    : "text-on-deep-2 hover:bg-line-on-deep hover:text-on-deep"
                )}
              >
                {showLabels ? (
                  <span className="text-nav">{item.name}</span>
                ) : (
                  <span aria-hidden className="font-display text-h4 leading-none uppercase">
                    {item.name.charAt(0)}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="absolute right-0 bottom-0 left-0 border-t border-line-on-deep p-4">
          <form action={logout}>
            <button
              type="submit"
              aria-label={showLabels ? undefined : "Sign out"}
              title={showLabels ? undefined : "Sign out"}
              className={cn(
                "flex min-h-11 w-full cursor-pointer items-center rounded-sm text-on-deep-2 transition-colors duration-(--duration-1) hover:bg-line-on-deep hover:text-on-deep",
                showLabels ? "px-4" : "justify-center px-0"
              )}
            >
              {showLabels ? (
                <span className="text-nav">Sign out</span>
              ) : (
                <span aria-hidden className="text-meta uppercase">
                  Out
                </span>
              )}
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-(--duration-3)",
          // No margin below md — the rail overlays there.
          isRailCollapsed ? "md:ml-20" : "md:ml-64"
        )}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b border-line bg-surface shadow-raised">
          <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
            {/* The only way to reach navigation on a phone, since the rail is
                off-canvas there. Hidden from md up, where the rail is visible
                and carries its own collapse toggle. */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open navigation"
              aria-expanded={isDrawerOpen}
              className="-ml-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-sm text-ink transition-colors duration-(--duration-1) hover:bg-ground-2 md:hidden"
            >
              <ChevronGlyph direction="right" />
            </button>
            <h1 className="min-w-0 flex-1 truncate font-display text-h3 uppercase text-ink">
              {navItems.find((item) => item.href !== "/admin" && pathname.startsWith(item.href))?.name ?? "Dashboard"}
            </h1>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-deep text-label text-on-deep">
                AM
              </div>
              <div className="hidden md:block">
                <p className="text-small font-medium text-ink">Signed in</p>
                <p className="text-caption text-ink-2">AM Group staff</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="mx-auto max-w-[1280px] px-5 py-6 md:px-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
