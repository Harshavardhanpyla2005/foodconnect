"use server"

import { redirect } from "next/navigation"
import { repositories } from "@/lib/repositories"
import { UserRegistrationSchema, UserLoginSchema } from "@/lib/validation/schemas"
import { hashPassword, verifyPassword } from "@/lib/auth/password"
import { createSession, setSessionCookie, invalidateCurrentSession, validateSession } from "@/lib/auth/session"
import { checkRateLimit, resetRateLimit } from "@/lib/auth/rate-limit"
import { getRedirectPathForRole } from "@/lib/auth/current-user"
import { bindPendingGuestDonation } from "@/app/actions/donations"
import { UserRole } from "@/types/database"

export interface AuthActionResult {
  success: boolean
  errors?: Record<string, string>
  message?: string
  redirectTo?: string
}

/**
 * Registers a new user account, creates appropriate profiles,
 * writes audit logs, and establishes an authenticated session.
 */
export async function registerAction(data: {
  name: string
  email: string
  phone: string
  password: string
  role: UserRole
  organizationName?: string
  area?: string
  fssaiNumber?: string
  adminPasscode?: string
}): Promise<AuthActionResult> {
  try {
    // 0. Admin Passcode Gate if registering as ADMIN
    if (data.role === "ADMIN") {
      const code = (data.adminPasscode || "").trim().toUpperCase()
      const validCodes = ["ADMIN-VIZAG-2026", "ADMIN2026", "HARSHAVARDHAN", "VIZAG-ADMIN"]
      if (!validCodes.includes(code)) {
        return {
          success: false,
          errors: { adminPasscode: "Invalid administrator passcode. Pilot code: ADMIN-VIZAG-2026" },
          message: "Valid administrator passcode required for root authority.",
        }
      }
    }

    // 1. Rate limiting
    const rateCheck = checkRateLimit(`register:${data.email.toLowerCase().trim()}`, 4, 10 * 60 * 1000)
    if (!rateCheck.allowed) {
      return {
        success: false,
        message: `Too many registration attempts. Please try again in ${rateCheck.retryAfterSec} seconds.`,
      }
    }

    // 2. Validate input schema with phone sanitization
    const sanitizedPhone = (data.phone || "").trim().replace(/[\s-]/g, "")
    const validation = UserRegistrationSchema.safeParse({
      name: data.name?.trim(),
      email: data.email?.toLowerCase().trim(),
      phone: sanitizedPhone,
      password: data.password,
      role: data.role,
    })

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of validation.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message
      }
      return {
        success: false,
        errors: fieldErrors,
        message: "Please correct the errors in the registration form.",
      }
    }

    const { name, email, phone, password, role } = validation.data

    // 3. Verify email uniqueness
    const existing = await repositories.users.findByEmail(email)
    if (existing) {
      return {
        success: false,
        errors: { email: "An account with this email address already exists." },
        message: "An account with this email already exists.",
      }
    }

    // 4. Hash password using scrypt
    const passwordHash = await hashPassword(password)

    // 5. Create user entity
    const newUser = await repositories.users.create({
      name,
      email,
      phone,
      passwordHash,
      role,
      accountStatus: "ACTIVE",
      emailVerified: false,
      phoneVerified: false,
      lastLoginAt: new Date(),
    })

    // 6. Create corresponding domain profile
    const areaName = data.area || "MVP Colony"
    if (role === "DONOR") {
      await repositories.donors.create({
        userId: newUser._id,
        donorType: "RESTAURANT",
        organizationName: data.organizationName || name,
        fssaiNumber: data.fssaiNumber,
        contactPerson: name,
        contactPhone: phone,
        contactEmail: email,
        address: {
          street: "Main Road",
          area: areaName,
          city: "Visakhapatnam",
          state: "Andhra Pradesh",
          postalCode: "530017",
        },
        location: {
          type: "Point",
          coordinates: [83.3155, 17.7215],
        },
        pickupAvailability: {
          daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
          startTime: "11:00",
          endTime: "22:00",
        },
        preferredContactMethod: "PHONE",
      })
    } else if (role === "NGO") {
      await repositories.ngos.create({
        userId: newUser._id,
        ngoName: data.organizationName || name,
        registrationNumber: "AP/VIZAG/DEMO/" + Date.now().toString().slice(-6),
        registrationDocumentUrls: [],
        verificationStatus: "PENDING",
        contactPerson: {
          name,
          designation: "Coordinator",
          phone,
          email,
        },
        address: {
          street: "Community Center Street",
          area: areaName,
          city: "Visakhapatnam",
          state: "Andhra Pradesh",
          postalCode: "530017",
        },
        location: {
          type: "Point",
          coordinates: [83.3155, 17.7215],
        },
        operatingAreas: [areaName, "Siripuram", "Jagadamba Center"],
        foodTypesAccepted: ["COOKED_MEALS", "BAKERY_ITEMS", "FRESH_PRODUCE"],
        dietaryPreferences: ["VEG_AND_NON_VEG"],
        maximumMealCapacityPerDay: 200,
        pickupRadiusKm: 10,
        availability: {
          daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
          openTime: "08:00",
          closeTime: "21:00",
        },
        communitiesServed: ["Local Shelter Residents", "Day Laborers"],
        storageFacilities: ["THERMAL_WARMERS", "COMMERCIAL_REFRIGERATION"],
        foodHandlingCapabilities: {
          hasThermalContainers: true,
          hasRefrigeration: true,
          hasDedicatedTransport: false,
          vehicleCount: 0,
          staffHandlerCount: 3,
        },
      })
    }

    // 7. Audit log creation
    await repositories.auditLogs.append({
      actorId: newUser._id,
      actorRole: newUser.role,
      action: "USER_REGISTERED",
      entityType: "User",
      entityId: newUser._id,
      metadata: { role, registrationEmail: email },
    })

    // 8. Establish session & HTTP-Only cookie
    const { rawToken, session } = await createSession(newUser._id, newUser.role)
    await setSessionCookie(rawToken, session.expiresAt)

    // 9. Bind any pending guest donation if registered as DONOR
    if (newUser.role === "DONOR") {
      const donorProfile = await repositories.donors.findByUserId(newUser._id)
      await bindPendingGuestDonation(donorProfile?._id || newUser._id)
    }

    const destination = getRedirectPathForRole(newUser.role)
    return {
      success: true,
      redirectTo: destination,
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      success: false,
      message: "An unexpected error occurred during account creation. Please try again.",
    }
  }
}

/**
 * Authenticates user credentials with constant-time verification,
 * enforces account status checks, records audit logs, and writes session cookie.
 */
export async function loginAction(data: {
  email: string
  password: string
  returnUrl?: string
}): Promise<AuthActionResult> {
  try {
    // 1. Rate limiting by email
    const key = `login:${data.email.toLowerCase().trim()}`
    const rateCheck = checkRateLimit(key, 5, 5 * 60 * 1000)
    if (!rateCheck.allowed) {
      return {
        success: false,
        message: `Too many failed login attempts. Please try again in ${rateCheck.retryAfterSec} seconds.`,
      }
    }

    // 2. Validate input schema
    const validation = UserLoginSchema.safeParse(data)
    if (!validation.success) {
      return {
        success: false,
        message: "Please enter a valid email address and password.",
      }
    }

    const { email, password } = validation.data

    // 3. Resolve user
    const user = await repositories.users.findByEmail(email)
    if (!user) {
      return {
        success: false,
        message: "Invalid email or password.",
      }
    }

    // 4. Verify password with constant-time check
    const isPasswordValid = await verifyPassword(password, user.passwordHash)
    if (!isPasswordValid) {
      return {
        success: false,
        message: "Invalid email or password.",
      }
    }

    // 5. Account status validation
    if (user.accountStatus === "SUSPENDED") {
      return {
        success: false,
        message: "Your account has been suspended. Please contact FoodConnect operations.",
      }
    }

    if (user.accountStatus === "REJECTED") {
      return {
        success: false,
        message: "Your account registration was not approved.",
      }
    }

    // 6. Update user's last login & reset rate limit
    resetRateLimit(key)
    await repositories.users.update(user._id, {
      lastLoginAt: new Date(),
    })

    // 7. Establish session & HTTP-Only cookie
    const { rawToken, session } = await createSession(user._id, user.role)
    await setSessionCookie(rawToken, session.expiresAt)

    // 8. Log audit trail
    await repositories.auditLogs.append({
      actorId: user._id,
      actorRole: user.role,
      action: "USER_LOGIN",
      entityType: "User",
      entityId: user._id,
      metadata: { event: "LOGIN_SUCCESS" },
    })

    // 9. Bind any pending guest donation if logged in as DONOR
    if (user.role === "DONOR") {
      const donorProfile = await repositories.donors.findByUserId(user._id)
      await bindPendingGuestDonation(donorProfile?._id || user._id)
    }

    let destination = getRedirectPathForRole(user.role)
    if (data.returnUrl && data.returnUrl.startsWith("/") && !data.returnUrl.startsWith("//")) {
      destination = data.returnUrl
    }
    return {
      success: true,
      redirectTo: destination,
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      message: "An unexpected error occurred during sign in. Please try again.",
    }
  }
}

/**
 * Terminates active session and redirects to sign-in page.
 */
export async function logoutAction(): Promise<void> {
  const auth = await validateSession()
  if (auth) {
    await repositories.auditLogs.append({
      actorId: auth.user._id,
      actorRole: auth.user.role,
      action: "USER_LOGOUT",
      entityType: "User",
      entityId: auth.user._id,
      metadata: { event: "LOGOUT" },
    })
  }

  await invalidateCurrentSession()
  redirect("/login")
}
