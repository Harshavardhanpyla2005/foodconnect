"use server"

/**
 * FoodConnect — Verified NGOs Directory Server Actions
 *
 * Retrieves verified community food partners and their verified storage /
 * collection capacities from the database-agnostic repository layer.
 */

import { repositories } from "@/lib/repositories"

export interface FormattedNgoRecord {
  id: string
  name: string
  area: string
  communitiesServed: string
  capacity: string
  pickupRadius: string
  foodTypes: string[]
  storageFacilities: string
  verifiedSince: string
  verificationStatus: string
  coordinates: [number, number]
  isMockDemoData: boolean
}

function formatFoodType(t: string): string {
  switch (t) {
    case "COOKED_MEALS":
      return "Cooked Meals"
    case "RAW_GRAINS_PULSES":
      return "Raw Grains & Staples"
    case "FRESH_PRODUCE":
      return "Fresh Fruits & Produce"
    case "BAKERY_ITEMS":
      return "Bakery & Bread"
    case "PACKAGED_FOODS":
      return "Packaged Food"
    case "DAIRY":
      return "Dairy & Milk"
    case "BEVERAGES":
      return "Beverages"
    default:
      return t
  }
}

function formatStorage(facilities: string[]): string {
  const map: Record<string, string> = {
    COMMERCIAL_REFRIGERATION: "Commercial refrigeration",
    THERMAL_WARMERS: "Hot holding insulated warmers",
    DRY_VENTILATED_PANTRY: "Dry ventilated pantry depot",
    DEEP_FREEZER: "Deep freezer unit",
    NONE: "Direct distribution without storage",
  }
  return facilities.map((f) => map[f] || f).join(", ")
}

export async function getVerifiedNgosAction(): Promise<FormattedNgoRecord[]> {
  const ngos = await repositories.ngos.findAll({ verifiedOnly: true })

  return ngos.map((ngo) => ({
    id: ngo._id,
    name: ngo.ngoName,
    area: `${ngo.address.area}`,
    communitiesServed: ngo.communitiesServed.join(" • "),
    capacity: `${ngo.maximumMealCapacityPerDay} meals / day`,
    pickupRadius: `Up to ${ngo.pickupRadiusKm} km from ${ngo.address.area}`,
    foodTypes: ngo.foodTypesAccepted.map(formatFoodType),
    storageFacilities: formatStorage(ngo.storageFacilities),
    verifiedSince: "Verified Partner (Vizag Pilot)",
    verificationStatus: ngo.verificationStatus,
    coordinates: ngo.location.coordinates,
    isMockDemoData: true,
  }))
}
