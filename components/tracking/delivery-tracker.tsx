"use client"

import * as React from "react"
import Link from "next/link"
import {
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  Navigation,
  ShieldCheck,
  AlertCircle,
  Building2,
  Package,
  ArrowRight,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ICollection, IDonation, INGOProfile } from "@/types/database"
import { DynamicDeliveryMap } from "@/components/maps/DynamicDeliveryMap"

interface DeliveryTrackerProps {
  initialCollection: ICollection
  donation: Partial<IDonation> | null
  ngo: Partial<INGOProfile> | null
  userRole: "DONOR" | "NGO" | "VOLUNTEER" | "ADMIN"
}

export function DeliveryTracker({
  initialCollection,
  donation,
  ngo,
  userRole,
}: DeliveryTrackerProps) {
  const [collection, setCollection] = React.useState<ICollection>(initialCollection)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [lastRefreshed, setLastRefreshed] = React.useState<Date>(new Date())

  // Poll for updates if in active transit
  React.useEffect(() => {
    const isFinished = [
      "DELIVERED_TO_NGO",
      "NGO_CONFIRMED",
      "DISTRIBUTED",
      "VERIFIED",
      "CLOSED",
      "CANCELLED",
    ].includes(collection.status)
    if (isFinished) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/collections/${collection._id}`)
        if (res.ok) {
          const data = await res.json()
          if (data.collection) {
            setCollection(data.collection)
            setLastRefreshed(new Date())
          }
        }
      } catch (err) {
        console.warn("Polling collection tracking update failed:", err)
      }
    }, 6000)

    return () => clearInterval(interval)
  }, [collection._id, collection.status])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    try {
      const res = await fetch(`/api/collections/${collection._id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.collection) {
          setCollection(data.collection)
          setLastRefreshed(new Date())
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsRefreshing(false)
    }
  }

  // 5 Delivery Stages:
  // Donor Pickup -> Collected -> In Transit -> Arrived at NGO -> Delivered to NGO
  const stages = [
    {
      id: "pickup",
      label: "Donor Pickup",
      desc: "Courier dispatched to donor kitchen",
      isDone: [
        "ARRIVED_AT_DONOR",
        "PICKED_UP",
        "COLLECTED",
        "IN_TRANSIT",
        "ARRIVED_AT_NGO",
        "DELIVERED_TO_NGO",
        "HANDOFF_SUBMITTED",
        "NGO_CONFIRMED",
        "DISTRIBUTED",
        "VERIFIED",
        "CLOSED",
      ].includes(collection.status),
      isCurrent:
        collection.status === "ASSIGNED" ||
        collection.status === "CLAIMED" ||
        collection.status === "HEADING_TO_DONOR",
    },
    {
      id: "collected",
      label: "Food Collected",
      desc: "Custody loaded into carrier box",
      isDone: [
        "PICKED_UP",
        "COLLECTED",
        "IN_TRANSIT",
        "ARRIVED_AT_NGO",
        "DELIVERED_TO_NGO",
        "HANDOFF_SUBMITTED",
        "NGO_CONFIRMED",
        "DISTRIBUTED",
        "VERIFIED",
        "CLOSED",
      ].includes(collection.status),
      isCurrent:
        collection.status === "ARRIVED_AT_DONOR" ||
        collection.status === "PICKED_UP" ||
        collection.status === "COLLECTED",
    },
    {
      id: "transit",
      label: "In Transit",
      desc: "Moving along corridor to NGO",
      isDone: [
        "ARRIVED_AT_NGO",
        "DELIVERED_TO_NGO",
        "HANDOFF_SUBMITTED",
        "NGO_CONFIRMED",
        "DISTRIBUTED",
        "VERIFIED",
        "CLOSED",
      ].includes(collection.status),
      isCurrent: collection.status === "IN_TRANSIT",
    },
    {
      id: "arrived",
      label: "Arrived at NGO",
      desc: "Courier at facility receiving bay",
      isDone: [
        "DELIVERED_TO_NGO",
        "HANDOFF_SUBMITTED",
        "NGO_CONFIRMED",
        "DISTRIBUTED",
        "VERIFIED",
        "CLOSED",
      ].includes(collection.status),
      isCurrent: collection.status === "ARRIVED_AT_NGO",
    },
    {
      id: "delivered",
      label: "Delivered to NGO",
      desc: "Custody transferred & proof uploaded",
      isDone: [
        "DELIVERED_TO_NGO",
        "HANDOFF_SUBMITTED",
        "NGO_CONFIRMED",
        "DISTRIBUTED",
        "VERIFIED",
        "CLOSED",
      ].includes(collection.status),
      isCurrent: [
        "DELIVERED_TO_NGO",
        "HANDOFF_SUBMITTED",
        "NGO_CONFIRMED",
        "DISTRIBUTED",
        "VERIFIED",
        "CLOSED",
      ].includes(collection.status),
    },
  ]

  const hasGps = Boolean(
    collection.currentLocation?.latitude && collection.currentLocation?.longitude
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">
              Live Delivery &amp; Custody Radar
            </h1>
            <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider">
              {collection.status.replace(/_/g, " ")}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
            <span>Task #{collection._id.slice(-6)}</span>
            <span>•</span>
            <span>
              Food: {donation?.foodName || "Surplus Meals"} (
              {donation?.vegNonVeg === "BOTH"
                ? "Both Veg & Non-Veg"
                : donation?.vegNonVeg || "VEG"}
              )
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="text-xs gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {userRole === "VOLUNTEER" && (
            <Link href={`/dashboard/volunteer/pickups/${collection._id}`}>
              <Button
                size="sm"
                className="text-xs gap-1 bg-primary text-primary-foreground font-semibold"
              >
                Operational View &rarr;
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Responsive Grid: Map 60% (col-span-7) on desktop, Side Panel 40% (col-span-5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Column (Desktop 58%, Mobile 100% first) */}
        <div className="lg:col-span-7 w-full">
          <DynamicDeliveryMap
            collection={collection}
            donation={donation}
            ngo={ngo}
            hasGps={hasGps}
            lastGpsUpdate={lastRefreshed}
          />
        </div>

        {/* Side Panel Column (Desktop 42%, Mobile follows map) */}
        <div className="lg:col-span-5 space-y-4 w-full">
          {/* Corridor Origin & Destination Card */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Navigation className="size-3.5 text-primary" />
                Transit Corridor
              </span>
              <span
                suppressHydrationWarning
                className="text-[10px] text-muted-foreground font-mono"
              >
                Sync: {lastRefreshed.toLocaleTimeString()}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Origin */}
              <div className="flex items-start gap-3">
                <div className="size-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0 mt-0.5">
                  <MapPin className="size-3.5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                    Origin: Donor Pickup
                  </div>
                  <div className="font-semibold text-sm text-foreground">
                    {collection.pickupAddress.street}
                  </div>
                  <div className="text-muted-foreground">
                    {collection.pickupAddress.area}, {collection.pickupAddress.city}
                  </div>
                </div>
              </div>

              {/* Destination */}
              <div className="flex items-start gap-3 pt-2 border-t border-border/60">
                <div className="size-6 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500 shrink-0 mt-0.5">
                  <Building2 className="size-3.5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                    Destination: Recipient NGO
                  </div>
                  <div className="font-semibold text-sm text-foreground">
                    {ngo?.ngoName || "Verified NGO Facility"}
                  </div>
                  <div className="text-muted-foreground">
                    {ngo?.address?.area || "Visakhapatnam"}, Receiving Dock
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5-Stage Status Timeline Card */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Delivery Milestones
            </div>

            <div className="space-y-2">
              {stages.map((st) => (
                <div
                  key={st.id}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    st.isCurrent
                      ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30"
                      : st.isDone
                      ? "border-emerald-500/30 bg-emerald-500/5 text-muted-foreground"
                      : "border-border/60 bg-muted/20 opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex justify-center shrink-0">
                      {st.isDone ? (
                        <CheckCircle2 className="size-4 text-emerald-500" />
                      ) : st.isCurrent ? (
                        <Truck className="size-4 text-primary animate-pulse" />
                      ) : (
                        <Clock className="size-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div
                        className={`text-xs font-bold ${
                          st.isCurrent ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {st.label}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {st.desc}
                      </p>
                    </div>
                  </div>

                  {st.isDone && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Done
                    </span>
                  )}
                  {st.isCurrent && (
                    <span className="text-[10px] font-bold text-primary bg-primary/15 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Volunteer Physical Handoff Proof Card */}
          {collection.handoffProof && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="size-4" />
                  Volunteer Physical Handoff Proof
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Delivered to NGO
                </span>
              </div>

              <div className="flex items-start gap-4 text-xs text-muted-foreground">
                {collection.handoffProof.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={collection.handoffProof.photoUrl}
                    alt="Physical Handoff Proof"
                    className="size-20 rounded-xl object-cover border border-border shadow-xs shrink-0"
                  />
                )}
                <div className="space-y-1">
                  <div>
                    <span className="font-semibold text-foreground">Delivered: </span>
                    {new Date(collection.handoffProof.timestamp).toLocaleString()}
                  </div>
                  {collection.handoffProof.notes && (
                    <div>
                      <span className="font-semibold text-foreground">Notes: </span>
                      &ldquo;{collection.handoffProof.notes}&rdquo;
                    </div>
                  )}
                  {collection.handoffProof.location && (
                    <div className="text-[10px] font-mono text-zinc-400">
                      GPS: {collection.handoffProof.location.latitude?.toFixed(4)},{" "}
                      {collection.handoffProof.location.longitude?.toFixed(4)}
                    </div>
                  )}
                  <div className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 pt-1">
                    <CheckCircle2 className="size-3.5" />
                    Delivery Completed into NGO Care
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
