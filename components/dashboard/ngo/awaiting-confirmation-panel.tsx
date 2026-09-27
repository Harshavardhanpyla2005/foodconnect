"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  ExternalLink,
  Package,
  HeartHandshake,
} from "lucide-react"
import { ICollection, IDonation } from "@/types/database"
import { SubmitDistributionFormModal } from "./submit-distribution-form"

interface AwaitingConfirmationPanelProps {
  collections: ICollection[]
  donations: IDonation[]
  currentUserId: string
}

export function AwaitingConfirmationPanel({
  collections,
  donations,
  currentUserId,
}: AwaitingConfirmationPanelProps) {
  const router = useRouter()
  const [activePhotoModal, setActivePhotoModal] = React.useState<string | null>(null)

  const donationMap = React.useMemo(() => {
    return new Map(donations.map((d) => [d._id, d]))
  }, [donations])

  // Collections physically delivered to the NGO facility
  const deliveredCollections = React.useMemo(() => {
    return collections.filter(
      (c) =>
        c.status === "DELIVERED_TO_NGO" ||
        c.status === "HANDOFF_SUBMITTED" ||
        c.status === "NGO_CONFIRMED"
    )
  }, [collections])

  return (
    <section id="delivered-collections" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-foreground">
              Collections Delivered to NGO
            </h2>
            <span className="rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider">
              {deliveredCollections.length} Ready for Distribution
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Volunteer couriers have physically delivered these surplus food lots with photographic proof. Click Record Distribution to log community meal handover and submit evidence photos.
          </p>
        </div>
      </div>

      {deliveredCollections.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center bg-card/50">
          <Package className="mx-auto size-8 text-muted-foreground/40 mb-2" />
          <p className="text-sm font-medium text-foreground">No delivered collections ready for distribution yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            When volunteer couriers arrive at your facility and upload physical handoff photos, they will appear here ready for distribution.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deliveredCollections.map((col) => {
            const donation = donationMap.get(col.donationId)
            const proof = col.handoffProof

            return (
              <div
                key={col._id}
                className="rounded-2xl border border-emerald-500/30 bg-card p-5 shadow-xs space-y-4 hover:border-emerald-500/50 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-border pb-3">
                  <div>
                    <span className="font-bold text-sm text-foreground">
                      Task #{col._id.slice(-6)} • Delivered to NGO
                    </span>
                    <p className="text-xs text-foreground font-semibold mt-0.5">
                      {donation?.foodName || "Surplus Meal Batch"}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[0.65rem] font-bold uppercase">
                    Ready for Distribution
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-muted/40 p-2.5 space-y-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      Dietary &amp; Quantity
                    </span>
                    <div className="font-semibold text-foreground">
                      {donation?.vegNonVeg === "BOTH"
                        ? "Both (Veg & Non-Veg)"
                        : donation?.vegNonVeg === "NON_VEG"
                        ? "Non-Vegetarian"
                        : "Vegetarian"}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {donation?.quantity || 50} portions ({donation?.unit || "portions"})
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted/40 p-2.5 space-y-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      Volunteer Courier
                    </span>
                    <div className="font-semibold text-foreground">
                      Volunteer Responder
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {proof?.timestamp ? new Date(proof.timestamp).toLocaleString() : "Delivered"}
                    </div>
                  </div>
                </div>

                {/* Handoff Photo Evidence */}
                {proof?.photoUrl && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                      <Camera className="size-3 text-primary" />
                      Volunteer Physical Handoff Proof
                    </span>
                    <div className="flex items-center gap-3 rounded-xl border border-border p-2 bg-muted/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={proof.photoUrl}
                        alt="Volunteer Handover Proof"
                        className="size-16 rounded-lg object-cover border border-border cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setActivePhotoModal(proof.photoUrl)}
                      />
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <button
                          type="button"
                          onClick={() => setActivePhotoModal(proof.photoUrl)}
                          className="font-semibold text-primary hover:underline flex items-center gap-1"
                        >
                          View Full Proof Image <ExternalLink className="size-3" />
                        </button>
                        {proof.notes && (
                          <div className="text-foreground text-[11px]">
                            &ldquo;{proof.notes}&rdquo;
                          </div>
                        )}
                        {proof.location?.latitude && (
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <MapPin className="size-3 text-emerald-500" />
                            GPS: {proof.location.latitude.toFixed(4)}, {proof.location.longitude?.toFixed(4)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Direct Action: Record Distribution */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                    Delivery verified
                  </span>
                  <SubmitDistributionFormModal
                    confirmedCollections={[col]}
                    donations={donations}
                    preselectedCollectionId={col._id}
                    buttonText="Record Distribution"
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Full Photo Modal */}
      {activePhotoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
          onClick={() => setActivePhotoModal(null)}
        >
          <div
            className="relative max-w-2xl max-h-[90vh] bg-card rounded-2xl p-4 border border-border space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-sm font-bold text-foreground">Volunteer Handoff Photographic Proof</span>
              <button
                type="button"
                onClick={() => setActivePhotoModal(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold px-2 py-1 rounded-md"
              >
                ✕ Close
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activePhotoModal}
              alt="Full handoff proof"
              className="max-h-[75vh] w-auto mx-auto rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </section>
  )
}
