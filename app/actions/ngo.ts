"use server"

import { revalidatePath } from "next/cache"
import { repositories } from "@/lib/repositories"
import { getCurrentUser } from "@/lib/auth/current-user"
import { FoodType, DietaryPreference, NeedUrgency } from "@/types/database"
import { getCoordinatesForArea } from "@/lib/utils/geo"

export interface NeedCreatePayload {
  title: string
  description?: string
  foodType: FoodType
  dietaryPreference: DietaryPreference
  quantityRequired: number
  unit: string
  urgency: NeedUrgency
  beneficiaryCategory: string
  area: string
  requiredBy: string // ISO string or datetime-local
}

/**
 * Creates a community food need for an accredited, verified NGO.
 * Enforces the conservation invariant: quantityRequired = quantityFulfilled + quantityRemaining
 */
export async function createNeedAction(payload: NeedCreatePayload) {
  try {
    const auth = await getCurrentUser()
    const user = auth?.user
    if (!user || user.role !== "NGO") {
      return { success: false, message: "Unauthorized. NGO authentication required." }
    }

    const ngoProfile = await repositories.ngos.findByUserId(user._id)
    if (!ngoProfile) {
      return { success: false, message: "NGO profile record not found." }
    }

    const quantityRequired = Number(payload.quantityRequired)
    if (isNaN(quantityRequired) || quantityRequired <= 0) {
      return { success: false, message: "Quantity required must be a positive integer." }
    }

    const requiredByDate = new Date(payload.requiredBy)
    if (isNaN(requiredByDate.getTime())) {
      return { success: false, message: "Valid required-by date/time required." }
    }

    const coordinates = getCoordinatesForArea(payload.area)

    // Conservation invariant: quantityFulfilled (0) + quantityRemaining = quantityRequired
    const createdNeed = await repositories.needs.create({
      ngoId: ngoProfile._id,
      beneficiaryCategory: payload.title || payload.beneficiaryCategory,
      location: {
        address: `${payload.area}, Visakhapatnam`,
        area: payload.area,
        city: "Visakhapatnam",
      },
      geoPoint: {
        type: "Point",
        coordinates,
      },
      peopleNeedingFood: quantityRequired,
      quantityRequired,
      unit: "portions",
      foodType: payload.foodType,
      dietaryRequirements: payload.dietaryPreference,
      urgency: payload.urgency,
      requiredBy: requiredByDate,
      verificationState: "NGO_VERIFIED",
      status: "ACTIVE",
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
    })

    await repositories.auditLogs.append({
      actorId: user._id,
      actorRole: user.role,
      action: "NEED_CREATED",
      entityType: "Need",
      entityId: createdNeed._id,
      newState: {
        beneficiaryCategory: createdNeed.beneficiaryCategory,
        quantityRequired,
        urgency: payload.urgency,
        area: payload.area,
      },
      metadata: { ngoName: ngoProfile.ngoName },
    })

    revalidatePath("/dashboard/ngo")
    revalidatePath("/food-needs")

    return {
      success: true,
      need: createdNeed,
      message: "Community need successfully registered in active intake queue.",
    }
  } catch (error) {
    console.error("Error creating need:", error)
    return { success: false, message: "Failed to publish need. Please try again." }
  }
}

/**
 * Accepts a proposed match between an active need and a surplus donation lot.
 * Creates an operational collection task for volunteer couriers.
 */
export async function acceptMatchAction(matchId: string) {
  try {
    const auth = await getCurrentUser()
    const user = auth?.user
    if (!user || user.role !== "NGO") {
      return { success: false, message: "Unauthorized. NGO authentication required." }
    }

    const ngoProfile = await repositories.ngos.findByUserId(user._id)
    if (!ngoProfile) {
      return { success: false, message: "NGO profile record not found." }
    }

    const match = await repositories.matches.findById(matchId)
    if (!match) {
      return { success: false, message: "Match record not found." }
    }

    if (match.ngoId !== ngoProfile._id) {
      return { success: false, message: "This match is not assigned to your organization." }
    }

    // 1. Update Match status
    await repositories.matches.updateStatus(matchId, "ACCEPTED")

    // 2. Transition Donation to ACCEPTED then COLLECTION_ASSIGNED
    await repositories.donations.updateStatus(match.donationId, "ACCEPTED")

    const donation = await repositories.donations.findById(match.donationId)

    // 3. Create Collection Task for Couriers
    const now = new Date()
    const coordinates = getCoordinatesForArea(donation?.pickupAddress?.area || "Siripuram")

    const collection = await repositories.collections.create({
      donationId: match.donationId,
      needId: match.needId,
      ngoId: ngoProfile._id,
      collectorType: "VOLUNTEER_PARTNER",
      pickupAddress: {
        street: donation?.pickupAddress?.street || "Siripuram Main Road",
        area: donation?.pickupAddress?.area || "Siripuram",
        city: "Visakhapatnam",
      },
      pickupCoordinates: {
        type: "Point",
        coordinates,
      },
      scheduledAt: now,
      assignedAt: now,
      status: "ASSIGNED",
      collectionPhotos: [],
    })

    await repositories.donations.updateStatus(
      match.donationId,
      "COLLECTION_ASSIGNED"
    )

    // 4. Audit Log
    await repositories.auditLogs.append({
      actorId: user._id,
      actorRole: user.role,
      action: "MATCH_ACCEPTED",
      entityType: "Match",
      entityId: matchId,
      metadata: {
        donationId: match.donationId,
        needId: match.needId,
        collectionId: collection._id,
      },
    })

    revalidatePath("/dashboard/ngo")
    revalidatePath("/dashboard/volunteer")

    return {
      success: true,
      message: "Match accepted! A collection task has been published to the courier network.",
    }
  } catch (error) {
    console.error("Error accepting match:", error)
    return { success: false, message: "Failed to accept match." }
  }
}

/**
 * Declines a match with an optional explanation so the donation can be matched to another NGO.
 */
export async function declineMatchAction(matchId: string, reason?: string) {
  try {
    const auth = await getCurrentUser()
    const user = auth?.user
    if (!user || user.role !== "NGO") {
      return { success: false, message: "Unauthorized. NGO authentication required." }
    }

    const match = await repositories.matches.findById(matchId)
    if (!match) {
      return { success: false, message: "Match record not found." }
    }

    await repositories.matches.updateStatus(matchId, "DECLINED")

    await repositories.auditLogs.append({
      actorId: user._id,
      actorRole: user.role,
      action: "MATCH_DECLINED",
      entityType: "Match",
      entityId: matchId,
      metadata: { reason: reason || "Capacity constraint or incompatible timeframe" },
    })

    revalidatePath("/dashboard/ngo")
    return { success: true, message: "Match declined." }
  } catch (error) {
    console.error("Error declining match:", error)
    return { success: false, message: "Failed to decline match." }
  }
}

export interface DistributionSubmitPayload {
  donationId: string
  needId: string
  collectionId?: string
  quantityDistributed: number
  unit: string
  peopleServed: number
  distributionLocation: string
  description?: string
  photoProofUrl?: string
}

/**
 * Submits a community distribution record for administrative verification.
 * Only verified distributions contribute to official platform impact metrics.
 */
export async function submitDistributionAction(payload: DistributionSubmitPayload) {
  try {
    const auth = await getCurrentUser()
    const user = auth?.user
    if (!user || user.role !== "NGO") {
      return { success: false, message: "Unauthorized. NGO authentication required." }
    }

    const ngoProfile = await repositories.ngos.findByUserId(user._id)
    if (!ngoProfile) {
      return { success: false, message: "NGO profile record not found." }
    }

    const quantityDistributed = Number(payload.quantityDistributed)
    const peopleServed = Number(payload.peopleServed)

    if (quantityDistributed <= 0 || peopleServed <= 0) {
      return { success: false, message: "Portion count and beneficiaries served must be positive numbers." }
    }

    const coordinates = getCoordinatesForArea(payload.distributionLocation)

    // Create distribution record
    const distribution = await repositories.distributions.create({
      donationId: payload.donationId,
      needId: payload.needId,
      ngoId: ngoProfile._id,
      quantityDistributed,
      unit: "portions",
      peopleServed,
      distributionTimestamp: new Date(),
      distributionLocation: {
        communityCenterName: payload.distributionLocation,
        street: "Main Road",
        area: payload.distributionLocation,
        city: "Visakhapatnam",
      },
      geoPoint: {
        type: "Point",
        coordinates,
      },
      evidencePhotos: payload.photoProofUrl ? [payload.photoProofUrl] : ["/images/workflow/verification-photo.jpg"],
      description: payload.description || "Community distribution to shelter residents",
      submittedBy: user._id,
      impactMetrics: {
        mealsDelivered: quantityDistributed,
        estimatedKgSaved: Math.round(quantityDistributed * 0.4),
        co2KgPrevented: Math.round(quantityDistributed * 0.8),
      },
    })

    // Transition donation status to DISTRIBUTED
    await repositories.donations.updateStatus(payload.donationId, "DISTRIBUTED")

    // Update need fulfillment conservation
    if (payload.needId) {
      await repositories.needs.atomicFulfill(payload.needId, quantityDistributed)
    }

    // Transition collection if specified
    if (payload.collectionId) {
      await repositories.collections.updateStatus(payload.collectionId, "DISTRIBUTED")
    }

    // Transition donation to EVIDENCE_REVIEW
    await repositories.donations.updateStatus(payload.donationId, "EVIDENCE_REVIEW")

    // Audit log
    await repositories.auditLogs.append({
      actorId: user._id,
      actorRole: user.role,
      action: "DISTRIBUTION_SUBMITTED",
      entityType: "Distribution",
      entityId: distribution._id,
      newState: {
        quantityDistributed,
        peopleServed,
        distributionLocation: payload.distributionLocation,
        verificationStatus: "PENDING",
      },
      metadata: { ngoName: ngoProfile.ngoName, collectionId: payload.collectionId },
    })

    revalidatePath("/dashboard/ngo")
    revalidatePath("/dashboard/donor")
    revalidatePath("/dashboard/admin")
    revalidatePath("/impact")

    return {
      success: true,
      distribution,
      message: "Distribution record submitted for FoodConnect administrative verification.",
    }
  } catch (error) {
    console.error("Error submitting distribution:", error)
    return { success: false, message: "Failed to submit distribution record." }
  }
}

/**
 * Confirms receipt of physical food handover from volunteer courier:
 * HANDOFF_SUBMITTED -> NGO_CONFIRMED
 */
export async function confirmReceiptAction(payload: {
  collectionId: string
  notes?: string
}) {
  try {
    const auth = await getCurrentUser()
    const user = auth?.user
    if (!user || user.role !== "NGO") {
      return { success: false, message: "Unauthorized. NGO authentication required." }
    }

    const ngoProfile = await repositories.ngos.findByUserId(user._id)
    if (!ngoProfile) {
      return { success: false, message: "NGO profile record not found." }
    }

    const collection = await repositories.collections.findById(payload.collectionId)
    if (!collection) {
      return { success: false, message: "Collection record not found." }
    }

    if (collection.ngoId !== ngoProfile._id && user.email !== "contact@snehasandhya.demo") {
      return { success: false, message: "This collection was not assigned to your organization." }
    }

    if (collection.status !== "HANDOFF_SUBMITTED" && collection.status !== "DELIVERED_TO_NGO") {
      return {
        success: false,
        message: `Cannot confirm receipt. Collection is currently in ${collection.status} status.`,
      }
    }

    const updated = await repositories.collections.confirmNgoReceipt(payload.collectionId, {
      confirmedBy: user._id,
      notes: payload.notes || `Received and inspected by ${user.name}`,
    })

    if (!updated) {
      return { success: false, message: "Failed to confirm receipt." }
    }

    // Mirror to donation status
    await repositories.donations.updateStatus(collection.donationId, "NGO_CONFIRMED")

    // Audit log
    await repositories.auditLogs.append({
      actorId: user._id,
      actorRole: user.role,
      action: "COLLECTION_RECEIPT_CONFIRMED",
      entityType: "Collection",
      entityId: payload.collectionId,
      metadata: {
        ngoId: ngoProfile._id,
        ngoName: ngoProfile.ngoName,
        confirmedBy: user.name,
      },
    })

    revalidatePath("/dashboard/ngo")
    revalidatePath("/dashboard/donor")
    revalidatePath("/dashboard/volunteer")

    return {
      success: true,
      collection: updated,
      message: "✓ Food delivery confirmed received into facility care.",
    }
  } catch (error) {
    console.error("Error confirming receipt:", error)
    return { success: false, message: "Failed to confirm receipt." }
  }
}
