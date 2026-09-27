import test from "node:test"
import assert from "node:assert/strict"
import { hashPassword, verifyPassword } from "../lib/auth/password"
import { generateSessionToken, hashToken, SESSION_TTL_MS } from "../lib/auth/session"
import { calculateDistanceKm } from "../lib/utils/geo"
import { evaluateDonationNeedMatch } from "../lib/matching/engine"
import { repositories } from "../lib/repositories"
import { IDonation, INeed } from "../types/database"

test("1. Password Security: crypto.scrypt hashing and constant-time verification", async () => {
  const rawPassword = "SecurePass123!@#"
  const hash = await hashPassword(rawPassword)

  assert.ok(hash.startsWith("scrypt:"), "Hash must begin with algorithm identifier")
  const parts = hash.split(":")
  assert.equal(parts.length, 3, "Hash must contain scrypt, salt, and derivedKey")
  const [, salt, derivedKey] = parts
  assert.equal(salt.length, 32, "Salt must be 16 bytes hex (32 characters)")
  assert.equal(derivedKey.length, 128, "Derived key must be 64 bytes hex (128 characters)")

  const isValid = await verifyPassword(rawPassword, hash)
  assert.equal(isValid, true, "Valid password must verify successfully")

  const isInvalid = await verifyPassword("WrongPassword!", hash)
  assert.equal(isInvalid, false, "Invalid password must be rejected")
})

test("2. Session Management: 256-bit token generation and SHA-256 token hashing", () => {
  const token = generateSessionToken()
  assert.equal(token.length, 64, "Raw token must be 32 bytes hex (256-bit)")

  const hashed = hashToken(token)
  assert.equal(hashed.length, 64, "SHA-256 hash must be 64 characters hex")
  assert.notEqual(hashed, token, "Hashed token must never match raw token")

  // Determinism check
  assert.equal(hashToken(token), hashed, "Hash function must be deterministic")
})

test("3. Session Repository: Session creation, token hash lookup, and revocation", async () => {
  const rawToken = generateSessionToken()
  const tokenHash = hashToken(rawToken)
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)

  const session = await repositories.sessions.create({
    userId: "test-donor-001",
    tokenHash,
    role: "DONOR",
    expiresAt,
  })

  assert.ok(session._id, "Session must have generated _id")
  assert.equal(session.userId, "test-donor-001")
  assert.equal(session.role, "DONOR")

  // Validate lookup by token hash
  const found = await repositories.sessions.findByTokenHash(tokenHash)
  assert.ok(found !== null, "Session must be retrievable by SHA-256 token hash")
  assert.equal(found?._id, session._id)

  // Revoke sessions for this user
  await repositories.sessions.deleteByUserId("test-donor-001")
  const afterRevoke = await repositories.sessions.findByTokenHash(tokenHash)
  assert.equal(afterRevoke, null, "Revoked session must no longer be found")
})

test("4. Need Invariant: quantityRequired = quantityFulfilled + quantityRemaining", async () => {
  const need = await repositories.needs.create({
    ngoId: "ngo-01",
    beneficiaryCategory: "Coastal Fisher Families",
    location: {
      address: "Harbour Road",
      area: "Harbour Area",
      city: "Visakhapatnam",
    },
    geoPoint: { type: "Point", coordinates: [83.3012, 17.6984] },
    peopleNeedingFood: 120,
    quantityRequired: 120,
    unit: "portions",
    foodType: "COOKED_MEALS",
    dietaryRequirements: "PURE_VEG",
    urgency: "HIGH",
    requiredBy: new Date(Date.now() + 4 * 3600 * 1000),
    verificationState: "NGO_VERIFIED",
    status: "ACTIVE",
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
  })

  assert.equal(
    need.quantityRequired,
    need.quantityFulfilled + need.quantityRemaining,
    "Initial quantity invariant must hold"
  )

  // Atomic fulfillment of 50 portions
  const fulfill1 = await repositories.needs.atomicFulfill(need._id, 50)
  assert.equal(fulfill1.success, true)
  const updated1 = fulfill1.need!
  assert.equal(updated1.quantityFulfilled, 50)
  assert.equal(updated1.quantityRemaining, 70)
  assert.equal(updated1.status, "PARTIALLY_FULFILLED")
  assert.equal(
    updated1.quantityRequired,
    updated1.quantityFulfilled + updated1.quantityRemaining,
    "Quantity invariant must hold after partial fulfillment"
  )

  // Atomic fulfillment of remaining 70 portions
  const fulfill2 = await repositories.needs.atomicFulfill(need._id, 70)
  assert.equal(fulfill2.success, true)
  const updated2 = fulfill2.need!
  assert.equal(updated2.quantityFulfilled, 120)
  assert.equal(updated2.quantityRemaining, 0)
  assert.equal(updated2.status, "FULFILLED")
  assert.equal(
    updated2.quantityRequired,
    updated2.quantityFulfilled + updated2.quantityRemaining,
    "Quantity invariant must hold after complete fulfillment"
  )
})

test("5. Concurrency: Atomic volunteer claiming prevents double assignment", async () => {
  const col = await repositories.collections.create({
    donationId: "don-01",
    ngoId: "ngo-01",
    collectorType: "VOLUNTEER_PARTNER",
    pickupAddress: {
      street: "Beach Road",
      area: "RK Beach",
      city: "Visakhapatnam",
    },
    pickupCoordinates: { type: "Point", coordinates: [83.3195, 17.7126] },
    scheduledAt: new Date(),
    assignedAt: new Date(),
    status: "ASSIGNED",
    collectionPhotos: [],
  })

  // Volunteer Alice claims the task
  const claimAlice = await repositories.collections.claimCollection(col._id, "vol-alice")
  assert.equal(claimAlice.success, true, "First claim must succeed")
  assert.equal(claimAlice.collection?.volunteerId, "vol-alice")

  // Volunteer Bob simultaneously tries to claim the same task
  const claimBob = await repositories.collections.claimCollection(col._id, "vol-bob")
  assert.equal(claimBob.success, false, "Second claim must be rejected atomically")
  assert.ok(claimBob.error?.includes("already been claimed"))
})

test("6. Geospatial: True Haversine great-circle distance calculation", () => {
  // Jagadamba Junction: [83.3012, 17.7105]
  // RK Beach: [83.3195, 17.7126]
  const distanceKm = calculateDistanceKm(
    [83.3012, 17.7105],
    [83.3195, 17.7126]
  )

  assert.ok(distanceKm > 1.8 && distanceKm < 2.3, `Distance should be ~2.0 km, got ${distanceKm}`)
})

test("7. Smart Matching Engine: Multi-factor compatibility scoring and explainability", () => {
  const mockDonation: IDonation = {
    _id: "don-unit-test",
    donorId: "donor-01",
    foodName: "Nutritious Khichdi & Vegetable Curry",
    foodCategory: "COOKED_MEALS",
    vegNonVeg: "VEG",
    quantity: 80,
    unit: "portions",
    preparedAt: new Date(Date.now() - 2 * 3600 * 1000),
    safeConsumptionDeadline: new Date(Date.now() + 4 * 3600 * 1000),
    storageCondition: "HOT_HEATED",
    packagingCondition: "STAINLESS_STEEL_VATS",
    allergens: [],
    photoReferences: [],
    pickupAddress: {
      street: "Beach Road",
      area: "RK Beach",
      city: "Visakhapatnam",
      postalCode: "530002",
    },
    pickupLocation: { type: "Point", coordinates: [83.3195, 17.7126] },
    pickupAvailabilityWindow: {
      start: new Date(),
      end: new Date(Date.now() + 3 * 3600 * 1000),
    },
    donorAcknowledgement: { accepted: true, timestamp: new Date(), statement: "Wholesome surplus" },
    status: "AVAILABLE",
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockNeed: INeed = {
    _id: "need-unit-test",
    ngoId: "ngo-01",
    beneficiaryCategory: "Shelter Residents",
    location: {
      address: "Siripuram Junction",
      area: "Siripuram",
      city: "Visakhapatnam",
    },
    geoPoint: { type: "Point", coordinates: [83.318, 17.72] }, // ~1.0 km
    peopleNeedingFood: 80,
    quantityRequired: 80,
    unit: "portions",
    quantityFulfilled: 0,
    quantityRemaining: 80,
    foodType: "COOKED_MEALS",
    dietaryRequirements: "PURE_VEG",
    urgency: "HIGH",
    requiredBy: new Date(Date.now() + 3 * 3600 * 1000),
    verificationState: "NGO_VERIFIED",
    status: "ACTIVE",
    expiresAt: new Date(Date.now() + 12 * 3600 * 1000),
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const match = evaluateDonationNeedMatch(mockDonation, mockNeed)
  assert.ok(match.score >= 85, `Score should be >= 85, got ${match.score}`)
  assert.ok(match.distanceKm < 2.0, `Distance should be < 2 km, got ${match.distanceKm}`)
  assert.ok(match.explanation.summary.length > 0, "Explanation summary must not be empty")
  assert.equal(match.factorScores.foodCompatibilityScore, 100, "Cooked veg meals should be 100% compatible")
})

test("8. Cloud Storage Adapter: In-memory fallback and SHA-256 integrity verification", async () => {
  const { uploadDistributionEvidence, verifyBufferIntegrity, getStorageConfiguration } = await import("../lib/storage/cloud-storage-adapter")
  const config = getStorageConfiguration()
  assert.equal(config.provider, "LOCAL_MEMORY", "Default provider without cloud env vars must be LOCAL_MEMORY")
  assert.equal(config.isConfigured, false, "Cloud storage should report unconfigured in pure local mode")

  const sampleBuffer = Buffer.from("FoodConnect Verified Proof Sample Image Buffer")
  const result = await uploadDistributionEvidence(sampleBuffer, "test-proof.jpg", {
    distributionId: "dist-test-01",
    uploaderUserId: "user-test-01",
    mimeType: "image/jpeg",
  })

  assert.equal(result.provider, "LOCAL_MEMORY")
  assert.ok(result.sha256Checksum.length === 64, "Checksum must be 64-character SHA-256 hex")
  assert.ok(verifyBufferIntegrity(sampleBuffer, result.sha256Checksum), "Integrity verification must return true for matching buffer")
  assert.ok(!verifyBufferIntegrity(Buffer.from("tampered"), result.sha256Checksum), "Integrity verification must reject tampered buffer")
})

test("9. Google Maps Platform Adapter: Local vector fallback and marker mapping", async () => {
  const { getGoogleMapsConfig, mapLocationToGoogleMarker } = await import("../lib/adapters/google-maps-adapter")
  const config = getGoogleMapsConfig()

  assert.equal(config.mapType, "local-vector-svg", "Default map should be local vector SVG without API key")
  assert.equal(config.isGoogleMapsEnabled, false)
  assert.ok(config.center.lat > 17 && config.center.lat < 18, "Center latitude should be in Visakhapatnam corridor")

  const marker = mapLocationToGoogleMarker({
    id: "loc-01",
    type: "ngo",
    name: "Sneha Sandhya",
    organization: "Trust",
    latitude: 17.7386,
    longitude: 83.3426,
    area: "MVP Colony",
    status: "Verified",
    quantity: "100 meals",
    foodType: "Cooked",
    details: "Elderly home",
  })

  assert.equal(marker.position.lat, 17.7386)
  assert.equal(marker.position.lng, 83.3426)
  assert.equal(marker.label, "NGO")
})

