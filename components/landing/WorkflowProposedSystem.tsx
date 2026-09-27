"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import {
  UserPlus,
  Network,
  Truck,
  Camera,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Database,
  BellRing,
  HeartHandshake,
  Layers,
  FileCheck2,
  Eye,
  AlertCircle,
  TrendingDown,
  Users2,
  Compass,
  FileText
} from "lucide-react"
import { cn } from "@/lib/utils"

export function WorkflowProposedSystem() {
  const shouldReduceMotion = useReducedMotion()
  const [activeTab, setActiveTab] = React.useState<"workflow" | "architecture" | "problem-solution" | "features">("workflow")
  const [selectedWorkflowStep, setSelectedWorkflowStep] = React.useState<number>(0)

  // 4 Core Stages from Slide 4
  const workflowStages = [
    {
      id: "donor-registers",
      stepNumber: "01",
      title: "Donor Registers",
      subtitle: "Food Surplus Broadcast",
      icon: UserPlus,
      color: "emerald",
      badgeText: "Food Safety Declaration Logged",
      actionLabel: "Try Donor Registration",
      actionHref: "/donate",
      shortSummary: "Donor logs food surplus with verified quantity, food type, preparation time, and storage requirements.",
      details: [
        "Food donation registration with quantity and details (Pure Veg / Non-Veg)",
        "Food availability information and pickup window countdown",
        "Digital hygiene & food safety declaration",
        "Real-time donation status tracking dashboard"
      ],
      mockData: {
        actor: "Hotel Daspalla Visakhapatnam",
        type: "Cooked Meals (Rice, Dal, Veggies)",
        quantity: "180 Meal Portions",
        timing: "Ready for pickup: 13:00 - 15:30 IST",
        location: "Surya Bagh, Jagadamba Center"
      }
    },
    {
      id: "platform-matches",
      stepNumber: "02",
      title: "Platform Matches",
      subtitle: "Smart Algorithmic Matching",
      icon: Network,
      color: "sky",
      badgeText: "Proximity & Intake Scored",
      actionLabel: "View Matching Engine",
      actionHref: "/food-needs",
      shortSummary: "Database and management system processes data and pairs surplus with suitable accredited NGOs.",
      details: [
        "Autonomous calculation of proximity corridors (< 5 km coastal transit)",
        "Dietary compatibility matching (shelter dietary rules strictly observed)",
        "Capacity alignment against active NGO headcount demand",
        "Instant dispatch alerts sent to accredited nearby NGO partners"
      ],
      mockData: {
        engine: "Multi-Factor Scoring Matrix",
        matchTarget: "Sneha Sandhya Old Age Home (Siripuram)",
        compatibility: "High Match Compatibility",
        transitDistance: "2.4 km corridor (8 min ETA)",
        capacityStatus: "180 / 180 Meals Requested"
      }
    },
    {
      id: "ngo-collects",
      stepNumber: "03",
      title: "NGO Collects",
      subtitle: "Verified Custody & Transport",
      icon: Truck,
      color: "amber",
      badgeText: "Insulated Thermal Transit",
      actionLabel: "View Courier / NGO Hub",
      actionHref: "/dashboard/ngo",
      shortSummary: "NGO accepts donation, coordinates transport, and collects food from donor kitchen.",
      details: [
        "NGO accepts match proposal and triggers collection scheduling",
        "Insulated thermal carriers deployed to maintain food freshness",
        "Pickup verified with donor supervisor without disrupting commercial service",
        "Real-time collection status tracking from dispatch to arrival"
      ],
      mockData: {
        collector: "Sneha Sandhya Care Team & Courier #FC-04",
        vehicle: "Electric Delivery Van (GPS Monitored)",
        temperature: "Insulated Warmers Verified at Dock",
        status: "En Route to Distribution Center",
        transitCorridor: "Jagadamba Center ➔ Siripuram Campus"
      }
    },
    {
      id: "ngo-distributes",
      stepNumber: "04",
      title: "NGO Distributes",
      subtitle: "Dignified Meal Handover & Photo Proof",
      icon: Camera,
      color: "emerald",
      badgeText: "Photo Proof & Audit Logged",
      actionLabel: "Inspect Transparency Proofs",
      actionHref: "/impact",
      shortSummary: "NGO distributes food to people in need and records distribution through photos, quantity, date, and location.",
      details: [
        "Food distributed to residents and vulnerable community members",
        "Distribution record submission with timestamped photo proof",
        "Quantity distributed, date, location, and beneficiary count logged",
        "Immutable record updated in public ledger for donor and admin audit"
      ],
      mockData: {
        beneficiary: "Sneha Sandhya Elderly Community",
        servedCount: "180 Senior Residents Fed",
        photoProof: "Uploaded with GPS Tag: 17.7215° N, 83.3150° E",
        distributionDate: "Today at 14:15 IST",
        outcome: "Verified Delivery · 42.5kg CO₂ Equivalent Saved"
      }
    }
  ]

  // 7 Architecture Steps from Slide 6
  const architectureSteps = [
    {
      step: 1,
      title: "Donor App Registration",
      desc: "Donor uses Web/Mobile App to register food donation with volume & pickup parameters.",
      icon: UserPlus,
      actor: "Food Donor"
    },
    {
      step: 2,
      title: "Data Processing",
      desc: "Database and Management System processes data, validates hygiene, and initializes tracking.",
      icon: Database,
      actor: "Central System"
    },
    {
      step: 3,
      title: "Matching & Alerts",
      desc: "NGO Matching and Notification alerts suitable NGOs within proximity corridors.",
      icon: BellRing,
      actor: "Matching Engine"
    },
    {
      step: 4,
      title: "NGO Food Collection",
      desc: "Accredited NGO or volunteer courier collects food and ensures safe custody.",
      icon: Truck,
      actor: "NGO / Courier"
    },
    {
      step: 5,
      title: "Community Distribution",
      desc: "NGO distributes nourishing meals to communities and vulnerable groups in need.",
      icon: HeartHandshake,
      actor: "NGO Partner"
    },
    {
      step: 6,
      title: "Proof Record Storage",
      desc: "Distribution records stored with photos, quantity distributed, date, and GPS location.",
      icon: FileCheck2,
      actor: "Audit Ledger"
    },
    {
      step: 7,
      title: "System Oversight",
      desc: "Admin provides system monitoring, NGO accreditation, and compliance auditing across all layers.",
      icon: ShieldCheck,
      actor: "Platform Admin"
    }
  ]

  // Problem vs Solution from Slide 2 & 5
  const problemSolutions = [
    {
      gap: "Donor Awareness Gap",
      problem: "Donors often do not know which NGOs can collect their surplus food before it spoils.",
      solution: "FoodConnect instantly broadcasts available lots to nearby accredited shelters with matching capacity.",
      icon: AlertCircle,
      accent: "amber"
    },
    {
      gap: "NGO Visibility Gap",
      problem: "NGOs may not easily know where surplus food is available in their local geographic area.",
      solution: "Real-time location-based radar discovery and automated SMS/push notifications alert NGOs instantly.",
      icon: Compass,
      accent: "sky"
    },
    {
      gap: "Lack of Tracking & Transparency",
      problem: "Donation and distribution activities traditionally lack proper tracking and verified accountability.",
      solution: "Mandatory timestamped photo proof, GPS verification, and quantity reconciliation permanently logged.",
      icon: FileText,
      accent: "emerald"
    }
  ]

  // Key Features from Slide 7
  const featuresByRole = [
    {
      role: "Donor Features",
      color: "amber",
      points: [
        "Donor registration and fast secure sign in",
        "Food donation registration with quantity and dietary details",
        "Food availability information and pickup window status",
        "Live donation status tracking from post to distribution"
      ]
    },
    {
      role: "NGO Features",
      color: "sky",
      points: [
        "NGO registration, document upload, and accreditation",
        "View available food donations across Visakhapatnam",
        "Location-based donation discovery with transit distances",
        "Accept donations and update collection/custody status"
      ]
    },
    {
      role: "Transparency & Reporting",
      color: "emerald",
      points: [
        "Distribution record submission with verified photo proofs",
        "Quantity distributed, date, time, and precise location logged",
        "Audited data analysis for administrative oversight and reporting",
        "Measurable contribution towards UN SDG 2 (Zero Hunger)"
      ]
    }
  ]

  const currentStep = workflowStages[selectedWorkflowStep]

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-[#0A0D0B] text-foreground border-t border-white/[0.06]">
      {/* Background radial highlight */}
      <div 
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[48rem] h-[28rem] rounded-full bg-emerald-500/10 blur-[130px]" 
        aria-hidden="true" 
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide uppercase mb-4">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            SDG 2 · Zero Hunger Support System
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white text-balance">
            Proposed System &amp; Architecture
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-400 leading-relaxed text-pretty">
            A centralized digital platform connecting surplus-food donors with suitable NGOs, 
            streamlining the entire donation, matching, collection, and verified distribution workflow.
          </p>
        </div>

        {/* Navigation Mode Tabs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-[#131914]/80 border border-white/[0.08] backdrop-blur-xl max-w-2xl mx-auto">
          <button
            onClick={() => setActiveTab("workflow")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all",
              activeTab === "workflow"
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold"
                : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
            )}
          >
            <Network className="w-4 h-4" />
            4-Stage Workflow (Slide 4)
          </button>

          <button
            onClick={() => setActiveTab("architecture")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all",
              activeTab === "architecture"
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold"
                : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
            )}
          >
            <Layers className="w-4 h-4" />
            7-Step Architecture (Slide 6)
          </button>

          <button
            onClick={() => setActiveTab("problem-solution")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all",
              activeTab === "problem-solution"
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold"
                : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
            )}
          >
            <TrendingDown className="w-4 h-4" />
            Problem &amp; Objectives
          </button>

          <button
            onClick={() => setActiveTab("features")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all",
              activeTab === "features"
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold"
                : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
            )}
          >
            <ShieldCheck className="w-4 h-4" />
            Key Features (Slide 7)
          </button>
        </div>

        {/* Tab 1: 4-Stage Workflow (Proposed System Slide 4) */}
        {activeTab === "workflow" && (
          <div className="mt-12 space-y-10">
            {/* The 4 Circular Interlocking Icons matching Slide 4 */}
            <div className="relative">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
                {workflowStages.map((stage, idx) => {
                  const Icon = stage.icon
                  const isSelected = selectedWorkflowStep === idx

                  return (
                    <button
                      key={stage.id}
                      onClick={() => setSelectedWorkflowStep(idx)}
                      className={cn(
                        "group relative flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-300",
                        "bg-[#131914]/70 border backdrop-blur-xl",
                        isSelected
                          ? "border-emerald-500 ring-2 ring-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.18)] scale-[1.02]"
                          : "border-white/[0.08] hover:border-white/[0.2] hover:bg-[#131914]"
                      )}
                    >
                      {/* Step Number Tag */}
                      <span className={cn(
                        "text-[10px] font-mono uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full mb-3",
                        isSelected ? "bg-emerald-500/20 text-emerald-300" : "bg-white/[0.05] text-neutral-400"
                      )}>
                        Step {stage.stepNumber}
                      </span>

                      {/* Iconic Big Circle representing Slide 4 circles */}
                      <div className={cn(
                        "size-20 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                        isSelected
                          ? "bg-emerald-500 text-black border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                          : "bg-[#0A0D0B] text-neutral-300 border-white/[0.15] group-hover:border-emerald-500/50 group-hover:text-emerald-400"
                      )}>
                        <Icon className="w-8 h-8 transition-transform group-hover:scale-110" />
                      </div>

                      <h3 className="mt-4 text-base font-bold text-white tracking-tight">
                        {stage.title}
                      </h3>
                      <p className="mt-1 text-xs text-neutral-400 line-clamp-2">
                        {stage.subtitle}
                      </p>

                      {/* Active indicator dot */}
                      {isSelected && (
                        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Active Preview</span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Detailed Stage Execution Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="rounded-3xl border border-white/[0.1] bg-[#131914]/90 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl shadow-black/60"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Stage Explanation & Protocols */}
                  <div className="lg:col-span-7 space-y-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-mono font-bold text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        STAGE {currentStep.stepNumber} · PROPOSED PIPELINE
                      </span>
                      <span className="text-xs font-mono text-neutral-400">
                        {currentStep.badgeText}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                      {currentStep.title} — {currentStep.subtitle}
                    </h3>

                    <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                      {currentStep.shortSummary}
                    </p>

                    <div className="pt-2">
                      <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-400 mb-3">
                        Operational Execution Standards:
                      </h4>
                      <ul className="space-y-2.5">
                        {currentStep.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-200">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 flex flex-wrap items-center gap-3">
                      <Link
                        href={currentStep.actionHref}
                        prefetch={true}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm transition-colors shadow-lg shadow-emerald-500/20"
                      >
                        <span>{currentStep.actionLabel}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      <span className="text-xs text-neutral-400">
                        Fully interactive in this prototype
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Live Mock Data Telemetry Card */}
                  <div className="lg:col-span-5 rounded-2xl bg-[#0A0D0B] border border-white/[0.08] p-5 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                      <span className="text-xs font-mono font-semibold text-emerald-400 flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                        LIVE TELEMETRY LOG
                      </span>
                      <span className="text-[11px] font-mono text-neutral-500">VISAKHAPATNAM</span>
                    </div>

                    <div className="space-y-3 font-mono text-xs">
                      {Object.entries(currentStep.mockData).map(([key, value]) => (
                        <div key={key} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                          <span className="text-[10px] uppercase tracking-wider text-neutral-400 block">
                            {key.replace(/([A-Z])/g, " $1")}
                          </span>
                          <span className="text-neutral-200 font-medium text-xs mt-0.5 block truncate">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Official Slide 4 Workflow Caption */}
                    <div className="mt-4 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-300 leading-snug">
                      <strong>Workflow Guarantee:</strong> After collection, the NGO distributes food to people or communities in need and records the distribution through photos, quantity distributed, date, location, and other distribution details.
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Tab 2: 7-Step System Architecture (Slide 6) */}
        {activeTab === "architecture" && (
          <div className="mt-12 space-y-6">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center max-w-2xl mx-auto">
              <span className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                End-to-End System Architecture (Slide 6)
              </span>
              <p className="text-xs text-neutral-300 mt-1">
                The architecture places the application and database between users and NGOs, with administrative oversight across the entire system.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {architectureSteps.map((step) => {
                const Icon = step.icon
                return (
                  <div
                    key={step.step}
                    className={cn(
                      "p-5 rounded-2xl bg-[#131914]/80 border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between hover:border-emerald-500/40 transition-colors",
                      step.step === 7 ? "md:col-span-2 lg:col-span-3 xl:col-span-1 border-purple-500/30 bg-purple-950/10" : ""
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs">
                          #{step.step}
                        </div>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/[0.05] text-neutral-400">
                          {step.actor}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                        <h4 className="text-sm font-bold text-white">{step.title}</h4>
                      </div>

                      <p className="text-xs text-neutral-300 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-neutral-500">
                      <span>Status: Automated</span>
                      <span className="text-emerald-400">Active</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Problem Statement & Objectives (Slides 2, 3, 5) */}
        {activeTab === "problem-solution" && (
          <div className="mt-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {problemSolutions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#131914]/80 border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                      Challenge Identified
                    </span>
                    <h4 className="text-lg font-bold text-white mt-3 mb-2">{item.gap}</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                      {item.problem}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/[0.06]">
                    <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 block mb-1">
                      Platform Solution:
                    </span>
                    <p className="text-xs text-neutral-200 leading-relaxed font-medium">
                      {item.solution}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Core SDG 2 Objectives Strip */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#131914]/90 border border-emerald-500/30 shadow-xl">
              <h4 className="text-sm font-bold font-mono uppercase text-emerald-400 tracking-wider mb-4 text-center sm:text-left">
                Key Objectives Realized (Slide 5):
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-center">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-xs font-bold text-white block">Reduce Wastage</span>
                  <span className="text-[10px] text-neutral-400 mt-1 block">Redirect edible surplus away from landfill</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-xs font-bold text-white block">Connect Donors &amp; NGOs</span>
                  <span className="text-[10px] text-neutral-400 mt-1 block">Bridge the operational communication gap</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-xs font-bold text-white block">Improve Coordination</span>
                  <span className="text-[10px] text-neutral-400 mt-1 block">Enable rapid, location-based collection</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-xs font-bold text-white block">Track &amp; Record</span>
                  <span className="text-[10px] text-neutral-400 mt-1 block">Maintain transparent photo &amp; GPS records</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] col-span-2 sm:col-span-1">
                  <span className="text-xs font-bold text-emerald-400 block">Zero Hunger Goal</span>
                  <span className="text-[10px] text-neutral-400 mt-1 block">Contribute directly to UN SDG 2</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Key Features Matrix (Slide 7) */}
        {activeTab === "features" && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuresByRole.map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#131914]/80 border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-lg font-bold text-white pb-3 border-b border-white/[0.06] mb-4">
                    {feature.role}
                  </h4>
                  <ul className="space-y-3">
                    {feature.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2.5 text-xs text-neutral-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06]">
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Prototype Capability
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
