"use client"

import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function PageLoader() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setIsLoading(true)
      setProgress(0)
    }, 0)

    // Simulate loading progress
    const timer1 = setTimeout(() => setProgress(30), 100)
    const timer2 = setTimeout(() => setProgress(70), 300)
    const timer3 = setTimeout(() => setProgress(100), 500)
    const timer4 = setTimeout(() => {
      setIsLoading(false)
      setProgress(0)
    }, 600)

    return () => {
      clearTimeout(startTimer)
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [pathname, searchParams])


  if (!isLoading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-zinc-100">
      <div
        className="h-full bg-[#E31837] transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
