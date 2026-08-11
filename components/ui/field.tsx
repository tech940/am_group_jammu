"use client"

import * as React from "react"

/**
 * Form field primitives.
 *
 * The audit found 36 inputs and 3 textareas across the app against `htmlFor` in
 * exactly 3 files — on the enquiry modal, the only `htmlFor` was on the
 * honeypot, so the five real fields announced as unlabelled text boxes on the
 * primary lead form.
 *
 * `Field` owns the wiring: it generates the id, binds the label, and points
 * `aria-describedby` at whichever of help/error is showing. A caller cannot
 * render a field without a label, because the label is a required prop rather
 * than something you remember to add.
 */

interface FieldProps {
  label: string
  /** Visually hide the label but keep it for assistive tech. Use sparingly. */
  hideLabel?: boolean
  required?: boolean
  help?: string
  error?: string | null
  className?: string
  children: (props: {
    id: string
    "aria-describedby": string | undefined
    "aria-invalid": boolean | undefined
    "aria-required": boolean | undefined
  }) => React.ReactNode
}

export function Field({
  label,
  hideLabel = false,
  required = false,
  help,
  error = null,
  className = "",
  children,
}: FieldProps) {
  const id = React.useId()
  const helpId = `${id}-help`
  const errorId = `${id}-error`

  // Error wins the description slot: when a field is wrong, the correction is
  // what the user needs read out, not the hint they already ignored.
  const describedBy = error ? errorId : help ? helpId : undefined

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={id}
        className={hideLabel ? "sr-only" : "text-label text-ink"}
      >
        {label}
        {required && (
          <>
            <span aria-hidden className="ml-1 text-accent-text-light">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>

      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        "aria-required": required || undefined,
      })}

      {error ? (
        <p id={errorId} className="text-small text-danger-text">
          {error}
        </p>
      ) : help ? (
        <p id={helpId} className="text-small text-ink-2">
          {help}
        </p>
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Controls                                                                   */
/* -------------------------------------------------------------------------- */

const CONTROL =
  "w-full rounded-sm border bg-surface px-3.5 text-body text-ink transition-colors duration-(--duration-1) " +
  "placeholder:text-ink-3 disabled:cursor-not-allowed disabled:bg-ground-2 disabled:text-ink-3 " +
  "aria-[invalid=true]:border-danger"

/** 44px tall — the touch-target floor. The audit found 51 controls under it. */
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className = "", ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`${CONTROL} h-11 border-line-strong hover:border-ink-2 ${className}`}
      {...props}
    />
  )
})

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className = "", rows = 4, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={`${CONTROL} resize-y py-3 border-line-strong hover:border-ink-2 ${className}`}
      {...props}
    />
  )
})

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className = "", children, ...props }, ref) {
  return (
    // Styled native <select>, not a custom listbox: native is keyboard- and
    // screen-reader-correct for free, and on Android it opens the OS picker,
    // which is faster than anything reimplemented in the page.
    <select
      ref={ref}
      className={`${CONTROL} h-11 cursor-pointer appearance-none border-line-strong bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-10 hover:border-ink-2 ${className}`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='%23565e6a' stroke-width='1.5'%3E%3Cpath d='m5 8 5 5 5-5'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  )
})

export function Checkbox({
  label,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const id = React.useId()
  return (
    <div className={`flex items-start gap-2.5 ${className}`}>
      <input
        id={id}
        type="checkbox"
        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded-sm border border-line-strong accent-[var(--color-accent)]"
        {...props}
      />
      <label htmlFor={id} className="cursor-pointer text-body text-ink">
        {label}
      </label>
    </div>
  )
}
