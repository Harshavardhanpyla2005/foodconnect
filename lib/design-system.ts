/**
 * FoodConnect Design System Foundation
 *
 * Central design tokens, status configurations, and motion constants.
 */

export * from "./constants/status"
export * from "./motion"

export const BRAND_COLORS = {
  forest: "oklch(0.36 0.095 152)", // Primary action / trust
  forestHover: "oklch(0.32 0.095 152)",
  terracotta: "oklch(0.58 0.14 45)", // Food & community secondary
  amber: "oklch(0.72 0.14 85)", // Harvest & meal distribution
  cream: "oklch(0.985 0.008 85)", // Warm surface
  charcoal: "oklch(0.20 0.02 65)", // High-contrast typography
} as const

export const CHART_THEME = {
  rescuedFood: "var(--chart-1)",
  ngoCommunities: "var(--chart-2)",
  distributedMeals: "var(--chart-3)",
  logisticsPartners: "var(--chart-4)",
  volunteerDonorGrowth: "var(--chart-5)",
} as const

export const SPACING_SCALE = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "3rem", // 48px
  "3xl": "4rem", // 64px
} as const
