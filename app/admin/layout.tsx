"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut,
  Menu,
  X,
  TrendingUp,
  Package,
  FileText
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Vehicles", href: "/admin/vehicles", icon: Car },
  { name: "Inventory", href: "/admin/inventory", icon: Package },
  { name: "Leads", href: "/admin/leads", icon: MessageSquare },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Reports", href: "/admin/reports", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-[#023468] text-white transition-all duration-300",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img 
              src="https://amgroupind.com/wp-content/uploads/2023/06/logo-1.png" 
              alt="AM Group" 
              className="h-8 w-auto object-contain brightness-0 invert"
            />
            {isSidebarOpen && (
              <span className="font-bold text-sm">Admin Panel</span>
            )}
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                  isActive 
                    ? "bg-white text-[#023468]" 
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {isSidebarOpen && <span className="font-medium text-sm">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all">
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-300",
          isSidebarOpen ? "ml-64" : "ml-20"
        )}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-black/5 shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <div>
              <h1 className="text-xl font-bold text-[#023468]">
                {navItems.find(item => item.href === pathname)?.name || "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#023468] flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-black">Admin User</p>
                  <p className="text-xs text-black/60">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
