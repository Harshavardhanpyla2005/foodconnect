"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  MapPin,
  Users,
  Clock,
  Utensils,
  AlertCircle,
  Search,
  ArrowRight,
  Flame,
  CheckCircle2,
} from "lucide-react"
import { Header } from "@/components/home/header"
import { Footer } from "@/components/home/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "motion/react"
import {
  PageHeading,
  EditorialLead,
  Subheading,
} from "@/components/ui/typography"
import { VIZAG_AREAS } from "@/lib/constants/vizag-map-data"
import { EnrichedNeedItem } from "@/app/actions/needs"
import { FOODCONNECT_IMAGES } from "@/lib/constants/images"
import { cn } from "@/lib/utils"

function getNeedVisual(foodType: string, category: string) {
  const lowerType = foodType.toLowerCase()
  const lowerCat = category.toLowerCase()
  if (lowerType.includes("cooked") || lowerCat.includes("hot") || lowerCat.includes("banquet")) {
    return FOODCONNECT_IMAGES.food.cookedBuffet
  }
  if (lowerType.includes("produce") || lowerType.includes("grocer") || lowerCat.includes("produce") || lowerCat.includes("vegetable")) {
    return FOODCONNECT_IMAGES.food.freshProduce
  }
  if (lowerType.includes("bake") || lowerCat.includes("bake") || lowerCat.includes("bread")) {
    return FOODCONNECT_IMAGES.food.bakerySurplus
  }
  return FOODCONNECT_IMAGES.food.packedMeals
}

interface FoodNeedsClientViewProps {
  initialNeeds: EnrichedNeedItem[]
}

export function FoodNeedsClientView({ initialNeeds }: FoodNeedsClientViewProps) {
  const [selectedArea, setSelectedArea] = React.useState<string>("All")
  const [selectedType, setSelectedType] = React.useState<string>("All")
  const [selectedUrgency, setSelectedUrgency] = React.useState<string>("All")
  const [searchQuery, setSearchQuery] = React.useState<string>("")

  const filteredNeeds = React.useMemo(() => {
    return initialNeeds.filter((item) => {
      const matchArea = selectedArea === "All" || item.area === selectedArea
      const matchType = selectedType === "All" || item.foodType === selectedType
      const matchUrgency = selectedUrgency === "All" || item.urgency === selectedUrgency
      const matchSearch =
        searchQuery.trim() === "" ||
        item.ngoName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.notes.toLowerCase().includes(searchQuery.toLowerCase())
      return matchArea && matchType && matchUrgency && matchSearch
    })
  }, [initialNeeds, selectedArea, selectedType, selectedUrgency, searchQuery])

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
              <PageHeading className="text-3xl sm:text-4xl lg:text-5xl text-foreground font-extrabold tracking-tight">
                Active Community Food Needs
              </PageHeading>
              <EditorialLead className="mt-2 text-muted-foreground max-w-2xl text-pretty">
                Accredited grassroots NGOs and care homes in Visakhapatnam declare verified,
                time-sensitive meal requirements. Match and fulfill surplus directly where nutrition is urgently needed.
              </EditorialLead>
            </div>

            {/* Clear Demo Notice */}
            <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 px-3.5 py-2 text-xs text-amber-950 dark:text-amber-300 border border-amber-500/20 self-start md:self-end">
              <AlertCircle className="size-4 text-amber-700 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Live Prototype Data:</strong> Visakhapatnam Pilot Network
              </span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mt-8 rounded-2xl border border-border/80 bg-muted/40 p-4 sm:p-5 shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search shelter, area, or food..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 text-xs bg-background"
                />
              </div>

              {/* Area Filter */}
              <div>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="All">All Neighborhoods ({VIZAG_AREAS.length} Areas)</option>
                  {VIZAG_AREAS.filter((a) => a !== "All Vizag Areas").map((areaName) => (
                    <option key={areaName} value={areaName}>
                      {areaName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Food Type */}
              <div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="All">All Food Types</option>
                  <option value="Cooked Meals">Cooked Meals</option>
                  <option value="Fresh Produce">Fresh Produce</option>
                  <option value="Bakery Goods">Bakery Items</option>
                  <option value="Dry Groceries">Dry Rations</option>
                </select>
              </div>

              {/* Urgency */}
              <div>
                <select
                  value={selectedUrgency}
                  onChange={(e) => setSelectedUrgency(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="All">All Urgency Levels</option>
                  <option value="Immediate">High Priority (&lt; 4 hrs)</option>
                  <option value="High">Active (Within 24 hrs)</option>
                  <option value="Flexible">Flexible / Scheduled</option>
                </select>
              </div>
            </div>

            {/* Filter Summary */}
            <div className="mt-3.5 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing <strong>{filteredNeeds.length}</strong> active community meal needs
              </span>
              {(selectedArea !== "All" ||
                selectedType !== "All" ||
                selectedUrgency !== "All" ||
                searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedArea("All")
                    setSelectedType("All")
                    setSelectedUrgency("All")
                    setSearchQuery("")
                  }}
                  className="text-primary hover:underline font-semibold"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>

          {/* Needs Grid */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredNeeds.map((need) => {
                const visual = getNeedVisual(need.foodType, need.category)
                const isHighPriority = need.urgency === "Immediate"
                const isFulfilled = need.rawStatus === "FULFILLED" || need.quantityRemaining === 0
                const progressPct = isFulfilled ? 100 : Math.max(25, Math.min(85, Math.round(((need.peopleCount - (need.quantityRemaining || 20)) / need.peopleCount) * 100)))

                return (
                  <motion.div
                    key={need.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ type: "spring", stiffness: 280, damping: 24 }}
                    whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                    className="h-full"
                  >
                    <Card
                      variant="warm"
                      className="flex flex-col justify-between overflow-hidden border-border/90 bg-card hover:border-primary/50 transition-all shadow-xs h-full"
                    >
                  {/* Visual Header */}
                  <div className="relative h-40 w-full bg-muted">
                    <Image
                      src={visual.src}
                      alt={visual.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                    {/* Urgency Badge */}
                    <div className="absolute top-3 left-3">
                      {isHighPriority ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-600/90 text-white px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-xs shadow-2xs">
                          <Flame className="size-3" />
                          High Priority
                        </span>
                      ) : isFulfilled ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 text-white px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
                          <CheckCircle2 className="size-3" />
                          Fulfilled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/90 text-primary-foreground px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
                          Active Demand
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 font-semibold text-[11px]">
                        {need.category}
                      </span>
                      <span className="text-[11px] text-white/90 font-medium">
                        {need.area}
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-5 flex flex-col justify-between h-full">
                    <div>
                      {/* NGO Name */}
                      <Subheading className="text-base font-bold text-foreground leading-snug">
                        {need.ngoName}
                      </Subheading>

                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3.5 text-primary shrink-0" />
                        <span>{need.area}, Visakhapatnam</span>
                      </div>

                      {/* Fulfillment Progress Meter */}
                      <div className="mt-4 rounded-xl border border-border/60 bg-muted/40 p-3 text-xs space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground font-medium">Fulfillment Status:</span>
                          <span className="font-extrabold text-foreground numeral-tabular">
                            {progressPct}% Covered
                          </span>
                        </div>

                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              isHighPriority ? "bg-rose-500" : "bg-primary"
                            )}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>

                        <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Users className="size-3.5 text-primary" /> Supported:
                          </span>
                          <span className="font-bold text-foreground numeral-tabular">
                            {need.peopleCount} individuals
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Utensils className="size-3.5 text-primary" /> Remaining:
                          </span>
                          <span className="font-bold text-foreground truncate max-w-[160px] numeral-tabular">
                            {need.quantityRemaining > 0
                              ? `${need.quantityRemaining} ${need.unit}`
                              : "Fully Matched"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="size-3.5 text-[var(--brand-terracotta)]" /> Required by:
                          </span>
                          <span className="font-semibold text-foreground">
                            {need.requiredBy}
                          </span>
                        </div>
                      </div>

                      {/* Notes / Respectful Context */}
                      <p className="mt-3 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {need.notes}
                      </p>
                    </div>

                    {/* Bottom Action */}
                    <div className="mt-5 pt-3 border-t border-border/70 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        Verified Facility
                      </span>

                      <Button
                        size="sm"
                        render={<Link href="/donate" prefetch={true} />}
                        nativeButton={false}
                        className="gap-1.5 text-xs tap-tactile h-9 px-3.5 font-bold"
                      >
                        <span>Fulfill Need</span>
                        <ArrowRight className="size-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

          {filteredNeeds.length === 0 && (
            <div className="mt-12 rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="text-sm font-semibold text-foreground">
                No active food needs match your current filters.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try resetting or choosing a different Visakhapatnam area.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 tap-tactile"
                onClick={() => {
                  setSelectedArea("All")
                  setSelectedType("All")
                  setSelectedUrgency("All")
                  setSearchQuery("")
                }}
              >
                Reset All Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
