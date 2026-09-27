"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"
import {
  Users,
  Clock,
  Utensils,
  ArrowRight,
  AlertTriangle,
} from "lucide-react"
import {
  SectionHeading,
  BodyText,
  Subheading,
} from "@/components/ui/typography"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { type FoodConnectStatus } from "@/lib/constants/status"
import { sectionEntranceVariants, subtleHoverTap } from "@/lib/motion"
import { FOODCONNECT_IMAGES, FoodConnectImage } from "@/lib/constants/images"

interface DemoNeed {
  id: string
  ngoName: string
  category: string
  location: string
  peopleCount: number
  quantity: string
  foodType: string
  urgency: "Immediate" | "High" | "Flexible"
  requiredBy: string
  status: FoodConnectStatus
  image: FoodConnectImage
}

export function ActiveNeedsPreview() {
  const shouldReduceMotion = useReducedMotion()

  const demoNeeds: DemoNeed[] = [
    {
      id: "need-vizag-01",
      ngoName: "Sneha Sandhya Old Age Home",
      category: "Elder Care & Senior Living",
      location: "MVP Colony • Visakhapatnam",
      peopleCount: 80,
      quantity: "80 warm vegetarian meal portions",
      foodType: "Cooked Meals (Soft Rice, Dal & Veggies)",
      urgency: "Immediate",
      requiredBy: "Today, by 1:30 PM",
      status: "Active Need",
      image: FOODCONNECT_IMAGES.community.elderlyCare,
    },
    {
      id: "need-vizag-02",
      ngoName: "Prema Samajam Care Center",
      category: "Destitute Care & Patient Shelter",
      location: "Daba Gardens • Visakhapatnam",
      peopleCount: 120,
      quantity: "120 dinner meal boxes",
      foodType: "Balanced Meals (Rice, Sambar, Sabzi)",
      urgency: "Immediate",
      requiredBy: "Today, by 7:30 PM",
      status: "Active Need",
      image: FOODCONNECT_IMAGES.food.packedMeals,
    },
    {
      id: "need-vizag-03",
      ngoName: "Ashray Community Kitchen",
      category: "Informal Settlement Nutrition",
      location: "Gajuwaka Industrial Belt • Visakhapatnam",
      peopleCount: 150,
      quantity: "60 kg raw dry ration / pulses",
      foodType: "Dry Rations (Rice, Toor Dal, Atta)",
      urgency: "High",
      requiredBy: "Tomorrow, by 11:00 AM",
      status: "Partially Fulfilled",
      image: FOODCONNECT_IMAGES.food.freshProduce,
    },
  ]

  return (
    <section id="active-needs" className="py-16 md:py-24 border-t border-border/70 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <motion.div
            initial={shouldReduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={sectionEntranceVariants}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:text-amber-300 border border-amber-500/20 mb-3">
              <span className="size-1.5 rounded-full bg-amber-600 animate-pulse" />
              Verified Community Demand in Vizag
            </div>
            <SectionHeading className="text-2xl sm:text-3xl lg:text-4xl text-foreground text-balance">
              Food is needed here.
            </SectionHeading>
            <BodyText size="default" className="mt-3 text-muted-foreground text-pretty">
              Verified NGOs in Visakhapatnam publish specific, time-sensitive food requirements
              for the communities they serve. Donors can claim and fulfill active
              needs directly.
            </BodyText>
          </motion.div>

          {/* Demo Notice Disclaimer Tag */}
          <div className="flex items-center gap-1.5 self-start md:self-end rounded-md bg-muted px-2.5 py-1.5 text-xs text-muted-foreground border border-border/80">
            <AlertTriangle className="size-3.5 text-amber-600" aria-hidden="true" />
            <span>Demo data — illustrative Vizag active requests</span>
          </div>
        </div>

        {/* 3 Representative Demo Cards */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {demoNeeds.map((need, idx) => (
            <motion.div
              key={need.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.1 }}
              whileHover={shouldReduceMotion ? undefined : subtleHoverTap.hover}
              className="flex flex-col"
            >
              <Card className="flex flex-col justify-between h-full border-border/80 bg-card hover:border-primary/50 transition-all shadow-xs overflow-hidden">
                {/* Visual Context Thumbnail */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted border-b border-border/60">
                  <Image
                    src={need.image.src}
                    alt={need.image.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 360px"
                    className="object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <StatusBadge status={need.status} size="sm" showDot />
                  </div>
                  <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-[0.65rem] font-medium text-white backdrop-blur-xs">
                    {need.location}
                  </div>
                </div>

                <CardContent className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    {/* Category */}
                    <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
                      {need.category}
                    </span>

                    {/* NGO Name */}
                    <Subheading className="mt-1.5 text-base font-semibold text-foreground leading-snug">
                      {need.ngoName}
                    </Subheading>

                    {/* Key Attributes Box */}
                    <div className="mt-4 rounded-lg border border-border/60 bg-muted/40 p-3 flex flex-col gap-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Users className="size-3.5 text-primary" /> People needing food:
                        </span>
                        <span className="font-semibold text-foreground tabular-nums">
                          {need.peopleCount} people
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Utensils className="size-3.5 text-primary" /> Quantity & type:
                        </span>
                        <span className="font-medium text-foreground text-right truncate max-w-[150px]">
                          {need.quantity}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-border/40">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Clock className="size-3.5 text-[var(--brand-terracotta)]" /> Required by:
                        </span>
                        <span className="font-semibold text-foreground">
                          {need.requiredBy}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Row */}
                  <div className="mt-5 pt-3 border-t border-border/70 flex items-center justify-between">
                    <span className="text-[0.7rem] font-medium text-muted-foreground">
                      Urgency:{" "}
                      <strong className={
                        need.urgency === "Immediate"
                          ? "text-destructive font-bold"
                          : need.urgency === "High"
                          ? "text-amber-700 dark:text-amber-400 font-bold"
                          : "text-foreground font-semibold"
                      }>
                        {need.urgency}
                      </strong>
                    </span>

                    <Button
                      variant="outline"
                      size="xs"
                      nativeButton={false}
                      render={<Link href="/food-needs" prefetch={true} />}
                      className="gap-1 text-xs"
                    >
                      <span>View Details</span>
                      <ArrowRight className="size-3" aria-hidden="true" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
