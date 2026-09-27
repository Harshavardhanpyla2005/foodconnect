import { redirect } from "next/navigation"
import { validateSession } from "./session"
import { IUser, ISession, UserRole } from "@/types/database"

/**
 * FoodConnect — Server-Side Identity & RBAC Enforcement
 *
 * Provides authenticated context resolution and server-side role guards
 * for App Router pages and Server Actions.
 */

export function getRedirectPathForRole(role: UserRole): string {
  switch (role) {
    case "DONOR":
      return "/dashboard/donor"
    case "NGO":
      return "/dashboard/ngo"
    case "VOLUNTEER":
      return "/dashboard/volunteer"
    case "ADMIN":
      return "/dashboard/admin"
    default:
      return "/"
  }
}

/**
 * Returns the currently authenticated user and session, or null if unauthenticated.
 */
export async function getCurrentUser(): Promise<{ user: IUser; session: ISession } | null> {
  return validateSession()
}

/**
 * Enforces authentication and optional role-based access control.
 * Automatically redirects to /login if unauthenticated or to the user's correct
 * dashboard if their role does not match the required authorization.
 */
export async function requireAuth(
  allowedRoles?: UserRole[],
  currentPath?: string
): Promise<{ user: IUser; session: ISession }> {
  const auth = await validateSession()

  if (!auth) {
    const returnParam = currentPath ? `?returnUrl=${encodeURIComponent(currentPath)}` : ""
    redirect(`/login${returnParam}`)
  }

  // Account status check
  if (auth.user.accountStatus === "SUSPENDED") {
    redirect("/login?error=suspended")
  }

  if (auth.user.accountStatus === "REJECTED") {
    redirect("/login?error=rejected")
  }

  // Role authorization check
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(auth.session.role)) {
    // Redirect to the dashboard matching their actual assigned role
    const properDashboard = getRedirectPathForRole(auth.session.role)
    redirect(properDashboard)
  }

  return auth
}
