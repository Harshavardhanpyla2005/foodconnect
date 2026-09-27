/**
 * FoodConnect — Database-Agnostic Repository Interfaces
 *
 * Defines the contract for all data access across FoodConnect.
 * Enables transparent swapping between local mock data and MongoDB Atlas
 * without altering application services, server actions, or Route Handlers.
 */

import {
  IUser,
  IDonorProfile,
  INGOProfile,
  INeed,
  IDonation,
  IMatch,
  ICollection,
  IDistribution,
  IAuditLog,
  INotification,
  ISession,
  NeedStatus,
  NeedUrgency,
  FoodType,
  FoodVegCategory,
  DonationStatus,
  MatchStatus,
  CollectionStatus,
  DistributionVerificationStatus,
  NGOVerificationStatus,
} from "@/types/database"

// ============================================================================
// 1. USER REPOSITORY INTERFACE
// ============================================================================

export interface IUserRepository {
  findById(id: string): Promise<IUser | null>
  findByEmail(email: string): Promise<IUser | null>
  findAll(): Promise<IUser[]>
  create(user: Omit<IUser, "_id" | "createdAt" | "updatedAt">): Promise<IUser>
  update(id: string, updates: Partial<IUser>): Promise<IUser | null>
}

// ============================================================================
// 2. DONOR PROFILE REPOSITORY INTERFACE
// ============================================================================

export interface IDonorProfileRepository {
  findById(id: string): Promise<IDonorProfile | null>
  findByUserId(userId: string): Promise<IDonorProfile | null>
  findAll(): Promise<IDonorProfile[]>
  findByArea(area: string): Promise<IDonorProfile[]>
  create(
    profile: Omit<
      IDonorProfile,
      "_id" | "createdAt" | "updatedAt" | "totalDonationsCount" | "totalMealsRescued"
    >
  ): Promise<IDonorProfile>
  update(id: string, updates: Partial<IDonorProfile>): Promise<IDonorProfile | null>
}

// ============================================================================
// 3. NGO PROFILE REPOSITORY INTERFACE
// ============================================================================

export interface INGOProfileRepository {
  findById(id: string): Promise<INGOProfile | null>
  findByUserId(userId: string): Promise<INGOProfile | null>
  findAll(options?: { verifiedOnly?: boolean }): Promise<INGOProfile[]>
  findByArea(area: string): Promise<INGOProfile[]>
  create(
    profile: Omit<
      INGOProfile,
      "_id" | "createdAt" | "updatedAt" | "totalNeedsCount" | "totalMealsReceived"
    >
  ): Promise<INGOProfile>
  update(id: string, updates: Partial<INGOProfile>): Promise<INGOProfile | null>
  updateVerificationStatus(
    id: string,
    status: NGOVerificationStatus,
    adminUserId: string,
    reason?: string
  ): Promise<INGOProfile | null>
}

// ============================================================================
// 4. NEED REPOSITORY INTERFACE (COMMUNITY DEMAND)
// ============================================================================

export interface NeedFilter {
  status?: NeedStatus[]
  urgency?: NeedUrgency
  area?: string
  foodType?: FoodType
  ngoId?: string
}

export interface INeedRepository {
  findById(id: string): Promise<INeed | null>
  findAll(filter?: NeedFilter): Promise<INeed[]>
  findByNgoId(ngoId: string): Promise<INeed[]>
  create(
    need: Omit<
      INeed,
      "_id" | "createdAt" | "updatedAt" | "quantityFulfilled" | "quantityRemaining" | "version"
    >
  ): Promise<INeed>
  update(id: string, updates: Partial<INeed>): Promise<INeed | null>
  /**
   * Atomic fulfillment update ensuring quantity conservation:
   * quantityFulfilled += claimAmount
   * quantityRemaining -= claimAmount
   * Status transitions to FULFILLED if remaining <= 0, else PARTIALLY_FULFILLED
   */
  atomicFulfill(
    id: string,
    claimAmount: number
  ): Promise<{ success: boolean; need?: INeed; error?: string }>
}

// ============================================================================
// 5. DONATION REPOSITORY INTERFACE (SURPLUS FOOD)
// ============================================================================

export interface DonationFilter {
  status?: DonationStatus[]
  foodCategory?: FoodType
  vegNonVeg?: FoodVegCategory
  donorId?: string
  area?: string
}

export interface IDonationRepository {
  findById(id: string): Promise<IDonation | null>
  findAll(filter?: DonationFilter): Promise<IDonation[]>
  findByDonorId(donorId: string): Promise<IDonation[]>
  create(
    donation: Omit<IDonation, "_id" | "createdAt" | "updatedAt" | "status" | "version">
  ): Promise<IDonation>
  update(id: string, updates: Partial<IDonation>): Promise<IDonation | null>
  updateStatus(
    id: string,
    newStatus: DonationStatus,
    actorId?: string
  ): Promise<IDonation | null>
}

// ============================================================================
// 6. MATCH REPOSITORY INTERFACE
// ============================================================================

export interface IMatchRepository {
  findById(id: string): Promise<IMatch | null>
  findAll(filter?: { status?: MatchStatus; ngoId?: string; donationId?: string }): Promise<IMatch[]>
  findByDonationId(donationId: string): Promise<IMatch[]>
  findByNgoId(ngoId: string, status?: MatchStatus): Promise<IMatch[]>
  create(match: Omit<IMatch, "_id" | "createdAt" | "updatedAt">): Promise<IMatch>
  updateStatus(id: string, status: MatchStatus): Promise<IMatch | null>
}

// ============================================================================
// 7. COLLECTION REPOSITORY INTERFACE (DISPATCH & CUSTODY)
// ============================================================================

export interface ICollectionRepository {
  findById(id: string): Promise<ICollection | null>
  findAll(filter?: {
    status?: CollectionStatus
    volunteerId?: string
    unassignedOnly?: boolean
  }): Promise<ICollection[]>
  findByDonationId(donationId: string): Promise<ICollection | null>
  findByNgoId(ngoId: string): Promise<ICollection[]>
  findByVolunteerId(volunteerId: string): Promise<ICollection[]>
  create(
    collection: Omit<ICollection, "_id" | "createdAt" | "updatedAt">
  ): Promise<ICollection>
  claimCollection(
    id: string,
    volunteerId: string
  ): Promise<{ success: boolean; collection?: ICollection; error?: string }>
  updateStatus(
    id: string,
    status: CollectionStatus,
    metadata?: {
      collectedAt?: Date
      temperatureAtPickupCelsius?: number
      collectionPhotos?: string[]
      notes?: string
    }
  ): Promise<ICollection | null>
  submitHandoffProof(
    id: string,
    proof: {
      photoUrl: string
      notes?: string
      location?: {
        latitude?: number
        longitude?: number
        accuracy?: number
      }
      fileSizeBytes?: number
      sha256Checksum?: string
    }
  ): Promise<ICollection | null>
  confirmNgoReceipt(
    id: string,
    confirmation: {
      confirmedBy: string
      notes?: string
    }
  ): Promise<ICollection | null>
  updateLocation(
    id: string,
    location: {
      latitude: number
      longitude: number
      accuracy?: number
    }
  ): Promise<ICollection | null>
}

// ============================================================================
// 8. DISTRIBUTION REPOSITORY INTERFACE (VERIFIED IMPACT)
// ============================================================================

export interface IDistributionRepository {
  findById(id: string): Promise<IDistribution | null>
  findAll(filter?: {
    verificationStatus?: DistributionVerificationStatus
    ngoId?: string
  }): Promise<IDistribution[]>
  findByDonationId(donationId: string): Promise<IDistribution[]>
  findByNeedId(needId: string): Promise<IDistribution[]>
  create(
    distribution: Omit<
      IDistribution,
      "_id" | "createdAt" | "updatedAt" | "verificationStatus"
    >
  ): Promise<IDistribution>
  verify(
    id: string,
    adminUserId: string,
    approved: boolean,
    rejectionReason?: string
  ): Promise<IDistribution | null>
  getImpactMetricsSummary(): Promise<{
    totalMealsDelivered: number
    totalKgSaved: number
    totalCo2Prevented: number
    verifiedDistributionsCount: number
  }>
}

// ============================================================================
// 9. AUDIT LOG REPOSITORY INTERFACE
// ============================================================================

export interface IAuditLogRepository {
  append(log: Omit<IAuditLog, "_id" | "timestamp">): Promise<IAuditLog>
  findByEntity(entityType: string, entityId: string): Promise<IAuditLog[]>
  findAll(limit?: number): Promise<IAuditLog[]>
}

// ============================================================================
// 10. NOTIFICATION REPOSITORY INTERFACE
// ============================================================================

export interface INotificationRepository {
  findByUserId(userId: string, unreadOnly?: boolean): Promise<INotification[]>
  create(
    notification: Omit<INotification, "_id" | "createdAt" | "isRead">
  ): Promise<INotification>
  markAsRead(id: string): Promise<boolean>
  markAllAsRead(userId: string): Promise<number>
}

// ============================================================================
// 11. SESSION REPOSITORY INTERFACE
// ============================================================================

export interface ISessionRepository {
  create(session: Omit<ISession, "_id" | "createdAt">): Promise<ISession>
  findByTokenHash(tokenHash: string): Promise<ISession | null>
  deleteByTokenHash(tokenHash: string): Promise<boolean>
  deleteByUserId(userId: string): Promise<number>
  deleteExpired(): Promise<number>
}

// ============================================================================
// UNIFIED REPOSITORY CONTAINER
// ============================================================================

export interface IFoodConnectRepositories {
  users: IUserRepository
  sessions: ISessionRepository
  donors: IDonorProfileRepository
  ngos: INGOProfileRepository
  needs: INeedRepository
  donations: IDonationRepository
  matches: IMatchRepository
  collections: ICollectionRepository
  distributions: IDistributionRepository
  auditLogs: IAuditLogRepository
  notifications: INotificationRepository
}
