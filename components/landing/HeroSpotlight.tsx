"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useMotionValue, useSpring, useMotionTemplate, useReducedMotion } from "motion/react"
import {
  ArrowRight,
  Flame,
  HeartHandshake,
  MapPin,
  Sparkles,
  ShieldCheck,
  Building2,
  Users
} from "lucide-react"
import { cn } from "@/lib/utils"
import { FOODCONNECT_IMAGES } from "@/lib/constants/images"

// Precision rolling number counter component
function RollingCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    let start = 0
    const duration = 2000
    const stepTime = 20
    const totalSteps = duration / stepTime
    const stepIncrement = target / totalSteps

    const timer = setInterval(() => {
      start += stepIncrement
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [target])

  return (
    <span className="tabular-nums">
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

export function HeroSpotlight() {
  const shouldReduceMotion = useReducedMotion()
  const heroRef = React.useRef<HTMLElement>(null)

  // Cursor coordinates with spring physics
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springX = useSpring(mouseX, { stiffness: 260, damping: 22 })
  const springY = useSpring(mouseY, { stiffness: 260, damping: 22 })

  // Initialize cursor at center on mount
  React.useEffect(() => {
    if (typeof window !== "undefined" && heroRef.current) {
      const rect = heroRef.current.getBoundingClientRect()
      mouseX.set(rect.width / 2)
      mouseY.set(rect.height / 3)
    }
  }, [mouseX, mouseY])

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const { currentTarget, clientX, clientY } = e
      const { left, top } = currentTarget.getBoundingClientRect()
      mouseX.set(clientX - left)
      mouseY.set(clientY - top)
    },
    [mouseX, mouseY]
  )

  // Dynamic radial spotlight following cursor (550px circle)
  const spotlightBackground = useMotionTemplate`radial-gradient(550px circle at ${springX}px ${springY}px, rgba(16, 185, 129, 0.12), transparent 80%)`
  const amberAmbient = useMotionTemplate`radial-gradient(350px circle at ${springX}px ${springY}px, rgba(245, 158, 11, 0.06), transparent 75%)`

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "relative min-h-[90vh] flex flex-col justify-center items-center overflow-hidden",
        "bg-[#080B09] text-foreground px-4 sm:px-6 lg:px-8 py-16 lg:py-24"
      )}
    >
      {/* 1. Subtle Radial Dot Matrix Mask */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 bg-radial-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_90%)]" 
        aria-hidden="true" 
      />

      {/* 2. Cursor-Reactive Spotlight Layer with Spring Physics */}
      {!shouldReduceMotion && (
        <>
          <motion.div
            className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
            style={{ background: spotlightBackground }}
            aria-hidden="true"
          />
          <motion.div
            className="pointer-events-none absolute inset-0 z-0 opacity-70 mix-blend-screen"
            style={{ background: amberAmbient }}
            aria-hidden="true"
          />
        </>
      )}

      {/* 3. Ambient floating nodes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0" aria-hidden="true">
        <div className="absolute top-1/4 left-1/12 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl opacity-20" />
        <div className="absolute bottom-1/4 right-1/12 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl opacity-15" />
      </div>

      {/* 4. Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Top Status & SDG 2 Pill */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 ring-1 ring-emerald-500/20 backdrop-blur-md mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold tracking-wide uppercase text-emerald-400">
            SDG 2 · Zero Hunger Support System
          </span>
          <span className="text-white/20">|</span>
          <span className="text-xs text-[#9CA3AF] font-mono flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-400" />
            Visakhapatnam Network Active
          </span>
        </div>

        {/* Primary Page Heading: Single authoritative H1 tag */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] leading-[1.12] text-[#F5F7F5] max-w-4xl">
          Good food shouldn&apos;t become waste{" "}
          <span className="bg-gradient-to-r from-[#18C77A] via-[#7DE2B2] to-[#4DA3FF] bg-clip-text text-transparent">
            because coordination failed.
          </span>
        </h1>

        {/* Supporting message */}
        <p className="mt-5 text-base sm:text-lg text-[#B8C8BF] max-w-3xl font-normal leading-relaxed text-pretty">
          FoodConnect connects surplus food with verified community needs through NGOs — from the moment food becomes available to the moment its distribution is transparently recorded.
        </p>

        {/* Dual Action Buttons */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-4 sm:gap-5">
          <Link
            href="/donate"
            prefetch={true}
            className={cn(
              "group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wide",
              "bg-gradient-to-r from-[#18C77A] via-emerald-600 to-[#0B3B2E] text-white shadow-lg shadow-emerald-500/25",
              "border border-[#18C77A]/40 overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-all"
            )}
          >
            <Flame className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
            <span>Donate Surplus Food</span>
            <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/food-needs"
            prefetch={true}
            className={cn(
              "group inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wide",
              "bg-[#111713]/70 text-[#B8C8BF] hover:text-white backdrop-blur-2xl",
              "border border-white/[0.08] hover:border-[#18C77A]/40 hover:bg-[#111713]/90",
              "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            )}
          >
            <HeartHandshake className="w-4 h-4 text-[#F4B942] group-hover:scale-110 transition-transform" />
            <span>Explore Food Needs</span>
          </Link>
        </div>

        {/* LCP Candidate Image: Priority loaded with explicit aspect ratio */}
        <div className="relative aspect-[16/9] w-full max-w-2xl mx-auto rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl mt-8 bg-neutral-950">
          <Image
            src={FOODCONNECT_IMAGES.hero.foodRescue.src}
            alt="FOODCONNECT Surplus Food Rescue and NGO Distribution System"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 672px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between text-xs text-white/90 font-medium pointer-events-none">
            <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              Vizag Pilot • Live Surplus Rescue
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 font-mono text-[11px] px-2 py-0.5 rounded border border-emerald-500/30">
              SDG 2 Verified
            </span>
          </div>
        </div>

        {/* Single Responsive End-to-End Pipeline (Unified Desktop & Mobile) */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-4xl mt-10 p-3 sm:p-4 rounded-2xl bg-[#0D1914]/80 border border-white/[0.08] backdrop-blur-xl shadow-2xl shadow-black/40 gap-3 sm:gap-2">
          {/* Node 1: DONOR */}
          <div className="flex sm:flex-col items-center gap-3 sm:gap-1 p-2 sm:p-3 rounded-xl hover:bg-white/[0.03] transition-colors w-full sm:w-auto justify-start sm:justify-center">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#18C77A] shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="text-left sm:text-center">
              <span className="text-xs font-bold text-[#F5F7F5] block tracking-wide uppercase">Donor</span>
              <span className="text-[10px] text-[#7F9188] font-mono block">Surplus Food</span>
            </div>
          </div>

          <div className="hidden sm:flex flex-1 px-2 flex-col items-center">
            <span className="text-[9px] font-mono uppercase text-[#18C77A] mb-1">Authenticated</span>
            <div className="w-full h-0.5 bg-gradient-to-r from-emerald-500/40 to-[#18C77A]" />
          </div>

          {/* Node 2: FOODCONNECT */}
          <div className="flex sm:flex-col items-center gap-3 sm:gap-1 p-2 sm:p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 w-full sm:w-auto justify-start sm:justify-center">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#0B3B2E] border border-[#18C77A]/50 flex items-center justify-center text-[#7DE2B2] shrink-0">
              <Sparkles className="w-5 h-5 text-[#18C77A]" />
            </div>
            <div className="text-left sm:text-center">
              <span className="text-xs font-extrabold text-[#7DE2B2] block tracking-wide uppercase">FoodConnect</span>
              <span className="text-[10px] text-emerald-300 font-mono block">Intelligent Match</span>
            </div>
          </div>

          <div className="hidden sm:flex flex-1 px-2 flex-col items-center">
            <span className="text-[9px] font-mono uppercase text-[#4DA3FF] mb-1">5-Factor Engine</span>
            <div className="w-full h-0.5 bg-gradient-to-r from-emerald-400 to-[#4DA3FF]" />
          </div>

          {/* Node 3: VERIFIED NGO */}
          <div className="flex sm:flex-col items-center gap-3 sm:gap-1 p-2 sm:p-3 rounded-xl hover:bg-white/[0.03] transition-colors w-full sm:w-auto justify-start sm:justify-center">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-[#4DA3FF] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-left sm:text-center">
              <span className="text-xs font-bold text-[#F5F7F5] block tracking-wide uppercase">Verified NGO</span>
              <span className="text-[10px] text-[#7F9188] font-mono block">Cold-Chain Pickup</span>
            </div>
          </div>

          <div className="hidden sm:flex flex-1 px-2 flex-col items-center">
            <span className="text-[9px] font-mono uppercase text-[#F4B942] mb-1">Custody Log</span>
            <div className="w-full h-0.5 bg-gradient-to-r from-sky-400 to-[#F4B942]" />
          </div>

          {/* Node 4: COMMUNITY */}
          <div className="flex sm:flex-col items-center gap-3 sm:gap-1 p-2 sm:p-3 rounded-xl hover:bg-white/[0.03] transition-colors w-full sm:w-auto justify-start sm:justify-center">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#F4B942] shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-left sm:text-center">
              <span className="text-xs font-bold text-[#F5F7F5] block tracking-wide uppercase">Community</span>
              <span className="text-[10px] text-[#7F9188] font-mono block">Dignified Delivery</span>
            </div>
          </div>
        </div>

        {/* Live Rolling Stat Counters */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl">
          <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#111713]/60 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-2xl">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 tracking-tight">
              <RollingCounter target={1480} suffix="+" />
            </span>
            <span className="text-xs text-[#9CA3AF] mt-1 font-medium">Meals Rescued</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#111713]/60 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-2xl">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 tracking-tight">
              100%
            </span>
            <span className="text-xs text-[#9CA3AF] mt-1 font-medium">Proof Verified</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#111713]/60 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-2xl">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400 tracking-tight">
              Rapid
            </span>
            <span className="text-xs text-[#9CA3AF] mt-1 font-medium">Volunteer Dispatch</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#111713]/60 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-2xl">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-sky-400 tracking-tight">
              Accredited
            </span>
            <span className="text-xs text-[#9CA3AF] mt-1 font-medium">NGO Network</span>
          </div>
        </div>
      </div>
    </section>
  )
}
