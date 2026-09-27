"use client"

import * as React from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import { ArrowRight, Utensils, HeartHandshake, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  SectionHeading,
  EditorialLead,
} from "@/components/ui/typography"
import { sectionEntranceVariants } from "@/lib/motion"

export function FinalCTA() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section className="py-20 lg:py-28 border-t border-border/80 relative overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={sectionEntranceVariants}
          className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-amber-500/10 p-8 sm:p-14 md:p-20 text-center shadow-sm"
        >
          {/* Subtle decorative glow */}
          <div
            className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-primary/10 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 -right-24 size-96 rounded-full bg-amber-500/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-background/80 backdrop-blur-xs px-3.5 py-1 text-xs font-semibold text-primary mb-4 shadow-2xs">
              <HeartHandshake className="size-3.5" />
              <span>Visakhapatnam Food Rescue Network</span>
            </div>

            <SectionHeading className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground text-balance">
              Have surplus food?
              <br />
              Help it reach someone who needs it.
            </SectionHeading>

            <EditorialLead className="mt-5 text-muted-foreground max-w-2xl mx-auto text-pretty">
              Whether you manage a hotel banquet, catering kitchen, bakery, or community event,
              safe surplus food belongs on plates, not in landfills. Pair with verified local
              NGOs in minutes.
            </EditorialLead>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href="/donate" prefetch={true} />}
                className="w-full sm:w-auto sm:min-w-[200px] gap-2 px-8 py-3 text-base shadow-xs tap-tactile"
              >
                <Utensils className="size-4" aria-hidden="true" />
                <span>Donate Food</span>
                <ArrowRight className="size-4 ml-0.5" aria-hidden="true" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                nativeButton={false}
                render={<Link href="/food-needs" prefetch={true} />}
                className="w-full sm:w-auto sm:min-w-[200px] gap-2 px-7 py-3 text-base bg-background/90 hover:bg-background border-border shadow-2xs tap-tactile"
              >
                <span>Explore Food Needs</span>
              </Button>
            </div>

            {/* Micro reassurance trust markers */}
            <div className="mt-10 pt-8 border-t border-border/60 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary shrink-0" />
                <span>Verified Registered NGOs</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary shrink-0" />
                <span>Safe Consumption Protocols Logged</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary shrink-0" />
                <span>100% Free Humanitarian Platform</span>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
