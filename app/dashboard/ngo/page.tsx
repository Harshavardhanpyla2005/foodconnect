import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Building2,
  Layers,
  HeartHandshake,
  Truck,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  FileText,
  Users,
  Navigation,
} from "lucide-react"
import { requireAuth } from "@/lib/auth/current-user"
import { repositories } from "@/lib/repositories"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { PageHeading, SectionHeading, BodyText, MetricValue, LabelText } from "@/components/ui/typography"
import { MotionSection, MotionCardInteractive } from "@/components/ui/motion-primitives"
import { CreateNeedModal } from "@/components/dashboard/ngo/create-need-modal"
import { MatchCard } from "@/components/dashboard/ngo/match-card"
import { SubmitDistributionModal } from "@/components/dashboard/ngo/submit-distribution-modal"
import { AwaitingConfirmationPanel } from "@/components/dashboard/ngo/awaiting-confirmation-panel"
import { SubmitDistributionFormModal } from "@/components/dashboard/ngo/submit-distribution-form"
import { IMatch } from "@/types/database"

export const metadata = {
  title: "NGO Operations Dashboard | FoodConnect Visakhapatnam",
  description: "Manage active community food needs, review smart matches, and coordinate collections.",
}

export default async function NGODashboardPage() {
  const { user } = await requireAuth(["NGO"], "/dashboard/ngo")

  const ngoProfile = await repositories.ngos.findByUserId(user._id)
  const isVerified = ngoProfile?.verificationStatus === "VERIFIED"
  const ngoId = ngoProfile?._id || ""

  const isSnehaSandhya =
    user.email === "trust@snehasandhya.demo" ||
    user.email === "contact@snehasandhya.demo" ||
    user._id === "usr-ngo-01"

  // Load related data from repositories
  const allNeeds = await repositories.needs.findAll()
  const myNeeds = allNeeds.filter(
    (n) =>
      n.ngoId === ngoId ||
      (isSnehaSandhya && (n.ngoId === "ngo-vizag-01" || n.ngoId === "ngo-01"))
  )

  const allMatches = await repositories.matches.findAll()
  const myMatches = allMatches.filter(
    (m: IMatch) =>
      m.ngoId === ngoId ||
      (isSnehaSandhya && (m.ngoId === "ngo-vizag-01" || m.ngoId === "ngo-01"))
  )
  const proposedMatches = myMatches.filter((m: IMatch) => m.status === "PROPOSED")

  const allDonations = await repositories.donations.findAll()
  const donationMap = new Map(allDonations.map((d) => [d._id, d]))
  const needMap = new Map(allNeeds.map((n) => [n._id, n]))

  const allCollections = await repositories.collections.findAll()
  const myCollections = allCollections.filter(
    (c) =>
      c.ngoId === ngoId ||
      (isSnehaSandhya && (c.ngoId === "ngo-vizag-01" || c.ngoId === "ngo-01"))
  )

  const allDistributions = await repositories.distributions.findAll()
  const myDistributions = allDistributions.filter(
    (d) =>
      d.ngoId === ngoId ||
      (isSnehaSandhya && (d.ngoId === "ngo-vizag-01" || d.ngoId === "ngo-01"))
  )

  // Metrics
  const activeNeedsCount = myNeeds.filter((n) => ["ACTIVE", "PARTIALLY_FULFILLED"].includes(n.status)).length
  const matchedDonationsCount = myMatches.filter((m: IMatch) => m.status === "ACCEPTED").length
  const pendingCollectionsCount = myCollections.filter((c) => c.status !== "COLLECTED" && c.status !== "CANCELLED").length
  const completedDistributionsCount = myDistributions.length
  const peopleServedCount = myDistributions.reduce((sum, d) => sum + (d.peopleServed || 0), 0)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardNav
        user={user}
        ngoVerificationStatus={ngoProfile?.verificationStatus || "PENDING"}
      />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        {/* NGO Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <PageHeading className="text-2xl font-bold text-foreground">
                {ngoProfile?.ngoName || user.name}
              </PageHeading>
              {isVerified ? (
                <span className="rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="size-3" />
                  Verified Organization
                </span>
              ) : (
                <span className="rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1">
                  <ShieldCheck className="size-3" />
                  Self-Declared Profile (Active)
                </span>
              )}
            </div>
            <BodyText size="sm" className="mt-1 text-muted-foreground flex items-center gap-2">
              <MapPin className="size-3.5 text-primary" />
              {ngoProfile?.address?.area || "Visakhapatnam"} • Registration ID: {ngoProfile?.registrationNumber || "AP/VIZAG/DEMO"}
            </BodyText>
          </div>

          <div className="flex items-center gap-3">
            <CreateNeedModal />
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 1. ORGANIZATION PROFILE & OPERATIONAL REVIEW STATUS BANNER */}
        {/* ==================================================================== */}
        {!isVerified && (
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 space-y-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="size-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Self-Declared Organization Profile • Operational & Evidence Review Active
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your organization is fully active on FoodConnect. You can declare urgent food needs, receive surplus matches, and coordinate collections immediately. Submitted distributions and photo proofs will undergo administrative evidence review prior to public transparency display.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* 2. FULL OPERATIONAL PORTAL — ALWAYS ACCESSIBLE */}
        {/* ================================================================== */}
        <div className="space-y-8">
            {/* Overview Metrics Cards */}
            <MotionSection delay={0.1} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <MotionCardInteractive className="rounded-xl border border-border bg-card p-4 shadow-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <LabelText className="text-xs uppercase tracking-wider font-semibold">Active Needs</LabelText>
                  <Layers className="size-4 text-blue-500" />
                </div>
                <MetricValue className="text-2xl font-extrabold text-foreground mt-2">{activeNeedsCount}</MetricValue>
                <p className="text-[0.7rem] text-muted-foreground mt-0.5">Demands awaiting matching</p>
              </MotionCardInteractive>

              <MotionCardInteractive className="rounded-xl border border-border bg-card p-4 shadow-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <LabelText className="text-xs uppercase tracking-wider font-semibold">Matched Lots</LabelText>
                  <HeartHandshake className="size-4 text-amber-500" />
                </div>
                <MetricValue className="text-2xl font-extrabold text-foreground mt-2">{matchedDonationsCount}</MetricValue>
                <p className="text-[0.7rem] text-muted-foreground mt-0.5">Surplus lots accepted</p>
              </MotionCardInteractive>

              <MotionCardInteractive className="rounded-xl border border-border bg-card p-4 shadow-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <LabelText className="text-xs uppercase tracking-wider font-semibold">Pending Collections</LabelText>
                  <Truck className="size-4 text-purple-500" />
                </div>
                <MetricValue className="text-2xl font-extrabold text-foreground mt-2">{pendingCollectionsCount}</MetricValue>
                <p className="text-[0.7rem] text-muted-foreground mt-0.5">Couriers en route or staged</p>
              </MotionCardInteractive>

              <MotionCardInteractive className="rounded-xl border border-border bg-card p-4 shadow-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <LabelText className="text-xs uppercase tracking-wider font-semibold">Distributions</LabelText>
                  <FileCheck className="size-4 text-emerald-500" />
                </div>
                <MetricValue className="text-2xl font-extrabold text-foreground mt-2">{completedDistributionsCount}</MetricValue>
                <p className="text-[0.7rem] text-muted-foreground mt-0.5">Community handover events</p>
              </MotionCardInteractive>

              <MotionCardInteractive className="rounded-xl border border-border bg-card p-4 shadow-xs col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <LabelText className="text-xs uppercase tracking-wider font-semibold">People Served</LabelText>
                  <Users className="size-4 text-primary" />
                </div>
                <MetricValue className="text-2xl font-extrabold text-foreground mt-2">{peopleServedCount}</MetricValue>
                <p className="text-[0.7rem] text-muted-foreground mt-0.5">Beneficiaries reached</p>
              </MotionCardInteractive>
            </MotionSection>

            {/* Smart Matches Proposed - Centerpiece */}
            <section id="matches" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <SectionHeading className="text-xl font-bold text-foreground">
                      Smart Matches
                    </SectionHeading>
                    <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider">
                      Centerpiece Engine
                    </span>
                  </div>
                  <BodyText size="sm" className="text-muted-foreground">
                    Intelligently evaluated banquet and kitchen surplus tailored to your active needs
                  </BodyText>
                </div>
                <span className="text-xs text-muted-foreground">
                  {proposedMatches.length} proposed match{proposedMatches.length !== 1 ? "es" : ""}
                </span>
              </div>

              {proposedMatches.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                  No proposed surplus matches pending review right now. New matches are computed continuously as surplus is registered.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {proposedMatches.map((m: IMatch) => {
                    const donation = donationMap.get(m.donationId)
                    const need = needMap.get(m.needId)
                    if (!donation) return null

                    return (
                      <MatchCard
                        key={m._id}
                        match={m}
                        donation={donation}
                        need={need}
                      />
                    )
                  })}
                </div>
              )}
            </section>

            {/* Active Needs Management */}
            <section id="needs" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <SectionHeading className="text-xl font-bold text-foreground">
                    Active Community Needs
                  </SectionHeading>
                  <BodyText size="sm" className="text-muted-foreground">
                    Preserves the quantity conservation invariant: quantityRequired = quantityFulfilled + quantityRemaining
                  </BodyText>
                </div>
                <CreateNeedModal />
              </div>

              {myNeeds.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center bg-card/50">
                  <p className="text-sm text-muted-foreground">No community needs posted yet.</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="p-3.5">Need / Purpose</th>
                          <th className="p-3.5">Food Type</th>
                          <th className="p-3.5">Required</th>
                          <th className="p-3.5">Fulfilled</th>
                          <th className="p-3.5">Remaining</th>
                          <th className="p-3.5">Urgency</th>
                          <th className="p-3.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {myNeeds.map((need) => (
                          <tr key={need._id} className="hover:bg-muted/20 transition-colors">
                            <td className="p-3.5 font-medium text-foreground">
                              <div>{need.beneficiaryCategory} Community Need</div>
                              <div className="text-[0.65rem] text-muted-foreground">{need.location.address}, {need.location.area}</div>
                            </td>
                            <td className="p-3.5 text-muted-foreground">{need.foodType.replace(/_/g, " ")}</td>
                            <td className="p-3.5 font-bold text-foreground">{need.quantityRequired} {need.unit}</td>
                            <td className="p-3.5 text-emerald-600 font-semibold">{need.quantityFulfilled} {need.unit}</td>
                            <td className="p-3.5 text-amber-600 font-semibold">{need.quantityRemaining} {need.unit}</td>
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold ${
                                need.urgency === "IMMEDIATE"
                                  ? "bg-red-500/10 text-red-700 dark:text-red-400"
                                  : need.urgency === "HIGH"
                                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                  : "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                              }`}>
                                {need.urgency}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-semibold text-foreground">
                                {need.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

            {/* 1. Collections Awaiting Confirmation (Handoff Verification) */}
            <AwaitingConfirmationPanel
              collections={myCollections}
              donations={allDonations}
              currentUserId={user._id}
            />

            {/* 2. Collection Management */}
            <section id="collections" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <SectionHeading className="text-xl font-bold text-foreground">
                    Collection Tasks &amp; Transit Inbound
                  </SectionHeading>
                  <BodyText size="sm" className="text-muted-foreground">
                    Track courier dispatch from donor pickup to facility arrival
                  </BodyText>
                </div>
              </div>

              {myCollections.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
                  No active collection tasks in progress.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myCollections.map((col) => {
                    const donation = donationMap.get(col.donationId)
                    const isConfirmed = col.status === "DELIVERED_TO_NGO" || col.status === "NGO_CONFIRMED" || col.status === "COLLECTED" || col.status === "HANDOFF_SUBMITTED"

                    return (
                      <div key={col._id} className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-foreground">
                              Pickup: {col.pickupAddress.area}
                            </span>
                            <p className="text-[0.7rem] text-muted-foreground">
                              Task #{col._id.slice(-6)} • {donation?.foodName || "Surplus Lot"} ({donation?.vegNonVeg || "VEG"})
                            </p>
                          </div>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            col.status === "DELIVERED_TO_NGO" || col.status === "NGO_CONFIRMED"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : col.status === "HANDOFF_SUBMITTED"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : "bg-primary/10 text-primary border border-primary/20"
                          }`}>
                            {col.status.replace(/_/g, " ")}
                          </span>
                        </div>

                        <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Courier:</span>
                            <span className="font-semibold text-foreground">
                              {col.volunteerId ? "Volunteer Courier" : "Open for Courier Claim"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pickup Corridor:</span>
                            <span className="font-semibold text-foreground">{col.pickupAddress.area}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Destination:</span>
                            <span className="font-semibold text-foreground">{col.pickupAddress.city} Center</span>
                          </div>
                        </div>

                        {/* Status actions & Tracking */}
                        {isConfirmed ? (
                          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border/60">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 text-xs font-bold">
                                <CheckCircle2 className="size-3.5" />
                                Donation Delivered
                              </span>
                              <Link
                                href={`/track/${col._id}`}
                                className="text-[11px] text-muted-foreground hover:text-foreground underline"
                              >
                                View Delivery Log
                              </Link>
                            </div>
                            <SubmitDistributionFormModal
                              confirmedCollections={[col]}
                              donations={allDonations}
                              preselectedCollectionId={col._id}
                              buttonText="Record Distribution"
                            />
                          </div>
                        ) : (
                          <div className="pt-2 flex items-center justify-between border-t border-border/60">
                            <span className="text-[11px] text-muted-foreground">
                              Courier transit active
                            </span>
                            <Link href={`/track/${col._id}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs gap-1.5 h-8 font-medium hover:bg-primary/10 hover:text-primary"
                              >
                                <Navigation className="size-3.5 text-primary" />
                                Track Incoming Donation
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* 3. Distribution Verification Records */}
            <section id="distributions" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <SectionHeading className="text-xl font-bold text-foreground">
                      Distribution Records
                    </SectionHeading>
                    <span className="rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider">
                      Proof of Impact
                    </span>
                  </div>
                  <BodyText size="sm" className="text-muted-foreground">
                    Only distributions audited and approved by FoodConnect operations contribute to verified impact metrics
                  </BodyText>
                </div>

                <SubmitDistributionFormModal
                  confirmedCollections={myCollections.filter((c) =>
                    ["DELIVERED_TO_NGO", "NGO_CONFIRMED", "COLLECTED", "HANDOFF_SUBMITTED"].includes(c.status)
                  )}
                  donations={allDonations}
                  buttonText="Record Distribution"
                />
              </div>

              {myDistributions.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
                  No distribution records submitted yet. Use the &ldquo;Record Distribution&rdquo; action once a food lot arrives.
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="p-3.5">Handover Event</th>
                          <th className="p-3.5">Meals Distributed</th>
                          <th className="p-3.5">People Served</th>
                          <th className="p-3.5">Date</th>
                          <th className="p-3.5">Verification Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {myDistributions.map((dist) => (
                          <tr key={dist._id} className="hover:bg-muted/20 transition-colors">
                            <td className="p-3.5 font-medium text-foreground">
                              <div>{dist.distributionLocation.communityCenterName}, {dist.distributionLocation.area}</div>
                              <div className="text-[0.65rem] text-muted-foreground">{dist.description}</div>
                            </td>
                            <td className="p-3.5 font-bold text-foreground">
                              {dist.quantityDistributed} {dist.unit}
                            </td>
                            <td className="p-3.5 text-primary font-semibold">
                              {dist.peopleServed} beneficiaries
                            </td>
                            <td className="p-3.5 text-muted-foreground">
                              {new Date(dist.distributionTimestamp).toLocaleDateString()}
                            </td>
                            <td className="p-3.5">
                              {dist.verificationStatus === "VERIFIED" ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[0.7rem] font-semibold">
                                  <CheckCircle2 className="size-3" />
                                  Verified
                                </span>
                              ) : dist.verificationStatus === "REJECTED" ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20 px-2 py-0.5 text-[0.7rem] font-semibold">
                                  Rejected
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 text-[0.7rem] font-semibold">
                                  <Clock className="size-3" />
                                  Pending Verification
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </div>
      </main>
    </div>
  )
}
