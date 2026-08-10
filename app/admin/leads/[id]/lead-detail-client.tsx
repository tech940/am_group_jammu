"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Phone, Mail, MessageCircle, Loader2, Send, Car, ExternalLink,
  Clock, UserCheck, AlarmClock, StickyNote, ArrowRightLeft, PlusCircle,
} from "lucide-react"
import {
  adminAddNote, adminAssign, adminLogContact, adminScheduleFollowUp, adminUpdateStatus,
} from "@/lib/leads/actions"
import { LEAD_STATUSES } from "@/lib/leads/types"
import type { Lead, LeadActivity, LeadActivityType, LeadStatus } from "@/lib/leads/types"
import { useToast } from "@/hooks/use-toast"

const STATUS_STYLES: Record<LeadStatus, string> = {
  New: "bg-blue-50 text-blue-700 border-blue-200",
  Contacted: "bg-amber-50 text-amber-700 border-amber-200",
  "Follow-up": "bg-purple-50 text-purple-700 border-purple-200",
  Qualified: "bg-teal-50 text-teal-700 border-teal-200",
  Won: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Lost: "bg-zinc-100 text-zinc-500 border-zinc-200",
}

const ACTIVITY_ICON: Record<LeadActivityType, typeof StickyNote> = {
  created: PlusCircle,
  note: StickyNote,
  status_change: ArrowRightLeft,
  call: Phone,
  whatsapp: MessageCircle,
  email: Mail,
  follow_up_scheduled: AlarmClock,
  assigned: UserCheck,
}

/** Datetime-local wants `YYYY-MM-DDTHH:mm` in local time. */
function toLocalInput(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  })
}

export function LeadDetailClient({
  lead,
  activities,
  // Evaluated on the server: comparing against Date.now() during render is
  // impure and would make the server and client markup disagree.
  overdue,
}: {
  lead: Lead
  activities: LeadActivity[]
  overdue: boolean
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [note, setNote] = useState("")
  const [assignee, setAssignee] = useState(lead.assignedTo ?? "")
  const [followUp, setFollowUp] = useState(toLocalInput(lead.nextFollowUpAt))

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, successMsg: string) => {
    startTransition(async () => {
      const res = await fn()
      if (res.ok) {
        toast({ title: successMsg })
        router.refresh()
      } else {
        toast({ title: "Something went wrong", description: res.error, variant: "destructive" })
      }
    })
  }

  /** Prefilled WhatsApp deep link — the fastest channel for a dealership. */
  const waHref = `https://wa.me/${lead.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hello ${lead.name}, this is AM Group Jammu regarding your enquiry${lead.vehicle.title ? ` about the ${lead.vehicle.title}` : ""}.`,
  )}`

  return (
    <div className="space-y-6">
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-black/50 hover:text-[#023468] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> All leads
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT — identity, actions, timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-black/8 p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-2xl font-black text-[#023468]">{lead.name}</h2>
                <p className="text-xs text-black/45 font-semibold mt-1">
                  {lead.intent} · received {fmt(lead.createdAt)}
                </p>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${STATUS_STYLES[lead.status]}`}>
                {lead.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <a
                href={`tel:${lead.phone}`}
                onClick={() => run(() => adminLogContact(lead.id, "call", `Called ${lead.phone}`), "Call logged")}
                className="flex items-center justify-center gap-2 h-11 rounded-xl bg-[#023468] hover:bg-[#01254a] text-white text-[11px] font-black uppercase tracking-wider transition-all"
              >
                <Phone className="h-4 w-4" /> Call
              </a>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => run(() => adminLogContact(lead.id, "whatsapp", "Opened WhatsApp"), "WhatsApp logged")}
                className="flex items-center justify-center gap-2 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-wider transition-all"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <a
                href={lead.email ? `mailto:${lead.email}` : undefined}
                onClick={() => lead.email && run(() => adminLogContact(lead.id, "email", `Emailed ${lead.email}`), "Email logged")}
                aria-disabled={!lead.email}
                className={`flex items-center justify-center gap-2 h-11 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                  lead.email
                    ? "bg-white border border-black/15 hover:bg-black hover:text-white"
                    : "bg-zinc-100 text-black/25 pointer-events-none"
                }`}
              >
                <Mail className="h-4 w-4" /> Email
              </a>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div className="flex justify-between border-b border-black/5 py-2">
                <dt className="text-black/40 text-xs font-bold uppercase tracking-wider">Phone</dt>
                <dd className="font-bold text-[#023468]">{lead.phone}</dd>
              </div>
              <div className="flex justify-between border-b border-black/5 py-2">
                <dt className="text-black/40 text-xs font-bold uppercase tracking-wider">Email</dt>
                <dd className="font-bold text-[#023468] truncate max-w-[220px]">{lead.email ?? "—"}</dd>
              </div>
              <div className="flex justify-between border-b border-black/5 py-2">
                <dt className="text-black/40 text-xs font-bold uppercase tracking-wider">Source page</dt>
                <dd className="font-semibold text-black/70 truncate max-w-[220px]">{lead.sourcePath ?? "—"}</dd>
              </div>
              <div className="flex justify-between border-b border-black/5 py-2">
                <dt className="text-black/40 text-xs font-bold uppercase tracking-wider">Consent</dt>
                <dd className="font-semibold text-black/70">{lead.consent ? "Given" : "Not recorded"}</dd>
              </div>
            </dl>

            {lead.message && (
              <div className="mt-5 rounded-xl bg-zinc-50 border border-black/5 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-black/35 mb-2">
                  Customer message
                </p>
                <p className="text-sm text-black/75 whitespace-pre-wrap leading-relaxed">{lead.message}</p>
              </div>
            )}

            {lead.vehicle.title && (
              <div className="mt-4 rounded-xl border border-[#023468]/15 bg-[#023468]/4 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#023468]/60 mb-2">
                  Enquired about
                </p>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Car className="h-4 w-4 text-[#023468] shrink-0" />
                    <span className="text-sm font-bold text-[#023468] truncate">{lead.vehicle.title}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {lead.vehicle.price !== null && (
                      <span className="text-sm font-black text-[#023468]">
                        ₹{lead.vehicle.price.toLocaleString("en-IN")}
                      </span>
                    )}
                    {lead.vehicle.url && (
                      <a
                        href={lead.vehicle.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#023468] hover:text-[#E31837]"
                        title="Open listing"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Note composer */}
          <div className="bg-white rounded-2xl border border-black/8 p-6 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#023468] mb-3">Add a note</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="What happened on the call? Budget, timeline, objections…"
              className="w-full bg-zinc-50 border border-black/8 rounded-xl p-3 text-sm focus:outline-none focus:border-[#023468] resize-none"
            />
            <button
              onClick={() =>
                run(async () => {
                  const res = await adminAddNote(lead.id, note)
                  if (res.ok) setNote("")
                  return res
                }, "Note saved")
              }
              disabled={isPending || !note.trim()}
              className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#023468] hover:bg-[#01254a] disabled:opacity-50 text-white text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Save note
            </button>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-black/8 p-6 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#023468] mb-5">Activity</h3>
            {activities.length === 0 ? (
              <p className="text-xs text-black/40">No activity recorded yet.</p>
            ) : (
              <ol className="space-y-4">
                {activities.map((a) => {
                  const Icon = ACTIVITY_ICON[a.type] ?? StickyNote
                  return (
                    <li key={a.id} className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#023468]/8 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-[#023468]" />
                      </div>
                      <div className="min-w-0 flex-1 pb-4 border-b border-black/5 last:border-0">
                        <p className="text-sm text-black/80">
                          {a.type === "status_change" ? (
                            <>
                              Status changed from <strong>{a.fromStatus}</strong> to <strong>{a.toStatus}</strong>
                            </>
                          ) : (
                            a.body ?? a.type.replace(/_/g, " ")
                          )}
                        </p>
                        <p className="text-[10px] font-semibold text-black/35 mt-1 flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {fmt(a.createdAt)}
                          {a.author && ` · ${a.author}`}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        </div>

        {/* RIGHT — pipeline controls */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-black/8 p-6 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#023468] mb-4">Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {LEAD_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => run(() => adminUpdateStatus(lead.id, s), `Marked as ${s}`)}
                  disabled={isPending || lead.status === s}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer disabled:cursor-default ${
                    lead.status === s
                      ? "bg-[#023468] text-white border-[#023468]"
                      : "bg-white text-black/60 border-black/10 hover:border-[#023468]/40 hover:text-[#023468]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-black/8 p-6 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#023468] mb-1">Next follow-up</h3>
            {overdue && (
              <p className="text-[10px] font-black uppercase tracking-wider text-[#E31837] mb-3">Overdue</p>
            )}
            <input
              type="datetime-local"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              className="w-full bg-zinc-50 border border-black/8 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#023468] mt-2"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() =>
                  run(
                    () => adminScheduleFollowUp(lead.id, followUp ? new Date(followUp).toISOString() : null),
                    followUp ? "Follow-up scheduled" : "Follow-up cleared",
                  )
                }
                disabled={isPending}
                className="flex-1 px-3 py-2.5 rounded-xl bg-[#023468] hover:bg-[#01254a] disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                Save
              </button>
              {lead.nextFollowUpAt && (
                <button
                  onClick={() => {
                    setFollowUp("")
                    run(() => adminScheduleFollowUp(lead.id, null), "Follow-up cleared")
                  }}
                  disabled={isPending}
                  className="px-3 py-2.5 rounded-xl border border-black/10 text-[10px] font-black uppercase tracking-wider hover:bg-zinc-50 transition-all cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex gap-2 mt-2">
              {[
                { label: "Tomorrow", hours: 24 },
                { label: "In 3 days", hours: 72 },
                { label: "Next week", hours: 168 },
              ].map((q) => (
                <button
                  key={q.label}
                  onClick={() => {
                    const when = new Date(Date.now() + q.hours * 3600_000)
                    when.setHours(10, 0, 0, 0)
                    setFollowUp(toLocalInput(when.toISOString()))
                    run(() => adminScheduleFollowUp(lead.id, when.toISOString()), `Follow-up set for ${q.label.toLowerCase()}`)
                  }}
                  disabled={isPending}
                  className="flex-1 px-2 py-1.5 rounded-lg bg-zinc-50 border border-black/8 text-[9px] font-black uppercase tracking-wider text-black/50 hover:text-[#023468] hover:border-[#023468]/30 transition-all cursor-pointer"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-black/8 p-6 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#023468] mb-3">Assigned to</h3>
            <input
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Salesperson name"
              className="w-full bg-zinc-50 border border-black/8 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#023468]"
            />
            <button
              onClick={() => run(() => adminAssign(lead.id, assignee), assignee.trim() ? "Lead assigned" : "Lead unassigned")}
              disabled={isPending}
              className="w-full mt-3 px-3 py-2.5 rounded-xl bg-[#023468] hover:bg-[#01254a] disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              Save assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
