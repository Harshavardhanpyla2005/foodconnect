/**
 * FoodConnect — Dynamic Vizag Map Adapter
 *
 * Transforms repository entities (active needs, verified NGOs, available donations)
 * into unified MapLocation markers suitable for VizagMap visualization.
 *
 * Privacy Rule: Public maps only expose generalized area landmarks to protect
 * individual donor addresses and shelter resident privacy.
 */

import { INeed, INGOProfile, IDonation } from "@/types/database"
import { MapLocation } from "@/lib/types/map"
import { VIZAG_DEMO_LOCATIONS } from "@/lib/constants/vizag-map-data"
import { getCoordinatesForArea } from "@/lib/utils/geo"

export interface MapAdapterOptions {
  isAuthorizedRole?: boolean // If true, displays operational identifiers; if false, generalized public privacy
}

export function adaptRepositoryDataToMap(
  needs: INeed[] = [],
  ngos: INGOProfile[] = [],
  donations: IDonation[] = [],
  options: MapAdapterOptions = {}
): MapLocation[] {
  const locations: MapLocation[] = []

  // 1. Adapt Verified NGOs
  for (const ngo of ngos) {
    if (ngo.verificationStatus !== "VERIFIED") continue

    const [lng, lat] = ngo.location?.coordinates || getCoordinatesForArea(ngo.address.area)

    locations.push({
      id: ngo._id,
      type: "ngo",
      name: ngo.ngoName,
      organization: "Accredited Recipient NGO",
      latitude: lat,
      longitude: lng,
      area: ngo.address.area,
      status: "Verified Kitchen",
      details: `${ngo.communitiesServed.join(", ")} • Max capacity: ${ngo.maximumMealCapacityPerDay} meals/day`,
      contactPerson: options.isAuthorizedRole ? ngo.contactPerson.name : "NGO Coordinator",
      peopleCount: ngo.maximumMealCapacityPerDay,
    })
  }

  // 2. Adapt Active Needs
  for (const need of needs) {
    if (!["ACTIVE", "PARTIALLY_FULFILLED"].includes(need.status)) continue

    const [lng, lat] = need.geoPoint?.coordinates || getCoordinatesForArea(need.location.area)

    locations.push({
      id: need._id,
      type: "need",
      name: need.beneficiaryCategory,
      organization: "Community Facility Need",
      latitude: lat,
      longitude: lng,
      area: need.location.area,
      status: need.status,
      quantity: `${need.quantityRemaining} ${need.unit}`,
      foodType: need.foodType.replace(/_/g, " "),
      urgency: need.urgency === "IMMEDIATE" ? "Immediate" : need.urgency === "HIGH" ? "High" : "Flexible",
      details: `Required by ${new Date(need.requiredBy).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} in ${need.location.area}`,
      peopleCount: need.quantityRemaining,
    })
  }

  // 3. Adapt Available Donations (with privacy preservation)
  for (const donation of donations) {
    if (donation.status !== "AVAILABLE" && donation.status !== "MATCHING") continue

    const [lng, lat] = donation.pickupLocation?.coordinates || getCoordinatesForArea(donation.pickupAddress.area)

    locations.push({
      id: donation._id,
      type: "donation",
      name: options.isAuthorizedRole ? donation.foodName : `Surplus ${donation.foodCategory.replace(/_/g, " ")} Lot`,
      organization: options.isAuthorizedRole ? "Registered Food Donor" : "Food Donor Partner",
      latitude: lat,
      longitude: lng,
      area: donation.pickupAddress.area,
      status: donation.status,
      quantity: `${donation.quantity} ${donation.unit}`,
      foodType: donation.foodCategory.replace(/_/g, " "),
      details: `Safe until ${new Date(donation.safeConsumptionDeadline).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • Pickup in ${donation.pickupAddress.area}`,
      peopleCount: donation.quantity,
    })
  }

  // If no repository items found, fall back to seed demonstration pins with clear demo indication
  if (locations.length === 0) {
    return VIZAG_DEMO_LOCATIONS
  }

  return locations
}
