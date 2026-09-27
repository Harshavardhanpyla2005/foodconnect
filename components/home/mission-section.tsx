"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import {
  Building2,
  Package,
  Layers,
  HeartHandshake,
  Users,
  ArrowRight,
  ArrowDown,
  Sparkles,
  ShieldCheck,
} from "lucide-react"
import {
  SectionHeading,
  Subheading,
  EditorialLead,
  EditorialQuote,
} from "@/components/ui/typography"
import { sectionEntranceVariants } from "@/lib/motion"

export function MissionSection() {
  const shouldReduceMotion = useReducedMotion()

  const flowNodes = [
    {
      step: "01",
      title: "Surplus Food Donors",
      subtitle: "Banquets, Hotels, Caterers",
      description: "Log wholesome prepared meals & fresh produce with verified safe consumption windows.",
      icon: Building2,
      accent: "border-border/90 bg-card hover:border-primary/40",
      pill: "Surplus Logged",
    },
    {
      step: "02",
      title: "Real Food Need",
      subtitle: "Verified Shelters & Kitchens",
      description: "Grassroots organizations broadcast genuine community hunger needs with dietary preferences.",
      icon: Package,
      accent: "border-border/90 bg-card hover:border-primary/40",
      pill: "Active Demand",
    },
    {
      step: "03",
      title: "FoodConnect Core",
      subtitle: "Haversine & Safety Routing",
      description: "Algorithms evaluate great-circle distance, shelf life, and portion capacities in real time.",
      icon: Layers,
      highlight: true,
      accent: "border-primary/50 bg-primary/5 dark:bg-primary/10 shadow-sm ring-1 ring-primary/20",
      pill: "Smart Matching",
    },
    {
      step: "04",
      title: "Collection & Handover",
      subtitle: "Volunteer Couriers & NGO Vans",
      description: "Insulated food carriers maintain safe temperatures during rapid city transit across Vizag.",
      icon: HeartHandshake,
      accent: "border-border/90 bg-card hover:border-primary/40",
      pill: "Chain of Custody",
    },
    {
      step: "05",
      title: "People Nourished",
      subtitle: "Verified Impact Records",
      description: "Direct community distribution with photographic audit trails and portion accountability.",
      icon: Users,
      accent: "border-border/90 bg-card hover:border-primary/40",
      pill: "Zero Landfill Waste",
    },
  ]

  return (
    <section id="about" className="py-16 md:py-24 border-t border-border/70 bg-card/30 relative">
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
            <span>The FoodConnect Core Model</span>
          </div>
          <SectionHeading className="text-2xl sm:text-3xl lg:text-4xl text-foreground text-balance font-bold">
            Good food should nourish people, never landfills.
          </SectionHeading>
          <EditorialLead className="mt-4 mx-auto text-center text-muted-foreground">
            In Visakhapatnam alone, substantial quantities of freshly prepared banquet and commercial
            food are wasted simply because donors lack a rapid, trusted link to community shelters.
            FoodConnect bridges this divide with verified matching and transparent handover.
          </EditorialLead>
        </motion.div>

        {/* Visual Relationship Flow */}
        <div className="mt-14">
          {/* Desktop Connected Flow */}
          <div className="hidden lg:grid lg:grid-cols-5 gap-3.5 items-stretch relative">
            {flowNodes.map((node, index) => {
              const Icon = node.icon
              return (
                <div key={node.step} className="flex items-center gap-2 relative">
                  <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : index * 0.1 }}
                    className={`flex flex-col justify-between h-full w-full rounded-2xl border p-4.5 transition-all surface-elevated ${
                      node.accent
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[0.68rem] font-bold tracking-wider text-muted-foreground uppercase">
                          Stage {node.step}
                        </span>
                        <div
                          className={`flex size-8 items-center justify-center rounded-lg ${
                            node.highlight
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : "bg-background text-foreground/80 border border-border/80"
                          }`}
                        >
                          <Icon className="size-4" aria-hidden="true" />
                        </div>
                      </div>

                      <Subheading className="mt-3 text-base text-foreground font-bold">
                        {node.title}
                      </Subheading>
                      <span className="text-[0.7rem] font-semibold text-primary block mt-0.5">
                        {node.subtitle}
                      </span>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                        {node.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-border/70 flex items-center justify-between">
                      <span className="text-[0.65rem] font-bold uppercase tracking-wider text-foreground/75">
                        {node.pill}
                      </span>
                      {node.highlight && (
                        <ShieldCheck className="size-3.5 text-primary" />
                      )}
                    </div>
                  </motion.div>

                  {index < flowNodes.length - 1 && (
                    <div
                      className="shrink-0 text-muted-foreground/50 select-none"
                      aria-hidden="true"
                    >
                      <ArrowRight className="size-4" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Mobile & Tablet Vertical Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-3.5">
            {flowNodes.map((node, index) => {
              const Icon = node.icon
              return (
                <div key={node.step} className="flex flex-col">
                  <div
                    className={`flex flex-col justify-between rounded-xl border p-4.5 surface-elevated ${node.accent}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground uppercase">
                        Stage {node.step} • {node.pill}
                      </span>
                      <div
                        className={`flex size-8 items-center justify-center rounded-lg ${
                          node.highlight
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-foreground/80 border border-border/80"
                        }`}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                      </div>
                    </div>
                    <Subheading className="mt-3 text-base text-foreground font-bold">
                      {node.title}
                    </Subheading>
                    <span className="text-xs font-semibold text-primary block mt-0.5">
                      {node.subtitle}
                    </span>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                      {node.description}
                    </p>
                  </div>
                  {index < flowNodes.length - 1 && (
                    <div className="py-1.5 flex justify-center text-muted-foreground/50 sm:hidden">
                      <ArrowDown className="size-4" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Human Storytelling Editorial Quote */}
        <div className="mt-14 max-w-4xl mx-auto rounded-2xl border border-border/80 bg-card p-6 sm:p-8 surface-elevated">
          <EditorialQuote
            quote="When wholesome banquet food arrives warm at 8:30 PM, sixty elderly residents have a nourishing dinner without our shelter having to scramble for funds or cook late into the night."
            attribution="Sister Philomena"
            role="Sneha Sandhya Senior Care Home, Visakhapatnam (Demo Field Partner)"
          />
        </div>
      </div>
    </section>
  )
}

