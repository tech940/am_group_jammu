"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  adminAddNote, adminAssign, adminLogContact, adminScheduleFollowUp, adminUpdateStatus,
} from "@/lib/leads/actions"
import { LEAD_STATUSES } from "@/lib/leads/types"
import type { Lead, LeadActivity, LeadStatus } from "@/lib/leads/types"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Badge, Spinner } from "@/components/ui/feedback"
import { Field, Input, Textarea } from "@/components/ui/field"
import { ChevronGlyph } from "@/components/system/marks"

/** Status reads as a semantic tone, never as a palette colour. */
const STATUS_TONE: Record<LeadStatus, "neutral" | "success" | "warning" | "info"> = {
  New: "info",
  Contacted: "warning",
  "Follow-up": "info",
  Qualified: "success",
  Won: "success",
  Lost: "neutral",
}

/** Two-state pipeline chip. Not a Button variant — a toggle is its own thing. */
const CHIP =
  "inline-flex h-11 cursor-pointer items-center justify-center rounded-sm border px-3 " +
  "text-button uppercase transition-colors duration-(--duration-1) disabled:cursor-default"
const CHIP_ON = "border-deep bg-deep text-on-deep"
const CHIP_OFF = "border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink"

const CARD = "border border-line bg-surface p-6"
const CARD_HEAD = "font-display text-h4 uppercase text-ink"

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
        className="inline-flex min-h-11 items-center gap-2 text-meta uppercase text-ink-2 transition-colors duration-(--duration-1) hover:text-ink"
      >
        <ChevronGlyph direction="left" /> All leads
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT — identity, actions, timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className={CARD}>
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="font-display text-h2 text-ink">{lead.name}</h2>
                <p className="text-small text-ink-2 mt-1">
                  {lead.intent} · received {fmt(lead.createdAt)}
                </p>
              </div>
              <Badge tone={STATUS_TONE[lead.status]}>{lead.status}</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <Button asChild variant="primary" full>
                <a
                  href={`tel:${lead.phone}`}
                  onClick={() => run(() => adminLogContact(lead.id, "call", `Called ${lead.phone}`), "Call logged")}
                >
                  Call
                </a>
              </Button>
              <Button asChild variant="secondary" full>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => run(() => adminLogContact(lead.id, "whatsapp", "Opened WhatsApp"), "WhatsApp logged")}
                >
                  WhatsApp
                </a>
              </Button>
              <Button
                asChild
                variant="secondary"
                full
                className={lead.email ? "" : "pointer-events-none opacity-55"}
              >
                <a
                  href={lead.email ? `mailto:${lead.email}` : undefined}
                  onClick={() => lead.email && run(() => adminLogContact(lead.id, "email", `Emailed ${lead.email}`), "Email logged")}
                  aria-disabled={!lead.email}
                >
                  Email
                </a>
              </Button>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex justify-between border-b border-line py-2">
                <dt className="text-meta uppercase text-ink-2">Phone</dt>
                <dd data-num className="text-body font-semibold text-ink">{lead.phone}</dd>
              </div>
              <div className="flex justify-between border-b border-line py-2">
                <dt className="text-meta uppercase text-ink-2">Email</dt>
                <dd className="text-body font-semibold text-ink truncate max-w-[220px]">{lead.email ?? "—"}</dd>
              </div>
              <div className="flex justify-between border-b border-line py-2">
                <dt className="text-meta uppercase text-ink-2">Source page</dt>
                <dd className="text-body text-ink-2 truncate max-w-[220px]">{lead.sourcePath ?? "—"}</dd>
              </div>
              <div className="flex justify-between border-b border-line py-2">
                <dt className="text-meta uppercase text-ink-2">Consent</dt>
                <dd className="text-body text-ink-2">{lead.consent ? "Given" : "Not recorded"}</dd>
              </div>
            </dl>

            {lead.message && (
              <div className="mt-5 border border-line bg-ground p-4">
                <p className="text-meta uppercase text-ink-2 mb-2">
                  Customer message
                </p>
                <p className="text-body text-ink whitespace-pre-wrap">{lead.message}</p>
              </div>
            )}

            {lead.vehicle.title && (
              <div className="mt-4 border border-line bg-ground p-4">
                <p className="text-meta uppercase text-ink-2 mb-2">
                  Enquired about
                </p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-body font-semibold text-ink truncate">{lead.vehicle.title}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    {lead.vehicle.price !== null && (
                      <span data-num className="text-body font-semibold text-ink">
                        ₹{lead.vehicle.price.toLocaleString("en-IN")}
                      </span>
                    )}
                    {lead.vehicle.url && (
                      <a
                        href={lead.vehicle.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center text-small text-accent-text-light underline-offset-4 hover:underline"
                      >
                        Open listing
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Note composer */}
          <div className={CARD}>
            <h3 className={`${CARD_HEAD} mb-3`}>Add a note</h3>
            <Field label="Add a note" hideLabel>
              {(field) => (
                <Textarea
                  {...field}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="What happened on the call? Budget, timeline, objections…"
                />
              )}
            </Field>
            <Button
              type="button"
              className="mt-3"
              onClick={() =>
                run(async () => {
                  const res = await adminAddNote(lead.id, note)
                  if (res.ok) setNote("")
                  return res
                }, "Note saved")
              }
              disabled={isPending || !note.trim()}
            >
              {isPending && <Spinner label="Saving note" />}
              Save note
            </Button>
          </div>

          {/* Timeline */}
          <div className={CARD}>
            <h3 className={`${CARD_HEAD} mb-5`}>Activity</h3>
            {activities.length === 0 ? (
              <p className="text-small text-ink-2">No activity recorded yet.</p>
            ) : (
              <ol className="space-y-4">
                {activities.map((a) => (
                  <li key={a.id} className="border-b border-line pb-4 last:border-0 last:pb-0">
                    <p className="text-body text-ink">
                      {a.type === "status_change" ? (
                        <>
                          Status changed from <strong>{a.fromStatus}</strong> to <strong>{a.toStatus}</strong>
                        </>
                      ) : (
                        a.body ?? a.type.replace(/_/g, " ")
                      )}
                    </p>
                    <p className="text-small text-ink-2 mt-1">
                      <time dateTime={a.createdAt}>{fmt(a.createdAt)}</time>
                      {a.author && ` · ${a.author}`}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {/* RIGHT — pipeline controls */}
        <div className="space-y-6">
          <div className={CARD}>
            <h3 className={`${CARD_HEAD} mb-4`}>Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {LEAD_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => run(() => adminUpdateStatus(lead.id, s), `Marked as ${s}`)}
                  disabled={isPending || lead.status === s}
                  aria-pressed={lead.status === s}
                  className={`${CHIP} ${lead.status === s ? CHIP_ON : CHIP_OFF}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className={CARD}>
            <h3 className={`${CARD_HEAD} mb-1`}>Next follow-up</h3>
            {overdue && (
              <p className="text-meta uppercase text-danger-text mb-3">Overdue</p>
            )}
            <Field label="Next follow-up" hideLabel className="mt-2">
              {(field) => (
                <Input
                  {...field}
                  type="datetime-local"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                />
              )}
            </Field>
            <div className="flex gap-2 mt-3">
              <Button
                type="button"
                className="flex-1"
                onClick={() =>
                  run(
                    () => adminScheduleFollowUp(lead.id, followUp ? new Date(followUp).toISOString() : null),
                    followUp ? "Follow-up scheduled" : "Follow-up cleared",
                  )
                }
                disabled={isPending}
              >
                Save
              </Button>
              {lead.nextFollowUpAt && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setFollowUp("")
                    run(() => adminScheduleFollowUp(lead.id, null), "Follow-up cleared")
                  }}
                  disabled={isPending}
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="flex gap-2 mt-2">
              {[
                { label: "Tomorrow", hours: 24 },
                { label: "In 3 days", hours: 72 },
                { label: "Next week", hours: 168 },
              ].map((q) => (
                <Button
                  key={q.label}
                  type="button"
                  variant="secondary"
                  className="flex-1 px-2"
                  onClick={() => {
                    const when = new Date(Date.now() + q.hours * 3600_000)
                    when.setHours(10, 0, 0, 0)
                    setFollowUp(toLocalInput(when.toISOString()))
                    run(() => adminScheduleFollowUp(lead.id, when.toISOString()), `Follow-up set for ${q.label.toLowerCase()}`)
                  }}
                  disabled={isPending}
                >
                  {q.label}
                </Button>
              ))}
            </div>
          </div>

          <div className={CARD}>
            <h3 className={`${CARD_HEAD} mb-3`}>Assigned to</h3>
            <Field label="Assigned to" hideLabel>
              {(field) => (
                <Input
                  {...field}
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  placeholder="Salesperson name"
                />
              )}
            </Field>
            <Button
              type="button"
              full
              className="mt-3"
              onClick={() => run(() => adminAssign(lead.id, assignee), assignee.trim() ? "Lead assigned" : "Lead unassigned")}
              disabled={isPending}
            >
              Save assignment
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
