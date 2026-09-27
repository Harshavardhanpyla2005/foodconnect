"use client"

import * as React from "react"
import { FileCheck, Loader2, Sparkles, AlertCircle, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/ui/form-field"
import { submitDistributionAction } from "@/app/actions/ngo"
import { IDonation, INeed } from "@/types/database"

interface SubmitDistributionModalProps {
  donation: IDonation
  need?: INeed | null
  onSuccess?: () => void
}

export function SubmitDistributionModal({ donation, need, onSuccess }: SubmitDistributionModalProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

  const [quantityDistributed, setQuantityDistributed] = React.useState(String(donation.quantity))
  const [peopleServed, setPeopleServed] = React.useState(String(Math.round(donation.quantity * 1.1)))
  const [distributionLocation, setDistributionLocation] = React.useState(need?.location?.area || "Siripuram Community Hall")
  const [description, setDescription] = React.useState(`Dignified meal handover for beneficiaries in ${need?.location?.area || "Visakhapatnam"}`)
  const [photoProofUrl, setPhotoProofUrl] = React.useState("/images/workflow/verification-photo.jpg")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setIsSubmitting(true)

    try {
      const res = await submitDistributionAction({
        donationId: donation._id,
        needId: need?._id || "",
        quantityDistributed: Number(quantityDistributed),
        unit: donation.unit,
        peopleServed: Number(peopleServed),
        distributionLocation,
        description,
        photoProofUrl,
      })

      if (!res.success) {
        setError(res.message || "Failed to submit distribution record.")
        setIsSubmitting(false)
        return
      }

      setSuccessMsg("Distribution proof submitted! Pending FoodConnect administrative audit.")
      setTimeout(() => {
        setIsOpen(false)
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
      <Button
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        <FileCheck className="size-3.5" />
        Record Distribution
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-lg font-bold text-foreground">Record Meal Distribution</h3>
                <p className="text-xs text-muted-foreground">
                  Lot: {donation.foodName} ({donation.quantity} {donation.unit})
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
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Portions Distributed">
                  <Input
                    type="number"
                    min="1"
                    value={quantityDistributed}
                    onChange={(e) => setQuantityDistributed(e.target.value)}
                    required
                  />
                </FormField>

                <FormField label="People Served">
                  <Input
                    type="number"
                    min="1"
                    value={peopleServed}
                    onChange={(e) => setPeopleServed(e.target.value)}
                    required
                  />
                </FormField>
              </div>

              <FormField label="Distribution Location / Venue">
                <Input
                  value={distributionLocation}
                  onChange={(e) => setDistributionLocation(e.target.value)}
                  placeholder="e.g. MVP Colony Shelter, Beach Road Relief Camp"
                  required
                />
              </FormField>

              <FormField label="Summary & Beneficiary Observations">
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Served hot dinner to senior residents and local laborers"
                  required
                />
              </FormField>

              <FormField label="Proof Photo (Prototype Reference)">
                <div className="flex items-center gap-2">
                  <Input
                    value={photoProofUrl}
                    onChange={(e) => setPhotoProofUrl(e.target.value)}
                    className="font-mono text-xs"
                    required
                  />
                  <div className="size-9 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border">
                    <Camera className="size-4 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-[0.65rem] text-muted-foreground mt-1">
                  In production, images will upload directly to Firebase Storage bucket with SHA-256 integrity hashing.
                </p>
              </FormField>

              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-[0.7rem] text-amber-800 dark:text-amber-300">
                <span className="font-semibold">Audit Notice:</span> Submitted distribution records are marked as{" "}
                <span className="font-bold">PENDING</span> until reviewed by FoodConnect operations. Only approved records are tallied into verified community impact.
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
                <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit for Audit"
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
