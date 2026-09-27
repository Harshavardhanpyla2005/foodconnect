import { notFound, redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth/current-user"
import { repositories } from "@/lib/repositories"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { VolunteerPickupDetail } from "@/components/dashboard/volunteer/volunteer-pickup-detail"

export const metadata = {
  title: "Pickup Operation & Tracking | FoodConnect Volunteer",
  description: "Live collection custody, milestone progression, and physical handoff verification.",
}

export default async function VolunteerPickupPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const { user } = await requireAuth(["VOLUNTEER"], `/dashboard/volunteer/pickups/${params.id}`)

  const collection = await repositories.collections.findById(params.id)
  if (!collection) {
    notFound()
  }

  // Ensure this courier owns or can view this pickup
  const isDemoCourier =
    user.email === "rajesh.courier@foodconnect.demo" ||
    user.email === "rajesh.kumar@courier.demo"

  if (collection.volunteerId && collection.volunteerId !== user._id && !(isDemoCourier && collection.volunteerId === "usr-vol-01")) {
    redirect("/dashboard/volunteer")
  }

  const donation = await repositories.donations.findById(collection.donationId)
  const ngo = await repositories.ngos.findById(collection.ngoId)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardNav user={user} />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <VolunteerPickupDetail
          collection={collection}
          donation={donation}
          ngo={ngo}
          volunteer={{
            _id: user._id,
            name: user.name,
            email: user.email,
          }}
        />
      </main>
    </div>
  )
}
