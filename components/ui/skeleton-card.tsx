import { motion } from "framer-motion"

export function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-[40px] overflow-hidden border border-black/5 animate-pulse"
    >
      {/* Image skeleton */}
      <div className="relative h-[320px] bg-zinc-100">
        <div className="absolute top-4 left-4 z-10">
          <div className="h-6 w-20 bg-zinc-200 rounded-full" />
        </div>
        <div className="absolute top-4 right-4 z-10">
          <div className="h-6 w-16 bg-zinc-200 rounded-full" />
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-zinc-200" />
          <div className="h-1.5 w-1.5 rounded-full bg-zinc-200" />
          <div className="h-1.5 w-1.5 rounded-full bg-zinc-200" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-6 flex flex-col flex-1 min-h-0 space-y-4">
        {/* Title and price skeleton */}
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-4 space-y-2">
            <div className="h-3 w-32 bg-zinc-200 rounded" />
            <div className="h-6 w-48 bg-zinc-200 rounded" />
          </div>
          <div className="text-right flex-shrink-0 space-y-2">
            <div className="h-2 w-16 bg-zinc-200 rounded ml-auto" />
            <div className="h-6 w-24 bg-zinc-200 rounded ml-auto" />
          </div>
        </div>

        {/* Features skeleton */}
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-zinc-200 rounded-xl" />
          <div className="h-8 w-20 bg-zinc-200 rounded-xl" />
          <div className="h-8 w-20 bg-zinc-200 rounded-xl" />
        </div>

        {/* Live offer skeleton */}
        <div className="flex justify-center">
          <div className="h-7 w-32 bg-zinc-200 rounded-full" />
        </div>

        {/* Button skeleton */}
        <div className="mt-auto">
          <div className="h-12 w-full bg-zinc-200 rounded-xl" />
        </div>
      </div>
    </motion.div>
  )
}
