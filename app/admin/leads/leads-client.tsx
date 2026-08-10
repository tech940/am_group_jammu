"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Search, Download, Phone, Mail, ChevronLeft, ChevronRight, AlarmClock,
  AlertTriangle, Inbox, UserX, Loader2, MessageSquare, Car, Database,
} from "lucide-react"
import { adminBulkStatus, adminExportCsv } from "@/lib/leads/actions"
import { LEAD_INTENTS, LEAD_STATUSES } from "@/lib/leads/types"
import type { LeadFilters, LeadListResult, LeadSort, LeadStats, LeadStatus } from "@/lib/leads/types"
import { useToast } from "@/hooks/use-toast"

const STATUS_STYLES: Record<LeadStatus, string> = {
  New: "bg-blue-50 text-blue-700 border-blue-200",
  Contacted: "bg-amber-50 text-amber-700 border-amber-200",
  "Follow-up": "bg-purple-50 text-purple-700 border-purple-200",
  Qualified: "bg-teal-50 text-teal-700 border-teal-200",
  Won: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Lost: "bg-zinc-100 text-zinc-500 border-zinc-200",
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString("en-IN")
}

function dueLabel(iso: string | null): { text: string; overdue: boolean } | null {
  if (!iso) return null
  const due = new Date(iso).getTime()
  const overdue = due < Date.now()
  return {
    text: new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
    overdue,
  }
}

export function LeadsClient({
  result,
  stats,
  filters,
  sort,
  storageWarning,
}: {
  result: LeadListResult
  stats: LeadStats
  filters: LeadFilters
  sort: LeadSort
  storageWarning: string | null
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState(filters.search ?? "")
  const [exporting, setExporting] = useState(false)

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize))

  const setParam = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") params.delete(k)
      else params.set(k, v)
    }
    if (!("page" in patch)) params.delete("page")
    startTransition(() => router.push(`/admin/leads?${params.toString()}`))
  }

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === result.leads.length ? new Set() : new Set(result.leads.map((l) => l.id)),
    )
  }

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleBulk = (status: LeadStatus) => {
    const ids = [...selected]
    if (ids.length === 0) return
    startTransition(async () => {
      const res = await adminBulkStatus(ids, status)
      if (res.ok) {
        toast({ title: `Updated ${res.data} lead${res.data === 1 ? "" : "s"}`, description: `Marked as ${status}.` })
        setSelected(new Set())
        router.refresh()
      } else {
        toast({ title: "Bulk update failed", description: res.error, variant: "destructive" })
      }
    })
  }

  const handleExport = async () => {
    setExporting(true)
    const res = await adminExportCsv(filters, sort)
    setExporting(false)
    if (!res.ok) {
      toast({ title: "Export failed", description: res.error, variant: "destructive" })
      return
    }
    const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `am-group-leads-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const kpis = useMemo(
    () => [
      { label: "Total leads", value: stats.total, icon: Inbox, tone: "text-[#023468]" },
      { label: "New today", value: stats.newToday, icon: MessageSquare, tone: "text-blue-600" },
      { label: "Due today", value: stats.dueToday, icon: AlarmClock, tone: "text-amber-600" },
      { label: "Overdue", value: stats.overdue, icon: AlertTriangle, tone: "text-[#E31837]" },
      { label: "Unassigned", value: stats.unassigned, icon: UserX, tone: "text-purple-600" },
    ],
    [stats],
  )

  return (
    <div className="space-y-6">
      {storageWarning && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3">
          <Database className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-amber-800 leading-relaxed">{storageWarning}</p>
        </div>
      )}

      {/* KPIs — computed from the real table, not a hardcoded array */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-black/8 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-black/40">{k.label}</span>
              <k.icon className={`h-4 w-4 ${k.tone}`} />
            </div>
            <p className={`text-2xl font-black ${k.tone}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Status pipeline */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setParam({ status: null, due: null })}
          className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
            (filters.status ?? "all") === "all" && !filters.dueOnly
              ? "bg-[#023468] text-white border-[#023468]"
              : "bg-white text-black/60 border-black/10 hover:border-[#023468]/40"
          }`}
        >
          All {stats.total}
        </button>
        {LEAD_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setParam({ status: s, due: null })}
            className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
              filters.status === s
                ? "bg-[#023468] text-white border-[#023468]"
                : "bg-white text-black/60 border-black/10 hover:border-[#023468]/40"
            }`}
          >
            {s} {stats.byStatus[s] ?? 0}
          </button>
        ))}
        <button
          onClick={() => setParam({ due: filters.dueOnly ? null : "1", status: null })}
          className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
            filters.dueOnly
              ? "bg-[#E31837] text-white border-[#E31837]"
              : "bg-white text-[#E31837] border-[#E31837]/30 hover:bg-[#E31837]/5"
          }`}
        >
          <AlarmClock className="h-3 w-3 inline mr-1 -mt-0.5" />
          Follow-ups due {stats.dueToday + stats.overdue}
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-black/8 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setParam({ q: search || null })
            }}
            className="relative flex-1"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, email or message…"
              className="w-full bg-zinc-50 border border-black/8 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#023468]"
            />
          </form>

          <select
            value={filters.intent ?? "all"}
            onChange={(e) => setParam({ intent: e.target.value === "all" ? null : e.target.value })}
            aria-label="Filter by enquiry type"
            className="bg-zinc-50 border border-black/8 rounded-xl px-3 py-2.5 text-xs font-bold cursor-pointer focus:outline-none"
          >
            <option value="all">All enquiry types</option>
            {LEAD_INTENTS.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setParam({ sort: e.target.value })}
            aria-label="Sort leads"
            className="bg-zinc-50 border border-black/8 rounded-xl px-3 py-2.5 text-xs font-bold cursor-pointer focus:outline-none"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="follow-up">Follow-up due</option>
            <option value="name">Name A–Z</option>
          </select>

          <button
            onClick={handleExport}
            disabled={exporting || result.total === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#023468] hover:bg-[#01254a] disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Export CSV
          </button>
        </div>

        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-black/5">
            <span className="text-[11px] font-black uppercase tracking-wider text-black/50">
              {selected.size} selected — mark as
            </span>
            {LEAD_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => handleBulk(s)}
                disabled={isPending}
                className="px-2.5 py-1 rounded-full border border-black/10 text-[10px] font-black uppercase tracking-wider hover:bg-[#023468] hover:text-white hover:border-[#023468] transition-all cursor-pointer disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-black/8 shadow-sm overflow-hidden">
        {result.leads.length === 0 ? (
          <div className="p-16 text-center">
            <Inbox className="h-12 w-12 text-black/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-black mb-1">No leads match these filters</h3>
            <p className="text-xs text-black/50">
              {stats.total === 0
                ? "Enquiries from the website will appear here as soon as they arrive."
                : "Try clearing the search or switching status."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 border-b border-black/5">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      aria-label="Select all"
                      checked={selected.size === result.leads.length && result.leads.length > 0}
                      onChange={toggleAll}
                      className="h-4 w-4 accent-[#023468] cursor-pointer"
                    />
                  </th>
                  {["Customer", "Enquiry", "Vehicle", "Status", "Follow-up", "Received", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-black/40">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {result.leads.map((lead) => {
                  const due = dueLabel(lead.nextFollowUpAt)
                  return (
                    <tr key={lead.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          aria-label={`Select ${lead.name}`}
                          checked={selected.has(lead.id)}
                          onChange={() => toggleOne(lead.id)}
                          className="h-4 w-4 accent-[#023468] cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/leads/${lead.id}`} className="group">
                          <p className="text-sm font-bold text-[#023468] group-hover:text-[#E31837] transition-colors">
                            {lead.name}
                          </p>
                          <p className="text-[11px] text-black/50 font-medium">{lead.phone}</p>
                          {lead.email && <p className="text-[11px] text-black/35 truncate max-w-[200px]">{lead.email}</p>}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-bold text-black/70">{lead.intent}</span>
                        {lead.sourcePath && (
                          <p className="text-[10px] text-black/35 truncate max-w-[160px]">{lead.sourcePath}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {lead.vehicle.title ? (
                          <div className="flex items-center gap-1.5">
                            <Car className="h-3.5 w-3.5 text-black/30 shrink-0" />
                            <span className="text-[11px] font-semibold text-black/70 truncate max-w-[160px]">
                              {lead.vehicle.title}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-black/25">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${STATUS_STYLES[lead.status]}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {due ? (
                          <span className={`text-[11px] font-bold ${due.overdue ? "text-[#E31837]" : "text-black/60"}`}>
                            {due.overdue && <AlertTriangle className="h-3 w-3 inline mr-1 -mt-0.5" />}
                            {due.text}
                          </span>
                        ) : (
                          <span className="text-[11px] text-black/25">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] text-black/50 font-medium whitespace-nowrap">
                          {timeAgo(lead.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${lead.phone}`}
                            title="Call"
                            className="h-8 w-8 rounded-lg bg-zinc-100 hover:bg-[#023468] hover:text-white flex items-center justify-center transition-all"
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                          {lead.email && (
                            <a
                              href={`mailto:${lead.email}`}
                              title="Email"
                              className="h-8 w-8 rounded-lg bg-zinc-100 hover:bg-[#023468] hover:text-white flex items-center justify-center transition-all"
                            >
                              <Mail className="h-3.5 w-3.5" />
                            </a>
                          )}
                          <Link
                            href={`/admin/leads/${lead.id}`}
                            className="px-3 h-8 rounded-lg bg-[#023468] text-white text-[10px] font-black uppercase tracking-wider flex items-center hover:bg-[#01254a] transition-all"
                          >
                            Open
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-black/5 bg-zinc-50/50">
            <span className="text-[11px] font-semibold text-black/50">
              Page {result.page} of {totalPages} · {result.total} leads
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setParam({ page: String(result.page - 1) })}
                disabled={result.page <= 1 || isPending}
                className="h-8 w-8 rounded-lg border border-black/10 flex items-center justify-center disabled:opacity-40 hover:bg-white transition-all cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setParam({ page: String(result.page + 1) })}
                disabled={result.page >= totalPages || isPending}
                className="h-8 w-8 rounded-lg border border-black/10 flex items-center justify-center disabled:opacity-40 hover:bg-white transition-all cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
