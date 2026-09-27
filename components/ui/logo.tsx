import * as React from "react"
import { cn } from "@/lib/utils"

interface FoodConnectLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
  className?: string
  iconClassName?: string
}

export function FoodConnectLogo({
  size = "md",
  className,
  iconClassName,
}: FoodConnectLogoProps) {
  // Configured dimensions preserving exact 3.003:1 aspect ratio of official logo (1024x341)
  const sizeMap = {
    sm: { height: 32, width: 96, classStr: "h-7 sm:h-8" },
    md: { height: 40, width: 120, classStr: "h-9 sm:h-10" },
    lg: { height: 48, width: 144, classStr: "h-11 sm:h-12" },
    xl: { height: 64, width: 192, classStr: "h-14 sm:h-16" },
  }

  const current = sizeMap[size] || sizeMap.md

  return (
    <div
      className={cn(
        "inline-flex items-center select-none transition-transform duration-200 hover:opacity-95",
        className
      )}
    >
      <div className={cn("relative flex items-center justify-center", iconClassName)}>
        {/* Official FoodConnect Logo Image — Preserved Exactly as Provided */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/foodconnect-logo.png"
          alt="FoodConnect — Surplus Food -> Brighter Communities (Visakhapatnam)"
          width={current.width}
          height={current.height}
          className={cn(
            "w-auto max-w-full object-contain filter drop-shadow-xs transition-all",
            current.classStr
          )}
          style={{ aspectRatio: "1024 / 341" }}
        />
      </div>
    </div>
  )
}
