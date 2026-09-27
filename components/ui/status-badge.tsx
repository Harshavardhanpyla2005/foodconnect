import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { getStatusConfig, type FoodConnectStatus } from "@/lib/constants/status"

const statusBadgeVariants = cva(
  "inline-flex items-center font-medium border transition-colors select-none",
  {
    variants: {
      size: {
        sm: "h-5 px-1.5 py-0.5 text-[0.7rem] gap-1 rounded-md",
        default: "h-6 px-2 py-0.5 text-xs gap-1.5 rounded-md",
        lg: "h-7 px-2.5 py-1 text-xs sm:text-sm gap-2 rounded-lg",
      },
      variant: {
        subtle: "border",
        solid: "border-transparent text-white font-semibold",
        outline: "bg-transparent border",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "subtle",
    },
  }
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: FoodConnectStatus
  showIcon?: boolean
  showDot?: boolean
  customLabel?: string
}

export function StatusBadge({
  status,
  size = "default",
  variant = "subtle",
  showIcon = true,
  showDot = false,
  customLabel,
  className,
  ...props
}: StatusBadgeProps) {
  const config = getStatusConfig(status)
  const Icon = config.icon

  const solidBgMap: Record<FoodConnectStatus, string> = {
    Available: "bg-emerald-700 dark:bg-emerald-600",
    Matching: "bg-indigo-700 dark:bg-indigo-600",
    Requested: "bg-amber-700 dark:bg-amber-600",
    Accepted: "bg-teal-700 dark:bg-teal-600",
    "Collection Assigned": "bg-purple-700 dark:bg-purple-600",
    Collected: "bg-sky-700 dark:bg-sky-600",
    Distributed: "bg-emerald-800 dark:bg-emerald-700",
    Verified: "bg-emerald-700 dark:bg-emerald-600",
    Closed: "bg-stone-600 dark:bg-stone-500",
    "Active Need": "bg-orange-700 dark:bg-orange-600",
    "Partially Fulfilled": "bg-amber-800 dark:bg-amber-700",
    Fulfilled: "bg-emerald-700 dark:bg-emerald-600",
    Expired: "bg-stone-600 dark:bg-stone-500",
    Pending: "bg-amber-700 dark:bg-amber-600",
    Rejected: "bg-rose-700 dark:bg-rose-600",
    Suspended: "bg-zinc-700 dark:bg-zinc-600",
  }

  const iconSizeClass =
    size === "sm" ? "size-3" : size === "lg" ? "size-4" : "size-3.5"

  return (
    <span
      role="status"
      aria-label={`Status: ${customLabel ?? config.label} — ${config.description}`}
      className={cn(
        statusBadgeVariants({ size, variant }),
        variant === "subtle" && config.classes.badge,
        variant === "outline" && [config.classes.border, config.classes.text],
        variant === "solid" && solidBgMap[status],
        className
      )}
      {...props}
    >
      {showDot && (
        <span className="relative flex size-1.5 items-center justify-center">
          {config.shouldPulse && (
            <span
              className={cn(
                "absolute inline-flex size-full rounded-full opacity-75 motion-safe:animate-ping",
                config.classes.dot
              )}
            />
          )}
          <span
            className={cn(
              "relative inline-flex size-1.5 rounded-full",
              variant === "solid" ? "bg-white" : config.classes.dot
            )}
          />
        </span>
      )}

      {showIcon && (
        <Icon
          className={cn(
            "shrink-0",
            iconSizeClass,
            variant === "solid" ? "text-white" : config.classes.text
          )}
          aria-hidden="true"
        />
      )}

      <span className="tracking-tight">{customLabel ?? config.label}</span>
    </span>
  )
}
