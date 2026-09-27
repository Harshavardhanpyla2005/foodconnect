"use client"

import * as React from "react"
import { motion } from "motion/react"
import {
  MapPin,
  Building2,
  Truck,
  Navigation,
  Layers,
  Compass,
  Radio,
  Clock,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react"
import { ICollection, IDonation, INGOProfile } from "@/types/database"
import { cn } from "@/lib/utils"

interface LiveDeliveryMapProps {
  collection: ICollection
  donation: Partial<IDonation> | null
  ngo: Partial<INGOProfile> | null
  hasGps: boolean
  lastGpsUpdate: Date | null
  className?: string
}

// Vizag bounding box for standard corridor projection
// lat: ~17.68 to ~17.78, lng: ~83.24 to ~83.36
const MIN_LAT = 17.68
const MAX_LAT = 17.78
const MIN_LNG = 83.24
const MAX_LNG = 83.36

function getPercentCoords(lat: number, lng: number) {
  const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 100
  // Invert y: latitude increases northwards, CSS top increases southwards
  const y = (1 - (lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * 100
  return {
    x: Math.max(10, Math.min(90, x)),
    y: Math.max(12, Math.min(88, y)),
  }
}

// Calculate Haversine distance in km
function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function LiveDeliveryMap({
  collection,
  donation,
  ngo,
  hasGps,
  lastGpsUpdate,
  className,
}: LiveDeliveryMapProps) {
  const [showHeatmap, setShowHeatmap] = React.useState(true)
  const [now, setNow] = React.useState<number>(0)

  // Refresh relative time every 2 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => setNow(Date.now()), 0)
    const interval = setInterval(() => setNow(Date.now()), 2000)
    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [])

  // 1. Donor Pickup Coordinates (Default: Jagadamba corridor)
  const donorLat = donation?.pickupLocation?.coordinates?.[1] ?? 17.7126
  const donorLng = donation?.pickupLocation?.coordinates?.[0] ?? 83.2982

  // 2. NGO Destination Coordinates (Default: Siripuram / Beach Road facility)
  const ngoLat = 17.7289
  const ngoLng = 83.3156

  // 3. Volunteer Position
  // If real GPS received from volunteer browser: use actual coordinates
  // Otherwise estimate along corridor based on state
  let volLat = donorLat
  let volLng = donorLng

  if (hasGps && collection.currentLocation) {
    volLat = collection.currentLocation.latitude
    volLng = collection.currentLocation.longitude
  } else {
    if (
      collection.status === "CLAIMED" ||
      collection.status === "ASSIGNED" ||
      collection.status === "HEADING_TO_DONOR"
    ) {
      // Approach donor from south-west
      volLat = donorLat - 0.008
      volLng = donorLng - 0.006
    } else if (
      collection.status === "ARRIVED_AT_DONOR" ||
      collection.status === "PICKED_UP" ||
      collection.status === "COLLECTED"
    ) {
      volLat = donorLat
      volLng = donorLng
    } else if (collection.status === "IN_TRANSIT") {
      // Midpoint on corridor
      volLat = (donorLat + ngoLat) / 2
      volLng = (donorLng + ngoLng) / 2
    } else {
      // At NGO facility
      volLat = ngoLat
      volLng = ngoLng
    }
  }

  const donorPos = getPercentCoords(donorLat, donorLng)
  const ngoPos = getPercentCoords(ngoLat, ngoLng)
  const volPos = getPercentCoords(volLat, volLng)

  // Calculate distance remaining to NGO
  const distanceToNgo = calculateDistanceKm(volLat, volLng, ngoLat, ngoLng)

  // Dynamic timestamp string
  const timeSinceGpsUpdate = React.useMemo(() => {
    if (!lastGpsUpdate) return null
    const diffSec = Math.max(0, Math.floor((now - lastGpsUpdate.getTime()) / 1000))
    if (diffSec < 5) return "Updated just now"
    if (diffSec < 60) return `Updated ${diffSec}s ago`
    const diffMin = Math.floor(diffSec / 60)
    return `Updated ${diffMin}m ago`
  }, [lastGpsUpdate, now])

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-emerald-950/80 bg-[#07110D] shadow-lg flex flex-col",
        className || "h-[460px] md:h-[540px]"
      )}
      role="region"
      aria-label="Live Delivery Route Map"
    >
      {/* Top Map HUD Bar */}
      <div className="z-20 flex items-center justify-between border-b border-emerald-900/40 bg-[#07110D]/90 px-4 py-2.5 backdrop-blur-md text-xs">
        <div className="flex items-center gap-2">
          <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold uppercase tracking-wider text-emerald-400">
            Live Delivery Radar
          </span>
          <span className="text-[11px] text-zinc-400 hidden sm:inline">
            • Task #{collection._id.slice(-6)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Heatmap Layer Toggle */}
          <button
            type="button"
            onClick={() => setShowHeatmap((prev) => !prev)}
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all border",
              showHeatmap
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
            )}
            title="Toggle generalized network concentration layer"
          >
            <Layers className="size-3" />
            <span className="hidden sm:inline">Network Heat</span>
          </button>

          {/* GPS telemetry chip */}
          {hasGps ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Radio className="size-3 animate-ping text-emerald-400" />
              <span>{timeSinceGpsUpdate || "Live GPS Active"}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertCircle className="size-3 text-amber-400" />
              <span>Live location unavailable</span>
            </span>
          )}
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative flex-1 w-full overflow-hidden select-none bg-[#07110D]">
        {/* Dark Topographic / Street Grid Pattern */}
        <svg
          className="absolute inset-0 size-full pointer-events-none opacity-25"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="delivery-grid" width="36" height="36" patternUnits="userSpaceOnUse">
              <path
                d="M 36 0 L 0 0 0 36"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-emerald-900/60"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#delivery-grid)" />

          {/* Bay of Bengal Stylized Coastline (Eastern Edge) */}
          <path
            d="M 520 -40 Q 420 180 480 360 T 560 620"
            fill="none"
            stroke="currentColor"
            strokeWidth="48"
            strokeLinecap="round"
            className="text-sky-950/30"
          />
          <path
            d="M 520 -40 Q 420 180 480 360 T 560 620"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            className="text-sky-600/30"
          />
        </svg>

        {/* Generalized Network Heat Layer (Subtle anonymized concentration zones) */}
        {showHeatmap && (
          <div className="absolute inset-0 pointer-events-none transition-opacity duration-500">
            {/* Surplus Concentration: Jagadamba cluster (amber glow) */}
            <div
              style={{ left: `${donorPos.x}%`, top: `${donorPos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 size-36 rounded-full bg-amber-500/10 blur-2xl"
            />
            {/* NGO Need Hub: Siripuram cluster (blue glow) */}
            <div
              style={{ left: `${ngoPos.x}%`, top: `${ngoPos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 size-40 rounded-full bg-blue-500/10 blur-2xl"
            />
            {/* Active Corridor (emerald glow) */}
            <div
              style={{
                left: `${(donorPos.x + ngoPos.x) / 2}%`,
                top: `${(donorPos.y + ngoPos.y) / 2}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 size-48 rounded-full bg-emerald-500/10 blur-3xl"
            />
          </div>
        )}

        {/* Dynamic Route SVG Line connecting Donor -> Volunteer -> NGO */}
        <svg
          className="absolute inset-0 size-full pointer-events-none z-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#10B981" stopOpacity="1" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
            </linearGradient>
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Base Corridor Line (Dotted background trajectory) */}
          <line
            x1={`${donorPos.x}%`}
            y1={`${donorPos.y}%`}
            x2={`${ngoPos.x}%`}
            y2={`${ngoPos.y}%`}
            stroke="#10B981"
            strokeWidth="3"
            strokeDasharray="6 6"
            strokeOpacity="0.3"
          />

          {/* Active Segment from Donor to Volunteer */}
          <line
            x1={`${donorPos.x}%`}
            y1={`${donorPos.y}%`}
            x2={`${volPos.x}%`}
            y2={`${volPos.y}%`}
            stroke="url(#routeGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            filter="url(#routeGlow)"
          />

          {/* Active Segment from Volunteer to NGO (if in transit) */}
          {collection.status === "IN_TRANSIT" && (
            <line
              x1={`${volPos.x}%`}
              y1={`${volPos.y}%`}
              x2={`${ngoPos.x}%`}
              y2={`${ngoPos.y}%`}
              stroke="#10B981"
              strokeWidth="3"
              strokeDasharray="4 6"
              strokeOpacity="0.7"
            />
          )}
        </svg>

        {/* Landmark Zone Labels */}
        <div className="absolute top-4 left-5 pointer-events-none text-left">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            <Compass className="size-3.5" />
            <span>Visakhapatnam Corridor</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">
            Sector: Jagadamba — Siripuram Coastal
          </span>
        </div>

        <div className="absolute bottom-3 right-5 pointer-events-none text-right">
          <span className="text-[10px] font-bold text-sky-400/40 uppercase tracking-widest">
            Bay of Bengal
          </span>
        </div>

        {/* 1. DONOR PICKUP MARKER (Amber) */}
        <div
          style={{ left: `${donorPos.x}%`, top: `${donorPos.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-500"
        >
          <div className="group relative flex flex-col items-center">
            {/* Halo pulse */}
            <div className="absolute size-9 rounded-full bg-amber-500/20 animate-ping opacity-60" />
            {/* Pin body */}
            <div className="size-7 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-zinc-950 shadow-md">
              <MapPin className="size-4" />
            </div>
            {/* Tooltip / Label */}
            <div className="mt-1.5 whitespace-nowrap rounded-md bg-zinc-950/90 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300 shadow-md">
              Donor Pickup
            </div>
          </div>
        </div>

        {/* 2. RECIPIENT NGO DESTINATION MARKER (Blue / Emerald) */}
        <div
          style={{ left: `${ngoPos.x}%`, top: `${ngoPos.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-500"
        >
          <div className="group relative flex flex-col items-center">
            {/* Pin body */}
            <div className="size-7 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white shadow-md">
              <Building2 className="size-3.5" />
            </div>
            {/* Tooltip / Label */}
            <div className="mt-1.5 whitespace-nowrap rounded-md bg-zinc-950/90 border border-blue-500/40 px-2 py-0.5 text-[10px] font-bold text-blue-300 shadow-md">
              {ngo?.ngoName || "Recipient NGO"}
            </div>
          </div>
        </div>

        {/* 3. LIVE VOLUNTEER COURIER MARKER (Emerald with Live Pulse) */}
        <motion.div
          style={{ left: `${volPos.x}%`, top: `${volPos.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        >
          <div className="relative flex flex-col items-center">
            {/* Dynamic radar ripples */}
            <div className="absolute size-12 rounded-full bg-emerald-500/25 animate-ping opacity-80" />
            <div className="absolute size-8 rounded-full bg-emerald-500/30 animate-pulse" />

            {/* Courier Icon Pin */}
            <div className="size-9 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-zinc-950 shadow-lg">
              <Truck className="size-4.5" />
            </div>

            {/* Live Courier Badge */}
            <div className="mt-1 whitespace-nowrap rounded-full bg-emerald-950 border border-emerald-400 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-300 shadow-lg flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Courier</span>
            </div>
          </div>
        </motion.div>

        {/* Floating Telemetry Card in Bottom Corner */}
        <div className="absolute bottom-3 left-4 z-20 rounded-xl bg-zinc-950/90 border border-emerald-900/60 p-3 shadow-xl backdrop-blur-md text-xs space-y-1 max-w-[240px]">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <span>Status</span>
            <span className="text-emerald-400">
              {collection.status.replace(/_/g, " ")}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Distance to NGO:</span>
            <span className="font-bold text-foreground">
              {distanceToNgo < 0.2
                ? "At NGO Facility"
                : `~${distanceToNgo.toFixed(1)} km`}
            </span>
          </div>

          {hasGps && collection.currentLocation ? (
            <div className="text-[10px] font-mono text-zinc-400 pt-1 border-t border-zinc-800">
              GPS: {collection.currentLocation.latitude.toFixed(4)},{" "}
              {collection.currentLocation.longitude.toFixed(4)}
              {collection.currentLocation.accuracy && (
                <span> (±{Math.round(collection.currentLocation.accuracy)}m)</span>
              )}
            </div>
          ) : (
            <div className="text-[10px] text-amber-400/90 pt-1 border-t border-zinc-800 flex items-center gap-1">
              <AlertCircle className="size-3 shrink-0" />
              <span>Live location unavailable</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
