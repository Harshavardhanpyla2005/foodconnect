/**
 * FoodConnect — Distribution Proof & Media Storage Architecture
 *
 * Prepares the production abstraction for Firebase Storage media assets.
 * NOTE: Firebase Authentication is strictly prohibited. This module handles media only.
 *
 * Production Distribution Evidence Model:
 * - Uploaded photographic proof
 * - Cryptographic SHA-256 integrity hash
 * - Secure bucket storage path references (gs://foodconnect-evidence/...)
 * - Explicit metadata: upload timestamp, uploader ID, distribution linkage
 * - Strict verification state machine: PENDING -> VERIFIED or REJECTED
 * - Demo safeguard: Clearly marks demo/prototype images to prevent AI or mock imagery
 *   from being counted as genuine humanitarian evidence.
 */

import crypto from "crypto"

export interface DistributionProofMetadata {
  storagePath: string // e.g., "distributions/2026/09/dist-vizag-01/handover-photo-1.jpg"
  publicUrl: string
  uploaderUserId: string
  distributionId: string
  mimeType: "image/jpeg" | "image/png" | "image/webp"
  fileSizeBytes: number
  sha256Checksum: string // Immutable digest verifying image integrity
  capturedAt: Date
  uploadedAt: Date
  isDemoPlaceholder: boolean // Safeguard flag: true if mock/demo asset
}

export interface DistributionProofRecord {
  _id: string
  distributionId: string
  proofType: "DONOR_PICKUP" | "NGO_HANDOVER" | "BENEFICIARY_MEAL"
  evidenceFiles: DistributionProofMetadata[]
  auditStatus: "PENDING" | "VERIFIED" | "REJECTED"
  verifiedByAdminId?: string
  verifiedAt?: Date
  auditNotes?: string
}

/**
 * Generates an immutable SHA-256 checksum for binary or base64 evidence buffers.
 */
export function calculateEvidenceChecksum(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex")
}

/**
 * Validates distribution evidence against humanitarian audit standards.
 * Rejects unverified demo assets from entering official compliance totals.
 */
export function validateDistributionProof(
  proof: DistributionProofMetadata
): { valid: boolean; reason?: string } {
  if (proof.isDemoPlaceholder) {
    return {
      valid: false,
      reason: "Demo placeholder imagery cannot be submitted as verified humanitarian distribution proof.",
    }
  }

  if (proof.fileSizeBytes <= 0 || proof.fileSizeBytes > 10 * 1024 * 1024) {
    return {
      valid: false,
      reason: "Evidence file size exceeds acceptable limits (maximum 10 MB).",
    }
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(proof.mimeType)) {
    return {
      valid: false,
      reason: "Unsupported media format. Photographic proof must be JPEG, PNG, or WebP.",
    }
  }

  if (!proof.sha256Checksum || proof.sha256Checksum.length !== 64) {
    return {
      valid: false,
      reason: "Invalid cryptographic SHA-256 integrity checksum.",
    }
  }

  return { valid: true }
}
