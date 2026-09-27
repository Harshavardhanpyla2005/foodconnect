"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Sparkles, ArrowRight } from "lucide-react"

export function CinematicOpening() {
  const [stage, setStage] = React.useState<number>(0)
  const [isVisible, setIsVisible] = React.useState<boolean>(true)
  const [isMounted, setIsMounted] = React.useState<boolean>(false)
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)

  // Safe client hydration check
  React.useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  // Development-only intro reset helper & SessionStorage check
  React.useEffect(() => {
    if (!isMounted) return

    // Dev-only query parameter helper: ?intro=reset
    if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.get("intro") === "reset") {
          sessionStorage.removeItem("foodconnect_intro_seen")
        }
      } catch {
        // ignore
      }
    }

    // 1. Reduced motion check
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) {
      const timer = setTimeout(() => setIsVisible(false), 0)
      return () => clearTimeout(timer)
    }

    // 2. Returning visitor session check
    try {
      const hasSeenIntro = sessionStorage.getItem("foodconnect_intro_seen")
      if (hasSeenIntro === "true") {
        const timer = setTimeout(() => setIsVisible(false), 0)
        return () => clearTimeout(timer)
      }
    } catch {
      // Fallback if sessionStorage is restricted/unavailable
    }

    // Lock body scrolling during active intro presentation
    document.body.style.overflow = "hidden"

    // 3. Play 5-stage cinematic progression (approx 5.6s total)
    const timers: NodeJS.Timeout[] = []

    timers.push(setTimeout(() => setStage(1), 700))   // Scene 02: Surplus Food Node
    timers.push(setTimeout(() => setStage(2), 1700))  // Scene 03: Digital Matching Engine
    timers.push(setTimeout(() => setStage(3), 2700))  // Scene 04: Community Network Chain
    timers.push(setTimeout(() => setStage(4), 3800))  // Scene 05: Official Logo Convergence
    timers.push(setTimeout(() => setStage(5), 4900))  // Scene 06: Homepage Transition
    timers.push(
      setTimeout(() => {
        setIsVisible(false)
        document.body.style.overflow = ""
        // ONLY mark intro as seen when sequence fully completes
        try {
          sessionStorage.setItem("foodconnect_intro_seen", "true")
        } catch {
          // ignore
        }
      }, 5600)
    )

    return () => {
      timers.forEach(clearTimeout)
      document.body.style.overflow = ""
    }
  }, [isMounted])

  // Interactive 3D Canvas Background (Particle atmosphere & responsive network lines)
  React.useEffect(() => {
    if (!isMounted || !isVisible || stage >= 5) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number

    const handleResize = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    const isMobile = window.innerWidth < 640
    const particleCount = isMobile ? 25 : 45 // Optimized mobile particle density

    // Particle nodes for 3D depth network
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 2 + 0.5,
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.4 ? "rgba(24, 199, 122, " : "rgba(244, 185, 66, ",
      alpha: Math.random() * 0.5 + 0.2,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
    }))

    const render = () => {
      ctx.fillStyle = "#07110D"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Subtle atmospheric radial glow
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        canvas.width * 0.6
      )
      gradient.addColorStop(0, "rgba(24, 199, 122, 0.14)")
      gradient.addColorStop(0.5, "rgba(11, 59, 46, 0.08)")
      gradient.addColorStop(1, "rgba(7, 17, 13, 1)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw particle nodes & 3D connecting beams
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius * p.z, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${p.alpha})`
        ctx.fill()

        // Draw node line connection if in Stage 2+
        if (stage >= 2) {
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j]
            const dx = p.x - p2.x
            const dy = p.y - p2.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            const maxDist = isMobile ? 90 : 120
            if (dist < maxDist) {
              ctx.beginPath()
              ctx.moveTo(p.x, p.y)
              ctx.lineTo(p2.x, p2.y)
              ctx.strokeStyle = `rgba(24, 199, 122, ${0.15 * (1 - dist / maxDist)})`
              ctx.lineWidth = 0.8
              ctx.stroke()
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", handleResize)
    }
  }, [isMounted, isVisible, stage])

  // Explicit SKIP INTRO handler (sets sessionStorage and unmounts overlay)
  const handleSkip = () => {
    setIsVisible(false)
    document.body.style.overflow = ""
    try {
      sessionStorage.setItem("foodconnect_intro_seen", "true")
    } catch {
      // ignore
    }
  }

  if (!isMounted || !isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        key="cinematic-overlay"
        initial={{ opacity: 1 }}
        animate={{ opacity: stage >= 5 ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#07110D] select-none touch-none"
      >
        {/* Canvas background for interactive 3D particle atmosphere */}
        <canvas ref={canvasRef} className="absolute inset-0 size-full pointer-events-none" />

        {/* Top-Right Skip Control */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
          <button
            type="button"
            onClick={handleSkip}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-black/60 px-3.5 py-1.5 text-[11px] sm:text-xs font-semibold text-emerald-400 backdrop-blur-md transition-all hover:border-emerald-500/60 hover:bg-emerald-500/20 hover:text-white focus:outline-none shadow-md"
          >
            <span>SKIP INTRO</span>
            <X className="size-3.5" />
          </button>
        </div>

        {/* Central Cinematic Stage Content */}
        <div className="relative z-10 mx-auto max-w-xl px-4 text-center">
          {/* Scene 01: Initial Atmospheric Arrival */}
          {stage === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-3"
            >
              <div className="mx-auto size-3 rounded-full bg-emerald-400 shadow-[0_0_20px_#18C77A] animate-ping" />
              <p className="font-mono text-[11px] sm:text-xs tracking-widest text-emerald-400 uppercase font-bold">
                INITIALIZING NETWORK COORDINATION...
              </p>
            </motion.div>
          )}

          {/* Scene 02: Surplus Food Node */}
          {stage === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-3 sm:space-y-4"
            >
              <div className="mx-auto flex size-16 sm:size-20 items-center justify-center rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/20 to-black p-3 sm:p-4 shadow-[0_0_30px_rgba(244,185,66,0.3)]">
                <span className="text-2xl sm:text-3xl">🍲</span>
              </div>
              <div className="inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 sm:py-1 font-mono text-[9px] sm:text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                STAGE 1 — COMMERCIAL SURPLUS FOOD
              </div>
              <h2 className="text-lg font-extrabold text-white sm:text-2xl">
                Surplus Food Available
              </h2>
            </motion.div>
          )}

          {/* Scene 03: Connection & Smart Matching */}
          {stage === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-3 sm:space-y-4"
            >
              <div className="mx-auto flex size-16 sm:size-20 items-center justify-center rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/20 to-black p-3 sm:p-4 shadow-[0_0_35px_rgba(24,199,122,0.4)]">
                <Sparkles className="size-8 sm:size-10 text-emerald-400 animate-pulse" />
              </div>
              <div className="inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 sm:py-1 font-mono text-[9px] sm:text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                STAGE 2 — DIGITAL MATCHING ENGINE
              </div>
              <h2 className="text-lg font-extrabold text-white sm:text-2xl">
                Connecting Surplus to Verified Need
              </h2>
            </motion.div>
          )}

          {/* Scene 04: Expanded Network Chain (Responsive Stack) */}
          {stage === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-4 sm:space-y-5"
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-bold text-white">
                <div className="rounded-xl border border-amber-500/30 bg-black/70 px-3 py-2 sm:p-3 shadow-md w-44 sm:w-auto">
                  🏢 Donor Node
                </div>
                <ArrowRight className="size-3.5 sm:size-4 text-emerald-400 rotate-90 sm:rotate-0 animate-pulse" />
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/60 px-3 py-2 sm:p-3 shadow-md text-emerald-400 w-44 sm:w-auto">
                  🚚 Volunteer Courier
                </div>
                <ArrowRight className="size-3.5 sm:size-4 text-emerald-400 rotate-90 sm:rotate-0 animate-pulse" />
                <div className="rounded-xl border border-amber-500/30 bg-black/70 px-3 py-2 sm:p-3 shadow-md w-44 sm:w-auto">
                  🏠 Recipient NGO
                </div>
              </div>
              <div className="inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 sm:py-1 font-mono text-[9px] sm:text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                STAGE 3 — ZERO-WASTE COMMUNITY NETWORK
              </div>
            </motion.div>
          )}

          {/* Scene 05: Official Logo Reveal */}
          {(stage === 4 || stage === 5) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-3 sm:space-y-4"
            >
              <div className="mx-auto flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/foodconnect-logo.png"
                  alt="FoodConnect Logo"
                  width={240}
                  height={80}
                  className="h-10 sm:h-16 md:h-20 max-w-[85vw] w-auto object-contain filter drop-shadow-[0_0_25px_rgba(24,199,122,0.4)]"
                  style={{ aspectRatio: "1024 / 341" }}
                />
              </div>
              <p className="font-mono text-[10px] sm:text-xs md:text-sm font-semibold text-emerald-400 tracking-wider">
                SURPLUS FOOD → BRIGHTER COMMUNITIES
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
