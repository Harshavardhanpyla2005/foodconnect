export type MapLocationType = "ngo" | "need" | "donation"

export interface MapLocation {
  id: string
  type: MapLocationType
  name: string
  organization?: string
  latitude: number
  longitude: number
  area: string
  status?: string
  quantity?: string
  foodType?: string
  urgency?: "Immediate" | "High" | "Flexible"
  details: string
  contactPerson?: string
  peopleCount?: number
}
