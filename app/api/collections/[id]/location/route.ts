import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/current-user"
import { repositories } from "@/lib/repositories"

// In-memory throttling tracker: volunteerId -> last update timestamp (ms)
const lastUpdateMap = new Map<string, number>()
const MIN_UPDATE_INTERVAL_MS = 2000 // 2 seconds minimum between updates

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: collectionId } = await context.params

    if (!collectionId) {
      return NextResponse.json(
        { error: "Collection task ID is required." },
        { status: 400 }
      )
    }

    // 1. Server-authoritative authentication
    const auth = await getCurrentUser()
    const user = auth?.user

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      )
    }

    if (user.role !== "VOLUNTEER") {
      return NextResponse.json(
        { error: "Only volunteer couriers can update collection GPS tracking." },
        { status: 403 }
      )
    }

    // 2. Throttling check
    const now = Date.now()
    const lastUpdate = lastUpdateMap.get(user._id) || 0
    if (now - lastUpdate < MIN_UPDATE_INTERVAL_MS) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before updating location again." },
        { status: 429 }
      )
    }
    lastUpdateMap.set(user._id, now)

    // 3. Existence and ownership check
    const collection = await repositories.collections.findById(collectionId)
    if (!collection) {
      return NextResponse.json(
        { error: "Collection task not found." },
        { status: 404 }
      )
    }

    if (collection.volunteerId !== user._id) {
      return NextResponse.json(
        { error: "Forbidden. You are not the assigned courier for this pickup." },
        { status: 403 }
      )
    }

    // 4. State lifecycle check - stop accepting tracking updates after terminal/handoff states
    const nonTrackingStates = [
      "NGO_CONFIRMED",
      "DISTRIBUTED",
      "EVIDENCE_REVIEW",
      "VERIFIED",
      "CLOSED",
      "CANCELLED",
    ]
    if (nonTrackingStates.includes(collection.status)) {
      return NextResponse.json(
        {
          error: "Tracking updates are no longer active for this collection task.",
          status: collection.status,
        },
        { status: 400 }
      )
    }

    // 5. Parse and validate coordinates
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
    }

    const latitude = Number(body.latitude)
    const longitude = Number(body.longitude)
    const accuracy = body.accuracy !== undefined ? Number(body.accuracy) : undefined

    if (
      isNaN(latitude) ||
      isNaN(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        { error: "Invalid latitude or longitude coordinates." },
        { status: 422 }
      )
    }

    // 6. Update location in repository
    const updatedCollection = await repositories.collections.updateLocation(
      collectionId,
      {
        latitude,
        longitude,
        accuracy,
      }
    )

    return NextResponse.json(
      {
        success: true,
        message: "Location updated successfully.",
        currentLocation: updatedCollection?.currentLocation,
        status: updatedCollection?.status,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("API error updating collection location:", error)
    return NextResponse.json(
      { error: "Failed to update GPS location due to a server error." },
      { status: 500 }
    )
  }
}
