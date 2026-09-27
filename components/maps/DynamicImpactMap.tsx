"use client"

import dynamic from "next/dynamic"
import React from "react"
import { MapSkeleton } from "./MapSkeleton"
import type { LeafletImpactMapProps } from "./leaflet/LeafletImpactMap"

const LeafletImpactMap = dynamic(
  () => import("./leaflet/LeafletImpactMap"),
  {
    ssr: false,
    loading: () => <MapSkeleton title="Loading Visakhapatnam Network Map..." height="h-[500px]" />,
  }
)

export function DynamicImpactMap(props: LeafletImpactMapProps) {
  return <LeafletImpactMap {...props} />
}
