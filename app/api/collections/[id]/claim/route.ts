import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/current-user"
import { repositories } from "@/lib/repositories"

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
        { error: "Please sign in as a volunteer to claim this pickup." },
        { status: 401 }
      )
    }

    // 2. Role authorization check
    if (user.role !== "VOLUNTEER") {
      return NextResponse.json(
        { error: "You are not authorized to claim collection tasks." },
        { status: 403 }
      )
    }

    // 3. Existence check
    const collection = await repositories.collections.findById(collectionId)
    if (!collection) {
      return NextResponse.json(
        { error: "Collection task not found." },
        { status: 404 }
      )
    }

    // 4. Server-authoritative atomic claim
    // If already claimed by another volunteer, repository returns error
    const claimResult = await repositories.collections.claimCollection(
      collectionId,
      user._id
    )

    if (!claimResult.success || !claimResult.collection) {
      return NextResponse.json(
        {
          error: "This pickup has already been claimed.",
          detail: claimResult.error,
        },
        { status: 409 }
      )
    }

    // 5. Update linked donation status
    await repositories.donations.updateStatus(
      claimResult.collection.donationId,
      "COLLECTION_ASSIGNED"
    )

    // 6. Immutable audit log
    await repositories.auditLogs.append({
      actorId: user._id,
      actorRole: user.role,
      action: "COLLECTION_ASSIGNED",
      entityType: "Collection",
      entityId: collectionId,
      metadata: {
        volunteerId: user._id,
        volunteerName: user.name,
        volunteerEmail: user.email,
        donationId: claimResult.collection.donationId,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: "✓ Pickup claimed",
        collection: claimResult.collection,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("API error claiming collection pickup:", error)
    return NextResponse.json(
      { error: "Failed to claim pickup due to a server error." },
      { status: 500 }
    )
  }
}
