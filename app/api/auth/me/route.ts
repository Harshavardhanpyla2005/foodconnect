/**
 * GET /api/auth/me
 *
 * Lightweight endpoint that returns the authenticated user's role.
 * Used by the chatbot widget to tailor quick actions and responses.
 *
 * Returns only non-sensitive identity data: role and name.
 * Never returns credentials, session tokens, or private profile data.
 */

import { NextResponse } from "next/server"
import { validateSession } from "@/lib/auth/session"

export async function GET() {
  const auth = await validateSession()

  if (!auth) {
    return NextResponse.json({ authenticated: false }, { status: 200 })
  }

  // Return only the minimum needed for UI customization
  return NextResponse.json({
    authenticated: true,
    role: auth.user.role,
    name: auth.user.name,
  })
}
