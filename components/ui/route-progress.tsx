"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

export function RouteProgressBar() {
  const pathname = usePathname()
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)
  const finishTimerRef = React.useRef<NodeJS.Timeout | null>(null)

  // Start progress bar
  const startProgress = React.useCallback(() => {
    if (finishTimerRef.current) clearTimeout(finishTimerRef.current)
    if (timerRef.current) clearInterval(timerRef.current)

    setLoading(true)
    setProgress(15)

    let current = 15
    timerRef.current = setInterval(() => {
      current += Math.max(1, (90 - current) * 0.15)
      if (current >= 90) {
        if (timerRef.current) clearInterval(timerRef.current)
        current = 90
      }
      setProgress(current)
    }, 120)
  }, [])

  // Complete progress bar
  const completeProgress = React.useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setProgress(100)

    finishTimerRef.current = setTimeout(() => {
      setLoading(false)
      setProgress(0)
    }, 280)
  }, [])

  // Listen to navigation pathname changes to complete progress
  React.useEffect(() => {
    const timer = setTimeout(() => {
      completeProgress()
    }, 0)
    return () => clearTimeout(timer)
  }, [pathname, completeProgress])

  // Global click interception for instant 0ms visual feedback on internal link navigation
  React.useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a")
      if (!target) return

      const href = target.getAttribute("href")
      const isTargetBlank = target.getAttribute("target") === "_blank"
      const isExternal = target.origin !== window.location.origin
      const isHash = href?.startsWith("#")
      const isSamePath = href === window.location.pathname || href === window.location.pathname + "/"

      if (
        href &&
        !isTargetBlank &&
        !isExternal &&
        !isHash &&
        !isSamePath &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        startProgress()
      }
    }

    window.addEventListener("click", handleDocumentClick, { capture: true })
    return () => {
      window.removeEventListener("click", handleDocumentClick, { capture: true })
      if (timerRef.current) clearInterval(timerRef.current)
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current)
    }
  }, [startProgress])

  if (!loading && progress === 0) return null

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[3px] bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 shadow-[0_0_12px_rgba(16,185,129,0.9)] transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? "180ms" : "200ms",
          opacity: progress === 100 ? 0 : 1,
        }}
      >
        {/* Leading edge light beam */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-r from-transparent to-white/80 shadow-[0_0_8px_#ffffff] blur-[1px]" />
      </div>
    </div>
  )
}
