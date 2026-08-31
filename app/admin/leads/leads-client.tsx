"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { adminBulkStatus, adminExportCsv } from "@/lib/leads/actions"
import { LEAD_INTENTS, LEAD_STATUSES } from "@/lib/leads/types"
import type { LeadFilters, LeadListResult, LeadSort, LeadStats, LeadStatus } from "@/lib/leads/types"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Alert, Badge, EmptyState, Spinner } from "@/components/ui/feedback"
import { Field, Input, Select } from "@/components/ui/field"
import { AlertGlyph, ChevronGlyph } from "@/components/system/marks"

/**
 * Status reads as a semantic tone, never as a palette colour. The previous
 * chips were `bg-blue-50 text-blue-700 border-blue-200` — Tailwind defaults
 * that belong to no system and carried no meaning.
 */
const STATUS_TONE: Record<LeadStatus, "neutral" | "success" | "warning" | "info"> = {
  New: "info",
  Contacted: "warning",
  "Follow-up": "info",
  Qualified: "success",
  Won: "success",
  Lost: "neutral",
}

/** Two-state filter chip. Not a Button variant — a toggle is its own thing. */
const CHIP =
  "inline-flex h-11 cursor-pointer items-center justify-center rounded-sm border px-4 " +
  "text-button uppercase transition-colors duration-(--duration-1)"
const CHIP_ON = "border-deep bg-deep text-on-deep hover:bg-deep-2"
const CHIP_OFF = "border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink"
const CHIP_DUE_ON = "border-accent bg-accent text-on-accent hover:bg-accent-hover"
const CHIP_DUE_OFF = "border-line bg-surface text-accent-text-light hover:border-line-strong"

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
      { label: "Total leads", value: stats.total, tone: "text-ink" },
      { label: "New today", value: stats.newToday, tone: "text-info-text" },
      { label: "Due today", value: stats.dueToday, tone: "text-warning-text" },
      { label: "Overdue", value: stats.overdue, tone: "text-danger-text" },
      { label: "Unassigned", value: stats.unassigned, tone: "text-ink-2" },
    ],
    [stats],
  )

  return (
    <div className="space-y-6">
      {storageWarning && <Alert tone="warning">{storageWarning}</Alert>}

      {/* KPIs — computed from the real table, not a hardcoded array */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="border border-line bg-surface p-4">
            <p className="text-meta uppercase text-ink-2">{k.label}</p>
            <p data-num className={`mt-2 font-display text-h2 ${k.tone}`}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      {/* Status pipeline */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setParam({ status: null, due: null })}
          aria-pressed={(filters.status ?? "all") === "all" && !filters.dueOnly}
          className={`${CHIP} ${
            (filters.status ?? "all") === "all" && !filters.dueOnly ? CHIP_ON : CHIP_OFF
          }`}
        >
          All {stats.total}
        </button>
        {LEAD_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setParam({ status: s, due: null })}
            aria-pressed={filters.status === s}
            className={`${CHIP} ${filters.status === s ? CHIP_ON : CHIP_OFF}`}
          >
            {s} {stats.byStatus[s] ?? 0}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setParam({ due: filters.dueOnly ? null : "1", status: null })}
          aria-pressed={Boolean(filters.dueOnly)}
          className={`${CHIP} ${filters.dueOnly ? CHIP_DUE_ON : CHIP_DUE_OFF}`}
        >
          Follow-ups due {stats.dueToday + stats.overdue}
        </button>
      </div>

      {/* Toolbar */}
      <div className="border border-line bg-surface p-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setParam({ q: search || null })
            }}
            className="flex-1"
          >
            <Field label="Search leads" hideLabel>
              {(field) => (
                <Input
                  {...field}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, phone, email or message…"
                />
              )}
            </Field>
          </form>

          <Select
            value={filters.intent ?? "all"}
            onChange={(e) => setParam({ intent: e.target.value === "all" ? null : e.target.value })}
            aria-label="Filter by enquiry type"
            className="lg:w-56"
          >
            <option value="all">All enquiry types</option>
            {LEAD_INTENTS.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </Select>

          <Select
            value={sort}
            onChange={(e) => setParam({ sort: e.target.value })}
            aria-label="Sort leads"
            className="lg:w-48"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="follow-up">Follow-up due</option>
            <option value="name">Name A–Z</option>
          </Select>

          <Button
            type="button"
            variant="secondary"
            onClick={handleExport}
            disabled={exporting || result.total === 0}
          >
            {exporting && <Spinner label="Preparing export" />}
            Export CSV
          </Button>
        </div>

        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-line">
            <span className="text-meta uppercase text-ink-2">
              {selected.size} selected — mark as
            </span>
            {LEAD_STATUSES.map((s) => (
              <Button
                key={s}
                type="button"
                variant="secondary"
                className="px-3"
                onClick={() => handleBulk(s)}
                disabled={isPending}
              >
                {s}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className={result.leads.length === 0 ? "space-y-4" : "border border-line bg-surface"}>
        {result.leads.length === 0 ? (
          <EmptyState
            title="No leads match these filters"
            description={
              stats.total === 0
                ? "Enquiries from the website will appear here as soon as they arrive."
                : "Try clearing the search or switching status."
            }
          />
        ) : (
          <div
            role="region"
            aria-label="Leads table"
            tabIndex={0}
            className="overflow-x-auto overscroll-x-contain no-scrollbar"
          >
            <table className="w-full text-left">
              <thead className="sticky top-0 z-10 bg-ground-2 border-b border-line">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      aria-label="Select all"
                      checked={selected.size === result.leads.length && result.leads.length > 0}
                      onChange={toggleAll}
                      className="h-5 w-5 cursor-pointer rounded-sm border border-line-strong accent-[var(--color-accent)]"
                    />
                  </th>
                  {["Customer", "Enquiry", "Vehicle", "Status", "Follow-up", "Received", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-meta uppercase text-ink-2">
                      {h || <span className="sr-only">Actions</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {result.leads.map((lead) => {
                  const due = dueLabel(lead.nextFollowUpAt)
                  return (
                    <tr key={lead.id} className="hover:bg-ground transition-colors duration-(--duration-1)">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          aria-label={`Select ${lead.name}`}
                          checked={selected.has(lead.id)}
                          onChange={() => toggleOne(lead.id)}
                          className="h-5 w-5 cursor-pointer rounded-sm border border-line-strong accent-[var(--color-accent)]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/leads/${lead.id}`} className="group block">
                          <p className="text-table font-semibold text-ink transition-colors duration-(--duration-1) group-hover:text-accent-text-light">
                            {lead.name}
                          </p>
                          <p data-num className="text-small text-ink-2">{lead.phone}</p>
                          {lead.email && <p className="text-small text-ink-3 truncate max-w-[200px]">{lead.email}</p>}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-table text-ink">{lead.intent}</span>
                        {lead.sourcePath && (
                          <p className="text-small text-ink-3 truncate max-w-[160px]">{lead.sourcePath}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {lead.vehicle.title ? (
                          <span className="block text-table text-ink truncate max-w-[160px]">
                            {lead.vehicle.title}
                          </span>
                        ) : (
                          <span className="text-table text-ink-3">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={STATUS_TONE[lead.status]}>{lead.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {due ? (
                          <span
                            data-num
                            className={`text-small ${due.overdue ? "font-semibold text-danger-text" : "text-ink-2"}`}
                          >
                            {due.overdue && <AlertGlyph className="mr-1 inline-block align-[-0.15em]" />}
                            {due.text}
                          </span>
                        ) : (
                          <span className="text-table text-ink-3">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span data-num className="text-small text-ink-2 whitespace-nowrap">
                          {timeAgo(lead.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Button asChild variant="secondary" className="px-3">
                            <a href={`tel:${lead.phone}`}>Call</a>
                          </Button>
                          {lead.email && (
                            <Button asChild variant="secondary" className="px-3">
                              <a href={`mailto:${lead.email}`}>Email</a>
                            </Button>
                          )}
                          <Button asChild variant="secondary" className="px-3">
                            <Link href={`/admin/leads/${lead.id}`}>Open</Link>
                          </Button>
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
          <div
            className={`flex items-center justify-between px-4 py-3 bg-ground border-line ${
              result.leads.length === 0 ? "border" : "border-t"
            }`}
          >
            <span data-num className="text-small text-ink-2">
              Page {result.page} of {totalPages} · {result.total} leads
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label="Previous page"
                onClick={() => setParam({ page: String(result.page - 1) })}
                disabled={result.page <= 1 || isPending}
              >
                <ChevronGlyph direction="left" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label="Next page"
                onClick={() => setParam({ page: String(result.page + 1) })}
                disabled={result.page >= totalPages || isPending}
              >
                <ChevronGlyph direction="right" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
