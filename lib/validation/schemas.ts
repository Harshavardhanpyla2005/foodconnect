import { z } from "zod"

/**
 * FoodConnect — Zod Validation Schemas
 *
 * Provides runtime schema validation for API route handlers, input sanitization,
 * and database document invariants.
 */

// ============================================================================
// 1. GEOMETRY / GEOJSON VALIDATION
// ============================================================================

export const GeoJSONPointSchema = z.object({
  type: z.literal("Point"),
  // [longitude, latitude]: longitude between -180 and 180, latitude between -90 and 90
  coordinates: z.tuple([
    z.number().min(-180).max(180),
    z.number().min(-90).max(90),
  ]),
})

export type GeoJSONPointInput = z.infer<typeof GeoJSONPointSchema>

// ============================================================================
// 2. USER AUTHENTICATION SCHEMAS
// ============================================================================

export const UserRoleSchema = z.enum(["DONOR", "NGO", "VOLUNTEER", "ADMIN"])

export const AccountStatusSchema = z.enum(["ACTIVE", "PENDING", "SUSPENDED", "REJECTED"])

export const UserRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  phone: z
    .string()
    .regex(/^\+?[0-9]{10,14}$/, "Phone must be a valid 10-14 digit number with optional leading +"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: UserRoleSchema,
})

export const UserLoginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
})

// ============================================================================
// 3. DONOR PROFILE SCHEMAS
// ============================================================================

export const DonorTypeSchema = z.enum([
  "INDIVIDUAL",
  "RESTAURANT",
  "HOTEL",
  "CATERING_SERVICE",
  "EVENT_ORGANIZER",
  "BUSINESS",
  "OTHER",
])

export const DonorProfileCreateSchema = z.object({
  donorType: DonorTypeSchema,
  organizationName: z.string().max(150).optional(),
  fssaiNumber: z
    .string()
    .regex(/^[0-9]{14}$/, "FSSAI registration must be exactly 14 digits")
    .optional(),
  contactPerson: z.string().min(2).max(100),
  contactPhone: z.string().regex(/^\+?[0-9]{10,14}$/),
  contactEmail: z.string().email().toLowerCase(),
  address: z.object({
    street: z.string().min(3).max(200),
    area: z.string().min(2).max(100),
    city: z.string().default("Visakhapatnam"),
    state: z.string().default("Andhra Pradesh"),
    postalCode: z.string().regex(/^[0-9]{6}$/, "Indian postal code must be 6 digits"),
    landmarks: z.string().max(200).optional(),
  }),
  location: GeoJSONPointSchema,
  pickupAvailability: z.object({
    daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format HH:mm required"),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format HH:mm required"),
    instructions: z.string().max(500).optional(),
  }),
  preferredContactMethod: z.enum(["PHONE", "EMAIL", "WHATSAPP"]).default("PHONE"),
})

// ============================================================================
// 4. NGO PROFILE SCHEMAS
// ============================================================================

export const NGOVerificationStatusSchema = z.enum([
  "PENDING",
  "UNDER_REVIEW",
  "VERIFIED",
  "REJECTED",
])

export const FoodTypeSchema = z.enum([
  "COOKED_MEALS",
  "RAW_GRAINS_PULSES",
  "FRESH_PRODUCE",
  "BAKERY_ITEMS",
  "PACKAGED_FOODS",
  "DAIRY",
  "BEVERAGES",
])

export const DietaryPreferenceSchema = z.enum([
  "PURE_VEG",
  "VEG_AND_NON_VEG",
  "HALAL_PREFERRED",
  "NO_RESTRICTION",
])

export const StorageFacilityTypeSchema = z.enum([
  "COMMERCIAL_REFRIGERATION",
  "THERMAL_WARMERS",
  "DRY_VENTILATED_PANTRY",
  "DEEP_FREEZER",
  "NONE",
])

export const NGOProfileCreateSchema = z.object({
  ngoName: z.string().min(2, "NGO name required").max(150),
  registrationNumber: z.string().min(3, "Registration / Darpan number required").max(100),
  registrationDocumentUrls: z.array(z.string().url()).min(1, "At least one registration proof required"),
  contactPerson: z.object({
    name: z.string().min(2).max(100),
    designation: z.string().min(2).max(100),
    phone: z.string().regex(/^\+?[0-9]{10,14}$/),
    email: z.string().email().toLowerCase(),
  }),
  address: z.object({
    street: z.string().min(3).max(200),
    area: z.string().min(2).max(100),
    city: z.string().default("Visakhapatnam"),
    state: z.string().default("Andhra Pradesh"),
    postalCode: z.string().regex(/^[0-9]{6}$/),
  }),
  location: GeoJSONPointSchema,
  operatingAreas: z.array(z.string()).min(1, "At least one operating area in Vizag required"),
  foodTypesAccepted: z.array(FoodTypeSchema).min(1, "At least one food type must be accepted"),
  dietaryPreferences: z.array(DietaryPreferenceSchema).min(1),
  maximumMealCapacityPerDay: z.number().int().positive("Daily meal capacity must be greater than 0"),
  pickupRadiusKm: z.number().min(1).max(50, "Pickup radius cannot exceed 50 km"),
  availability: z.object({
    daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1),
    openTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    closeTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  }),
  communitiesServed: z.array(z.string()).min(1, "List at least one beneficiary community group"),
  storageFacilities: z.array(StorageFacilityTypeSchema).min(1),
  foodHandlingCapabilities: z.object({
    hasThermalContainers: z.boolean(),
    hasRefrigeration: z.boolean(),
    hasDedicatedTransport: z.boolean(),
    vehicleCount: z.number().int().nonnegative(),
    staffHandlerCount: z.number().int().positive(),
  }),
})

// ============================================================================
// 5. NEED SCHEMAS (COMMUNITY DEMAND)
// ============================================================================

export const NeedUrgencySchema = z.enum(["IMMEDIATE", "HIGH", "FLEXIBLE"])

export const NeedStatusSchema = z.enum([
  "DRAFT",
  "ACTIVE",
  "PARTIALLY_FULFILLED",
  "FULFILLED",
  "CLOSED",
  "EXPIRED",
])

export const NeedCreateSchema = z.object({
  beneficiaryCategory: z.string().min(2).max(100),
  location: z.object({
    address: z.string().min(3).max(200),
    area: z.string().min(2).max(100),
    city: z.string().default("Visakhapatnam"),
  }),
  geoPoint: GeoJSONPointSchema,
  peopleNeedingFood: z.number().int().positive("People count must be at least 1"),
  quantityRequired: z.number().positive("Quantity required must be greater than 0"),
  unit: z.enum(["portions", "kg", "packets", "litres"]),
  foodType: FoodTypeSchema,
  dietaryRequirements: DietaryPreferenceSchema,
  urgency: NeedUrgencySchema,
  requiredBy: z.coerce.date().refine((d) => d > new Date(), {
    message: "Required-by date must be in the future",
  }),
  additionalRequirements: z.string().max(1000).optional(),
  expiresAt: z.coerce.date().optional(),
})

// ============================================================================
// 6. DONATION SCHEMAS (SURPLUS FOOD INTAKE)
// ============================================================================

export const FoodVegCategorySchema = z.enum(["VEG", "NON_VEG", "BOTH"])

export const StorageConditionSchema = z.enum([
  "HOT_HEATED",
  "REFRIGERATED",
  "FROZEN",
  "ROOM_TEMPERATURE",
])

export const PackagingConditionSchema = z.enum([
  "COMMERCIAL_SEALED",
  "STAINLESS_STEEL_VATS",
  "FOOD_GRADE_DISPOSABLE",
  "CORRUGATED_BOXES",
  "LOOSE_REQUIRING_VESSELS",
])

export const DonationStatusSchema = z.enum([
  "AVAILABLE",
  "MATCHING",
  "REQUESTED",
  "ACCEPTED",
  "COLLECTION_ASSIGNED",
  "HEADING_TO_DONOR",
  "ARRIVED_AT_DONOR",
  "COLLECTED",
  "IN_TRANSIT",
  "ARRIVED_AT_NGO",
  "HANDOFF_SUBMITTED",
  "DELIVERED_TO_NGO",
  "NGO_CONFIRMED",
  "DISTRIBUTED",
  "EVIDENCE_REVIEW",
  "VERIFIED",
  "CLOSED",
])

export const DonationCreateSchema = z.object({
  foodName: z.string().min(2, "Food name is required").max(120),
  foodCategory: FoodTypeSchema,
  vegNonVeg: FoodVegCategorySchema,
  quantity: z.number().positive("Quantity must be greater than 0"),
  unit: z.enum(["portions", "kg", "packets", "litres"]),
  preparedAt: z.coerce.date().refine((d) => d <= new Date(), {
    message: "Preparation time cannot be in the future",
  }),
  safeConsumptionDeadline: z.coerce.date().refine((d) => d > new Date(), {
    message: "Safe consumption deadline must be in the future",
  }),
  storageCondition: StorageConditionSchema,
  packagingCondition: PackagingConditionSchema,
  allergens: z.array(z.string()).default([]),
  notes: z.string().max(1000).optional(),
  photoReferences: z.array(z.string().url()).default([]),
  pickupAddress: z.object({
    street: z.string().min(3).max(200),
    area: z.string().min(2).max(100),
    city: z.string().default("Visakhapatnam"),
    postalCode: z.string().regex(/^[0-9]{6}$/),
    instructions: z.string().max(500).optional(),
  }),
  pickupLocation: GeoJSONPointSchema,
  pickupAvailabilityWindow: z
    .object({
      start: z.coerce.date(),
      end: z.coerce.date(),
    })
    .refine((w) => w.end > w.start, {
      message: "Pickup window end time must be after start time",
    }),
  donorAcknowledgement: z.object({
    accepted: z.literal(true, {
      message: "You must acknowledge food safety accuracy before submitting.",
    }),
    statement: z.string().min(10),
  }),
})

// ============================================================================
// 7. MATCH & RECOMMENDATION SCHEMAS
// ============================================================================

export const MatchStatusSchema = z.enum([
  "PROPOSED",
  "NOTIFIED",
  "ACCEPTED",
  "DECLINED",
  "EXPIRED",
  "SUPERSEDED",
])

// ============================================================================
// 8. COLLECTION & DISPATCH SCHEMAS
// ============================================================================

export const CollectionStatusSchema = z.enum([
  "AVAILABLE",
  "CLAIMED",
  "ASSIGNED",
  "HEADING_TO_DONOR",
  "ARRIVED_AT_DONOR",
  "PICKED_UP",
  "COLLECTED",
  "IN_TRANSIT",
  "ARRIVED_AT_NGO",
  "HANDOFF_SUBMITTED",
  "DELIVERED_TO_NGO",
  "NGO_CONFIRMED",
  "DISTRIBUTED",
  "EVIDENCE_REVIEW",
  "VERIFIED",
  "CLOSED",
  "CANCELLED",
])

export const CollectionAssignSchema = z.object({
  donationId: z.string().min(1),
  collectorType: z.enum(["NGO_INTERNAL", "VOLUNTEER_PARTNER"]),
  volunteerId: z.string().optional(),
  scheduledAt: z.coerce.date().refine((d) => d > new Date(), {
    message: "Scheduled pickup time must be in the future",
  }),
  notes: z.string().max(500).optional(),
})

// ============================================================================
// 9. DISTRIBUTION & VERIFICATION SCHEMAS
// ============================================================================

export const DistributionVerificationStatusSchema = z.enum([
  "PENDING",
  "VERIFIED",
  "REJECTED",
])

export const DistributionSubmitSchema = z.object({
  donationId: z.string().min(1),
  needId: z.string().min(1),
  collectionId: z.string().optional(),
  quantityDistributed: z.number().positive(),
  unit: z.enum(["portions", "kg", "packets", "litres"]),
  peopleServed: z.number().int().positive("Must record at least 1 person served"),
  distributionTimestamp: z.coerce.date().refine((d) => d <= new Date(), {
    message: "Distribution timestamp cannot be in the future",
  }),
  distributionLocation: z.object({
    communityCenterName: z.string().min(2).max(150),
    street: z.string().min(3).max(200),
    area: z.string().min(2).max(100),
    city: z.string().default("Visakhapatnam"),
  }),
  geoPoint: GeoJSONPointSchema,
  evidencePhotos: z.array(z.string().url()).min(1, "At least one photo evidence required for audit"),
  description: z.string().min(10).max(2000),
})

export const DistributionVerifyActionSchema = z.object({
  distributionId: z.string().min(1),
  action: z.enum(["APPROVE", "REJECT"]),
  rejectionReason: z.string().max(500).optional(),
})
