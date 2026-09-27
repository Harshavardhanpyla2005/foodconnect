/**
 * FoodConnect — Geospatial Utilities & Haversine Distance Engine
 *
 * Computes actual great-circle distances across the Visakhapatnam operational corridor
 * using GeoJSON coordinates [longitude, latitude].
 */

/**
 * Calculates great-circle distance between two points on the earth in kilometers
 * using the Haversine formula.
 *
 * @param coord1 [longitude, latitude] of point 1
 * @param coord2 [longitude, latitude] of point 2
 * @returns distance in kilometers (rounded to 1 decimal place)
 */
export function calculateDistanceKm(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lon1, lat1] = coord1
  const [lon2, lat2] = coord2

  const R = 6371 // Earth's mean radius in km

  const toRad = (deg: number) => (deg * Math.PI) / 180

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  // Return formatted to one decimal place, e.g., 3.2 km
  return Math.round(distance * 10) / 10
}

/**
 * Known operational landmark coordinates in Visakhapatnam for fallback/mock resolution
 */
export const VIZAG_LANDMARK_COORDINATES: Record<string, [number, number]> = {
  "Siripuram": [83.3155, 17.7215],
  "MVP Colony": [83.3364, 17.7412],
  "Beach Road": [83.3242, 17.7138],
  "Gajuwaka": [83.2185, 17.6908],
  "Madhurawada": [83.3524, 17.8021],
  "Rushikonda": [83.3855, 17.7816],
  "Dwaraka Nagar": [83.3082, 17.7259],
  "Akkayyapalem": [83.2985, 17.7312],
  "Seethammadhara": [83.3142, 17.7425],
  "NAD": [83.2294, 17.7431],
  "Kurmannapalem": [83.1704, 17.6742],
  "Pendurthi": [83.2012, 17.8285],
  "Gopalapatnam": [83.2385, 17.7562],
  "Kancharapalem": [83.2785, 17.7285],
  "Maddilapalem": [83.3265, 17.7385],
  "Jagadamba Junction": [83.3005, 17.7107],
  "Jagadamba Center": [83.3005, 17.7107],
  "Waltair": [83.3195, 17.7265],
  "Waltair Uplands": [83.3195, 17.7265],
  "Yendada": [83.3542, 17.7785],
}

/**
 * Resolves coordinate pair for a given Vizag area name, falling back to Siripuram city center.
 */
export function getCoordinatesForArea(area: string): [number, number] {
  return VIZAG_LANDMARK_COORDINATES[area] || [83.3155, 17.7215]
}
