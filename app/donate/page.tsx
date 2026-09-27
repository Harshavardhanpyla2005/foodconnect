"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import {
  Utensils,
  Layers,
  ThermometerSnowflake,
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  Zap,
} from "lucide-react"
import { Header } from "@/components/home/header"
import { Footer } from "@/components/home/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormField } from "@/components/ui/form-field"
import {
  PageHeading,
  EditorialLead,
  SectionHeading,
} from "@/components/ui/typography"
import { Card, CardContent } from "@/components/ui/card"
import { VIZAG_AREAS } from "@/lib/constants/vizag-map-data"
import {
  createDonationAction,
  MatchRecommendation,
} from "@/app/actions/donations"
import { IDonation } from "@/types/database"
import { cn } from "@/lib/utils"

const WIZARD_STEPS = [
  { id: 1, name: "Food", label: "Surplus Food Details", icon: Utensils },
  { id: 2, name: "Quantity", label: "Portions & Packaging", icon: Layers },
  { id: 3, name: "Freshness", label: "Storage & Safety", icon: ThermometerSnowflake },
  { id: 4, name: "Pickup", label: "Location & Schedule", icon: MapPin },
  { id: 5, name: "Match", label: "Review & Match", icon: Sparkles },
] as const

export default function DonatePage() {
  const [currentStep, setCurrentStep] = React.useState<number>(1)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isMatchingSim, setIsMatchingSim] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [createdDonation, setCreatedDonation] = React.useState<IDonation | null>(null)
  const [matches, setMatches] = React.useState<MatchRecommendation[]>([])

  // Form State
  const [formData, setFormData] = React.useState({
    donorType: "Restaurant / Caterer",
    foodName: "",
    dietaryType: "Vegetarian",
    quantity: "100",
    unit: "portions / meals",
    preparedAt: "",
    consumptionDeadline: "Today by 9:00 PM (Within 4 hours)",
    storageCondition: "Hot Holding / Insulated (>60°C)",
    packagingCondition: "Sealed Food-Grade Containers",
    allergens: "None",
    notes: "",
    pickupArea: "Siripuram",
    pickupAddress: "VIP Road, Near Siripuram Circle",
    pickupWindow: "Today between 3:30 PM - 5:30 PM",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  // Step validation
  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {}
    if (step === 1) {
      if (!formData.foodName.trim()) {
        errs.foodName = "Please enter the food name or dish description."
      }
    } else if (step === 2) {
      if (
        !formData.quantity.trim() ||
        isNaN(Number(formData.quantity)) ||
        Number(formData.quantity) <= 0
      ) {
        errs.quantity = "Please enter a valid portion count greater than 0."
      }
    } else if (step === 4) {
      if (!formData.pickupAddress.trim()) {
        errs.pickupAddress = "Please specify the pickup street address in Visakhapatnam."
      }
      if (!formData.pickupWindow.trim()) {
        errs.pickupWindow = "Please specify the pickup time window."
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(5, prev + 1))
      window.scrollTo({ top: 120, behavior: "smooth" })
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1))
  }

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault()
    if (!validateStep(4)) {
      setCurrentStep(4)
      return
    }

    setServerError(null)
    setIsSubmitting(true)
    setIsMatchingSim(true)

    try {
      // 1. Submit to server action
      const result = await createDonationAction(formData)

      if (!result.success) {
        if (result.errors) {
          setErrors(result.errors)
        }
        setServerError(result.message || "Could not register surplus food.")
        setIsSubmitting(false)
        setIsMatchingSim(false)
        return
      }

      // Small delay for the "Finding best match..." visual effect
      setTimeout(() => {
        setCreatedDonation(result.donation || null)
        setMatches(result.matches || [])
        setIsSubmitting(false)
        setIsMatchingSim(false)
        setSubmitted(true)
        window.scrollTo({ top: 100, behavior: "smooth" })
      }, 900)
    } catch {
      setServerError("An unexpected error occurred while registering surplus food.")
      setIsSubmitting(false)
      setIsMatchingSim(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased">
      <Header />

      <main className="flex-1 py-10 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-3">
              <Utensils className="size-3.5" />
              <span>Commercial & Event Surplus Intake</span>
            </div>
            <PageHeading className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
              Donate Surplus Food
            </PageHeading>
            <EditorialLead className="mt-3 text-muted-foreground">
              Register surplus meals to instantly calculate compatibility with accredited
              community shelters and elderly homes across Visakhapatnam.
            </EditorialLead>
          </div>

          {/* Guided Wizard Container */}
          <div className="mt-8">
            {!submitted ? (
              <Card variant="warm" className="border-border/90 shadow-sm overflow-hidden">
                {/* Mobile Step Header (Step X of 5) */}
                <div className="bg-muted/40 border-b border-border/80 p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      Step {currentStep} of 5 • {WIZARD_STEPS[currentStep - 1].name}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {WIZARD_STEPS[currentStep - 1].label}
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300 rounded-full"
                      style={{ width: `${(currentStep / 5) * 100}%` }}
                    />
                  </div>

                  {/* Step Pills for Desktop */}
                  <div className="hidden sm:grid grid-cols-5 gap-2 mt-4 pt-2 border-t border-border/40">
                    {WIZARD_STEPS.map((step) => {
                      const Icon = step.icon
                      const isDone = currentStep > step.id
                      const isCurrent = currentStep === step.id
                      return (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() => {
                            if (isDone) setCurrentStep(step.id)
                          }}
                          disabled={!isDone && !isCurrent}
                          className={cn(
                            "flex items-center gap-2 text-left rounded-lg p-2 text-xs transition-colors",
                            isCurrent && "bg-primary/10 text-primary font-bold",
                            isDone && "text-muted-foreground hover:bg-muted cursor-pointer",
                            !isDone && !isCurrent && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <div
                            className={cn(
                              "size-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                              isCurrent && "bg-primary text-primary-foreground",
                              isDone && "bg-emerald-600 text-white",
                              !isDone && !isCurrent && "bg-muted text-muted-foreground"
                            )}
                          >
                            {isDone ? "✓" : step.id}
                          </div>
                          <Icon className="size-3.5 shrink-0" />
                          <span className="truncate">{step.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Form Content */}
                <CardContent className="p-5 sm:p-8">
                  {serverError && (
                    <div className="mb-6 rounded-xl bg-destructive/10 p-4 text-xs text-destructive border border-destructive/20 flex items-center gap-2">
                      <AlertCircle className="size-4 shrink-0" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  {isMatchingSim ? (
                    <div className="py-16 text-center space-y-4">
                      <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary animate-pulse">
                        <Zap className="size-7" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">
                        Finding the best match...
                      </h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Evaluating Haversine distances, dietary compatibility, and thermal holding
                        capacities across Visakhapatnam NGO shelters.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={(e) => { e.preventDefault(); if (currentStep === 5) handleSubmit(e); }}>
                      <AnimatePresence mode="wait">
                        {/* STEP 1: FOOD DETAILS */}
                        {currentStep === 1 && (
                          <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-5"
                          >
                            <div>
                              <h3 className="text-base font-bold text-foreground">
                                What food do you have available?
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Describe the food and its dietary profile so we match with the right community.
                              </p>
                            </div>

                            <FormField label="Food Name or Dish Description" required error={errors.foodName}>
                              <Input
                                name="foodName"
                                placeholder="e.g. Steamed Rice, Sambar, Vegetable Korma"
                                value={formData.foodName}
                                onChange={handleChange}
                                className="h-11 text-sm"
                              />
                            </FormField>

                            {/* Visual Dietary Selector */}
                            <div>
                              <label className="text-xs font-bold text-foreground uppercase tracking-wider block mb-2">
                                Dietary Profile *
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                  {
                                    val: "Vegetarian",
                                    title: "Vegetarian",
                                    desc: "Pure veg meals accepted by all shelters and care homes",
                                  },
                                  {
                                    val: "Non-Vegetarian",
                                    title: "Non-Vegetarian",
                                    desc: "Routed to facilities with non-veg handling policies",
                                  },
                                  {
                                    val: "Both",
                                    title: "Both",
                                    desc: "Mixed vegetarian and non-vegetarian buffet/event lots",
                                  },
                                ].map((opt) => (
                                  <button
                                    key={opt.val}
                                    type="button"
                                    onClick={() =>
                                      setFormData((prev) => ({ ...prev, dietaryType: opt.val }))
                                    }
                                    className={cn(
                                      "p-4 rounded-xl border text-left transition-all tap-tactile",
                                      formData.dietaryType === opt.val
                                        ? "border-primary bg-primary/5 shadow-2xs"
                                        : "border-border/80 bg-card hover:bg-muted/40"
                                    )}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-bold text-foreground">
                                        {opt.title}
                                      </span>
                                      {formData.dietaryType === opt.val && (
                                        <CheckCircle2 className="size-4 text-primary" />
                                      )}
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                      {opt.desc}
                                    </p>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <FormField label="Donor Facility Type" required>
                              <select
                                name="donorType"
                                value={formData.donorType}
                                onChange={handleChange}
                                className="w-full h-11 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                              >
                                <option>Restaurant / Caterer</option>
                                <option>Hotel / Banquet Hall</option>
                                <option>Bakery Guild / Cafe</option>
                                <option>Corporate / University Cafeteria</option>
                                <option>Individual / Event Host</option>
                              </select>
                            </FormField>
                          </motion.div>
                        )}

                        {/* STEP 2: QUANTITY & PACKAGING */}
                        {currentStep === 2 && (
                          <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-5"
                          >
                            <div>
                              <h3 className="text-base font-bold text-foreground">
                                How much food is ready?
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Accurate portion numbers ensure accurate NGO capacity matching.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <FormField label="Quantity Portions" required error={errors.quantity}>
                                <Input
                                  name="quantity"
                                  type="number"
                                  placeholder="e.g. 100"
                                  value={formData.quantity}
                                  onChange={handleChange}
                                  className="h-11 text-sm numeral-tabular"
                                />
                              </FormField>

                              <FormField label="Measurement Unit">
                                <select
                                  name="unit"
                                  value={formData.unit}
                                  onChange={handleChange}
                                  className="w-full h-11 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                  <option>portions / meals</option>
                                  <option>kg (kilograms)</option>
                                  <option>packets / boxes</option>
                                  <option>litres</option>
                                </select>
                              </FormField>
                            </div>

                            <FormField label="Packaging Condition" required>
                              <select
                                name="packagingCondition"
                                value={formData.packagingCondition}
                                onChange={handleChange}
                                className="w-full h-11 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                              >
                                <option>Sealed Food-Grade Containers</option>
                                <option>Disposable Meal Boxes</option>
                                <option>Stainless Steel Pots / Handis</option>
                                <option>Corrugated Cardboard Boxes</option>
                              </select>
                            </FormField>

                            <FormField label="Allergens / Dietary Flags">
                              <Input
                                name="allergens"
                                placeholder="e.g. Contains dairy; Gluten-free; Nut-free"
                                value={formData.allergens}
                                onChange={handleChange}
                                className="h-11 text-sm"
                              />
                            </FormField>
                          </motion.div>
                        )}

                        {/* STEP 3: FRESHNESS & STORAGE */}
                        {currentStep === 3 && (
                          <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-5"
                          >
                            <div>
                              <h3 className="text-base font-bold text-foreground">
                                Freshness & Storage Requirements
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Please provide accurate food safety and freshness information.
                              </p>
                              <div className="mt-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-[11px] text-emerald-400">
                                <strong>Safety Notice:</strong> FoodConnect coordinates matching and distribution logistics. Please ensure all cooked items meet temperature criteria and are declared with accurate consumption deadlines.
                              </div>
                            </div>

                            <FormField label="Current Storage Condition" required>
                              <select
                                name="storageCondition"
                                value={formData.storageCondition}
                                onChange={handleChange}
                                className="w-full h-11 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                              >
                                <option>Hot Holding / Insulated (&gt;60°C)</option>
                                <option>Room Temperature / Dry Shelf</option>
                                <option>Refrigerated Chilled (&lt;5°C)</option>
                                <option>Deep Frozen (&lt;-18°C)</option>
                              </select>
                            </FormField>

                            <FormField label="Safe Consumption Deadline" required>
                              <select
                                name="consumptionDeadline"
                                value={formData.consumptionDeadline}
                                onChange={handleChange}
                                className="w-full h-11 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                              >
                                <option>Today by 9:00 PM (Within 4 hours)</option>
                                <option>Today by 11:30 PM (Within 6 hours)</option>
                                <option>Tomorrow Morning (Within 12 hours)</option>
                                <option>Within 24-48 Hours (Packaged/Chilled)</option>
                              </select>
                            </FormField>

                            <FormField label="Special Handling or Re-heating Notes">
                              <Textarea
                                name="notes"
                                placeholder="e.g. Keep insulated until serving. Dal is mildly spiced."
                                value={formData.notes}
                                onChange={handleChange}
                                rows={3}
                                className="text-sm"
                              />
                            </FormField>
                          </motion.div>
                        )}

                        {/* STEP 4: PICKUP LOCATION & SCHEDULE */}
                        {currentStep === 4 && (
                          <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-5"
                          >
                            <div>
                              <h3 className="text-base font-bold text-foreground">
                                Where should the courier pick up?
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Geolocation within Visakhapatnam to compute exact Haversine distance.
                              </p>
                            </div>

                            <FormField label="Visakhapatnam Area" required>
                              <select
                                name="pickupArea"
                                value={formData.pickupArea}
                                onChange={handleChange}
                                className="w-full h-11 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                              >
                                {VIZAG_AREAS.filter((a) => a !== "All Vizag Areas").map((area) => (
                                  <option key={area} value={area}>
                                    {area}
                                  </option>
                                ))}
                              </select>
                            </FormField>

                            <FormField
                              label="Street Address / Loading Dock"
                              required
                              error={errors.pickupAddress}
                            >
                              <Input
                                name="pickupAddress"
                                placeholder="e.g. Service Entrance, Hotel Daspalla, Jagadamba Center"
                                value={formData.pickupAddress}
                                onChange={handleChange}
                                className="h-11 text-sm"
                              />
                            </FormField>

                            <FormField
                              label="Available Collection Window"
                              required
                              error={errors.pickupWindow}
                            >
                              <Input
                                name="pickupWindow"
                                placeholder="e.g. Today between 3:30 PM - 5:30 PM"
                                value={formData.pickupWindow}
                                onChange={handleChange}
                                className="h-11 text-sm"
                              />
                            </FormField>
                          </motion.div>
                        )}

                        {/* STEP 5: REVIEW & MATCH PREVIEW */}
                        {currentStep === 5 && (
                          <motion.div
                            key="step5"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-5"
                          >
                            <div>
                              <h3 className="text-base font-bold text-foreground">
                                Review &amp; Register Surplus
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Confirm the details before running the smart matching engine.
                              </p>
                            </div>

                            <div className="rounded-xl border border-border/80 bg-muted/40 p-4 space-y-3 text-xs">
                              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                                <span className="font-bold text-foreground text-sm">
                                  {formData.foodName}
                                </span>
                                <span className="rounded bg-primary/10 px-2 py-0.5 text-primary font-bold">
                                  {formData.dietaryType}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                                <div>
                                  <span className="block text-[10px] uppercase font-semibold">Quantity:</span>
                                  <span className="font-bold text-foreground text-xs numeral-tabular">
                                    {formData.quantity} {formData.unit}
                                  </span>
                                </div>
                                <div>
                                  <span className="block text-[10px] uppercase font-semibold">Storage:</span>
                                  <span className="font-medium text-foreground text-xs">
                                    {formData.storageCondition}
                                  </span>
                                </div>
                                <div>
                                  <span className="block text-[10px] uppercase font-semibold">Pickup Zone:</span>
                                  <span className="font-medium text-foreground text-xs">
                                    {formData.pickupArea}
                                  </span>
                                </div>
                                <div>
                                  <span className="block text-[10px] uppercase font-semibold">Schedule:</span>
                                  <span className="font-medium text-foreground text-xs">
                                    {formData.pickupWindow}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="rounded-xl bg-primary/5 p-4 border border-primary/20 flex items-start gap-3 text-xs text-muted-foreground">
                              <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
                              <p>
                                By submitting, you declare that the food was prepared in a hygienic
                                environment in accordance with applicable food safety standards.
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Navigation Buttons */}
                      <div className="mt-8 pt-6 border-t border-border flex items-center justify-between gap-4">
                        {currentStep > 1 ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleBack}
                            className="gap-2 tap-tactile h-11 px-5"
                          >
                            <ArrowLeft className="size-4" />
                            <span>Back</span>
                          </Button>
                        ) : (
                          <div />
                        )}

                        {currentStep < 5 ? (
                          <Button
                            type="button"
                            onClick={handleNext}
                            className="gap-2 tap-tactile h-11 px-6 font-semibold"
                          >
                            <span>Next Step</span>
                            <ArrowRight className="size-4" />
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="gap-2 tap-tactile h-11 px-7 font-bold shadow-xs"
                          >
                            <Sparkles className="size-4" />
                            <span>{isSubmitting ? "Matching..." : "Register & Find Match"}</span>
                          </Button>
                        )}
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            ) : (
              /* Success & Match Result Showcase */
              <div className="space-y-6">
                <Card variant="elevated" className="border-border/90 shadow-sm overflow-hidden">
                  <div className="bg-emerald-500/10 border-b border-emerald-500/20 p-6 text-center">
                    <div className="inline-flex size-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs mb-3">
                      <CheckCircle2 className="size-6" />
                    </div>
                    <SectionHeading className="text-2xl sm:text-3xl font-extrabold text-foreground">
                      Surplus Food Registered &amp; Matched
                    </SectionHeading>
                    <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                      Listing #{createdDonation?._id || "FC-NEW"} is live in the Vizag network.
                      Smart matching evaluated available accredited shelters.
                    </p>
                  </div>

                  <CardContent className="p-6">
                    <div className="text-center sm:text-left mb-6">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
                        Recommended Compatible NGO Needs ({matches.length})
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Ranked by distance, dietary alignment, and urgency.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {matches.map((match) => (
                        <div
                          key={match.matchId}
                          className="rounded-2xl border border-border/90 bg-card p-5 shadow-2xs hover:border-primary/40 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/60">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-base text-foreground">
                                  {match.ngoName}
                                </span>
                                <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                                  VERIFIED NGO
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                <MapPin className="size-3 text-primary shrink-0" />
                                <span>{match.ngoArea} ({match.distanceKm} km away)</span>
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                  Compatibility
                                </span>
                                <span className="text-xl font-black text-primary numeral-tabular">
                                  {match.matchScore}%
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                            <div className="rounded-lg bg-muted/40 p-2.5">
                              <span className="block text-[10px] text-muted-foreground">Beneficiaries:</span>
                              <span className="font-semibold text-foreground">{match.beneficiaryCategory}</span>
                            </div>
                            <div className="rounded-lg bg-muted/40 p-2.5">
                              <span className="block text-[10px] text-muted-foreground">Needed:</span>
                              <span className="font-semibold text-foreground numeral-tabular">
                                {match.quantityRemaining} {match.unit}
                              </span>
                            </div>
                            <div className="rounded-lg bg-muted/40 p-2.5">
                              <span className="block text-[10px] text-muted-foreground">Urgency:</span>
                              <span className="font-semibold text-[var(--brand-terracotta)]">
                                {match.urgency}
                              </span>
                            </div>
                          </div>

                          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                            {match.summary}
                          </p>

                          <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                            <span className="text-[11px] text-muted-foreground">
                              Courier will be dispatched upon shelter confirmation.
                            </span>
                            <Button size="sm" render={<Link href="/login" prefetch={true} />} nativeButton={false}>
                              <span>View in Dashboard</span>
                              <ArrowRight className="size-3.5 ml-1" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 text-center pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSubmitted(false)
                          setCurrentStep(1)
                          setFormData({
                            donorType: "Restaurant / Caterer",
                            foodName: "",
                            dietaryType: "Pure Vegetarian (No Egg/Meat)",
                            quantity: "100",
                            unit: "portions / meals",
                            preparedAt: "",
                            consumptionDeadline: "Today by 9:00 PM (Within 4 hours)",
                            storageCondition: "Hot Holding / Insulated (>60°C)",
                            packagingCondition: "Sealed Food-Grade Containers",
                            allergens: "None",
                            notes: "",
                            pickupArea: "Siripuram",
                            pickupAddress: "VIP Road, Near Siripuram Circle",
                            pickupWindow: "Today between 3:30 PM - 5:30 PM",
                          })
                        }}
                        className="gap-2 tap-tactile"
                      >
                        <RotateCcw className="size-4" />
                        <span>Register Another Surplus Batch</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
