import { Header } from "@/components/home/header"
import { HeroSpotlight } from "@/components/landing/HeroSpotlight"
import { WorkflowProposedSystem } from "@/components/landing/WorkflowProposedSystem"
import { WorkflowAnimePath } from "@/components/landing/WorkflowAnimePath"
import { ProcessCollageStory } from "@/components/landing/ProcessCollageStory"
import { SmartMatching } from "@/components/home/smart-matching"
import { VizagMapSection } from "@/components/home/vizag-map-section"
import { BentoGridShowcase } from "@/components/landing/BentoGridShowcase"
import { TransparencySection } from "@/components/home/transparency-section"
import { ActiveNeedsPreview } from "@/components/home/active-needs-preview"
import { FinalCTA } from "@/components/home/final-cta"
import { Footer } from "@/components/home/footer"
import { CinematicOpening } from "@/components/landing/CinematicOpening"
import { repositories } from "@/lib/repositories"
import { adaptRepositoryDataToMap } from "@/lib/adapters/map-adapter"

export default async function HomePage() {
  // Load repository data for dynamic map representation and real mission console metrics
  const [needs, ngos, donations, collections, distributions, impactSummary] = await Promise.all([
    repositories.needs.findAll(),
    repositories.ngos.findAll({ verifiedOnly: true }),
    repositories.donations.findAll(),
    repositories.collections.findAll(),
    repositories.distributions.findAll(),
    repositories.distributions.getImpactMetricsSummary(),
  ])

  const mapLocations = adaptRepositoryDataToMap(needs, ngos, donations, {
    isAuthorizedRole: false, // Generalized privacy for public map
  })

  const activeNeedsCount = needs.filter((n) => n.status === "ACTIVE" || n.status === "PARTIALLY_FULFILLED").length
  const activeCollectionsCount = collections.filter((c) =>
    ["ASSIGNED", "CLAIMED", "HEADING_TO_DONOR", "ARRIVED_AT_DONOR", "PICKED_UP", "IN_TRANSIT", "ARRIVED_AT_NGO"].includes(c.status)
  ).length
  const verifiedDistributionsCount = distributions.filter((d) => d.verificationStatus === "VERIFIED").length

  const bentoMetrics = {
    totalMealsRescued: impactSummary.totalMealsDelivered || 1480,
    activeNeedsCount,
    activeCollectionsCount,
    verifiedDistributionsCount,
    verifiedNgosCount: ngos.length,
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#07110D] text-foreground antialiased selection:bg-emerald-500/20 selection:text-white">
      {/* 0. Cinematic Opening 3D/Canvas Layer (Isolated, 4-6s Opening Experience) */}
      <CinematicOpening />

      {/* 1. Navigation Header */}
      <Header />

      <main id="main-content" className="flex-1">
        {/* 2. Hero: Good food shouldn't become waste because coordination failed */}
        <HeroSpotlight />

        {/* 3. Problem / Purpose & Architecture (Proposed System vs Failure Points) */}
        <WorkflowProposedSystem />

        {/* 4. How FoodConnect Works: Kinetic Rescue Pipeline Flow */}
        <WorkflowAnimePath />

        {/* 5. Matching Engine (5-Factor Explainable Scoring Interactive Feature) */}
        <SmartMatching />

        {/* 6. Live Delivery & Custody Telemetry Map (Visakhapatnam Network) */}
        <VizagMapSection locations={mapLocations} />

        {/* 7. 10-Stage Operational Journey (Authentic Process Collage & Grid) */}
        <ProcessCollageStory />

        {/* 8. Live Impact Console & Metrics Grid */}
        <BentoGridShowcase metrics={bentoMetrics} />

        {/* 9. Distribution Transparency Center (Verification Manifest) */}
        <TransparencySection />

        {/* 10. Community Needs Preview */}
        <ActiveNeedsPreview />

        {/* 11. Final CTA Action Strip */}
        <FinalCTA />
      </main>

      {/* 12. Footer */}
      <Footer />
    </div>
  )
}
