import * as React from "react"
import Link from "next/link"
import { Compass } from "lucide-react"
import { Header } from "@/components/home/header"
import { Footer } from "@/components/home/footer"
import {
  PageHeading,
  SectionHeading,
  BodyText,
  Subheading,
} from "@/components/ui/typography"
import Image from "next/image"
import { FOODCONNECT_IMAGES } from "@/lib/constants/images"

export default function AboutPage() {
  const principles = [
    {
      title: "Human Dignity First",
      description:
        "Surplus food is not charity waste — it is wholesome, nutritious food that should reach people with respect, hygiene, and dignity.",
    },
    {
      title: "Local Community Empowerment",
      description:
        "FoodConnect does not seek to replace grassroots social workers. We partner with accredited local NGOs who understand their neighborhoods intimately.",
    },
    {
      title: "Radical Transparency",
      description:
        "Every surplus lot has a traceable lifecycle: logged, matched, collected, and verified at the point of distribution.",
    },
    {
      title: "Shared Safety Responsibility",
      description:
        "Donors ensure safe handling at prep and packaging, while recipient organizations verify condition and provide appropriate thermal storage.",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 py-12 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div>
            <Link
              href="/"
              prefetch={true}
              className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1 mb-2"
            >
              ← Back to Homepage
            </Link>
            <PageHeading className="text-3xl sm:text-5xl text-foreground font-bold tracking-tight">
              About FoodConnect
            </PageHeading>
            <BodyText size="lg" className="mt-4 text-muted-foreground leading-relaxed text-pretty">
              Connecting surplus-food donors with verified NGOs that have real active
              food needs, ensuring good food reaches people instead of landfills.
            </BodyText>
          </div>

          {/* Mission Statement */}
          <div className="mt-12 overflow-hidden rounded-2xl border border-primary/20 bg-primary/5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-0 items-center">
              <div className="p-8 sm:p-10 md:col-span-7">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Our Core Creed
                </span>
                <blockquote className="mt-3 font-heading text-xl sm:text-2xl font-semibold text-foreground leading-snug">
                  “Surplus food should reach people who need it instead of being
                  wasted.”
                </blockquote>
                <p className="mt-4 text-sm text-foreground/80 leading-relaxed">
                  In every city, thousands of meals are prepared each day that exceed
                  immediate demand — at conventions, banquets, university dining
                  halls, and bakeries. Meanwhile, miles away, shelter kitchens and
                  community centers struggle to fund the evening meal. FoodConnect
                  exists to bridge this logistical divide.
                </p>
              </div>

              <div className="relative h-56 md:h-full min-h-[220px] md:col-span-5 bg-muted">
                <Image
                  src={FOODCONNECT_IMAGES.community.elderlyDistribution.src}
                  alt={FOODCONNECT_IMAGES.community.elderlyDistribution.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
                <div className="absolute bottom-2.5 left-2.5 rounded bg-black/70 backdrop-blur-xs px-2 py-0.5 text-[0.65rem] font-medium text-white/90">
                  Demo Photography • Community Handover
                </div>
              </div>
            </div>
          </div>

          {/* Why Visakhapatnam */}
          <div className="mt-14">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Compass className="size-4" />
              <span>Inaugural Pilot City</span>
            </div>
            <SectionHeading className="mt-2 text-2xl font-bold text-foreground">
              Why Visakhapatnam (Vizag)?
            </SectionHeading>

            {/* Vizag Coastal Image Card */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
              <div className="relative h-60 sm:h-72 w-full bg-muted">
                <Image
                  src={FOODCONNECT_IMAGES.vizag.coastalCity.src}
                  alt={FOODCONNECT_IMAGES.vizag.coastalCity.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                  <div>
                    <span className="text-xs font-semibold block">Visakhapatnam Coastal Belt</span>
                    <span className="text-[0.65rem] text-white/80">Beach Road to Kailasagiri Corridor</span>
                  </div>
                  <span className="rounded bg-black/60 backdrop-blur-xs border border-white/20 px-2 py-0.5 text-[0.65rem]">
                    Pilot Launch Hub
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                Visakhapatnam, Andhra Pradesh, is one of India&apos;s fastest-growing
                coastal metropolitan hubs. With a thriving hospitality sector in
                areas like Beach Road and Jagadamba, major IT and university
                campuses in Madhurawada and Rushikonda, and a dense industrial corridor
                in Gajuwaka, the city represents both immense culinary vitality and
                critical community care needs.
              </p>
              <p>
                By anchoring our initial rollout in Vizag, FoodConnect is building a
                localized, hyper-responsive logistics blueprint that can be replicated
                across Tier-1 and Tier-2 Indian cities.
              </p>
            </div>
          </div>

          {/* Operating Principles */}
          <div className="mt-16">
            <SectionHeading className="text-2xl font-bold text-foreground">
              Our Guiding Principles
            </SectionHeading>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {principles.map((p) => (
                <div
                  key={p.title}
                  className="rounded-xl border border-border bg-card p-5 shadow-2xs"
                >
                  <h4 className="font-heading text-base font-semibold text-foreground">
                    {p.title}
                  </h4>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {p.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Terms & Privacy Anchors */}
          <div className="mt-20 pt-12 border-t border-border/80 space-y-12">
            <section id="privacy">
              <Subheading className="text-lg font-bold text-foreground">
                Privacy Notice
              </Subheading>
              <div className="mt-3 text-xs text-muted-foreground leading-relaxed space-y-2">
                <p>
                  FoodConnect respects the confidentiality of donors and recipient
                  organizations. We collect minimal information required for
                  transportation logistics, food safety records, and audit proof.
                </p>
                <p>
                  Donor contact details and pickup addresses are only shared with
                  verified NGO partners matched to that specific lot. No personal data
                  is sold or shared with commercial advertising brokers.
                </p>
              </div>
            </section>

            <section id="terms">
              <Subheading className="text-lg font-bold text-foreground">
                Platform Terms of Service & Safety Protocol
              </Subheading>
              <div className="mt-3 text-xs text-muted-foreground leading-relaxed space-y-2">
                <p>
                  1. <strong>Donation Accuracy:</strong> Donors guarantee that food
                  registered was handled in accordance with hygienic standards and is
                  fit for consumption at the time of pickup.
                </p>
                <p>
                  2. <strong>Non-Commercial Use:</strong> Recipient organizations
                  strictly agree that all rescued food will be distributed free of
                  cost to community members and never sold.
                </p>
                <p>
                  3. <strong>Platform Disclaimer:</strong> FoodConnect acts solely as
                  a matching coordinator. Donors and NGOs enter into mutual good-faith
                  agreements for community nourishment.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
