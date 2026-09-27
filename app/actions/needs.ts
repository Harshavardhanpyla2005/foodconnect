"use server"

/**
 * FoodConnect — Community Food Needs Server Actions
 *
 * Fetches and filters active food needs published by verified NGOs in
 * Visakhapatnam from the database-agnostic repository layer.
 */

import { repositories } from "@/lib/repositories"
import { FoodType, NeedUrgency, NeedStatus } from "@/types/database"
import { FoodConnectStatus } from "@/lib/constants/status"

export interface EnrichedNeedItem {
  id: string
  ngoId: string
  ngoName: string
  category: string
  area: string
  peopleCount: number
  quantity: string
  foodType: string
  rawFoodType: FoodType
  urgency: "Immediate" | "High" | "Flexible"
  rawUrgency: NeedUrgency
  requiredBy: string
  status: FoodConnectStatus
  rawStatus: NeedStatus
  notes: string
  quantityRemaining: number
  quantityFulfilled: number
  unit: string
  isMockDemoData: boolean
}

function mapFoodTypeToLabel(type: FoodType): string {
  switch (type) {
    case "COOKED_MEALS":
      return "Cooked Meals & Prepared Trays"
    case "RAW_GRAINS_PULSES":
      return "Raw Groceries & Staples"
    case "BAKERY_ITEMS":
    case "FRESH_PRODUCE":
      return "Bakery & Fresh Produce"
    case "PACKAGED_FOODS":
    case "DAIRY":
    case "BEVERAGES":
      return "Packaged Food & Snacks"
    default:
      return "Cooked Meals & Prepared Trays"
  }
}

function mapUrgencyToLabel(urgency: NeedUrgency): "Immediate" | "High" | "Flexible" {
  switch (urgency) {
    case "IMMEDIATE":
      return "Immediate"
    case "HIGH":
      return "High"
    case "FLEXIBLE":
      return "Flexible"
  }
}

function mapStatusToLabel(status: NeedStatus): FoodConnectStatus {
  switch (status) {
    case "ACTIVE":
      return "Active Need"
    case "PARTIALLY_FULFILLED":
      return "Partially Fulfilled"
    case "FULFILLED":
      return "Fulfilled"
    case "DRAFT":
      return "Pending"
    case "CLOSED":
    case "EXPIRED":
      return "Expired"
    default:
      return "Active Need"
  }
}

function formatRelativeTime(date: Date): string {
  const diffHours = Math.round((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60))
  if (diffHours <= 0) return "Urgent / Immediate"
  if (diffHours < 4) return `Within ${diffHours} hours (Today)`
  if (diffHours <= 24) return `Within 24 hours`
  const days = Math.round(diffHours / 24)
  return `Within ${days} days`
}

export async function getFoodNeedsAction(filter?: {
  area?: string
  foodType?: string
  urgency?: string
  status?: NeedStatus[]
}): Promise<EnrichedNeedItem[]> {
  // Query repository
  const needs = await repositories.needs.findAll()
  const allNgos = await repositories.ngos.findAll()
  const ngoMap = new Map(allNgos.map((n) => [n._id, n.ngoName]))

  const enriched: EnrichedNeedItem[] = needs.map((need) => {
    const ngoName = ngoMap.get(need.ngoId) || "Verified Community Partner"
    const labelFoodType = mapFoodTypeToLabel(need.foodType)
    const labelUrgency = mapUrgencyToLabel(need.urgency)
    const labelStatus = mapStatusToLabel(need.status)

    return {
      id: need._id,
      ngoId: need.ngoId,
      ngoName,
      category: need.beneficiaryCategory,
      area: need.location.area,
      peopleCount: need.peopleNeedingFood,
      quantity: `${need.quantityRequired} ${need.unit}`,
      foodType: labelFoodType,
      rawFoodType: need.foodType,
      urgency: labelUrgency,
      rawUrgency: need.urgency,
      requiredBy: formatRelativeTime(need.requiredBy),
      status: labelStatus,
      rawStatus: need.status,
      notes: need.additionalRequirements || "Verified nutritional requirement for local beneficiaries.",
      quantityRemaining: need.quantityRemaining,
      quantityFulfilled: need.quantityFulfilled,
      unit: need.unit,
      isMockDemoData: true,
    }
  })

  // Apply optional filters if specified
  return enriched.filter((item) => {
    if (filter?.area && filter.area !== "All" && item.area !== filter.area) {
      return false
    }
    if (filter?.foodType && filter.foodType !== "All" && item.foodType !== filter.foodType) {
      return false
    }
    if (filter?.urgency && filter.urgency !== "All" && item.urgency !== filter.urgency) {
      return false
    }
    if (filter?.status && !filter.status.includes(item.rawStatus)) {
      return false
    }
    return true
  })
}
