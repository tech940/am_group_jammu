import { DrawnRule } from "@/components/system/motion"

/**
 * The drawn accent rule that opens every section head.
 *
 * DESIGN.md's motion table has always specified this — "Reveal: scaleX from
 * origin for rules · duration-4". It is the smallest scroll-triggered animation
 * the system owns: one span, one transform, once, and because it lives in the
 * shared Head it gives every band on every route its enter cue without a
 * single page opting in.
 *
 * The rule is in the server HTML at full width. The draw is added by script
 * only for rules still below the fold, and never under reduced motion
 * (components/system/motion.tsx): the rule is information (a section starts
 * here), the draw is not.
 */
export function RuleDraw({ className = "" }: { className?: string }) {
  return <DrawnRule className={className} />
}
