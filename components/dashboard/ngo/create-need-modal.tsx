"use client"

import * as React from "react"
import { PlusCircle, Loader2, Sparkles, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/ui/form-field"
import { createNeedAction } from "@/app/actions/ngo"
import { FoodType, DietaryPreference, NeedUrgency } from "@/types/database"

interface CreateNeedModalProps {
  onSuccess?: () => void
}

export function CreateNeedModal({ onSuccess }: CreateNeedModalProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

  const [title, setTitle] = React.useState("")
  const [foodType, setFoodType] = React.useState<FoodType>("COOKED_MEALS")
  const [dietaryPreference, setDietaryPreference] = React.useState<DietaryPreference>("VEG_AND_NON_VEG")
  const [quantityRequired, setQuantityRequired] = React.useState("80")
  const [urgency, setUrgency] = React.useState<NeedUrgency>("HIGH")
  const [beneficiaryCategory, setBeneficiaryCategory] = React.useState("Shelter Residents & Day Laborers")
  const [area, setArea] = React.useState("Siripuram")
  const getDefaultRequiredBy = () => {
    const d = new Date(Date.now() + 6 * 3600 * 1000)
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  }

  const [requiredBy, setRequiredBy] = React.useState(getDefaultRequiredBy)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setIsSubmitting(true)

    try {
      const res = await createNeedAction({
        title,
        foodType,
        dietaryPreference,
        quantityRequired: Number(quantityRequired),
        unit: "meals",
        urgency,
        beneficiaryCategory,
        area,
        requiredBy: new Date(requiredBy).toISOString(),
      })

      if (!res.success) {
        setError(res.message || "Failed to create need.")
        setIsSubmitting(false)
        return
      }

      setSuccessMsg("Community need successfully published to matching network!")
      setTimeout(() => {
        setIsOpen(false)
        setTitle("")
        setSuccessMsg(null)
        onSuccess?.()
      }, 1000)
    } catch (err) {
      console.error(err)
      setError("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="gap-2 shadow-xs">
        <PlusCircle className="size-4" />
        Publish Active Need
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-lg font-bold text-foreground">Post Community Food Need</h3>
                <p className="text-xs text-muted-foreground">
                  Broadcast active demand to food donors in Visakhapatnam
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mt-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <Sparkles className="size-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <FormField label="Need Headline / Purpose">
                <Input
                  placeholder="e.g. Evening Dinner for 80 Destitute Elders"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Food Type">
                  <select
                    value={foodType}
                    onChange={(e) => setFoodType(e.target.value as FoodType)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                  >
                    <option value="COOKED_MEALS">Cooked Meals</option>
                    <option value="BAKERY_ITEMS">Bakery Surplus</option>
                    <option value="FRESH_PRODUCE">Fresh Produce</option>
                    <option value="RAW_GRAINS_PULSES">Raw Grains & Pulses</option>
                    <option value="PACKAGED_FOODS">Packaged Foods</option>
                  </select>
                </FormField>

                <FormField label="Dietary Requirement">
                  <select
                    value={dietaryPreference}
                    onChange={(e) => setDietaryPreference(e.target.value as DietaryPreference)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                  >
                    <option value="PURE_VEG">Strictly Pure Veg</option>
                    <option value="VEG_AND_NON_VEG">Veg & Non-Veg Accepted</option>
                    <option value="HALAL_PREFERRED">Halal Preferred</option>
                    <option value="NO_RESTRICTION">No Restriction</option>
                  </select>
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Meals Required (Portions)">
                  <Input
                    type="number"
                    min="10"
                    max="1000"
                    value={quantityRequired}
                    onChange={(e) => setQuantityRequired(e.target.value)}
                    required
                  />
                </FormField>

                <FormField label="Urgency Level">
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as NeedUrgency)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                  >
                    <option value="IMMEDIATE">Immediate (Within 2 Hours)</option>
                    <option value="HIGH">High (Today)</option>
                    <option value="FLEXIBLE">Flexible (Next 24 Hours)</option>
                  </select>
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Vizag Operational Area">
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                  >
                    <option value="Siripuram">Siripuram</option>
                    <option value="MVP Colony">MVP Colony</option>
                    <option value="Jagadamba Center">Jagadamba Center</option>
                    <option value="Gajuwaka">Gajuwaka</option>
                    <option value="Madhurawada">Madhurawada</option>
                    <option value="Dwaraka Nagar">Dwaraka Nagar</option>
                  </select>
                </FormField>

                <FormField label="Required Latest By">
                  <Input
                    type="datetime-local"
                    value={requiredBy}
                    onChange={(e) => setRequiredBy(e.target.value)}
                    required
                  />
                </FormField>
              </div>

              <FormField label="Beneficiary Description">
                <Input
                  placeholder="e.g. Night shelter residents, day wage laborers, elderly care"
                  value={beneficiaryCategory}
                  onChange={(e) => setBeneficiaryCategory(e.target.value)}
                  required
                />
              </FormField>

              <div className="rounded-lg bg-muted/60 p-3 text-[0.7rem] text-muted-foreground border border-border">
                <span className="font-semibold text-foreground">Conservation Invariant:</span> Every published need initializes with{" "}
                <code className="bg-background px-1 py-0.5 rounded text-foreground font-mono">
                  quantityRemaining = quantityRequired ({quantityRequired} meals)
                </code>
                . Only verified completed distributions diminish remaining quantity.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Community Need"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
