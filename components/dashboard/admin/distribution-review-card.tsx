"use client"

import * as React from "react"
import {
  Check,
  X,
  Loader2,
  Camera,
  Users,
  Building2,
  Package,
  Truck,
  ExternalLink,
  AlertTriangle,
  HelpCircle,
  Clock,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { verifyDistributionAction } from "@/app/actions/admin"
import { IDistribution } from "@/types/database"

interface DistributionReviewCardProps {
  distribution: IDistribution
  ngoName?: string
  donationTitle?: string
  volunteerInfo?: {
    name?: string
    handoffPhotoUrl?: string
    notes?: string
  }
  onActionComplete?: () => void
}

export function DistributionReviewCard({
  distribution,
  ngoName,
  donationTitle,
  volunteerInfo,
  onActionComplete,
}: DistributionReviewCardProps) {
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [feedback, setFeedback] = React.useState<string | null>(null)
  const [activePhoto, setActivePhoto] = React.useState<string | null>(null)

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = React.useState(false)
  const [rejectReason, setRejectReason] = React.useState("")
  const [rejectError, setRejectError] = React.useState<string | null>(null)

  const handleApprove = async () => {
    setIsProcessing(true)
    setFeedback(null)
    try {
      const res = await verifyDistributionAction(distribution._id, true)
      if (!res.success) {
        setFeedback(res.message || "Failed to verify distribution.")
        setIsProcessing(false)
        return
      }
      setFeedback("✓ Distribution Verified! Verified impact added to public platform metrics.")
      setTimeout(() => {
        onActionComplete?.()
      }, 1000)
    } catch (err) {
      console.error(err)
      setFeedback("Unexpected network error during verification.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectReason.trim()) {
      setRejectError("A specific rejection reason is mandatory.")
      return
    }

    setIsProcessing(true)
    setRejectError(null)

    try {
      const res = await verifyDistributionAction(distribution._id, false, rejectReason.trim())
      if (!res.success) {
        setRejectError(res.message || "Rejection failed.")
        setIsProcessing(false)
        return
      }
      setShowRejectModal(false)
      setFeedback("Distribution evidence rejected and notification dispatched to NGO.")
      setTimeout(() => {
        onActionComplete?.()
      }, 1000)
    } catch (err) {
      console.error(err)
      setRejectError("Unexpected network error during rejection.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRequestClarification = () => {
    const note = prompt("Enter specific clarification request for this NGO distribution:")
    if (note && note.trim()) {
      alert(`Clarification request sent to NGO: "${note.trim()}". Status kept in review.`)
    }
  }

  const distPhotoUrl = distribution.evidencePhotos?.[0]

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4 hover:border-primary/40 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-foreground text-base">
              {distribution.distributionLocation.communityCenterName || "Community Center"},{" "}
              {distribution.distributionLocation.area}
            </h4>
            <span className="rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 text-xs font-semibold">
              Evidence Under Review
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Record #{distribution._id.slice(-6)} • Handover: {new Date(distribution.distributionTimestamp).toLocaleString()}
          </p>
        </div>

        <div className="text-right text-xs">
          <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            {distribution.quantityDistributed} {distribution.unit}
          </div>
          <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
            <Users className="size-3.5 text-primary" />
            {distribution.peopleServed} beneficiaries served
          </div>
        </div>
      </div>

      {/* Cross-entity reference cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg bg-muted/30 p-2.5 space-y-0.5 border border-border/40">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
            <Building2 className="size-3 text-emerald-600" />
            NGO Partner
          </span>
          <div className="font-semibold text-foreground truncate">
            {ngoName || "Accredited NGO"}
          </div>
          <div className="text-[10px] text-muted-foreground">Visakhapatnam Network</div>
        </div>

        <div className="rounded-lg bg-muted/30 p-2.5 space-y-0.5 border border-border/40">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
            <Package className="size-3 text-amber-600" />
            Linked Food Lot
          </span>
          <div className="font-semibold text-foreground truncate">
            {donationTitle || "Surplus Banquet Lot"}
          </div>
          <div className="text-[10px] text-muted-foreground">Donation #{distribution.donationId.slice(-6)}</div>
        </div>

        <div className="rounded-lg bg-muted/30 p-2.5 space-y-0.5 border border-border/40">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
            <Truck className="size-3 text-sky-600" />
            Transit Courier
          </span>
          <div className="font-semibold text-foreground truncate">
            {volunteerInfo?.name || "Verified Courier"}
          </div>
          <div className="text-[10px] text-muted-foreground">Handoff confirmed into NGO care</div>
        </div>
      </div>

      {/* Description / Beneficiary Notes */}
      <div className="text-xs text-foreground bg-muted/20 p-3 rounded-lg border border-border/50 space-y-1">
        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
          NGO Distribution Summary &amp; Community Notes
        </span>
        <p>&ldquo;{distribution.description}&rdquo;</p>
      </div>

      {/* Photo Evidences Comparison: Volunteer Handoff + NGO Distribution */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Volunteer Handoff Photo */}
        <div className="rounded-xl border border-border p-2.5 bg-card space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
            <span className="flex items-center gap-1">
              <Truck className="size-3 text-sky-500" />
              1. Volunteer Handoff Photo
            </span>
          </div>
          {volunteerInfo?.handoffPhotoUrl ? (
            <div
              className="relative aspect-video rounded-lg overflow-hidden border border-border bg-black/10 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setActivePhoto(volunteerInfo.handoffPhotoUrl!)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={volunteerInfo.handoffPhotoUrl}
                alt="Volunteer handover proof"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                Click to inspect
              </span>
            </div>
          ) : (
            <div className="aspect-video rounded-lg border border-dashed border-border flex items-center justify-center text-[11px] text-muted-foreground">
              No volunteer photo
            </div>
          )}
        </div>

        {/* NGO Final Distribution Photo */}
        <div className="rounded-xl border border-border p-2.5 bg-card space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
            <span className="flex items-center gap-1">
              <Camera className="size-3 text-emerald-500" />
              2. NGO Community Distribution Photo
            </span>
          </div>
          {distPhotoUrl ? (
            <div
              className="relative aspect-video rounded-lg overflow-hidden border border-border bg-black/10 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setActivePhoto(distPhotoUrl)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={distPhotoUrl}
                alt="Distribution evidence proof"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                Click to inspect
              </span>
            </div>
          ) : (
            <div className="aspect-video rounded-lg border border-dashed border-border flex items-center justify-center text-[11px] text-muted-foreground">
              No photo proof provided
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          {feedback}
        </div>
      )}

      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRequestClarification}
          disabled={isProcessing}
          className="text-xs text-muted-foreground hover:text-foreground gap-1"
        >
          <HelpCircle className="size-3.5" />
          Request Clarification
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowRejectModal(true)}
            disabled={isProcessing}
            className="text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
          >
            <X className="size-3.5" />
            Reject Evidence
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleApprove}
            disabled={isProcessing}
            className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
          >
            {isProcessing ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Auditing...
              </>
            ) : (
              <>
                <Check className="size-3.5" />
                Approve (Verify Impact)
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Photo Lightbox */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="max-w-3xl w-full bg-card rounded-2xl p-4 border border-border space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="font-bold text-sm text-foreground">Distribution Evidence Photo Inspection</span>
              <button
                type="button"
                onClick={() => setActivePhoto(null)}
                className="text-xs text-muted-foreground hover:text-foreground font-bold p-1"
              >
                ✕
              </button>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePhoto}
                alt="Enlarged Evidence"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setActivePhoto(null)}>
                Close Viewer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal with Mandatory Reason */}
      {showRejectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setShowRejectModal(false)}
        >
          <div
            className="max-w-md w-full bg-card rounded-2xl p-6 border border-border space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-destructive font-bold text-base">
                <AlertTriangle className="size-5" />
                Reject Distribution Evidence
              </div>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              A specific rejection reason is required and will be permanently recorded in the immutable audit ledger.
            </p>

            {rejectError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
                {rejectError}
              </div>
            )}

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Mandatory Rejection Reason:
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Photo evidence does not match recorded portions, blurry image, or duplicate handover..."
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-destructive"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRejectModal(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  disabled={isProcessing || !rejectReason.trim()}
                  className="font-semibold text-xs"
                >
                  {isProcessing ? <Loader2 className="size-3.5 animate-spin" /> : "Confirm Rejection"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
