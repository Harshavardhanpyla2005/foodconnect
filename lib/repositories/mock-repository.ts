/**
 * FoodConnect — In-Memory Prototype Repository Implementation
 *
 * Implements all database-agnostic repository interfaces using local mock
 * state cloned from realistic Visakhapatnam seed data.
 *
 * Designed to mirror MongoDB semantics (atomic operations, lifecycle status
 * transitions, filter matching, indexing lookups) so that MongoDB Atlas can
 * replace this implementation without changing any caller code.
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
  DonationStatus,
  MatchStatus,
  CollectionStatus,
  NGOVerificationStatus,
} from "@/types/database"

import {
  IUserRepository,
  ISessionRepository,
  IDonorProfileRepository,
  INGOProfileRepository,
  INeedRepository,
  NeedFilter,
  IDonationRepository,
  DonationFilter,
  IMatchRepository,
  ICollectionRepository,
  IDistributionRepository,
  IAuditLogRepository,
  INotificationRepository,
  IFoodConnectRepositories,
} from "./interfaces"

import {
  SEED_USERS,
  SEED_DONOR_PROFILES,
  SEED_NGO_PROFILES,
  SEED_NEEDS,
  SEED_DONATIONS,
  SEED_MATCHES,
  SEED_COLLECTIONS,
  SEED_DISTRIBUTIONS,
  SEED_AUDIT_LOGS,
  SEED_NOTIFICATIONS,
} from "./mock-data"

// Helper to generate unique demo IDs
function generateMockId(prefix: string): string {
  const rand = Math.random().toString(36).substring(2, 8)
  const ts = Date.now().toString(36)
  return `${prefix}-mock-${ts}-${rand}`
}

function clone<T>(val: T): T {
  return structuredClone(val)
}

// ============================================================================
// 1. MOCK USER REPOSITORY
// ============================================================================

export class MockUserRepository implements IUserRepository {
  private users: IUser[]

  constructor(initialData: IUser[] = SEED_USERS) {
    this.users = clone(initialData)
  }

  async findById(id: string): Promise<IUser | null> {
    const user = this.users.find((u) => u._id === id)
    return user ? clone(user) : null
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const user = this.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    )
    return user ? clone(user) : null
  }

  async findAll(): Promise<IUser[]> {
    return clone(this.users)
  }

  async create(
    data: Omit<IUser, "_id" | "createdAt" | "updatedAt">
  ): Promise<IUser> {
    const now = new Date()
    const newUser: IUser = {
      ...clone(data),
      _id: generateMockId("usr"),
      createdAt: now,
      updatedAt: now,
    }
    this.users.push(newUser)
    return clone(newUser)
  }

  async update(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    const idx = this.users.findIndex((u) => u._id === id)
    if (idx === -1) return null

    this.users[idx] = {
      ...this.users[idx],
      ...clone(updates),
      updatedAt: new Date(),
    }
    return clone(this.users[idx])
  }

  reset(): void {
    this.users = clone(SEED_USERS)
  }
}

// ============================================================================
// 2. MOCK DONOR PROFILE REPOSITORY
// ============================================================================

export class MockDonorProfileRepository implements IDonorProfileRepository {
  private profiles: IDonorProfile[]

  constructor(initialData: IDonorProfile[] = SEED_DONOR_PROFILES) {
    this.profiles = clone(initialData)
  }

  async findById(id: string): Promise<IDonorProfile | null> {
    const p = this.profiles.find((dp) => dp._id === id)
    return p ? clone(p) : null
  }

  async findByUserId(userId: string): Promise<IDonorProfile | null> {
    const p = this.profiles.find((dp) => dp.userId === userId)
    return p ? clone(p) : null
  }

  async findAll(): Promise<IDonorProfile[]> {
    return clone(this.profiles)
  }

  async findByArea(area: string): Promise<IDonorProfile[]> {
    const areaLower = area.toLowerCase().trim()
    const matches = this.profiles.filter((p) =>
      p.address.area.toLowerCase().includes(areaLower)
    )
    return clone(matches)
  }

  async create(
    profile: Omit<
      IDonorProfile,
      "_id" | "createdAt" | "updatedAt" | "totalDonationsCount" | "totalMealsRescued"
    >
  ): Promise<IDonorProfile> {
    const now = new Date()
    const newProfile: IDonorProfile = {
      ...clone(profile),
      _id: generateMockId("donor"),
      totalDonationsCount: 0,
      totalMealsRescued: 0,
      createdAt: now,
      updatedAt: now,
    }
    this.profiles.push(newProfile)
    return clone(newProfile)
  }

  async update(
    id: string,
    updates: Partial<IDonorProfile>
  ): Promise<IDonorProfile | null> {
    const idx = this.profiles.findIndex((p) => p._id === id)
    if (idx === -1) return null

    this.profiles[idx] = {
      ...this.profiles[idx],
      ...clone(updates),
      updatedAt: new Date(),
    }
    return clone(this.profiles[idx])
  }

  reset(): void {
    this.profiles = clone(SEED_DONOR_PROFILES)
  }
}

// ============================================================================
// 3. MOCK NGO PROFILE REPOSITORY
// ============================================================================

export class MockNGOProfileRepository implements INGOProfileRepository {
  private ngos: INGOProfile[]

  constructor(initialData: INGOProfile[] = SEED_NGO_PROFILES) {
    this.ngos = clone(initialData)
  }

  async findById(id: string): Promise<INGOProfile | null> {
    const ngo = this.ngos.find((n) => n._id === id)
    return ngo ? clone(ngo) : null
  }

  async findByUserId(userId: string): Promise<INGOProfile | null> {
    const ngo = this.ngos.find((n) => n.userId === userId)
    return ngo ? clone(ngo) : null
  }

  async findAll(options?: { verifiedOnly?: boolean }): Promise<INGOProfile[]> {
    let result = this.ngos
    if (options?.verifiedOnly) {
      result = result.filter(
        (n) => n.verificationStatus === "VERIFIED"
      )
    }
    return clone(result)
  }

  async findByArea(area: string): Promise<INGOProfile[]> {
    const areaLower = area.toLowerCase().trim()
    const matches = this.ngos.filter(
      (n) =>
        n.address.area.toLowerCase().includes(areaLower) ||
        n.operatingAreas.some((oa) => oa.toLowerCase().includes(areaLower))
    )
    return clone(matches)
  }

  async create(
    profile: Omit<
      INGOProfile,
      "_id" | "createdAt" | "updatedAt" | "totalNeedsCount" | "totalMealsReceived"
    >
  ): Promise<INGOProfile> {
    const now = new Date()
    const newNgo: INGOProfile = {
      ...clone(profile),
      _id: generateMockId("ngo"),
      totalNeedsCount: 0,
      totalMealsReceived: 0,
      createdAt: now,
      updatedAt: now,
    }
    this.ngos.push(newNgo)
    return clone(newNgo)
  }

  async update(
    id: string,
    updates: Partial<INGOProfile>
  ): Promise<INGOProfile | null> {
    const idx = this.ngos.findIndex((n) => n._id === id)
    if (idx === -1) return null

    this.ngos[idx] = {
      ...this.ngos[idx],
      ...clone(updates),
      updatedAt: new Date(),
    }
    return clone(this.ngos[idx])
  }

  async updateVerificationStatus(
    id: string,
    status: NGOVerificationStatus,
    adminUserId: string,
    reason?: string
  ): Promise<INGOProfile | null> {
    const idx = this.ngos.findIndex((n) => n._id === id)
    if (idx === -1) return null

    const now = new Date()
    this.ngos[idx] = {
      ...this.ngos[idx],
      verificationStatus: status,
      verifiedAt: status === "VERIFIED" ? now : undefined,
      verifiedBy: adminUserId,
      rejectionReason: status === "REJECTED" ? reason : undefined,
      updatedAt: now,
    }
    return clone(this.ngos[idx])
  }

  reset(): void {
    this.ngos = clone(SEED_NGO_PROFILES)
  }
}

// ============================================================================
// 4. MOCK NEED REPOSITORY (DEMAND-DRIVEN ARCHITECTURE)
// ============================================================================

export class MockNeedRepository implements INeedRepository {
  private needs: INeed[]

  constructor(initialData: INeed[] = SEED_NEEDS) {
    this.needs = clone(initialData)
  }

  async findById(id: string): Promise<INeed | null> {
    const need = this.needs.find((n) => n._id === id)
    return need ? clone(need) : null
  }

  async findAll(filter?: NeedFilter): Promise<INeed[]> {
    let result = this.needs

    if (filter) {
      if (filter.status && filter.status.length > 0) {
        result = result.filter((n) => filter.status!.includes(n.status))
      }
      if (filter.urgency) {
        result = result.filter((n) => n.urgency === filter.urgency)
      }
      if (filter.ngoId) {
        result = result.filter((n) => n.ngoId === filter.ngoId)
      }
      if (filter.foodType) {
        result = result.filter((n) => n.foodType === filter.foodType)
      }
      if (filter.area) {
        const areaLower = filter.area.toLowerCase().trim()
        result = result.filter((n) =>
          n.location.area.toLowerCase().includes(areaLower)
        )
      }
    }

    return clone(result)
  }

  async findByNgoId(ngoId: string): Promise<INeed[]> {
    const filtered = this.needs.filter((n) => n.ngoId === ngoId)
    return clone(filtered)
  }

  async create(
    need: Omit<
      INeed,
      "_id" | "createdAt" | "updatedAt" | "quantityFulfilled" | "quantityRemaining" | "version"
    >
  ): Promise<INeed> {
    const now = new Date()
    const newNeed: INeed = {
      ...clone(need),
      _id: generateMockId("need"),
      quantityFulfilled: 0,
      quantityRemaining: need.quantityRequired,
      version: 1,
      createdAt: now,
      updatedAt: now,
    }
    this.needs.push(newNeed)
    return clone(newNeed)
  }

  async update(id: string, updates: Partial<INeed>): Promise<INeed | null> {
    const idx = this.needs.findIndex((n) => n._id === id)
    if (idx === -1) return null

    this.needs[idx] = {
      ...this.needs[idx],
      ...clone(updates),
      version: this.needs[idx].version + 1,
      updatedAt: new Date(),
    }
    return clone(this.needs[idx])
  }

  /**
   * Atomic fulfillment update ensuring quantity conservation:
   * quantityFulfilled += claimAmount
   * quantityRemaining -= claimAmount
   * Status transitions to FULFILLED if remaining <= 0, else PARTIALLY_FULFILLED
   */
  async atomicFulfill(
    id: string,
    claimAmount: number
  ): Promise<{ success: boolean; need?: INeed; error?: string }> {
    const idx = this.needs.findIndex((n) => n._id === id)
    if (idx === -1) {
      return { success: false, error: "Need record not found" }
    }

    const current = this.needs[idx]

    if (
      current.status === "FULFILLED" ||
      current.status === "CLOSED" ||
      current.status === "EXPIRED"
    ) {
      return {
        success: false,
        error: `Cannot fulfill need in '${current.status}' status`,
      }
    }

    if (claimAmount <= 0) {
      return { success: false, error: "Claim amount must be greater than zero" }
    }

    if (claimAmount > current.quantityRemaining) {
      return {
        success: false,
        error: `Claim amount (${claimAmount}) exceeds remaining needed quantity (${current.quantityRemaining})`,
      }
    }

    const newFulfilled = current.quantityFulfilled + claimAmount
    const newRemaining = current.quantityRemaining - claimAmount
    const newStatus = newRemaining === 0 ? "FULFILLED" : "PARTIALLY_FULFILLED"

    this.needs[idx] = {
      ...current,
      quantityFulfilled: newFulfilled,
      quantityRemaining: newRemaining,
      status: newStatus,
      version: current.version + 1,
      updatedAt: new Date(),
    }

    return { success: true, need: clone(this.needs[idx]) }
  }

  reset(): void {
    this.needs = clone(SEED_NEEDS)
  }
}

// ============================================================================
// 5. MOCK DONATION REPOSITORY (SUPPLY LIFECYCLE)
// ============================================================================

export class MockDonationRepository implements IDonationRepository {
  private donations: IDonation[]

  constructor(initialData: IDonation[] = SEED_DONATIONS) {
    this.donations = clone(initialData)
  }

  async findById(id: string): Promise<IDonation | null> {
    const donation = this.donations.find((d) => d._id === id)
    return donation ? clone(donation) : null
  }

  async findAll(filter?: DonationFilter): Promise<IDonation[]> {
    let result = this.donations

    if (filter) {
      if (filter.status && filter.status.length > 0) {
        result = result.filter((d) => filter.status!.includes(d.status))
      }
      if (filter.foodCategory) {
        result = result.filter(
          (d) => d.foodCategory === filter.foodCategory
        )
      }
      if (filter.vegNonVeg) {
        result = result.filter(
          (d) => d.vegNonVeg === filter.vegNonVeg
        )
      }
      if (filter.donorId) {
        result = result.filter((d) => d.donorId === filter.donorId)
      }
      if (filter.area) {
        const areaLower = filter.area.toLowerCase().trim()
        result = result.filter((d) =>
          d.pickupAddress.area.toLowerCase().includes(areaLower)
        )
      }
    }

    return clone(result)
  }

  async findByDonorId(donorId: string): Promise<IDonation[]> {
    const filtered = this.donations.filter((d) => d.donorId === donorId)
    return clone(filtered)
  }

  async create(
    donation: Omit<
      IDonation,
      "_id" | "createdAt" | "updatedAt" | "status" | "version"
    >
  ): Promise<IDonation> {
    const now = new Date()
    const newDonation: IDonation = {
      ...clone(donation),
      _id: generateMockId("don"),
      status: "AVAILABLE",
      version: 1,
      createdAt: now,
      updatedAt: now,
    }
    this.donations.push(newDonation)
    return clone(newDonation)
  }

  async update(
    id: string,
    updates: Partial<IDonation>
  ): Promise<IDonation | null> {
    const idx = this.donations.findIndex((d) => d._id === id)
    if (idx === -1) return null

    this.donations[idx] = {
      ...this.donations[idx],
      ...clone(updates),
      version: this.donations[idx].version + 1,
      updatedAt: new Date(),
    }
    return clone(this.donations[idx])
  }

  async updateStatus(
    id: string,
    newStatus: DonationStatus
  ): Promise<IDonation | null> {
    const idx = this.donations.findIndex((d) => d._id === id)
    if (idx === -1) return null

    this.donations[idx] = {
      ...this.donations[idx],
      status: newStatus,
      version: this.donations[idx].version + 1,
      updatedAt: new Date(),
    }
    return clone(this.donations[idx])
  }

  reset(): void {
    this.donations = clone(SEED_DONATIONS)
  }
}

// ============================================================================
// 6. MOCK MATCH REPOSITORY
// ============================================================================

export class MockMatchRepository implements IMatchRepository {
  private matches: IMatch[]

  constructor(initialData: IMatch[] = SEED_MATCHES) {
    this.matches = clone(initialData)
  }

  async findById(id: string): Promise<IMatch | null> {
    const m = this.matches.find((match) => match._id === id)
    return m ? clone(m) : null
  }

  async findAll(filter?: { status?: MatchStatus; ngoId?: string; donationId?: string }): Promise<IMatch[]> {
    let result = this.matches
    if (filter) {
      if (filter.status) {
        result = result.filter((m) => m.status === filter.status)
      }
      if (filter.ngoId) {
        result = result.filter((m) => m.ngoId === filter.ngoId)
      }
      if (filter.donationId) {
        result = result.filter((m) => m.donationId === filter.donationId)
      }
    }
    return clone(result)
  }

  async findByDonationId(donationId: string): Promise<IMatch[]> {
    const filtered = this.matches.filter((m) => m.donationId === donationId)
    return clone(filtered)
  }

  async findByNgoId(ngoId: string, status?: MatchStatus): Promise<IMatch[]> {
    let filtered = this.matches.filter((m) => m.ngoId === ngoId)
    if (status) {
      filtered = filtered.filter((m) => m.status === status)
    }
    return clone(filtered)
  }

  async create(
    match: Omit<IMatch, "_id" | "createdAt" | "updatedAt">
  ): Promise<IMatch> {
    const now = new Date()
    const newMatch: IMatch = {
      ...clone(match),
      _id: generateMockId("match"),
      createdAt: now,
      updatedAt: now,
    }
    this.matches.push(newMatch)
    return clone(newMatch)
  }

  async updateStatus(id: string, status: MatchStatus): Promise<IMatch | null> {
    const idx = this.matches.findIndex((m) => m._id === id)
    if (idx === -1) return null

    const now = new Date()
    this.matches[idx] = {
      ...this.matches[idx],
      status,
      respondedAt:
        status === "ACCEPTED" || status === "DECLINED"
          ? now
          : this.matches[idx].respondedAt,
      updatedAt: now,
    }
    return clone(this.matches[idx])
  }

  reset(): void {
    this.matches = clone(SEED_MATCHES)
  }
}

// ============================================================================
// 7. MOCK COLLECTION REPOSITORY (DISPATCH & CUSTODY)
// ============================================================================

export class MockCollectionRepository implements ICollectionRepository {
  private collections: ICollection[]

  constructor(initialData: ICollection[] = SEED_COLLECTIONS) {
    this.collections = clone(initialData)
  }

  async findById(id: string): Promise<ICollection | null> {
    const col = this.collections.find((c) => c._id === id)
    return col ? clone(col) : null
  }

  async findAll(filter?: {
    status?: CollectionStatus
    volunteerId?: string
    unassignedOnly?: boolean
  }): Promise<ICollection[]> {
    let list = this.collections
    if (filter?.status) {
      list = list.filter((c) => c.status === filter.status)
    }
    if (filter?.volunteerId) {
      list = list.filter((c) => c.volunteerId === filter.volunteerId)
    }
    if (filter?.unassignedOnly) {
      list = list.filter((c) => !c.volunteerId)
    }
    return clone(list)
  }

  async findByDonationId(donationId: string): Promise<ICollection | null> {
    const col = this.collections.find((c) => c.donationId === donationId)
    return col ? clone(col) : null
  }

  async findByNgoId(ngoId: string): Promise<ICollection[]> {
    const filtered = this.collections.filter((c) => c.ngoId === ngoId)
    return clone(filtered)
  }

  async findByVolunteerId(volunteerId: string): Promise<ICollection[]> {
    const filtered = this.collections.filter(
      (c) => c.volunteerId === volunteerId
    )
    return clone(filtered)
  }

  async claimCollection(
    id: string,
    volunteerId: string
  ): Promise<{ success: boolean; collection?: ICollection; error?: string }> {
    const idx = this.collections.findIndex((c) => c._id === id)
    if (idx === -1) {
      return { success: false, error: "Collection task not found" }
    }

    const current = this.collections[idx]
    // Atomic check: prevent simultaneous claiming by two volunteers
    if (current.volunteerId && current.volunteerId !== volunteerId) {
      return {
        success: false,
        error: "This collection pickup has already been claimed by another courier.",
      }
    }

    const now = new Date()
    this.collections[idx] = {
      ...current,
      volunteerId,
      status: "ASSIGNED",
      assignedAt: current.assignedAt || now,
      updatedAt: now,
    }

    return { success: true, collection: clone(this.collections[idx]) }
  }

  async create(
    collection: Omit<ICollection, "_id" | "createdAt" | "updatedAt">
  ): Promise<ICollection> {
    const now = new Date()
    const newCollection: ICollection = {
      ...clone(collection),
      _id: generateMockId("col"),
      createdAt: now,
      updatedAt: now,
    }
    this.collections.push(newCollection)
    return clone(newCollection)
  }

  async updateStatus(
    id: string,
    status: CollectionStatus,
    metadata?: {
      collectedAt?: Date
      temperatureAtPickupCelsius?: number
      collectionPhotos?: string[]
      notes?: string
    }
  ): Promise<ICollection | null> {
    const idx = this.collections.findIndex((c) => c._id === id)
    if (idx === -1) return null

    const now = new Date()
    const current = this.collections[idx]

    this.collections[idx] = {
      ...current,
      status,
      collectedAt:
        metadata?.collectedAt ??
        (status === "COLLECTED"
          ? current.collectedAt || now
          : current.collectedAt),
      temperatureAtPickupCelsius:
        metadata?.temperatureAtPickupCelsius ??
        current.temperatureAtPickupCelsius,
      collectionPhotos: metadata?.collectionPhotos ?? current.collectionPhotos,
      notes: metadata?.notes ?? current.notes,
      updatedAt: now,
    }

    return clone(this.collections[idx])
  }

  async submitHandoffProof(
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
  ): Promise<ICollection | null> {
    const idx = this.collections.findIndex((c) => c._id === id)
    if (idx === -1) return null

    const now = new Date()
    const current = this.collections[idx]

    this.collections[idx] = {
      ...current,
      status: "DELIVERED_TO_NGO",
      handoffProof: {
        photoUrl: proof.photoUrl,
        timestamp: now,
        notes: proof.notes,
        location: proof.location,
        fileSizeBytes: proof.fileSizeBytes,
        sha256Checksum: proof.sha256Checksum,
      },
      updatedAt: now,
    }

    return clone(this.collections[idx])
  }

  async confirmNgoReceipt(
    id: string,
    confirmation: {
      confirmedBy: string
      notes?: string
    }
  ): Promise<ICollection | null> {
    const idx = this.collections.findIndex((c) => c._id === id)
    if (idx === -1) return null

    const now = new Date()
    const current = this.collections[idx]

    this.collections[idx] = {
      ...current,
      status: "NGO_CONFIRMED",
      ngoConfirmation: {
        confirmedBy: confirmation.confirmedBy,
        confirmedAt: now,
        receiptConfirmed: true,
        notes: confirmation.notes,
      },
      updatedAt: now,
    }

    return clone(this.collections[idx])
  }

  async updateLocation(
    id: string,
    location: {
      latitude: number
      longitude: number
      accuracy?: number
    }
  ): Promise<ICollection | null> {
    const idx = this.collections.findIndex((c) => c._id === id)
    if (idx === -1) return null

    const now = new Date()
    const current = this.collections[idx]
    const history = current.locationHistory ? [...current.locationHistory] : []
    history.push({
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      timestamp: now,
    })

    // Retain only last 30 positions for performance
    if (history.length > 30) history.shift()

    this.collections[idx] = {
      ...current,
      currentLocation: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        updatedAt: now,
      },
      locationHistory: history,
      updatedAt: now,
    }

    return clone(this.collections[idx])
  }

  reset(): void {
    this.collections = clone(SEED_COLLECTIONS)
  }
}

// ============================================================================
// 8. MOCK DISTRIBUTION REPOSITORY (VERIFIED IMPACT)
// ============================================================================

export class MockDistributionRepository implements IDistributionRepository {
  private distributions: IDistribution[]

  constructor(initialData: IDistribution[] = SEED_DISTRIBUTIONS) {
    this.distributions = clone(initialData)
  }

  async findById(id: string): Promise<IDistribution | null> {
    const dist = this.distributions.find((d) => d._id === id)
    return dist ? clone(dist) : null
  }

  async findAll(filter?: {
    verificationStatus?: "PENDING" | "VERIFIED" | "REJECTED"
    ngoId?: string
  }): Promise<IDistribution[]> {
    let result = this.distributions

    if (filter) {
      if (filter.verificationStatus) {
        result = result.filter(
          (d) => d.verificationStatus === filter.verificationStatus
        )
      }
      if (filter.ngoId) {
        result = result.filter((d) => d.ngoId === filter.ngoId)
      }
    }

    return clone(result)
  }

  async findByDonationId(donationId: string): Promise<IDistribution[]> {
    const filtered = this.distributions.filter(
      (d) => d.donationId === donationId
    )
    return clone(filtered)
  }

  async findByNeedId(needId: string): Promise<IDistribution[]> {
    const filtered = this.distributions.filter((d) => d.needId === needId)
    return clone(filtered)
  }

  async create(
    distribution: Omit<
      IDistribution,
      "_id" | "createdAt" | "updatedAt" | "verificationStatus"
    >
  ): Promise<IDistribution> {
    const now = new Date()
    const newDist: IDistribution = {
      ...clone(distribution),
      _id: generateMockId("dist"),
      verificationStatus: "PENDING",
      createdAt: now,
      updatedAt: now,
    }
    this.distributions.push(newDist)
    return clone(newDist)
  }

  async verify(
    id: string,
    adminUserId: string,
    approved: boolean,
    rejectionReason?: string
  ): Promise<IDistribution | null> {
    const idx = this.distributions.findIndex((d) => d._id === id)
    if (idx === -1) return null

    const now = new Date()
    this.distributions[idx] = {
      ...this.distributions[idx],
      verificationStatus: approved ? "VERIFIED" : "REJECTED",
      verifiedBy: adminUserId,
      verifiedAt: now,
      rejectionReason: !approved ? rejectionReason : undefined,
      updatedAt: now,
    }
    return clone(this.distributions[idx])
  }

  async getImpactMetricsSummary(): Promise<{
    totalMealsDelivered: number
    totalKgSaved: number
    totalCo2Prevented: number
    verifiedDistributionsCount: number
  }> {
    const verified = this.distributions.filter(
      (d) => d.verificationStatus === "VERIFIED"
    )

    const totalMealsDelivered = verified.reduce(
      (sum, d) => sum + (d.impactMetrics?.mealsDelivered || d.peopleServed || 0),
      0
    )
    const totalKgSaved = verified.reduce(
      (sum, d) => sum + (d.impactMetrics?.estimatedKgSaved || 0),
      0
    )
    const totalCo2Prevented = verified.reduce(
      (sum, d) => sum + (d.impactMetrics?.co2KgPrevented || 0),
      0
    )

    return {
      totalMealsDelivered,
      totalKgSaved,
      totalCo2Prevented: Math.round(totalCo2Prevented * 10) / 10,
      verifiedDistributionsCount: verified.length,
    }
  }

  reset(): void {
    this.distributions = clone(SEED_DISTRIBUTIONS)
  }
}

// ============================================================================
// 9. MOCK AUDIT LOG REPOSITORY
// ============================================================================

export class MockAuditLogRepository implements IAuditLogRepository {
  private logs: IAuditLog[]

  constructor(initialData: IAuditLog[] = SEED_AUDIT_LOGS) {
    this.logs = clone(initialData)
  }

  async append(log: Omit<IAuditLog, "_id" | "timestamp">): Promise<IAuditLog> {
    const newLog: IAuditLog = {
      ...clone(log),
      _id: generateMockId("audit"),
      timestamp: new Date(),
    }
    this.logs.unshift(newLog) // Most recent first
    return clone(newLog)
  }

  async findByEntity(
    entityType: string,
    entityId: string
  ): Promise<IAuditLog[]> {
    const filtered = this.logs.filter(
      (l) => l.entityType === entityType && l.entityId === entityId
    )
    return clone(filtered)
  }

  async findAll(limit = 100): Promise<IAuditLog[]> {
    const sliced = this.logs.slice(0, limit)
    return clone(sliced)
  }

  reset(): void {
    this.logs = clone(SEED_AUDIT_LOGS)
  }
}

// ============================================================================
// 10. MOCK NOTIFICATION REPOSITORY
// ============================================================================

export class MockNotificationRepository implements INotificationRepository {
  private notifications: INotification[]

  constructor(initialData: INotification[] = SEED_NOTIFICATIONS) {
    this.notifications = clone(initialData)
  }

  async findByUserId(
    userId: string,
    unreadOnly = false
  ): Promise<INotification[]> {
    let result = this.notifications.filter((n) => n.userId === userId)
    if (unreadOnly) {
      result = result.filter((n) => !n.isRead)
    }
    // Sort descending by creation date
    result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    return clone(result)
  }

  async create(
    notification: Omit<INotification, "_id" | "createdAt" | "isRead">
  ): Promise<INotification> {
    const now = new Date()
    const newNotif: INotification = {
      ...clone(notification),
      _id: generateMockId("notif"),
      isRead: false,
      createdAt: now,
    }
    this.notifications.unshift(newNotif)
    return clone(newNotif)
  }

  async markAsRead(id: string): Promise<boolean> {
    const notif = this.notifications.find((n) => n._id === id)
    if (!notif) return false
    notif.isRead = true
    return true
  }

  async markAllAsRead(userId: string): Promise<number> {
    let count = 0
    for (const notif of this.notifications) {
      if (notif.userId === userId && !notif.isRead) {
        notif.isRead = true
        count++
      }
    }
    return count
  }

  reset(): void {
    this.notifications = clone(SEED_NOTIFICATIONS)
  }
}

// ============================================================================
// 11. MOCK SESSION REPOSITORY
// ============================================================================

export class MockSessionRepository implements ISessionRepository {
  private sessions: ISession[] = []

  async create(session: Omit<ISession, "_id" | "createdAt">): Promise<ISession> {
    const newSession: ISession = {
      ...session,
      _id: generateMockId("ses"),
      createdAt: new Date(),
    }
    this.sessions.push(newSession)
    return clone(newSession)
  }

  async findByTokenHash(tokenHash: string): Promise<ISession | null> {
    const now = new Date()
    const session = this.sessions.find(
      (s) => s.tokenHash === tokenHash && s.expiresAt > now
    )
    return session ? clone(session) : null
  }

  async deleteByTokenHash(tokenHash: string): Promise<boolean> {
    const initialLen = this.sessions.length
    this.sessions = this.sessions.filter((s) => s.tokenHash !== tokenHash)
    return this.sessions.length < initialLen
  }

  async deleteByUserId(userId: string): Promise<number> {
    const initialLen = this.sessions.length
    this.sessions = this.sessions.filter((s) => s.userId !== userId)
    return initialLen - this.sessions.length
  }

  async deleteExpired(): Promise<number> {
    const now = new Date()
    const initialLen = this.sessions.length
    this.sessions = this.sessions.filter((s) => s.expiresAt > now)
    return initialLen - this.sessions.length
  }

  reset(): void {
    this.sessions = []
  }
}

// ============================================================================
// UNIFIED MOCK REPOSITORIES CONTAINER
// ============================================================================

export class FoodConnectMockRepositories implements IFoodConnectRepositories {
  public users: MockUserRepository
  public sessions: MockSessionRepository
  public donors: MockDonorProfileRepository
  public ngos: MockNGOProfileRepository
  public needs: MockNeedRepository
  public donations: MockDonationRepository
  public matches: MockMatchRepository
  public collections: MockCollectionRepository
  public distributions: MockDistributionRepository
  public auditLogs: MockAuditLogRepository
  public notifications: MockNotificationRepository

  constructor() {
    this.users = new MockUserRepository()
    this.sessions = new MockSessionRepository()
    this.donors = new MockDonorProfileRepository()
    this.ngos = new MockNGOProfileRepository()
    this.needs = new MockNeedRepository()
    this.donations = new MockDonationRepository()
    this.matches = new MockMatchRepository()
    this.collections = new MockCollectionRepository()
    this.distributions = new MockDistributionRepository()
    this.auditLogs = new MockAuditLogRepository()
    this.notifications = new MockNotificationRepository()
  }

  /**
   * Resets all in-memory mock repositories back to the initial seed state.
   */
  resetAll(): void {
    this.users.reset()
    this.sessions.reset()
    this.donors.reset()
    this.ngos.reset()
    this.needs.reset()
    this.donations.reset()
    this.matches.reset()
    this.collections.reset()
    this.distributions.reset()
    this.auditLogs.reset()
    this.notifications.reset()
  }
}
