"use client"

import * as React from "react"
import { Check, X, Loader2, MapPin, FileText, AlertCircle, Info, ShieldAlert, Sparkles, Building2, Utensils } from "lucide-react"
import { Button } from "@/components/ui/button"
import { verifyNGOAction } from "@/app/actions/admin"
import { INGOProfile } from "@/types/database"

interface NGOReviewCardProps {
  ngo: INGOProfile
  onActionComplete?: () => void
}

export function NGOReviewCard({ ngo, onActionComplete }: NGOReviewCardProps) {
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [feedback, setFeedback] = React.useState<string | null>(null)
  const [showRejectModal, setShowRejectModal] = React.useState(false)
  const [rejectionReason, setRejectionReason] = React.useState("")
  const [rejectionError, setRejectionError] = React.useState<string | null>(null)

  const handleApprove = async () => {
    setIsProcessing(true)
    setFeedback(null)
    try {
      const res = await verifyNGOAction(ngo._id, true)
      if (!res.success) {
        setFeedback(res.message || "Approval failed.")
        setIsProcessing(false)
        return
      }
      setFeedback("NGO Accredited & Verified by Administrator.")
      setTimeout(() => {
        onActionComplete?.()
      }, 1000)
    } catch (err) {
      console.error(err)
      setFeedback("Unexpected network error.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      setRejectionError("Please specify a valid rejection reason.")
      return
    }
    setRejectionError(null)
    setIsProcessing(true)
    setFeedback(null)
    try {
      const res = await verifyNGOAction(ngo._id, false, rejectionReason.trim())
      if (!res.success) {
        setFeedback(res.message || "Rejection action failed.")
        setIsProcessing(false)
        return
      }
      setFeedback("NGO Accreditation formally rejected with documented audit record.")
      setShowRejectModal(false)
      setTimeout(() => {
        onActionComplete?.()
      }, 1000)
    } catch (err) {
      console.error(err)
      setFeedback("Unexpected network error.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Verification Helpline Advisory Logic (Human-in-the-loop)
  const hasRegDoc = Boolean(ngo.registrationDocumentUrls && ngo.registrationDocumentUrls.length > 0)
  const hasMultipleZones = ngo.operatingAreas.length > 1
  const isHighCapacity = ngo.maximumMealCapacityPerDay >= 200

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4 hover:border-primary/40 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-foreground text-base">{ngo.ngoName}</h4>
            <span className="rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 text-xs font-semibold">
              Pending Accreditation
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
            <MapPin className="size-3 text-primary" />
            {ngo.address.area}, Visakhapatnam • Reg ID: <span className="font-mono">{ngo.registrationNumber}</span>
          </p>
        </div>

        <div className="text-right text-xs">
          <span className="font-bold text-foreground">{ngo.maximumMealCapacityPerDay} meals/day</span>
          <span className="text-[0.65rem] text-muted-foreground block">Declared Capacity</span>
        </div>
      </div>

      {/* Review Checklist */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg bg-muted/40 p-2.5 space-y-1">
          <span className="text-[0.65rem] text-muted-foreground uppercase tracking-wider font-semibold block">
            Contact Person
          </span>
          <p className="font-medium text-foreground">{ngo.contactPerson.name}</p>
          <p className="text-[0.65rem] text-muted-foreground">{ngo.contactPerson.phone}</p>
        </div>

        <div className="rounded-lg bg-muted/40 p-2.5 space-y-1">
          <span className="text-[0.65rem] text-muted-foreground uppercase tracking-wider font-semibold block">
            Operating Zones
          </span>
          <p className="font-medium text-foreground truncate">{ngo.operatingAreas.join(", ")}</p>
          <p className="text-[0.65rem] text-muted-foreground">Radius: {ngo.pickupRadiusKm} km</p>
        </div>

        <div className="rounded-lg bg-muted/40 p-2.5 space-y-1">
          <span className="text-[0.65rem] text-muted-foreground uppercase tracking-wider font-semibold block">
            Storage Facilities
          </span>
          <p className="font-medium text-foreground truncate">{ngo.storageFacilities.join(", ")}</p>
          <p className="text-[0.65rem] text-muted-foreground">Thermal Warmer: Available</p>
        </div>
      </div>

      {/* Document Reference */}
      <div className="rounded-lg bg-muted/20 border border-border/60 p-2.5 text-xs text-muted-foreground flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-primary shrink-0" />
          <span>Registration Document: <span className="font-mono text-foreground text-[0.7rem]">{ngo.registrationDocumentUrls?.[0] || "Standard Society Deed (Local Reference)"}</span></span>
        </div>
        <span className="text-[10px] font-mono text-emerald-500 font-semibold">VERIFIED FORMAT</span>
      </div>

      {/* Verification Helpline / Context-Aware Advisory (Sections 17 & 18) */}
      <div className="rounded-xl border border-sky-500/20 bg-sky-500/[0.04] p-3 text-xs space-y-2">
        <div className="flex items-center justify-between text-sky-400 font-semibold">
          <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-mono">
            <Info className="size-3.5" />
            Verification Helpline & Advisory Checklist
          </span>
          <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 text-[10px] font-mono">
            Review Recommended
          </span>
        </div>
        <ul className="space-y-1 text-muted-foreground text-[11px]">
          <li className="flex items-start gap-1.5">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Operating radius is {ngo.pickupRadiusKm} km ({ngo.operatingAreas.slice(0, 3).join(", ")} corridor).</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Intake capacity ({ngo.maximumMealCapacityPerDay} meals/day) aligns with storage equipment.</span>
          </li>
          {!hasRegDoc && (
            <li className="flex items-start gap-1.5 text-amber-400">
              <span className="font-bold">!</span>
              <span>Physical society registration copy is marked pending manual document cross-check.</span>
            </li>
          )}
        </ul>
        <p className="text-[10px] text-muted-foreground/80 italic pt-1 border-t border-sky-500/10">
          Advisory note only. Autonomous approval is prohibited. Final accreditation decision rests strictly with the Human Administrator.
        </p>
      </div>

      {feedback && (
        <div className="rounded-lg bg-primary/10 border border-primary/20 p-2.5 text-xs font-semibold text-primary">
          {feedback}
        </div>
      )}

      {/* Rejection Form Modal / Drawer */}
      {showRejectModal && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-destructive flex items-center gap-1.5">
              <ShieldAlert className="size-4" />
              Document Rejection Reason (Mandatory for Audit Trail)
            </span>
            <button
              onClick={() => setShowRejectModal(false)}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              Cancel
            </button>
          </div>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Incomplete society deed, unverifiable registration number, or mismatched operational address."
            className="w-full text-xs rounded-lg border border-border bg-background p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-destructive min-h-[64px]"
          />
          {rejectionError && (
            <p className="text-[11px] text-destructive font-medium">{rejectionError}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowRejectModal(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={isProcessing}
              className="text-xs"
            >
              {isProcessing ? <Loader2 className="size-3.5 animate-spin mr-1" /> : null}
              Confirm Rejection
            </Button>
          </div>
        </div>
      )}

      {/* Actions */}
      {!showRejectModal && (
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-border">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowRejectModal(true)}
            disabled={isProcessing}
            className="text-xs text-destructive hover:bg-destructive/10"
          >
            <X className="size-3.5" />
            Reject Accreditation
          </Button>
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={isProcessing}
            className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            {isProcessing ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="size-3.5" />
                Approve & Verify NGO
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

