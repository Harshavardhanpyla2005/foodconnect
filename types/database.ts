/**
 * FoodConnect — Core Database Type Definitions & Domain Enums
 *
 * This file specifies the technological data contracts for MongoDB entities,
 * embedded sub-documents, and operational states across Visakhapatnam (Vizag).
 */

// ============================================================================
// 1. GEOMETRY / GEOJSON
// ============================================================================

/**
 * Standard GeoJSON Point representation for MongoDB 2dsphere indexing.
 * Coordinates are formatted strictly as [longitude, latitude].
 * Example for Visakhapatnam center: [83.3155, 17.7215]
 */
export interface GeoJSONPoint {
  type: "Point"
  coordinates: [number, number] // [longitude, latitude]
}

// ============================================================================
// 2. DOMAIN ENUMS
// ============================================================================

export type UserRole = "DONOR" | "NGO" | "VOLUNTEER" | "ADMIN"

export type AccountStatus = "ACTIVE" | "PENDING" | "SUSPENDED" | "REJECTED"

export type DonorType =
  | "INDIVIDUAL"
  | "RESTAURANT"
  | "HOTEL"
  | "CATERING_SERVICE"
  | "EVENT_ORGANIZER"
  | "BUSINESS"
  | "OTHER"

export type PreferredContactMethod = "PHONE" | "EMAIL" | "WHATSAPP"

export type NGOVerificationStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "REJECTED"

export type FoodType =
  | "COOKED_MEALS"
  | "RAW_GRAINS_PULSES"
  | "FRESH_PRODUCE"
  | "BAKERY_ITEMS"
  | "PACKAGED_FOODS"
  | "DAIRY"
  | "BEVERAGES"

export type DietaryPreference =
  | "PURE_VEG"
  | "VEG_AND_NON_VEG"
  | "HALAL_PREFERRED"
  | "NO_RESTRICTION"

export type StorageFacilityType =
  | "COMMERCIAL_REFRIGERATION"
  | "THERMAL_WARMERS"
  | "DRY_VENTILATED_PANTRY"
  | "DEEP_FREEZER"
  | "NONE"

export type NeedUrgency = "IMMEDIATE" | "HIGH" | "FLEXIBLE"

export type NeedStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PARTIALLY_FULFILLED"
  | "FULFILLED"
  | "CLOSED"
  | "EXPIRED"

export type FoodVegCategory = "VEG" | "NON_VEG" | "BOTH"

export type StorageCondition =
  | "HOT_HEATED"
  | "REFRIGERATED"
  | "FROZEN"
  | "ROOM_TEMPERATURE"

export type PackagingCondition =
  | "COMMERCIAL_SEALED"
  | "STAINLESS_STEEL_VATS"
  | "FOOD_GRADE_DISPOSABLE"
  | "CORRUGATED_BOXES"
  | "LOOSE_REQUIRING_VESSELS"

export type DonationStatus =
  | "AVAILABLE"
  | "MATCHING"
  | "REQUESTED"
  | "ACCEPTED"
  | "COLLECTION_ASSIGNED"
  | "HEADING_TO_DONOR"
  | "ARRIVED_AT_DONOR"
  | "COLLECTED"
  | "IN_TRANSIT"
  | "ARRIVED_AT_NGO"
  | "HANDOFF_SUBMITTED"
  | "DELIVERED_TO_NGO"
  | "NGO_CONFIRMED"
  | "DISTRIBUTED"
  | "EVIDENCE_REVIEW"
  | "VERIFIED"
  | "CLOSED"

export type MatchStatus =
  | "PROPOSED"
  | "NOTIFIED"
  | "ACCEPTED"
  | "DECLINED"
  | "EXPIRED"
  | "SUPERSEDED"

export type CollectionStatus =
  | "AVAILABLE"
  | "CLAIMED"
  | "ASSIGNED"
  | "HEADING_TO_DONOR"
  | "ARRIVED_AT_DONOR"
  | "PICKED_UP"
  | "COLLECTED"
  | "IN_TRANSIT"
  | "ARRIVED_AT_NGO"
  | "HANDOFF_SUBMITTED"
  | "DELIVERED_TO_NGO"
  | "NGO_CONFIRMED"
  | "DISTRIBUTED"
  | "EVIDENCE_REVIEW"
  | "VERIFIED"
  | "CLOSED"
  | "CANCELLED"

export type DistributionVerificationStatus =
  | "PENDING"
  | "VERIFIED"
  | "REJECTED"

export type AuditAction =
  | "USER_REGISTERED"
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "USER_STATUS_UPDATED"
  | "DONOR_PROFILE_CREATED"
  | "DONOR_PROFILE_UPDATED"
  | "NGO_PROFILE_CREATED"
  | "NGO_VERIFICATION_STATUS_CHANGED"
  | "NEED_CREATED"
  | "NEED_STATUS_CHANGED"
  | "NEED_QUANTITY_FULFILLED"
  | "DONATION_CREATED"
  | "DONATION_STATUS_CHANGED"
  | "MATCH_PROPOSED"
  | "MATCH_ACCEPTED"
  | "MATCH_DECLINED"
  | "COLLECTION_ASSIGNED"
  | "COLLECTION_STATUS_CHANGED"
  | "COLLECTION_HANDOFF_SUBMITTED"
  | "COLLECTION_DELIVERED_TO_NGO"
  | "COLLECTION_RECEIPT_CONFIRMED"
  | "COLLECTION_LOCATION_UPDATED"
  | "DISTRIBUTION_SUBMITTED"
  | "DISTRIBUTION_VERIFIED"
  | "DISTRIBUTION_REJECTED"
  | "SECURITY_ANOMALY_DETECTED"

export type NotificationEventType =
  | "NEW_MATCHING_DONATION"
  | "DONATION_REQUESTED"
  | "DONATION_ACCEPTED"
  | "COLLECTION_ASSIGNED"
  | "COLLECTION_REMINDER"
  | "COLLECTION_CONFIRMED"
  | "DISTRIBUTION_SUBMITTED"
  | "DISTRIBUTION_VERIFIED"
  | "NEED_PARTIALLY_FULFILLED"
  | "NEED_FULFILLED"
  | "ACCOUNT_VERIFICATION_RESULT"
  | "SAFETY_NOTICE"

// ============================================================================
// 3. CORE ENTITY INTERFACES
// ============================================================================

/**
 * 3.1 User Entity (Authentication & Identity)
 */
export interface IUser {
  _id: string // ObjectId string
  name: string
  email: string
  phone: string
  passwordHash: string
  role: UserRole
  accountStatus: AccountStatus
  emailVerified: boolean
  phoneVerified: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

/**
 * 3.2 DonorProfile Entity (Operational metadata for Food Donors)
 */
export interface IDonorProfile {
  _id: string
  userId: string // references users._id (1:1)
  donorType: DonorType
  organizationName?: string
  fssaiNumber?: string // Optional FSSAI food business registration in India
  contactPerson: string
  contactPhone: string
  contactEmail: string
  address: {
    street: string
    area: string // e.g., "MVP Colony", "Jagadamba Center", "Siripuram"
    city: string // default: "Visakhapatnam"
    state: string // default: "Andhra Pradesh"
    postalCode: string // e.g., "530017"
    landmarks?: string
  }
  location: GeoJSONPoint
  pickupAvailability: {
    daysOfWeek: number[] // 0 (Sun) to 6 (Sat)
    startTime: string // "HH:mm" (24h)
    endTime: string // "HH:mm"
    instructions?: string
  }
  preferredContactMethod: PreferredContactMethod
  totalDonationsCount: number
  totalMealsRescued: number
  createdAt: Date
  updatedAt: Date
}

/**
 * 3.3 NGOProfile Entity (Accreditation & Capacity for Recipient NGOs)
 */
export interface INGOProfile {
  _id: string
  userId: string // references users._id (1:1)
  ngoName: string
  registrationNumber: string // NGO Darpan ID / Trust / Society Act registration
  registrationDocumentUrls: string[] // Firebase Storage links
  verificationStatus: NGOVerificationStatus
  verifiedAt?: Date
  verifiedBy?: string // references users._id (Admin)
  rejectionReason?: string
  contactPerson: {
    name: string
    designation: string
    phone: string
    email: string
  }
  address: {
    street: string
    area: string
    city: string
    state: string
    postalCode: string
  }
  location: GeoJSONPoint
  operatingAreas: string[] // List of Vizag zones served
  foodTypesAccepted: FoodType[]
  dietaryPreferences: DietaryPreference[]
  maximumMealCapacityPerDay: number // Maximum meals NGO can process safely
  pickupRadiusKm: number // Dedicated collection range (e.g., 5 to 25 km)
  availability: {
    daysOfWeek: number[]
    openTime: string
    closeTime: string
  }
  communitiesServed: string[] // e.g., ["Elderly Residents", "Orphanages", "Migrant Day Laborers"]
  storageFacilities: StorageFacilityType[]
  foodHandlingCapabilities: {
    hasThermalContainers: boolean
    hasRefrigeration: boolean
    hasDedicatedTransport: boolean
    vehicleCount: number
    staffHandlerCount: number
  }
  totalNeedsCount: number
  totalMealsReceived: number
  createdAt: Date
  updatedAt: Date
}

/**
 * 3.4 Need Entity (Real Community Demand)
 */
export interface INeed {
  _id: string
  ngoId: string // references ngo_profiles._id
  beneficiaryCategory: string // e.g., "Shelter Residents", "Coastal Fisher Families"
  location: {
    address: string
    area: string
    city: string
  }
  geoPoint: GeoJSONPoint
  peopleNeedingFood: number
  quantityRequired: number
  unit: "portions" | "kg" | "packets" | "litres"
  quantityFulfilled: number
  quantityRemaining: number // invariant: quantityRequired - quantityFulfilled
  foodType: FoodType
  dietaryRequirements: DietaryPreference
  urgency: NeedUrgency
  requiredBy: Date
  additionalRequirements?: string
  verificationState: "NGO_VERIFIED" | "PENDING_AUDIT"
  status: NeedStatus
  expiresAt: Date
  version: number // for optimistic locking
  createdAt: Date
  updatedAt: Date
}

/**
 * 3.5 Donation Entity (Surplus Food Lot)
 */
export interface IDonation {
  _id: string
  donorId: string // references donor_profiles._id
  foodName: string
  foodCategory: FoodType
  vegNonVeg: FoodVegCategory
  quantity: number
  unit: "portions" | "kg" | "packets" | "litres"
  preparedAt: Date
  safeConsumptionDeadline: Date
  storageCondition: StorageCondition
  packagingCondition: PackagingCondition
  allergens: string[] // e.g., ["Nuts", "Dairy", "Gluten"]
  notes?: string
  photoReferences: string[] // Firebase Storage URLs
  pickupAddress: {
    street: string
    area: string
    city: string
    postalCode: string
    instructions?: string
  }
  pickupLocation: GeoJSONPoint
  pickupAvailabilityWindow: {
    start: Date
    end: Date
  }
  donorAcknowledgement: {
    accepted: boolean
    timestamp: Date
    ipAddress?: string
    statement: string
  }
  status: DonationStatus
  activeMatchId?: string // references matches._id when in matching/requested
  assignedCollectionId?: string // references collections._id
  version: number
  createdAt: Date
  updatedAt: Date
}

/**
 * 3.6 Match Entity (Intelligent Match Recommendation)
 */
export interface IMatchFactorScores {
  distanceScore: number // 0-100
  foodCompatibilityScore: number // 0-100
  quantityAlignmentScore: number // 0-100
  urgencyScore: number // 0-100
  deadlineScore: number // 0-100
  storageCapacityScore: number // 0-100
}

export interface IMatch {
  _id: string
  donationId: string // references donations._id
  needId: string // references needs._id
  ngoId: string // references ngo_profiles._id
  score: number // composite 0-100
  distanceKm: number
  factorScores: IMatchFactorScores
  explanation: {
    summary: string
    positiveFactors: string[]
    riskFactors: string[]
  }
  status: MatchStatus
  proposedAt: Date
  respondedAt?: Date
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

/**
 * 3.7 Collection Entity (Pickup & Transport Logistics)
 */
export interface ICollection {
  _id: string
  donationId: string // references donations._id
  ngoId: string // references ngo_profiles._id
  needId?: string // references needs._id
  collectorType: "NGO_INTERNAL" | "VOLUNTEER_PARTNER"
  volunteerId?: string // references users._id (if volunteer assigned)
  pickupAddress: {
    street: string
    area: string
    city: string
  }
  pickupCoordinates: GeoJSONPoint
  scheduledAt: Date
  assignedAt: Date
  enRouteAt?: Date
  arrivedAt?: Date
  collectedAt?: Date
  status: CollectionStatus
  collectionPhotos: string[] // Proof photos
  temperatureAtPickupCelsius?: number
  notes?: string
  cancelledReason?: string
  // Physical Handoff Proof captured by volunteer at NGO delivery
  handoffProof?: {
    photoUrl: string
    timestamp: Date
    notes?: string
    location?: {
      latitude?: number
      longitude?: number
      accuracy?: number
    }
    fileSizeBytes?: number
    sha256Checksum?: string
  }
  // Confirmation of physical handover by recipient NGO
  ngoConfirmation?: {
    confirmedBy: string // references users._id
    confirmedAt: Date
    receiptConfirmed: boolean
    notes?: string
  }
  // Delivery-style live GPS tracking
  currentLocation?: {
    latitude: number
    longitude: number
    accuracy?: number
    updatedAt: Date
  }
  locationHistory?: Array<{
    latitude: number
    longitude: number
    accuracy?: number
    timestamp: Date
  }>
  createdAt: Date
  updatedAt: Date
}

/**
 * 3.8 Distribution Entity (Proof of Impact & Community Handover)
 */
export interface IDistribution {
  _id: string
  donationId: string // references donations._id
  ngoId: string // references ngo_profiles._id
  needId: string // references needs._id
  collectionId?: string // references collections._id
  quantityDistributed: number
  unit: "portions" | "kg" | "packets" | "litres"
  peopleServed: number
  distributionTimestamp: Date
  distributionLocation: {
    communityCenterName: string
    street: string
    area: string
    city: string
  }
  geoPoint: GeoJSONPoint
  evidencePhotos: string[] // Firebase Storage URLs
  description: string
  submittedBy: string // references users._id (NGO Staff)
  verificationStatus: DistributionVerificationStatus
  verifiedBy?: string // references users._id (Admin)
  verifiedAt?: Date
  rejectionReason?: string
  impactMetrics: {
    mealsDelivered: number
    estimatedKgSaved: number
    co2KgPrevented: number
  }
  createdAt: Date
  updatedAt: Date
}

/**
 * 3.9 AuditLog Entity (Immutable Audit Ledger)
 */
export interface IAuditLog {
  _id: string
  actorId?: string // references users._id (or "SYSTEM")
  actorRole?: UserRole | "SYSTEM"
  action: AuditAction
  entityType:
    | "User"
    | "DonorProfile"
    | "NGOProfile"
    | "Need"
    | "Donation"
    | "Match"
    | "Collection"
    | "Distribution"
  entityId: string
  previousState?: Record<string, unknown>
  newState?: Record<string, unknown>
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}

/**
 * 3.10 Notification Entity (In-App & Asynchronous Alerts)
 */
export interface INotification {
  _id: string
  userId: string // references users._id
  eventType: NotificationEventType
  title: string
  message: string
  entityType?: "Donation" | "Need" | "Match" | "Collection" | "Distribution" | "Account"
  entityId?: string
  actionUrl?: string
  isRead: boolean
  readAt?: Date
  createdAt: Date
}

/**
 * 3.11 Session Entity (Custom Authentication Session Store)
 */
export interface ISession {
  _id: string
  userId: string // references users._id
  tokenHash: string // Cryptographic hash (SHA-256) of raw cookie token
  role: UserRole
  createdAt: Date
  expiresAt: Date
  userAgent?: string
  ipAddress?: string
}
