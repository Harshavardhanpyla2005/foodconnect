import crypto from "node:crypto"

/**
 * FoodConnect — Password Hashing & Verification Layer
 *
 * Implements cryptographic password protection using Node.js native crypto scrypt:
 * - 128-bit random salt per user
 * - Memory-hard scrypt key derivation (N=16384, r=8, p=1, 64 bytes)
 * - Timing-safe constant-time comparison to prevent timing side-channel attacks
 * - Backward compatibility with seeded demonstration accounts
 */

const KEY_LENGTH = 64
const SALT_LENGTH = 16

export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_LENGTH).toString("hex")
    crypto.scrypt(password, salt, KEY_LENGTH, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return reject(err)
      resolve(`scrypt:${salt}:${derivedKey.toString("hex")}`)
    })
  })
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!password || !storedHash) return false

  // Support prototype seed accounts for interactive testing
  if (storedHash.startsWith("$argon2id$mock-hash-")) {
    const validDemoPasswords = [
      "demo-password",
      "Password123!",
      "DemoPassword123!",
      "password123",
      "demo123",
      "Donor@123",
      "Ngo@123",
      "Volunteer@123",
      "Admin@12345",
      "Admin@123"
    ]
    return validDemoPasswords.includes(password)
  }

  if (storedHash.startsWith("scrypt:")) {
    const parts = storedHash.split(":")
    if (parts.length !== 3) return false
    const [, salt, originalHex] = parts

    return new Promise((resolve) => {
      crypto.scrypt(password, salt, KEY_LENGTH, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
        if (err) return resolve(false)
        try {
          const derivedBuffer = Buffer.from(derivedKey.toString("hex"), "hex")
          const originalBuffer = Buffer.from(originalHex, "hex")
          if (derivedBuffer.length !== originalBuffer.length) return resolve(false)
          resolve(crypto.timingSafeEqual(derivedBuffer, originalBuffer))
        } catch {
          resolve(false)
        }
      })
    })
  }

  return false
}
