import type { Metadata } from "next"
import Link from "next/link"
import {
  Inbox, MessageSquare, AlarmClock, AlertTriangle, UserX, ArrowRight, Car, Database, Phone,
} from "lucide-react"
import { adminGetStats, adminGetStorageInfo, adminListLeads } from "@/lib/leads/actions"
import { getInventory } from "@/lib/inventory/server"
import type { LeadStatus } from "@/lib/leads/types"

export const metadata: Metadata = {
  title: "Dashboard",
  robots: "noindex, nofollow",
}

const STATUS_STYLES: Record<LeadStatus, string> = {
  New: "bg-blue-50 text-blue-700 border-blue-200",
  Contacted: "bg-amber-50 text-amber-700 border-amber-200",
  "Follow-up": "bg-purple-50 text-purple-700 border-purple-200",
  Qualified: "bg-teal-50 text-teal-700 border-teal-200",
  Won: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Lost: "bg-zinc-100 text-zinc-500 border-zinc-200",
}

export default async function AdminDashboard() {
  // Every number below is computed from real data. The previous dashboard
  // showed hardcoded figures ("156 vehicles", "₹4.5Cr revenue", "+12%").
  const [stats, storage, recent, dueSoon, inventory] = await Promise.all([
    adminGetStats(),
    adminGetStorageInfo(),
    adminListLeads({}, "newest", 1, 6),
    adminListLeads({ dueOnly: true }, "follow-up", 1, 5),
    getInventory(),
  ])

  const kpis = [
    { label: "Total leads", value: stats.total, icon: Inbox, tone: "text-[#023468]", href: "/admin/leads" },
    { label: "New today", value: stats.newToday, icon: MessageSquare, tone: "text-blue-600", href: "/admin/leads?status=New" },
    { label: "Follow-ups due", value: stats.dueToday + stats.overdue, icon: AlarmClock, tone: "text-amber-600", href: "/admin/leads?due=1" },
    { label: "Overdue", value: stats.overdue, icon: AlertTriangle, tone: "text-[#E31837]", href: "/admin/leads?due=1" },
    { label: "Unassigned", value: stats.unassigned, icon: UserX, tone: "text-purple-600", href: "/admin/leads" },
    { label: "Cars in stock", value: inventory.total, icon: Car, tone: "text-emerald-600", href: "/inventory" },
  ]

  return (
    <div className="space-y-6">
      {storage.warning && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3">
          <Database className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-amber-800 leading-relaxed">{storage.warning}</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {kpis.map((k) => (
          <Link
            key={k.label}
            href={k.href}
            className="bg-white rounded-2xl border border-black/8 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-black/40">{k.label}</span>
              <k.icon className={`h-4 w-4 ${k.tone}`} />
            </div>
            <p className={`text-2xl font-black ${k.tone}`}>{k.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent leads */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-black/8 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
            <h2 className="text-sm font-black uppercase tracking-widest text-[#023468]">Recent enquiries</h2>
            <Link href="/admin/leads" className="text-[10px] font-black uppercase tracking-widest text-[#023468] hover:text-[#E31837] flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recent.leads.length === 0 ? (
            <div className="p-12 text-center">
              <Inbox className="h-10 w-10 text-black/20 mx-auto mb-3" />
              <p className="text-sm font-bold text-black/70">No enquiries yet</p>
              <p className="text-xs text-black/45 mt-1">
                Leads from the website will appear here the moment they arrive.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-black/5">
              {recent.leads.map((lead) => (
                <li key={lead.id}>
                  <Link href={`/admin/leads/${lead.id}`} className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-zinc-50/70 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#023468] truncate">{lead.name}</p>
                      <p className="text-[11px] text-black/50 font-medium">
                        {lead.phone} · {lead.intent}
                        {lead.vehicle.title ? ` · ${lead.vehicle.title}` : ""}
                      </p>
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${STATUS_STYLES[lead.status]}`}>
                      {lead.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Follow-up queue */}
        <div className="bg-white rounded-2xl border border-black/8 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
            <h2 className="text-sm font-black uppercase tracking-widest text-[#023468]">Call back now</h2>
            <AlarmClock className="h-4 w-4 text-amber-600" />
          </div>

          {dueSoon.leads.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-bold text-black/70">Nothing due</p>
              <p className="text-xs text-black/45 mt-1">No follow-ups are outstanding.</p>
            </div>
          ) : (
            <ul className="divide-y divide-black/5">
              {dueSoon.leads.map((lead) => (
                <li key={lead.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <Link href={`/admin/leads/${lead.id}`} className="min-w-0">
                      <p className="text-sm font-bold text-[#023468] truncate">{lead.name}</p>
                      <p className="text-[11px] text-[#E31837] font-bold">
                        {lead.nextFollowUpAt
                          ? new Date(lead.nextFollowUpAt).toLocaleString("en-IN", {
                              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                            })
                          : ""}
                      </p>
                    </Link>
                    <a
                      href={`tel:${lead.phone}`}
                      className="h-8 w-8 shrink-0 rounded-lg bg-[#023468] text-white flex items-center justify-center hover:bg-[#01254a] transition-all"
                      title={`Call ${lead.name}`}
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
