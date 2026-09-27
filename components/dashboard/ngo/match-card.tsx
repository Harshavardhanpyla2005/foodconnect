"use client"

import * as React from "react"
import { Check, X, Loader2, Sparkles, MapPin, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { acceptMatchAction, declineMatchAction } from "@/app/actions/ngo"
import { IMatch, IDonation, INeed } from "@/types/database"

interface MatchCardProps {
  match: IMatch
  donation: IDonation
  need?: INeed | null
  onActionComplete?: () => void
}

export function MatchCard({ match, donation, need, onActionComplete }: MatchCardProps) {
  const [isAccepting, setIsAccepting] = React.useState(false)
  const [isDeclining, setIsDeclining] = React.useState(false)
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleAccept = async () => {
    setIsAccepting(true)
    setFeedback(null)
    try {
      const res = await acceptMatchAction(match._id)
      if (!res.success) {
        setFeedback({ type: "error", text: res.message || "Failed to accept match." })
        setIsAccepting(false)
        return
      }
      setFeedback({ type: "success", text: "Match accepted! Courier collection task created." })
      setTimeout(() => {
        onActionComplete?.()
      }, 1200)
    } catch (err) {
      console.error(err)
      setFeedback({ type: "error", text: "Unexpected network error." })
    } finally {
      setIsAccepting(false)
    }
  }

  const handleDecline = async () => {
    setIsDeclining(true)
    setFeedback(null)
    try {
      const res = await declineMatchAction(match._id, "NGO capacity unavailable")
      if (!res.success) {
        setFeedback({ type: "error", text: res.message || "Failed to decline match." })
        setIsDeclining(false)
        return
      }
      setFeedback({ type: "success", text: "Match declined." })
      setTimeout(() => {
        onActionComplete?.()
      }, 800)
    } catch (err) {
      console.error(err)
      setFeedback({ type: "error", text: "Unexpected network error." })
    } finally {
      setIsDeclining(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4 hover:border-primary/40 transition-all">
      {/* Header with Match Score */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-foreground text-base">{donation.foodName}</h4>
            <span className="rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-xs font-bold flex items-center gap-1">
              <Sparkles className="size-3" />
              {match.score}% Match
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Surplus from {donation.pickupAddress.area} • For need: {need?.beneficiaryCategory || "Community Nutrition"}
          </p>
        </div>

        <div className="text-right">
          <div className="text-sm font-bold text-foreground">
            {donation.quantity} {donation.unit}
          </div>
          <div className="text-[0.65rem] text-muted-foreground">Available Quantity</div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="rounded-lg bg-muted/50 p-2">
          <span className="text-[0.65rem] text-muted-foreground block font-medium">Distance</span>
          <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="size-3 text-primary" />
            {match.distanceKm} km away
          </span>
        </div>

        <div className="rounded-lg bg-muted/50 p-2">
          <span className="text-[0.65rem] text-muted-foreground block font-medium">Food Category</span>
          <span className="font-semibold text-foreground truncate block mt-0.5">
            {donation.foodCategory.replace(/_/g, " ")}
          </span>
        </div>

        <div className="rounded-lg bg-muted/50 p-2">
          <span className="text-[0.65rem] text-muted-foreground block font-medium">Dietary Type</span>
          <span className="font-semibold text-foreground block mt-0.5">
            {donation.vegNonVeg.replace(/_/g, " ")}
          </span>
        </div>

        <div className="rounded-lg bg-muted/50 p-2">
          <span className="text-[0.65rem] text-muted-foreground block font-medium">Deadline</span>
          <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
            <Clock className="size-3" />
            {new Date(donation.safeConsumptionDeadline).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      {/* Explainable Factors */}
      <div className="rounded-xl bg-muted/30 p-3 space-y-1.5 text-xs">
        <div className="text-[0.7rem] font-semibold text-muted-foreground uppercase tracking-wider">
          Why this match was proposed:
        </div>
        <ul className="space-y-1">
          {match.explanation.positiveFactors.map((factor, i) => (
            <li key={i} className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <span className="size-1 rounded-full bg-emerald-500" />
              <span>{factor}</span>
            </li>
          ))}
          {match.explanation.riskFactors.map((risk, i) => (
            <li key={i} className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="size-3 shrink-0" />
              <span>{risk}</span>
            </li>
          ))}
        </ul>
      </div>

      {feedback && (
        <div
          className={`rounded-lg p-2.5 text-xs font-medium ${
            feedback.type === "success"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-1 border-t border-border">
        <Button
          size="sm"
          variant="outline"
          onClick={handleDecline}
          disabled={isAccepting || isDeclining}
          className="text-xs text-muted-foreground hover:text-destructive"
        >
          {isDeclining ? <Loader2 className="size-3.5 animate-spin" /> : <X className="size-3.5" />}
          Decline
        </Button>
        <Button
          size="sm"
          onClick={handleAccept}
          disabled={isAccepting || isDeclining}
          className="text-xs gap-1.5 bg-primary text-primary-foreground shadow-xs"
        >
          {isAccepting ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Accepting...
            </>
          ) : (
            <>
              <Check className="size-3.5" />
              Accept Surplus Donation
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
