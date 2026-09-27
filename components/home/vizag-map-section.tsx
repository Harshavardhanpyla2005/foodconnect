"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"
import { ArrowRight, MapPin, Compass, Waves } from "lucide-react"
import { VizagMap } from "@/components/maps/VizagMap"
import { Button } from "@/components/ui/button"
import {
  SectionHeading,
  EditorialLead,
} from "@/components/ui/typography"
import { sectionEntranceVariants } from "@/lib/motion"
import { FOODCONNECT_IMAGES } from "@/lib/constants/images"
import { MapLocation } from "@/lib/types/map"

interface VizagMapSectionProps {
  locations?: MapLocation[]
}

export function VizagMapSection({ locations }: VizagMapSectionProps) {
  const shouldReduceMotion = useReducedMotion()

  const neighborhoods = [
    { name: "Beach Road Corridor", desc: "Hospitality & banquet donors", count: "8 active spots" },
    { name: "Siripuram & Waltair", desc: "Bakery guilds & cafes", count: "12 partners" },
    { name: "MVP Colony", desc: "Elder care shelters & community pantries", count: "6 verified NGOs" },
    { name: "Jagadamba Center", desc: "Commercial kitchens & restaurants", count: "9 donors" },
    { name: "Gajuwaka Industrial", desc: "Large institutional caterers", count: "5 depots" },
  ]

  return (
    <section className="py-20 lg:py-28 bg-card/40 border-y border-border/70 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Coastal Context Header Banner */}
        <div className="mb-12 relative rounded-2xl overflow-hidden border border-border/80 shadow-xs">
          <div className="relative aspect-[21/6] sm:aspect-[21/5] w-full bg-muted">
            <Image
              src={FOODCONNECT_IMAGES.vizag.coastalCity.src}
              alt={FOODCONNECT_IMAGES.vizag.coastalCity.alt}
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-transparent" />

            <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-center max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 backdrop-blur-xs px-3 py-1 text-xs font-semibold text-primary w-fit">
                <Waves className="size-3.5" />
                <span>Starting in Visakhapatnam</span>
              </div>

              <p className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                Connecting surplus along the Eastern Seaboard.
              </p>

              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                From beachside hotels to bustling university colonies, FoodConnect is building
                a verified neighborhood network tailored to Visakhapatnam&apos;s unique geography.
              </p>

              <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-amber-900/90 dark:text-amber-300/90">
                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Prototype Demonstration Corridors — Non-Live Data Representation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <motion.div
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={sectionEntranceVariants}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-3">
            <Compass className="size-3.5" />
            <span>Pilot Territory Map</span>
          </div>

          <SectionHeading className="text-3xl sm:text-4xl font-extrabold text-foreground text-balance">
            Food needs across Vizag neighborhoods
          </SectionHeading>

          <EditorialLead className="mt-3 text-muted-foreground text-pretty">
            Visualizing verified donor lots, urgent community needs, and accredited NGOs
            across the Visakhapatnam metropolitan area.
          </EditorialLead>
        </motion.div>

        {/* Neighborhood Quick Ribbons */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {neighborhoods.map((zone) => (
            <div
              key={zone.name}
              className="rounded-xl border border-border/80 bg-background p-3.5 text-center shadow-2xs hover:border-primary/40 transition-colors"
            >
              <span className="text-xs font-bold text-foreground block truncate">
                {zone.name}
              </span>
              <span className="text-[11px] text-primary font-semibold block mt-0.5">
                {zone.count}
              </span>
              <span className="text-[10px] text-muted-foreground block mt-0.5 truncate">
                {zone.desc}
              </span>
            </div>
          ))}
        </div>

        {/* Dynamic Map Component */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8"
        >
          <VizagMap height="h-[520px]" locations={locations} />
        </motion.div>

        {/* Action Callout */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-border/90 bg-card p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 shadow-2xs">
              <MapPin className="size-5.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Explore real community demand in your neighborhood
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review active needs in Siripuram, MVP Colony, Jagadamba, Gajuwaka, and surrounding zones.
              </p>
            </div>
          </div>

          <Button
            nativeButton={false}
            render={<Link href="/food-needs" prefetch={true} />}
            className="w-full sm:w-auto gap-2 tap-tactile"
          >
            <span>Explore Food Needs</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
