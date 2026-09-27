"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "motion/react"
import { AlertCircle, KeyRound, Eye, EyeOff } from "lucide-react"
import { Header } from "@/components/home/header"
import { Footer } from "@/components/home/footer"
import { FoodConnectLogo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/ui/form-field"
import {
  PageHeading,
  BodyText,
} from "@/components/ui/typography"
import Image from "next/image"
import { FOODCONNECT_IMAGES } from "@/lib/constants/images"
import { loginAction } from "@/app/actions/auth"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // Derive initial error from search params if present
  const urlError = React.useMemo(() => {
    const err = searchParams.get("error")
    if (err === "suspended") {
      return "Your account is currently suspended. Please contact FoodConnect operations."
    } else if (err === "rejected") {
      return "Your organization verification was not approved."
    } else if (err === "session_expired") {
      return "Your session has expired. Please sign in again."
    }
    return null
  }, [searchParams])

  const displayedError = errorMessage ?? urlError

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    const returnUrl = searchParams.get("returnUrl") || undefined

    try {
      const res = await loginAction({ email, password, returnUrl })
      if (!res.success) {
        setErrorMessage(res.message || "Invalid email or password.")
        setIsSubmitting(false)
        return
      }

      if (res.redirectTo) {
        window.location.href = res.redirectTo
      }
    } catch (err) {
      console.error(err)
      setErrorMessage("An unexpected authentication error occurred.")
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="text-center">
        <Link href="/" prefetch={true} className="inline-block transition-transform hover:scale-105 mb-2">
          <FoodConnectLogo size="lg" showText={false} />
        </Link>
        <PageHeading className="text-2xl font-bold text-foreground">
          Sign in to FoodConnect
        </PageHeading>
        <BodyText size="sm" className="mt-1 text-muted-foreground">
          Access your donor, NGO, courier, or admin operations portal
        </BodyText>
      </div>

      {/* Error Banner */}
      {displayedError && (
        <div className="mt-5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{displayedError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormField label="Email Address">
          <Input
            type="email"
            placeholder="coordinator@organization.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </FormField>

        <FormField label="Password">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </FormField>

        <Button type="submit" disabled={isSubmitting} className="w-full mt-2">
          {isSubmitting ? "Authenticating..." : "Continue to Portal"}
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-muted-foreground pt-4 border-t border-border">
        Don&apos;t have an account yet?{" "}
        <Link href="/register" prefetch={true} className="text-primary font-semibold hover:underline">
          Create an account
        </Link>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          className="w-full max-w-4xl rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[560px]">
            {/* Left Imagery Panel */}
            <div className="relative hidden md:flex md:col-span-5 flex-col justify-between p-8 bg-muted overflow-hidden">
              <Image
                src={FOODCONNECT_IMAGES.community.elderlyDistribution.src}
                alt="Community meal sharing in Visakhapatnam"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30" />

              <div className="relative z-10">
                <span className="rounded-full bg-white/20 backdrop-blur-xs px-2.5 py-1 text-[0.65rem] font-semibold text-white uppercase tracking-wider">
                  Visakhapatnam Pilot
                </span>
              </div>

              <div className="relative z-10 text-white">
                <blockquote className="text-sm font-medium leading-snug">
                  &ldquo;Surplus food should reach people who need it instead of being wasted.&rdquo;
                </blockquote>
                <p className="mt-2 text-[0.7rem] text-white/75">
                  Secure Operational Portal • Role-Based Access for Donors, NGOs & Couriers
                </p>
              </div>
            </div>

            {/* Right Form Panel */}
            <div className="p-6 sm:p-8 md:col-span-7">
              <React.Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading sign in portal...</div>}>
                <LoginForm />
              </React.Suspense>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
