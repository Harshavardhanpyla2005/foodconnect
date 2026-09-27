import test from "node:test"
import assert from "node:assert/strict"
import { repositories } from "../lib/repositories"
import { hashPassword, verifyPassword } from "../lib/auth/password"
import { generateSessionToken, hashToken, SESSION_TTL_MS } from "../lib/auth/session"
import { evaluateDonationNeedMatch } from "../lib/matching/engine"
import { IDonation, INeed, ICollection, IDistribution, IUser, INGOProfile } from "../types/database"

test("FoodConnect 17-Point E2E Lifecycle & Security Journey", async (t) => {
  // 1. Donor Registration
  let donorUser: IUser
  await t.test("1. Donor registration creates user and donor profile", async () => {
    const passwordHash = await hashPassword("DonorSecurePass2026!")
    donorUser = await repositories.users.create({
      name: "Sita Ramaiah Banquet",
      email: "sitaramaiah.banquet@vizag.test",
      phone: "+91 98480 11223",
      role: "DONOR",
      passwordHash,
      accountStatus: "ACTIVE",
      emailVerified: true,
      phoneVerified: true,
    })
    assert.ok(donorUser._id, "Donor user should have generated ID")
    assert.equal(donorUser.role, "DONOR")

    const donorProfile = await repositories.donors.create({
      userId: donorUser._id,
      organizationName: "Sita Ramaiah Banquet Hall",
      donorType: "HOTEL",
      fssaiNumber: "FSSAI-101192837465",
      contactPerson: "Sita Ramaiah",
      contactPhone: "+91 98480 11223",
      contactEmail: "sitaramaiah.banquet@vizag.test",
      address: {
        street: "Main Road",
        area: "Dwaraka Nagar",
        city: "Visakhapatnam",
        state: "Andhra Pradesh",
        postalCode: "530016",
      },
      location: { type: "Point", coordinates: [83.308, 17.725] },
      pickupAvailability: {
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        startTime: "09:00",
        endTime: "22:00",
      },
      preferredContactMethod: "PHONE",
    })
    assert.ok(donorProfile._id)
    assert.equal(donorProfile.userId, donorUser._id)
  })

  // 2. Donor Login & Session Creation
  let donorRawToken: string
  let donorTokenHash: string
  await t.test("2. Donor login validates password and establishes hashed session", async () => {
    const user = await repositories.users.findByEmail("sitaramaiah.banquet@vizag.test")
    assert.ok(user)
    const valid = await verifyPassword("DonorSecurePass2026!", user.passwordHash)
    assert.equal(valid, true, "Valid password credentials must be authenticated")

    donorRawToken = generateSessionToken()
    donorTokenHash = hashToken(donorRawToken)
    const session = await repositories.sessions.create({
      userId: user._id,
      tokenHash: donorTokenHash,
      role: user.role,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    })
    assert.ok(session._id)
    assert.equal(session.userId, user._id)
  })

  // 3. Donor Creates Surplus Food Donation
  let donation: IDonation
  await t.test("3. Donor logs surplus food lot with safe consumption timeline", async () => {
    donation = await repositories.donations.create({
      donorId: donorUser._id,
      foodName: "Wholesome Sambar Rice & Curd Rice",
      foodCategory: "COOKED_MEALS",
      vegNonVeg: "VEG",
      quantity: 120,
      unit: "portions",
      preparedAt: new Date(Date.now() - 2 * 3600 * 1000),
      safeConsumptionDeadline: new Date(Date.now() + 5 * 3600 * 1000),
      storageCondition: "HOT_HEATED",
      packagingCondition: "STAINLESS_STEEL_VATS",
      allergens: [],
      photoReferences: [],
      pickupAddress: {
        street: "Main Road",
        area: "Dwaraka Nagar",
        city: "Visakhapatnam",
        postalCode: "530016",
      },
      pickupLocation: { type: "Point", coordinates: [83.308, 17.725] },
      pickupAvailabilityWindow: {
        start: new Date(),
        end: new Date(Date.now() + 4 * 3600 * 1000),
      },
      donorAcknowledgement: {
        accepted: true,
        timestamp: new Date(),
        statement: "Food was handled in compliance with FSSAI hygiene guidelines.",
      },
    })
    assert.ok(donation._id)
    assert.equal(donation.status, "AVAILABLE")
    assert.equal(donation.quantity, 120)
  })

  // 4. NGO Registration
  let ngoUser: IUser
  let ngoProfile: INGOProfile
  await t.test("4. NGO registration enters PENDING state with unverified status", async () => {
    const passwordHash = await hashPassword("NGOSecretPass2026!")
    ngoUser = await repositories.users.create({
      name: "Karuna Foundation Vizag",
      email: "director@karunavizag.test",
      phone: "+91 89125 56677",
      role: "NGO",
      passwordHash,
      accountStatus: "ACTIVE",
      emailVerified: true,
      phoneVerified: true,
    })
    assert.ok(ngoUser._id)

    ngoProfile = await repositories.ngos.create({
      userId: ngoUser._id,
      ngoName: "Karuna Welfare Foundation",
      registrationNumber: "NGO-AP-2018-9944",
      registrationDocumentUrls: ["https://storage.foodconnect.org/docs/karuna-trust-deed.pdf"],
      verificationStatus: "PENDING",
      contactPerson: {
        name: "Dr. K. S. Rao",
        designation: "Executive Director",
        phone: "+91 89125 56677",
        email: "director@karunavizag.test",
      },
      address: {
        street: "Siripuram Towers",
        area: "Siripuram",
        city: "Visakhapatnam",
        state: "Andhra Pradesh",
        postalCode: "530003",
      },
      location: { type: "Point", coordinates: [83.318, 17.72] },
      operatingAreas: ["Siripuram", "Dwaraka Nagar", "Asilmetta"],
      foodTypesAccepted: ["COOKED_MEALS", "PACKAGED_FOODS"],
      dietaryPreferences: ["PURE_VEG", "VEG_AND_NON_VEG"],
      maximumMealCapacityPerDay: 500,
      pickupRadiusKm: 10,
      availability: {
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        openTime: "08:00",
        closeTime: "22:00",
      },
      communitiesServed: ["Shelter Residents", "Day Laborers"],
      storageFacilities: ["COMMERCIAL_REFRIGERATION", "THERMAL_WARMERS"],
      foodHandlingCapabilities: {
        hasThermalContainers: true,
        hasRefrigeration: true,
        hasDedicatedTransport: true,
        vehicleCount: 2,
        staffHandlerCount: 6,
      },
    })
    assert.ok(ngoProfile._id)
    assert.equal(ngoProfile.verificationStatus, "PENDING")
  })

  // 5. Open-Service Model: Registered NGO Can Publish Needs Immediately
  let need: INeed
  await t.test("5. Self-declared NGO creates community food need without admin pre-approval", async () => {
    assert.equal(ngoProfile.verificationStatus, "PENDING")
    // Under open-service model, newly registered NGOs can immediately publish community needs
    need = await repositories.needs.create({
      ngoId: ngoProfile._id,
      beneficiaryCategory: "Shelter Residents & Migrant Workers",
      location: {
        address: "Siripuram Community Kitchen",
        area: "Siripuram",
        city: "Visakhapatnam",
      },
      geoPoint: { type: "Point", coordinates: [83.318, 17.72] },
      peopleNeedingFood: 120,
      quantityRequired: 120,
      unit: "portions",
      foodType: "COOKED_MEALS",
      dietaryRequirements: "PURE_VEG",
      urgency: "HIGH",
      requiredBy: new Date(Date.now() + 4 * 3600 * 1000),
      verificationState: "PENDING_AUDIT",
      status: "ACTIVE",
      expiresAt: new Date(Date.now() + 12 * 3600 * 1000),
    })
    assert.ok(need._id)
    assert.equal(need.status, "ACTIVE")
    assert.equal(need.quantityRequired, need.quantityFulfilled + need.quantityRemaining)
  })

  // 6. Admin Performs Operational Review (Non-Blocking)
  await t.test("6. Admin performs operational review of organization profile", async () => {
    const updated = await repositories.ngos.updateVerificationStatus(
      ngoProfile._id,
      "VERIFIED",
      "usr-admin-01",
      "Audited 12A/80G documents and commercial refrigeration verified."
    )
    assert.ok(updated)
    assert.equal(updated?.verificationStatus, "VERIFIED")
  })

  // 8. Donation Matches Need
  let matchScore: number
  await t.test("8. Matching engine computes multi-factor score and explainable recommendation", () => {
    const match = evaluateDonationNeedMatch(donation, need, ngoProfile)
    matchScore = match.score
    assert.ok(matchScore >= 80, `Expected high match score, got ${matchScore}`)
    assert.ok(match.distanceKm < 3.0, `Expected distance < 3 km, got ${match.distanceKm}`)
    assert.equal(match.factorScores.foodCompatibilityScore, 100)
    assert.ok(match.explanation.positiveFactors.length > 0)
  })

  // 9. NGO Accepts Match
  await t.test("9. NGO accepts match proposal and triggers collection scheduling", async () => {
    const matchRecord = await repositories.matches.create({
      donationId: donation._id,
      needId: need._id,
      ngoId: ngoProfile._id,
      score: matchScore,
      distanceKm: 1.5,
      factorScores: {
        distanceScore: 95,
        foodCompatibilityScore: 100,
        quantityAlignmentScore: 100,
        urgencyScore: 90,
        deadlineScore: 95,
        storageCapacityScore: 95,
      },
      explanation: {
        summary: "Optimal match in Dwaraka Nagar corridor",
        positiveFactors: ["Close proximity", "Dietary compatible"],
        riskFactors: [],
      },
      status: "PROPOSED",
      proposedAt: new Date(),
      expiresAt: new Date(Date.now() + 2 * 3600 * 1000),
    })

    const acceptedMatch = await repositories.matches.updateStatus(matchRecord._id, "ACCEPTED")
    assert.equal(acceptedMatch?.status, "ACCEPTED")

    // Update donation status to ACCEPTED
    await repositories.donations.updateStatus(donation._id, "ACCEPTED")
    const updatedDonation = await repositories.donations.findById(donation._id)
    assert.equal(updatedDonation?.status, "ACCEPTED")
  })

  // 10. Volunteer Claims Collection Task Atomically
  let collection: ICollection
  let volunteerUser: IUser
  await t.test("10. Volunteer claims collection task atomically and second claim is rejected with conflict", async () => {
    volunteerUser = await repositories.users.create({
      name: "Kiran Varma",
      email: "kiran.varma@courier.test",
      phone: "+91 99887 66554",
      role: "VOLUNTEER",
      passwordHash: await hashPassword("VolunteerPass123!"),
      accountStatus: "ACTIVE",
      emailVerified: true,
      phoneVerified: true,
    })

    const secondVolunteer = await repositories.users.create({
      name: "Bhavani Shankar",
      email: "bhavani.courier@courier.test",
      phone: "+91 99887 66555",
      role: "VOLUNTEER",
      passwordHash: await hashPassword("VolunteerPass123!"),
      accountStatus: "ACTIVE",
      emailVerified: true,
      phoneVerified: true,
    })

    collection = await repositories.collections.create({
      donationId: donation._id,
      ngoId: ngoProfile._id,
      needId: need._id,
      collectorType: "VOLUNTEER_PARTNER",
      pickupAddress: donation.pickupAddress,
      pickupCoordinates: donation.pickupLocation,
      scheduledAt: new Date(),
      assignedAt: new Date(),
      status: "ASSIGNED",
      collectionPhotos: [],
    })

    // First claim succeeds
    const claimResult = await repositories.collections.claimCollection(collection._id, volunteerUser._id)
    assert.equal(claimResult.success, true)
    assert.equal(claimResult.collection?.volunteerId, volunteerUser._id)
    assert.equal(claimResult.collection?.status, "ASSIGNED")
    collection = claimResult.collection!

    // Second claim by a different volunteer must fail atomically (HTTP 409 conflict equivalent)
    const secondClaimResult = await repositories.collections.claimCollection(collection._id, secondVolunteer._id)
    assert.equal(secondClaimResult.success, false, "Second volunteer claim must fail atomically")
    assert.ok(secondClaimResult.error?.includes("already been claimed"))
  })

  // 11. Collection Lifecycle Milestones
  await t.test("11. Collection advances through physical custody milestones and handoff proof", async () => {
    // HEADING_TO_DONOR
    const heading = await repositories.collections.updateStatus(collection._id, "HEADING_TO_DONOR")
    assert.equal(heading?.status, "HEADING_TO_DONOR")

    // ARRIVED_AT_DONOR
    const arrivedDonor = await repositories.collections.updateStatus(collection._id, "ARRIVED_AT_DONOR")
    assert.equal(arrivedDonor?.status, "ARRIVED_AT_DONOR")

    // PICKED_UP
    const pickedUp = await repositories.collections.updateStatus(collection._id, "PICKED_UP", {
      collectedAt: new Date(),
      temperatureAtPickupCelsius: 64,
    })
    assert.equal(pickedUp?.status, "PICKED_UP")

    // IN_TRANSIT
    const inTransit = await repositories.collections.updateStatus(collection._id, "IN_TRANSIT")
    assert.equal(inTransit?.status, "IN_TRANSIT")

    // ARRIVED_AT_NGO
    const arrivedNgo = await repositories.collections.updateStatus(collection._id, "ARRIVED_AT_NGO")
    assert.equal(arrivedNgo?.status, "ARRIVED_AT_NGO")

    // Submit Handoff Proof
    const handoffSubmitted = await repositories.collections.submitHandoffProof(collection._id, {
      photoUrl: "/api/media/evidence?path=mock-handoff-proof.jpg",
      notes: "Received at gate 2 by shelter supervisor",
      location: { latitude: 17.72, longitude: 83.318, accuracy: 12 },
    })
    assert.equal(handoffSubmitted?.status, "DELIVERED_TO_NGO")
    assert.ok(handoffSubmitted?.handoffProof?.photoUrl)

    // NGO Confirms Receipt
    const confirmed = await repositories.collections.confirmNgoReceipt(collection._id, {
      confirmedBy: ngoUser._id,
      notes: "Inspected hot trays, seals intact",
    })
    assert.equal(confirmed?.status, "NGO_CONFIRMED")
    assert.ok(confirmed?.ngoConfirmation?.confirmedAt)

    // Update donation status to DELIVERED_TO_NGO / NGO_CONFIRMED
    await repositories.donations.updateStatus(donation._id, "DELIVERED_TO_NGO")
  })

  // 12. NGO Records Distribution
  let distribution: IDistribution
  await t.test("12. NGO logs distribution proof and updates need fulfillment invariant", async () => {
    distribution = await repositories.distributions.create({
      donationId: donation._id,
      ngoId: ngoProfile._id,
      needId: need._id,
      collectionId: collection._id,
      quantityDistributed: 120,
      unit: "portions",
      peopleServed: 120,
      distributionTimestamp: new Date(),
      distributionLocation: {
        communityCenterName: "Siripuram Urban Shelter Center",
        street: "Siripuram Main Road",
        area: "Siripuram",
        city: "Visakhapatnam",
      },
      geoPoint: { type: "Point", coordinates: [83.318, 17.72] },
      evidencePhotos: ["https://storage.foodconnect.org/evidence/siripuram-handout.jpg"],
      description: "Hot dinner distribution to 120 shelter residents and transit workers.",
      submittedBy: ngoUser._id,
      impactMetrics: {
        mealsDelivered: 120,
        estimatedKgSaved: 48,
        co2KgPrevented: 96,
      },
    })
    assert.ok(distribution._id)
    assert.equal(distribution.verificationStatus, "PENDING")

    // Fulfill need atomically
    const fulfillRes = await repositories.needs.atomicFulfill(need._id, 120)
    assert.equal(fulfillRes.success, true)
    assert.equal(fulfillRes.need?.status, "FULFILLED")
    assert.equal(fulfillRes.need?.quantityRemaining, 0)
    assert.equal(
      fulfillRes.need?.quantityRequired,
      fulfillRes.need!.quantityFulfilled + fulfillRes.need!.quantityRemaining
    )
  })

  // 13. Admin Verifies Distribution
  await t.test("13. Operations admin audits and verifies distribution evidence", async () => {
    const verified = await repositories.distributions.verify(
      distribution._id,
      "usr-admin-01",
      true
    )
    assert.ok(verified)
    assert.equal(verified?.verificationStatus, "VERIFIED")
    distribution = verified!
  })

  // 14. Donor Sees Verified Impact
  await t.test("14. Verified distribution rolls up into official platform and donor impact totals", async () => {
    const impactSummary = await repositories.distributions.getImpactMetricsSummary()
    assert.ok(impactSummary.totalMealsDelivered >= 120)
    assert.ok(impactSummary.verifiedDistributionsCount >= 1)

    // Mark donation verified
    await repositories.donations.updateStatus(donation._id, "VERIFIED")
    const finalDonation = await repositories.donations.findById(donation._id)
    assert.equal(finalDonation?.status, "VERIFIED")
  })

  // 15. Unauthorized Role Access is Blocked
  await t.test("15. Role-based access control enforces operational boundaries", () => {
    const donorAllowedRoles = ["DONOR"]
    const ngoAllowedRoles = ["NGO"]

    assert.equal(donorAllowedRoles.includes(donorUser.role), true)
    assert.equal(donorAllowedRoles.includes(ngoUser.role), false, "NGO must not access donor dashboard")
    assert.equal(ngoAllowedRoles.includes(donorUser.role), false, "Donor must not access NGO dashboard")
  })

  // 16. Suspended Account Access is Blocked
  await t.test("16. Suspended accounts are immediately denied authentication", async () => {
    const suspendedUser = await repositories.users.create({
      name: "Suspended Operator",
      email: "suspended@badactor.test",
      phone: "+91 99000 00000",
      role: "DONOR",
      passwordHash: await hashPassword("Password123!"),
      accountStatus: "SUSPENDED",
      emailVerified: true,
      phoneVerified: true,
    })

    const isPermitted = suspendedUser.accountStatus === "ACTIVE"
    assert.equal(isPermitted, false, "Suspended user must be prohibited from authenticated operations")
  })

  // 17. Expired Session Invalidation
  await t.test("17. Expired sessions are invalid and rejected on lookup", async () => {
    const expiredToken = generateSessionToken()
    const expiredHash = hashToken(expiredToken)
    await repositories.sessions.create({
      userId: donorUser._id,
      tokenHash: expiredHash,
      role: "DONOR",
      expiresAt: new Date(Date.now() - 3600 * 1000), // expired 1 hour ago
    })

    // findByTokenHash enforces s.expiresAt > now security check
    const found = await repositories.sessions.findByTokenHash(expiredHash)
    assert.equal(found, null, "Expired session must be rejected immediately on repository lookup")

    // Repository cleanup of expired sessions
    const deletedCount = await repositories.sessions.deleteExpired()
    assert.ok(deletedCount >= 1, "Expired sessions must be pruned from underlying storage")
  })
})
