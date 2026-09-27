"use client"

import * as React from "react"
import Image from "next/link" // We will use next/image
import NextImage from "next/image"
import Link from "next/link"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { 
  Radio, 
  MapPin, 
  Clock, 
  Sparkles, 
  Users, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Building2, 
  Flame, 
  ShieldCheck, 
  Truck, 
  Activity, 
  SlidersHorizontal,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"
import { LiveCounter } from "./LiveCounter"
import { FOODCONNECT_IMAGES } from "@/lib/constants/images"
import type { RadarNode, FeedDonationItem, FoodType, TelemetryStatus } from "./types"

// Initial Seed Data for the Radar Nodes across Visakhapatnam
const VIZAG_RADAR_NODES: RadarNode[] = [
  {
    id: "radar-node-1",
    name: "Hotel Daspalla Kitchen",
    area: "Jagadamba Center",
    coords: { x: 38, y: 44 },
    meals: 180,
    foodType: "VEG",
    urgency: "IMMEDIATE",
    status: "AVAILABLE",
    expiryMinutes: 145,
    donor: "Hotel Daspalla Vizag",
    matchedNgo: "Sneha Sandhya Shelter (1.4 km)",
    temperature: "68°C (Insulated)",
  },
  {
    id: "radar-node-2",
    name: "Novotel Varun Beach",
    area: "Beach Road",
    coords: { x: 62, y: 35 },
    meals: 120,
    foodType: "NON_VEG",
    urgency: "HIGH",
    status: "MATCHED",
    expiryMinutes: 190,
    donor: "Novotel Culinary Dept",
    matchedNgo: "Prema Samajam Care Home (2.1 km)",
    temperature: "62°C (Warming Pan)",
  },
  {
    id: "radar-node-3",
    name: "Vizag Bakers Guild",
    area: "Siripuram Junction",
    coords: { x: 48, y: 28 },
    meals: 85,
    foodType: "BAKERY",
    urgency: "NORMAL",
    status: "AVAILABLE",
    expiryMinutes: 280,
    donor: "Vizag Bakers Cooperative",
    matchedNgo: "Child Nutrition Center (0.9 km)",
    temperature: "Ambient Clean",
  },
  {
    id: "radar-node-4",
    name: "Murthy Catering Center",
    area: "Gajuwaka Industrial Hub",
    coords: { x: 22, y: 68 },
    meals: 240,
    foodType: "VEG",
    urgency: "IMMEDIATE",
    status: "AVAILABLE",
    expiryMinutes: 110,
    donor: "Murthy Grand Caterers",
    matchedNgo: "Ashray Gajuwaka Kitchen (1.2 km)",
    temperature: "71°C (Steam Chafing)",
  },
  {
    id: "radar-node-5",
    name: "Dolphin Banquet Hall",
    area: "Daba Gardens",
    coords: { x: 42, y: 52 },
    meals: 95,
    foodType: "VEG",
    urgency: "HIGH",
    status: "MATCHED",
    expiryMinutes: 165,
    donor: "Dolphin Hospitality",
    matchedNgo: "Sneha Sandhya Support Center",
    temperature: "65°C (Insulated Box)",
  },
]

// Photo Proof Carousel Items
const PHOTO_PROOFS = [
  {
    id: "proof-1",
    title: "Elderly Meal Handover",
    image: FOODCONNECT_IMAGES.community.elderlyDistribution.src,
    alt: FOODCONNECT_IMAGES.community.elderlyDistribution.alt,
    location: "Siripuram Shelter Campus",
    ngoName: "Sneha Sandhya Trust",
    meals: 180,
    time: "Today, 14:48 IST",
    badge: "Verified Handover",
  },
  {
    id: "proof-2",
    title: "Children Nutrition Luncheon",
    image: FOODCONNECT_IMAGES.community.childrenMeal.src,
    alt: FOODCONNECT_IMAGES.community.childrenMeal.alt,
    location: "Daba Gardens Community Hall",
    ngoName: "Prema Samajam Foundation",
    meals: 120,
    time: "Today, 13:20 IST",
    badge: "FSSAI Verified",
  },
  {
    id: "proof-3",
    title: "Insulated Transit Delivery",
    image: FOODCONNECT_IMAGES.workflow.collectionTransit.src,
    alt: FOODCONNECT_IMAGES.workflow.collectionTransit.alt,
    location: "Beach Road Corridor",
    ngoName: "Courier Unit FC-04",
    meals: 140,
    time: "Today, 12:15 IST",
    badge: "Cold-Chain Monitored",
  },
  {
    id: "proof-4",
    title: "Community Kitchen Distribution",
    image: FOODCONNECT_IMAGES.community.familyDistribution.src,
    alt: FOODCONNECT_IMAGES.community.familyDistribution.alt,
    location: "Gajuwaka Coastal Hamlet",
    ngoName: "Ashray Welfare Kitchen",
    meals: 240,
    time: "Today, 11:30 IST",
    badge: "Audit Hash Committed",
  },
]

// Real-Time Donation Feed Seed Items
const REAL_TIME_FEED_ITEMS: FeedDonationItem[] = [
  {
    id: "feed-1",
    donorName: "Hotel Daspalla Executive Kitchen",
    area: "Jagadamba Center",
    meals: 180,
    foodType: "VEG",
    status: "AVAILABLE",
    timeAgo: "2 mins ago",
    ngoName: "Evaluating 3 Nearby NGOs",
  },
  {
    id: "feed-2",
    donorName: "Novotel Varun Beach Banquet",
    area: "Beach Road",
    meals: 120,
    foodType: "NON_VEG",
    status: "MATCHED",
    timeAgo: "6 mins ago",
    ngoName: "Claimed by Prema Samajam",
  },
  {
    id: "feed-3",
    donorName: "Vizag Bakers Guild #12",
    area: "Siripuram Circle",
    meals: 85,
    foodType: "BAKERY",
    status: "IN_TRANSIT",
    timeAgo: "14 mins ago",
    volunteer: "Courier Rajesh Kumar (FC-01)",
    ngoName: "En Route to Shelter",
  },
  {
    id: "feed-4",
    donorName: "Murthy Caterers Gajuwaka",
    area: "Gajuwaka Industrial",
    meals: 240,
    foodType: "VEG",
    status: "DISTRIBUTED",
    timeAgo: "28 mins ago",
    ngoName: "Delivered to Ashray Kitchen",
  },
  {
    id: "feed-5",
    donorName: "Dolphin Hospitality Buffet",
    area: "Daba Gardens",
    meals: 95,
    foodType: "VEG",
    status: "AVAILABLE",
    timeAgo: "34 mins ago",
    ngoName: "Matching Active Need #ND-04",
  },
]

export function BentoGrid() {
  const shouldReduceMotion = useReducedMotion()

  // Card 1: Radar State
  const [selectedNode, setSelectedNode] = React.useState<RadarNode | null>(VIZAG_RADAR_NODES[0])
  const [radarFilter, setRadarFilter] = React.useState<"ALL" | "URGENT" | "VEG">("ALL")

  // Card 3: Photo Proof Carousel State
  const [currentProofIndex, setCurrentProofIndex] = React.useState<number>(0)
  const [isCarouselHovered, setIsCarouselHovered] = React.useState<boolean>(false)

  // Card 4: Feed Filter
  const [feedFilter, setFeedFilter] = React.useState<"ALL" | "AVAILABLE" | "IN_TRANSIT">("ALL")

  // Carousel auto-advance
  React.useEffect(() => {
    if (isCarouselHovered) return
    const interval = setInterval(() => {
      setCurrentProofIndex((prev) => (prev + 1) % PHOTO_PROOFS.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [isCarouselHovered])

  // Filtered Radar Nodes
  const filteredNodes = React.useMemo(() => {
    return VIZAG_RADAR_NODES.filter((n) => {
      if (radarFilter === "URGENT") return n.urgency === "IMMEDIATE"
      if (radarFilter === "VEG") return n.foodType === "VEG"
      return true
    })
  }, [radarFilter])

  // Filtered Feed Items
  const filteredFeed = React.useMemo(() => {
    return REAL_TIME_FEED_ITEMS.filter((item) => {
      if (feedFilter === "AVAILABLE") return item.status === "AVAILABLE"
      if (feedFilter === "IN_TRANSIT") return item.status === "IN_TRANSIT" || item.status === "MATCHED"
      return true
    })
  }, [feedFilter])

  return (
    <section 
      id="live-dashboard"
      className="relative bg-[#0A0D0B] text-foreground py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06] overflow-hidden"
    >
      {/* 1. Interactive SVG Grid Mask */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 bg-grid-obsidian [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_90%)]" 
        aria-hidden="true" 
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header with Tracked Headings */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-medium text-emerald-400 mb-3 ring-1 ring-emerald-500/20">
              <Activity className="w-3.5 h-3.5" />
              LIVE TELEMETRY &amp; ACTIVITY DASHBOARD
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-white">
              Zero Hunger Mission Control
            </h2>
            <p className="mt-2 text-neutral-400 text-sm sm:text-base max-w-xl">
              Live radar monitoring, autonomous dispatch queues, verified photo proofs, and real-time community distributions across Visakhapatnam.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/donate"
              prefetch={true}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-black font-semibold text-xs sm:text-sm hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
            >
              <Flame className="w-4 h-4" />
              Broadcast Surplus Lot
            </Link>
          </div>
        </div>

        {/* 21st.dev Style Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* ========================================================================= */}
          {/* CARD 1 (Span 2 cols): Live Surplus Food Radar                            */}
          {/* ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
            whileHover={shouldReduceMotion ? {} : { y: -4, rotateX: 1, rotateY: -1 }}
            className={cn(
              "lg:col-span-2 relative p-6 sm:p-7 rounded-2xl",
              "bg-[#131914]/60 backdrop-blur-2xl border border-white/[0.08]",
              "hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5",
              "transition-all duration-300 flex flex-col justify-between overflow-hidden"
            )}
          >
            {/* Card Header & Filter Chips */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Radio className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      Live Surplus Food Radar
                    </h3>
                    <p className="text-xs text-neutral-400 font-mono">
                      Visakhapatnam Urban Corridor · Active Sweeping
                    </p>
                  </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0A0D0B]/80 border border-white/[0.06] text-xs font-mono">
                  {(["ALL", "URGENT", "VEG"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setRadarFilter(mode)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg transition-colors",
                        radarFilter === mode
                          ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30"
                          : "text-neutral-400 hover:text-white"
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Radar Simulation Canvas / Grid Stage */}
              <div className="relative w-full h-72 sm:h-84 rounded-xl bg-[#080B09] border border-white/[0.06] overflow-hidden my-3">
                {/* Radar Grid Circles */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-24 h-24 rounded-full border border-emerald-500/10" />
                  <div className="w-48 h-48 rounded-full border border-emerald-500/10" />
                  <div className="w-72 h-72 rounded-full border border-emerald-500/15" />
                  <div className="w-96 h-96 rounded-full border border-emerald-500/10" />
                  {/* Crosshairs */}
                  <div className="absolute w-full h-[1px] bg-emerald-500/10" />
                  <div className="absolute h-full w-[1px] bg-emerald-500/10" />
                </div>

                {/* Rotating Conic Radar Sweep Beam */}
                {!shouldReduceMotion && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    aria-hidden="true"
                  >
                    <div className="w-96 h-96 rounded-full radar-beam animate-radar-sweep" />
                  </div>
                )}

                {/* Simulated Coastline SVG Silhouette (Bay of Bengal / Vizag) */}
                <svg 
                  className="absolute inset-0 w-full h-full pointer-events-none opacity-20" 
                  viewBox="0 0 100 100" 
                  preserveAspectRatio="none"
                >
                  <path 
                    d="M 15 0 Q 35 40 50 60 T 90 100 L 100 100 L 100 0 Z" 
                    fill="#3B82F6" 
                    opacity="0.08" 
                  />
                  <path 
                    d="M 15 0 Q 35 40 50 60 T 90 100" 
                    stroke="#3B82F6" 
                    strokeWidth="0.8" 
                    strokeDasharray="2 2" 
                    fill="none" 
                  />
                </svg>

                {/* Interactive Radar Nodes */}
                {filteredNodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id
                  const isUrgent = node.urgency === "IMMEDIATE"
                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      style={{
                        left: `${node.coords.x}%`,
                        top: `${node.coords.y}%`,
                      }}
                      className={cn(
                        "absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus:outline-none z-20",
                        "transition-transform hover:scale-125"
                      )}
                      aria-label={`${node.name} - ${node.meals} meals`}
                    >
                      {/* Pulsating Ping Wave */}
                      <span className="relative flex h-5 w-5 items-center justify-center">
                        <span 
                          className={cn(
                            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-60",
                            isUrgent ? "bg-amber-400" : "bg-emerald-400"
                          )} 
                        />
                        <span 
                          className={cn(
                            "relative inline-flex rounded-full h-3 w-3 border-2 border-black",
                            isSelected 
                              ? "bg-white ring-2 ring-emerald-400 scale-125" 
                              : isUrgent 
                                ? "bg-amber-400" 
                                : "bg-emerald-500"
                          )} 
                        />
                      </span>

                      {/* Small Pin Label */}
                      <span className="absolute top-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white whitespace-nowrap border border-white/10 opacity-75 group-hover:opacity-100 transition-opacity">
                        {node.meals} pkgs
                      </span>
                    </button>
                  )
                })}

                {/* Legend in corner */}
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-[#0A0D0B]/80 border border-white/[0.08] text-[10px] font-mono text-neutral-400 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Normal Batch
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" /> Urgent (&lt;2h)
                  </span>
                  <span className="text-white/40">| Click node to inspect</span>
                </div>
              </div>
            </div>

            {/* Selected Node Details Flyout */}
            <AnimatePresence mode="wait">
              {selectedNode && (
                <motion.div
                  key={selectedNode.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="p-3.5 rounded-xl bg-[#0A0D0B]/90 border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{selectedNode.name}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold",
                        selectedNode.urgency === "IMMEDIATE" 
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" 
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      )}>
                        {selectedNode.status}
                      </span>
                    </div>
                    <p className="text-neutral-400 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      {selectedNode.area} · {selectedNode.meals} Meals Available · {selectedNode.temperature}
                    </p>
                    <p className="text-sky-400 font-mono text-[11px]">
                      Recommended Route: {selectedNode.matchedNgo}
                    </p>
                  </div>

                  <Link
                    href={`/donate`}
                    prefetch={true}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-medium text-xs border border-emerald-500/30 transition-colors whitespace-nowrap self-end sm:self-auto"
                  >
                    Match &amp; Dispatch
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ========================================================================= */}
          {/* CARD 2 (Span 1 col): Live Impact Counter                                 */}
          {/* ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ type: "spring", stiffness: 240, damping: 24, delay: 0.1 }}
            whileHover={shouldReduceMotion ? {} : { y: -4, rotateX: 2, rotateY: -2 }}
            className={cn(
              "lg:col-span-1 relative p-6 sm:p-7 rounded-2xl",
              "bg-[#131914]/60 backdrop-blur-2xl border border-white/[0.08]",
              "hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5",
              "transition-all duration-300 flex flex-col justify-between"
            )}
          >
            {/* Embedded Live Counter Widget */}
            <LiveCounter />

            <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-neutral-400">UN SDG 2 Progress</span>
              <Link 
                href="/impact" 
                prefetch={true}
                className="text-emerald-400 hover:underline flex items-center gap-1 font-medium font-mono"
              >
                View Full Audit
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>

          {/* ========================================================================= */}
          {/* CARD 3 (Span 1 col): Recent Photo Proof Carousel                         */}
          {/* ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ type: "spring", stiffness: 240, damping: 24, delay: 0.15 }}
            whileHover={shouldReduceMotion ? {} : { y: -4, rotateX: 2, rotateY: -2 }}
            onMouseEnter={() => setIsCarouselHovered(true)}
            onMouseLeave={() => setIsCarouselHovered(false)}
            className={cn(
              "lg:col-span-1 relative p-6 sm:p-7 rounded-2xl",
              "bg-[#131914]/60 backdrop-blur-2xl border border-white/[0.08]",
              "hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5",
              "transition-all duration-300 flex flex-col justify-between"
            )}
          >
            <div>
              {/* Card Header & Controls */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <h3 className="text-base font-bold text-white">
                    Verified Photo Proofs
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentProofIndex((prev) => (prev === 0 ? PHOTO_PROOFS.length - 1 : prev - 1))}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors"
                    aria-label="Previous proof"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentProofIndex((prev) => (prev + 1) % PHOTO_PROOFS.length)}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors"
                    aria-label="Next proof"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Carousel Image Container with Smooth Spring Physics */}
              <div className="relative h-48 w-full rounded-xl overflow-hidden bg-[#0A0D0B] border border-white/[0.08]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentProofIndex}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.04 }}
                    transition={{ type: "spring", stiffness: 240, damping: 24 }}
                    className="absolute inset-0"
                  >
                    <NextImage
                      src={PHOTO_PROOFS[currentProofIndex].image}
                      alt={PHOTO_PROOFS[currentProofIndex].alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Overlay Badges */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-black/60 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                        {PHOTO_PROOFS[currentProofIndex].badge}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5">
                      <h4 className="text-xs font-bold text-white truncate">
                        {PHOTO_PROOFS[currentProofIndex].title}
                      </h4>
                      <p className="text-[11px] text-neutral-300 flex items-center justify-between mt-0.5">
                        <span className="truncate">{PHOTO_PROOFS[currentProofIndex].location}</span>
                        <span className="font-mono text-emerald-400 font-semibold">{PHOTO_PROOFS[currentProofIndex].meals} meals</span>
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Proof Metadata & Indicators */}
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-neutral-400 font-mono">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {PHOTO_PROOFS[currentProofIndex].time}
              </span>
              <div className="flex gap-1">
                {PHOTO_PROOFS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentProofIndex(i)}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all",
                      i === currentProofIndex ? "w-4 bg-emerald-400" : "bg-white/20"
                    )}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* ========================================================================= */}
          {/* CARD 4 (Span 2 cols): Real-Time Donation Feed                            */}
          {/* ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ type: "spring", stiffness: 240, damping: 24, delay: 0.2 }}
            whileHover={shouldReduceMotion ? {} : { y: -4, rotateX: 1, rotateY: -1 }}
            className={cn(
              "lg:col-span-2 relative p-6 sm:p-7 rounded-2xl",
              "bg-[#131914]/60 backdrop-blur-2xl border border-white/[0.08]",
              "hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5",
              "transition-all duration-300 flex flex-col justify-between"
            )}
          >
            <div>
              {/* Header & Filter Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      Real-Time Handover Feed
                    </h3>
                    <p className="text-xs text-neutral-400 font-mono">
                      Staggered streaming events from accredited kitchens &amp; shelters
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0A0D0B]/80 border border-white/[0.06] text-xs font-mono">
                  {(["ALL", "AVAILABLE", "IN_TRANSIT"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setFeedFilter(filter)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg transition-colors",
                        feedFilter === filter
                          ? "bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30"
                          : "text-neutral-400 hover:text-white"
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Staggered Feed List Items with Spring Physics */}
              <div className="space-y-2.5">
                {filteredFeed.map((item, index) => {
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 280, 
                        damping: 26, 
                        delay: index * 0.06 
                      }}
                      whileHover={{ x: 3 }}
                      className="p-3.5 rounded-xl bg-[#0A0D0B]/80 border border-white/[0.06] hover:border-white/[0.12] transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                          "w-2.5 h-2.5 rounded-full flex-shrink-0",
                          item.status === "AVAILABLE" && "bg-emerald-400 shadow-[0_0_8px_#10B981]",
                          item.status === "MATCHED" && "bg-sky-400 shadow-[0_0_8px_#38BDF8]",
                          item.status === "IN_TRANSIT" && "bg-amber-400 animate-pulse shadow-[0_0_8px_#F59E0B]",
                          item.status === "DISTRIBUTED" && "bg-emerald-500"
                        )} />

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-xs sm:text-sm truncate">
                              {item.donorName}
                            </span>
                            <span className="text-[11px] font-mono text-neutral-400 hidden sm:inline">
                              ({item.area})
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                            {item.ngoName || item.volunteer}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-white block">
                            {item.meals} Meals
                          </span>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            {item.timeAgo}
                          </span>
                        </div>

                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border hidden sm:inline-block",
                          item.status === "AVAILABLE" && "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
                          item.status === "MATCHED" && "bg-sky-500/10 text-sky-300 border-sky-500/20",
                          item.status === "IN_TRANSIT" && "bg-amber-500/10 text-amber-300 border-amber-500/20",
                          item.status === "DISTRIBUTED" && "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        )}>
                          {item.status}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Bottom Feed Summary */}
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-neutral-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-sky-400" />
                Live Courier Network: 12 Active Couriers On Road
              </span>
              <Link href="/food-needs" prefetch={true} className="text-sky-400 hover:underline flex items-center gap-1">
                Explore All Needs
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
