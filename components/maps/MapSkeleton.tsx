"use client"

import React from "react"
import { Radio, Compass, Loader2 } from "lucide-react"

interface MapSkeletonProps {
  title?: string
  height?: string
  className?: string
}

export function MapSkeleton({
  title = "Initializing Real-Time Map Radar...",
  height = "h-[420px]",
  className = "",
}: MapSkeletonProps) {
  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-border bg-[#0B0F12] flex flex-col items-center justify-center p-6 text-center shadow-md ${height} ${className}`}
      role="status"
      aria-label={title}
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="relative flex items-center justify-center size-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <Radio className="size-6 animate-pulse text-emerald-400" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white tracking-wide">{title}</h4>
          <p className="text-xs text-muted-foreground max-w-sm">
            Connecting OpenStreetMap tiles and geographic coordinates...
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium pt-1">
          <Loader2 className="size-3.5 animate-spin" />
          <span>Loading interactive vector viewport</span>
        </div>
      </div>
    </div>
  )
}
