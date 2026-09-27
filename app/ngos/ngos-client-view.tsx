"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  MapPin,
  Gauge,
  Navigation,
  Search,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Users,
} from "lucide-react"
import { Header } from "@/components/home/header"
import { Footer } from "@/components/home/footer"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "motion/react"
import {
  PageHeading,
  EditorialLead,
  Subheading,
} from "@/components/ui/typography"
import { VizagMap } from "@/components/maps/VizagMap"
import { FormattedNgoRecord } from "@/app/actions/ngos"
import { FOODCONNECT_IMAGES } from "@/lib/constants/images"

interface NgosClientViewProps {
  initialNgos: FormattedNgoRecord[]
}

function getNgoImage(index: number) {
  const images = [
    FOODCONNECT_IMAGES.ngos.kitchenPrep,
    FOODCONNECT_IMAGES.community.elderlyCare,
    FOODCONNECT_IMAGES.community.childrenMeal,
    FOODCONNECT_IMAGES.community.familyDistribution,
  ]
  return images[index % images.length]
}

export function NgosClientView({ initialNgos }: NgosClientViewProps) {
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredNgos = React.useMemo(() => {
    if (!searchQuery.trim()) return initialNgos
    return initialNgos.filter(
      (ngo) =>
        ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ngo.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ngo.communitiesServed.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [initialNgos, searchQuery])

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased">
      <Header />

      <main className="flex-1 py-10 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-6 border-b border-border/80">
            <div>
              <Link
                href="/"
                prefetch={true}
                className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1 mb-2"
              >
                ← Back to Homepage
              </Link>
              <PageHeading className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                Verified Recipient NGOs
              </PageHeading>
              <EditorialLead className="mt-2 text-muted-foreground max-w-2xl text-pretty">
                Every community shelter and kitchen undergoes structured credentialing,
                hygiene audits, and thermal holding capacity verification before receiving surplus in Visakhapatnam.
              </EditorialLead>
            </div>

            {/* Clear Demo Notice */}
            <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 px-3.5 py-2 text-xs text-amber-950 dark:text-amber-300 border border-amber-500/20 self-start md:self-end">
              <AlertCircle className="size-4 text-amber-700 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Live Prototype Registry:</strong> Visakhapatnam Accreditation Network
              </span>
            </div>
          </div>

          {/* Kitchen Standards Spotlight Card */}
          <div className="mt-8 rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-0 items-center">
              <div className="relative h-48 sm:h-56 md:h-full min-h-[220px] md:col-span-5 bg-muted">
                <Image
                  src={FOODCONNECT_IMAGES.ngos.kitchenPrep.src}
                  alt={FOODCONNECT_IMAGES.ngos.kitchenPrep.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
                <div className="absolute bottom-3 left-3 rounded-md bg-black/75 backdrop-blur-xs px-2.5 py-1 text-[11px] font-semibold text-white">
                  Accredited Kitchen Facilities
                </div>
              </div>

              <div className="p-6 md:p-8 md:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-2">
                    <ShieldCheck className="size-3.5" />
                    <span>Structured Onboarding Verification</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                    Holding &amp; Sanitation Audits
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Surplus cooked meals require immediate insulated holding or reheating infrastructure.
                    FoodConnect verifies that participating organizations possess commercial warming vats,
                    refrigerators, and sanitized dining centers before assigning surplus lots.
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-border/60 flex flex-wrap items-center gap-4 text-xs font-medium text-foreground">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                    Government Registered NGO
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                    Physical Kitchen Capacity Assessed
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search NGO name, area, or focus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-11 text-xs bg-card"
              />
            </div>

            <span className="text-xs text-muted-foreground self-start sm:self-center font-medium">
              Showing <strong>{filteredNgos.length}</strong> verified partner organizations
            </span>
          </div>

          {/* Premium Vertical NGO Cards Grid */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredNgos.map((ngo, idx) => {
                const imageAsset = getNgoImage(idx)
                return (
                  <motion.div
                    key={ngo.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ type: "spring", stiffness: 280, damping: 24, delay: idx * 0.04 }}
                    whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                    className="h-full"
                  >
                    <Card
                      variant="warm"
                      className="flex flex-col justify-between border-border/90 bg-card hover:border-primary/50 transition-all shadow-xs overflow-hidden h-full"
                    >
                  {/* Photo Header */}
                  <div className="relative h-36 w-full bg-muted">
                    <Image
                      src={imageAsset.src}
                      alt={imageAsset.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-2xs">
                        <CheckCircle2 className="size-3" />
                        Verified NGO
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="flex items-center gap-1 font-semibold text-[11px]">
                        <MapPin className="size-3 text-emerald-400" />
                        {ngo.area}
                      </span>
                      <span className="text-[10px] text-white/80 bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                        Vizag Pilot
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-5 flex flex-col justify-between h-full">
                    <div>
                      <Subheading className="text-base font-bold text-foreground leading-snug">
                        {ngo.name}
                      </Subheading>

                      <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
                        <Users className="size-3.5 text-primary shrink-0" />
                        <span><strong>Focus:</strong> {ngo.communitiesServed}</span>
                      </p>

                      {/* Operational Specifications */}
                      <div className="mt-4 rounded-xl border border-border/60 bg-muted/40 p-3.5 flex flex-col gap-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <Gauge className="size-3.5 text-primary" /> Daily Meal Capacity:
                          </span>
                          <span className="font-bold text-foreground numeral-tabular">
                            {ngo.capacity}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <Navigation className="size-3.5 text-primary" /> Service Radius:
                          </span>
                          <span className="font-semibold text-foreground">{ngo.pickupRadius}</span>
                        </div>

                        <div className="pt-2 border-t border-border/40 text-[11px]">
                          <span className="text-muted-foreground block mb-1 font-semibold">
                            Food Preferences:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {ngo.foodTypes.map((ft) => (
                              <span
                                key={ft}
                                className="rounded bg-background px-2 py-0.5 text-[10px] font-semibold text-foreground border border-border/80"
                              >
                                {ft}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border/40 text-[11px]">
                          <span className="text-muted-foreground block mb-0.5 font-semibold">
                            Storage Equipment:
                          </span>
                          <span className="text-foreground font-medium text-xs">
                            {ngo.storageFacilities}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Bottom: Verification Metadata */}
                    <div className="mt-5 pt-3 border-t border-border/70 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        Audited Profile
                      </span>
                      <span className="font-semibold text-primary">Active Coordinator</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

          {/* Integrated Interactive Vizag NGO Map Preview */}
          <div className="mt-16 pt-12 border-t border-border/80">
            <div className="mb-6 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Network Coverage
              </span>
              <h3 className="mt-1 text-2xl font-bold text-foreground">
                Verified NGO Locations across Visakhapatnam
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Explore the distribution of participating community care points from Gajuwaka to Madhurawada.
              </p>
            </div>

            <VizagMap initialFilter="ngo" height="h-[420px]" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
