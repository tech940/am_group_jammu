"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { CloseGlyph } from "@/components/system/marks"

/**
 * The application's only modal surface.
 *
 * Before this existed, `role="dialog"` appeared ZERO times in the codebase and
 * not one of the five overlays trapped focus, handled Escape, locked scroll, or
 * restored focus on close. Every one of those is owned here so no individual
 * modal can forget it — including destructive confirmations, which are never
 * `window.confirm()`.
 *
 * Sizing is deliberately capped well below the previous 900px two-panel slab:
 * a dialog is an interruption, and an interruption that fills the viewport
 * reads as a page the user cannot leave.
 */

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",")

export interface DialogProps {
  open: boolean
  onClose: () => void
  /** Accessible name. Rendered as the visible title unless `hideTitle`. */
  title: string
  /** Optional line under the title. */
  description?: string
  hideTitle?: boolean
  size?: "sm" | "md" | "lg"
  /** Hide the × affordance for flows that must be completed or cancelled explicitly. */
  dismissible?: boolean
  children: React.ReactNode
  /** Right-aligned action row, pinned under the content. */
  footer?: React.ReactNode
}

const SIZES = {
  sm: "max-w-[420px]",
  md: "max-w-[560px]",
  lg: "max-w-[760px]",
} as const

export function Dialog({
  open,
  onClose,
  title,
  description,
  hideTitle = false,
  size = "md",
  dismissible = true,
  children,
  footer,
}: DialogProps) {
  const reduce = useReducedMotion()
  const panelRef = React.useRef<HTMLDivElement>(null)
  const restoreRef = React.useRef<HTMLElement | null>(null)
  const titleId = React.useId()
  const descId = React.useId()

  // Remember what had focus so it can be handed back on close. Without this a
  // keyboard user is dumped at the top of the document every time a dialog
  // closes and has to find their place again.
  React.useEffect(() => {
    if (open) restoreRef.current = document.activeElement as HTMLElement | null
  }, [open])

  React.useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  React.useEffect(() => {
    if (!open) return
    // Focus the panel itself rather than the first field: announcing the
    // dialog's name before its first control is what tells a screen-reader user
    // where they now are.
    const id = window.requestAnimationFrame(() => panelRef.current?.focus())
    return () => window.cancelAnimationFrame(id)
  }, [open])

  React.useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissible) {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== "Tab") return

      const panel = panelRef.current
      if (!panel) return
      const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      )
      if (items.length === 0) {
        e.preventDefault()
        panel.focus()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      // Wrap at both ends, and catch the case where focus has escaped the panel
      // entirely (browser chrome, an autofill popup) by pulling it back in.
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      } else if (!panel.contains(document.activeElement)) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown, true)
    return () => document.removeEventListener("keydown", onKeyDown, true)
  }, [open, onClose, dismissible])

  const handleExitComplete = React.useCallback(() => {
    restoreRef.current?.focus?.()
    restoreRef.current = null
  }, [])

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
          <motion.div
            aria-hidden
            onClick={dismissible ? onClose : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-ink/60"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className={`relative flex max-h-[90svh] w-full flex-col rounded-t-md bg-surface shadow-overlay outline-none sm:rounded-md ${SIZES[size]}`}
          >
            <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <h2
                  id={titleId}
                  className={
                    hideTitle
                      ? "sr-only"
                      : "font-display text-h3 uppercase leading-none text-ink"
                  }
                >
                  {title}
                </h2>
                {description && (
                  <p id={descId} className="mt-2 text-small text-ink-2">
                    {description}
                  </p>
                )}
              </div>
              {dismissible && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="-mr-1 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-sm text-ink-2 transition-colors duration-(--duration-1) hover:bg-ground-2 hover:text-ink"
                >
                  <CloseGlyph />
                </button>
              )}
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

            {footer && (
              <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-line px-5 py-4 sm:px-6">
                {footer}
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/**
 * Destructive confirmation. Replaces `window.confirm()`, which was gating
 * vehicle deletion in the admin area — an unstyleable native modal that blocks
 * the main thread and cannot be made consistent with anything else.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  pending = false,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  pending?: boolean
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center rounded-sm border border-line-strong px-5 text-button text-ink transition-colors duration-(--duration-1) hover:bg-ground-2"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="inline-flex h-11 items-center rounded-sm bg-danger px-5 text-button text-ground transition-colors duration-(--duration-1) hover:bg-accent-hover disabled:opacity-60"
          >
            {pending ? "Deleting…" : confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-body text-ink-2">This cannot be undone.</p>
    </Dialog>
  )
}
