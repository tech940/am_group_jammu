"use client"

import * as React from "react"

/**
 * THE STAGE — one persistent ground behind the whole story.
 *
 * This inverts how the page used to work. Each chapter painted its own opaque
 * background, so eight chapters meant seven hard colour switches and the reader
 * crossed a visible seam whenever one ended. Instrumenting reference scroll
 * narratives made the alternative plain: continuity is structural, not
 * decorative — sections own NO background, and a single persistent surface
 * shows through. Chapters now carry only their text colour; this is the only
 * element that paints ground.
 *
 * WHY NOT SCROLL-LINKED INTERPOLATION
 * The obvious implementation — map scrollYProgress across the chapter grounds —
 * is wrong here, because the chapters are wildly different heights (775px to
 * 3187px). Dividing progress evenly desyncs the colour from the content it is
 * supposed to belong to. Worse, a continuously interpolating ground spends long
 * stretches at a value where neither light nor dark text has contrast.
 *
 * So the ground is driven by which chapter actually owns the viewport, observed
 * from the DOM, and CSS transitions between the two. The change is tied to real
 * positions, the intermediate state is brief, and text contrast is only ever
 * evaluated against two known colours rather than a continuum.
 *
 * Cost: one fixed element transitioning one property, replacing eight painted
 * section backgrounds. Cheaper than what it replaces.
 */

interface StageValue {
  /** Chapters call this to claim the stage while they own the viewport. */
  claim: (chapterId: string, ground: string) => void
  /** The chapter currently owning the viewport. Read by the rule. */
  activeId: string
}

const StageContext = React.createContext<StageValue | null>(null)

export function useStage() {
  return React.useContext(StageContext)
}

export function StoryStage({
  initial,
  initialId = "",
  children,
}: {
  /** The ground the page opens on, before any chapter has claimed it. */
  initial: string
  initialId?: string
  children: React.ReactNode
}) {
  const [ground, setGround] = React.useState(initial)
  const [activeId, setActiveId] = React.useState(initialId)

  // Stable identity so Chapter's effect does not re-subscribe every render.
  const claim = React.useCallback((id: string, next: string) => {
    setGround((prev) => (prev === next ? prev : next))
    setActiveId((prev) => (prev === id ? prev : id))
  }, [])

  // Memoised so consumers do not re-render on unrelated parent renders.
  const value = React.useMemo(() => ({ claim, activeId }), [claim, activeId])

  return (
    <StageContext.Provider value={value}>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-50 transition-colors duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none"
        style={{ backgroundColor: ground }}
      />
      {children}
    </StageContext.Provider>
  )
}
