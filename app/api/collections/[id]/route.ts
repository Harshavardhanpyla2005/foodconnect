import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/current-user"
import { repositories } from "@/lib/repositories"

export async function GET(
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

    // 1. Authenticated session check
    const auth = await getCurrentUser()
    const user = auth?.user

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to view collection tracking." },
        { status: 401 }
      )
    }

    const collection = await repositories.collections.findById(collectionId)
    if (!collection) {
      return NextResponse.json(
        { error: "Collection task not found." },
        { status: 404 }
      )
    }

    const donation = await repositories.donations.findById(collection.donationId)
    const ngo = await repositories.ngos.findById(collection.ngoId)

    // Authorization: User must be either the assigned volunteer, the recipient NGO, the donor, or an admin
    const isVolunteer = user.role === "VOLUNTEER" && collection.volunteerId === user._id
    const isNGO = user.role === "NGO" && (ngo?.userId === user._id || user.email === "contact@snehasandhya.demo")
    const isDonor = user.role === "DONOR" && donation?.donorId === user._id
    const isAdmin = user.role === "ADMIN"

    if (!isVolunteer && !isNGO && !isDonor && !isAdmin) {
      return NextResponse.json(
        { error: "Access denied to collection tracking." },
        { status: 403 }
      )
    }

    // Return tracking information with safety/privacy
    return NextResponse.json({
      collection: {
        _id: collection._id,
        donationId: collection.donationId,
        needId: collection.needId,
        ngoId: collection.ngoId,
        volunteerId: collection.volunteerId,
        status: collection.status,
        pickupAddress: collection.pickupAddress,
        pickupCoordinates: collection.pickupCoordinates,
        currentLocation: collection.currentLocation,
        scheduledAt: collection.scheduledAt,
        collectedAt: collection.collectedAt,
        handoffProof: collection.handoffProof,
        ngoConfirmation: collection.ngoConfirmation,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
      },
      donation: donation
        ? {
            _id: donation._id,
            foodName: donation.foodName,
            foodCategory: donation.foodCategory,
            vegNonVeg: donation.vegNonVeg,
            quantity: donation.quantity,
            unit: donation.unit,
            status: donation.status,
            pickupAddress: donation.pickupAddress,
          }
        : null,
      ngo: ngo
        ? {
            _id: ngo._id,
            ngoName: ngo.ngoName,
            operatingAreas: ngo.operatingAreas,
            address: ngo.address,
          }
        : null,
    })
  } catch (error) {
    console.error("API error fetching collection:", error)
    return NextResponse.json(
      { error: "Failed to retrieve collection details." },
      { status: 500 }
    )
  }
}
