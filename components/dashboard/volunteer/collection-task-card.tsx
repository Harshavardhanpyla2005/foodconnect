"use client"

import * as React from "react"
import Link from "next/link"
import { Truck, CheckCircle2, MapPin, Loader2, ShieldCheck, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { claimPickupTaskAction, updateCollectionProgressAction } from "@/app/actions/volunteer"
import { ICollection, IDonation, CollectionStatus } from "@/types/database"

interface CollectionTaskCardProps {
  collection: ICollection
  donation?: IDonation | null
  currentUserId: string
  onActionComplete?: (updated?: ICollection) => void
}

export function CollectionTaskCard({
  collection: initialCollection,
  donation,
  currentUserId,
  onActionComplete,
}: CollectionTaskCardProps) {
  const [collection, setCollection] = React.useState<ICollection>(initialCollection)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setCollection(initialCollection)
    }, 0)
    return () => clearTimeout(timer)
  }, [initialCollection])

  const isAssignedToMe = collection.volunteerId === currentUserId
  const isClaimable = !collection.volunteerId && collection.status === "ASSIGNED"

  const handleClaim = async () => {
    setIsSubmitting(true)
    setFeedback(null)

    try {
      // 1. Primary browser path: Call the REST endpoint POST /api/collections/:id/claim
      const response = await fetch(`/api/collections/${collection._id}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
      })

      const data = await response.json().catch(() => null)

      if (!response.ok || !data?.success) {
        let errMessage = data?.error || "Failed to claim pickup."
        if (response.status === 401) {
          errMessage = "Please sign in as a volunteer to claim this pickup."
        } else if (response.status === 403) {
          errMessage = "You are not authorized to claim collection tasks."
        } else if (response.status === 409) {
          errMessage = "This pickup has already been claimed."
        }
        setFeedback({ type: "error", text: errMessage })
        setIsSubmitting(false)
        return
      }

      // 2. Success state
      const updatedCollection = data.collection as ICollection
      setCollection(updatedCollection)
      setFeedback({ type: "success", text: "✓ Pickup claimed" })

      // 3. Notify parent dispatcher to update tab queues immediately
      onActionComplete?.(updatedCollection)
    } catch (err) {
      console.warn("Direct API call encountered network error, falling back to Server Action:", err)
      // Resilient fallback to Server Action
      try {
        const res = await claimPickupTaskAction(collection._id)
        if (!res.success) {
          setFeedback({ type: "error", text: res.message || "Failed to claim task." })
          setIsSubmitting(false)
          return
        }
        const updatedCollection = res.collection || {
          ...collection,
          volunteerId: currentUserId,
          status: "ASSIGNED" as const,
        }
        setCollection(updatedCollection)
        setFeedback({ type: "success", text: "✓ Pickup claimed" })
        onActionComplete?.(updatedCollection)
      } catch (actionErr) {
        console.error(actionErr)
        setFeedback({ type: "error", text: "Unexpected network error. Please verify your connection." })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAdvanceMilestone = async (nextStatus: CollectionStatus) => {
    setIsSubmitting(true)
    setFeedback(null)
    try {
      const res = await updateCollectionProgressAction(collection._id, nextStatus)
      if (!res.success) {
        setFeedback({ type: "error", text: res.message || "Failed to update milestone." })
        setIsSubmitting(false)
        return
      }
      const updated = { ...collection, status: nextStatus }
      setCollection(updated)
      setFeedback({ type: "success", text: `✓ Milestone advanced to ${nextStatus.replace("_", " ")}` })
      onActionComplete?.(updated)
    } catch (err) {
      console.error(err)
      setFeedback({ type: "error", text: "Unexpected network error." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4 hover:border-primary/40 transition-all">
      {/* Task Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground text-sm">
              Task #{collection._id.slice(-6)}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                collection.status === "DELIVERED_TO_NGO" || collection.status === "NGO_CONFIRMED" || collection.status === "VERIFIED"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                  : collection.status === "HANDOFF_SUBMITTED"
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                  : collection.status === "IN_TRANSIT" || collection.status === "ARRIVED_AT_NGO"
                  ? "bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20"
                  : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20"
              }`}
            >
              {collection.status.replace(/_/g, " ")}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {donation ? `${donation.foodName} (${donation.quantity} ${donation.unit})` : "Surplus Meal Lot"}
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-foreground">
            ~3.5 km
          </span>
          <span className="text-[0.65rem] text-muted-foreground block">Transit Corridor</span>
        </div>
      </div>

      {/* 5-Stage Collection Route Progress Indicator */}
      <div className="rounded-xl border border-border/70 bg-muted/30 p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          <span>Collection Route Progress</span>
          <span className="text-primary font-extrabold">{collection.status.replace(/_/g, " ")}</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 text-center">
          {[
            { key: "CLAIMED", label: "01 Claimed" },
            { key: "HEADING_TO_DONOR", label: "02 To Donor" },
            { key: "PICKED_UP", label: "03 Picked Up" },
            { key: "IN_TRANSIT", label: "04 In Transit" },
            { key: "ARRIVED_AT_NGO", label: "05 At NGO" },
          ].map((st, i) => {
            const statusOrder = [
              "CLAIMED",
              "HEADING_TO_DONOR",
              "ARRIVED_AT_DONOR",
              "PICKED_UP",
              "IN_TRANSIT",
              "ARRIVED_AT_NGO",
              "HANDOFF_SUBMITTED",
              "DELIVERED_TO_NGO",
              "NGO_CONFIRMED",
            ]
            const currOrder = statusOrder.indexOf(collection.status)
            const stageOrder = statusOrder.indexOf(st.key)
            const isCompleted = currOrder > stageOrder
            const isCurrent = currOrder === stageOrder || (collection.status === "ASSIGNED" && i === 0)

            return (
              <div
                key={st.key}
                className={`py-1.5 px-1 rounded-md text-[10px] font-bold transition-all ${
                  isCurrent
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : isCompleted
                    ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-semibold"
                    : "bg-muted text-muted-foreground/70"
                }`}
              >
                <span className="block truncate">{st.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Corridor Points */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-muted/40 p-2.5">
          <span className="text-[0.65rem] text-muted-foreground uppercase tracking-wider font-semibold block">
            Pickup Corridor
          </span>
          <span className="font-semibold text-foreground flex items-center gap-1 mt-1">
            <MapPin className="size-3.5 text-amber-500 shrink-0" />
            {collection.pickupAddress.area}
          </span>
          <span className="text-[0.65rem] text-muted-foreground block mt-0.5">
            {collection.pickupAddress.street}
          </span>
        </div>

        <div className="rounded-lg bg-muted/40 p-2.5">
          <span className="text-[0.65rem] text-muted-foreground uppercase tracking-wider font-semibold block">
            Delivery Destination
          </span>
          <span className="font-semibold text-foreground flex items-center gap-1 mt-1">
            <MapPin className="size-3.5 text-emerald-500 shrink-0" />
            {collection.pickupAddress.city} Center
          </span>
          <span className="text-[0.65rem] text-muted-foreground block mt-0.5">
            Verified NGO Receiving Dock
          </span>
        </div>
      </div>

      {/* Safety Instructions */}
      <div className="text-[0.7rem] text-muted-foreground bg-muted/20 p-2 rounded-lg flex items-center gap-1.5 border border-border/50">
        <ShieldCheck className="size-3.5 text-primary shrink-0" />
        <span>Use thermal insulated carrier box. Verify container lid seals before departure.</span>
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

      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
        {isAssignedToMe && (
          <Link
            href={`/dashboard/volunteer/pickups/${collection._id}`}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>Open Operational Console &amp; GPS &rarr;</span>
          </Link>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {isClaimable && (
            <Button
              size="sm"
              onClick={handleClaim}
              disabled={isSubmitting}
              className="gap-1.5 text-xs bg-primary text-primary-foreground shadow-xs w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <Truck className="size-3.5" />
                  Claim Pickup Task (Atomic)
                </>
              )}
            </Button>
          )}

          {isAssignedToMe && (collection.status === "ASSIGNED" || collection.status === "CLAIMED") && (
            <Button
              size="sm"
              onClick={() => handleAdvanceMilestone("HEADING_TO_DONOR")}
              disabled={isSubmitting}
              className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : <Truck className="size-3.5" />}
              {isSubmitting ? "Starting..." : "Start Journey to Donor"}
            </Button>
          )}

          {isAssignedToMe && collection.status === "HEADING_TO_DONOR" && (
            <Button
              size="sm"
              onClick={() => handleAdvanceMilestone("ARRIVED_AT_DONOR")}
              disabled={isSubmitting}
              className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : <MapPin className="size-3.5" />}
              {isSubmitting ? "Updating..." : "Arrived at Donor"}
            </Button>
          )}

          {isAssignedToMe && collection.status === "ARRIVED_AT_DONOR" && (
            <Button
              size="sm"
              onClick={() => handleAdvanceMilestone("PICKED_UP")}
              disabled={isSubmitting}
              className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
              {isSubmitting ? "Confirming..." : "Confirm Pickup"}
            </Button>
          )}

          {isAssignedToMe && (collection.status === "PICKED_UP" || collection.status === "COLLECTED") && (
            <Button
              size="sm"
              onClick={() => handleAdvanceMilestone("IN_TRANSIT")}
              disabled={isSubmitting}
              className="gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold"
            >
              {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : <Truck className="size-3.5" />}
              {isSubmitting ? "Updating..." : "Start Delivery (In Transit)"}
            </Button>
          )}

          {isAssignedToMe && collection.status === "IN_TRANSIT" && (
            <Button
              size="sm"
              onClick={() => handleAdvanceMilestone("ARRIVED_AT_NGO")}
              disabled={isSubmitting}
              className="gap-1.5 text-xs bg-sky-600 hover:bg-sky-700 text-white font-semibold"
            >
              {isSubmitting ? <Loader2 className="size-3.5 animate-spin" /> : <MapPin className="size-3.5" />}
              {isSubmitting ? "Updating..." : "Arrived at NGO"}
            </Button>
          )}

          {isAssignedToMe && collection.status === "ARRIVED_AT_NGO" && (
            <Link
              href={`/dashboard/volunteer/pickups/${collection._id}`}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary/90 transition-colors"
            >
              <CheckCircle2 className="size-3.5" />
              Submit Delivery Proof
            </Link>
          )}

          {(collection.status === "DELIVERED_TO_NGO" || collection.status === "NGO_CONFIRMED") && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="size-3.5" />
              Delivered to NGO
            </span>
          )}

          {collection.status === "HANDOFF_SUBMITTED" && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="size-3.5" />
              Delivered to NGO
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
