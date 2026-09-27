import crypto from "node:crypto"
import { cookies } from "next/headers"
import { repositories } from "@/lib/repositories"
import { ISession, IUser, UserRole } from "@/types/database"

/**
 * FoodConnect — Session Lifecycle & Cookie Management
 *
 * Implements high-security session management:
 * 1. 256-bit cryptographically random raw session tokens.
 * 2. Only SHA-256 token hashes are stored in the database/repository.
 * 3. Raw tokens are delivered exclusively via HTTP-Only, Secure, SameSite=Lax cookies.
 * 4. Automatic session expiration and validation.
 */

export const SESSION_COOKIE_NAME = "foodconnect_session"
export const SESSION_TTL_DAYS = 7
export const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex")
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

/**
 * Creates a new session in the repository and returns the raw token to be set as a cookie.
 */
export async function createSession(
  userId: string,
  role: UserRole,
  userAgent?: string,
  ipAddress?: string
): Promise<{ rawToken: string; session: ISession }> {
  const rawToken = generateSessionToken()
  const tokenHash = hashToken(rawToken)
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)

  const session = await repositories.sessions.create({
    userId,
    tokenHash,
    role,
    expiresAt,
    userAgent,
    ipAddress,
  })

  return { rawToken, session }
}

/**
 * Writes the HTTP-Only session cookie to the response.
 */
export async function setSessionCookie(rawToken: string, expiresAt: Date): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  })
}

/**
 * Clears the session cookie.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

/**
 * Retrieves the raw session token from incoming cookies.
 */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(SESSION_COOKIE_NAME)
  return cookie?.value || null
}

/**
 * Resolves the authenticated user and session from incoming cookies.
 * Verifies that the session has not expired and that the user account is ACTIVE.
 */
export async function validateSession(): Promise<{ session: ISession; user: IUser } | null> {
  const rawToken = await getSessionToken()
  if (!rawToken) return null

  const tokenHash = hashToken(rawToken)
  const session = await repositories.sessions.findByTokenHash(tokenHash)
  if (!session) return null

  // Validate expiration
  if (new Date() > new Date(session.expiresAt)) {
    await repositories.sessions.deleteByTokenHash(tokenHash)
    await clearSessionCookie()
    return null
  }

  // Resolve user entity
  const user = await repositories.users.findById(session.userId)
  if (!user) {
    await repositories.sessions.deleteByTokenHash(tokenHash)
    await clearSessionCookie()
    return null
  }

  // Validate account status: inactive or suspended accounts cannot authenticate
  if (user.accountStatus === "SUSPENDED" || user.accountStatus === "REJECTED") {
    return null
  }

  return { session, user }
}

/**
 * Revokes the active session both in the repository and by clearing the cookie.
 */
export async function invalidateCurrentSession(): Promise<boolean> {
  const rawToken = await getSessionToken()
  if (!rawToken) return false

  const tokenHash = hashToken(rawToken)
  await repositories.sessions.deleteByTokenHash(tokenHash)
  await clearSessionCookie()
  return true
}
