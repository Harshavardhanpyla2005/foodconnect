/**
 * FoodConnect AI — Provider Abstraction Layer
 *
 * Supports multiple AI backends behind a unified interface.
 * Falls back gracefully to the deterministic intent engine if no API key is configured.
 *
 * Environment variables:
 *   AI_PROVIDER=gemini | openai | groq | fallback
 *   AI_API_KEY=<your-key>
 *   AI_MODEL=<optional-model-override>
 */

import { FOODCONNECT_SYSTEM_PROMPT } from "./knowledge-base"
import { buildFallbackResponse } from "./intent-engine"

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface AIProviderResponse {
  content: string
  usedFallback: boolean
}

// ============================================================================
// GEMINI PROVIDER (via google REST API)
// ============================================================================

async function callGemini(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string> {
  const apiKey = process.env.AI_API_KEY
  const model = process.env.AI_MODEL || "gemini-2.0-flash"

  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }))

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: {
      maxOutputTokens: 800,
      temperature: 0.3,
    },
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API error ${res.status}: ${err}`)
  }

  const json = await res.json()
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error("Empty Gemini response")
  return text
}

// ============================================================================
// OPENAI-COMPATIBLE PROVIDER (OpenAI, Groq, etc.)
// ============================================================================

async function callOpenAICompat(
  messages: ChatMessage[],
  systemPrompt: string,
  baseUrl: string
): Promise<string> {
  const apiKey = process.env.AI_API_KEY
  const model = process.env.AI_MODEL || "gpt-4o-mini"

  const body = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.filter((m) => m.role !== "system"),
    ],
    max_tokens: 800,
    temperature: 0.3,
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`AI API error ${res.status}: ${err}`)
  }

  const json = await res.json()
  const text = json?.choices?.[0]?.message?.content
  if (!text) throw new Error("Empty AI response")
  return text
}

// ============================================================================
// MAIN PROVIDER DISPATCH
// ============================================================================

export async function generateAIResponse(
  messages: ChatMessage[],
  liveDataContext?: string
): Promise<AIProviderResponse> {
  const provider = (process.env.AI_PROVIDER || "fallback").toLowerCase()
  const hasKey = !!process.env.AI_API_KEY?.trim()

  // Build system prompt with optional live data
  let systemPrompt = FOODCONNECT_SYSTEM_PROMPT
  if (liveDataContext) {
    systemPrompt += `\n\n[LIVE DATA]\n${liveDataContext}\n[/LIVE DATA]\n\nUse the above live data to answer the user's question accurately. Never invent data beyond what is shown.`
  }

  // Last user message for fallback
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || ""

  // Attempt AI provider
  if (hasKey && provider !== "fallback") {
    try {
      let content: string

      if (provider === "gemini") {
        content = await callGemini(messages, systemPrompt)
      } else if (provider === "groq") {
        content = await callOpenAICompat(
          messages,
          systemPrompt,
          "https://api.groq.com/openai/v1"
        )
      } else {
        // default: openai-compatible
        const baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1"
        content = await callOpenAICompat(messages, systemPrompt, baseUrl)
      }

      return { content, usedFallback: false }
    } catch {
      // Fall through to deterministic fallback — never expose error to user
    }
  }

  // Deterministic fallback
  const liveSection = liveDataContext
    ? `\n\n**From your FoodConnect records:**\n${liveDataContext}`
    : ""
  const content = buildFallbackResponse(lastUserMsg) + liveSection

  return { content, usedFallback: true }
}
