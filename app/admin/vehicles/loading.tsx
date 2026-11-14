import { Skeleton } from "@/components/ui/feedback"

// Shown while the list of cars, or one car's form, is being read from the
// database. The rows are the same height as the real ones so nothing jumps.
export default function CarsLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading cars">
      <Skeleton className="h-11 w-full rounded-sm" />
      <div className="divide-y divide-line rounded-md border border-line bg-surface">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4">
            <Skeleton className="h-[72px] w-24 shrink-0 rounded-sm" />
            <div className="flex-1 space-y-2 py-1">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3.5 w-3/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
