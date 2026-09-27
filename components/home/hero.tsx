"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  HeartHandshake,
  Utensils,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DisplayHeading,
  EditorialLead,
  MetadataText,
} from "@/components/ui/typography"
import { StatusBadge } from "@/components/ui/status-badge"
import { editorialRevealVariants } from "@/lib/motion"
import { FOODCONNECT_IMAGES } from "@/lib/constants/images"

export function Hero() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24">
      {/* Subtle organic background accent tint - restrained, warm linen and botanical undertones */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-full max-w-7xl -translate-x-1/2 opacity-35 blur-3xl"
        aria-hidden="true"
      >
        <div className="mx-auto h-full w-3/4 rounded-full bg-gradient-to-r from-emerald-100 via-amber-50 to-orange-100 dark:from-emerald-950/20 dark:via-background dark:to-amber-950/10" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Editorial Headline & Value Proposition */}
          <div className="flex flex-col items-start lg:col-span-7">
            {/* Vizag Pilot Beacon Pill */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary shadow-xs"
              aria-label="FoodConnect Rescue Process"
            >
              <span className="relative flex size-2 items-center justify-center">
                <span className="absolute inline-flex size-full rounded-full bg-emerald-500 opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-600" />
              </span>
              <span className="font-semibold text-foreground/90">
                Visakhapatnam Pilot:
              </span>
              <span className="text-muted-foreground">
                Surplus Food &rarr; Real Community Need
              </span>
            </motion.div>

            {/* Editorial Display Heading */}
            <motion.div
              initial={shouldReduceMotion ? false : "hidden"}
              animate="visible"
              variants={shouldReduceMotion ? undefined : editorialRevealVariants}
            >
              <DisplayHeading className="text-balance text-left text-foreground tracking-tight">
                Good food should reach{" "}
                <span className="text-primary decoration-[var(--brand-terracotta)] underline decoration-2 underline-offset-8">
                  people
                </span>
                , not landfills.
              </DisplayHeading>
            </motion.div>

            {/* Editorial Lead Copy */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <EditorialLead className="mt-6 text-foreground/85">
                FoodConnect coordinates wholesome surplus food from banquet halls, caterers,
                and restaurants directly to verified grassroots NGOs across Visakhapatnam—safely,
                transparently, and before expiry.
              </EditorialLead>
            </motion.div>

            {/* Tactical Call to Actions */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.25 }}
              className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center"
            >
              <Link href="/donate" prefetch={true}>
                <Button
                  size="lg"
                  className="gap-2 px-6 shadow-sm text-base tap-tactile"
                >
                  <span>Donate Surplus Food</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </Link>

              <Link href="#how-it-works">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 px-5 text-base border-border hover:bg-muted tap-tactile"
                >
                  <span>See How It Works</span>
                </Button>
              </Link>
            </motion.div>

            {/* Trust Assurance Marks */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mt-10 flex flex-wrap items-center gap-6 border-t border-border/80 pt-6 text-xs text-muted-foreground"
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
                <span className="font-medium text-foreground/85">
                  Verified Local Recipient NGOs
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                <span className="font-medium text-foreground/85">
                  Audited Chain of Custody
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <HeartHandshake className="size-4 text-[var(--brand-terracotta)]" aria-hidden="true" />
                <span className="font-medium text-foreground/85">
                  Zero Direct Food Distribution by FoodConnect
                </span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Layered Editorial Food & Community Composition */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="relative mx-auto max-w-md"
            >
              {/* Main Editorial Photo Frame */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/90 surface-elevated bg-card">
                <Image
                  src={FOODCONNECT_IMAGES.hero.foodRescue.src}
                  alt={FOODCONNECT_IMAGES.hero.foodRescue.alt}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 420px"
                  className="object-cover object-center"
                />

                {/* Subtle vignette overlay for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/35 pointer-events-none" />

                {/* Top Floating Badge (Restrained overlay, high opacity) */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 rounded-lg surface-floating-overlay px-2.5 py-1 text-xs font-semibold text-foreground shadow-xs">
                    <span className="size-2 rounded-full bg-emerald-600 animate-pulse" />
                    Vizag Pilot • Live Demo Flow
                  </span>
                  <StatusBadge status="Distributed" size="sm" />
                </div>

                {/* Bottom Photo Caption Bar */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 rounded-xl surface-floating-overlay p-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <MapPin className="size-4" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-foreground">
                          Sneha Sandhya Home
                        </span>
                        <MetadataText className="text-[0.7rem]">
                          MVP Colony • Visakhapatnam
                        </MetadataText>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[0.7rem] text-primary font-bold">
                      <Clock className="size-3 text-primary" />
                      <span>100 Meals Saved</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Offset Floating Metadata Pill: Smart Match Indicator */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="hidden sm:flex absolute -top-4 -right-4 rounded-xl surface-floating-overlay p-2.5 shadow-md items-center gap-2 border border-border/80"
              >
                <div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  <Sparkles className="size-3.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                    Smart Match
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    94% Compatibility • 3.2 km
                  </span>
                </div>
              </motion.div>

              {/* Offset Floating Metadata Pill: Verified Recipient */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="hidden sm:flex absolute -bottom-5 -left-4 rounded-xl surface-floating-overlay p-2.5 shadow-md items-center gap-2 border border-border/80"
              >
                <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Utensils className="size-3.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                    Verified Recipient
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    Elder Care Community Kitchen
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

