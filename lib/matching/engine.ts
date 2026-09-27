/**
 * FoodConnect — Smart Matching Engine (Explainable Algorithmic Compatibility)
 *
 * Evaluates compatibility between surplus food listings and accredited NGO active needs
 * across Visakhapatnam using true Haversine distance, storage safety constraints, dietary
 * rules, and capacity limits.
 *
 * NOTE: Matching produces transparent recommendations; it NEVER silently transfers ownership.
 */

import { IDonation, INeed, INGOProfile, IMatchFactorScores } from "@/types/database"
import { calculateDistanceKm, getCoordinatesForArea } from "@/lib/utils/geo"

export interface EvaluatedMatchResult {
  score: number // 0 - 100
  distanceKm: number
  factorScores: IMatchFactorScores
  explanation: {
    summary: string
    positiveFactors: string[]
    riskFactors: string[]
  }
}

/**
 * Computes multidimensional match metrics between a donation and an active NGO need.
 */
export function evaluateDonationNeedMatch(
  donation: IDonation,
  need: INeed,
  ngo?: INGOProfile | null
): EvaluatedMatchResult {
  // 1. Precise Haversine distance calculation using GeoJSON coordinates
  const donationCoords: [number, number] =
    donation.pickupLocation?.coordinates || getCoordinatesForArea(donation.pickupAddress.area)

  const needCoords: [number, number] =
    need.geoPoint?.coordinates || (ngo ? ngo.location.coordinates : getCoordinatesForArea(need.location.area))

  const distanceKm = calculateDistanceKm(donationCoords, needCoords)

  // Distance scoring (0 - 100)
  let distanceScore = 100
  if (distanceKm <= 2.0) {
    distanceScore = 98
  } else if (distanceKm <= 5.0) {
    distanceScore = 90
  } else if (distanceKm <= 10.0) {
    distanceScore = 78
  } else if (distanceKm <= 15.0) {
    distanceScore = 60
  } else {
    distanceScore = Math.max(20, 100 - distanceKm * 4)
  }

  // 2. Food Category & Dietary Compatibility (0 - 100)
  const isDirectCategoryMatch = donation.foodCategory === need.foodType
  let foodCompatibilityScore = isDirectCategoryMatch ? 100 : 70

  // Dietary preference check
  let dietaryMatch = true
  if (need.dietaryRequirements === "PURE_VEG" && donation.vegNonVeg === "NON_VEG") {
    dietaryMatch = false
    foodCompatibilityScore = 10 // Incompatible with pure veg shelter
  } else if (need.dietaryRequirements === "PURE_VEG" && donation.vegNonVeg === "BOTH") {
    // Contains non-veg elements; shelters strictly requiring pure veg cannot take mixed lots
    dietaryMatch = false
    foodCompatibilityScore = 20
  } else if (donation.vegNonVeg === "VEG") {
    foodCompatibilityScore = Math.min(100, foodCompatibilityScore + 10)
  } else if (donation.vegNonVeg === "BOTH" && (need.dietaryRequirements === "VEG_AND_NON_VEG" || need.dietaryRequirements === "NO_RESTRICTION")) {
    foodCompatibilityScore = Math.min(100, foodCompatibilityScore + 10)
  }

  // 3. Quantity Alignment (0 - 100)
  const donationUnits = donation.quantity
  const needRemaining = need.quantityRemaining

  let quantityAlignmentScore = 80
  if (donationUnits >= needRemaining * 0.8 && donationUnits <= needRemaining * 1.5) {
    quantityAlignmentScore = 98 // Near-optimal batch match
  } else if (donationUnits < needRemaining * 0.8) {
    quantityAlignmentScore = Math.max(50, Math.round((donationUnits / needRemaining) * 100))
  } else {
    quantityAlignmentScore = 85
  }

  // 4. Urgency Score (0 - 100)
  const urgencyScore = need.urgency === "IMMEDIATE" ? 100 : need.urgency === "HIGH" ? 85 : 70

  // 5. Deadline & Consumption Safety Score (0 - 100)
  const now = Date.now()
  const expiryTime = new Date(donation.safeConsumptionDeadline).getTime()
  const hoursRemaining = Math.max(0, (expiryTime - now) / (1000 * 60 * 60))

  let deadlineScore = 85
  if (hoursRemaining < 2) {
    deadlineScore = need.urgency === "IMMEDIATE" ? 95 : 45
  } else if (hoursRemaining < 5) {
    deadlineScore = 90
  } else {
    deadlineScore = 95
  }

  // 6. Storage & Handling Safety Capacity Score (0 - 100)
  let storageCapacityScore = 80
  if (ngo) {
    const requiresHot = donation.storageCondition === "HOT_HEATED"
    const requiresCold = donation.storageCondition === "REFRIGERATED" || donation.storageCondition === "FROZEN"

    if (requiresHot && ngo.storageFacilities.includes("THERMAL_WARMERS")) {
      storageCapacityScore = 95
    } else if (requiresCold && (ngo.storageFacilities.includes("COMMERCIAL_REFRIGERATION") || ngo.storageFacilities.includes("DEEP_FREEZER"))) {
      storageCapacityScore = 95
    } else if (requiresCold || requiresHot) {
      storageCapacityScore = 65
    }
  }

  // Weighted composite score calculation adhering to Section 11 Five-Factor Standard:
  // 1. Distance Proximity: 35%
  // 2. Dietary Compatibility: 25%
  // 3. Urgency: 20%
  // 4. NGO Intake Capacity: 10%
  // 5. Freshness & Transit Buffer: 10%
  const compositeScore = Math.round(
    distanceScore * 0.35 +
      foodCompatibilityScore * 0.25 +
      urgencyScore * 0.20 +
      quantityAlignmentScore * 0.10 +
      deadlineScore * 0.10
  )

  // Construct explainability factors
  const positiveFactors: string[] = []
  const riskFactors: string[] = []

  if (distanceKm <= 4.0) {
    positiveFactors.push(`Close transit corridor (${distanceKm} km between ${donation.pickupAddress.area} and ${need.location.area})`)
  } else {
    riskFactors.push(`Distance is ${distanceKm} km; requires reliable courier coordination`)
  }

  if (dietaryMatch) {
    positiveFactors.push(`Compatible dietary profile (${donation.vegNonVeg} matches ${need.dietaryRequirements})`)
  } else {
    riskFactors.push(`Dietary mismatch: ${donation.vegNonVeg} not accepted by ${need.dietaryRequirements} facility`)
  }

  if (isDirectCategoryMatch) {
    positiveFactors.push(`Exact food category match: ${donation.foodCategory.replace(/_/g, " ")}`)
  }

  if (hoursRemaining <= 3) {
    riskFactors.push(`Critical consumption window: ${Math.round(hoursRemaining)} hours remaining`)
  } else {
    positiveFactors.push(`Adequate safety window: ~${Math.round(hoursRemaining)} hours until consumption deadline`)
  }

  if (ngo?.storageFacilities && ngo.storageFacilities.length > 0) {
    positiveFactors.push(`Verified NGO storage infrastructure available (${ngo.storageFacilities.join(", ")})`)
  }

  const factorScores: IMatchFactorScores = {
    distanceScore,
    foodCompatibilityScore,
    quantityAlignmentScore,
    urgencyScore,
    deadlineScore,
    storageCapacityScore,
  }

  const explanation = {
    summary: `${compositeScore}% match: ${donation.foodName} (${donation.quantity} ${donation.unit}) for ${need.beneficiaryCategory} in ${need.location.area}.`,
    positiveFactors,
    riskFactors,
  }

  return {
    score: Math.min(100, Math.max(0, compositeScore)),
    distanceKm,
    factorScores,
    explanation,
  }
}
