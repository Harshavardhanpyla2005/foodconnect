"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"
import {
  UploadCloud,
  Cpu,
  Truck,
  HeartHandshake,
  FileCheck2,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import {
  SectionHeading,
  Subheading,
  EditorialLead,
} from "@/components/ui/typography"
import { Card, CardContent } from "@/components/ui/card"
import { sectionEntranceVariants } from "@/lib/motion"
import { FOODCONNECT_IMAGES, FoodConnectImage } from "@/lib/constants/images"

export function HowItWorks() {
  const shouldReduceMotion = useReducedMotion()

  const steps: {
    num: string
    title: string
    action: string
    description: string
    icon: typeof UploadCloud
    timing: string
    image: FoodConnectImage
  }[] = [
    {
      num: "01",
      title: "Donate",
      action: "Register Surplus",
      description:
        "Commercial donors log surplus portion count, dietary type, preparation time, and collection deadline.",
      icon: UploadCloud,
      timing: "Within 2 min",
      image: FOODCONNECT_IMAGES.food.cookedBuffet,
    },
    {
      num: "02",
      title: "Match",
      action: "Smart Routing",
      description:
        "Intelligent engine evaluates Haversine distance, shelter capacity, and urgency to find the ideal verified recipient.",
      icon: Cpu,
      timing: "Automated scoring",
      image: FOODCONNECT_IMAGES.workflow.surplusDispatch,
    },
    {
      num: "03",
      title: "Collect",
      action: "Custody Transit",
      description:
        "Designated volunteer courier or NGO driver claims pickup and transports food in insulated carriers.",
      icon: Truck,
      timing: "30–45 min transit",
      image: FOODCONNECT_IMAGES.workflow.collectionTransit,
    },
    {
      num: "04",
      title: "Distribute",
      action: "Direct Delivery",
      description:
        "The verified NGO receives and serves wholesome meals directly to shelter residents and community members.",
      icon: HeartHandshake,
      timing: "Immediate service",
      image: FOODCONNECT_IMAGES.community.familyDistribution,
    },
    {
      num: "05",
      title: "Verify",
      action: "Audit Closure",
      description:
        "Delivery receipts and photographic evidence are logged into the immutable audit record before impact tallies update.",
      icon: FileCheck2,
      timing: "Audited log",
      image: FOODCONNECT_IMAGES.workflow.verificationPhoto,
    },
  ]

  return (
    <section id="how-it-works" className="py-16 md:py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={sectionEntranceVariants}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-3">
            <Sparkles className="size-3 text-[var(--brand-terracotta)]" />
            <span>End-to-End Operational Lifecycle</span>
          </div>
          <SectionHeading className="text-2xl sm:text-3xl lg:text-4xl text-foreground text-balance font-bold">
            How Surplus Food Reaches Real People
          </SectionHeading>
          <EditorialLead className="mt-4 mx-auto text-center text-muted-foreground">
            A disciplined, verifiable 5-step operational protocol linking Visakhapatnam&apos;s food
            surplus to vetted community organizations with genuine, active meal requirements.
          </EditorialLead>
        </motion.div>

        {/* 5-Step Journey: Sequential reveal with connecting arrows */}
        <div className="mt-14 relative">
          {/* Subtle animated connecting line in desktop background */}
          <div
            className="hidden lg:block absolute top-[120px] left-[5%] right-[5%] h-0.5 bg-gradient-to-r from-emerald-500/30 via-[var(--brand-terracotta)]/40 to-emerald-500/30 -z-1"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5 relative">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.num} className="relative flex flex-col">
                  <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : index * 0.1 }}
                    className="flex flex-col h-full"
                  >
                    <Card
                      variant="elevated"
                      className="flex flex-col justify-between h-full bg-card hover:border-primary/40 transition-all duration-300 shadow-xs hover:shadow-md overflow-hidden group"
                    >
                      {/* Step Visual Thumbnail with Zoom Effect */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                        <Image
                          src={step.image.src}
                          alt={step.image.alt}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 240px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-2.5 left-2.5 rounded-lg surface-floating-overlay px-2 py-0.5 text-xs font-bold text-foreground">
                          {step.num}
                        </div>
                        <div className="absolute bottom-2 right-2 rounded-md bg-black/70 backdrop-blur-xs px-2 py-0.5 text-[0.65rem] font-medium text-white/90">
                          {step.timing}
                        </div>
                      </div>

                      <CardContent className="p-4 flex flex-col justify-between flex-1">
                        <div>
                          {/* Number & Icon Header */}
                          <div className="flex items-center justify-between">
                            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[var(--brand-terracotta)]">
                              {step.action}
                            </span>
                            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Icon className="size-3.5" aria-hidden="true" />
                            </div>
                          </div>

                          {/* Title */}
                          <Subheading className="mt-2 text-base text-foreground font-bold">
                            {step.title}
                          </Subheading>

                          {/* Description */}
                          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                            {step.description}
                          </p>
                        </div>

                        {/* Footer Status Pill */}
                        <div className="mt-4 pt-2.5 border-t border-border/60 flex items-center justify-between text-[0.68rem] text-muted-foreground">
                          <span className="font-semibold text-foreground/80">
                            Protocol Step {step.num}
                          </span>
                          <span className="size-1.5 rounded-full bg-emerald-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Connecting Chevron on Desktop */}
                  {index < steps.length - 1 && (
                    <motion.div
                      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: shouldReduceMotion ? 0 : index * 0.1 + 0.2 }}
                      className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 size-7 items-center justify-center rounded-full bg-background border border-border shadow-xs text-primary"
                      aria-hidden="true"
                    >
                      <ChevronRight className="size-3.5" />
                    </motion.div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

