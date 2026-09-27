"use server"

import { revalidatePath } from "next/cache"
import { repositories } from "@/lib/repositories"
import { getCurrentUser } from "@/lib/auth/current-user"
import { CollectionStatus } from "@/types/database"

/**
 * Atomically claims an available collection task for a volunteer courier.
 * Ensures two couriers cannot claim the same pickup simultaneously.
 */
export async function claimPickupTaskAction(collectionId: string) {
  try {
    const auth = await getCurrentUser()
    const user = auth?.user
    if (!user) {
      return { success: false, message: "Please sign in as a volunteer to claim this pickup." }
    }
    if (user.role !== "VOLUNTEER") {
      return { success: false, message: "You are not authorized to claim collection tasks." }
    }

    // Atomic claim in repository
    const result = await repositories.collections.claimCollection(collectionId, user._id)
    if (!result.success || !result.collection) {
      return {
        success: false,
        message: result.error?.includes("already")
          ? "This pickup has already been claimed."
          : result.error || "This collection task is no longer available.",
      }
    }

    // Link donation status to COLLECTION_ASSIGNED
    await repositories.donations.updateStatus(
      result.collection.donationId,
      "COLLECTION_ASSIGNED"
    )

    // Append immutable audit log
    await repositories.auditLogs.append({
      actorId: user._id,
      actorRole: user.role,
      action: "COLLECTION_ASSIGNED",
      entityType: "Collection",
      entityId: collectionId,
      metadata: {
        volunteerId: user._id,
        volunteerName: user.name,
        volunteerEmail: user.email,
        donationId: result.collection.donationId,
      },
    })

    revalidatePath("/dashboard/volunteer")
    revalidatePath("/dashboard/ngo")
    revalidatePath("/dashboard/donor")

    return {
      success: true,
      message: "✓ Pickup claimed",
      collection: result.collection,
    }
  } catch (error) {
    console.error("Error claiming collection:", error)
    return { success: false, message: "Failed to claim task. Please try again." }
  }
}

// Valid state transitions map for strict server-authoritative progression
const VALID_TRANSITIONS: Record<CollectionStatus, CollectionStatus[]> = {
  AVAILABLE: ["CLAIMED", "ASSIGNED", "CANCELLED"],
  CLAIMED: ["ASSIGNED", "HEADING_TO_DONOR", "CANCELLED"],
  ASSIGNED: ["HEADING_TO_DONOR", "CANCELLED"],
  HEADING_TO_DONOR: ["ARRIVED_AT_DONOR", "CANCELLED"],
  ARRIVED_AT_DONOR: ["PICKED_UP", "COLLECTED", "CANCELLED"],
  PICKED_UP: ["IN_TRANSIT", "COLLECTED", "CANCELLED"],
  COLLECTED: ["IN_TRANSIT", "CANCELLED"],
  IN_TRANSIT: ["ARRIVED_AT_NGO", "CANCELLED"],
  ARRIVED_AT_NGO: ["DELIVERED_TO_NGO", "HANDOFF_SUBMITTED", "CANCELLED"],
  DELIVERED_TO_NGO: ["DISTRIBUTED", "EVIDENCE_REVIEW", "CLOSED", "CANCELLED"],
  HANDOFF_SUBMITTED: ["DELIVERED_TO_NGO", "NGO_CONFIRMED", "DISTRIBUTED", "CANCELLED"],
  NGO_CONFIRMED: ["DISTRIBUTED", "EVIDENCE_REVIEW", "CANCELLED"],
  DISTRIBUTED: ["EVIDENCE_REVIEW", "VERIFIED", "CANCELLED"],
  EVIDENCE_REVIEW: ["VERIFIED", "CANCELLED"],
  VERIFIED: ["CLOSED"],
  CLOSED: [],
  CANCELLED: [],
}

/**
 * Transitions collection custody through its physical milestones:
 * CLAIMED -> HEADING_TO_DONOR -> ARRIVED_AT_DONOR -> PICKED_UP -> IN_TRANSIT -> ARRIVED_AT_NGO
 */
export async function updateCollectionProgressAction(
  collectionId: string,
  newStatus: CollectionStatus,
  notes?: string
) {
  try {
    const auth = await getCurrentUser()
    const user = auth?.user
    if (!user || user.role !== "VOLUNTEER") {
      return { success: false, message: "Unauthorized. Courier authentication required." }
    }

    const collection = await repositories.collections.findById(collectionId)
    if (!collection) {
      return { success: false, message: "Collection task not found." }
    }

    if (collection.volunteerId !== user._id) {
      return { success: false, message: "You are not the designated courier for this task." }
    }

    // Enforce strict state machine transitions
    const allowed = VALID_TRANSITIONS[collection.status] || []
    if (!allowed.includes(newStatus)) {
      return {
        success: false,
        message: `Invalid state transition from ${collection.status} to ${newStatus}.`,
      }
    }

    const now = new Date()
    const updatedCollection = await repositories.collections.updateStatus(collectionId, newStatus, {
      collectedAt: newStatus === "COLLECTED" || newStatus === "PICKED_UP" ? now : undefined,
      notes: notes || `Milestone ${newStatus} confirmed by courier ${user.name}`,
    })

    if (!updatedCollection) {
      return { success: false, message: "Failed to update collection status." }
    }

    // Mirror collection milestone to donation status
    if (newStatus === "PICKED_UP" || newStatus === "COLLECTED") {
      await repositories.donations.updateStatus(collection.donationId, "COLLECTED")
    } else if (newStatus === "HEADING_TO_DONOR") {
      await repositories.donations.updateStatus(collection.donationId, "HEADING_TO_DONOR")
    } else if (newStatus === "ARRIVED_AT_DONOR") {
      await repositories.donations.updateStatus(collection.donationId, "ARRIVED_AT_DONOR")
    } else if (newStatus === "IN_TRANSIT") {
      await repositories.donations.updateStatus(collection.donationId, "IN_TRANSIT")
    } else if (newStatus === "ARRIVED_AT_NGO") {
      await repositories.donations.updateStatus(collection.donationId, "ARRIVED_AT_NGO")
    }

    // Audit log
    await repositories.auditLogs.append({
      actorId: user._id,
      actorRole: user.role,
      action: "COLLECTION_STATUS_CHANGED",
      entityType: "Collection",
      entityId: collectionId,
      newState: { status: newStatus },
      metadata: { notes },
    })

    revalidatePath("/dashboard/volunteer")
    revalidatePath(`/dashboard/volunteer/pickups/${collectionId}`)
    revalidatePath("/dashboard/ngo")
    revalidatePath("/dashboard/donor")

    return {
      success: true,
      collection: updatedCollection,
      message: `Status updated to ${newStatus}.`,
    }
  } catch (error) {
    console.error("Error updating collection status:", error)
    return { success: false, message: "Failed to advance collection milestone." }
  }
}

/**
 * Submits physical delivery handoff proof by the volunteer courier at NGO arrival:
 * ARRIVED_AT_NGO -> HANDOFF_SUBMITTED
 */
export async function submitHandoffProofAction(payload: {
  collectionId: string
  photoUrl: string
  notes?: string
  location?: {
    latitude?: number
    longitude?: number
    accuracy?: number
  }
  fileSizeBytes?: number
  sha256Checksum?: string
}) {
  try {
    const auth = await getCurrentUser()
    const user = auth?.user
    if (!user || user.role !== "VOLUNTEER") {
      return { success: false, message: "Unauthorized. Courier authentication required." }
    }

    const collection = await repositories.collections.findById(payload.collectionId)
    if (!collection) {
      return { success: false, message: "Collection task not found." }
    }

    if (collection.volunteerId !== user._id) {
      return { success: false, message: "You are not the designated courier for this task." }
    }

    if (collection.status !== "ARRIVED_AT_NGO" && collection.status !== "IN_TRANSIT") {
      return {
        success: false,
        message: "Handoff proof can only be submitted after reaching the recipient NGO facility.",
      }
    }

    const updated = await repositories.collections.submitHandoffProof(payload.collectionId, {
      photoUrl: payload.photoUrl,
      notes: payload.notes,
      location: payload.location,
      fileSizeBytes: payload.fileSizeBytes,
      sha256Checksum: payload.sha256Checksum,
    })

    if (!updated) {
      return { success: false, message: "Failed to save handoff proof." }
    }

    // Mirror to donation: marked DELIVERED_TO_NGO immediately upon physical handoff proof
    await repositories.donations.updateStatus(collection.donationId, "DELIVERED_TO_NGO")

    // Audit log
    await repositories.auditLogs.append({
      actorId: user._id,
      actorRole: user.role,
      action: "COLLECTION_DELIVERED_TO_NGO",
      entityType: "Collection",
      entityId: payload.collectionId,
      metadata: {
        photoUrl: payload.photoUrl,
        location: payload.location,
        notes: payload.notes,
      },
    })

    revalidatePath("/dashboard/volunteer")
    revalidatePath(`/dashboard/volunteer/pickups/${payload.collectionId}`)
    revalidatePath("/dashboard/ngo")
    revalidatePath("/dashboard/donor")
    revalidatePath(`/track/${payload.collectionId}`)

    return {
      success: true,
      collection: updated,
      message: "✓ Delivery completed! Food marked as Delivered to NGO.",
    }
  } catch (error) {
    console.error("Error submitting handoff proof:", error)
    return { success: false, message: "Failed to submit handoff proof." }
  }
}

/**
 * Authenticated GPS location update from active volunteer courier:
 */
export async function updateVolunteerLocationAction(payload: {
  collectionId: string
  latitude: number
  longitude: number
  accuracy?: number
}) {
  try {
    const auth = await getCurrentUser()
    const user = auth?.user
    if (!user || user.role !== "VOLUNTEER") {
      return { success: false, message: "Unauthorized." }
    }

    const collection = await repositories.collections.findById(payload.collectionId)
    if (!collection) {
      return { success: false, message: "Collection not found." }
    }

    if (collection.volunteerId !== user._id) {
      return { success: false, message: "Forbidden." }
    }

    // Stop updating if finished or cancelled
    if (["NGO_CONFIRMED", "DISTRIBUTED", "VERIFIED", "CLOSED", "CANCELLED"].includes(collection.status)) {
      return { success: false, message: "Collection is no longer in active transit." }
    }

    const updated = await repositories.collections.updateLocation(payload.collectionId, {
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracy: payload.accuracy,
    })

    return { success: true, collection: updated }
  } catch (error) {
    console.error("Error updating location:", error)
    return { success: false, message: "Failed to update location." }
  }
}
