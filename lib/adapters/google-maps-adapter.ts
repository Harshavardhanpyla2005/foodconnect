/**
 * FoodConnect — Optional Google Maps Platform Adapter
 *
 * Prepared using Antigravity Google Maps Platform Skill guidelines.
 * Governed by the Strict Local Prototype Rule:
 * - Local vector SVG map representation by default.
 * - Zero mandatory external API keys or billing requirements.
 * - Ready for optional Google Maps JavaScript API (Maps SDK / Dynamic Maps)
 *   when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is configured.
 * - Supports public Maps Demo Key for billing-free prototyping if needed.
 */

import { VIZAG_CENTER } from "@/lib/constants/vizag-map-data"
import { MapLocation } from "@/lib/types/map"

export interface GoogleMapsConfiguration {
  apiKey?: string
  isGoogleMapsEnabled: boolean
  mapType: "google-maps-dynamic" | "local-vector-svg"
  center: {
    lat: number
    lng: number
    zoom: number
  }
}

/**
 * Returns current map provider configuration.
 * Defaults to local vector SVG map without an API key.
 */
export function getGoogleMapsConfig(): GoogleMapsConfiguration {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (apiKey && apiKey.trim() !== "" && apiKey !== "optional_for_production") {
    return {
      apiKey,
      isGoogleMapsEnabled: true,
      mapType: "google-maps-dynamic",
      center: {
        lat: VIZAG_CENTER.latitude,
        lng: VIZAG_CENTER.longitude,
        zoom: VIZAG_CENTER.zoom,
      },
    }
  }

  return {
    isGoogleMapsEnabled: false,
    mapType: "local-vector-svg",
    center: {
      lat: VIZAG_CENTER.latitude,
      lng: VIZAG_CENTER.longitude,
      zoom: VIZAG_CENTER.zoom,
    },
  }
}

/**
 * Converts internal MapLocation models to Google Maps Marker options format.
 */
export function mapLocationToGoogleMarker(location: MapLocation): {
  position: { lat: number; lng: number }
  title: string
  label?: string
} {
  return {
    position: {
      lat: location.latitude,
      lng: location.longitude,
    },
    title: `${location.name} (${location.area})`,
    label: location.type === "ngo" ? "NGO" : location.type === "donation" ? "FOOD" : "NEED",
  }
}
