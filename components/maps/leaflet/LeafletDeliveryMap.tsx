"use client"

import React, { useEffect, useRef, useState, useMemo } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import {
  Navigation,
  MapPin,
  Building2,
  Truck,
  RotateCcw,
  Compass,
  Radio,
  Clock,
  ShieldCheck,
  Maximize2,
} from "lucide-react"
import { ICollection, IDonation, INGOProfile } from "@/types/database"

export interface LeafletDeliveryMapProps {
  collection: ICollection
  donation?: Partial<IDonation> | null
  ngo?: Partial<INGOProfile> | null
  hasGps?: boolean
  lastGpsUpdate?: Date | null
  className?: string
  height?: string
  showControls?: boolean
  onUseMyLocation?: () => void
}

// Calculate Haversine distance in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
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

export default function LeafletDeliveryMap({
  collection,
  donation,
  ngo,
  hasGps = false,
  lastGpsUpdate = null,
  className = "",
  height = "h-[420px]",
  showControls = true,
  onUseMyLocation,
}: LeafletDeliveryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<{
    donor?: L.Marker
    ngo?: L.Marker
    volunteer?: L.Marker
    polyline?: L.Polyline
  }>({})

  const [now, setNow] = useState<number>(0)
  const [mapStyle, setMapStyle] = useState<"dark" | "streets">("dark")

  // Relative time counter
  useEffect(() => {
    const timer = setTimeout(() => setNow(Date.now()), 0)
    const interval = setInterval(() => setNow(Date.now()), 2000)
    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [])

  // Coordinates
  // 1. Donor Pickup Coordinates
  const donorLat =
    collection.pickupCoordinates?.coordinates?.[1] ||
    donation?.pickupLocation?.coordinates?.[1] ||
    17.7126
  const donorLng =
    collection.pickupCoordinates?.coordinates?.[0] ||
    donation?.pickupLocation?.coordinates?.[0] ||
    83.2982

  // 2. NGO Destination Coordinates (Siripuram / MVP Colony)
  const ngoLat =
    ngo?.location?.coordinates?.[1] ||
    17.7386
  const ngoLng =
    ngo?.location?.coordinates?.[0] ||
    83.3426

  // 3. Volunteer Position
  const volLat = collection.currentLocation?.latitude ?? null
  const volLng = collection.currentLocation?.longitude ?? null
  const isLiveGps = !!(volLat && volLng && (hasGps || collection.currentLocation?.updatedAt))

  // Time elapsed since last GPS update
  const gpsAgeText = useMemo(() => {
    if (!lastGpsUpdate && !collection.currentLocation?.updatedAt) return null
    const ts = lastGpsUpdate
      ? new Date(lastGpsUpdate).getTime()
      : new Date(collection.currentLocation!.updatedAt!).getTime()
    const diffSec = Math.max(0, Math.floor((now - ts) / 1000))
    if (diffSec < 5) return "Just now"
    if (diffSec < 60) return `${diffSec}s ago`
    const diffMin = Math.floor(diffSec / 60)
    return `${diffMin}m ago`
  }, [lastGpsUpdate, collection.currentLocation, now])

  // Distance computation
  const distanceKm = useMemo(() => {
    const curLat = volLat ?? donorLat
    const curLng = volLng ?? donorLng
    return calculateDistanceKm(curLat, curLng, ngoLat, ngoLng).toFixed(1)
  }, [volLat, volLng, donorLat, donorLng, ngoLat, ngoLng])

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    // Center on Vizag corridor midpoint
    const centerLat = (donorLat + ngoLat) / 2
    const centerLng = (donorLng + ngoLng) / 2

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    })

    // Custom attribution control (compact)
    L.control
      .attribution({
        prefix: false,
        position: "bottomright",
      })
      .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OSM</a> &copy; <a href="https://carto.com/" target="_blank" rel="noopener">CARTO</a>')
      .addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [donorLat, donorLng, ngoLat, ngoLng])

  // Tile layer toggle (Dark Matter vs OpenStreetMap Voyager)
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    let currentTileLayer: L.TileLayer | null = null
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer)
      }
    })

    const tileUrl =
      mapStyle === "dark"
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"

    currentTileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map)

    return () => {
      if (currentTileLayer && map.hasLayer(currentTileLayer)) {
        map.removeLayer(currentTileLayer)
      }
    }
  }, [mapStyle])

  // Update Markers and Polyline
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Clean previous markers
    if (markersRef.current.donor) markersRef.current.donor.remove()
    if (markersRef.current.ngo) markersRef.current.ngo.remove()
    if (markersRef.current.volunteer) markersRef.current.volunteer.remove()
    if (markersRef.current.polyline) markersRef.current.polyline.remove()

    // 1. Donor Icon (Amber)
    const donorIcon = L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);">
          <div style="background:#F59E0B;color:#000;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;box-shadow:0 2px 4px rgba(0,0,0,0.4);margin-bottom:3px;white-space:nowrap;border:1px solid #FEF3C7;">
            Pickup
          </div>
          <div style="width:32px;height:32px;background:#F59E0B;border:2px solid #FFF;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px rgba(245,158,11,0.6);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        </div>
      `,
      iconSize: [32, 48],
      iconAnchor: [16, 48],
    })

    const donorMarker = L.marker([donorLat, donorLng], { icon: donorIcon })
      .addTo(map)
      .bindPopup(
        `<div style="font-family:sans-serif;font-size:12px;color:#111;">
          <strong>Donor Pickup Origin</strong><br/>
          <span>${collection.pickupAddress?.area || "Visakhapatnam"}</span><br/>
          <span style="color:#666;font-size:10px;">Surplus Lot #${collection.donationId.slice(-6)}</span>
        </div>`
      )
    markersRef.current.donor = donorMarker

    // 2. NGO Icon (Trust Blue)
    const ngoIcon = L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);">
          <div style="background:#2563EB;color:#FFF;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;box-shadow:0 2px 4px rgba(0,0,0,0.4);margin-bottom:3px;white-space:nowrap;border:1px solid #93C5FD;">
            NGO
          </div>
          <div style="width:32px;height:32px;background:#2563EB;border:2px solid #FFF;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px rgba(37,99,235,0.6);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
        </div>
      `,
      iconSize: [32, 48],
      iconAnchor: [16, 48],
    })

    const ngoMarker = L.marker([ngoLat, ngoLng], { icon: ngoIcon })
      .addTo(map)
      .bindPopup(
        `<div style="font-family:sans-serif;font-size:12px;color:#111;">
          <strong>Recipient NGO Center</strong><br/>
          <span>${ngo?.ngoName || "Verified Organization Receiving Bay"}</span><br/>
          <span style="color:#666;font-size:10px;">${ngo?.address?.area || "Visakhapatnam Corridor"}</span>
        </div>`
      )
    markersRef.current.ngo = ngoMarker

    // 3. Volunteer Live Courier Marker (Emerald with Pulse Halo)
    let currentVolLat = volLat
    let currentVolLng = volLng

    // If no live coordinates, place along corridor based on milestone
    if (!currentVolLat || !currentVolLng) {
      if (collection.status === "HEADING_TO_DONOR") {
        currentVolLat = donorLat - 0.005
        currentVolLng = donorLng - 0.005
      } else if (collection.status === "ARRIVED_AT_DONOR" || collection.status === "PICKED_UP" || collection.status === "COLLECTED") {
        currentVolLat = donorLat
        currentVolLng = donorLng
      } else if (collection.status === "IN_TRANSIT") {
        currentVolLat = (donorLat + ngoLat) / 2
        currentVolLng = (donorLng + ngoLng) / 2
      } else {
        currentVolLat = ngoLat
        currentVolLng = ngoLng
      }
    }

    const volunteerIcon = L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);">
          <div style="background:#10B981;color:#FFF;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;box-shadow:0 2px 4px rgba(0,0,0,0.4);margin-bottom:3px;white-space:nowrap;border:1px solid #A7F3D0;display:flex;align-items:center;gap:3px;">
            <span style="display:inline-block;width:6px;height:6px;background:#FFF;border-radius:50%;animation:pulse 1.5s infinite;"></span>
            Volunteer
          </div>
          <div style="position:relative;width:34px;height:34px;background:#10B981;border:2.5px solid #FFF;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px rgba(16,185,129,0.8);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          </div>
        </div>
      `,
      iconSize: [34, 52],
      iconAnchor: [17, 52],
    })

    const volunteerMarker = L.marker([currentVolLat, currentVolLng], { icon: volunteerIcon })
      .addTo(map)
      .bindPopup(
        `<div style="font-family:sans-serif;font-size:12px;color:#111;">
          <strong>Volunteer Courier</strong><br/>
          <span>Status: ${collection.status.replace(/_/g, " ")}</span><br/>
          <span style="color:#059669;font-size:10px;font-weight:600;">${isLiveGps ? "Live Browser GPS Active" : "Corridor Estimate"}</span>
        </div>`
      )
    markersRef.current.volunteer = volunteerMarker

    // 4. Connecting Route Polyline
    const polylineCoords: [number, number][] = [
      [donorLat, donorLng],
      [currentVolLat, currentVolLng],
      [ngoLat, ngoLng],
    ]

    const routePolyline = L.polyline(polylineCoords, {
      color: "#10B981",
      weight: 3.5,
      opacity: 0.85,
      dashArray: "6, 8",
    }).addTo(map)
    markersRef.current.polyline = routePolyline

    // Fit bounds to markers
    const group = L.featureGroup([donorMarker, ngoMarker, volunteerMarker])
    map.fitBounds(group.getBounds().pad(0.2))
  }, [donorLat, donorLng, ngoLat, ngoLng, volLat, volLng, collection.status, isLiveGps, collection.pickupAddress, collection.donationId, ngo])

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn()
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut()
  const handleResetView = () => {
    const map = mapInstanceRef.current
    if (!map) return
    const group = L.featureGroup([
      markersRef.current.donor!,
      markersRef.current.ngo!,
      markersRef.current.volunteer!,
    ].filter(Boolean))
    if (group.getLayers().length > 0) {
      map.fitBounds(group.getBounds().pad(0.2))
    }
  }

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-border bg-[#0B0F12] shadow-md flex flex-col ${height} ${className}`}
      role="region"
      aria-label="Interactive Delivery Tracking Map"
    >
      {/* Map Header Overlay */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex items-center justify-between pointer-events-none gap-2">
        {/* Status Pill */}
        <div className="pointer-events-auto bg-[#0B0F12]/90 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-lg text-xs">
          <span className="flex h-2 w-2 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                isLiveGps ? "bg-emerald-400 opacity-75" : "bg-amber-400 opacity-75"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isLiveGps ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
          </span>
          <span className="font-bold text-white tracking-wide">
            {collection.status.replace(/_/g, " ")}
          </span>
          {gpsAgeText && (
            <span className="text-[10px] text-muted-foreground border-l border-white/10 pl-2 hidden sm:inline">
              Updated {gpsAgeText}
            </span>
          )}
        </div>

        {/* Style & Re-center Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-[#0B0F12]/90 backdrop-blur-md border border-white/10 rounded-full p-1 shadow-lg text-xs">
          <button
            type="button"
            onClick={() => setMapStyle(mapStyle === "dark" ? "streets" : "dark")}
            className="px-2.5 py-1 text-[11px] font-semibold text-white/90 hover:text-white rounded-full hover:bg-white/10 transition-all"
            title="Toggle Dark/Light Map Tiles"
          >
            {mapStyle === "dark" ? "Dark Map" : "Streets"}
          </button>
          <button
            type="button"
            onClick={handleResetView}
            className="p-1.5 text-white/90 hover:text-white rounded-full hover:bg-white/10 transition-all"
            title="Fit All Route Points"
          >
            <Maximize2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Leaflet DOM Node */}
      <div ref={mapContainerRef} className="w-full h-full flex-1 z-[100]" />

      {/* Map Bottom Telemetry Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-[400] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto bg-[#0B0F12]/90 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 text-xs text-white/90 shadow-lg flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
            <Radio className="size-3.5 animate-pulse" />
            <span>{isLiveGps ? "Live GPS Connected" : "Live GPS Unavailable"}</span>
          </div>
          <div className="h-3 w-px bg-white/20" />
          <div className="text-[11px] text-white/70">
            Est. Distance: <span className="text-white font-bold">{distanceKm} km</span>
          </div>
        </div>

        {/* Zoom Controls */}
        {showControls && (
          <div className="pointer-events-auto flex items-center gap-1 bg-[#0B0F12]/90 backdrop-blur-md border border-white/10 rounded-xl p-1 shadow-lg ml-auto">
            <button
              type="button"
              onClick={handleZoomIn}
              className="size-7 flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 rounded-lg text-sm font-bold transition-all"
              aria-label="Zoom In"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="size-7 flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 rounded-lg text-sm font-bold transition-all"
              aria-label="Zoom Out"
            >
              −
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
