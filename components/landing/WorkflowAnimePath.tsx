"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"
import { animate, createTimeline } from "animejs"
import {
  Utensils,
  Network,
  Truck,
  Camera,
  Clock,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  AlertCircle,
  Share2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { FOODCONNECT_IMAGES } from "@/lib/constants/images"

// TypeScript Interfaces as required
export interface DonationItem {
  id: string
  dishType: string
  donorName: string
  quantity: string
  expiryMinutes: number
  pickupCoordinates: string
  temperature: string
}

export interface NGOProfile {
  id: string
  name: string
  location: string
  transitDistance: string
  etaMinutes: number
  capacityMeals: number
  verifiedStatus: boolean
}

export interface WorkflowStage {
  id: string
  index: number
  title: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  color: "emerald" | "sky" | "amber" | "emerald"
  badge: string
  summary: string
  metricLabel: string
  metricValue: string
}

export function WorkflowAnimePath() {
  const shouldReduceMotion = useReducedMotion()
  const [activeStage, setActiveStage] = React.useState<number>(0)
  const [isPaused, setIsPaused] = React.useState<boolean>(false)
  const pathRef = React.useRef<SVGPathElement>(null)
  const timelineRef = React.useRef<ReturnType<typeof createTimeline> | null>(null)

  // 4 Core Stages matching User Specifications
  const stages: WorkflowStage[] = [
    {
      id: "donor-details",
      index: 0,
      title: "1. Donor Details",
      subtitle: "Surplus Food Broadcast",
      icon: Utensils,
      color: "emerald",
      badge: "Food Safety Declaration Logged",
      summary: "Hotels, banquets, and commercial kitchens log fresh surplus with portion volume, preparation timestamp, and safe consumption window.",
      metricLabel: "Active Surplus",
      metricValue: "180 Nutritious Meals"
    },
    {
      id: "matching-engine",
      index: 1,
      title: "2. Matching Engine",
      subtitle: "Instant Autonomous Alert",
      icon: Network,
      color: "sky",
      badge: "Haversine Proximity < 2.5km",
      summary: "Multi-factor algorithm instantly dispatches priority notification to the nearest accredited NGO with compatible dietary capacity.",
      metricLabel: "Match Score",
      metricValue: "High Compatibility"
    },
    {
      id: "realtime-collection",
      index: 2,
      title: "3. Real-Time Collection",
      subtitle: "GPS Monitored Custody",
      icon: Truck,
      color: "amber",
      badge: "Insulated Thermal Transit",
      summary: "Verified NGO courier arrives within designated window. Physical container seals and food safety parameters confirmed at dock.",
      metricLabel: "Dispatch ETA",
      metricValue: "8 Minutes Transit"
    },
    {
      id: "photo-proof",
      index: 3,
      title: "4. Photo Distribution Proof",
      subtitle: "Transparent Audit Ledger",
      icon: Camera,
      color: "emerald",
      badge: "Timestamp & GPS Geofenced",
      summary: "Meals directly served to community residents. On-site photographic evidence, quantity, and recipient count permanently logged.",
      metricLabel: "Impact Verified",
      metricValue: "180 Beneficiaries Fed"
    }
  ]

  // Mock domain datasets
  const activeDonation: DonationItem = {
    id: "lot-vizag-daspalla-01",
    dishType: "Warm Vegetable Biryani & Sambar",
    donorName: "Hotel Daspalla Visakhapatnam",
    quantity: "180 Portions",
    expiryMinutes: 140,
    pickupCoordinates: "17.7126° N, 83.2987° E",
    temperature: "Insulated Carrier"
  }

  const matchedNGO: NGOProfile = {
    id: "ngo-sneha-sandhya",
    name: "Sneha Sandhya Old Age Home",
    location: "Siripuram Campus, Visakhapatnam",
    transitDistance: "2.4 km coastal corridor",
    etaMinutes: 8,
    capacityMeals: 200,
    verifiedStatus: true
  }

  // Orchestrate Anime.js looping kinetic SVG energy path
  React.useEffect(() => {
    if (typeof window === "undefined" || shouldReduceMotion) return

    const path = pathRef.current
    if (!path) return

    const pathLength = path.getTotalLength ? path.getTotalLength() : 800
    path.style.strokeDasharray = `${pathLength}`
    path.style.strokeDashoffset = `${pathLength}`

    try {
      const tl = createTimeline({
        loop: true,
        autoplay: true,
        onUpdate: (self: { progress?: number }) => {
          if (!isPaused && self) {
            const prog = self.progress || 0
            if (prog < 0.25) setActiveStage(0)
            else if (prog < 0.5) setActiveStage(1)
            else if (prog < 0.75) setActiveStage(2)
            else setActiveStage(3)
          }
        }
      })

      // Animate strokeDashoffset along curve
      tl.add(path, {
        strokeDashoffset: [pathLength, 0],
        duration: 8000,
        ease: "linear"
      })

      timelineRef.current = tl
    } catch {
      // Fallback timer if anime timeline is unsupported in environment
      const interval = setInterval(() => {
        if (!isPaused) {
          setActiveStage((prev) => (prev + 1) % 4)
        }
      }, 2500)
      return () => clearInterval(interval)
    }

    return () => {
      if (timelineRef.current) {
        try {
          timelineRef.current.revert()
        } catch {
          // ignore revert error
        }
      }
    }
  }, [shouldReduceMotion, isPaused])

  const stage = stages[activeStage]

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-[#080B09] text-foreground border-t border-white/[0.06]">
      {/* Background Subtle Radial Dot Matrix Mask */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 bg-radial-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_90%)]" 
        aria-hidden="true" 
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading & SDG 2 Identity */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-12 border-b border-white/[0.08]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Automated 4-Node Rescue Pipeline
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#F3F4F6]">
              Kinetic Food Rescue Flow
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#9CA3AF] leading-relaxed">
              Real-time telemetry showing how surplus food transitions from kitchen registration 
              to verified community nutrition across Visakhapatnam.
            </p>
          </div>

          {/* Interactive Pause / Auto-Play Controller */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#111713]/80 border border-white/[0.08] text-xs font-mono text-[#9CA3AF] hover:text-white hover:border-emerald-500/30 transition-colors"
            >
              <span className={cn("size-2 rounded-full", isPaused ? "bg-amber-400" : "bg-emerald-400 animate-pulse")} />
              {isPaused ? "Resume Live Loop" : "Pause Timeline"}
            </button>
            <Link
              href="/how-it-works"
              prefetch={true}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 font-mono transition-colors"
            >
              <span>Full Protocol</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 Interactive Nodes with Connecting Kinetic SVG Spine */}
        <div className="mt-14 relative">
          {/* Kinetic SVG Energy-Flow Path */}
          <div className="hidden lg:block absolute top-[52px] left-[12%] right-[12%] h-12 z-0 pointer-events-none">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 60">
              <defs>
                <linearGradient id="wf-track-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.1" />
                  <stop offset="33%" stopColor="#3B82F6" stopOpacity="0.1" />
                  <stop offset="66%" stopColor="#F59E0B" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="wf-pulse-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="35%" stopColor="#38BDF8" />
                  <stop offset="70%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#34D399" />
                </linearGradient>
                <filter id="wf-path-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#10B981" floodOpacity="0.6" />
                </filter>
              </defs>

              {/* Underlying static track */}
              <path
                d="M 0,30 C 250,5 250,55 500,30 C 750,5 750,55 1000,30"
                fill="none"
                stroke="url(#wf-track-grad)"
                strokeWidth="4"
              />

              {/* Dynamic animated energy curve (Anime.js target) */}
              <path
                ref={pathRef}
                d="M 0,30 C 250,5 250,55 500,30 C 750,5 750,55 1000,30"
                fill="none"
                stroke="url(#wf-pulse-grad)"
                strokeWidth="3.5"
                filter="url(#wf-path-glow)"
              />
            </svg>
          </div>

          {/* 4 Clickable Stage Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
            {stages.map((st, idx) => {
              const Icon = st.icon
              const isActive = activeStage === idx

              return (
                <button
                  key={st.id}
                  onClick={() => {
                    setActiveStage(idx)
                    setIsPaused(true)
                  }}
                  className={cn(
                    "relative flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-300",
                    "bg-[#111713]/60 backdrop-blur-2xl border",
                    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]",
                    isActive
                      ? "border-emerald-500/80 ring-2 ring-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.18)] scale-[1.02]"
                      : "border-white/[0.08] hover:border-white/[0.18] hover:bg-[#111713]/90"
                  )}
                >
                  {/* Top Node Indicator Pin */}
                  <div
                    className={cn(
                      "size-14 rounded-2xl flex items-center justify-center transition-all duration-300 border mb-4",
                      isActive
                        ? "bg-emerald-500 text-black border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                        : "bg-[#080B09] text-[#9CA3AF] border-white/[0.12] group-hover:text-white"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className={cn(
                    "text-[10px] font-mono uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full mb-2",
                    isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-white/[0.04] text-neutral-400"
                  )}>
                    Step 0{st.index + 1}
                  </span>

                  <h3 className="text-base font-bold text-[#F3F4F6] tracking-tight">
                    {st.title}
                  </h3>
                  <p className="text-xs text-[#9CA3AF] mt-1 line-clamp-1">
                    {st.subtitle}
                  </p>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] w-full flex items-center justify-between text-[11px] font-mono">
                    <span className="text-neutral-500">{st.metricLabel}</span>
                    <span className="text-emerald-400 font-semibold">{st.metricValue}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Dynamic Detail Inspection Panel */}
        <motion.div
          key={stage.id}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="mt-10 rounded-3xl border border-white/[0.08] bg-[#111713]/80 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl shadow-black/80"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content Area */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-bold text-emerald-400">
                  ACTIVE PHASE · STAGE 0{stage.index + 1}
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {stage.badge}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F3F4F6] tracking-tight">
                {stage.title}: {stage.subtitle}
              </h3>

              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                {stage.summary}
              </p>

              {/* Subcomponent: Dynamic View depending on active stage */}
              {activeStage === 0 && (
                <div className="p-4 rounded-2xl bg-[#080B09]/90 border border-white/[0.08] space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5" />
                      DONOR DISPATCH RECORD
                    </span>
                    <span className="text-neutral-500">ID: #{activeDonation.id}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <span className="text-neutral-500 block">Surplus Dish</span>
                      <span className="text-white font-medium">{activeDonation.dishType}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Quantity Portions</span>
                      <span className="text-emerald-400 font-bold">{activeDonation.quantity}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Donor Location</span>
                      <span className="text-neutral-300 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        {activeDonation.donorName}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Holding Window</span>
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        2h 20m Safe Buffer
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeStage === 1 && (
                <div className="p-4 rounded-2xl bg-[#080B09]/90 border border-white/[0.08] space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <span className="text-sky-400 font-bold flex items-center gap-1.5">
                      <Network className="w-3.5 h-3.5" />
                      ALGORITHMIC MATCH PAIRING
                    </span>
                    <span className="text-emerald-400 font-bold">MATCH CONFIRMED</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <span className="text-neutral-500 block">Matched Recipient</span>
                      <span className="text-white font-medium">{matchedNGO.name}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Proximity Distance</span>
                      <span className="text-sky-300 font-bold">{matchedNGO.transitDistance}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Shelter Headcount</span>
                      <span className="text-neutral-300">200 Resident Seniors</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Dispatch Status</span>
                      <span className="text-emerald-400 font-bold">Push Notification Sent</span>
                    </div>
                  </div>
                </div>
              )}

              {activeStage === 2 && (
                <div className="p-4 rounded-2xl bg-[#080B09]/90 border border-white/[0.08] space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <span className="text-amber-400 font-bold flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" />
                      COLLECTION CUSTODY CHAIN
                    </span>
                    <span className="text-amber-400 font-bold animate-pulse">IN TRANSIT</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <span className="text-neutral-500 block">Courier Carrier</span>
                      <span className="text-white font-medium">Eco Van #FC-04 (Insulated)</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Holding Temperature</span>
                      <span className="text-emerald-400 font-bold">68°C Verified at Dock</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Custody Handover</span>
                      <span className="text-neutral-300">Digital Seal Verified</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Arrival ETA</span>
                      <span className="text-amber-400 font-bold">&lt; 8 Minutes to Siripuram</span>
                    </div>
                  </div>
                </div>
              )}

              {activeStage === 3 && (
                <div className="p-4 rounded-2xl bg-[#080B09]/90 border border-white/[0.08] space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" />
                      VERIFIED DISTRIBUTION PROOF
                    </span>
                    <span className="text-emerald-400 font-bold">100% RECONCILED</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <span className="text-neutral-500 block">Recipient Facility</span>
                      <span className="text-white font-medium">Sneha Sandhya Elderly Shelter</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Beneficiaries Fed</span>
                      <span className="text-emerald-400 font-bold">180 Seniors Served</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">GPS Coordinate</span>
                      <span className="text-neutral-300">17.7215° N, 83.3150° E</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Audit Proof Hash</span>
                      <span className="text-neutral-400 truncate">sha256-8a9d...4f1e</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Strip */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/donate"
                  prefetch={true}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm transition-colors shadow-lg shadow-emerald-500/20"
                >
                  <span>Post Food Lot as Donor</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/food-needs"
                  prefetch={true}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.1] font-semibold text-xs sm:text-sm transition-colors"
                >
                  <span>Explore Recipient Needs</span>
                </Link>
              </div>
            </div>

            {/* Right Interactive Photo & Visual Representation */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/[0.1] bg-neutral-900 shadow-xl">
                <Image
                  src={
                    activeStage === 0
                      ? FOODCONNECT_IMAGES.food.cookedBuffet.src
                      : activeStage === 1
                      ? FOODCONNECT_IMAGES.workflow.surplusDispatch.src
                      : activeStage === 2
                      ? FOODCONNECT_IMAGES.workflow.collectionTransit.src
                      : FOODCONNECT_IMAGES.community.elderlyDistribution.src
                  }
                  alt={stage.title}
                  fill
                  priority
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 420px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {/* Overlaid Live Badges */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-xs font-mono font-semibold text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                    LIVE PIPELINE
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300 font-mono">
                    Phase {activeStage + 1} of 4 Completed
                  </p>
                  <p className="text-sm font-bold mt-0.5">
                    {stage.subtitle}
                  </p>
                  <p className="text-[11px] text-neutral-300 mt-1 line-clamp-2">
                    Verified under Vizag Operational Protocol with full GPS &amp; thermal safety logging.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
