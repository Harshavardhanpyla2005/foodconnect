"use client"

import * as React from "react"
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "motion/react"
import { animate } from "animejs"
import { 
  Building2, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  HeartHandshake, 
  Sparkles,
  Camera,
  Share2,
  Cpu,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StageData {
  id: string
  number: string
  stepLabel: string
  title: string
  subtitle: string
  pillText: string
  pillColor: "emerald" | "amber" | "cobalt"
  cardContent: React.ReactNode
}

export function ScrollTimeline() {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const svgPathRef = React.useRef<SVGPathElement>(null)
  const shouldReduceMotion = useReducedMotion()

  const [activeStage, setActiveStage] = React.useState<number>(0)

  // Track scroll through the timeline section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 20%", "end 80%"],
  })

  // Smooth scroll progression
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 24,
    restDelta: 0.001,
  })

  // Calculate SVG stroke offset based on scroll
  const pathLength = useTransform(smoothProgress, [0, 1], [0, 1])

  // Update active stage as user scrolls through the 6 Acts
  React.useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest < 0.17) setActiveStage(0)
      else if (latest < 0.33) setActiveStage(1)
      else if (latest < 0.5) setActiveStage(2)
      else if (latest < 0.67) setActiveStage(3)
      else if (latest < 0.83) setActiveStage(4)
      else setActiveStage(5)
    })
    return () => unsubscribe()
  }, [scrollYProgress])

  // Anime.js trigger for Stage 2 (Platform Match routing line)
  const triggerRoutingAnimation = React.useCallback(() => {
    if (typeof window === "undefined" || shouldReduceMotion) return
    const connector = document.getElementById("anime-match-connector")
    if (connector) {
      animate(connector, {
        strokeDashoffset: [200, 0],
        opacity: [0.2, 1],
        duration: 1200,
        easing: "easeOutCubic",
      })
    }
  }, [shouldReduceMotion])

  React.useEffect(() => {
    if (activeStage === 1) {
      triggerRoutingAnimation()
    }
  }, [activeStage, triggerRoutingAnimation])

  const stages: StageData[] = [
    {
      id: "act-surplus",
      number: "01",
      stepLabel: "ACT 1 · SURPLUS",
      title: "Good food shouldn't become waste because coordination failed.",
      subtitle: "Commercial kitchens, banquet halls, and food suppliers broadcast surplus lots with verified quantities, storage conditions, and preparation timestamps.",
      pillText: "Surplus Food Broadcast",
      pillColor: "emerald",
      cardContent: (
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Hotel Daspalla Visakhapatnam</h4>
                <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  Surya Bagh, Jagadamba Center
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 ring-1 ring-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AVAILABLE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#0A0D0B]/80 border border-white/[0.06]">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">Lot Volume</span>
              <p className="text-lg font-bold text-white font-mono mt-0.5">180 Meals</p>
              <span className="text-xs text-emerald-400">Nutritious Veg Biryani &amp; Dal</span>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">Safe Expiry Window</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <p className="text-lg font-bold text-amber-400 font-mono">02:44:10</p>
              </div>
              <span className="text-xs text-neutral-400">Must collect before 16:30</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 text-neutral-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Declaration: Hygienic &amp; Edible
            </span>
            <span className="font-mono text-neutral-300">Holding: 68°C (Insulated)</span>
          </div>
        </div>
      ),
    },
    {
      id: "act-match",
      number: "02",
      stepLabel: "ACT 2 · MATCH",
      title: "The right food. The right organization. The right time.",
      subtitle: "Our 5-factor explainable engine evaluates distance proximity (35%), dietary fit (25%), urgency (20%), intake capacity (10%), and transit buffers (10%).",
      pillText: "96% Compatibility Match",
      pillColor: "cobalt",
      cardContent: (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-mono font-medium text-sky-300">5-FACTOR COMPATIBILITY ENGINE</span>
            </div>
            <span className="text-xs font-mono text-neutral-400">Transit Radius: 2.4 km</span>
          </div>

          {/* Interactive Routing Visual between Nodes */}
          <div className="relative p-4 rounded-xl bg-[#0A0D0B]/90 border border-white/[0.08] overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-xs font-bold">
                  DP
                </div>
                <span className="text-[11px] text-neutral-300 font-medium mt-1">Daspalla</span>
                <span className="text-[10px] text-neutral-500 font-mono">Jagadamba</span>
              </div>

              <div className="flex-1 mx-3 relative flex items-center justify-center">
                <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 20">
                  <line 
                    x1="0" 
                    y1="10" 
                    x2="100" 
                    y2="10" 
                    stroke="rgba(255,255,255,0.12)" 
                    strokeWidth="2" 
                    strokeDasharray="4 4" 
                  />
                  <line
                    id="anime-match-connector"
                    x1="0"
                    y1="10"
                    x2="100"
                    y2="10"
                    stroke="#38BDF8"
                    strokeWidth="2.5"
                    strokeDasharray="100"
                    strokeDashoffset="0"
                  />
                </svg>
                <div className="absolute px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-[10px] font-mono text-sky-300 backdrop-blur-md">
                  6 min eta
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 text-xs font-bold">
                  SS
                </div>
                <span className="text-[11px] text-neutral-300 font-medium mt-1">Sneha Sandhya</span>
                <span className="text-[10px] text-neutral-500 font-mono">Siripuram</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <span className="text-neutral-400 block text-[10px] uppercase font-mono">Capacity Match</span>
              <span className="text-neutral-200 font-semibold">180 / 180 Needed</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <span className="text-neutral-400 block text-[10px] uppercase font-mono">Dietary Status</span>
              <span className="text-emerald-400 font-semibold">Pure Vegetarian (Verified)</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "act-collection",
      number: "03",
      stepLabel: "ACT 3 · COLLECTION",
      title: "Digital coordination becomes physical action.",
      subtitle: "Designated volunteer couriers and NGO logistics vans accept custody, verify food safety, and transport food in thermal containers.",
      pillText: "Courier In Transit",
      pillColor: "amber",
      cardContent: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Courier Van #FC-04 (Electric)</h4>
                <p className="text-xs text-neutral-400">Volunteer Driver: Rajesh Kumar</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 ring-1 ring-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              EN ROUTE
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0A0D0B]/80 border border-white/[0.06] space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-400 font-mono">Corridor Telemetry</span>
              <span className="text-white font-mono font-bold">17.7128° N, 83.3012° E</span>
            </div>
            <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full w-3/4 rounded-full" />
            </div>
            <div className="flex justify-between items-center text-[11px] text-neutral-400">
              <span>Pickup: Jagadamba Completed</span>
              <span className="text-amber-400 font-medium">ETA: 6 Minutes</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs px-1 text-neutral-400">
            <span>Container Seal: #VZ-9821</span>
            <span className="text-emerald-400 font-mono font-medium">Thermometer: 64°C Safe</span>
          </div>
        </div>
      ),
    },
    {
      id: "act-distribution",
      number: "04",
      stepLabel: "ACT 4 · DISTRIBUTION",
      title: "Food reaches the communities the NGO serves.",
      subtitle: "Verified NGOs receive the batch at their community kitchens and portion wholesome, warm meals to residents, day shelters, and local community members.",
      pillText: "Dignified Serving",
      pillColor: "emerald",
      cardContent: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Sneha Sandhya Elderly Shelter</h4>
                <p className="text-xs text-neutral-400">Siripuram Campus Center, Visakhapatnam</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              DISTRIBUTING
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#0A0D0B]/80 border border-white/[0.06]">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">Beneficiaries Reached</span>
              <p className="text-lg font-bold text-white font-mono mt-0.5">80 Residents</p>
              <span className="text-xs text-emerald-400">Direct Dinner Service</span>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">Service Temperature</span>
              <p className="text-lg font-bold text-emerald-400 font-mono mt-0.5">62°C Warm</p>
              <span className="text-xs text-neutral-400">Within 3.5h Safety Buffer</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "act-proof",
      number: "05",
      stepLabel: "ACT 5 · PROOF",
      title: "Impact shouldn't end with 'donated.'",
      subtitle: "NGO coordinators upload verifiable timestamped photographic evidence, headcount logs, and distribution details into the system.",
      pillText: "Submitted Distribution Photo",
      pillColor: "emerald",
      cardContent: (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-[#0A0D0B]/80 border border-white/[0.08] flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-lg bg-neutral-800/80 border border-white/10 flex flex-col items-center justify-center text-neutral-400 flex-shrink-0">
              <Camera className="w-6 h-6 text-emerald-400 mb-1" />
              <span className="text-[9px] font-mono text-emerald-300 uppercase">Evidence</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-white block truncate">
                Submitted Distribution Photo · Proof #VZ-8924
              </span>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Timestamp: Today at 14:48 IST · GPS Tagged (17.7215° N, 83.3155° E)
              </p>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-emerald-400 font-mono">
                <span>80 Elders Served</span>
                <span>•</span>
                <span>28kg Edible Food Conserved</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.06] text-neutral-400">
            <span className="font-mono text-[11px]">Evidence SHA-256 Checksum Verified</span>
            <span className="text-sky-400 font-medium">Awaiting Admin Sign-Off</span>
          </div>
        </div>
      ),
    },
    {
      id: "act-transparency",
      number: "06",
      stepLabel: "ACT 6 · TRANSPARENCY",
      title: "Every approved distribution becomes part of a transparent impact record.",
      subtitle: "Once audited by platform operations, the record updates public impact counters without ever exposing private donor numbers or sensitive beneficiary identities.",
      pillText: "Public Impact Ledger",
      pillColor: "emerald",
      cardContent: (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Admin Verified &amp; Ledger Committed
            </span>
            <span className="text-xs font-mono text-neutral-400">Audit Trail #AT-982</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[10px] text-neutral-400 uppercase font-mono block">Meals Rescued</span>
              <span className="text-base font-extrabold text-white font-mono mt-0.5 block">+180 Meals</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[10px] text-neutral-400 uppercase font-mono block">CO₂ Prevented</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono mt-0.5 block">42.5 kg</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[10px] text-neutral-400 uppercase font-mono block">Privacy Guard</span>
              <span className="text-base font-extrabold text-sky-400 font-mono mt-0.5 block">100% PII Safe</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
            <span>Verified by: Harsha Vardhan Pyla (System Administrator)</span>
            <span className="text-emerald-400 font-mono font-medium">Committed to Public Record</span>
          </div>
        </div>
      ),
    },
  ]

  return (
    <section
      ref={containerRef}
      id="how-foodconnect-works"
      className="relative bg-[#0A0D0B] text-foreground py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06] overflow-hidden"
    >
      {/* Background SVG Grid Accent */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 bg-grid-white/[0.02] bg-[size:36px_36px] [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]" 
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-medium text-emerald-400 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            END-TO-END AUTOMATED CHAIN OF CUSTODY
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-white">
            The 4-Stage Zero-Waste Protocol
          </h2>
          <p className="mt-4 text-neutral-300 text-base sm:text-lg">
            From the moment a commercial donor posts surplus to dignified community delivery, 
            every kilogram is tracked, temperature-validated, and publicly auditable.
          </p>
        </div>

        {/* Desktop Sticky Scroll Experience & Mobile Vertical Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Sticky Stage Index & Energy Progress Tracker */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            <div className="p-6 rounded-2xl bg-[#131914]/60 border border-white/[0.08] backdrop-blur-2xl shadow-xl">
              <span className="text-xs uppercase font-mono tracking-wider text-emerald-400 block mb-2">
                Active Protocol Phase
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {stages[activeStage].title}
              </h3>
              <p className="mt-2 text-sm text-neutral-300 leading-relaxed">
                {stages[activeStage].subtitle}
              </p>

              {/* Progress Steps Indicators */}
              <div className="mt-6 space-y-3">
                {stages.map((stg, idx) => {
                  const isCurrent = activeStage === idx
                  const isPast = activeStage > idx
                  return (
                    <div
                      key={stg.id}
                      className={cn(
                        "flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 cursor-pointer",
                        isCurrent 
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-white" 
                          : isPast 
                            ? "text-neutral-300 hover:bg-white/[0.02]" 
                            : "text-neutral-500 hover:bg-white/[0.02]"
                      )}
                      onClick={() => {
                        const elem = document.getElementById(`timeline-card-${idx}`)
                        elem?.scrollIntoView({ behavior: "smooth", block: "center" })
                      }}
                    >
                      <span className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition-colors",
                        isCurrent 
                          ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/40" 
                          : isPast 
                            ? "bg-white/10 text-emerald-400" 
                            : "bg-white/5 text-neutral-500"
                      )}>
                        {isPast ? <CheckCircle2 className="w-4 h-4" /> : stg.number}
                      </span>
                      <span className="text-xs font-medium flex-1">{stg.title}</span>
                      {isCurrent && (
                        <span className="text-[11px] font-mono text-emerald-400">ACTIVE</span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Energy Line Scroll Gauge */}
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-neutral-400 font-mono">
                <span>Protocol Completion</span>
                <span className="text-emerald-400 font-bold">
                  {Math.round(((activeStage + 1) / 6) * 100)}%
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 rounded-full"
                  style={{ scaleX: pathLength, transformOrigin: "0%" }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: 4-Stage Cards with Animated SVG Energy Path */}
          <div className="lg:col-span-7 relative space-y-12 sm:space-y-16">
            {/* SVG Connecting Energy Path */}
            <div className="absolute top-8 bottom-8 left-6 sm:left-8 w-1 -translate-x-1/2 pointer-events-none hidden md:block">
              <svg className="w-4 h-full" preserveAspectRatio="none" viewBox="0 0 10 100">
                <line 
                  x1="5" 
                  y1="0" 
                  x2="5" 
                  y2="100" 
                  stroke="rgba(255,255,255,0.08)" 
                  strokeWidth="2" 
                />
                <motion.line
                  x1="5"
                  y1="0"
                  x2="5"
                  y2="100"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  style={{
                    pathLength: pathLength,
                  }}
                />
              </svg>
            </div>

            {/* Stages Cards */}
            {stages.map((stage, index) => {
              const isCurrent = activeStage === index
              return (
                <motion.div
                  key={stage.id}
                  id={`timeline-card-${index}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ type: "spring", stiffness: 240, damping: 24 }}
                  whileHover={{ y: -4, rotateX: 1, rotateY: -1 }}
                  className={cn(
                    "relative md:pl-12 transition-all duration-300",
                    isCurrent ? "opacity-100" : "opacity-85"
                  )}
                >
                  {/* Glowing Node Dot on Timeline */}
                  <div className="hidden md:flex absolute left-6 sm:left-8 -translate-x-1/2 top-7 w-5 h-5 rounded-full bg-[#0A0D0B] border-2 border-emerald-400 items-center justify-center z-10">
                    <div className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      isCurrent ? "bg-emerald-400 scale-125 shadow-[0_0_8px_#10B981]" : "bg-neutral-600"
                    )} />
                  </div>

                  {/* Surface Card with 21st.dev Glassmorphism */}
                  <div className={cn(
                    "p-6 sm:p-7 rounded-2xl bg-[#131914]/70 backdrop-blur-2xl border transition-all duration-300",
                    isCurrent 
                      ? "border-emerald-500/40 shadow-2xl shadow-emerald-500/10 ring-1 ring-emerald-500/20" 
                      : "border-white/[0.08] hover:border-white/[0.15]"
                  )}>
                    {/* Card Top Label */}
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <span className="text-xs font-mono font-medium tracking-wide text-neutral-400">
                        {stage.stepLabel}
                      </span>
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium font-mono border",
                        stage.pillColor === "emerald" && "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
                        stage.pillColor === "amber" && "bg-amber-500/10 text-amber-300 border-amber-500/20",
                        stage.pillColor === "cobalt" && "bg-sky-500/10 text-sky-300 border-sky-500/20"
                      )}>
                        {stage.pillText}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white tracking-tight mb-2">
                      {stage.title}
                    </h3>

                    {/* Card Inner Content */}
                    <div className="mt-4">
                      {stage.cardContent}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
