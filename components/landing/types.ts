/**
 * FOODCONNECT — Landing & Live Activity Dashboard Type Definitions
 * Strict TypeScript contracts for interactive motion, radar telemetry, and live feeds.
 */

export type FoodType = "VEG" | "NON_VEG" | "BAKERY" | "PRODUCE"

export type TelemetryStatus = 
  | "AVAILABLE" 
  | "MATCHED" 
  | "IN_TRANSIT" 
  | "DISTRIBUTED" 
  | "VERIFIED"

export type UrgencyLevel = "IMMEDIATE" | "HIGH" | "NORMAL"

export interface RadarNode {
  id: string
  name: string
  area: string
  coords: { x: number; y: number } // percentage coordinate on radar plane
  meals: number
  foodType: FoodType
  urgency: UrgencyLevel
  status: TelemetryStatus
  expiryMinutes: number
  donor: string
  matchedNgo?: string
  temperature?: string
}

export interface PhotoProofItem {
  id: string
  imageUrl: string
  title: string
  location: string
  ngoName: string
  mealsDistributed: number
  timestamp: string
  verifiedBy: string
  fssaiCompliant: boolean
}

export interface FeedDonationItem {
  id: string
  donorName: string
  area: string
  meals: number
  foodType: FoodType
  status: TelemetryStatus
  timeAgo: string
  ngoName?: string
  volunteer?: string
}

export interface MetricCounterItem {
  id: string
  label: string
  value: number
  suffix?: string
  prefix?: string
  description: string
  accent: "emerald" | "amber" | "cobalt"
}

export interface StageDetails {
  id: string
  stepNumber: string
  title: string
  subtitle: string
  description: string
  badge: string
  stats: { label: string; value: string }[]
  accentColor: string
}
