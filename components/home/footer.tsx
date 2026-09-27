import * as React from "react"
import Link from "next/link"
import { Heart } from "lucide-react"
import { FoodConnectLogo } from "@/components/ui/logo"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const links = [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Donate Food", href: "/donate" },
    { label: "Food Needs", href: "/food-needs" },
    { label: "NGOs", href: "/ngos" },
    { label: "Impact", href: "/impact" },
    { label: "About", href: "/about" },
    { label: "Privacy", href: "/about#privacy" },
    { label: "Terms", href: "/about#terms" },
  ]

  return (
    <footer className="border-t border-border bg-card/60 text-muted-foreground text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Logo & Tagline */}
          <div className="flex flex-col items-start gap-2 max-w-sm">
            <Link
              href="/"
              prefetch={true}
              className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded transition-transform hover:scale-[1.02]"
            >
              <FoodConnectLogo size="md" />
            </Link>
            <p className="text-sm text-foreground/80 font-medium">
              Connecting surplus food with real needs across Visakhapatnam.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Transforming surplus food into community nourishment through verified,
              transparent grassroots partnerships.
            </p>
          </div>

          {/* Links Grid */}
          <nav
            className="flex flex-wrap gap-x-6 gap-y-3 font-medium text-sm text-foreground/80"
            aria-label="Footer Navigation"
          >
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                prefetch={true}
                className="hover:text-foreground hover:underline underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom Attribution & Copyright */}
        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {currentYear} FoodConnect. All rights reserved.</p>

          <p className="flex items-center gap-1">
            <span>Built with care for communities in Visakhapatnam & beyond</span>
            <Heart className="size-3 text-[var(--brand-terracotta)] fill-current" aria-hidden="true" />
          </p>
        </div>
      </div>
    </footer>
  )
}
