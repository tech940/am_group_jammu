import type { Metadata } from "next"
import Link from "next/link"
import { adminGetStats, adminGetStorageInfo, adminListLeads } from "@/lib/leads/actions"
import { getInventory } from "@/lib/inventory/server"
import { Alert, EmptyState } from "@/components/ui/feedback"
import { PhoneGlyph } from "@/components/system/marks"
import type { LeadStatus } from "@/lib/leads/types"

export const metadata: Metadata = {
  title: "Dashboard",
  robots: "noindex, nofollow",
}

// Semantic tokens, not Tailwind's default palette. Six statuses across five
// tones, so the pipeline reads as a progression: tinted while in play, filled
// once won, drained once lost.
const STATUS_STYLES: Record<LeadStatus, string> = {
  New: "bg-info-bg text-info-text border-info-line",
  Contacted: "bg-warning-bg text-warning-text border-warning-line",
  "Follow-up": "bg-surface text-ink border-line-strong",
  Qualified: "bg-success-bg text-success-text border-success-line",
  Won: "bg-success text-ground border-success",
  Lost: "bg-ground-2 text-ink-3 border-line",
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

  // One accent on the board, and it is the number that means someone is being
  // kept waiting. Everything else is ink.
  const kpis = [
    { label: "Total leads", value: stats.total, tone: "text-ink", href: "/admin/leads" },
    { label: "New today", value: stats.newToday, tone: "text-ink", href: "/admin/leads?status=New" },
    { label: "Follow-ups due", value: stats.dueToday + stats.overdue, tone: "text-ink", href: "/admin/leads?due=1" },
    { label: "Overdue", value: stats.overdue, tone: "text-accent-text-light", href: "/admin/leads?due=1" },
    { label: "Unassigned", value: stats.unassigned, tone: "text-ink", href: "/admin/leads" },
    { label: "Cars in stock", value: inventory.total, tone: "text-ink", href: "/inventory" },
  ]

  return (
    <div className="space-y-6">
      {storage.warning && <Alert tone="warning">{storage.warning}</Alert>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {kpis.map((k) => (
          <Link
            key={k.label}
            href={k.href}
            className="border border-line bg-surface p-4 transition-colors duration-(--duration-1) hover:bg-ground-2"
          >
            <span className="block text-meta uppercase text-ink-2">{k.label}</span>
            <p data-num className={`mt-2 font-display text-h2 ${k.tone}`}>{k.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent leads */}
        <div className="border border-line bg-surface lg:col-span-2">
          <div className="flex min-h-14 items-center justify-between gap-4 border-b border-line px-4">
            <h2 className="font-display text-h4 uppercase text-ink">Recent enquiries</h2>
            <Link
              href="/admin/leads"
              className="inline-flex h-11 items-center text-meta uppercase text-ink-2 transition-colors duration-(--duration-1) hover:text-accent-text-light"
            >
              View all
            </Link>
          </div>

          {recent.leads.length === 0 ? (
            <EmptyState
              className="border-transparent"
              title="No enquiries yet"
              description="Leads from the website will appear here the moment they arrive."
            />
          ) : (
            <ul className="divide-y divide-line">
              {recent.leads.map((lead) => (
                <li key={lead.id}>
                  <Link
                    href={`/admin/leads/${lead.id}`}
                    className="flex min-h-11 items-center justify-between gap-4 px-4 py-3 transition-colors duration-(--duration-1) hover:bg-ground"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-table font-semibold text-ink">{lead.name}</p>
                      <p className="text-caption text-ink-2">
                        {lead.phone} · {lead.intent}
                        {lead.vehicle.title ? ` · ${lead.vehicle.title}` : ""}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-sm border px-2 py-0.5 text-meta uppercase ${STATUS_STYLES[lead.status]}`}>
                      {lead.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Follow-up queue */}
        <div className="border border-line bg-surface">
          <div className="flex min-h-14 items-center border-b border-line px-4">
            <h2 className="font-display text-h4 uppercase text-ink">Call back now</h2>
          </div>

          {dueSoon.leads.length === 0 ? (
            <EmptyState
              className="border-transparent"
              title="Nothing due"
              description="No follow-ups are outstanding."
            />
          ) : (
            <ul className="divide-y divide-line">
              {dueSoon.leads.map((lead) => (
                <li key={lead.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <Link href={`/admin/leads/${lead.id}`} className="flex min-h-11 min-w-0 flex-col justify-center">
                      <p className="truncate text-table font-semibold text-ink">{lead.name}</p>
                      <p data-num className="text-caption font-semibold text-accent-text-light">
                        {lead.nextFollowUpAt
                          ? new Date(lead.nextFollowUpAt).toLocaleString("en-IN", {
                              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                            })
                          : ""}
                      </p>
                    </Link>
                    <a
                      href={`tel:${lead.phone}`}
                      aria-label={`Call ${lead.name}`}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-deep text-on-deep transition-colors duration-(--duration-1) hover:bg-deep-2"
                      title={`Call ${lead.name}`}
                    >
                      <PhoneGlyph />
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
