import { Skeleton } from "@/components/ui/feedback"

/**
 * Generic loading placeholder.
 *
 * Every variant is the one `Skeleton` primitive at a different size, so the
 * shimmer (one opacity loop, reduced-motion aware) is defined in a single
 * place instead of being re-declared per shape.
 */
export function SkeletonLoading({ type = "card" }: { type?: "card" | "text" | "button" | "input" }) {
  if (type === "text") {
    return <Skeleton className="h-4 w-32" />
  }

  if (type === "button") {
    return <Skeleton className="h-11 w-24 rounded-sm" />
  }

  if (type === "input") {
    return <Skeleton className="h-11 w-full rounded-sm" />
  }

  // Default card skeleton
  return (
    <div aria-hidden className="bg-surface overflow-hidden border border-line">
      <Skeleton className="h-[320px] w-full" />
      <div className="p-6 flex flex-col flex-1 min-h-0 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-2/3 rounded-sm" />
        <Skeleton className="h-12 w-full rounded-sm" />
      </div>
    </div>
  )
}
