/**
 * FoodConnect AI Helpline — Chat API Route
 *
 * POST /api/chat
 *
 * Security:
 * - Identity derived from server-side session cookie ONLY
 * - Never trusts userId from client body
 * - Role-gated live data tools
 * - All data fetched server-side
 */

import { NextRequest, NextResponse } from "next/server"
import { validateSession } from "@/lib/auth/session"
import { generateAIResponse, ChatMessage } from "@/lib/ai/provider"
import { gatherLiveContext } from "@/lib/ai/live-data-tools"

export const runtime = "nodejs"
export const maxDuration = 30

// Simple in-memory rate limiter per session (resets on restart — acceptable for demo)
const rateLimiter = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(sessionId: string): boolean {
  const now = Date.now()
  const window = 60_000 // 1 minute
  const maxPerWindow = 20

  const entry = rateLimiter.get(sessionId) || { count: 0, resetAt: now + window }
  if (now > entry.resetAt) {
    entry.count = 0
    entry.resetAt = now + window
  }
  entry.count++
  rateLimiter.set(sessionId, entry)
  return entry.count <= maxPerWindow
}

export async function POST(req: NextRequest) {
  try {
    // 1. Parse request
    const body = await req.json()
    const { messages, pageContext } = body as {
      messages: ChatMessage[]
      pageContext?: string
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    // Sanitize: keep only last 12 messages, trim content
    const sanitizedMessages: ChatMessage[] = messages
      .slice(-12)
      .map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content || "").slice(0, 2000),
      }))

    const lastUserMessage =
      [...sanitizedMessages].reverse().find((m) => m.role === "user")?.content || ""

    // 2. Resolve auth (optional — public questions work without login)
    const auth = await validateSession()
    const user = auth?.user || null

    // 3. Rate limiting
    const limiterKey = user?._id || req.headers.get("x-forwarded-for") || "anon"
    if (!checkRateLimit(limiterKey)) {
      return NextResponse.json(
        { reply: "You're sending messages too quickly. Please wait a moment and try again." },
        { status: 429 }
      )
    }

    // 4. Gather live FoodConnect data (server-side, role-gated)
    let liveDataContext: string | undefined
    if (user && lastUserMessage) {
      const liveCtxParts = await gatherLiveContext(user, lastUserMessage)
      if (liveCtxParts.length > 0) {
        liveDataContext = liveCtxParts
          .map((p) => `[${p.section}]\n${p.data}`)
          .join("\n\n")
      }
    }

    // 5. Inject page context into system guidance
    const enrichedMessages = [...sanitizedMessages]
    if (pageContext && enrichedMessages.length > 0) {
      // Prepend page context as a system note on the first user message
      const first = enrichedMessages[0]
      enrichedMessages[0] = {
        ...first,
        content: `[PAGE CONTEXT: ${pageContext}]\n\n${first.content}`,
      }
    }

    // Inject user role context
    if (user) {
      const first = enrichedMessages[0]
      enrichedMessages[0] = {
        ...first,
        content: `[USER ROLE: ${user.role}] [USER NAME: ${user.name}]\n\n${first.content}`,
      }
    }

    // 6. Generate AI response
    const { content } = await generateAIResponse(enrichedMessages, liveDataContext)

    // 7. Return clean response
    return NextResponse.json({
      reply: content,
      role: user?.role || null,
    })
  } catch {
    // Never expose internal errors
    return NextResponse.json(
      {
        reply:
          "I'm having a moment of difficulty connecting. I can still help with common FoodConnect questions — please try again or rephrase your question.",
      },
      { status: 200 }
    )
  }
}
