"use client"

import * as React from "react"
import { motion, useInView, useReducedMotion } from "motion/react"
import { animate } from "animejs"
import { 
  TrendingUp, 
  Sparkles, 
  Award, 
  ShieldCheck, 
  Leaf, 
  Users, 
  Clock 
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CounterProps {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
}

function RollingNumber({ value, prefix = "", suffix = "", duration = 1800 }: CounterProps) {
  const [displayValue, setDisplayValue] = React.useState<number>(0)
  const elementRef = React.useRef<HTMLSpanElement>(null)
  const isInView = useInView(elementRef, { once: true, margin: "-40px" })
  const shouldReduceMotion = useReducedMotion()

  React.useEffect(() => {
    if (!isInView) return

    if (shouldReduceMotion) {
      const timer = setTimeout(() => setDisplayValue(value), 0)
      return () => clearTimeout(timer)
    }

    // Anime.js smooth numerical interpolation
    const obj = { count: Math.max(0, value - Math.min(value, 300)) }
    const anim = animate(obj, {
      count: value,
      duration: duration,
      easing: "easeOutExpo",
      onUpdate: () => {
        setDisplayValue(Math.floor(obj.count))
      },
    })

    return () => {
      // anim will complete or clean up
    }
  }, [isInView, value, duration, shouldReduceMotion])

  return (
    <span ref={elementRef} className="font-mono tabular-nums tracking-tight">
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  )
}

export function LiveCounter() {
  return (
    <div className="space-y-5">
      {/* Header with live activity ping */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-mono font-medium text-emerald-400 uppercase tracking-wider">
            Real-Time Vizag Pilot Telemetry
          </span>
        </div>
        <span className="text-[11px] font-mono text-neutral-400">
          Updated: Live
        </span>
      </div>

      {/* Primary Rescued Meals Stat */}
      <div className="p-4 rounded-xl bg-[#0A0D0B]/80 border border-white/[0.08] relative overflow-hidden group">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider block font-mono">
              Meals Rescued &amp; Distributed
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white mt-1">
              <RollingNumber value={14820} suffix="+" />
            </div>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
              +420 meals diverted today
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Ambient bottom glow */}
        <div 
          className="absolute -bottom-8 -right-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" 
          aria-hidden="true" 
        />
      </div>

      {/* Secondary NGO & Environmental Metric Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Active NGOs */}
        <div className="p-3.5 rounded-xl bg-[#0A0D0B]/70 border border-white/[0.06]">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-mono uppercase">Active NGOs</span>
            <Users className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            <RollingNumber value={42} suffix=" Orgs" duration={1200} />
          </div>
          <span className="text-[11px] text-sky-400 font-mono">100% Accredited</span>
        </div>

        {/* Carbon Offset */}
        <div className="p-3.5 rounded-xl bg-[#0A0D0B]/70 border border-white/[0.06]">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-mono uppercase">CO₂ Abated</span>
            <Leaf className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            <RollingNumber value={3480} suffix=" kg" duration={1400} />
          </div>
          <span className="text-[11px] text-amber-400 font-mono">Landfill Diverted</span>
        </div>
      </div>

      {/* Speed & Compliance Metric Strip */}
      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-xs font-mono">
        <span className="text-neutral-400 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          Avg. Match to Handover:
        </span>
        <span className="text-white font-bold">&lt; 18.4 mins</span>
      </div>
    </div>
  )
}
