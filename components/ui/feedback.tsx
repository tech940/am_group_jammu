import * as React from "react"
import { AlertGlyph } from "@/components/system/marks"

/**
 * Status, loading and empty-state primitives.
 *
 * The `data-motion` attributes on Spinner and Skeleton are load-bearing: the
 * reduced-motion block in globals.css strips every other loop, and these two
 * are exempted there because a frozen spinner reads as "broken", not "calm".
 */

/* -------------------------------------------------------------------------- */
/* Loading                                                                    */
/* -------------------------------------------------------------------------- */

export function Spinner({
  className = "",
  label = "Loading",
}: {
  className?: string
  label?: string
}) {
  return (
    <span role="status" aria-live="polite" className={`inline-flex items-center ${className}`}>
      <svg
        data-motion="spinner"
        aria-hidden
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-[1.1em] w-[1.1em] animate-spin"
      >
        <circle cx="10" cy="10" r="7.5" className="opacity-25" />
        <path d="M17.5 10A7.5 7.5 0 0 0 10 2.5" strokeLinecap="round" />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  )
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      data-motion="shimmer"
      aria-hidden
      className={`animate-[shimmer_1.4s_var(--ease-move)_infinite] bg-ground-2 ${className}`}
    />
  )
}

/** Text-line skeleton. Lines vary in width because real prose does. */
export function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  const widths = ["w-full", "w-11/12", "w-4/5", "w-full", "w-3/4"]
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3.5 ${widths[i % widths.length]}`} />
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Status                                                                     */
/* -------------------------------------------------------------------------- */

type Tone = "neutral" | "success" | "warning" | "danger" | "info"

const TONE_SURFACE: Record<Tone, string> = {
  neutral: "bg-ground-2 border-line text-ink",
  success: "bg-success-bg border-success-line text-success-text",
  warning: "bg-warning-bg border-warning-line text-warning-text",
  danger: "bg-danger-bg border-danger-line text-danger-text",
  info: "bg-info-bg border-info-line text-info-text",
}

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: Tone
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-meta uppercase ${TONE_SURFACE[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export function Alert({
  tone = "info",
  title,
  children,
  className = "",
}: {
  tone?: Tone
  title?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-sm border px-4 py-3 ${TONE_SURFACE[tone]} ${className}`}
    >
      {(tone === "danger" || tone === "warning") && (
        <AlertGlyph className="mt-0.5 shrink-0" />
      )}
      <div className="min-w-0">
        {title && <p className="text-label">{title}</p>}
        <div className={`text-small ${title ? "mt-1" : ""}`}>{children}</div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Empty & error                                                              */
/* -------------------------------------------------------------------------- */

export function EmptyState({
  title,
  description,
  action,
  className = "",
}: {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    // No illustration and no icon. An empty state's job is to say what is
    // missing and what to do about it; a decorative glyph above the sentence
    // adds nothing a reader needs.
    <div className={`border border-line bg-surface px-6 py-14 text-center ${className}`}>
      <p className="font-display text-h3 uppercase leading-none text-ink">{title}</p>
      {description && (
        <p className="mx-auto mt-3 max-w-[46ch] text-body text-ink-2">{description}</p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  )
}

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
  className = "",
}: {
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      role="alert"
      className={`border border-danger-line bg-danger-bg px-6 py-14 text-center ${className}`}
    >
      <p className="font-display text-h3 uppercase leading-none text-danger-text">{title}</p>
      {description && (
        <p className="mx-auto mt-3 max-w-[46ch] text-body text-ink-2">{description}</p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  )
}
