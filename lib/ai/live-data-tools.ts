/**
 * FoodConnect AI — Server-Side Live Data Tool Layer
 *
 * SECURITY: All functions execute server-side only.
 * Identity is derived from the authenticated session — never from client input.
 * Each function only exposes data appropriate to the authenticated user's role.
 */

import { repositories } from "@/lib/repositories"
import { IUser } from "@/types/database"

export interface LiveDataContext {
  section: string
  data: string
}

// ============================================================================
// DONOR TOOLS
// ============================================================================

async function getMyDonationsSummary(user: IUser): Promise<LiveDataContext> {
  const all = await repositories.donations.findByDonorId(user._id)
  if (!all.length) {
    return {
      section: "Your Donations",
      data: "You have not created any donations yet. Visit your Donor Dashboard to create your first donation.",
    }
  }

  const active = all.filter((d) =>
    !["CANCELLED", "EXPIRED", "DISTRIBUTED", "CLOSED"].includes(d.status)
  )
  const delivered = all.filter((d) =>
    d.status === "DELIVERED_TO_NGO" || d.status === "DISTRIBUTED"
  )

  const lines: string[] = [
    `Total donations: ${all.length}`,
    `Active/in-progress: ${active.length}`,
    `Delivered to NGO: ${delivered.length}`,
    "",
    "Recent donations:",
  ]

  for (const d of all.slice(0, 5)) {
    lines.push(
      `• [${d._id.slice(-6)}] ${d.foodName} — ${d.quantity} ${d.unit} — Status: ${d.status.replace(/_/g, " ")}`
    )
  }

  return { section: "Your Donations", data: lines.join("\n") }
}

async function getMyActiveDonationStatus(user: IUser): Promise<LiveDataContext> {
  const donations = await repositories.donations.findByDonorId(user._id)
  const active = donations.find((d) =>
    !["CANCELLED", "EXPIRED", "DISTRIBUTED", "CLOSED", "DELIVERED_TO_NGO"].includes(d.status)
  )

  if (!active) {
    return {
      section: "Active Donation Status",
      data: "You have no active donation in progress right now.",
    }
  }

  const lines = [
    `Donation: ${active.foodName}`,
    `Quantity: ${active.quantity} ${active.unit}`,
    `Status: ${active.status.replace(/_/g, " ")}`,
  ]

  const statusHints: Record<string, string> = {
    ACCEPTED: "An NGO has accepted your donation.",
    COLLECTION_ASSIGNED: "A volunteer has been assigned to collect your food.",
    HEADING_TO_DONOR: "A volunteer is currently heading to your pickup location.",
    AT_DONOR_LOCATION: "The volunteer has arrived at your location.",
    COLLECTING: "The volunteer is collecting your food now.",
    IN_TRANSIT: "Your food is in transit to the NGO.",
    AT_NGO_LOCATION: "Volunteer is at the NGO — handoff imminent.",
    HANDOFF_SUBMITTED: "Handoff proof submitted — food delivered.",
  }

  if (active.status in statusHints) {
    lines.push(statusHints[active.status])
  }

  return { section: "Active Donation Status", data: lines.join("\n") }
}

async function getMyDonationCollectionStatus(user: IUser): Promise<LiveDataContext> {
  const donations = await repositories.donations.findByDonorId(user._id)
  const donation = donations.find((d) =>
    !["CANCELLED", "EXPIRED", "DISTRIBUTED"].includes(d.status)
  )

  if (!donation) {
    return {
      section: "Collection Status",
      data: "No active donation found. Check your Donor Dashboard for the full list.",
    }
  }

  const col = await repositories.collections.findByDonationId(donation._id)

  if (!col) {
    return {
      section: "Collection Status",
      data: `Your donation "${donation.foodName}" (${donation.status.replace(/_/g, " ")}) does not have a collection assigned yet.`,
    }
  }

  const lines = [
    `Donation: ${donation.foodName}`,
    `Collection status: ${col.status.replace(/_/g, " ")}`,
    col.volunteerId ? "A volunteer has been assigned." : "No volunteer assigned yet.",
  ]

  if (["DELIVERED_TO_NGO", "NGO_CONFIRMED"].includes(col.status)) {
    lines.push("✅ Your food has been delivered to the NGO.")
  }

  return { section: "Collection Status", data: lines.join("\n") }
}

// ============================================================================
// NGO TOOLS
// ============================================================================

async function getMyActiveNeedsSummary(user: IUser): Promise<LiveDataContext> {
  const ngoProfile = await repositories.ngos.findByUserId(user._id)
  if (!ngoProfile) {
    return {
      section: "Your Food Needs",
      data: "NGO profile not found. Please complete your profile setup.",
    }
  }

  const needs = await repositories.needs.findByNgoId(ngoProfile._id)
  const active = needs.filter((n) => ["ACTIVE", "PARTIALLY_FULFILLED"].includes(n.status))
  const fulfilled = needs.filter((n) => n.status === "FULFILLED")

  if (!needs.length) {
    return {
      section: "Your Food Needs",
      data: "You have no food needs recorded yet. Visit your NGO Dashboard to create one.",
    }
  }

  const lines = [
    `Total needs: ${needs.length}`,
    `Active needs: ${active.length}`,
    `Fulfilled needs: ${fulfilled.length}`,
    "",
    "Active needs:",
  ]

  for (const n of active.slice(0, 5)) {
    lines.push(
      `• ${n.beneficiaryCategory} (${n.foodType}) — ${n.quantityRemaining}/${n.quantityRequired} ${n.unit} remaining — Urgency: ${n.urgency}`
    )
  }

  if (!active.length) {
    lines.push("No active needs at the moment.")
  }

  return { section: "Your Food Needs", data: lines.join("\n") }
}

async function getMyAcceptedDonationsSummary(user: IUser): Promise<LiveDataContext> {
  const ngoProfile = await repositories.ngos.findByUserId(user._id)
  if (!ngoProfile) {
    return { section: "Accepted Donations", data: "NGO profile not found." }
  }

  const myCollections = await repositories.collections.findByNgoId(ngoProfile._id)

  if (!myCollections.length) {
    return {
      section: "Accepted Donations",
      data: "No accepted donations found yet. Accept a matched donation from your NGO Dashboard.",
    }
  }

  const pending = myCollections.filter(
    (c) => !["DELIVERED_TO_NGO", "NGO_CONFIRMED", "DISTRIBUTED", "CLOSED", "CANCELLED"].includes(c.status)
  )
  const delivered = myCollections.filter((c) =>
    ["DELIVERED_TO_NGO", "NGO_CONFIRMED", "DISTRIBUTED"].includes(c.status)
  )

  const lines = [
    `Total accepted: ${myCollections.length}`,
    `In progress: ${pending.length}`,
    `Delivered: ${delivered.length}`,
    "",
    "Recent collections:",
  ]

  for (const c of myCollections.slice(0, 5)) {
    lines.push(`• [${c._id.slice(-6)}] Status: ${c.status.replace(/_/g, " ")}`)
  }

  return { section: "Accepted Donations", data: lines.join("\n") }
}

// ============================================================================
// VOLUNTEER TOOLS
// ============================================================================

async function getMyPickupsSummary(user: IUser): Promise<LiveDataContext> {
  const mine = await repositories.collections.findByVolunteerId(user._id)

  if (!mine.length) {
    return {
      section: "Your Pickups",
      data: "You have not claimed any pickups yet. Check the Dispatch Board on your Volunteer Dashboard.",
    }
  }

  const active = mine.filter(
    (c) => !["DELIVERED_TO_NGO", "NGO_CONFIRMED", "DISTRIBUTED", "CLOSED", "CANCELLED"].includes(c.status)
  )
  const completed = mine.filter((c) =>
    ["DELIVERED_TO_NGO", "NGO_CONFIRMED", "DISTRIBUTED"].includes(c.status)
  )

  const lines = [
    `Total pickups claimed: ${mine.length}`,
    `Active/in-progress: ${active.length}`,
    `Completed deliveries: ${completed.length}`,
  ]

  if (active.length > 0) {
    const a = active[0]
    lines.push("", `Current active pickup status: ${a.status.replace(/_/g, " ")}`)
    const nextStep: Record<string, string> = {
      VOLUNTEER_ASSIGNED: "Head to the donor location.",
      HEADING_TO_DONOR: "Continue to the donor location.",
      AT_DONOR_LOCATION: "Collect the food from the donor.",
      COLLECTING: "Complete collection, then update status.",
      COLLECTED: "Transport the food to the NGO facility.",
      IN_TRANSIT: "Head to the NGO. Submit handoff proof on arrival.",
      AT_NGO_LOCATION: "Submit your handoff proof — photo, GPS, notes.",
      HANDOFF_SUBMITTED: "Handoff proof submitted — delivery being confirmed.",
    }
    if (a.status in nextStep) {
      lines.push(`Next step: ${nextStep[a.status as keyof typeof nextStep]}`)
    }
  }

  return { section: "Your Pickups", data: lines.join("\n") }
}

async function getMyActivePickupDetail(user: IUser): Promise<LiveDataContext> {
  const allMine = await repositories.collections.findByVolunteerId(user._id)
  const active = allMine.find(
    (c) => !["DELIVERED_TO_NGO", "NGO_CONFIRMED", "DISTRIBUTED", "CLOSED", "CANCELLED"].includes(c.status)
  )

  if (!active) {
    return {
      section: "Active Pickup",
      data: "You have no active pickup right now. Visit your Volunteer Dashboard to claim one.",
    }
  }

  const [donation, ngoProfile] = await Promise.all([
    repositories.donations.findById(active.donationId),
    repositories.ngos.findById(active.ngoId),
  ])

  const lines = [
    `Collection ID: ${active._id.slice(-8)}`,
    `Status: ${active.status.replace(/_/g, " ")}`,
    donation
      ? `Food: ${donation.foodName} — ${donation.quantity} ${donation.unit}`
      : "",
    ngoProfile
      ? `Destination NGO: ${ngoProfile.ngoName} (${ngoProfile.address?.area || "Vizag"})`
      : "",
  ].filter(Boolean)

  return { section: "Active Pickup", data: lines.join("\n") }
}

// ============================================================================
// PUBLIC TOOLS
// ============================================================================

async function getPublicImpactSummary(): Promise<LiveDataContext> {
  try {
    const metrics = await repositories.distributions.getImpactMetricsSummary()
    const lines = [
      `Verified distributions: ${metrics.verifiedDistributionsCount}`,
      `Total meals/kg delivered: ${metrics.totalMealsDelivered}`,
      `CO₂ prevented: ${metrics.totalCo2Prevented.toFixed(1)} kg`,
      "",
      "All numbers are admin-verified. View full records at /impact.",
    ]
    return { section: "Impact Summary", data: lines.join("\n") }
  } catch {
    return {
      section: "Impact Summary",
      data: "Impact data available at /impact.",
    }
  }
}

// ============================================================================
// DISPATCH: gather live context based on role and query
// ============================================================================

export async function gatherLiveContext(
  user: IUser,
  query: string
): Promise<LiveDataContext[]> {
  const q = query.toLowerCase()
  const results: LiveDataContext[] = []

  try {
    if (user.role === "DONOR") {
      if (q.includes("status") || q.includes("donation") || q.includes("my food") || q.includes("reached") || q.includes("delivered") || q.includes("where")) {
        const [summary, active] = await Promise.all([
          getMyDonationsSummary(user),
          getMyActiveDonationStatus(user),
        ])
        results.push(summary, active)
        if (q.includes("collect") || q.includes("pickup") || q.includes("volunteer")) {
          results.push(await getMyDonationCollectionStatus(user))
        }
      }
    } else if (user.role === "NGO") {
      if (q.includes("need") || q.includes("active") || q.includes("food") || q.includes("status")) {
        results.push(await getMyActiveNeedsSummary(user))
      }
      if (q.includes("donation") || q.includes("accepted") || q.includes("collection") || q.includes("delivery") || q.includes("incoming")) {
        results.push(await getMyAcceptedDonationsSummary(user))
      }
    } else if (user.role === "VOLUNTEER") {
      if (q.includes("pickup") || q.includes("collection") || q.includes("assign") || q.includes("status") || q.includes("current") || q.includes("where")) {
        results.push(await getMyActivePickupDetail(user))
      }
      if (q.includes("pickup") || q.includes("all") || q.includes("history") || q.includes("my")) {
        results.push(await getMyPickupsSummary(user))
      }
    }

    // Impact always if asked
    if (q.includes("impact") || q.includes("verified") || q.includes("beneficiar") || q.includes("total meals") || q.includes("metric")) {
      results.push(await getPublicImpactSummary())
    }
  } catch {
    // Never expose infrastructure details
  }

  // Deduplicate by section
  const seen = new Set<string>()
  return results.filter((r) => {
    if (seen.has(r.section)) return false
    seen.add(r.section)
    return true
  })
}
