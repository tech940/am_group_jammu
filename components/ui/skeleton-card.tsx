import { Skeleton } from "@/components/ui/feedback"

/**
 * Loading placeholder for one vehicle card.
 *
 * The shimmer lives in the `Skeleton` primitive — one opacity loop at 1.4s,
 * exempted from the reduced-motion kill in globals.css because a frozen
 * placeholder reads as broken rather than calm. No second `animate-pulse` on
 * the wrapper, and no card elevation: the card separates by `surface` on
 * `ground` plus a hairline.
 */
export function SkeletonCard() {
  return (
    <div aria-hidden className="bg-surface overflow-hidden border border-line">
      {/* Image plate */}
      <Skeleton className="h-[320px] w-full" />

      {/* Content */}
      <div className="p-6 flex flex-col flex-1 min-h-0 space-y-4">
        {/* Title and price */}
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-4 space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="text-right flex-shrink-0 space-y-2">
            <Skeleton className="h-3 w-16 ml-auto" />
            <Skeleton className="h-6 w-24 ml-auto" />
          </div>
        </div>

        {/* Specs */}
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-sm" />
          <Skeleton className="h-8 w-20 rounded-sm" />
          <Skeleton className="h-8 w-20 rounded-sm" />
        </div>

        {/* Live offer */}
        <div className="flex justify-center">
          <Skeleton className="h-7 w-32 rounded-sm" />
        </div>

        {/* Button */}
        <div className="mt-auto">
          <Skeleton className="h-12 w-full rounded-sm" />
        </div>
      </div>
    </div>
  )
}
