import * as React from "react"
import { cn } from "cn"
import { getStatusConfig, type FoodConnectStatus } from "@/lib/constants/status"

export interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  status: FoodConnectStatus
  showLabel?: boolean
  showIcon?: boolean
  size?: "sm" | "default" | "lg"
}

export function StatusIndicator({
  status,
  showLabel = true,
  showIcon = false,
  size = "default",
  className,
  ...props
}: StatusIndicatorProps) {
  const config = getStatusConfig(status)
  const Icon = config.icon

  const dotSize =
    size === "sm" ? "size-1.5" : size === "lg" ? "size-2.5" : "size-2"

  const iconSize =
    size === "sm" ? "size-3" : size === "lg" ? "size-4" : "size-3.5"

  return (
    <span
      role="status"
      className={cn("inline-flex items-center gap-1.5", className)}
      title={`${config.label}: ${config.description}`}
      {...props}
    >
      <span className="relative flex items-center justify-center">
        {config.shouldPulse && (
          <span
            className={cn(
              "absolute inline-flex rounded-full opacity-75 motion-safe:animate-ping",
              dotSize,
              config.classes.dot
            )}
          />
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full ring-1 ring-background",
            dotSize,
            config.classes.dot
          )}
        />
      </span>

      {showIcon && (
        <Icon
          className={cn("shrink-0", iconSize, config.classes.text)}
          aria-hidden="true"
        />
      )}

      {showLabel ? (
        <span className={cn("text-xs font-medium", config.classes.text)}>
          {config.label}
        </span>
      ) : (
        <span className="sr-only">
          {config.label} — {config.description}
        </span>
      )}
    </span>
  )
}
