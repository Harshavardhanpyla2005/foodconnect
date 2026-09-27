/**
 * FoodConnect AI — Intent Detection Engine (Fallback / No-API Mode)
 *
 * Deterministic intent matcher using the knowledge base.
 * Works without any external AI API.
 */

import { KNOWLEDGE_FAQS } from "./knowledge-base"

export interface IntentMatch {
  answer: string
  confidence: number
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim()
}

function scoreMatch(input: string, patterns: string[]): number {
  const norm = normalize(input)
  let best = 0
  for (const p of patterns) {
    const pNorm = normalize(p)
    if (norm.includes(pNorm)) {
      const score = pNorm.split(" ").length / norm.split(" ").length
      if (score > best) best = score
    }
    // Check word overlap
    const pWords = pNorm.split(" ")
    const iWords = norm.split(" ")
    const overlap = pWords.filter((w) => iWords.includes(w) && w.length > 3).length
    const wordScore = overlap / Math.max(pWords.length, 1)
    if (wordScore > best) best = wordScore
  }
  return best
}

export function detectIntent(userMessage: string): IntentMatch | null {
  const norm = normalize(userMessage)
  let bestScore = 0
  let bestAnswer: string | null = null

  for (const faq of KNOWLEDGE_FAQS) {
    const score = scoreMatch(norm, faq.patterns)
    if (score > bestScore) {
      bestScore = score
      bestAnswer = faq.answer
    }
  }

  if (bestScore > 0.15 && bestAnswer) {
    return { answer: bestAnswer, confidence: bestScore }
  }

  return null
}

export function buildFallbackResponse(
  userMessage: string,
  liveDataContext?: string
): string {
  const intent = detectIntent(userMessage)

  if (intent) {
    let answer = intent.answer
    if (liveDataContext) {
      answer += `\n\n---\n${liveDataContext}`
    }
    return answer
  }

  // Generic helpful fallback
  return `I'm the FoodConnect AI Helpline. I can help you with:

• 🥗 How to donate food
• 🏢 How NGOs create food needs
• 🚚 How collections and pickups work
• 📍 How live GPS tracking works
• 📊 How impact is verified
• ❓ What FoodConnect is

Could you rephrase your question? Or try one of the suggestions above.`
}
