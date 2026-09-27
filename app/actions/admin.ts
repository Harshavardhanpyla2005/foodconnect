"use server"

import { revalidatePath } from "next/cache"
import { repositories } from "@/lib/repositories"
import { getCurrentUser } from "@/lib/auth/current-user"
import { AccountStatus } from "@/types/database"

/**
 * Reviews and approves or rejects an NGO registration.
 * Records audit logs and updates user account status.
 */
export async function verifyNGOAction(
  ngoId: string,
  approved: boolean,
  rejectionReason?: string
) {
  try {
    const auth = await getCurrentUser()
    const user = auth?.user
    if (!user || user.role !== "ADMIN") {
      return { success: false, message: "Unauthorized. Administrator credentials required." }
    }

    const ngo = await repositories.ngos.findById(ngoId)
    if (!ngo) {
      return { success: false, message: "NGO record not found." }
    }

    const newStatus = approved ? "VERIFIED" : "REJECTED"
    const updatedNGO = await repositories.ngos.updateVerificationStatus(
      ngoId,
      newStatus,
      user._id,
      rejectionReason
    )

    if (!updatedNGO) {
      return { success: false, message: "Failed to update verification status." }
    }

    // Update associated user account status
    if (approved) {
      await repositories.users.update(ngo.userId, {
        accountStatus: "ACTIVE",
      })
    } else {
      await repositories.users.update(ngo.userId, {
        accountStatus: "REJECTED",
      })
    }

    // Immutable audit log
    await repositories.auditLogs.append({
      actorId: user._id,
      actorRole: user.role,
      action: "NGO_VERIFICATION_STATUS_CHANGED",
      entityType: "NGOProfile",
      entityId: ngoId,
      newState: {
        verificationStatus: newStatus,
        verifiedBy: user._id,
        rejectionReason,
      },
      metadata: { ngoName: ngo.ngoName, approved },
    })

    revalidatePath("/dashboard/admin")
    revalidatePath("/dashboard/ngo")
    revalidatePath("/ngos")

    return {
      success: true,
      message: `NGO ${ngo.ngoName} has been ${approved ? "verified and approved" : "rejected"}.`,
    }
  } catch (error) {
    console.error("Error verifying NGO:", error)
    return { success: false, message: "Failed to process verification." }
  }
}

/**
 * Suspends or reactivates a platform user account.
 * Suspended users are immediately blocked by requireAuth.
 */
export async function toggleUserStatusAction(
  userId: string,
  newStatus: AccountStatus,
  reason?: string
) {
  try {
    const auth = await getCurrentUser()
    const user = auth?.user
    if (!user || user.role !== "ADMIN") {
      return { success: false, message: "Unauthorized. Administrator credentials required." }
    }

    if (userId === user._id) {
      return { success: false, message: "Administrators cannot suspend their own operational account." }
    }

    const updatedUser = await repositories.users.update(userId, {
      accountStatus: newStatus,
    })

    if (!updatedUser) {
      return { success: false, message: "User account not found." }
    }

    // Audit log
    await repositories.auditLogs.append({
      actorId: user._id,
      actorRole: user.role,
      action: "USER_STATUS_UPDATED",
      entityType: "User",
      entityId: userId,
      newState: { accountStatus: newStatus },
      metadata: { reason: reason || `Account status changed to ${newStatus} by admin ${user.name}` },
    })

    revalidatePath("/dashboard/admin")

    return {
      success: true,
      message: `User ${updatedUser.name} account status updated to ${newStatus}.`,
    }
  } catch (error) {
    console.error("Error updating user status:", error)
    return { success: false, message: "Failed to update user status." }
  }
}

/**
 * Audits and approves or rejects a community distribution record.
 * Only verified distributions contribute to verified community impact metrics.
 */
export async function verifyDistributionAction(
  distributionId: string,
  approved: boolean,
  reason?: string
) {
  try {
    const auth = await getCurrentUser()
    const user = auth?.user
    if (!user || user.role !== "ADMIN") {
      return { success: false, message: "Unauthorized. Administrator credentials required." }
    }

    if (!approved && (!reason || !reason.trim())) {
      return { success: false, message: "A specific rejection reason is required to reject evidence." }
    }

    const updatedDist = await repositories.distributions.verify(
      distributionId,
      user._id,
      approved,
      reason
    )

    if (!updatedDist) {
      return { success: false, message: "Distribution record not found." }
    }

    // If approved, update donation status to VERIFIED and collection to VERIFIED
    if (approved && updatedDist.donationId) {
      await repositories.donations.updateStatus(
        updatedDist.donationId,
        "VERIFIED"
      )
      if (updatedDist.collectionId) {
        await repositories.collections.updateStatus(
          updatedDist.collectionId,
          "VERIFIED"
        )
      }
    }

    // Audit log
    await repositories.auditLogs.append({
      actorId: user._id,
      actorRole: user.role,
      action: approved ? "DISTRIBUTION_VERIFIED" : "DISTRIBUTION_REJECTED",
      entityType: "Distribution",
      entityId: distributionId,
      newState: {
        verificationStatus: approved ? "VERIFIED" : "REJECTED",
        verifiedBy: user._id,
      },
      metadata: {
        quantityDistributed: updatedDist.quantityDistributed,
        peopleServed: updatedDist.peopleServed,
        reason,
      },
    })

    revalidatePath("/dashboard/admin")
    revalidatePath("/dashboard/donor")
    revalidatePath("/dashboard/ngo")
    revalidatePath("/impact")

    return {
      success: true,
      message: `Distribution record has been ${approved ? "verified and approved" : "rejected"}.`,
    }
  } catch (error) {
    console.error("Error verifying distribution:", error)
    return { success: false, message: "Failed to process distribution verification." }
  }
}
