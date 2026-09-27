"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"
import {
  Sparkles,
  Maximize2,
  CheckCircle2,
  Layers,
  LayoutGrid,
  ChevronRight,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StageItem {
  num: string
  title: string
  actor: "Donor" | "Volunteer" | "NGO" | "Community" | "Platform"
  description: string
  bgPosition: string
}

const STAGES: StageItem[] = [
  {
    num: "01",
    title: "Donor Prepares Surplus Food",
    actor: "Donor",
    description: "Commercial kitchens and banquet halls pack freshly cooked, unserved surplus meals.",
    bgPosition: "0% 0%",
  },
  {
    num: "02",
    title: "Food Packed & Ready",
    actor: "Donor",
    description: "Food grade stainless carriers with temperature logging and safety seals applied.",
    bgPosition: "25% 0%",
  },
  {
    num: "03",
    title: "Volunteer Collects",
    actor: "Volunteer",
    description: "Designated volunteer courier arrives at donor premises and assumes custody.",
    bgPosition: "50% 0%",
  },
  {
    num: "04",
    title: "Volunteer in Transit",
    actor: "Volunteer",
    description: "Food transported rapidly along monitored Visakhapatnam transit corridors.",
    bgPosition: "75% 0%",
  },
  {
    num: "05",
    title: "Food Handed to NGO",
    actor: "Volunteer",
    description: "Courier reaches the verified NGO facility receiving bay for physical handover.",
    bgPosition: "100% 0%",
  },
  {
    num: "06",
    title: "Volunteer Captures Proof",
    actor: "Volunteer",
    description: "Volunteer captures physical handoff photo with timestamp and GPS coordinates.",
    bgPosition: "0% 100%",
  },
  {
    num: "07",
    title: "NGO Distributes Food",
    actor: "NGO",
    description: "Care workers and volunteers portion warm, wholesome meals for community residents.",
    bgPosition: "25% 100%",
  },
  {
    num: "08",
    title: "Community Receives Meals",
    actor: "Community",
    description: "Shelter children and elderly families receive nourishing meals with dignity.",
    bgPosition: "50% 100%",
  },
  {
    num: "09",
    title: "Verified Impact",
    actor: "Platform",
    description: "Photographic distribution records reviewed by operations before audit closure.",
    bgPosition: "75% 100%",
  },
  {
    num: "10",
    title: "Better Tomorrow Together",
    actor: "Community",
    description: "Zero edible waste achieved across Visakhapatnam through disciplined coordination.",
    bgPosition: "100% 100%",
  },
]

export function ProcessCollageStory() {
  const shouldReduceMotion = useReducedMotion()
  const [activeTab, setActiveTab] = React.useState<"grid" | "collage">("grid")
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false)

  return (
    <section id="process-story" className="py-16 md:py-24 relative overflow-hidden bg-[#07110D]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400">
            <Sparkles className="size-3.5" />
            <span>10-Stage Operational Journey</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight text-balance">
            From Commercial Kitchens to Verified Community Impact
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Every rescued meal in Visakhapatnam follows an authentic, verifiable 10-stage chain of custody — connecting commercial donors to volunteer couriers, verified NGO pantries, and community residents.
          </p>

          {/* View Mode Toggle */}
          <div className="inline-flex p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold pt-1">
            <button
              type="button"
              onClick={() => setActiveTab("grid")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all",
                activeTab === "grid"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <LayoutGrid className="size-3.5" />
              <span>10-Stage Balanced Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("collage")}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all",
                activeTab === "collage"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <Layers className="size-3.5" />
              <span>Master Process Collage</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: 10-STAGE BALANCED GRID */}
        {activeTab === "grid" && (
          <div className="space-y-6">
            {/* Desktop: 2 rows of 5 cards (2 x 5) | Tablet: 5 x 2 | Mobile: 1 x 10 vertical */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {STAGES.map((stage, idx) => (
                <motion.div
                  key={stage.num}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: shouldReduceMotion ? 0 : idx * 0.05 }}
                  className="rounded-2xl border border-emerald-950/80 bg-zinc-900/60 p-3.5 shadow-sm hover:border-emerald-500/40 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Scene Thumbnail Slice: Precise 500% x 200% sprite crop with equal proportions */}
                    <div
                      style={{
                        backgroundImage: "url(/images/workflow/foodconnect-process-collage.jpg)",
                        backgroundSize: "500% 200%",
                        backgroundPosition: stage.bgPosition,
                        backgroundRepeat: "no-repeat",
                      }}
                      className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-zinc-800 shadow-inner group-hover:scale-[1.02] transition-transform duration-300"
                    >
                      <div className="absolute top-2 left-2 rounded-md bg-black/80 backdrop-blur-xs px-2 py-0.5 text-[11px] font-bold text-white border border-white/20">
                        {stage.num}
                      </div>
                      <div className="absolute bottom-2 right-2 rounded-md bg-emerald-950/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                        {stage.actor}
                      </div>
                    </div>

                    {/* Title & Stage Details */}
                    <div>
                      <h3 className="text-xs font-bold text-foreground group-hover:text-emerald-300 transition-colors">
                        {stage.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {stage.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer Step Status */}
                  <div className="pt-2.5 mt-3 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
                    <span>Stage {stage.num} of 10</span>
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
              >
                <Maximize2 className="size-3.5" />
                <span>View Full-Resolution Master Collage</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: MASTER PROCESS COLLAGE */}
        {activeTab === "collage" && (
          <div className="rounded-2xl border border-emerald-900/40 bg-zinc-950 p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="size-4" />
                Authentic FoodConnect 10-Stage Process Panel
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800"
              >
                <Maximize2 className="size-3" />
                <span>Full Screen</span>
              </button>
            </div>

            {/* Preserved Native Aspect Ratio (No distortion, no stretching) */}
            <div
              className="relative w-full aspect-[1500/1000] rounded-xl overflow-hidden border border-emerald-900/60 shadow-lg cursor-pointer group"
              onClick={() => setIsLightboxOpen(true)}
            >
              <Image
                src="/images/workflow/foodconnect-process-collage.jpg"
                alt="FoodConnect 10-Stage Surplus Food Rescue Operational Journey"
                fill
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-contain group-hover:scale-[1.01] transition-transform duration-500"
                priority={false}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-white/20 shadow-lg">
                  <Maximize2 className="size-3.5" />
                  Click to Expand Master Image
                </span>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Photographic documentation of FoodConnect surplus preparation, packaging, volunteer transit, NGO handoff, and audited community distribution in Greater Visakhapatnam.
            </p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-5xl max-h-[92vh] bg-zinc-950 rounded-2xl p-4 border border-zinc-800 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-sm font-bold text-foreground">
                FoodConnect 10-Stage Operational Journey
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="text-zinc-400 hover:text-white text-xs font-bold px-2 py-1 rounded-md bg-zinc-900"
              >
                ✕ Close
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/workflow/foodconnect-process-collage.jpg"
              alt="FoodConnect 10-Stage Master Journey"
              className="max-h-[80vh] w-auto mx-auto rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </section>
  )
}
