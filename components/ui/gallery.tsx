"use client"

import * as React from "react"
import Image from "next/image"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ChevronGlyph, CloseGlyph } from "@/components/system/marks"
import type { MediaItem } from "@/lib/media/storage"

/**
 * Photo gallery with a fullscreen viewer.
 *
 * Every image is rendered through next/image, never as a raw <img> or a CSS
 * background. That is the whole compression story: the originals in this bucket
 * are camera exports up to 4229x2506 and ~5.8MB, and shipping one of those to a
 * phone on an uneven network would be indefensible. next/image fetches each
 * original once on the server and serves a resized AVIF (or WebP) per
 * breakpoint — the grid asks for ~400px wide, the viewer for a screen-width
 * variant, so a browser never receives the megabyte original.
 *
 * `sizes` is what makes that work. Without it next/image assumes 100vw and
 * serves a full-width variant into a 400px tile, which is most of the waste
 * back again.
 */

const GRID_SIZES = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1400px) 25vw, 340px"
const VIEWER_SIZES = "(max-width: 1024px) 100vw, 90vw"

export function Gallery({
  items,
  folders,
}: {
  items: MediaItem[]
  folders: { value: string; label: string; count: number }[]
}) {
  const [filter, setFilter] = React.useState<string>("all")
  const [openIndex, setOpenIndex] = React.useState<number | null>(null)
  const reduce = useReducedMotion()

  const visible = React.useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.folder === filter)),
    [items, filter],
  )

  // Changing the filter re-indexes the list, so a viewer left open over the old
  // index would jump to an unrelated photograph. Both updates happen in the
  // event handler rather than in an effect keyed on `filter` — a setState
  // inside that effect runs after paint and cascades an extra render.
  const changeFilter = React.useCallback((next: string) => {
    setFilter(next)
    setOpenIndex(null)
  }, [])

  const close = React.useCallback(() => setOpenIndex(null), [])
  const step = React.useCallback(
    (delta: number) => {
      setOpenIndex((current) => {
        if (current === null) return current
        const next = current + delta
        if (next < 0 || next >= visible.length) return current
        return next
      })
    },
    [visible.length],
  )

  if (items.length === 0) {
    return (
      <div className="border border-line bg-surface px-6 py-14 text-center">
        <p className="font-display text-h3 uppercase leading-none text-ink">No photographs yet</p>
        <p className="mx-auto mt-3 max-w-[46ch] text-body text-ink-2">
          Images added to the <code className="text-small">am_group_files</code> bucket will appear
          here automatically.
        </p>
      </div>
    )
  }

  return (
    <>
      {folders.length > 1 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter photographs by area">
          <FilterChip active={filter === "all"} onClick={() => changeFilter("all")} count={items.length}>
            All
          </FilterChip>
          {folders.map((f) => (
            <FilterChip
              key={f.value}
              active={filter === f.value}
              onClick={() => changeFilter(f.value)}
              count={f.count}
            >
              {f.label}
            </FilterChip>
          ))}
        </div>
      )}

      <ul className="mt-8 grid grid-cols-2 gap-px bg-line sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((item, i) => (
          <li key={item.path} className="relative bg-ground">
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-label={`Open ${item.alt} at full size`}
              className="group relative block aspect-[4/3] w-full overflow-hidden bg-ground-2"
            >
              <Image
                src={item.url}
                alt={item.alt}
                fill
                sizes={GRID_SIZES}
                // Only the first row is above the fold; the rest wait.
                loading={i < 4 ? "eager" : "lazy"}
                className="object-cover"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-ink/0 transition-colors duration-(--duration-1) group-hover:bg-ink/25"
              />
            </button>
          </li>
        ))}
      </ul>

      <Viewer
        items={visible}
        index={openIndex}
        onClose={close}
        onStep={step}
        reduce={Boolean(reduce)}
      />
    </>
  )
}

function FilterChip({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean
  onClick: () => void
  count: number
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-11 items-center gap-2 rounded-sm border px-4 text-button transition-colors duration-(--duration-1) ${
        active
          ? "border-ink bg-ink text-ground"
          : "border-line-strong bg-surface text-ink hover:bg-ground-2"
      }`}
    >
      {children}
      <span className={active ? "text-ground/60" : "text-ink-3"} data-num>
        {count}
      </span>
    </button>
  )
}

/**
 * Fullscreen viewer. Owns the same contract as Dialog — focus trap, Escape,
 * scroll lock, focus restoration, aria-modal — plus arrow-key paging, which is
 * what people actually reach for in a gallery.
 */
function Viewer({
  items,
  index,
  onClose,
  onStep,
  reduce,
}: {
  items: MediaItem[]
  index: number | null
  onClose: () => void
  onStep: (delta: number) => void
  reduce: boolean
}) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const restoreRef = React.useRef<HTMLElement | null>(null)
  const open = index !== null
  const item = open ? items[index] : null
  const labelId = React.useId()

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
    const id = window.requestAnimationFrame(() => panelRef.current?.focus())
    return () => window.cancelAnimationFrame(id)
  }, [open])

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        onStep(1)
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        onStep(-1)
      } else if (e.key === "Tab") {
        // The viewer is a closed world: keep Tab inside it.
        const focusables = panelRef.current?.querySelectorAll<HTMLElement>("button")
        if (!focusables || focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener("keydown", onKey, true)
    return () => document.removeEventListener("keydown", onKey, true)
  }, [open, onClose, onStep])

  const handleExitComplete = React.useCallback(() => {
    restoreRef.current?.focus?.()
    restoreRef.current = null
  }, [])

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {open && item && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelId}
          tabIndex={-1}
          data-ground="deep"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[110] flex flex-col bg-ink outline-none"
        >
          <header className="flex items-center justify-between gap-4 border-b border-line-on-deep px-4 py-3 md:px-6">
            <p id={labelId} className="min-w-0 truncate text-meta uppercase text-on-deep-2">
              <span className="text-on-deep">{item.alt}</span>
              <span className="ml-3" data-num>
                {index! + 1} / {items.length}
              </span>
            </p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close viewer"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm text-on-deep transition-colors duration-(--duration-1) hover:bg-deep"
            >
              <CloseGlyph />
            </button>
          </header>

          <div className="relative min-h-0 flex-1">
            <motion.div
              key={item.path}
              className="absolute inset-0"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.18 }}
            >
              <Image
                src={item.url}
                alt={item.alt}
                fill
                sizes={VIEWER_SIZES}
                quality={90}
                priority
                className="object-contain"
              />
            </motion.div>
          </div>

          <footer className="flex items-center justify-between gap-4 border-t border-line-on-deep px-4 py-3 md:px-6">
            <button
              type="button"
              onClick={() => onStep(-1)}
              disabled={index === 0}
              className="inline-flex h-11 items-center gap-2 rounded-sm border border-line-on-deep px-4 text-button text-on-deep transition-colors duration-(--duration-1) hover:bg-deep disabled:opacity-40"
            >
              <ChevronGlyph direction="left" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => onStep(1)}
              disabled={index === items.length - 1}
              className="inline-flex h-11 items-center gap-2 rounded-sm border border-line-on-deep px-4 text-button text-on-deep transition-colors duration-(--duration-1) hover:bg-deep disabled:opacity-40"
            >
              Next
              <ChevronGlyph direction="right" />
            </button>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
