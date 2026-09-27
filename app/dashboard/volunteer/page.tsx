import { requireAuth } from "@/lib/auth/current-user"
import { repositories } from "@/lib/repositories"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { VolunteerDispatchBoard } from "@/components/dashboard/volunteer/volunteer-dispatch-board"

export const metadata = {
  title: "Volunteer Courier Dashboard | FoodConnect Visakhapatnam",
  description: "Claim food rescue pickups, confirm delivery custody, and bridge surplus food to shelters.",
}

export default async function VolunteerDashboardPage() {
  const { user } = await requireAuth(["VOLUNTEER"], "/dashboard/volunteer")

  const [allCollections, allDonations, allNgos] = await Promise.all([
    repositories.collections.findAll(),
    repositories.donations.findAll(),
    repositories.ngos.findAll(),
  ])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardNav user={user} />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <VolunteerDispatchBoard
          initialCollections={allCollections}
          donations={allDonations}
          ngos={allNgos}
          user={user}
        />
      </main>
    </div>
  )
}

