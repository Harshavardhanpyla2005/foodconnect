import * as React from "react"
import Link from "next/link"
import {
  HeartHandshake,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  PlusCircle,
  Sparkles,
  MapPin,
  ShieldCheck,
  Navigation,
} from "lucide-react"
import { requireAuth } from "@/lib/auth/current-user"
import { repositories } from "@/lib/repositories"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Button } from "@/components/ui/button"
import { PageHeading, SectionHeading, BodyText, MetricValue, LabelText } from "@/components/ui/typography"
import { MotionSection, MotionCardInteractive } from "@/components/ui/motion-primitives"
import { DonationStatus, IMatch } from "@/types/database"

export const metadata = {
  title: "Donor Dashboard | FoodConnect Visakhapatnam",
  description: "Manage surplus food listings, view real-time smart matches, and track verified community impact.",
}

const LIFECYCLE_STAGES: DonationStatus[] = [
  "AVAILABLE",
  "MATCHING",
  "REQUESTED",
  "ACCEPTED",
  "COLLECTION_ASSIGNED",
  "HEADING_TO_DONOR",
  "ARRIVED_AT_DONOR",
  "COLLECTED",
  "IN_TRANSIT",
  "ARRIVED_AT_NGO",
  "DELIVERED_TO_NGO",
  "HANDOFF_SUBMITTED",
  "NGO_CONFIRMED",
  "DISTRIBUTED",
  "EVIDENCE_REVIEW",
  "VERIFIED",
  "CLOSED",
]

function getStageIndex(status: DonationStatus): number {
  const idx = LIFECYCLE_STAGES.indexOf(status)
  return idx >= 0 ? idx : 0
}

function getStatusBadge(status: DonationStatus) {
  switch (status) {
    case "AVAILABLE":
      return <span className="rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 px-2.5 py-0.5 text-xs font-semibold">Available for Match</span>
    case "MATCHING":
    case "REQUESTED":
      return <span className="rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 text-xs font-semibold">Matching with NGOs</span>
    case "ACCEPTED":
    case "COLLECTION_ASSIGNED":
      return <span className="rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20 px-2.5 py-0.5 text-xs font-semibold">Courier Assigned</span>
    case "HEADING_TO_DONOR":
    case "ARRIVED_AT_DONOR":
      return <span className="rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold">Courier Heading to Pickup</span>
    case "COLLECTED":
    case "IN_TRANSIT":
    case "ARRIVED_AT_NGO":
      return <span className="rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20 px-2.5 py-0.5 text-xs font-semibold">✓ Food Collected • In Transit</span>
    case "DELIVERED_TO_NGO":
    case "HANDOFF_SUBMITTED":
    case "NGO_CONFIRMED":
      return <span className="rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-bold">✓ Delivered to NGO</span>
    case "DISTRIBUTED":
      return <span className="rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 px-2.5 py-0.5 text-xs font-semibold">Distribution Recorded</span>
    case "EVIDENCE_REVIEW":
      return <span className="rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20 px-2.5 py-0.5 text-xs font-semibold">Evidence Under Review</span>
    case "VERIFIED":
      return <span className="rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-xs font-bold shadow-xs">✓ Impact Verified</span>
    case "CLOSED":
      return <span className="rounded-full bg-muted text-muted-foreground border border-border px-2.5 py-0.5 text-xs font-semibold">Completed</span>
    default:
      return <span className="rounded-full bg-muted text-muted-foreground px-2.5 py-0.5 text-xs">{status}</span>
  }
}

export default async function DonorDashboardPage() {
  const { user } = await requireAuth(["DONOR"], "/dashboard/donor")

  // Load donor profile and related entities
  const donorProfile = await repositories.donors.findByUserId(user._id)
  const donorId = donorProfile?._id || user._id

  const allDonations = await repositories.donations.findAll()
  // Include donations created by this user or mapped seed donor
  const myDonations = allDonations.filter(
    (d) =>
      d.donorId === donorId ||
      d.donorId === user._id ||
      (user.email === "fnb@daspallavizag.demo" && d.donorId === "usr-donor-01")
  )

  const allMatches = await repositories.matches.findAll()
  const allCollections = await repositories.collections.findAll()
  const allDistributions = await repositories.distributions.findAll()
  const allNgos = await repositories.ngos.findAll()
  const ngoMap = new Map(allNgos.map((n) => [n._id, n]))

  // Partition into Active and History
  const activeDonations = myDonations.filter((d) =>
    [
      "AVAILABLE",
      "MATCHING",
      "REQUESTED",
      "ACCEPTED",
      "COLLECTION_ASSIGNED",
      "HEADING_TO_DONOR",
      "ARRIVED_AT_DONOR",
      "COLLECTED",
      "IN_TRANSIT",
      "ARRIVED_AT_NGO",
      "DELIVERED_TO_NGO",
      "HANDOFF_SUBMITTED",
      "NGO_CONFIRMED",
    ].includes(d.status)
  )
  const historyDonations = myDonations.filter((d) =>
    ["DISTRIBUTED", "EVIDENCE_REVIEW", "VERIFIED", "CLOSED"].includes(d.status)
  )

  // Calculate actual metrics from repository data
  const totalMealsRescued = myDonations.reduce((sum, d) => sum + (d.quantity || 0), 0)
  const activeCount = activeDonations.length
  const matchedCount = myDonations.filter((d) =>
    allMatches.some((m: IMatch) => m.donationId === d._id && m.status === "ACCEPTED")
  ).length
  const verifiedCount = myDonations.filter((d) => d.status === "VERIFIED").length

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardNav user={user} />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Donor Profile Header & Quick Post Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <PageHeading className="text-2xl font-bold text-foreground">
                {donorProfile?.organizationName || user.name}
              </PageHeading>
              <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 text-xs font-semibold">
                Surplus Food Donor
              </span>
            </div>
            <BodyText size="sm" className="mt-1 text-muted-foreground flex items-center gap-2">
              <MapPin className="size-3.5 text-primary" />
              {donorProfile?.address?.area || "Visakhapatnam"}, Andhra Pradesh • Contact: {user.email}
            </BodyText>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/donate" prefetch={true}>
              <Button className="gap-2 shadow-xs">
                <PlusCircle className="size-4" />
                Post New Surplus Lot
              </Button>
            </Link>
          </div>
        </div>

        {/* 1. Overview Metrics Cards */}
        <MotionSection delay={0.1} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MotionCardInteractive className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <LabelText className="text-xs uppercase tracking-wider font-semibold">Active Listings</LabelText>
              <Package className="size-4 text-blue-500" />
            </div>
            <MetricValue className="text-3xl font-extrabold text-foreground mt-2">{activeCount}</MetricValue>
            <p className="text-xs text-muted-foreground mt-1">Available or in transit across Vizag</p>
          </MotionCardInteractive>

          <MotionCardInteractive className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <LabelText className="text-xs uppercase tracking-wider font-semibold">Matched with NGOs</LabelText>
              <HeartHandshake className="size-4 text-amber-500" />
            </div>
            <MetricValue className="text-3xl font-extrabold text-foreground mt-2">{matchedCount}</MetricValue>
            <p className="text-xs text-muted-foreground mt-1">Accepted by verified community kitchens</p>
          </MotionCardInteractive>

          <MotionCardInteractive className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <LabelText className="text-xs uppercase tracking-wider font-semibold">Verified Distributions</LabelText>
              <ShieldCheck className="size-4 text-emerald-500" />
            </div>
            <MetricValue className="text-3xl font-extrabold text-foreground mt-2">{verifiedCount}</MetricValue>
            <p className="text-xs text-muted-foreground mt-1">Audited with photographic timestamp proof</p>
          </MotionCardInteractive>

          <MotionCardInteractive className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <LabelText className="text-xs uppercase tracking-wider font-semibold">Meals Rescued</LabelText>
              <Sparkles className="size-4 text-primary" />
            </div>
            <MetricValue className="text-3xl font-extrabold text-foreground mt-2">{totalMealsRescued}</MetricValue>
            <p className="text-xs text-muted-foreground mt-1">Total nutritional portions diverted from waste</p>
          </MotionCardInteractive>
        </MotionSection>

        {/* 2. My Active Listings Section */}
        <section id="active-listings" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <SectionHeading className="text-xl font-bold text-foreground">
                My Food Rescue — Active Surplus Lots
              </SectionHeading>
              <BodyText size="sm" className="text-muted-foreground">
                Real-time lifecycle tracking from intake to courier handover
              </BodyText>
            </div>
            <span className="text-xs text-muted-foreground">
              Showing {activeDonations.length} active item{activeDonations.length !== 1 ? "s" : ""}
            </span>
          </div>

          {activeDonations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card/50">
              <Package className="mx-auto size-10 text-muted-foreground/60 mb-3" />
              <h3 className="font-semibold text-foreground text-base">No active food listings</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                You currently have no food lots waiting for pickup. When you have wholesome banquet or kitchen surplus, log it for rapid NGO matching.
              </p>
              <Link href="/donate" prefetch={true} className="inline-block mt-4">
                <Button size="sm" className="gap-2">
                  <PlusCircle className="size-4" />
                  Post Surplus Now
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activeDonations.map((donation) => {
                const stageIndex = getStageIndex(donation.status)
                const matchedMatches = allMatches.filter((m: IMatch) => m.donationId === donation._id)
                const activeMatch = matchedMatches.find((m: IMatch) => m.status === "ACCEPTED") || matchedMatches[0]
                const matchedNgo = activeMatch ? ngoMap.get(activeMatch.ngoId) : null
                const collection = allCollections.find((c) => c.donationId === donation._id)

                return (
                  <div
                    key={donation._id}
                    className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4 transition-all hover:border-primary/40"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-bold text-foreground">{donation.foodName}</h4>
                          {getStatusBadge(donation.status)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Lot #{donation._id.slice(-6)} • {donation.foodCategory.replace(/_/g, " ")} • {donation.vegNonVeg.replace(/_/g, " ")}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-base font-bold text-foreground">
                            {donation.quantity} {donation.unit}
                          </div>
                          <div className="text-[0.7rem] text-muted-foreground">Logged Portion Volume</div>
                        </div>
                      </div>
                    </div>

                    {/* Operational Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="rounded-lg bg-muted/50 p-2.5 space-y-1">
                        <span className="text-muted-foreground font-medium flex items-center gap-1">
                          <Clock className="size-3.5 text-amber-500" />
                          Safe Consumption Deadline
                        </span>
                        <p className="font-semibold text-foreground">
                          {new Date(donation.safeConsumptionDeadline).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          ({new Date(donation.safeConsumptionDeadline).toLocaleDateString()})
                        </p>
                      </div>

                      <div className="rounded-lg bg-muted/50 p-2.5 space-y-1">
                        <span className="text-muted-foreground font-medium flex items-center gap-1">
                          <HeartHandshake className="size-3.5 text-emerald-500" />
                          Matched Recipient NGO
                        </span>
                        <p className="font-semibold text-foreground">
                          {matchedNgo ? (
                            <span>{matchedNgo.ngoName} ({matchedNgo.address.area})</span>
                          ) : (
                            <span className="text-muted-foreground italic">Evaluating candidate NGOs...</span>
                          )}
                        </p>
                      </div>

                      <div className="rounded-lg bg-muted/50 p-2.5 space-y-1">
                        <span className="text-muted-foreground font-medium flex items-center gap-1">
                          <Truck className="size-3.5 text-blue-500" />
                          Collection Dispatch
                        </span>
                        <div className="font-semibold text-foreground">
                          {collection ? (
                            <div className="flex flex-col items-start gap-2 pt-0.5">
                              <span className="font-semibold text-foreground text-xs">
                                Courier {collection.status.replace(/_/g, " ")}
                              </span>
                              <Link href={`/track/${collection._id}`}>
                                <Button
                                  size="sm"
                                  className="text-xs gap-1.5 h-8 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                                >
                                  <Navigation className="size-3.5" />
                                  Track Collection
                                </Button>
                              </Link>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic text-xs">Awaiting NGO acceptance</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Lifecycle Progression Indicator */}
                    <div className="pt-2">
                      <div className="text-[0.7rem] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Surplus Lifecycle Progression
                      </div>
                      <div className="relative flex items-center justify-between text-center">
                        {LIFECYCLE_STAGES.slice(0, 7).map((stage, idx) => {
                          const isDone = idx <= stageIndex
                          const isCurrent = idx === stageIndex

                          return (
                            <div key={stage} className="flex-1 flex flex-col items-center relative">
                              <div
                                className={`size-6 rounded-full flex items-center justify-center text-[0.65rem] font-bold z-10 transition-colors ${
                                  isDone
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground border border-border"
                                } ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}`}
                              >
                                {isDone ? "✓" : idx + 1}
                              </div>
                              <span
                                className={`text-[0.65rem] mt-1 hidden sm:block ${
                                  isCurrent ? "font-bold text-foreground" : "text-muted-foreground"
                                }`}
                              >
                                {stage.replace(/_/g, " ")}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* 3. Donation History Section */}
        <section id="history" className="space-y-4">
          <div>
            <SectionHeading className="text-xl font-bold text-foreground">
              Donation & Impact History
            </SectionHeading>
            <BodyText size="sm" className="text-muted-foreground">
              Completed food rescues with verified distribution audit records
            </BodyText>
          </div>

          {historyDonations.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              Completed food distributions will appear here once delivered and verified by our operational team.
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Food Lot</th>
                      <th className="p-3.5">Volume Rescued</th>
                      <th className="p-3.5">Recipient NGO</th>
                      <th className="p-3.5">Logged Date</th>
                      <th className="p-3.5">Verification Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {historyDonations.map((d) => {
                      const distribution = allDistributions.find((dist) => dist.donationId === d._id)
                      const isVerified = d.status === "VERIFIED" || distribution?.verificationStatus === "VERIFIED"

                      return (
                        <tr key={d._id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-3.5 font-medium text-foreground">
                            <div>{d.foodName}</div>
                            <div className="text-[0.65rem] text-muted-foreground">{d.foodCategory.replace(/_/g, " ")}</div>
                          </td>
                          <td className="p-3.5 font-semibold text-foreground">
                            {d.quantity} {d.unit}
                          </td>
                          <td className="p-3.5 text-muted-foreground">
                            {distribution?.distributionLocation ? `${distribution.distributionLocation.communityCenterName}, ${distribution.distributionLocation.area}` : "Vizag Community Center"}
                          </td>
                          <td className="p-3.5 text-muted-foreground">
                            {new Date(d.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3.5">
                            {isVerified ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[0.7rem] font-semibold">
                                <CheckCircle2 className="size-3" />
                                Verified Impact
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 text-[0.7rem] font-semibold">
                                <Clock className="size-3" />
                                Pending Admin Audit
                              </span>
                            )}
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
      </main>
    </div>
  )
}
