import * as React from "react"
import { ShieldCheck } from "lucide-react"
import { requireAuth } from "@/lib/auth/current-user"
import { repositories } from "@/lib/repositories"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { PageHeading, SectionHeading, BodyText, MetricValue, LabelText } from "@/components/ui/typography"
import { MotionSection, MotionCardInteractive } from "@/components/ui/motion-primitives"
import { NGOReviewCard } from "@/components/dashboard/admin/ngo-review-card"
import { DistributionReviewCard } from "@/components/dashboard/admin/distribution-review-card"
import { UserStatusButton } from "@/components/dashboard/admin/user-status-button"
import { IUser, IAuditLog } from "@/types/database"

export const metadata = {
  title: "Platform Command & Administration | FoodConnect Visakhapatnam",
  description: "Accreditation audits, distribution verification, user governance, and real-time audit logs.",
}

export default async function AdminDashboardPage() {
  const { user } = await requireAuth(["ADMIN"], "/dashboard/admin")

  // Load all platform repositories
  const [
    allUsers,
    allNgos,
    allDonations,
    allNeeds,
    allCollections,
    allDistributions,
    allAuditLogs,
    impactSummary,
  ] = await Promise.all([
    repositories.users.findAll(),
    repositories.ngos.findAll(),
    repositories.donations.findAll(),
    repositories.needs.findAll(),
    repositories.collections.findAll(),
    repositories.distributions.findAll(),
    repositories.auditLogs.findAll(25),
    repositories.distributions.getImpactMetricsSummary(),
  ])

  // Lookups
  const ngoMap = new Map(allNgos.map((n) => [n._id, n]))
  const donationMap = new Map(allDonations.map((d) => [d._id, d]))
  const collectionMap = new Map(allCollections.map((c) => [c._id, c]))
  const userMap = new Map(allUsers.map((u) => [u._id, u]))

  // Queues
  const pendingNgos = allNgos.filter((n) => n.verificationStatus === "PENDING" || n.verificationStatus === "UNDER_REVIEW")
  const verifiedNgos = allNgos.filter((n) => n.verificationStatus === "VERIFIED")
  const pendingDistributions = allDistributions.filter((d) => d.verificationStatus === "PENDING")
  const verifiedDistributions = allDistributions.filter((d) => d.verificationStatus === "VERIFIED")

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardNav user={user} />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <PageHeading className="text-2xl font-bold text-foreground">
                FoodConnect Operations
              </PageHeading>
              <span className="rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20 px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1">
                <ShieldCheck className="size-3" />
                Root Authority
              </span>
            </div>
            <BodyText size="sm" className="mt-1 text-muted-foreground">
              Visakhapatnam Humanitarian Food Rescue Governance & Audit Control Center
            </BodyText>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 text-xs text-purple-700 dark:text-purple-300 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-purple-600 dark:text-purple-400" />
              Administrator: {user.name}
            </span>
            <span className="rounded-lg bg-muted px-3 py-1.5 text-xs text-muted-foreground font-mono">
              {user.email}
            </span>
          </div>
        </div>

        {/* 1. Platform Metrics Grid */}
        <MotionSection delay={0.1} className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <MotionCardInteractive className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <LabelText className="text-[0.65rem] uppercase tracking-wider font-semibold text-muted-foreground">Total Users</LabelText>
            <MetricValue className="text-2xl font-extrabold text-foreground mt-1">{allUsers.length}</MetricValue>
            <p className="text-[0.65rem] text-muted-foreground mt-0.5">Donors, NGOs, Couriers</p>
          </MotionCardInteractive>

          <MotionCardInteractive className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <LabelText className="text-[0.65rem] uppercase tracking-wider font-semibold text-muted-foreground">Verified NGOs</LabelText>
            <MetricValue className="text-2xl font-extrabold text-foreground mt-1">{verifiedNgos.length}</MetricValue>
            <p className="text-[0.65rem] text-muted-foreground mt-0.5">{pendingNgos.length} pending review</p>
          </MotionCardInteractive>

          <MotionCardInteractive className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <LabelText className="text-[0.65rem] uppercase tracking-wider font-semibold text-muted-foreground">Active Lots</LabelText>
            <MetricValue className="text-2xl font-extrabold text-foreground mt-1">{allDonations.length}</MetricValue>
            <p className="text-[0.65rem] text-muted-foreground mt-0.5">Logged surplus lots</p>
          </MotionCardInteractive>

          <MotionCardInteractive className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <LabelText className="text-[0.65rem] uppercase tracking-wider font-semibold text-muted-foreground">Total Needs</LabelText>
            <MetricValue className="text-2xl font-extrabold text-foreground mt-1">{allNeeds.length}</MetricValue>
            <p className="text-[0.65rem] text-muted-foreground mt-0.5">Community demands</p>
          </MotionCardInteractive>

          <MotionCardInteractive className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <LabelText className="text-[0.65rem] uppercase tracking-wider font-semibold text-muted-foreground">Verified Distributions</LabelText>
            <MetricValue className="text-2xl font-extrabold text-foreground mt-1">{verifiedDistributions.length}</MetricValue>
            <p className="text-[0.65rem] text-muted-foreground mt-0.5">{pendingDistributions.length} pending audit</p>
          </MotionCardInteractive>

          <MotionCardInteractive className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <LabelText className="text-[0.65rem] uppercase tracking-wider font-semibold text-muted-foreground">Meals Delivered</LabelText>
            <MetricValue className="text-2xl font-extrabold text-primary mt-1">{impactSummary.totalMealsDelivered}</MetricValue>
            <p className="text-[0.65rem] text-muted-foreground mt-0.5">Verified impact count</p>
          </MotionCardInteractive>
        </MotionSection>

        {/* 2. NGO Verification Queue */}
        <section id="verifications" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <SectionHeading className="text-xl font-bold text-foreground">
                NGO Accreditation Queue
              </SectionHeading>
              <BodyText size="sm" className="text-muted-foreground">
                Audit registration credentials, kitchen storage capabilities, and operating boundaries
              </BodyText>
            </div>
            <span className="rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 text-xs font-bold">
              {pendingNgos.length} Pending
            </span>
          </div>

          {pendingNgos.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              No pending NGO registrations awaiting review.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingNgos.map((ngo) => (
                <NGOReviewCard key={ngo._id} ngo={ngo} />
              ))}
            </div>
          )}
        </section>

        {/* 3. Distribution Verification Queue */}
        <section id="distributions" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <SectionHeading className="text-xl font-bold text-foreground">
                Distribution Proof Audits
              </SectionHeading>
              <BodyText size="sm" className="text-muted-foreground">
                Audit photographic evidence and portion counts before tallying into official impact metrics
              </BodyText>
            </div>
            <span className="rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 text-xs font-bold">
              {pendingDistributions.length} Pending Audit
            </span>
          </div>

          {pendingDistributions.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              No meal distribution records awaiting verification.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingDistributions.map((dist) => {
                const ngo = ngoMap.get(dist.ngoId)
                const don = donationMap.get(dist.donationId)
                const col = dist.collectionId
                  ? collectionMap.get(dist.collectionId)
                  : allCollections.find((c) => c.donationId === dist.donationId)
                const vol = col?.volunteerId ? userMap.get(col.volunteerId) : null

                return (
                  <DistributionReviewCard
                    key={dist._id}
                    distribution={dist}
                    ngoName={ngo?.ngoName}
                    donationTitle={don?.foodName || "Surplus Meal Lot"}
                    volunteerInfo={{
                      name: vol?.name,
                      handoffPhotoUrl: col?.handoffProof?.photoUrl,
                      notes: col?.handoffProof?.notes,
                    }}
                  />
                )
              })}
            </div>
          )}
        </section>

        {/* 4. User Management */}
        <section id="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <SectionHeading className="text-xl font-bold text-foreground">
                User & Role Governance
              </SectionHeading>
              <BodyText size="sm" className="text-muted-foreground">
                Manage account authorization, roles, and suspension states across all actors
              </BodyText>
            </div>
            <span className="text-xs text-muted-foreground">
              {allUsers.length} total registered accounts
            </span>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Phone</th>
                    <th className="p-3.5">Account Status</th>
                    <th className="p-3.5">Created</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {allUsers.map((u: IUser) => (
                    <tr key={u._id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5 font-medium text-foreground">
                        <div>{u.name}</div>
                        <div className="text-[0.65rem] text-muted-foreground">{u.email}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-bold text-foreground">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5 text-muted-foreground">{u.phone}</td>
                      <td className="p-3.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${
                            u.accountStatus === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                              : u.accountStatus === "SUSPENDED"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          }`}
                        >
                          {u.accountStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-right">
                        {u.role !== "ADMIN" && (
                          <UserStatusButton
                            userId={u._id}
                            currentStatus={u.accountStatus}
                            userName={u.name}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 5. Platform Audit Log Viewer */}
        <section id="audit-logs" className="space-y-4">
          <div>
            <SectionHeading className="text-xl font-bold text-foreground">
              Immutable System Audit Log
            </SectionHeading>
            <BodyText size="sm" className="text-muted-foreground">
              Cryptographically timestamped trail of all role mutations, claims, and status transitions
            </BodyText>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider font-sans">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Actor Role</th>
                    <th className="p-3">Action Event</th>
                    <th className="p-3">Entity Type</th>
                    <th className="p-3">Entity ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {allAuditLogs.map((log: IAuditLog) => (
                    <tr key={log._id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 text-muted-foreground text-[0.7rem]">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </td>
                      <td className="p-3">
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[0.65rem] text-foreground font-semibold">
                          {log.actorRole}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-foreground text-[0.7rem]">
                        {log.action}
                      </td>
                      <td className="p-3 text-muted-foreground text-[0.7rem]">{log.entityType}</td>
                      <td className="p-3 text-muted-foreground text-[0.7rem]">#{log.entityId.slice(-6)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
