import { motion } from 'framer-motion'

export function SkeletonLoading({ type = "card" }: { type?: "card" | "text" | "button" | "input" }) {
  if (type === "text") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="h-4 w-32 bg-zinc-200 rounded animate-pulse"
      />
    )
  }

  if (type === "button") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="h-10 w-24 bg-zinc-200 rounded-xl animate-pulse"
      />
    )
  }

  if (type === "input") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="h-10 w-full bg-zinc-100 rounded-xl animate-pulse"
      />
    )
  }

  // Default card skeleton
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-[40px] overflow-hidden border border-black/5"
    >
      <div className="relative h-[320px] bg-zinc-100 animate-pulse" />
      <div className="p-6 flex flex-col flex-1 min-h-0 space-y-3">
        <div className="h-4 w-3/4 bg-zinc-200 rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-zinc-200 rounded animate-pulse" />
        <div className="h-8 w-2/3 bg-zinc-200 rounded-xl animate-pulse" />
        <div className="h-12 w-full bg-zinc-200 rounded-xl animate-pulse" />
      </div>
    </motion.div>
  )
}
