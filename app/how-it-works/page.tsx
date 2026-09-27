"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"
import {
  UploadCloud,
  Cpu,
  Truck,
  HeartHandshake,
  FileCheck2,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react"
import { Header } from "@/components/home/header"
import { Footer } from "@/components/home/footer"
import { Button } from "@/components/ui/button"
import {
  PageHeading,
  EditorialLead,
  SectionHeading,
} from "@/components/ui/typography"
import { Card } from "@/components/ui/card"
import { FOODCONNECT_IMAGES, FoodConnectImage } from "@/lib/constants/images"
import { WorkflowProposedSystem } from "@/components/landing/WorkflowProposedSystem"

export default function HowItWorksPage() {
  const shouldReduceMotion = useReducedMotion()

  const steps: {
    num: string
    title: string
    stageName: string
    subtitle: string
    description: string
    icon: typeof UploadCloud
    image: FoodConnectImage
    status: string
    timing: string
    checklist: string[]
  }[] = [
    {
      num: "01",
      title: "Surplus Food Registration",
      stageName: "DONATE",
      subtitle: "Accurate logging by commercial donors",
      description:
        "Hotels, caterers, and bakeries log surplus food lots with portion counts, dietary categorization (Pure Veg / Non-Veg), preparation time, and storage parameters. Food hygiene and safety declarations are digitally acknowledged.",
      icon: UploadCloud,
      image: FOODCONNECT_IMAGES.food.cookedBuffet,
      status: "Lot Registered & Verified",
      timing: "Under 3 minutes",
      checklist: [
        "Portion count and exact dietary classifications",
        "Storage requirements (Insulated warmers / Refrigerated)",
        "Pickup window and loading dock coordinates",
      ],
    },
    {
      num: "02",
      title: "Explainable Need Matching",
      stageName: "MATCH",
      subtitle: "Pairing food with verified local capacity",
      description:
        "FoodConnect's algorithmic matching engine evaluates active demands from accredited shelters. Distance via Haversine calculation, storage equipment compatibility, and urgency are factored in to prevent food mismatch.",
      icon: Cpu,
      image: FOODCONNECT_IMAGES.workflow.surplusDispatch,
      status: "Algorithmic Proposal",
      timing: "Instant real-time match",
      checklist: [
        "True Haversine distance within 5km coastal corridors",
        "Shelter thermal holding equipment verified",
        "Batch sizing aligned with resident headcount",
      ],
    },
    {
      num: "03",
      title: "Custody Transit & Collection",
      stageName: "COLLECT",
      subtitle: "Temperature-controlled physical custody",
      description:
        "Assigned volunteer couriers or NGO logistics teams arrive during the designated window with insulated thermal warmers or carriers. Container seals and quantity are inspected upon dispatch.",
      icon: Truck,
      image: FOODCONNECT_IMAGES.workflow.collectionTransit,
      status: "Custody Chain Active",
      timing: "Within 45 min slot",
      checklist: [
        "Pre-scheduled arrival avoiding kitchen disruption",
        "Insulated thermal bag custody maintained",
        "Courier dispatch timestamp recorded",
      ],
    },
    {
      num: "04",
      title: "Dignified Community Distribution",
      stageName: "DISTRIBUTE",
      subtitle: "Direct nourishment by local caretakers",
      description:
        "Accredited shelters, elder homes, and community centers receive and immediately serve the warm meals to residents. FoodConnect never commercializes food; trusted community workers lead distribution with dignity.",
      icon: HeartHandshake,
      image: FOODCONNECT_IMAGES.community.elderlyDistribution,
      status: "Community Handover",
      timing: "Served before deadline",
      checklist: [
        "Immediate serving in sanitized dining halls",
        "Direct nourishment reaching vulnerable seniors & youth",
        "Zero diversion policy strictly enforced",
      ],
    },
    {
      num: "05",
      title: "Digital Verification & Audit Trail",
      stageName: "VERIFY",
      subtitle: "Closing the loop with full transparency",
      description:
        "On-site photos, GPS geofence match, and recipient headcount signatures are permanently recorded into the immutable audit record. Donors and community supporters receive verifiable proof of real impact.",
      icon: FileCheck2,
      image: FOODCONNECT_IMAGES.workflow.verificationPhoto,
      status: "Immutable Proof Logged",
      timing: "Logged within 15 min",
      checklist: [
        "Time-stamped GPS coordinate confirmation",
        "Photo proof of meal arrival at facility",
        "Public impact ledger updated automatically",
      ],
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased">
      <Header />

      <main className="flex-1 py-10 md:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="max-w-3xl">
            <Link
              href="/"
              prefetch={true}
              className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1 mb-2"
            >
              ← Back to Homepage
            </Link>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-3">
              <ShieldCheck className="size-3.5" />
              <span>Standard Operational Protocol · SDG 2 Zero Hunger</span>
            </div>
            <PageHeading className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
              The FoodConnect Protocol &amp; Workflow
            </PageHeading>
            <EditorialLead className="mt-3 text-muted-foreground leading-relaxed text-pretty">
              A structured, 4-stage operational architecture connecting food donors with suitable NGOs,
              streamlining the entire donation and distribution workflow across Visakhapatnam.
            </EditorialLead>
          </div>

          {/* Interactive Proposed System & 7-Step Architecture Flow */}
          <div className="mt-10 mb-14">
            <WorkflowProposedSystem />
          </div>

          {/* Detailed Verification Protocol Title */}
          <div className="pt-8 border-t border-border">
            <span className="text-xs font-mono uppercase font-bold text-primary tracking-widest block mb-1">
              Field Execution Standards
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Step-by-Step Food Safety &amp; Custody Timeline
            </h2>
          </div>

          {/* Premium Vertical Mobile & Desktop Timeline */}
          <div className="mt-10 relative">
            {/* Vertical timeline connecting spine */}
            <div className="absolute left-6 sm:left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-emerald-500/20 hidden sm:block" />

            <div className="space-y-10 sm:space-y-12">
              {steps.map((step, idx) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={step.num}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : idx * 0.08 }}
                    className="relative sm:pl-16"
                  >
                    {/* Spine Node Badge */}
                    <div className="hidden sm:flex absolute left-4 -translate-x-1/2 top-6 size-9 rounded-full bg-background border-2 border-primary items-center justify-center font-bold text-xs text-primary shadow-xs z-10">
                      {step.num}
                    </div>

                    <Card variant="warm" className="border-border/90 bg-card overflow-hidden shadow-xs hover:border-primary/40 transition-colors">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
                        {/* Stage Visual & Tag (5 cols) */}
                        <div className="relative aspect-[16/10] sm:aspect-auto lg:col-span-5 bg-muted min-h-[200px]">
                          <Image
                            src={step.image.src}
                            alt={step.image.alt}
                            fill
                            sizes="(max-width: 1024px) 100vw, 360px"
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                          {/* Stage Number on Mobile */}
                          <div className="absolute top-3 left-3 sm:hidden">
                            <span className="rounded-full bg-black/80 px-2.5 py-1 text-xs font-black text-white">
                              STAGE {step.num}
                            </span>
                          </div>

                          <div className="absolute top-3 right-3">
                            <span className="rounded-full bg-primary/95 text-primary-foreground px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                              {step.stageName}
                            </span>
                          </div>

                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                            <span className="font-semibold text-[11px] bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                              {step.status}
                            </span>
                            <span className="text-[10px] text-white/90 flex items-center gap-1">
                              <Clock className="size-3 text-emerald-400" />
                              {step.timing}
                            </span>
                          </div>
                        </div>

                        {/* Stage Description & Protocol Checklist (7 cols) */}
                        <div className="p-6 sm:p-7 lg:col-span-7 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Icon className="size-4" />
                              </div>
                              <span className="text-xs font-bold uppercase tracking-wider text-[var(--brand-terracotta)]">
                                {step.subtitle}
                              </span>
                            </div>

                            <h3 className="mt-2 text-lg sm:text-xl font-bold text-foreground">
                              {step.title}
                            </h3>

                            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                              {step.description}
                            </p>

                            <div className="mt-4 rounded-xl border border-border/70 bg-muted/40 p-3.5 space-y-2">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                                Verification Criteria
                              </span>
                              <ul className="space-y-1.5 text-xs text-foreground/90">
                                {step.checklist.map((item) => (
                                  <li key={item} className="flex items-start gap-2">
                                    <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Action CTA Box */}
          <div className="mt-16 sm:mt-20 rounded-3xl border border-primary/20 bg-primary/5 p-8 sm:p-12 text-center">
            <SectionHeading className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Ready to take part in Visakhapatnam?
            </SectionHeading>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Whether you represent a hotel with regular surplus or an accredited NGO caring
              for residents in Vizag, join our verified humanitarian network.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" render={<Link href="/donate" prefetch={true} />} nativeButton={false} className="gap-2 tap-tactile h-11 px-7 font-bold shadow-xs">
                <span>Donate Surplus Food</span>
                <ArrowRight className="size-4" />
              </Button>

              <Button variant="outline" size="lg" render={<Link href="/register" prefetch={true} />} nativeButton={false} className="tap-tactile h-11 px-7 font-semibold">
                <span>Register as an NGO</span>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
