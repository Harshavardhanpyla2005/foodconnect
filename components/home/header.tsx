"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FoodConnectLogo } from "@/components/ui/logo"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function Header() {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()

  const navLinks = [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Find Food Needs", href: "/food-needs" },
    { label: "NGOs", href: "/ngos" },
    { label: "Impact", href: "/impact" },
    { label: "About", href: "/about" },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          prefetch={true}
          className="group flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg py-1 px-1.5 transition-transform hover:scale-[1.02]"
          aria-label="FoodConnect Homepage"
        >
          <FoodConnectLogo size="md" />
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-1 text-sm font-medium"
          aria-label="Main Navigation"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.label}
                href={link.href}
                prefetch={true}
                className={cn(
                  "rounded-lg px-3 py-1.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-xs font-semibold",
                  isActive
                    ? "bg-primary/10 text-primary shadow-2xs font-bold"
                    : "text-foreground/80 hover:bg-muted/80 hover:text-foreground active:scale-95"
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-foreground/80 hover:text-foreground"
          >
            <Link href="/login" prefetch={true}>Sign In</Link>
          </Button>

          <Button size="sm" asChild className="gap-1.5 shadow-xs">
            <Link href="/donate" prefetch={true}>
              <span>Donate Food</span>
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {/* Mobile Navigation Trigger */}
        <div className="flex md:hidden items-center gap-2">
          <Button size="xs" asChild className="text-xs px-2.5">
            <Link href="/donate" prefetch={true}>Donate</Link>
          </Button>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Open Navigation Menu"
                />
              }
            >
              <Menu className="size-4" aria-hidden="true" />
            </SheetTrigger>

            <SheetContent side="right" className="w-[85vw] max-w-xs p-6">
              <SheetHeader className="p-0 text-left">
                <SheetTitle className="flex items-center gap-2 text-base font-bold">
                  <FoodConnectLogo size="sm" />
                </SheetTitle>
              </SheetHeader>

              <nav className="mt-8 flex flex-col gap-2" aria-label="Mobile Navigation">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      prefetch={true}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </nav>

              <div className="mt-auto pt-6 border-t border-border flex flex-col gap-3">
                <Button
                  className="w-full justify-center gap-2"
                  asChild
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/donate" prefetch={true}>
                    <span>Donate Food</span>
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-center"
                  asChild
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/login" prefetch={true}>Sign In</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
