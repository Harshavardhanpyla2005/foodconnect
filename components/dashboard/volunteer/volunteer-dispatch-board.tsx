"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DynamicDeliveryMap } from "@/components/maps/DynamicDeliveryMap"
import {
  Truck,
  CheckCircle2,
  Clock,
  Package,
  Sparkles,
  MapPin,
  ShieldCheck,
  Navigation,
  Radio,
  Loader2,
} from "lucide-react"
import { PageHeading, SectionHeading, BodyText, MetricValue, LabelText } from "@/components/ui/typography"
import { MotionSection, MotionCardInteractive } from "@/components/ui/motion-primitives"
import { CollectionTaskCard } from "@/components/dashboard/volunteer/collection-task-card"
import { ICollection, IDonation, INGOProfile, IUser } from "@/types/database"

interface VolunteerDispatchBoardProps {
  initialCollections: ICollection[]
  donations: IDonation[]
  ngos?: INGOProfile[]
  user: Pick<IUser, "_id" | "name" | "email" | "role">
}

export function VolunteerDispatchBoard({
  initialCollections,
  donations,
  ngos = [],
  user,
}: VolunteerDispatchBoardProps) {
  const router = useRouter()
  const [collections, setCollections] = React.useState<ICollection[]>(initialCollections)
  const [isLocating, setIsLocating] = React.useState(false)
  const [gpsFeedback, setGpsFeedback] = React.useState<{
    type: "success" | "error" | "denied"
    message: string
  } | null>(null)

  // Keep collections in sync if initialCollections changes from RSC refresh
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setCollections(initialCollections)
    }, 0)
    return () => clearTimeout(timer)
  }, [initialCollections])

  const donationMap = React.useMemo(() => {
    return new Map(donations.map((d) => [d._id, d]))
  }, [donations])

  const ngoMap = React.useMemo(() => {
    return new Map(ngos.map((n) => [n._id, n]))
  }, [ngos])

  // Tasks available for atomic claiming (no volunteer assigned yet, status ASSIGNED)
  const availableTasks = React.useMemo(() => {
    return collections.filter((c) => !c.volunteerId && c.status === "ASSIGNED")
  }, [collections])

  // Tasks assigned to this volunteer (including demo seed volunteer)
  const isDemoCourier =
    user.email === "rajesh.courier@foodconnect.demo" ||
    user.email === "rajesh.kumar@courier.demo"

  const myTasks = React.useMemo(() => {
    return collections.filter(
      (c) =>
        c.volunteerId === user._id || (isDemoCourier && c.volunteerId === "usr-vol-01")
    )
  }, [collections, user._id, isDemoCourier])

  const activeTasks = React.useMemo(() => {
    return myTasks.filter((c) => c.status !== "COLLECTED" && c.status !== "CANCELLED")
  }, [myTasks])

  const completedTasks = React.useMemo(() => {
    return myTasks.filter((c) => c.status === "COLLECTED")
  }, [myTasks])

  // Primary active pickup for live tracking radar
  const primaryActiveTask = activeTasks.length > 0 ? activeTasks[0] : null
  const activeDonation = primaryActiveTask ? donationMap.get(primaryActiveTask.donationId) : null
  const activeNgo = primaryActiveTask ? ngoMap.get(primaryActiveTask.ngoId) : null

  const [lastGpsUpdate, setLastGpsUpdate] = React.useState<Date | null>(() => {
    if (primaryActiveTask?.currentLocation?.updatedAt) {
      return new Date(primaryActiveTask.currentLocation.updatedAt)
    }
    return null
  })

  // Dynamic Metrics
  const activeCount = activeTasks.length
  const completedCount = completedTasks.length
  const mealsTransported = React.useMemo(() => {
    return completedTasks.reduce((sum, c) => {
      const don = donationMap.get(c.donationId)
      return sum + (don?.quantity || 0)
    }, 0)
  }, [completedTasks, donationMap])

  const handleUseMyLocation = React.useCallback(() => {
    if (!primaryActiveTask) return

    if (!navigator.geolocation) {
      setGpsFeedback({
        type: "error",
        message: "Live GPS is not supported by your browser.",
      })
      return
    }

    setIsLocating(true)
    setGpsFeedback(null)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude, accuracy } = pos.coords
          const res = await fetch(`/api/collections/${primaryActiveTask._id}/location`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude, longitude, accuracy }),
          })

          if (!res.ok) {
            const data = await res.json().catch(() => null)
            throw new Error(data?.error || "Failed to update GPS location on server")
          }

          const data = await res.json()
          const now = new Date()
          setLastGpsUpdate(now)
          setGpsFeedback({
            type: "success",
            message: `Live GPS synchronized (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          })

          if (data.collection) {
            setCollections((prev) =>
              prev.map((c) => (c._id === data.collection._id ? data.collection : c))
            )
          }
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : "Failed to update GPS location"
          setGpsFeedback({
            type: "error",
            message: errorMsg,
          })
        } finally {
          setIsLocating(false)
        }
      },
      (geoError) => {
        setIsLocating(false)
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setGpsFeedback({
            type: "denied",
            message: "Live GPS unavailable. Permission was denied. You can continue updating status manually.",
          })
        } else {
          setGpsFeedback({
            type: "error",
            message: "Live GPS unavailable. Unable to determine your location.",
          })
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [primaryActiveTask])

  const handleTaskUpdated = React.useCallback(
    (updatedTask?: ICollection) => {
      if (updatedTask) {
        setCollections((prev) => {
          const exists = prev.some((c) => c._id === updatedTask._id)
          if (exists) {
            return prev.map((c) => (c._id === updatedTask._id ? updatedTask : c))
          }
          return [updatedTask, ...prev]
        })
      }
      // Revalidate Server Components in the background
      router.refresh()
    },
    [router]
  )

  return (
    <div className="space-y-8">
      {/* Volunteer Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <PageHeading className="text-2xl font-bold text-foreground">
              {user.name}
            </PageHeading>
            <span className="rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20 px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1">
              <Truck className="size-3" />
              Volunteer Courier
            </span>
          </div>
          <BodyText size="sm" className="mt-1 text-muted-foreground flex items-center gap-2">
            <MapPin className="size-3.5 text-primary" />
            Visakhapatnam Operational Corridor • Vehicle: Two-Wheeler / Insulated Bag
          </BodyText>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-emerald-600" />
          <span>Food Safety Trained • Active Responder</span>
        </div>
      </div>

      {/* 1. Overview Metrics Cards */}
      <MotionSection delay={0.1} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MotionCardInteractive className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <LabelText className="text-xs uppercase tracking-wider font-semibold">Active In-Custody</LabelText>
            <Clock className="size-4 text-amber-500" />
          </div>
          <MetricValue className="text-3xl font-extrabold text-foreground mt-2">{activeCount}</MetricValue>
          <p className="text-xs text-muted-foreground mt-1">Pickups claimed or en route</p>
        </MotionCardInteractive>

        <MotionCardInteractive className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <LabelText className="text-xs uppercase tracking-wider font-semibold">Available Tasks</LabelText>
            <Package className="size-4 text-sky-500" />
          </div>
          <MetricValue className="text-3xl font-extrabold text-foreground mt-2">{availableTasks.length}</MetricValue>
          <p className="text-xs text-muted-foreground mt-1">Open for instant atomic claim</p>
        </MotionCardInteractive>

        <MotionCardInteractive className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <LabelText className="text-xs uppercase tracking-wider font-semibold">Completed Handouts</LabelText>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <MetricValue className="text-3xl font-extrabold text-foreground mt-2">{completedCount}</MetricValue>
          <p className="text-xs text-muted-foreground mt-1">Safely delivered to verified NGOs</p>
        </MotionCardInteractive>

        <MotionCardInteractive className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <LabelText className="text-xs uppercase tracking-wider font-semibold">Meals Transported</LabelText>
            <Sparkles className="size-4 text-primary" />
          </div>
          <MetricValue className="text-3xl font-extrabold text-foreground mt-2">{mealsTransported}</MetricValue>
          <p className="text-xs text-muted-foreground mt-1">Total portions in completed runs</p>
        </MotionCardInteractive>
      </MotionSection>

      {/* Prominent ACTIVE PICKUP Section with Live Map */}
      {primaryActiveTask && (
        <section id="active-pickup-map" className="space-y-4">
          <div className="rounded-2xl border border-primary/30 bg-card p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    ACTIVE PICKUP
                  </span>
                  <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    {primaryActiveTask.status.replace(/_/g, " ")}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground mt-0.5">
                  {activeDonation?.foodName || "Surplus Food Rescue"}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUseMyLocation}
                  disabled={
                    isLocating ||
                    [
                      "DELIVERED_TO_NGO",
                      "NGO_CONFIRMED",
                      "DISTRIBUTED",
                      "VERIFIED",
                      "CLOSED",
                      "CANCELLED",
                    ].includes(primaryActiveTask.status)
                  }
                  className="text-xs gap-1.5 h-8 font-medium"
                >
                  {isLocating ? (
                    <Loader2 className="size-3.5 animate-spin text-primary" />
                  ) : (
                    <Radio className="size-3.5 text-emerald-500" />
                  )}
                  {isLocating ? "Syncing GPS..." : "Use My Location"}
                </Button>

                <Link href={`/track/${primaryActiveTask._id}`}>
                  <Button
                    size="sm"
                    className="text-xs gap-1.5 h-8 bg-primary text-primary-foreground font-semibold"
                  >
                    <Navigation className="size-3.5" />
                    Open Full Tracking
                  </Button>
                </Link>
              </div>
            </div>

            {gpsFeedback && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
                  gpsFeedback.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                    : gpsFeedback.type === "denied"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
                    : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400"
                }`}
              >
                <span>{gpsFeedback.message}</span>
                <button
                  type="button"
                  onClick={() => setGpsFeedback(null)}
                  className="font-bold ml-2 opacity-70 hover:opacity-100"
                >
                  &times;
                </button>
              </div>
            )}

            {/* Dynamic Interactive Delivery Map */}
            <div className="w-full rounded-xl overflow-hidden border border-border">
              <DynamicDeliveryMap
                collection={primaryActiveTask}
                donation={activeDonation}
                ngo={activeNgo}
                hasGps={Boolean(
                  primaryActiveTask.currentLocation?.latitude &&
                    primaryActiveTask.currentLocation?.longitude
                )}
                lastGpsUpdate={lastGpsUpdate}
                height="h-[340px] sm:h-[400px]"
              />
            </div>

            {/* Pickup & Destination & Status Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="rounded-xl bg-muted/40 p-3 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                  <MapPin className="size-3" /> Pickup
                </span>
                <p className="font-semibold text-foreground truncate">
                  {primaryActiveTask.pickupAddress.street ||
                    primaryActiveTask.pickupAddress.area}
                </p>
                <p className="text-muted-foreground text-[11px] truncate">
                  {primaryActiveTask.pickupAddress.area},{" "}
                  {primaryActiveTask.pickupAddress.city}
                </p>
              </div>

              <div className="rounded-xl bg-muted/40 p-3 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1">
                  <Truck className="size-3" /> Destination
                </span>
                <p className="font-semibold text-foreground truncate">
                  {activeNgo?.ngoName || "Recipient NGO Facility"}
                </p>
                <p className="text-muted-foreground text-[11px] truncate">
                  {activeNgo?.address?.area || "Visakhapatnam"}, Receiving Dock
                </p>
              </div>

              <div className="rounded-xl bg-muted/40 p-3 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                  <Navigation className="size-3" /> Current Status
                </span>
                <p className="font-semibold text-foreground capitalize">
                  {primaryActiveTask.status.replace(/_/g, " ").toLowerCase()}
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Milestone in progress
                </p>
              </div>

              <div className="rounded-xl bg-muted/40 p-3 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3" /> Last Location Update
                </span>
                <p className="font-mono font-semibold text-foreground">
                  {lastGpsUpdate
                    ? lastGpsUpdate.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })
                    : "Live GPS pending"}
                </p>
                <p className="text-muted-foreground text-[11px]">
                  {primaryActiveTask.currentLocation
                    ? "Authoritative coordinate logged"
                    : "Tap 'Use My Location' to sync"}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. My Active Pickups Section */}
      <section id="active" className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <SectionHeading className="text-xl font-bold text-foreground">
              Collection Route (My Pickups)
            </SectionHeading>
            <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider">
              Assigned → En Route → Arrived → Collected
            </span>
          </div>
          <BodyText size="sm" className="text-muted-foreground">
            Advance transit milestones in real-time as you move between donor kitchen and recipient NGO
          </BodyText>
        </div>

        {activeTasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center bg-card/50">
            <Truck className="mx-auto size-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No active collections in custody.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Check the open dispatch pool below to claim a nearby surplus pickup!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTasks.map((task) => (
              <CollectionTaskCard
                key={task._id}
                collection={task}
                donation={donationMap.get(task.donationId)}
                currentUserId={user._id}
                onActionComplete={handleTaskUpdated}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. Available Dispatch Pool (Open for Atomic Claiming) */}
      <section id="available" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <SectionHeading className="text-xl font-bold text-foreground">
              Available Pickups (Open Pool)
            </SectionHeading>
            <BodyText size="sm" className="text-muted-foreground">
              Verified collections needing courier transit. Claiming uses atomic concurrency protection.
            </BodyText>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {availableTasks.length} task{availableTasks.length !== 1 ? "s" : ""} available
          </span>
        </div>

        {availableTasks.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            All surplus pickups are currently covered by active couriers. Stand by for new matches.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableTasks.map((task) => (
              <CollectionTaskCard
                key={task._id}
                collection={task}
                donation={donationMap.get(task.donationId)}
                currentUserId={user._id}
                onActionComplete={handleTaskUpdated}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. Completed Pickups History */}
      <section id="history" className="space-y-4">
        <div>
          <SectionHeading className="text-xl font-bold text-foreground">
            Completed Delivery History
          </SectionHeading>
          <BodyText size="sm" className="text-muted-foreground">
            Physical handovers delivered into verified NGO care
          </BodyText>
        </div>

        {completedTasks.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No completed delivery runs yet.
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Task ID</th>
                    <th className="p-3.5">Food Lot</th>
                    <th className="p-3.5">Transit Corridor</th>
                    <th className="p-3.5">Delivered At</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {completedTasks.map((c) => {
                    const don = donationMap.get(c.donationId)
                    return (
                      <tr key={c._id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3.5 font-mono text-muted-foreground">#{c._id.slice(-6)}</td>
                        <td className="p-3.5 font-medium text-foreground">
                          {don?.foodName || "Surplus Lot"} ({don ? `${don.quantity} ${don.unit}` : "Portions"})
                        </td>
                        <td className="p-3.5 text-muted-foreground">
                          {c.pickupAddress.area} &rarr; {c.pickupAddress.city} Center (~3.5 km)
                        </td>
                        <td className="p-3.5 text-muted-foreground">
                          {c.collectedAt
                            ? new Date(c.collectedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Today"}
                        </td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[0.7rem] font-semibold">
                            <CheckCircle2 className="size-3" />
                            Delivered
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
