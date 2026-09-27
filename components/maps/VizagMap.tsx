"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  MapPin,
  Building2,
  HeartHandshake,
  Package,
  Info,
  X,
  Compass,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { type FoodConnectStatus } from "@/lib/constants/status"
import { VIZAG_DEMO_LOCATIONS, VIZAG_CENTER } from "@/lib/constants/vizag-map-data"
import { MapLocation, MapLocationType } from "@/lib/types/map"
import { cn } from "@/lib/utils"

export interface VizagMapProps {
  className?: string
  initialFilter?: "all" | MapLocationType
  showControls?: boolean
  height?: string
  locations?: MapLocation[]
  onSelectLocation?: (location: MapLocation | null) => void
}

export function VizagMap({
  className,
  initialFilter = "all",
  height = "h-[480px]",
  locations = VIZAG_DEMO_LOCATIONS,
  onSelectLocation,
}: VizagMapProps) {
  const [filter, setFilter] = React.useState<"all" | MapLocationType>(initialFilter)
  const [selectedLocation, setSelectedLocation] = React.useState<MapLocation | null>(
    locations[0] || null
  )

  const filteredLocations = React.useMemo(() => {
    if (filter === "all") return locations
    return locations.filter((loc) => loc.type === filter)
  }, [filter, locations])

  const needsCount = React.useMemo(() => locations.filter((l) => l.type === "need").length, [locations])
  const ngosCount = React.useMemo(() => locations.filter((l) => l.type === "ngo").length, [locations])
  const donationsCount = React.useMemo(() => locations.filter((l) => l.type === "donation").length, [locations])

  const handleSelect = (loc: MapLocation | null) => {
    setSelectedLocation(loc)
    onSelectLocation?.(loc)
  }

  // Convert lat/lng to percentage coordinates on the Vizag coast map projection
  // Vizag bounds: lat ~17.65 to ~17.82, lng ~83.18 to ~83.42
  const minLat = 17.66
  const maxLat = 17.82
  const minLng = 83.18
  const maxLng = 83.42

  const getPositionPercent = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100
    // Invert y because lat increases northward while CSS top increases southward
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 100
    return {
      left: `${Math.max(8, Math.min(92, x))}%`,
      top: `${Math.max(8, Math.min(90, y))}%`,
    }
  }

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm flex flex-col",
        height,
        className
      )}
      role="region"
      aria-label="Interactive Visakhapatnam FoodConnect Map Preview"
    >
      {/* Top Map Bar with Filter Tabs & Disclaimer */}
      <div className="z-20 flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-background/95 px-4 py-2.5 backdrop-blur-md">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="xs"
            onClick={() => setFilter("all")}
            className="text-xs h-7"
          >
            All Pins ({locations.length})
          </Button>

          <Button
            variant={filter === "need" ? "default" : "outline"}
            size="xs"
            onClick={() => setFilter("need")}
            className={cn(
              "text-xs h-7 gap-1",
              filter === "need"
                ? "bg-[var(--brand-terracotta)] text-white hover:bg-[var(--brand-terracotta)]/90"
                : ""
            )}
          >
            <span className="size-2 rounded-full bg-[var(--brand-terracotta)]" />
            Active Needs ({needsCount})
          </Button>

          <Button
            variant={filter === "ngo" ? "default" : "outline"}
            size="xs"
            onClick={() => setFilter("ngo")}
            className="text-xs h-7 gap-1"
          >
            <span className="size-2 rounded-full bg-primary" />
            Verified NGOs ({ngosCount})
          </Button>

          <Button
            variant={filter === "donation" ? "default" : "outline"}
            size="xs"
            onClick={() => setFilter("donation")}
            className="text-xs h-7 gap-1"
          >
            <span className="size-2 rounded-full bg-amber-500" />
            Surplus Lots ({donationsCount})
          </Button>
        </div>

        {/* Demo Location Tag */}
        <div className="flex items-center gap-1.5 text-[0.7rem] text-muted-foreground bg-muted/60 px-2 py-1 rounded-md border border-border/60">
          <Info className="size-3 text-primary shrink-0" aria-hidden="true" />
          <span>Demo locations — not live NGO coordinates</span>
        </div>
      </div>

      {/* Main Map Canvas / Container */}
      <div className="relative flex-1 w-full bg-[#f4ede4] dark:bg-[#1a201c] overflow-hidden select-none">
        {/* Vizag Stylized Topographic / Coastal Background Grid */}
        <svg
          className="absolute inset-0 size-full pointer-events-none opacity-40 dark:opacity-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="vizag-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-stone-300 dark:text-stone-700" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#vizag-grid)" />
          {/* Simulated Bay of Bengal Coastline (East) */}
          <path
            d="M 680 -50 Q 520 180 620 380 T 750 650"
            fill="none"
            stroke="currentColor"
            strokeWidth="32"
            strokeLinecap="round"
            className="text-sky-200/50 dark:text-sky-950/40"
          />
          <path
            d="M 680 -50 Q 520 180 620 380 T 750 650"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="text-sky-400/60 dark:text-sky-600/40"
          />
        </svg>

        {/* Geographic Landmark Labels in Vizag */}
        <div className="absolute top-4 left-6 pointer-events-none text-left">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Compass className="size-3.5" />
            <span>{VIZAG_CENTER.city}</span>
          </div>
          <span className="text-[0.65rem] text-muted-foreground block font-medium">
            17.6868° N, 83.2185° E • Bay of Bengal Coast
          </span>
        </div>

        <div className="absolute bottom-4 right-6 pointer-events-none text-right">
          <span className="text-[0.7rem] font-bold text-sky-700/60 dark:text-sky-400/40 uppercase tracking-widest">
            Bay of Bengal
          </span>
        </div>

        {/* Key Neighborhood Anchor Labels */}
        <div className="absolute top-[28%] left-[45%] pointer-events-none text-[0.65rem] font-semibold text-stone-500/80 dark:text-stone-400/60">
          Siripuram
        </div>
        <div className="absolute top-[18%] left-[62%] pointer-events-none text-[0.65rem] font-semibold text-stone-500/80 dark:text-stone-400/60">
          MVP Colony
        </div>
        <div className="absolute top-[48%] left-[34%] pointer-events-none text-[0.65rem] font-semibold text-stone-500/80 dark:text-stone-400/60">
          Jagadamba
        </div>
        <div className="absolute top-[75%] left-[16%] pointer-events-none text-[0.65rem] font-semibold text-stone-500/80 dark:text-stone-400/60">
          Gajuwaka Industrial
        </div>
        <div className="absolute top-[10%] left-[72%] pointer-events-none text-[0.65rem] font-semibold text-stone-500/80 dark:text-stone-400/60">
          Rushikonda
        </div>

        {/* Interactive Location Pins */}
        <div className="absolute inset-0 size-full">
          {filteredLocations.map((loc) => {
            const pos = getPositionPercent(loc.latitude, loc.longitude)
            const isSelected = selectedLocation?.id === loc.id

            return (
              <div
                key={loc.id}
                style={{ left: pos.left, top: pos.top }}
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-200"
              >
                <button
                  type="button"
                  onClick={() => handleSelect(loc)}
                  className={cn(
                    "group relative flex items-center justify-center p-1 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                    isSelected ? "scale-125 z-30" : "hover:scale-115 z-10"
                  )}
                  aria-label={`${loc.name} (${loc.type}) in ${loc.area}`}
                >
                  {/* Outer pulse wave */}
                  {loc.urgency === "Immediate" && (
                    <span className="absolute inset-0 rounded-full bg-[var(--brand-terracotta)]/40 animate-ping" />
                  )}

                  {/* Marker Pin Icon container */}
                  <div
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full shadow-md text-white border-2 border-white dark:border-stone-900 transition-colors",
                      loc.type === "need" && "bg-[var(--brand-terracotta)]",
                      loc.type === "ngo" && "bg-primary",
                      loc.type === "donation" && "bg-emerald-600"
                    )}
                  >
                    {loc.type === "need" && <HeartHandshake className="size-3.5" />}
                    {loc.type === "ngo" && <Building2 className="size-3.5" />}
                    {loc.type === "donation" && <Package className="size-3.5" />}
                  </div>

                  {/* Pin Tooltip Tag */}
                  <span
                    className={cn(
                      "absolute top-full mt-1.5 whitespace-nowrap rounded px-1.5 py-0.5 text-[0.65rem] font-semibold shadow-xs transition-opacity border",
                      isSelected
                        ? "bg-foreground text-background border-transparent opacity-100"
                        : "bg-background/90 text-foreground border-border/80 opacity-0 group-hover:opacity-100"
                    )}
                  >
                    {loc.area}
                  </span>
                </button>
              </div>
            )
          })}
        </div>

        {/* Selected Marker Detail Card Popover */}
        <AnimatePresence>
          {selectedLocation && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm z-30"
            >
              <div className="rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur-md text-left">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        selectedLocation.type === "need" && "bg-[var(--brand-terracotta)]",
                        selectedLocation.type === "ngo" && "bg-primary",
                        selectedLocation.type === "donation" && "bg-emerald-600"
                      )}
                    />
                    <span className="text-[0.7rem] font-bold uppercase tracking-wider text-muted-foreground">
                      {selectedLocation.type === "need"
                        ? "Active Food Need"
                        : selectedLocation.type === "ngo"
                        ? "Verified NGO Partner"
                        : "Surplus Food Lot"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelect(null)}
                    className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Close details popup"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="mt-2">
                  <h3 className="font-heading text-sm font-semibold text-foreground leading-snug">
                    {selectedLocation.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="size-3 text-primary shrink-0" />
                    <span>{selectedLocation.area}, Visakhapatnam</span>
                  </p>
                </div>

                {selectedLocation.quantity && (
                  <div className="mt-2.5 rounded bg-muted/50 p-2 text-xs border border-border/60">
                    <span className="font-medium text-foreground">
                      {selectedLocation.quantity}
                    </span>
                    {selectedLocation.foodType && (
                      <span className="block text-[0.7rem] text-muted-foreground">
                        {selectedLocation.foodType}
                      </span>
                    )}
                  </div>
                )}

                <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                  {selectedLocation.details}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-xs">
                  {selectedLocation.status && (
                    <StatusBadge
                      status={selectedLocation.status as FoodConnectStatus}
                      size="sm"
                    />
                  )}

                  <span className="text-[0.65rem] text-muted-foreground font-medium">
                    Vizag Demo Unit
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Legend Overlay in Top Right */}
        <div className="absolute top-4 right-4 z-20 hidden sm:flex flex-col gap-1 rounded-lg border border-border/80 bg-background/90 p-2 text-[0.65rem] shadow-xs backdrop-blur-xs">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span className="size-2 rounded-full bg-[var(--brand-terracotta)]" />
            <span>Active Need</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span className="size-2 rounded-full bg-primary" />
            <span>Verified NGO</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span className="size-2 rounded-full bg-emerald-600" />
            <span>Surplus Donation</span>
          </div>
        </div>
      </div>
    </div>
  )
}
