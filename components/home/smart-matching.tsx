"use client"

import * as React from "react"
import { motion, useReducedMotion, useInView } from "motion/react"
import { animate } from "animejs"
import {
  Zap,
  MapPin,
  Clock,
  Sparkles,
  ThermometerSnowflake,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Gauge,
  Utensils,
  Layers,
  Flame,
} from "lucide-react"
import {
  SectionHeading,
  Subheading,
  EditorialLead,
} from "@/components/ui/typography"
import { Card, CardContent } from "@/components/ui/card"
import { sectionEntranceVariants, cardElevateHover } from "@/lib/motion"
import { cn } from "@/lib/utils"

type FoodType = "VEG" | "NON_VEG"
type QuantityOption = 50 | 100 | 150
type UrgencyOption = "IMMEDIATE" | "HIGH" | "NORMAL"

interface MatchingState {
  foodType: FoodType
  quantity: QuantityOption
  urgency: UrgencyOption
}

export function SmartMatching() {
  const shouldReduceMotion = useReducedMotion()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: "-80px" })

  // Interactive Simulator Controls
  const [params, setParams] = React.useState<MatchingState>({
    foodType: "VEG",
    quantity: 100,
    urgency: "HIGH",
  })

  // Dynamic calculations based on explainable matching logic adhering to Section 11:
  // Distance 35%, Dietary 25%, Urgency 20%, Capacity 10%, Freshness Buffer 10%
  const matchDetails = React.useMemo(() => {
    // Baseline NGO Profile: Sneha Sandhya Home (Elder Care, MVP Colony, 3.2km from Beach Rd)
    const distanceKm = 3.2

    // 1. Distance Proximity (35%)
    const distanceScore = 96
    const distanceText = `${distanceKm} km away`

    // 2. Dietary Compatibility (25%)
    const isVegMatch = params.foodType === "VEG"
    const dietaryScore = isVegMatch ? 100 : 15
    const dietaryText = isVegMatch
      ? "Vegetarian cooked food accepted"
      : "Non-vegetarian lot rejected by pure-veg facility"

    // 3. Urgency (20%)
    let urgencyScore = 92
    let urgencyText = "High-priority need"
    if (params.urgency === "IMMEDIATE") {
      urgencyScore = 98
      urgencyText = "Immediate urgent pickup needed"
    } else if (params.urgency === "NORMAL") {
      urgencyScore = 85
      urgencyText = "Standard evening schedule"
    }

    // 4. NGO Intake Capacity (10%)
    let quantityScore = 94
    let quantityText = "80 meals currently needed"
    if (params.quantity === 50) {
      quantityScore = 70
      quantityText = "50 meals fulfills 62% of 80 need"
    } else if (params.quantity === 150) {
      quantityScore = 88
      quantityText = "150 meals (80 to shelter + 70 overflow)"
    }

    // 5. Freshness & Transit Buffer (10%)
    const windowScore = params.urgency === "IMMEDIATE" ? 96 : params.urgency === "HIGH" ? 92 : 88
    const windowText = "Required before 7 PM (3.5h buffer)"

    // Composite 5-Factor Weighted Score (Section 11 standard)
    let compositeScore = Math.round(
      distanceScore * 0.35 +
        dietaryScore * 0.25 +
        urgencyScore * 0.20 +
        quantityScore * 0.10 +
        windowScore * 0.10
    )

    if (!isVegMatch) {
      compositeScore = Math.min(compositeScore, 42)
    }

    const factors = [
      {
        id: "distance",
        label: "Distance Proximity",
        weight: "35%",
        score: distanceScore,
        value: distanceText,
        sub: "3.2 km corridor (11 min via Beach Road)",
        icon: MapPin,
        passed: true,
      },
      {
        id: "dietary",
        label: "Dietary Compatibility",
        weight: "25%",
        score: dietaryScore,
        value: dietaryText,
        sub: isVegMatch ? "Pure vegetarian shelter policy verified" : "Policy requires strictly vegetarian meals",
        icon: Utensils,
        passed: isVegMatch,
      },
      {
        id: "urgency",
        label: "Urgency",
        weight: "20%",
        score: urgencyScore,
        value: urgencyText,
        sub: "Pickup before evening meal service",
        icon: Clock,
        passed: true,
      },
      {
        id: "capacity",
        label: "NGO Intake Capacity",
        weight: "10%",
        score: quantityScore,
        value: quantityText,
        sub: "Insulated food warmers available on-site",
        icon: Gauge,
        passed: quantityScore >= 70,
      },
      {
        id: "freshness",
        label: "Freshness & Transit Buffer",
        weight: "10%",
        score: windowScore,
        value: windowText,
        sub: "Safe consumption deadline verified by protocol",
        icon: ThermometerSnowflake,
        passed: true,
      },
    ]

    const explanations = isVegMatch
      ? [
          { text: "3.2 km away", passed: true },
          { text: "Vegetarian cooked food accepted", passed: true },
          { text: "80 meals currently needed", passed: true },
          { text: "High-priority need", passed: true },
          { text: "Required before 7 PM (Sufficient freshness & transit buffer)", passed: true },
        ]
      : [
          { text: "3.2 km away is within transit reach", passed: true },
          {
            text: "Dietary Mismatch: Shelter policy requires strictly vegetarian meals",
            passed: false,
          },
          { text: "Alternative proposal: Auto-routed to youth center with non-veg intake", passed: false },
        ]

    return {
      targetScore: compositeScore,
      factors,
      explanations,
      isCompatible: isVegMatch && compositeScore >= 70,
    }
  }, [params])

  // Anime.js animated score counter
  const [displayScore, setDisplayScore] = React.useState(0)
  const animRef = React.useRef<{ pause?: () => void } | null>(null)
  const currentValRef = React.useRef(0)

  React.useEffect(() => {
    if (shouldReduceMotion || !isInView) return

    const scoreHolder = { val: currentValRef.current }
    animRef.current?.pause?.()

    animRef.current = animate(scoreHolder, {
      val: matchDetails.targetScore,
      duration: 750,
      ease: "outExpo",
      onUpdate: () => {
        currentValRef.current = scoreHolder.val
        setDisplayScore(Math.round(scoreHolder.val))
      },
    })

    return () => {
      animRef.current?.pause?.()
    }
  }, [matchDetails.targetScore, shouldReduceMotion, isInView])

  const effectiveScore = shouldReduceMotion ? matchDetails.targetScore : (displayScore || matchDetails.targetScore)

  return (
    <section
      id="smart-matching"
      ref={containerRef}
      className="relative py-20 lg:py-28 overflow-hidden bg-background"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={sectionEntranceVariants}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
            <Zap className="size-3.5 fill-current" />
            <span>Explainable Matching Engine</span>
          </div>

          <SectionHeading className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground text-balance">
            Good matching requires context, not just proximity.
          </SectionHeading>

          <EditorialLead className="mt-4 text-muted-foreground text-pretty">
            Proximity alone is not enough. Delivering perishable hot food to an organization
            without thermal holding warmers or non-vegetarian food to a strict vegetarian elder shelter
            leads to rejected food and waste. FoodConnect calculates multidimensional compatibility before
            dispatching a single meal.
          </EditorialLead>
        </motion.div>

        {/* Interactive Simulator Bar */}
        <div className="mt-10 mx-auto max-w-4xl rounded-2xl border border-border/80 bg-muted/40 p-4 sm:p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                Interactive Simulator:
              </span>
              <span className="text-[11px] text-muted-foreground hidden md:inline">
                Adjust variables to test engine sensitivity
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Food Type Selector */}
              <div className="flex items-center rounded-lg bg-background p-1 border border-border text-xs">
                <span className="px-2 text-[11px] font-semibold text-muted-foreground">Type:</span>
                <button
                  type="button"
                  onClick={() => setParams((p) => ({ ...p, foodType: "VEG" }))}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-all tap-tactile",
                    params.foodType === "VEG"
                      ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  Vegetarian
                </button>
                <button
                  type="button"
                  onClick={() => setParams((p) => ({ ...p, foodType: "NON_VEG" }))}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-all tap-tactile",
                    params.foodType === "NON_VEG"
                      ? "bg-[var(--brand-terracotta)] text-white font-semibold shadow-2xs"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  Non-Veg
                </button>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center rounded-lg bg-background p-1 border border-border text-xs">
                <span className="px-2 text-[11px] font-semibold text-muted-foreground">Meals:</span>
                {([50, 100, 150] as QuantityOption[]).map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setParams((p) => ({ ...p, quantity: qty }))}
                    className={cn(
                      "rounded-md px-2 py-1 text-xs font-medium transition-all tap-tactile numeral-tabular",
                      params.quantity === qty
                        ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    {qty}
                  </button>
                ))}
              </div>

              {/* Urgency Selector */}
              <div className="flex items-center rounded-lg bg-background p-1 border border-border text-xs">
                <span className="px-2 text-[11px] font-semibold text-muted-foreground">Urgency:</span>
                {(
                  [
                    { key: "IMMEDIATE", label: "Immediate" },
                    { key: "HIGH", label: "High" },
                    { key: "NORMAL", label: "Normal" },
                  ] as const
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setParams((p) => ({ ...p, urgency: key }))}
                    className={cn(
                      "rounded-md px-2 py-1 text-xs font-medium transition-all tap-tactile",
                      params.urgency === key
                        ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3-Column Match Architecture Flow */}
        <div className="mt-8 mx-auto max-w-5xl">
          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-11">
            {/* Box 1: DONATION (4 cols) */}
            <motion.div
              variants={cardElevateHover}
              initial="rest"
              whileHover="hover"
              className="lg:col-span-4"
            >
              <Card variant="warm" className="h-full border-border/80 shadow-xs flex flex-col justify-between">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                      01 • Active Surplus Lot
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      Ready for Pickup
                    </span>
                  </div>

                  <Subheading className="mt-4 text-lg font-bold text-foreground">
                    Hotel Daspalla Grand
                  </Subheading>
                  <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-primary shrink-0" />
                    <span>Jagadamba Center, Visakhapatnam</span>
                  </p>

                  <div className="mt-5 space-y-2.5 rounded-xl bg-background/80 p-3.5 border border-border/60 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Layers className="size-3.5 text-muted-foreground" />
                        Available Quantity:
                      </span>
                      <span className="font-extrabold text-foreground numeral-tabular">
                        {params.quantity} Fresh Meals
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Utensils className="size-3.5 text-muted-foreground" />
                        Dietary Profile:
                      </span>
                      <span
                        className={cn(
                          "font-bold px-2 py-0.5 rounded text-[11px]",
                          params.foodType === "VEG"
                            ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                            : "bg-amber-500/10 text-amber-900 dark:text-amber-300"
                        )}
                      >
                        {params.foodType === "VEG" ? "Pure Vegetarian" : "Non-Vegetarian"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Flame className="size-3.5 text-muted-foreground" />
                        Pickup Window:
                      </span>
                      <span className="font-semibold text-[var(--brand-terracotta)]">
                        {params.urgency === "IMMEDIATE"
                          ? "Within 2 Hours"
                          : params.urgency === "HIGH"
                            ? "Within 3.5 Hours"
                            : "Within 6 Hours"}
                      </span>
                    </div>
                  </div>
                </CardContent>

                <div className="px-6 pb-5 pt-0">
                  <div className="rounded-lg bg-muted/60 px-3 py-2 text-[11px] text-muted-foreground border border-border/50">
                    Logged with verified temperature &amp; preparation timestamp
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Box 2: MATCH ENGINE (3 cols) */}
            <div className="lg:col-span-3 flex flex-col justify-center">
              <div
                className={cn(
                  "relative rounded-2xl border-2 p-5 text-center transition-all duration-300 shadow-sm",
                  matchDetails.isCompatible
                    ? "border-primary/40 bg-primary/[0.04]"
                    : "border-amber-500/40 bg-amber-500/[0.04]"
                )}
              >
                {/* Distance Badge */}
                <div className="inline-flex items-center gap-1 rounded-full bg-background px-3 py-1 text-xs font-semibold text-foreground border border-border shadow-2xs mb-3">
                  <MapPin className="size-3 text-primary" />
                  <span>3.2 km distance</span>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-primary text-[11px] font-extrabold uppercase tracking-wider">
                  <Zap className="size-3.5 fill-current" />
                  <span>Smart Match Engine</span>
                </div>

                {/* Animated Score with Anime.js */}
                <div className="my-3">
                  <div className="flex items-baseline justify-center gap-1">
                    <span
                      className={cn(
                        "font-heading text-5xl sm:text-6xl font-black tracking-tight numeral-tabular",
                        matchDetails.isCompatible ? "text-primary" : "text-amber-600 dark:text-amber-400"
                      )}
                    >
                      {effectiveScore}
                    </span>
                    <span className="text-2xl font-bold text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground mt-1">
                    {matchDetails.isCompatible ? "High Compatibility" : "Compatibility Alert"}
                  </p>
                </div>

                {/* Prototype notice */}
                <div className="inline-block rounded bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground border border-border">
                  Live Algorithmic Evaluation
                </div>

                {/* Mini 5-Factor Metric Bars */}
                <div className="mt-4 space-y-2 text-left border-t border-border pt-3">
                  <div className="text-[11px] flex justify-between items-center">
                    <span className="text-muted-foreground">35% Distance Proximity:</span>
                    <span className="font-semibold text-foreground">96%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "96%" }} />
                  </div>

                  <div className="text-[11px] flex justify-between items-center">
                    <span className="text-muted-foreground">25% Dietary Compatibility:</span>
                    <span
                      className={cn(
                        "font-semibold",
                        params.foodType === "VEG" ? "text-primary" : "text-destructive"
                      )}
                    >
                      {params.foodType === "VEG" ? "100%" : "15%"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        params.foodType === "VEG" ? "bg-primary" : "bg-destructive"
                      )}
                      style={{ width: params.foodType === "VEG" ? "100%" : "15%" }}
                    />
                  </div>

                  <div className="text-[11px] flex justify-between items-center">
                    <span className="text-muted-foreground">20% Urgency Alignment:</span>
                    <span className="font-semibold text-foreground">
                      {params.urgency === "IMMEDIATE" ? "98%" : params.urgency === "HIGH" ? "92%" : "85%"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: params.urgency === "IMMEDIATE" ? "98%" : params.urgency === "HIGH" ? "92%" : "85%" }}
                    />
                  </div>

                  <div className="text-[11px] flex justify-between items-center">
                    <span className="text-muted-foreground">10% NGO Intake Capacity:</span>
                    <span className="font-semibold text-foreground">
                      {params.quantity === 100 ? "94%" : params.quantity === 150 ? "88%" : "70%"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: params.quantity === 100 ? "94%" : params.quantity === 150 ? "88%" : "70%" }}
                    />
                  </div>

                  <div className="text-[11px] flex justify-between items-center">
                    <span className="text-muted-foreground">10% Freshness &amp; Transit:</span>
                    <span className="font-semibold text-foreground">92%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "92%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Box 3: NGO NEED (4 cols) */}
            <motion.div
              variants={cardElevateHover}
              initial="rest"
              whileHover="hover"
              className="lg:col-span-4"
            >
              <Card variant="warm" className="h-full border-border/80 shadow-xs flex flex-col justify-between">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                      02 • Verified Community Need
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      Lunch Requirement
                    </span>
                  </div>

                  <Subheading className="mt-4 text-lg font-bold text-foreground">
                    Sneha Sandhya Home
                  </Subheading>
                  <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-primary shrink-0" />
                    <span>MVP Colony, Visakhapatnam</span>
                  </p>

                  <div className="mt-5 space-y-2.5 rounded-xl bg-background/80 p-3.5 border border-border/60 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Gauge className="size-3.5 text-muted-foreground" />
                        Target Need:
                      </span>
                      <span className="font-extrabold text-foreground numeral-tabular">
                        80 Meals Required
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Utensils className="size-3.5 text-muted-foreground" />
                        Dietary Policy:
                      </span>
                      <span className="font-bold text-emerald-800 dark:text-emerald-300">
                        Strictly Vegetarian
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <ThermometerSnowflake className="size-3.5 text-muted-foreground" />
                        Holding Facility:
                      </span>
                      <span className="font-semibold text-foreground">
                        Insulated Food Warmers
                      </span>
                    </div>
                  </div>
                </CardContent>

                <div className="px-6 pb-5 pt-0">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <ShieldCheck className="size-3.5 text-primary shrink-0" />
                    <span>Government Registered NGO • Verified Pantry</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Explicit Match Explanation & 5-Factor Breakdown */}
          <div className="mt-8 rounded-2xl border border-border/90 bg-card p-5 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-4">
              <div>
                <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>Transparent Decision Factors</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    5-Factor Explainable Engine
                  </span>
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Distance (35%) + Dietary (25%) + Urgency (20%) + Intake Capacity (10%) + Freshness (10%) = Deterministic Score
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground font-mono">
                  Calculated Match: {effectiveScore}%
                </span>
              </div>
            </div>

            {/* Why This Match? Explanation Checklist */}
            <div className="mt-4 rounded-xl bg-muted/40 p-4 border border-border/60">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Why this match?
              </span>
              <ul className="space-y-2">
                {matchDetails.explanations.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs">
                    {item.passed ? (
                      <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <span
                      className={cn(
                        "font-medium",
                        item.passed
                          ? "text-foreground"
                          : "text-amber-900 dark:text-amber-300 font-semibold"
                      )}
                    >
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Factor Visual Gauges */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {matchDetails.factors.map((factor, index) => {
                const Icon = factor.icon
                return (
                  <motion.div
                    key={factor.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    className="rounded-xl border border-border/70 bg-background p-3.5 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          {factor.weight}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-black numeral-tabular",
                            factor.score >= 80 ? "text-primary" : "text-amber-600 dark:text-amber-400"
                          )}
                        >
                          {factor.score}%
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-2">
                        <Icon className="size-3.5 text-primary shrink-0" />
                        <span className="text-xs font-bold text-foreground truncate">{factor.label}</span>
                      </div>

                      {/* Visual progress gauge */}
                      <div className="mt-2.5 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            factor.score >= 80 ? "bg-primary" : "bg-amber-500"
                          )}
                          style={{ width: `${Math.min(100, Math.max(8, factor.score))}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-border/40">
                      <p className="text-[11px] font-medium text-foreground">
                        {factor.value}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                        {factor.sub}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
