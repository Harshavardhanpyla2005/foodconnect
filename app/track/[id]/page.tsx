import { notFound } from "next/navigation"
import { requireAuth } from "@/lib/auth/current-user"
import { repositories } from "@/lib/repositories"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DeliveryTracker } from "@/components/tracking/delivery-tracker"

export const metadata = {
  title: "Delivery & Custody Tracking | FoodConnect",
  description: "Live radar and physical custody milestone tracking along Visakhapatnam surplus rescue corridors.",
}

export default async function TrackCollectionPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const { user } = await requireAuth(
    ["DONOR", "NGO", "VOLUNTEER", "ADMIN"],
    `/track/${params.id}`
  )

  const collection = await repositories.collections.findById(params.id)
  if (!collection) {
    notFound()
  }

  const donation = await repositories.donations.findById(collection.donationId)
  const ngo = await repositories.ngos.findById(collection.ngoId)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardNav user={user} />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <DeliveryTracker
          initialCollection={collection}
          donation={donation}
          ngo={ngo}
          userRole={user.role}
        />
      </main>
    </div>
  )
}
