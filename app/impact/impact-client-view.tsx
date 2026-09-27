"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  UtensilsCrossed,
  PackageCheck,
  Building2,
  Users2,
  Leaf,
  AlertCircle,
  ShieldCheck,
  HeartHandshake,
  CheckCircle2,
  Truck,
  Droplets,
  Coins,
} from "lucide-react"
import { Header } from "@/components/home/header"
import { Footer } from "@/components/home/footer"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "motion/react"
import { AnimatedCounter } from "@/components/ui/motion-primitives"
import {
  PageHeading,
  EditorialLead,
  SectionHeading,
} from "@/components/ui/typography"
import { ImpactData } from "@/app/actions/impact"
import { FOODCONNECT_IMAGES } from "@/lib/constants/images"
import { DynamicImpactMap } from "@/components/maps/DynamicImpactMap"

interface ImpactClientViewProps {
  initialData: ImpactData
}

export function ImpactClientView({ initialData }: ImpactClientViewProps) {
  const metrics = [
    {
      label: "Meals Rescued",
      value: initialData.totalMealsRescued,
      suffix: "+",
      description: "Wholesome food portions redirected from waste to verified meals",
      icon: UtensilsCrossed,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Completed Donations",
      value: initialData.completedDonations,
      suffix: "",
      description: "Surplus donation lots completed & distributed across Vizag",
      icon: PackageCheck,
      color: "text-[var(--brand-terracotta)]",
      bg: "bg-[var(--brand-terracotta)]/10",
    },
    {
      label: "Verified NGOs",
      value: initialData.verifiedNgosCount,
      suffix: "",
      description: "Accredited grassroots shelters and community feeding kitchens",
      icon: Building2,
      color: "text-amber-800 dark:text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "People Reached",
      value: initialData.peopleReached,
      suffix: "+",
      description: "Community individuals served with timely, dignified meals",
      icon: Users2,
      color: "text-teal-800 dark:text-teal-400",
      bg: "bg-teal-500/10",
    },
  ]

  const impactStoryStages = [
    {
      step: "01",
      title: "Rescue & Cold Chain Custody",
      desc: "Commercial kitchens and hotels log untouched edible banquet lots. Dedicated volunteer couriers arrive with insulated thermal warmers, verifying food temperature and sealed container lids before departure.",
      image: FOODCONNECT_IMAGES.workflow.collectionTransit,
      metric: "100% Insulated Custody",
      icon: Truck,
    },
    {
      step: "02",
      title: "Dignified Community Distribution",
      desc: "Accredited local NGO kitchens portion out meals for elder residents, day centers, and care homes in MVP Colony and Siripuram within 3.5 hours of preparation, ensuring zero nutritional degradation.",
      image: FOODCONNECT_IMAGES.community.elderlyDistribution,
      metric: "80+ Meals Served per Batch",
      icon: HeartHandshake,
    },
    {
      step: "03",
      title: "Verified Audit & Environmental Dividend",
      desc: "Every completed handover logs GPS geofenced coordinates, photo delivery receipts, and weight tickets. Food diverted from landfills translates directly to avoided methane and conserved groundwater.",
      image: FOODCONNECT_IMAGES.workflow.verificationPhoto,
      metric: "Closed Audit Trail",
      icon: ShieldCheck,
    },
  ]

  const environmentalMetrics = [
    {
      title: "Landfill Methane Diverted",
      value: `${initialData.landfillMethaneAvoidedKg.toLocaleString()} kg CO₂e`,
      description: "Organic food waste diverted from anaerobic landfill decomposition in Visakhapatnam.",
      icon: Leaf,
    },
    {
      title: "Water Footprint Preserved",
      value: `${initialData.waterFootprintPreservedLiters.toLocaleString()} Liters`,
      description: "Embedded agricultural virtual water preserved from rescued food lots.",
      icon: Droplets,
    },
    {
      title: "Direct Meal Value Equivalent",
      value: `₹ ${initialData.directMealValueInr.toLocaleString("en-IN")}`,
      description: "Nutritional economic value delivered directly to vulnerable community members.",
      icon: Coins,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased">
      <Header />

      <main className="flex-1 py-10 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-6 border-b border-border/80">
            <div>
              <Link
                href="/"
                prefetch={true}
                className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1 mb-2"
              >
                ← Back to Homepage
              </Link>
              <PageHeading className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                Impact &amp; Transparency
              </PageHeading>
              <EditorialLead className="mt-2 text-muted-foreground max-w-2xl text-pretty">
                Measuring real social nutrition and environmental diversion from every verified food handover across Visakhapatnam.
              </EditorialLead>
            </div>

            {/* Clear Live Demo Data Indicator */}
            <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 px-3.5 py-2 text-xs text-amber-950 dark:text-amber-300 border border-amber-500/20 self-start md:self-end">
              <AlertCircle className="size-4 text-amber-700 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Prototype Demo Metrics:</strong> Aggregated from FoodConnect in-memory repository.
              </span>
            </div>
          </div>

          {/* 4 Core Metrics Grid */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((m, idx) => {
              const Icon = m.icon
              return (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 280, damping: 24, delay: idx * 0.08 }}
                  whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                  className="h-full"
                >
                  <Card variant="warm" className="border-border/90 shadow-xs h-full">
                    <CardContent className="p-6 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {m.label}
                          </span>
                          <div
                            className={`flex size-9 items-center justify-center rounded-lg shadow-2xs ${m.bg} ${m.color}`}
                          >
                            <Icon className="size-4.5" />
                          </div>
                        </div>

                        <div className="mt-4">
                          <span className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground numeral-tabular">
                            <AnimatedCounter value={m.value} suffix={m.suffix} duration={1.2} />
                          </span>
                        </div>
                      </div>

                      <p className="mt-4 pt-3.5 border-t border-border/60 text-xs text-muted-foreground leading-relaxed">
                        {m.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Interactive Public Visakhapatnam Impact & Network Map */}
          <div className="mt-16 sm:mt-20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Geographic Footprint • Visakhapatnam Corridor
                </span>
                <SectionHeading className="mt-1 text-2xl sm:text-3xl font-extrabold text-foreground">
                  Live Rescue &amp; Distribution Network Map
                </SectionHeading>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  Explore active donor hubs, hunger-relief centers, and verified distribution zones across Visakhapatnam.
                </p>
              </div>
            </div>

            <DynamicImpactMap
              height="h-[480px]"
              verifiedDistributionsCount={initialData.completedDonations}
              peopleServedCount={initialData.peopleReached}
            />
          </div>

          {/* Elegant Visual: Rescue → Distribution → Verification Story */}
          <div className="mt-16 sm:mt-20">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                The Verified Custody Pipeline
              </span>
              <SectionHeading className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground">
                How every meal travels from surplus to plate
              </SectionHeading>
              <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                FoodConnect coordinates every handoff through three rigorous verification checkpoints.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {impactStoryStages.map((stage, idx) => {
                const Icon = stage.icon
                return (
                  <motion.div
                    key={stage.step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 280, damping: 24, delay: idx * 0.1 }}
                    whileHover={{ y: -6, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                    className="h-full"
                  >
                    <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs flex flex-col justify-between h-full">
                      <div>
                        <div className="relative aspect-[16/10] w-full bg-muted">
                          <Image
                            src={stage.image.src}
                            alt={stage.image.alt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 380px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                          <div className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                            Stage {stage.step}
                          </div>
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                            <span className="font-semibold text-[11px] bg-primary/90 px-2 py-0.5 rounded backdrop-blur-xs">
                              {stage.metric}
                            </span>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="flex items-center gap-2 text-primary text-xs font-bold mb-1">
                            <Icon className="size-4" />
                            <span>{stage.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                            {stage.desc}
                          </p>
                        </div>
                      </div>

                      <div className="p-6 pt-0 border-t border-border/40 mt-auto">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                          Verified via FoodConnect Log
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Environmental & Economic Diversion Section */}
          <div className="mt-16 sm:mt-20 rounded-3xl border border-border/90 bg-card p-6 sm:p-10 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Leaf className="size-4" />
              <span>Ecological &amp; Community Dividend</span>
            </div>

            <SectionHeading className="mt-2 text-2xl sm:text-3xl font-bold text-foreground">
              Beyond Meals: Environmental Stewardship
            </SectionHeading>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              When edible surplus is rescued instead of dumped into landfills, we prevent organic
              methane emission while preserving the agricultural water and energy embedded in every meal.
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {environmentalMetrics.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-border/80 bg-muted/40 p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          {item.title}
                        </span>
                        <div className="size-8 rounded-lg bg-background flex items-center justify-center text-primary shadow-2xs border border-border/60">
                          <Icon className="size-4" />
                        </div>
                      </div>
                      <div className="mt-3 font-heading text-2xl font-extrabold text-foreground numeral-tabular">
                        {item.value}
                      </div>
                    </div>
                    <p className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
