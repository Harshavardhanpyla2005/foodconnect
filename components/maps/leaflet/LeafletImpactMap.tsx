"use client"

import React, { useEffect, useRef, useState, useMemo } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import {
  MapPin,
  Building2,
  HeartHandshake,
  Package,
  Layers,
  Sparkles,
  ShieldCheck,
  Maximize2,
  Info,
} from "lucide-react"
import { VIZAG_DEMO_LOCATIONS, VIZAG_CENTER } from "@/lib/constants/vizag-map-data"
import { MapLocation, MapLocationType } from "@/lib/types/map"

export interface LeafletImpactMapProps {
  className?: string
  height?: string
  locations?: MapLocation[]
  verifiedDistributionsCount?: number
  peopleServedCount?: number
}

export default function LeafletImpactMap({
  className = "",
  height = "h-[500px]",
  locations = VIZAG_DEMO_LOCATIONS,
  verifiedDistributionsCount = 18,
  peopleServedCount = 1420,
}: LeafletImpactMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const layerGroupRef = useRef<L.LayerGroup | null>(null)

  const [activeLayer, setActiveLayer] = useState<"all" | "need" | "donation" | "ngo">("all")
  const [mapStyle, setMapStyle] = useState<"dark" | "streets">("dark")
  const [selectedLoc, setSelectedLoc] = useState<MapLocation | null>(null)

  const filteredLocations = useMemo(() => {
    if (activeLayer === "all") return locations
    return locations.filter((l) => l.type === activeLayer)
  }, [activeLayer, locations])

  // Count aggregates
  const counts = useMemo(() => {
    return {
      needs: locations.filter((l) => l.type === "need").length,
      donations: locations.filter((l) => l.type === "donation").length,
      ngos: locations.filter((l) => l.type === "ngo").length,
    }
  }, [locations])

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: [VIZAG_CENTER.latitude, VIZAG_CENTER.longitude],
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    })

    L.control
      .attribution({
        prefix: false,
        position: "bottomright",
      })
      .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OSM</a> &copy; <a href="https://carto.com/" target="_blank" rel="noopener">CARTO</a>')
      .addTo(map)

    const layerGroup = L.layerGroup().addTo(map)
    layerGroupRef.current = layerGroup
    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
      layerGroupRef.current = null
    }
  }, [])

  // Tile layer toggle
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer)
      }
    })

    const tileUrl =
      mapStyle === "dark"
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map)
  }, [mapStyle])

  // Update Markers & Generalized Impact Zones
  useEffect(() => {
    const map = mapInstanceRef.current
    const layerGroup = layerGroupRef.current
    if (!map || !layerGroup) return

    layerGroup.clearLayers()
    const markerList: L.Marker[] = []

    filteredLocations.forEach((loc) => {
      // Color and icon based on generalized category
      let bg = "#F59E0B"
      let border = "#FEF3C7"
      let label = "Donation"

      if (loc.type === "need") {
        bg = "#EA580C"
        border = "#FFEDD5"
        label = "Need"
      } else if (loc.type === "ngo") {
        bg = "#2563EB"
        border = "#DBEAFE"
        label = "NGO"
      }

      // Add generalized zone circle (anonymized area radius)
      const circle = L.circle([loc.latitude, loc.longitude], {
        color: bg,
        fillColor: bg,
        fillOpacity: 0.12,
        radius: 650, // 650m generalized zone
        weight: 1.5,
      })
      layerGroup.addLayer(circle)

      const icon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);cursor:pointer;">
            <div style="background:${bg};color:#FFF;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;box-shadow:0 2px 4px rgba(0,0,0,0.4);margin-bottom:3px;white-space:nowrap;border:1px solid ${border};">
              ${loc.area.split(" ")[0]} • ${label}
            </div>
            <div style="width:28px;height:28px;background:${bg};border:2px solid #FFF;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px ${bg}88;">
              <div style="width:8px;height:8px;background:#FFF;border-radius:50%;"></div>
            </div>
          </div>
        `,
        iconSize: [28, 44],
        iconAnchor: [14, 44],
      })

      const marker = L.marker([loc.latitude, loc.longitude], { icon })
        .bindPopup(
          `<div style="font-family:sans-serif;font-size:12px;color:#111;max-width:220px;">
            <strong style="color:${bg};font-size:13px;">${loc.name}</strong><br/>
            <span style="color:#444;font-size:11px;">Zone: ${loc.area}</span><br/>
            <span style="font-weight:600;font-size:11px;">${loc.quantity}</span><br/>
            <p style="margin:4px 0 0;font-size:10px;color:#666;">${loc.details || "Verified community food distribution network node."}</p>
          </div>`
        )

      marker.on("click", () => {
        setSelectedLoc(loc)
      })

      layerGroup.addLayer(marker)
      markerList.push(marker)
    })

    if (markerList.length > 0) {
      const group = L.featureGroup(markerList)
      map.fitBounds(group.getBounds().pad(0.15))
    }
  }, [filteredLocations])

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-border bg-[#0B0F12] shadow-md flex flex-col ${height} ${className}`}
      role="region"
      aria-label="Public Visakhapatnam Impact & Network Map"
    >
      {/* Top Header & Layer Filter Bar */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Layer Filters */}
        <div className="pointer-events-auto flex items-center gap-1 bg-[#0B0F12]/90 backdrop-blur-md border border-white/10 rounded-full p-1 shadow-lg text-xs">
          <button
            type="button"
            onClick={() => setActiveLayer("all")}
            className={`px-3 py-1 rounded-full font-semibold transition-all ${
              activeLayer === "all"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            All Activity
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer("need")}
            className={`px-3 py-1 rounded-full font-semibold transition-all ${
              activeLayer === "need"
                ? "bg-orange-600 text-white shadow-xs"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            Active Needs ({counts.needs})
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer("donation")}
            className={`px-3 py-1 rounded-full font-semibold transition-all ${
              activeLayer === "donation"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            Donations ({counts.donations})
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer("ngo")}
            className={`px-3 py-1 rounded-full font-semibold transition-all ${
              activeLayer === "ngo"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            NGOs ({counts.ngos})
          </button>
        </div>

        {/* Tile & Reset Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-[#0B0F12]/90 backdrop-blur-md border border-white/10 rounded-full p-1 shadow-lg text-xs ml-auto">
          <button
            type="button"
            onClick={() => setMapStyle(mapStyle === "dark" ? "streets" : "dark")}
            className="px-2.5 py-1 text-[11px] font-semibold text-white/90 hover:text-white rounded-full hover:bg-white/10 transition-all"
          >
            {mapStyle === "dark" ? "Dark Map" : "Streets"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setView([VIZAG_CENTER.latitude, VIZAG_CENTER.longitude], 12)
              }
            }}
            className="p-1.5 text-white/90 hover:text-white rounded-full hover:bg-white/10 transition-all"
            title="Reset to Visakhapatnam Center"
          >
            <Maximize2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Leaflet DOM Node */}
      <div ref={mapContainerRef} className="w-full h-full flex-1 z-[100]" />

      {/* Bottom Summary Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-[400] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto bg-[#0B0F12]/90 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 text-xs text-white/90 shadow-lg flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
            <Sparkles className="size-3.5" />
            <span>Generalized Coastal Vizag Network</span>
          </div>
          <div className="h-3 w-px bg-white/20" />
          <span className="text-[11px] text-white/70">
            Privacy Protected • Zone-Level Aggregates Only
          </span>
        </div>

        {/* Demo disclosure chip */}
        <div className="pointer-events-auto bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg px-2.5 py-1 text-[10px] font-semibold flex items-center gap-1.5 backdrop-blur-md ml-auto">
          <Info className="size-3" />
          <span>Demo Network Data (Visakhapatnam Corridor)</span>
        </div>
      </div>
    </div>
  )
}
