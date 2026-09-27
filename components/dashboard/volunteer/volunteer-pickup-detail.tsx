"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  Camera,
  Upload,
  AlertCircle,
  Navigation,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ICollection, IDonation, INGOProfile, CollectionStatus } from "@/types/database"
import {
  updateCollectionProgressAction,
  submitHandoffProofAction,
  updateVolunteerLocationAction,
} from "@/app/actions/volunteer"
import { DynamicDeliveryMap } from "@/components/maps/DynamicDeliveryMap"

interface VolunteerPickupDetailProps {
  collection: ICollection
  donation: IDonation | null
  ngo?: Partial<INGOProfile> | null
  volunteer: {
    _id: string
    name: string
    email: string
  }
}

export function VolunteerPickupDetail({
  collection: initialCollection,
  donation,
  ngo,
  volunteer,
}: VolunteerPickupDetailProps) {
  const [collection, setCollection] = React.useState<ICollection>(initialCollection)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null)

  // Geolocation state
  const [gpsStatus, setGpsStatus] = React.useState<"idle" | "tracking" | "denied" | "unavailable">("idle")
  const [currentCoords, setCurrentCoords] = React.useState<{
    latitude: number
    longitude: number
    accuracy?: number
  } | null>(collection.currentLocation ? {
    latitude: collection.currentLocation.latitude,
    longitude: collection.currentLocation.longitude,
    accuracy: collection.currentLocation.accuracy,
  } : null)

  // Handoff proof form state
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [handoffNotes, setHandoffNotes] = React.useState("")
  const [uploadProgress, setUploadProgress] = React.useState(false)

  // GPS Watcher Setup
  React.useEffect(() => {
    if (!("geolocation" in navigator)) {
      const timer = setTimeout(() => setGpsStatus("unavailable"), 0)
      return () => clearTimeout(timer)
    }

    // Only track if collection is in active transit
    const terminalStates = ["NGO_CONFIRMED", "DISTRIBUTED", "EVIDENCE_REVIEW", "VERIFIED", "CLOSED", "CANCELLED"]
    if (terminalStates.includes(collection.status)) {
      const timer = setTimeout(() => setGpsStatus("idle"), 0)
      return () => clearTimeout(timer)
    }

    let watchId: number | null = null

    const handleSuccess = async (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = pos.coords
      setCurrentCoords({ latitude, longitude, accuracy })
      setGpsStatus("tracking")

      // Send update to authenticated API endpoint
      try {
        await fetch(`/api/collections/${collection._id}/location`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude, longitude, accuracy }),
        })
      } catch (err) {
        console.warn("Could not post live GPS coordinates:", err)
      }
    }

    const handleError = (error: GeolocationPositionError) => {
      if (error.code === error.PERMISSION_DENIED) {
        setGpsStatus("denied")
      } else {
        setGpsStatus("unavailable")
      }
    }

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
    })

    watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 15000,
    })

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [collection._id, collection.status])

  // Photo selection handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setFeedback({ type: "error", text: "Please select an image file (JPEG, PNG, or WEBP)." })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setFeedback({ type: "error", text: "Image file exceeds 10MB limit." })
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Milestone advance
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
      if (res.collection) {
        setCollection(res.collection)
      } else {
        setCollection((prev) => ({ ...prev, status: nextStatus }))
      }
      setFeedback({ type: "success", text: `✓ Milestone updated: ${nextStatus.replace(/_/g, " ")}` })
    } catch (err) {
      console.error(err)
      setFeedback({ type: "error", text: "Network error updating transit state." })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Submit Handoff Proof via real multipart upload
  const handleSubmitHandoff = async () => {
    if (!selectedFile) {
      setFeedback({ type: "error", text: "Please take or select a physical handoff photo." })
      return
    }

    setIsSubmitting(true)
    setUploadProgress(true)
    setFeedback(null)

    try {
      // 1. Multipart upload to /api/media/evidence
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("category", "handoff")
      formData.append("collectionId", collection._id)

      const uploadRes = await fetch("/api/media/evidence", {
        method: "POST",
        body: formData,
      })

      const uploadData = await uploadRes.json().catch(() => null)

      if (!uploadRes.ok || !uploadData?.success) {
        setFeedback({
          type: "error",
          text: uploadData?.error || "Failed to upload handoff proof image.",
        })
        setIsSubmitting(false)
        setUploadProgress(false)
        return
      }

      const photoUrl = uploadData.mediaUrl
      const sha256Checksum = uploadData.sha256Checksum
      const fileSizeBytes = uploadData.fileSizeBytes

      // 2. Submit handoff proof action
      const handoffRes = await submitHandoffProofAction({
        collectionId: collection._id,
        photoUrl,
        notes: handoffNotes.trim() || undefined,
        location: currentCoords || undefined,
        fileSizeBytes,
        sha256Checksum,
      })

      if (!handoffRes.success) {
        setFeedback({ type: "error", text: handoffRes.message || "Failed to finalize handoff proof." })
        setIsSubmitting(false)
        setUploadProgress(false)
        return
      }

      if (handoffRes.collection) {
        setCollection(handoffRes.collection)
      } else {
        setCollection((prev) => ({
          ...prev,
          status: "DELIVERED_TO_NGO",
          handoffProof: {
            photoUrl,
            timestamp: new Date(),
            notes: handoffNotes,
            location: currentCoords || undefined,
            fileSizeBytes,
            sha256Checksum,
          },
        }))
      }

      setFeedback({
        type: "success",
        text: "✓ Delivery completed successfully! Food marked as Delivered to NGO.",
      })
    } catch (err) {
      console.error("Handoff submission error:", err)
      setFeedback({ type: "error", text: "Unexpected network error during proof submission." })
    } finally {
      setIsSubmitting(false)
      setUploadProgress(false)
    }
  }

  // Determine stage progression index for the 7 courier milestones
  const stages: { status: CollectionStatus; label: string; desc: string }[] = [
    { status: "CLAIMED", label: "Claimed", desc: "Assigned to courier" },
    { status: "HEADING_TO_DONOR", label: "Heading to Donor", desc: "Navigating to donor kitchen" },
    { status: "ARRIVED_AT_DONOR", label: "At Donor", desc: "Arrived at donor location" },
    { status: "PICKED_UP", label: "Food Picked Up", desc: "Food received into custody" },
    { status: "IN_TRANSIT", label: "In Transit", desc: "Delivering to recipient NGO" },
    { status: "ARRIVED_AT_NGO", label: "At NGO", desc: "Arrived at NGO facility" },
    { status: "DELIVERED_TO_NGO", label: "Delivered to NGO", desc: "Delivery completed & proof captured" },
  ]

  const statusToIdx: Record<string, number> = {
    ASSIGNED: 0,
    CLAIMED: 0,
    HEADING_TO_DONOR: 1,
    ARRIVED_AT_DONOR: 2,
    PICKED_UP: 3,
    COLLECTED: 3,
    IN_TRANSIT: 4,
    ARRIVED_AT_NGO: 5,
    HANDOFF_SUBMITTED: 6,
    DELIVERED_TO_NGO: 6,
    NGO_CONFIRMED: 6,
    DISTRIBUTED: 6,
    EVIDENCE_REVIEW: 6,
    VERIFIED: 6,
    CLOSED: 6,
  }

  const currentIdx = statusToIdx[collection.status] ?? 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/volunteer"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium"
        >
          <ArrowLeft className="size-4" />
          Back to Dispatch Board
        </Link>
        <span className="text-xs font-mono text-muted-foreground">
          Task #{collection._id.slice(-6)}
        </span>
      </div>

      {/* Main Mission Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">
                Operational Collection Delivery
              </h1>
              <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                {collection.status.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Food Lot: {donation?.foodName || "Surplus Meals"} •{" "}
              {donation?.quantity || 50} Portions (
              {donation?.vegNonVeg === "BOTH"
                ? "Veg & Non-Veg"
                : donation?.vegNonVeg === "NON_VEG"
                ? "Non-Vegetarian"
                : "Vegetarian"}
              )
            </p>
          </div>

          {/* GPS Tracking Badge */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {gpsStatus === "tracking" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1 text-xs font-semibold">
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                </span>
                GPS Active
              </span>
            )}
            {gpsStatus === "denied" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-3 py-1 text-xs font-semibold">
                <AlertCircle className="size-3.5" />
                Live location unavailable (Manual Mode)
              </span>
            )}
            {gpsStatus === "unavailable" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted text-muted-foreground px-3 py-1 text-xs">
                GPS sensor offline
              </span>
            )}
          </div>
        </div>

        {/* Milestone Progression Stepper */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Delivery Lifecycle Pipeline</span>
            <span className="text-primary font-bold">{Math.round(((currentIdx + 1) / stages.length) * 100)}% Complete</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {stages.map((stage, idx) => {
              const isPast = idx < currentIdx
              const isCurrent = idx === currentIdx
              return (
                <div
                  key={stage.status}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isCurrent
                      ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30"
                      : isPast
                      ? "border-emerald-500/30 bg-emerald-500/5 text-muted-foreground"
                      : "border-border/60 bg-muted/20 opacity-60"
                  }`}
                >
                  <div className="flex justify-center mb-1">
                    {isPast ? (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    ) : isCurrent ? (
                      <Truck className="size-4 text-primary animate-pulse" />
                    ) : (
                      <Clock className="size-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className={`text-[11px] font-bold truncate ${isCurrent ? "text-primary" : "text-foreground"}`}>
                    {stage.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Live Delivery Map - shown only for active (non-terminal) collections */}
        {!["DELIVERED_TO_NGO", "NGO_CONFIRMED", "DISTRIBUTED", "EVIDENCE_REVIEW", "VERIFIED", "CLOSED", "CANCELLED"].includes(collection.status) && (
          <div className="rounded-xl overflow-hidden border border-border">
            <DynamicDeliveryMap
              collection={collection}
              donation={donation}
              ngo={ngo}
              hasGps={gpsStatus === "tracking"}
              lastGpsUpdate={currentCoords ? new Date() : null}
              height="h-[300px] sm:h-[360px]"
              showControls={false}
            />
          </div>
        )}

        {/* Corridor Addresses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Pickup Origin (Donor)
              </span>
              <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full font-semibold">
                Step 1
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="size-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-sm text-foreground">
                  {collection.pickupAddress.street}
                </div>
                <div className="text-xs text-muted-foreground">
                  {collection.pickupAddress.area}, {collection.pickupAddress.city}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Destination (Verified NGO)
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-semibold">
                Step 2
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="size-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-sm text-foreground">
                  Verified NGO Receiving Bay
                </div>
                <div className="text-xs text-muted-foreground">
                  Visakhapatnam Operational Corridor
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs font-medium ${
              feedback.type === "success"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-destructive/10 text-destructive border border-destructive/20"
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Contextual Action Button Area */}
        <div className="pt-2 border-t border-border">
          {/* 1. CLAIMED / ASSIGNED -> HEADING_TO_DONOR */}
          {(collection.status === "CLAIMED" || collection.status === "ASSIGNED") && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                Ready to collect? Confirm when you are on your way to the donor kitchen.
              </div>
              <Button
                onClick={() => handleAdvanceMilestone("HEADING_TO_DONOR")}
                disabled={isSubmitting}
                className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground font-semibold"
              >
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Navigation className="size-4" />}
                Start Journey to Donor
              </Button>
            </div>
          )}

          {/* 2. HEADING_TO_DONOR -> ARRIVED_AT_DONOR */}
          {collection.status === "HEADING_TO_DONOR" && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                You are heading to {collection.pickupAddress.area}. Tap below once you reach the venue.
              </div>
              <Button
                onClick={() => handleAdvanceMilestone("ARRIVED_AT_DONOR")}
                disabled={isSubmitting}
                className="w-full sm:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />}
                Arrived at Donor Venue
              </Button>
            </div>
          )}

          {/* 3. ARRIVED_AT_DONOR -> PICKED_UP */}
          {collection.status === "ARRIVED_AT_DONOR" && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                Inspect container seals and temperature, then confirm pickup into custody.
              </div>
              <Button
                onClick={() => handleAdvanceMilestone("PICKED_UP")}
                disabled={isSubmitting}
                className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                Confirm Pickup (Food Collected)
              </Button>
            </div>
          )}

          {/* 4. PICKED_UP / COLLECTED -> IN_TRANSIT */}
          {(collection.status === "PICKED_UP" || collection.status === "COLLECTED") && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                Food safely stowed in insulated carrier box. Start delivery toward the recipient NGO.
              </div>
              <Button
                onClick={() => handleAdvanceMilestone("IN_TRANSIT")}
                disabled={isSubmitting}
                className="w-full sm:w-auto gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold"
              >
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Truck className="size-4" />}
                Start Delivery (In Transit to NGO)
              </Button>
            </div>
          )}

          {/* 5. IN_TRANSIT -> ARRIVED_AT_NGO */}
          {collection.status === "IN_TRANSIT" && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                En route to recipient NGO receiving facility. Confirm once you have arrived.
              </div>
              <Button
                onClick={() => handleAdvanceMilestone("ARRIVED_AT_NGO")}
                disabled={isSubmitting}
                className="w-full sm:w-auto gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold"
              >
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />}
                Arrived at Recipient NGO
              </Button>
            </div>
          )}

          {/* 6. ARRIVED_AT_NGO -> Physical Handoff Proof Form */}
          {collection.status === "ARRIVED_AT_NGO" && (
            <div className="space-y-4 pt-2">
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                  <Camera className="size-4 text-primary" />
                  Capture Physical Handover Proof at Recipient NGO
                </div>
                <p className="text-xs text-muted-foreground">
                  Please capture or select a real photo of the food containers being handed over to NGO staff.
                  GPS coordinates and timestamp will be cryptographically tagged.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* File picker */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-foreground">
                    Physical Handover Photo (JPEG, PNG, WEBP)
                  </label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-colors bg-card">
                    <Camera className="size-8 text-muted-foreground mb-2" />
                    <span className="text-xs font-medium text-foreground">
                      {selectedFile ? selectedFile.name : "Tap to capture or choose photo"}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      Max file size: 10MB • Genuine evidence required
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Preview & Notes */}
                <div className="space-y-3">
                  {previewUrl ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-black/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Handover preview"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-md font-mono">
                        {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-xl border border-border/60 bg-muted/20 flex flex-col items-center justify-center text-xs text-muted-foreground">
                      <span>Photo preview will appear here</span>
                    </div>
                  )}

                  <textarea
                    placeholder="Handover notes (e.g. Received by Sister Mary at kitchen bay, 5 hot trays intact)..."
                    value={handoffNotes}
                    onChange={(e) => setHandoffNotes(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSubmitHandoff}
                  disabled={isSubmitting || !selectedFile}
                  className="gap-2 bg-primary text-primary-foreground font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Uploading Evidence ({uploadProgress ? "Hashing & Saving..." : "Finalizing..."})
                    </>
                  ) : (
                    <>
                      <Upload className="size-4" />
                      SUBMIT DELIVERY PROOF
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* 7. DELIVERY COMPLETED -> DELIVERED_TO_NGO */}
          {["DELIVERED_TO_NGO", "HANDOFF_SUBMITTED", "NGO_CONFIRMED", "DISTRIBUTED", "EVIDENCE_REVIEW", "VERIFIED", "CLOSED"].includes(collection.status) && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-4 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-base font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-5" />
                    ✓ DELIVERY COMPLETED
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Physical handover proof uploaded. The food rescue task is complete and marked as Delivered to NGO.
                  </p>
                </div>
                <span className="self-start sm:self-auto text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  DELIVERED TO NGO
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-emerald-500/20 text-xs">
                <div className="space-y-1">
                  <div className="text-muted-foreground">Delivered to:</div>
                  <div className="font-bold text-sm text-foreground">{ngo?.ngoName || "Recipient NGO Facility"}</div>
                  <div className="text-muted-foreground">{ngo?.address?.area || "Visakhapatnam"}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-muted-foreground">Delivered at:</div>
                  <div className="font-semibold text-foreground">
                    {collection.handoffProof?.timestamp
                      ? new Date(collection.handoffProof.timestamp).toLocaleString()
                      : new Date().toLocaleString()}
                  </div>
                  {collection.handoffProof?.location && (
                    <div className="text-[10px] text-muted-foreground font-mono">
                      GPS: {collection.handoffProof.location.latitude?.toFixed(4)}, {collection.handoffProof.location.longitude?.toFixed(4)}
                    </div>
                  )}
                </div>
              </div>

              {collection.handoffProof && (
                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {collection.handoffProof.photoUrl && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-muted-foreground block">Evidence:</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={collection.handoffProof.photoUrl}
                        alt="Submitted handoff proof"
                        className="size-24 rounded-lg object-cover border border-border shadow-xs"
                      />
                    </div>
                  )}
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {collection.handoffProof.notes && (
                      <div>
                        <span className="font-semibold text-foreground">Notes: </span>
                        {collection.handoffProof.notes}
                      </div>
                    )}
                    {collection.handoffProof.sha256Checksum && (
                      <div className="font-mono text-[10px]">
                        SHA-256: {collection.handoffProof.sha256Checksum.slice(0, 16)}...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
