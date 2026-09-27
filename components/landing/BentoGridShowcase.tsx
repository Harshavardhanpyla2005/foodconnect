"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useMotionValue, useSpring, useMotionTemplate, useReducedMotion } from "motion/react"
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  Truck,
  ArrowRight,
  Radar,
  MapPin,
  Utensils,
  Camera,
  Activity,
  Award,
  Layers,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { FOODCONNECT_IMAGES } from "@/lib/constants/images"

// Streamlined Bento Card with cursor-tracking spotlight
function BentoCard({
  children,
  className,
  colSpan = "col-span-1",
}: {
  children: React.ReactNode
  className?: string
  colSpan?: string
}) {
  const shouldReduceMotion = useReducedMotion()
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springX = useSpring(mouseX, { stiffness: 260, damping: 22 })
  const springY = useSpring(mouseY, { stiffness: 260, damping: 22 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { currentTarget, clientX, clientY } = e
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  const spotlight = useMotionTemplate`radial-gradient(500px circle at ${springX}px ${springY}px, rgba(16, 185, 129, 0.12), transparent 80%)`

  return (
    <div
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative rounded-3xl overflow-hidden p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between",
        "bg-[#111713]/60 backdrop-blur-2xl border border-white/[0.08]",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/5",
        colSpan,
        className
      )}
    >
      {!shouldReduceMotion && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: spotlight }}
          aria-hidden="true"
        />
      )}
      <div className="relative z-10 flex flex-col justify-between h-full">
        {children}
      </div>
    </div>
  )
}

export interface BentoGridMetrics {
  totalMealsRescued?: number
  activeNeedsCount?: number
  activeCollectionsCount?: number
  verifiedDistributionsCount?: number
  verifiedNgosCount?: number
  recentDistributions?: Array<{
    id: string
    shelter: string
    location: string
    count: string
    status: "VERIFIED" | "DELIVERED" | "COLLECTED"
    time: string
    thumb: string
  }>
}

function AnimatedCounter({ value }: { value: number }) {
  const shouldReduceMotion = useReducedMotion()
  const [displayValue, setDisplayValue] = React.useState(shouldReduceMotion ? value : 0)

  React.useEffect(() => {
    if (shouldReduceMotion) {
      const timer = setTimeout(() => setDisplayValue(value), 0)
      return () => clearTimeout(timer)
    }
    let startTime: number | null = null
    const startVal = 0
    let frameId: number

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / 1800, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.floor(startVal + (value - startVal) * eased))
      if (progress < 1) {
        frameId = requestAnimationFrame(step)
      } else {
        setDisplayValue(value)
      }
    }
    frameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameId)
  }, [value, shouldReduceMotion])

  return <span>{displayValue.toLocaleString()}</span>
}

export function BentoGridShowcase({ metrics }: { metrics?: BentoGridMetrics }) {
  const [activeRadarNode, setActiveRadarNode] = React.useState<number>(0)
  const [countdownSeconds, setCountdownSeconds] = React.useState<number>(8450)

  const totalMeals = metrics?.totalMealsRescued ?? 1480
  const activeNeeds = metrics?.activeNeedsCount ?? 8
  const activeCollections = metrics?.activeCollectionsCount ?? 3
  const verifiedDists = metrics?.verifiedDistributionsCount ?? 4

  const radarNodes = [
    { id: "node-1", donor: "Hotel Daspalla", location: "Jagadamba Center", meals: "180 Meals", urgency: "HIGH", top: "38%", left: "42%" },
    { id: "node-2", donor: "Novotel Varun Beach", location: "Beach Road Coastal", meals: "120 Meals", urgency: "IMMEDIATE", top: "62%", left: "68%" },
    { id: "node-3", donor: "Sai Priya Resorts", location: "Rushikonda Zone", meals: "95 Meals", urgency: "NORMAL", top: "25%", left: "75%" },
    { id: "node-4", donor: "Green Park Caterers", location: "Siripuram Junction", meals: "140 Meals", urgency: "HIGH", top: "70%", left: "30%" }
  ]

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 8450))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = Math.floor(countdownSeconds / 3600)
  const minutes = Math.floor((countdownSeconds % 3600) / 60)
  const seconds = countdownSeconds % 60
  const progressPercent = Math.max(5, (countdownSeconds / 10800) * 100)

  const recentDistributions = metrics?.recentDistributions && metrics.recentDistributions.length > 0
    ? metrics.recentDistributions
    : [
        {
          id: "dist-01",
          shelter: "Sneha Sandhya Old Age Home",
          location: "MVP Colony, Vizag",
          count: "180 Elders Fed",
          status: "VERIFIED" as const,
          time: "12 mins ago",
          thumb: FOODCONNECT_IMAGES.community.elderlyDistribution.src
        },
        {
          id: "dist-02",
          shelter: "Prema Samajam Care Facility",
          location: "Daba Gardens, Vizag",
          count: "120 Patients Fed",
          status: "DELIVERED" as const,
          time: "28 mins ago",
          thumb: FOODCONNECT_IMAGES.community.childrenMeal.src
        },
        {
          id: "dist-03",
          shelter: "Savitri Bai Night Shelter",
          location: "Railway Station Zone",
          count: "75 Meals Distributed",
          status: "COLLECTED" as const,
          time: "42 mins ago",
          thumb: FOODCONNECT_IMAGES.workflow.collectionTransit.src
        }
      ]

  return (
    <section className="relative py-16 lg:py-24 overflow-hidden bg-[#07110D] text-foreground border-t border-white/[0.08]">
      <div 
        className="pointer-events-none absolute inset-0 z-0 bg-radial-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_90%)]" 
        aria-hidden="true" 
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide uppercase mb-3">
              <Activity className="w-3.5 h-3.5" />
              Live Mission Console
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#F5F7F5]">
              Real-Time Rescue Operations
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#B8C8BF] max-w-xl leading-relaxed">
              Algorithmic dispatch surveillance, thermal holding countdowns, and tamper-resistant distribution proofs across the Visakhapatnam corridor.
            </p>
          </div>

          <Link
            href="/donate"
            prefetch={true}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm transition-colors shadow-lg shadow-emerald-500/20 self-start md:self-end"
          >
            <span>Broadcast Surplus Lot</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Real-time KPI Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="rounded-2xl bg-[#0B3B2E]/30 border border-white/[0.08] p-4 backdrop-blur-xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#7F9188] flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-emerald-400" />
              1. Meals Rescued
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-[#F5F7F5] tabular-nums">
              <AnimatedCounter value={totalMeals} />
              <span className="text-emerald-400 text-lg ml-1 font-sans font-bold">+</span>
            </div>
            <p className="text-[11px] text-[#B8C8BF] mt-1">Directly recorded in audit ledger</p>
          </div>

          <div className="rounded-2xl bg-[#0B3B2E]/30 border border-white/[0.08] p-4 backdrop-blur-xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#7F9188] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              2. Active NGO Needs
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-[#F5F7F5] tabular-nums">
              <AnimatedCounter value={activeNeeds} />
              <span className="text-amber-400 text-xs ml-2 font-mono uppercase">Open</span>
            </div>
            <p className="text-[11px] text-[#B8C8BF] mt-1">Shelters awaiting matching</p>
          </div>

          <div className="rounded-2xl bg-[#0B3B2E]/30 border border-white/[0.08] p-4 backdrop-blur-xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#7F9188] flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-sky-400" />
              3. Active Collections
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-[#F5F7F5] tabular-nums">
              <AnimatedCounter value={activeCollections} />
              <span className="text-sky-400 text-xs ml-2 font-mono uppercase">En Route</span>
            </div>
            <p className="text-[11px] text-[#B8C8BF] mt-1">Physical transit dispatch</p>
          </div>

          <div className="rounded-2xl bg-[#0B3B2E]/30 border border-white/[0.08] p-4 backdrop-blur-xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#7F9188] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              4. Verified Distributions
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-[#F5F7F5] tabular-nums">
              <AnimatedCounter value={verifiedDists} />
              <span className="text-emerald-400 text-xs ml-2 font-mono uppercase">Audited</span>
            </div>
            <p className="text-[11px] text-[#B8C8BF] mt-1">GPS & photographic proofs</p>
          </div>
        </div>

        {/* 21st.dev Style Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* CARD 1 (Span 2 cols): Live Surplus Food Radar */}
          <BentoCard colSpan="md:col-span-2 min-h-[380px]">
            <div>
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Radar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#F3F4F6]">Live Surplus Food Radar</h3>
                    <p className="text-xs text-[#9CA3AF] font-mono">Visakhapatnam Metropolitan Dispatch Grid</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-mono font-semibold text-emerald-400">RADAR ACTIVE</span>
                </div>
              </div>

              {/* Radar Simulation Surface */}
              <div className="relative mt-4 h-64 rounded-2xl bg-[#080B09] border border-white/[0.06] overflow-hidden flex items-center justify-center">
                {/* Single SVG for Concentric Radar Rings & Crosshairs */}
                <svg className="absolute inset-0 size-full pointer-events-none stroke-emerald-500/15" viewBox="0 0 400 256">
                  <circle cx="200" cy="128" r="40" fill="none" strokeWidth="1" />
                  <circle cx="200" cy="128" r="80" fill="none" strokeWidth="1" />
                  <circle cx="200" cy="128" r="120" fill="none" strokeWidth="1" />
                  <line x1="0" y1="128" x2="400" y2="128" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="200" y1="0" x2="200" y2="256" strokeWidth="1" strokeDasharray="4 4" />
                </svg>

                {/* Rotating Radar Beam */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-80 h-80 rounded-full radar-beam animate-radar-sweep opacity-50" />
                </div>

                {/* Interactive Radar Nodes */}
                {radarNodes.map((node, idx) => {
                  const isSelected = activeRadarNode === idx
                  return (
                    <button
                      key={node.id}
                      onClick={() => setActiveRadarNode(idx)}
                      style={{ top: node.top, left: node.left }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group z-20 cursor-pointer"
                      aria-label={`${node.donor} - ${node.meals}`}
                    >
                      <span className="relative flex size-5 items-center justify-center">
                        <span className={cn(
                          "absolute inline-flex size-full rounded-full opacity-75 animate-ping",
                          node.urgency === "IMMEDIATE" ? "bg-amber-400" : "bg-emerald-400"
                        )} />
                        <span className={cn(
                          "relative inline-flex size-3 rounded-full border-2 border-black",
                          node.urgency === "IMMEDIATE" ? "bg-amber-500" : "bg-emerald-500"
                        )} />
                      </span>

                      {isSelected && (
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-0.5 rounded bg-emerald-500 text-black font-bold text-[10px] font-mono whitespace-nowrap shadow-md">
                          {node.donor} ({node.meals})
                        </div>
                      )}
                    </button>
                  )
                })}

                {/* Active node detail overlay */}
                <div className="absolute bottom-2 left-2 right-2 p-2.5 rounded-xl bg-[#111713]/90 border border-white/[0.08] backdrop-blur-md flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-white font-semibold truncate">{radarNodes[activeRadarNode].donor}</span>
                    <span className="text-neutral-500 truncate">· {radarNodes[activeRadarNode].location}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-emerald-400 font-bold">{radarNodes[activeRadarNode].meals}</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                      {radarNodes[activeRadarNode].urgency}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#9CA3AF] font-mono">
              <span>Coverage: 12 Active Kitchen Hubs</span>
              <Link href="/food-needs" prefetch={true} className="text-emerald-400 hover:underline flex items-center gap-1">
                <span>View Full Map Telemetry</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </BentoCard>

          {/* CARD 2 (Span 1 col): Urgency Expiry Countdown */}
          <BentoCard colSpan="md:col-span-1">
            <div>
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <h3 className="text-xs font-mono uppercase font-bold text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Thermal Expiry Clock
                </h3>
                <span className="text-[10px] font-mono text-neutral-500">LOT #FC-914</span>
              </div>

              <div className="mt-5 flex flex-col items-center justify-center text-center">
                <div className="relative size-32 flex items-center justify-center">
                  <svg className="size-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="8"
                      strokeDasharray="314"
                      strokeDashoffset={`${314 - (314 * progressPercent) / 100}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>

                  <div className="absolute flex flex-col items-center">
                    <span className="text-xl font-black font-mono text-[#F3F4F6] tracking-tight">
                      {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest">
                      Safe Window
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-sm font-bold text-[#F3F4F6]">Hotel Daspalla Veg Buffet</p>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  180 portions held in insulated containers. Must be distributed before safety expiry.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-500">Food Safety</span>
              <span className="text-emerald-400 font-semibold">Hygiene Declared</span>
            </div>
          </BentoCard>

          {/* CARD 3 (Span 1 col): NGO Verification Shield */}
          <BentoCard colSpan="md:col-span-1">
            <div>
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <h3 className="text-xs font-mono uppercase font-bold text-sky-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Accreditation Matrix
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">AUDITED LEDGER</span>
              </div>

              <div className="mt-5 flex flex-col items-center text-center">
                <div className="size-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
                  <Award className="w-8 h-8" />
                </div>

                <p className="mt-3 text-sm font-bold text-[#F3F4F6]">Verified NGO Partner Network</p>
                <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
                  Only authenticated NGOs with verified credentials and community facilities receive priority allocations.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 w-full text-left font-mono text-[11px]">
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-neutral-500 block text-[9px] uppercase">Active Shelters</span>
                    <span className="text-white font-bold">Verified Pantries</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-neutral-500 block text-[9px] uppercase">Hygiene Policy</span>
                    <span className="text-emerald-400 font-bold">Verified</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-500">Zero Diversion Policy</span>
              <span className="text-sky-400 font-semibold">Strictly Enforced</span>
            </div>
          </BentoCard>

          {/* CARD 4 (Span 2 cols): Recent Distribution Feed */}
          <BentoCard colSpan="md:col-span-2">
            <div>
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#F3F4F6]">Recent Distribution Feed</h3>
                    <p className="text-xs text-[#9CA3AF] font-mono">Timestamped GPS Photographic Proofs</p>
                  </div>
                </div>

                <span className="text-xs font-mono text-neutral-400">Visakhapatnam Ledger</span>
              </div>

              {/* Feed items */}
              <div className="mt-3 space-y-2.5">
                {recentDistributions.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#080B09]/90 border border-white/[0.06] flex items-center gap-3 hover:border-emerald-500/30 transition-colors"
                  >
                    <div className="relative size-12 rounded-lg overflow-hidden bg-neutral-800 shrink-0 border border-white/10">
                      <Image
                        src={item.thumb}
                        alt={item.shelter}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white truncate block">
                          {item.shelter}
                        </span>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider shrink-0",
                            item.status === "VERIFIED"
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : item.status === "DELIVERED"
                              ? "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                              : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                          )}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-[#9CA3AF] mt-0.5 font-mono truncate">
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                          {item.location}
                        </span>
                        <span>·</span>
                        <span className="text-emerald-400 font-medium shrink-0">{item.count}</span>
                        <span>·</span>
                        <span className="shrink-0">{item.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#9CA3AF] font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Proof SHA-256 Validated
              </span>
              <Link href="/impact" prefetch={true} className="text-emerald-400 hover:underline flex items-center gap-1">
                <span>View Full Public Audit</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  )
}
