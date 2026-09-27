"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LogOut,
  ShieldCheck,
  Clock,
  HeartHandshake,
  Truck,
  Building2,
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
  FileCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { FoodConnectLogo } from "@/components/ui/logo"
import { logoutAction } from "@/app/actions/auth"
import { UserRole } from "@/types/database"

interface DashboardNavProps {
  user: {
    _id: string
    name: string
    email: string
    role: UserRole
  }
  ngoVerificationStatus?: "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED"
}

export function DashboardNav({ user, ngoVerificationStatus }: DashboardNavProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  // Configure role-specific tabs
  const getNavLinks = () => {
    switch (user.role) {
      case "DONOR":
        return [
          { label: "Overview", href: "/dashboard/donor", icon: Layers },
          { label: "My Donations", href: "/dashboard/donor#active-listings", icon: Package },
          { label: "Create Donation", href: "/donate", icon: HeartHandshake },
          { label: "Collection Status", href: "/dashboard/donor#active-listings", icon: Truck },
          { label: "Public Impact", href: "/impact", icon: CheckCircle2 },
        ]
      case "NGO":
        return [
          { label: "Overview", href: "/dashboard/ngo", icon: Building2 },
          { label: "Active Needs", href: "/dashboard/ngo#needs", icon: Layers },
          { label: "Matched Lots", href: "/dashboard/ngo#matches", icon: HeartHandshake },
          { label: "Inbound Transit", href: "/dashboard/ngo#collections", icon: Truck },
          { label: "Awaiting Confirmation", href: "/dashboard/ngo#awaiting-confirmation", icon: Clock },
          { label: "Distributions", href: "/dashboard/ngo#distributions", icon: FileCheck },
          { label: "Transparency", href: "/transparency", icon: ShieldCheck },
        ]
      case "VOLUNTEER":
        return [
          { label: "Overview", href: "/dashboard/volunteer", icon: Truck },
          { label: "Dispatch Board", href: "/dashboard/volunteer#available", icon: Package },
          { label: "My Pickups", href: "/dashboard/volunteer#active", icon: Clock },
          { label: "Pickup History", href: "/dashboard/volunteer#history", icon: CheckCircle2 },
        ]
      case "ADMIN":
        return [
          { label: "Platform Command", href: "/dashboard/admin", icon: ShieldCheck },
          { label: "Evidence Review", href: "/dashboard/admin#distributions", icon: CheckCircle2 },
          { label: "NGO Verifications", href: "/dashboard/admin#verifications", icon: FileCheck },
          { label: "Users Governance", href: "/dashboard/admin#users", icon: Layers },
          { label: "Audit Logs", href: "/dashboard/admin#audit-logs", icon: Clock },
          { label: "Transparency", href: "/transparency", icon: ShieldCheck },
        ]
      default:
        return []
    }
  }

  const navLinks = getNavLinks()

  // Badge styling per role
  const getRoleBadge = () => {
    switch (user.role) {
      case "DONOR":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
            <HeartHandshake className="size-3" />
            Food Donor
          </span>
        )
      case "NGO":
        return (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <Building2 className="size-3" />
              Recipient NGO
            </span>
            {ngoVerificationStatus === "VERIFIED" ? (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-600 px-2 py-0.5 text-[0.65rem] font-bold text-white uppercase tracking-wider">
                <CheckCircle2 className="size-2.5" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-600 px-2 py-0.5 text-[0.65rem] font-bold text-white uppercase tracking-wider">
                <ShieldCheck className="size-2.5" />
                Self-Declared
              </span>
            )}
          </div>
        )
      case "VOLUNTEER":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-700 dark:text-sky-400">
            <Truck className="size-3" />
            Volunteer Courier
          </span>
        )
      case "ADMIN":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:text-purple-400">
            <ShieldCheck className="size-3" />
            Operations Admin
          </span>
        )
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Pilot Notice */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            prefetch={true}
            className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg transition-transform hover:scale-[1.02]"
            aria-label="FoodConnect Homepage"
          >
            <FoodConnectLogo size="md" />
          </Link>

          <span className="hidden sm:inline-flex items-center rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-[0.7rem] font-medium text-primary">
            Pilot Portal • In-Memory Prototype
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || (link.href.includes("#") && pathname.startsWith(link.href.split("#")[0]))
            return (
              <Link
                key={link.label}
                href={link.href}
                prefetch={true}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="size-3.5" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* User Identity & Logout */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">{user.name}</span>
              {getRoleBadge()}
            </div>
            <span className="text-[0.7rem] text-muted-foreground">{user.email}</span>
          </div>

          <form action={logoutAction}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/30"
              title="Sign out of operational session"
            >
              <LogOut className="size-3.5" />
              <span>Sign out</span>
            </Button>
          </form>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex sm:hidden items-center gap-2">
          {getRoleBadge()}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-border bg-card p-4 space-y-3">
          <div className="pb-3 border-b border-border">
            <div className="font-semibold text-sm text-foreground">{user.name}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </div>
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted font-medium"
                >
                  <Icon className="size-4 text-muted-foreground" />
                  {link.label}
                </Link>
              )
            })}
          </div>
          <form action={logoutAction} className="pt-2 border-t border-border">
            <Button type="submit" variant="destructive" size="sm" className="w-full gap-2">
              <LogOut className="size-4" />
              Sign out
            </Button>
          </form>
        </div>
      )}
    </header>
  )
}
