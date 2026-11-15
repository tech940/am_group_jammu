import { Fragment, type ReactNode } from "react"

/**
 * Turns every phone number inside a sentence into a link that dials it.
 *
 * The owner's rule (2026-11-15): wherever a number is visible, it can be
 * tapped. Buttons and contact rows already were; this covers the numbers that
 * sit inside prose - FAQ answers, the "about this car" paragraph, location
 * copy - which are built as plain strings and so printed as plain text.
 *
 * It matches an Indian mobile number written with its country code
 * ("+91 94694 44456", "+919469444456", "+91-94694-44456"). Prices and
 * kilometres are never matched: they have no "+91".
 *
 * No hooks and no browser APIs, so it works in server and client components.
 */
const PHONE = /(\+91[\s-]?[6-9]\d{4}[\s-]?\d{5})/g

const LINK =
  "whitespace-nowrap font-semibold text-ink underline underline-offset-2 " +
  "transition-colors duration-(--duration-1) hover:text-accent"

export function linkPhones(text: string | null | undefined, track = "inline-text"): ReactNode {
  if (!text) return text ?? null
  const parts = text.split(PHONE)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <a
        key={i}
        href={`tel:${part.replace(/[^\d+]/g, "")}`}
        data-track-location={track}
        data-num
        className={LINK}
      >
        {part}
      </a>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}

/** The same, as a component, for JSX that prefers one. */
export function PhoneText({ children, track }: { children: string; track?: string }) {
  return <>{linkPhones(children, track)}</>
}
