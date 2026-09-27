"use client"

import dynamic from "next/dynamic"
import React from "react"
import { MapSkeleton } from "./MapSkeleton"
import type { LeafletDeliveryMapProps } from "./leaflet/LeafletDeliveryMap"

const LeafletDeliveryMap = dynamic(
  () => import("./leaflet/LeafletDeliveryMap"),
  {
    ssr: false,
    loading: () => <MapSkeleton title="Loading Real-Time Delivery Radar..." />,
  }
)

export function DynamicDeliveryMap(props: LeafletDeliveryMapProps) {
  return <LeafletDeliveryMap {...props} />
}
