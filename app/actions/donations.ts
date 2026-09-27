"use server"

/**
 * FoodConnect — Donation Intake & Matching Server Actions
 *
 * Validates surplus food intake using Zod schemas, records the donation
 * in the repository, and generates intelligent match recommendations against
 * active community needs in Visakhapatnam.
 */

import { repositories } from "@/lib/repositories"
import { DonationCreateSchema } from "@/lib/validation/schemas"
import { cookies } from "next/headers"
import { getCurrentUser } from "@/lib/auth/current-user"
import { evaluateDonationNeedMatch } from "@/lib/matching/engine"
import {
  FoodType,
  FoodVegCategory,
  StorageCondition,
  PackagingCondition,
  IDonation,
} from "@/types/database"

export interface MatchRecommendation {
  matchId: string
  needId: string
  ngoId: string
  ngoName: string
  ngoArea: string
  beneficiaryCategory: string
  quantityRemaining: number
  unit: string
  urgency: string
  distanceKm: number
  matchScore: number
  summary: string
}

export interface CreateDonationResult {
  success: boolean
  donation?: IDonation
  matches?: MatchRecommendation[]
  errors?: Record<string, string>
  message?: string
}

// Coordinates lookup for Visakhapatnam neighborhoods
function getVizagAreaCoordinates(area: string): [number, number] {
  const map: Record<string, [number, number]> = {
    "Siripuram": [83.3155, 17.7215],
    "MVP Colony": [83.3426, 17.7386],
    "Jagadamba Center": [83.3012, 17.7128],
    "Daba Gardens": [83.2985, 17.7082],
    "Gajuwaka": [83.2184, 17.6892],
    "Madhurawada": [83.3542, 17.7981],
    "Rushikonda": [83.3821, 17.7854],
    "Beach Road": [83.3245, 17.7142],
    "RTC Complex Area": [83.2995, 17.7198],
  }
  return map[area] || [83.3155, 17.7215]
}

export async function createDonationAction(formData: {
  donorType: string
  foodName: string
  dietaryType: string
  quantity: string
  unit: string
  preparedAt?: string
  consumptionDeadline: string
  storageCondition: string
  packagingCondition: string
  allergens?: string
  notes?: string
  pickupArea: string
  pickupAddress: string
  pickupWindow: string
}): Promise<CreateDonationResult> {
  try {
    // 1. Map UI fields to database schema types
    let foodCategory: FoodType = "COOKED_MEALS"
    if (formData.foodName.toLowerCase().includes("bread") || formData.foodName.toLowerCase().includes("bun") || formData.donorType.includes("Bakery")) {
      foodCategory = "BAKERY_ITEMS"
    } else if (formData.foodName.toLowerCase().includes("grain") || formData.foodName.toLowerCase().includes("rice bag") || formData.unit.includes("kg")) {
      foodCategory = "RAW_GRAINS_PULSES"
    }

    let vegNonVeg: FoodVegCategory = "VEG"
    if (formData.dietaryType.toLowerCase().includes("both")) {
      vegNonVeg = "BOTH"
    } else if (formData.dietaryType.includes("Non-Vegetarian") || formData.dietaryType === "NON_VEG") {
      vegNonVeg = "NON_VEG"
    }

    let unitVal: "portions" | "kg" | "packets" | "litres" = "portions"
    if (formData.unit.includes("kg")) unitVal = "kg"
    else if (formData.unit.includes("liter")) unitVal = "litres"
    else if (formData.unit.includes("pack") || formData.unit.includes("box")) unitVal = "packets"

    let storageCond: StorageCondition = "HOT_HEATED"
    if (formData.storageCondition.includes("Refrigerated")) storageCond = "REFRIGERATED"
    else if (formData.storageCondition.includes("Frozen")) storageCond = "FROZEN"
    else if (formData.storageCondition.includes("Room")) storageCond = "ROOM_TEMPERATURE"

    let packagingCond: PackagingCondition = "FOOD_GRADE_DISPOSABLE"
    if (formData.packagingCondition.includes("Sealed")) packagingCond = "COMMERCIAL_SEALED"
    else if (formData.packagingCondition.includes("Pots") || formData.packagingCondition.includes("Handis")) packagingCond = "STAINLESS_STEEL_VATS"
    else if (formData.packagingCondition.includes("Cardboard")) packagingCond = "CORRUGATED_BOXES"

    const now = new Date()
    const prepDate = formData.preparedAt ? new Date(formData.preparedAt) : new Date(now.getTime() - 60 * 60 * 1000)
    // Default safe deadline to 4 hours from now if text was passed
    const deadlineDate = new Date(now.getTime() + 4 * 60 * 60 * 1000)

    const pickupCoords = getVizagAreaCoordinates(formData.pickupArea)

    // Build raw payload for validation
    const rawPayload = {
      foodName: formData.foodName.trim(),
      foodCategory,
      vegNonVeg,
      quantity: Number(formData.quantity),
      unit: unitVal,
      preparedAt: prepDate,
      safeConsumptionDeadline: deadlineDate,
      storageCondition: storageCond,
      packagingCondition: packagingCond,
      allergens: formData.allergens && formData.allergens.toLowerCase() !== "none"
        ? formData.allergens.split(",").map((s) => s.trim())
        : [],
      notes: formData.notes?.trim() || undefined,
      photoReferences: [],
      pickupAddress: {
        street: formData.pickupAddress.trim(),
        area: formData.pickupArea,
        city: "Visakhapatnam",
        postalCode: "530003",
        instructions: formData.pickupWindow,
      },
      pickupLocation: {
        type: "Point" as const,
        coordinates: pickupCoords,
      },
      pickupAvailabilityWindow: {
        start: now,
        end: new Date(now.getTime() + 3 * 60 * 60 * 1000),
      },
      donorAcknowledgement: {
        accepted: true as const,
        statement: "Surplus food inspected and wholesome at time of logging.",
      },
    }

    // 2. Validate using Zod schema
    const validationResult = DonationCreateSchema.safeParse(rawPayload)
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of validationResult.error.issues) {
        const path = issue.path.join(".")
        fieldErrors[path] = issue.message
      }
      return {
        success: false,
        errors: fieldErrors,
        message: "Validation failed. Please review the highlighted fields.",
      }
    }

    const validatedData = validationResult.data

    // 3. Resolve donor identity from session or guest intake
    const auth = await getCurrentUser()
    const user = auth?.user
    let resolvedDonorId = "PENDING_GUEST"
    let actorId = "GUEST"

    if (user && user.role === "DONOR") {
      const donorProfile = await repositories.donors.findByUserId(user._id)
      resolvedDonorId = donorProfile?._id || user._id
      actorId = user._id
    }

    const createdDonation = await repositories.donations.create({
      ...validatedData,
      donorId: resolvedDonorId,
      donorAcknowledgement: {
        ...validatedData.donorAcknowledgement,
        timestamp: new Date(),
      },
    })

    // If guest donation, set HTTP-Only reference cookie for later account binding
    if (resolvedDonorId === "PENDING_GUEST") {
      const cookieStore = await cookies()
      cookieStore.set("fc_pending_donation_id", createdDonation._id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    // 4. Generate intelligent matches using real Haversine distance engine
    const activeNeeds = await repositories.needs.findAll({
      status: ["ACTIVE", "PARTIALLY_FULFILLED"],
    })
    const allNgos = await repositories.ngos.findAll()
    const ngoMap = new Map(allNgos.map((n) => [n._id, n]))

    const matchRecommendations: MatchRecommendation[] = []

    for (const need of activeNeeds) {
      const ngo = ngoMap.get(need.ngoId)
      if (!ngo) continue

      const evaluation = evaluateDonationNeedMatch(createdDonation, need, ngo)

      // Only propose matches meeting compatibility threshold (>= 60%)
      if (evaluation.score >= 60) {
        const matchRecord = await repositories.matches.create({
          donationId: createdDonation._id,
          needId: need._id,
          ngoId: need.ngoId,
          score: evaluation.score,
          distanceKm: evaluation.distanceKm,
          factorScores: evaluation.factorScores,
          explanation: evaluation.explanation,
          status: "PROPOSED",
          proposedAt: now,
          expiresAt: new Date(now.getTime() + 4 * 60 * 60 * 1000),
        })

        matchRecommendations.push({
          matchId: matchRecord._id,
          needId: need._id,
          ngoId: need.ngoId,
          ngoName: ngo.ngoName,
          ngoArea: need.location.area,
          beneficiaryCategory: need.beneficiaryCategory,
          quantityRemaining: need.quantityRemaining,
          unit: need.unit,
          urgency: need.urgency,
          distanceKm: evaluation.distanceKm,
          matchScore: evaluation.score,
          summary: evaluation.explanation.summary,
        })
      }
    }

    // Sort best matches first
    matchRecommendations.sort((a, b) => b.matchScore - a.matchScore)

    // 5. Append immutable audit log
    await repositories.auditLogs.append({
      actorId,
      actorRole: "DONOR",
      action: "DONATION_CREATED",
      entityType: "Donation",
      entityId: createdDonation._id,
      newState: {
        foodName: createdDonation.foodName,
        quantity: createdDonation.quantity,
        unit: createdDonation.unit,
        pickupArea: createdDonation.pickupAddress.area,
        donorId: resolvedDonorId,
      },
      metadata: {
        matchesGenerated: matchRecommendations.length,
        channel: "Web Intake Form (/donate)",
        isGuestIntake: resolvedDonorId === "PENDING_GUEST",
      },
    })

    // 6. Create in-app notification if user is authenticated
    if (user) {
      await repositories.notifications.create({
        userId: user._id,
        eventType: "DONATION_ACCEPTED",
        title: "Surplus Food Lot Registered",
        message: `Your donation of ${createdDonation.quantity} ${createdDonation.unit} (${createdDonation.foodName}) has been logged and matched to ${matchRecommendations.length} verified NGOs in Vizag.`,
        entityType: "Donation",
        entityId: createdDonation._id,
      })
    }

    return {
      success: true,
      donation: createdDonation,
      matches: matchRecommendations,
      message: "Surplus food listing successfully registered in prototype repository.",
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error processing donation"
    return {
      success: false,
      message,
    }
  }
}

/**
 * Binds any pending guest donation reference to an authenticated donor account.
 * Called automatically upon donor login or registration.
 */
export async function bindPendingGuestDonation(authenticatedDonorId: string): Promise<{ bound: boolean; donationId?: string }> {
  try {
    const cookieStore = await cookies()
    const pendingDonationId = cookieStore.get("fc_pending_donation_id")?.value
    if (!pendingDonationId) {
      return { bound: false }
    }

    const donation = await repositories.donations.findById(pendingDonationId)
    if (donation && (donation.donorId === "PENDING_GUEST" || donation.donorId.startsWith("PENDING_"))) {
      await repositories.donations.update(pendingDonationId, {
        donorId: authenticatedDonorId,
      })

      await repositories.auditLogs.append({
        actorId: authenticatedDonorId,
        actorRole: "DONOR",
        action: "DONATION_STATUS_CHANGED",
        entityType: "Donation",
        entityId: pendingDonationId,
        metadata: {
          event: "GUEST_DONATION_BOUND",
          boundToUserId: authenticatedDonorId,
        },
      })

      // Clean up the cookie
      cookieStore.delete("fc_pending_donation_id")
      return { bound: true, donationId: pendingDonationId }
    }

    return { bound: false }
  } catch (err) {
    console.error("Error binding guest donation:", err)
    return { bound: false }
  }
}

