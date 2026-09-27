/**
 * FoodConnect — Repositories Entry Point
 *
 * Provides a unified, database-agnostic repository layer for the FoodConnect prototype.
 *
 * Uses the in-memory mock repository by default, ensuring all prototype functionality
 * operates smoothly without external database credentials or MongoDB Atlas.
 *
 * When MongoDB is connected in later milestones, this file will switch between
 * the mock repository and the MongoDB repository based on environment configuration.
 */

import { IFoodConnectRepositories } from "./interfaces"
import { FoodConnectMockRepositories } from "./mock-repository"

// Global singleton declaration to preserve prototype state across Next.js HMR turns in development
declare global {
  var __foodconnect_repositories__: FoodConnectMockRepositories | undefined
}

function getRepositories(): FoodConnectMockRepositories {
  if (!globalThis.__foodconnect_repositories__) {
    globalThis.__foodconnect_repositories__ = new FoodConnectMockRepositories()
  }

  return globalThis.__foodconnect_repositories__
}

export const repositories: IFoodConnectRepositories = getRepositories()

// Re-export interfaces and seed constants for convenient imports
export * from "./interfaces"
export * from "./mock-data"
export { FoodConnectMockRepositories } from "./mock-repository"
