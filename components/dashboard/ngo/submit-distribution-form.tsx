"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  FileCheck,
  Loader2,
  Sparkles,
  AlertCircle,
  Camera,
  Upload,
  Calendar,
  Clock,
  MapPin,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/ui/form-field"
import { submitDistributionAction } from "@/app/actions/ngo"
import { ICollection, IDonation } from "@/types/database"

interface SubmitDistributionFormModalProps {
  confirmedCollections: ICollection[]
  donations: IDonation[]
  onSuccess?: () => void
  preselectedCollectionId?: string
  buttonText?: string
}

export function SubmitDistributionFormModal({
  confirmedCollections,
  donations,
  onSuccess,
  preselectedCollectionId,
  buttonText = "Record Distribution",
}: SubmitDistributionFormModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

  const donationMap = React.useMemo(() => {
    return new Map(donations.map((d) => [d._id, d]))
  }, [donations])

  // Form fields
  const [selectedColId, setSelectedColId] = React.useState<string>(
    preselectedCollectionId || (confirmedCollections[0]?._id ?? "")
  )

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (preselectedCollectionId) {
        setSelectedColId(preselectedCollectionId)
      } else if (confirmedCollections.length > 0 && (!selectedColId || !confirmedCollections.some(c => c._id === selectedColId))) {
        setSelectedColId(confirmedCollections[0]._id)
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [preselectedCollectionId, confirmedCollections, selectedColId])

  const activeCollection = confirmedCollections.find((c) => c._id === selectedColId) || confirmedCollections[0]
  const activeDonation = activeCollection ? donationMap.get(activeCollection.donationId) : null

  const [quantityDistributed, setQuantityDistributed] = React.useState(
    activeDonation ? String(activeDonation.quantity || 50) : "50"
  )
  const [peopleServed, setPeopleServed] = React.useState("50")
  const [distributionDate, setDistributionDate] = React.useState(
    new Date().toISOString().split("T")[0]
  )
  const [distributionTime, setDistributionTime] = React.useState("13:00")
  const [distributionLocation, setDistributionLocation] = React.useState("Siripuram Community Shelter")
  const [distributionZone, setDistributionZone] = React.useState("Zone 3 - Coastal Corridor")
  const [communityServed, setCommunityServed] = React.useState("Elderly residents and daytime laborers")
  const [notes, setNotes] = React.useState("Hot nutritious meal packs handed over with clean sanitized cutlery.")

  // File upload state
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)

  // Sync default quantity when collection changes
  React.useEffect(() => {
    if (activeDonation) {
      const timer = setTimeout(() => {
        setQuantityDistributed(String(activeDonation.quantity || 50))
        setPeopleServed(String(activeDonation.quantity || 50))
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [activeDonation])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, or WEBP).")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image file exceeds 10MB limit.")
      return
    }

    setError(null)
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (!selectedColId) {
      setError("Please select an eligible NGO-confirmed collection lot.")
      return
    }

    if (!selectedFile) {
      setError("Physical distribution proof photo is required (genuine evidence).")
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Multipart upload to /api/media/evidence
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("category", "distribution")
      formData.append("collectionId", selectedColId)

      const uploadRes = await fetch("/api/media/evidence", {
        method: "POST",
        body: formData,
      })

      const uploadData = await uploadRes.json().catch(() => null)
      if (!uploadRes.ok || !uploadData?.success) {
        setError(uploadData?.error || "Failed to upload distribution proof photo.")
        setIsSubmitting(false)
        return
      }

      const photoProofUrl = uploadData.mediaUrl

      // 2. Submit distribution record server action
      const res = await submitDistributionAction({
        donationId: activeCollection?.donationId || "",
        needId: activeCollection?.needId || "",
        collectionId: selectedColId,
        quantityDistributed: Number(quantityDistributed),
        unit: activeDonation?.unit || "portions",
        peopleServed: Number(peopleServed),
        distributionLocation: `${distributionLocation} (${distributionZone})`,
        description: `${communityServed}. ${notes}`,
        photoProofUrl,
      })

      if (!res.success) {
        setError(res.message || "Failed to save distribution record.")
        setIsSubmitting(false)
        return
      }

      setSuccessMsg("✓ Distribution record submitted! Now queued for FoodConnect Administrative Evidence Review.")
      router.refresh()

      setTimeout(() => {
        setIsOpen(false)
        setSuccessMsg(null)
        setSelectedFile(null)
        setPreviewUrl(null)
        onSuccess?.()
      }, 1500)
    } catch (err) {
      console.error(err)
      setError("An unexpected network error occurred while submitting distribution.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
        data-collection-id={preselectedCollectionId || "any"}
      >
        <FileCheck className="size-3.5" />
        {buttonText}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Submit Community Distribution Record
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Record physical handover to beneficiaries with multipart photo proof for admin evidence review.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <Sparkles className="size-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Select Eligible Delivered Collection */}
              <FormField label="Eligible Received Food Lot (Delivered to NGO)">
                <select
                  value={selectedColId}
                  onChange={(e) => setSelectedColId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                >
                  {confirmedCollections.length === 0 ? (
                    <option value="">No delivered collections available yet</option>
                  ) : (
                    confirmedCollections.map((c) => {
                      const don = donationMap.get(c.donationId)
                      return (
                        <option key={c._id} value={c._id}>
                          Task #{c._id.slice(-6)}: {don?.foodName || "Surplus Meals"} ({don?.quantity || 50} portions - {don?.vegNonVeg || "VEG"})
                        </option>
                      )
                    })
                  )}
                </select>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Only food lots with confirmed handover receipt into your facility can be recorded.
                </p>
              </FormField>

              {/* Quantities */}
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

                <FormField label="Approximate People Served">
                  <Input
                    type="number"
                    min="1"
                    value={peopleServed}
                    onChange={(e) => setPeopleServed(e.target.value)}
                    required
                  />
                </FormField>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Distribution Date">
                  <Input
                    type="date"
                    value={distributionDate}
                    onChange={(e) => setDistributionDate(e.target.value)}
                    required
                  />
                </FormField>

                <FormField label="Distribution Time">
                  <Input
                    type="time"
                    value={distributionTime}
                    onChange={(e) => setDistributionTime(e.target.value)}
                    required
                  />
                </FormField>
              </div>

              {/* Location & Zone */}
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Generalized Location / Venue">
                  <Input
                    value={distributionLocation}
                    onChange={(e) => setDistributionLocation(e.target.value)}
                    placeholder="e.g. Siripuram Community Hall"
                    required
                  />
                </FormField>

                <FormField label="Distribution Zone">
                  <Input
                    value={distributionZone}
                    onChange={(e) => setDistributionZone(e.target.value)}
                    placeholder="e.g. Zone 2 - North Visakhapatnam"
                    required
                  />
                </FormField>
              </div>

              {/* Community & Category Served */}
              <FormField label="Community / Beneficiary Category Served">
                <Input
                  value={communityServed}
                  onChange={(e) => setCommunityServed(e.target.value)}
                  placeholder="e.g. Old age home residents, shelter inhabitants, disaster relief"
                  required
                />
              </FormField>

              {/* Notes */}
              <FormField label="Distribution Notes">
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Meal served hot with sanitized utensils"
                />
              </FormField>

              {/* Photo Evidence Upload (Multipart) */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-foreground">
                  Distribution Evidence Photo Proof (JPEG, PNG, WEBP)
                </label>
                <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-2.5 text-[0.7rem] text-blue-700 dark:text-blue-300 font-medium">
                  <span className="font-bold">Real evidence photo required:</span> Do not upload promotional graphics, process diagrams, screenshots, or illustrations as distribution proof.
                </div>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors bg-muted/10">
                  <Upload className="size-6 text-muted-foreground mb-1" />
                  <span className="text-xs font-medium text-foreground">
                    {selectedFile ? selectedFile.name : "Select or capture genuine distribution photo"}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    Real multipart upload • SHA-256 integrity calculated on server
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {previewUrl && (
                  <div className="relative aspect-video max-h-48 rounded-xl overflow-hidden border border-border bg-black/10 mx-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Distribution proof preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-[0.7rem] text-amber-800 dark:text-amber-300">
                <span className="font-semibold">Evidence Review Notice:</span> Once submitted, this record transitions to{" "}
                <span className="font-bold">EVIDENCE_REVIEW</span>. The platform administrator will inspect the photo evidence before approving for public transparency.
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
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || confirmedCollections.length === 0}
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Uploading &amp; Submitting...
                    </>
                  ) : (
                    "Submit for Evidence Review"
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
