/**
 * FoodConnect — In-Memory Rate Limiting Layer
 *
 * Implements sliding window rate limiting for authentication endpoints
 * (login, registration, password attempts) to defend against brute-force
 * credential stuffing and denial of service.
 *
 * Designed to be easily upgraded to Redis/Upstash for distributed production.
 */

interface RateLimitRecord {
  timestamps: number[]
}

const rateLimitStore = new Map<string, RateLimitRecord>()

// Periodically clean up stale entries (every 10 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 15 * 60 * 1000)
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key)
      }
    }
  }, 10 * 60 * 1000)
}

export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 5 * 60 * 1000
): { allowed: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now()
  const record = rateLimitStore.get(key) || { timestamps: [] }

  // Filter timestamps within the window
  const activeTimestamps = record.timestamps.filter((ts) => now - ts < windowMs)

  if (activeTimestamps.length >= maxAttempts) {
    const oldestTimestamp = activeTimestamps[0]
    const resetTime = oldestTimestamp + windowMs
    const retryAfterSec = Math.max(1, Math.ceil((resetTime - now) / 1000))
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec,
    }
  }

  activeTimestamps.push(now)
  rateLimitStore.set(key, { timestamps: activeTimestamps })

  return {
    allowed: true,
    remaining: maxAttempts - activeTimestamps.length,
    retryAfterSec: 0,
  }
}

export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key)
}
