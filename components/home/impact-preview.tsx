"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useReducedMotion, useInView } from "motion/react"
import { animate } from "animejs"
import {
  UtensilsCrossed,
  PackageCheck,
  Building2,
  Users2,
  AlertCircle,
  HeartHandshake,
  CheckCircle2,
} from "lucide-react"
import {
  SectionHeading,
  EditorialLead,
} from "@/components/ui/typography"
import { Card, CardContent } from "@/components/ui/card"
import { sectionEntranceVariants, cardElevateHover } from "@/lib/motion"
import { FOODCONNECT_IMAGES } from "@/lib/constants/images"
import { cn } from "@/lib/utils"

interface MetricItemProps {
  id: string
  label: string
  value: number
  suffix?: string
  description: string
  icon: React.ElementType
  color: string
  bg: string
  shouldReduceMotion: boolean | null
  isInView: boolean
}

function MetricCard({
  label,
  value,
  suffix = "",
  description,
  icon: Icon,
  color,
  bg,
  shouldReduceMotion,
  isInView,
}: MetricItemProps) {
  const [currentVal, setCurrentVal] = React.useState(0)
  const animRef = React.useRef<{ pause?: () => void } | null>(null)
  const valHolderRef = React.useRef(0)

  React.useEffect(() => {
    if (shouldReduceMotion || !isInView) return

    const obj = { val: valHolderRef.current }
    animRef.current?.pause?.()

    animRef.current = animate(obj, {
      val: value,
      duration: 1600,
      ease: "outExpo",
      onUpdate: () => {
        valHolderRef.current = obj.val
        setCurrentVal(Math.round(obj.val))
      },
    })

    return () => {
      animRef.current?.pause?.()
    }
  }, [value, shouldReduceMotion, isInView])

  const formattedVal = shouldReduceMotion
    ? value.toLocaleString("en-IN")
    : currentVal.toLocaleString("en-IN")

  return (
    <Card variant="warm" className="h-full border-border/80 shadow-xs flex flex-col justify-between">
      <CardContent className="p-6 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
            <div className={cn("flex size-9 items-center justify-center rounded-lg shadow-2xs", bg, color)}>
              <Icon className="size-4.5" aria-hidden="true" />
            </div>
          </div>

          <div className="mt-4">
            <span className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground numeral-tabular">
              {formattedVal}
              {suffix}
            </span>
          </div>
        </div>

        <p className="mt-4 pt-3.5 border-t border-border/60 text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

export function ImpactPreview() {
  const shouldReduceMotion = useReducedMotion()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: "-60px" })

  const metrics = [
    {
      id: "meals",
      label: "Meals Rescued",
      value: 142500,
      suffix: "+",
      description: "Wholesome food portions saved from disposal across pilot corridors",
      icon: UtensilsCrossed,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      id: "donations",
      label: "Donations Completed",
      value: 1840,
      suffix: "+",
      description: "Successful surplus handovers between verified donors & community kitchens",
      icon: PackageCheck,
      color: "text-[var(--brand-terracotta)]",
      bg: "bg-[var(--brand-terracotta)]/10",
    },
    {
      id: "ngos",
      label: "Verified NGOs",
      value: 215,
      suffix: "",
      description: "Accredited shelters, elder care homes, and welfare centers in network",
      icon: Building2,
      color: "text-amber-800 dark:text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      id: "people",
      label: "People Reached",
      value: 38200,
      suffix: "+",
      description: "Individuals receiving nutritious meals distributed through verified NGO partners",
      icon: Users2,
      color: "text-teal-800 dark:text-teal-400",
      bg: "bg-teal-500/10",
    },
  ]

  return (
    <section id="impact" ref={containerRef} className="py-20 lg:py-28 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <motion.div
            initial={shouldReduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={sectionEntranceVariants}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <HeartHandshake className="size-3.5" />
              <span>Measurable Community Outcomes</span>
            </div>

            <SectionHeading className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground text-balance">
              Every meal has an outcome.
            </SectionHeading>

            <EditorialLead className="mt-3 text-muted-foreground text-pretty">
              Tracking every rescued meal from collection to distribution gives donors,
              volunteers, and community partners verifiable visibility into real community impact.
            </EditorialLead>
          </motion.div>

          {/* Mandatory Demo Data Disclaimer */}
          <div className="flex items-center gap-2 self-start md:self-end rounded-lg bg-amber-500/10 px-3.5 py-2 text-xs font-medium text-amber-900 dark:text-amber-300 border border-amber-500/20">
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
            <span>Prototype Demo Metrics — Illustrative Platform Data</span>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, index) => (
            <motion.div
              key={m.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
            >
              <MetricCard
                {...m}
                shouldReduceMotion={shouldReduceMotion}
                isInView={isInView}
              />
            </motion.div>
          ))}
        </div>

        {/* Visual Community Impact Context Grid */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Card 1: Elderly Distribution */}
          <motion.div
            variants={cardElevateHover}
            initial="rest"
            whileHover="hover"
            className="lg:col-span-6 rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
              <Image
                src={FOODCONNECT_IMAGES.community.elderlyDistribution.src}
                alt={FOODCONNECT_IMAGES.community.elderlyDistribution.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 580px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded backdrop-blur-xs">
                  Dignified Care
                </span>
                <h4 className="mt-2 text-base font-bold leading-snug">
                  Sneha Sandhya Elder Care Facility
                </h4>
                <p className="text-xs text-white/85 line-clamp-1 mt-0.5">
                  Nutritious, warm meals delivered for 80 elderly residents in MVP Colony.
                </p>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between text-xs text-muted-foreground bg-muted/30">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                Verified Handover Recorded
              </span>
              <span className="text-[11px] font-semibold text-primary">Prototype Case Context</span>
            </div>
          </motion.div>

          {/* Card 2: Children Nutrition */}
          <motion.div
            variants={cardElevateHover}
            initial="rest"
            whileHover="hover"
            className="lg:col-span-6 rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
              <Image
                src={FOODCONNECT_IMAGES.community.childrenMeal.src}
                alt={FOODCONNECT_IMAGES.community.childrenMeal.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 580px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded backdrop-blur-xs">
                  Community Youth
                </span>
                <h4 className="mt-2 text-base font-bold leading-snug">
                  Prema Samajam Children Support Center
                </h4>
                <p className="text-xs text-white/85 line-clamp-1 mt-0.5">
                  Fresh buffet surplus packed hygienically into individual lunch boxes.
                </p>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between text-xs text-muted-foreground bg-muted/30">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                FSSAI Kitchen Standards Compliant
              </span>
              <span className="text-[11px] font-semibold text-primary">Prototype Case Context</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
