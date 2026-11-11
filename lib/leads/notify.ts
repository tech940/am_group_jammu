/**
 * Email every enquiry to the people who answer them.
 *
 * SERVER ONLY.
 *
 * Why this exists: the database was the ONLY place a lead went, so when the
 * database was unreachable every enquiry on the site ended in "we could not
 * save your enquiry" and reached nobody. An enquiry now goes to two places —
 * the lead desk and an inbox — and it counts as received if either one works.
 *
 * Configuration is all environment, so no mailbox password lives in the repo:
 *
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS   the sending mailbox
 *   LEADS_EMAIL_TO     comma-separated recipients
 *                      (default: aryan@amgroupind.com, data@amgroupind.com)
 *   LEADS_EMAIL_FROM   the From address (default: SMTP_USER)
 *
 * With SMTP_* unset this is a no-op that reports "not configured" — it never
 * throws, because a mail problem must not be able to break a lead that the
 * database saved perfectly well.
 */

import nodemailer from 'nodemailer'
import type { LeadIntent } from './types.ts'

const DEFAULT_TO = 'aryan@amgroupind.com, data@amgroupind.com'

export const isLeadEmailConfigured = Boolean(
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
)

export interface LeadEmail {
  name: string
  phone: string
  email: string | null
  message: string | null
  intent: LeadIntent
  sourcePath: string | null
  sourceLabel: string | null
  vehicle: { title: string | null; price: number | null; url: string | null }
  /** Lead-desk id, or null when the database did not take it. */
  leadId: string | null
}

export type NotifyResult = { sent: true } | { sent: false; reason: 'not_configured' | 'failed' }

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Strip CR/LF so a visitor's name cannot inject extra mail headers. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').trim()

export async function sendLeadEmail(lead: LeadEmail): Promise<NotifyResult> {
  if (!isLeadEmailConfigured) return { sent: false, reason: 'not_configured' }

  const port = Number(process.env.SMTP_PORT || 465)
  const rows: [string, string][] = [
    ['Name', lead.name],
    ['Phone', lead.phone],
    ['Email', lead.email ?? '—'],
    ['Asking about', lead.intent],
    ['Car', lead.vehicle.title ?? '—'],
    ['Price', lead.vehicle.price ? `₹${lead.vehicle.price.toLocaleString('en-IN')}` : '—'],
    ['Car page', lead.vehicle.url ?? '—'],
    ['Message', lead.message ?? '—'],
    ['Sent from', [lead.sourcePath, lead.sourceLabel].filter(Boolean).join(' · ') || '—'],
    [
      'Lead desk',
      lead.leadId
        ? `Saved (id ${lead.leadId})`
        : 'NOT SAVED — the database was unreachable. This email is the only copy.',
    ],
  ]

  const subject = oneLine(
    `${lead.leadId ? '' : '[NOT SAVED] '}Website enquiry: ${lead.intent} — ${lead.name}` +
      (lead.vehicle.title ? ` (${lead.vehicle.title})` : ''),
  )
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n')
  const html =
    '<table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">' +
    rows
      .map(
        ([k, v]) =>
          `<tr><td style="border:1px solid #ddd;font-weight:bold;vertical-align:top">${esc(k)}</td>` +
          `<td style="border:1px solid #ddd;white-space:pre-wrap">${esc(v)}</td></tr>`,
      )
      .join('') +
    '</table>'

  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      // A slow mail server must not hold the visitor's form open.
      connectionTimeout: 8_000,
      greetingTimeout: 8_000,
      socketTimeout: 10_000,
    })
    await transport.sendMail({
      from: process.env.LEADS_EMAIL_FROM || process.env.SMTP_USER,
      to: process.env.LEADS_EMAIL_TO || DEFAULT_TO,
      // Reply goes to the customer, not back to the website's mailbox.
      replyTo: lead.email ? oneLine(lead.email) : undefined,
      subject,
      text,
      html,
    })
    return { sent: true }
  } catch (err) {
    console.error('[leads] email failed', err)
    return { sent: false, reason: 'failed' }
  }
}
