"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"
import {
  FileCheck,
  Camera,
  MapPin,
  Clock,
  Users,
  Scale,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Truck,
  HeartHandshake,
  FileSpreadsheet,
} from "lucide-react"
import {
  SectionHeading,
  EditorialLead,
} from "@/components/ui/typography"
import { Card, CardContent } from "@/components/ui/card"
import { sectionEntranceVariants } from "@/lib/motion"
import { FOODCONNECT_IMAGES } from "@/lib/constants/images"

export function TransparencySection() {
  const shouldReduceMotion = useReducedMotion()

  const verificationLoop = [
    {
      step: "01",
      name: "Donation",
      sub: "Verified Listing",
      desc: "Donor logs food type, preparation time, and quantity with hygiene declaration.",
      icon: Scale,
    },
    {
      step: "02",
      name: "Collection",
      sub: "In-Transit Chain",
      desc: "Courier accepts custody; temperature and transit corridor logged in real time.",
      icon: Truck,
    },
    {
      step: "03",
      name: "Distribution",
      sub: "Handed to Shelter",
      desc: "Delivered to verified NGO kitchen equipped with required holding facilities.",
      icon: HeartHandshake,
    },
    {
      step: "04",
      name: "Photo / Record",
      sub: "Visual Proof",
      desc: "Time-stamped photographic evidence captured upon arrival at the facility.",
      icon: Camera,
    },
    {
      step: "05",
      name: "Verification",
      sub: "Audit Protocol",
      desc: "Digital signature and GPS geofence match confirm successful handover.",
      icon: FileCheck,
    },
    {
      step: "06",
      name: "Impact",
      sub: "Beneficiary Ledger",
      desc: "Portions and nutritional impact recorded on open public community dashboard.",
      icon: TrendingUp,
    },
  ]

  const auditManifestEntries = [
    {
      label: "Verified Quantity",
      value: "100 Cooked Meals / 35 kg",
      detail: "Weighed at donor loading dock (Hotel Daspalla Grand)",
      icon: Scale,
    },
    {
      label: "Handover Timestamp",
      value: "Today • 1:15 PM IST",
      detail: "Signed electronically by courier in Visakhapatnam",
      icon: Clock,
    },
    {
      label: "GPS-Logged Delivery Point",
      value: "MVP Colony, Sector 3, Vizag",
      detail: "Geofenced drop-off confirmation (17.7412° N, 83.3341° E)",
      icon: MapPin,
    },
    {
      label: "Beneficiary Handover",
      value: "80 Residents Nourished",
      detail: "Served directly by Sneha Sandhya Home elder shelter staff",
      icon: Users,
    },
  ]

  return (
    <section id="transparency" className="relative py-20 lg:py-28 border-t border-border/70 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={sectionEntranceVariants}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="size-3.5" />
            <span>Distribution Transparency Center</span>
          </div>

          <SectionHeading className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground text-balance">
            Impact shouldn&apos;t end with &apos;donated.&apos;
          </SectionHeading>

          <EditorialLead className="mt-4 text-muted-foreground text-pretty">
            Successful food rescue does not conclude when a courier picks up surplus food.
            FoodConnect establishes a closed-loop verification record from donor kitchen to
            beneficiary plate, ensuring complete accountability before distributions roll into public impact totals.
          </EditorialLead>
        </motion.div>

        {/* 4-Stage Lifecycle: DONATED -> COLLECTED -> DISTRIBUTED -> VERIFIED */}
        <div className="mt-14">
          <div className="text-center mb-6">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              4-Stage Physical Custody &amp; Verification Lifecycle
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: "01",
                name: "DONATED",
                sub: "Commercial Surplus Logged",
                desc: "Donor registers surplus food type, prepared timestamp, and hygiene declaration.",
                icon: Scale,
              },
              {
                step: "02",
                name: "COLLECTED",
                sub: "In-Transit Custody",
                desc: "Volunteer or partner courier accepts custody and verifies container temperature.",
                icon: Truck,
              },
              {
                step: "03",
                name: "DISTRIBUTED",
                sub: "Community Meal Service",
                desc: "Accredited NGO kitchen receives food and serves dignified meals to residents.",
                icon: HeartHandshake,
              },
              {
                step: "04",
                name: "VERIFIED",
                sub: "Admin & Ledger Audit",
                desc: "Platform operations audits photographic evidence before approving for public transparency.",
                icon: CheckCircle2,
              },
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.step}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: index * 0.08 }}
                  className="rounded-xl border border-border/80 bg-card p-5 shadow-2xs flex flex-col justify-between hover:border-primary/40 transition-colors group"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                        Stage {item.step}
                      </span>
                      <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Icon className="size-4" />
                      </div>
                    </div>

                    <h3 className="mt-3 text-base font-extrabold text-foreground">
                      {item.name}
                    </h3>
                    <span className="inline-block text-xs font-semibold text-primary mt-0.5">
                      {item.sub}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Clean Audit-Style Record Visual */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-12 mx-auto max-w-4xl"
        >
          <Card variant="elevated" className="overflow-hidden border-border/90 shadow-sm">
            {/* Header Ribbon */}
            <div className="bg-primary/5 border-b border-border/80 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="size-5 text-primary" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      FoodConnect Verification Manifest #FC-VIZAG-8924
                    </span>
                    <span className="rounded bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                      VERIFIED
                    </span>
                  </div>
                  <span className="block text-[11px] text-muted-foreground mt-0.5">
                    Immutable verification trail • Visakhapatnam Coastal Pilot
                  </span>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs font-semibold text-foreground border border-border shadow-2xs">
                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Chain Completed</span>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* 4 Manifest Metadata Blocks */}
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {auditManifestEntries.map((entry) => {
                    const Icon = entry.icon
                    return (
                      <div
                        key={entry.label}
                        className="rounded-xl border border-border/60 bg-muted/30 p-3.5 flex items-start gap-3"
                      >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background text-primary border border-border/70 shadow-2xs">
                          <Icon className="size-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {entry.label}
                          </span>
                          <span className="text-xs font-extrabold text-foreground mt-0.5 numeral-tabular">
                            {entry.value}
                          </span>
                          <span className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                            {entry.detail}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Digital Verification Proof Photo */}
                <div className="lg:col-span-4 flex flex-col rounded-xl border border-border/80 bg-muted/40 p-3.5">
                  <div className="relative aspect-[16/11] w-full overflow-hidden rounded-lg bg-muted border border-border/60 shadow-2xs">
                    <Image
                      src={FOODCONNECT_IMAGES.workflow.verificationPhoto.src}
                      alt={FOODCONNECT_IMAGES.workflow.verificationPhoto.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 260px"
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2 rounded-md bg-black/80 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-xs flex items-center gap-1.5">
                      <Camera className="size-3 text-emerald-400" />
                      <span>GPS Timestamp Tagged</span>
                    </div>
                  </div>
                  <span className="mt-2 text-[11px] text-muted-foreground text-center sm:text-left leading-tight">
                    On-site delivery photo logged by recipient coordinator
                  </span>
                </div>
              </div>

              {/* Attribution & Prototype Disclaimer */}
              <div className="mt-6 rounded-xl bg-muted/50 p-4 border border-border/70 flex items-start gap-3 text-xs text-muted-foreground leading-relaxed">
                <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground font-semibold">
                    Prototype Verification Architecture:
                  </strong>{" "}
                  This record simulates FoodConnect&apos;s digital chain of custody. Real-world
                  handover relies on partner NGOs in Visakhapatnam who manage community kitchens and
                  distribution with local dignity.
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
