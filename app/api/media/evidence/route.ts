import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/current-user"
import crypto from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"

export const config = {
  api: {
    bodyParser: false,
  },
}

// In-memory buffer store for local development and offline faculty demonstrations
const fileMemoryCache = new Map<string, { buffer: Buffer; mimeType: string }>()

export async function POST(request: NextRequest) {
  try {
    const auth = await getCurrentUser()
    const user = auth?.user
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const purpose = (formData.get("purpose") as string) || "evidence"
    const referenceId = (formData.get("referenceId") as string) || "ref-default"

    if (!file) {
      return NextResponse.json({ error: "No file provided for upload." }, { status: 400 })
    }

    // Validate MIME types
    const validMimes = ["image/jpeg", "image/png", "image/webp"]
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a JPEG, PNG, or WebP photograph." },
        { status: 400 }
      )
    }

    // Validate size (max 10MB)
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 10 MB limit." }, { status: 400 })
    }

    // Calculate cryptographic SHA-256 digest
    const sha256 = crypto.createHash("sha256").update(buffer).digest("hex")

    // Clean filename
    const ext = file.type === "image/png" ? ".png" : file.type === "image/webp" ? ".webp" : ".jpg"
    const safeName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`
    const relativeKey = `${purpose}/${referenceId}/${safeName}`

    // 1. Cache in memory
    fileMemoryCache.set(relativeKey, { buffer, mimeType: file.type })

    // 2. Also persist to local public upload directory so browser can view it directly
    try {
      const publicUploadDir = path.join(process.cwd(), "public", "uploads", purpose, referenceId)
      await fs.mkdir(publicUploadDir, { recursive: true })
      await fs.writeFile(path.join(publicUploadDir, safeName), buffer)
    } catch (writeErr) {
      console.warn("Could not write to public/uploads directory, using in-memory store:", writeErr)
    }

    const publicUrl = `/api/media/evidence?path=${encodeURIComponent(relativeKey)}`

    return NextResponse.json({
      success: true,
      storagePath: `local://storage/${relativeKey}`,
      publicUrl,
      sha256Checksum: sha256,
      fileSizeBytes: buffer.length,
      mimeType: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to process photo upload." }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filePath = searchParams.get("path")
    if (!filePath) {
      return new NextResponse("File path missing", { status: 400 })
    }

    // Check memory store first
    if (fileMemoryCache.has(filePath)) {
      const cached = fileMemoryCache.get(filePath)!
      return new NextResponse(new Uint8Array(cached.buffer), {
        headers: {
          "Content-Type": cached.mimeType,
          "Cache-Control": "public, max-age=86400",
        },
      })
    }

    // Check disk storage in public/uploads
    const diskPath = path.join(process.cwd(), "public", "uploads", filePath)
    try {
      const data = await fs.readFile(diskPath)
      const ext = path.extname(filePath).toLowerCase()
      const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg"
      return new NextResponse(new Uint8Array(data), {
        headers: {
          "Content-Type": mime,
          "Cache-Control": "public, max-age=86400",
        },
      })
    } catch {
      // Fallback 1x1 transparent or demo image
      return new NextResponse("Evidence not found", { status: 404 })
    }
  } catch (error) {
    console.error("Media read error:", error)
    return new NextResponse("Server error", { status: 500 })
  }
}
