"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { 
  ShieldCheck, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Circle, 
  KeyRound,
  ShieldAlert
} from "lucide-react"
import { Header } from "@/components/home/header"
import { Footer } from "@/components/home/footer"
import { FoodConnectLogo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/ui/form-field"
import {
  PageHeading,
  BodyText,
  LabelText,
} from "@/components/ui/typography"
import Image from "next/image"
import { FOODCONNECT_IMAGES } from "@/lib/constants/images"
import { registerAction } from "@/app/actions/auth"
import { UserRole } from "@/types/database"

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = React.useState<"donor" | "ngo" | "courier" | "admin">("donor")
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [area, setArea] = React.useState("MVP Colony")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [adminPasscode, setAdminPasscode] = React.useState("ADMIN-VIZAG-2026")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({})

  // Real-time password criteria evaluation
  const passwordCriteria = React.useMemo(() => {
    return {
      hasLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    }
  }, [password])

  const isPasswordValid = 
    passwordCriteria.hasLength && 
    passwordCriteria.hasUpper && 
    passwordCriteria.hasLower && 
    passwordCriteria.hasNumber

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)
    setFieldErrors({})

    let userRole: UserRole = "DONOR"
    if (role === "ngo") userRole = "NGO"
    if (role === "courier") userRole = "VOLUNTEER"
    if (role === "admin") userRole = "ADMIN"

    setIsSubmitting(true)

    // Sanitize phone input (strip spaces, hyphens)
    const sanitizedPhone = phone.trim().replace(/[\s-]/g, "")

    try {
      const res = await registerAction({
        name: name.trim(),
        email: email.trim(),
        phone: sanitizedPhone,
        password,
        role: userRole,
        organizationName: name.trim(),
        area: area.trim(),
        adminPasscode: role === "admin" ? adminPasscode.trim() : undefined,
      })

      if (!res.success) {
        if (res.errors) {
          setFieldErrors(res.errors)
        }
        setServerError(res.message || "Registration could not be completed.")
        setIsSubmitting(false)
        return
      }

      // Success - navigate with fresh HTTP-Only cookie attached
      window.location.href = res.redirectTo || "/dashboard/donor"
    } catch {
      setServerError("An unexpected error occurred. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 py-12 md:py-20 flex items-center justify-center">
        <div className="w-full max-w-4xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm grid grid-cols-1 md:grid-cols-12"
          >
            {/* Left Image Panel */}
            <div className="relative hidden md:flex md:col-span-5 flex-col justify-between p-8 bg-muted overflow-hidden">
              <Image
                src={FOODCONNECT_IMAGES.workflow.collectionTransit.src}
                alt={FOODCONNECT_IMAGES.workflow.collectionTransit.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 40vw, 400px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30" />

              <div className="relative z-10">
                <span className="rounded-full bg-white/20 backdrop-blur-xs px-2.5 py-1 text-[0.65rem] font-semibold text-white uppercase tracking-wider">
                  Community Network
                </span>
              </div>

              <div className="relative z-10 text-white">
                <blockquote className="text-sm font-medium leading-snug">
                  Join a trusted humanitarian movement uniting food donors, accredited community kitchens, and volunteer logistics.
                </blockquote>
                <p className="mt-2 text-[0.7rem] text-white/75">
                  Secure Operational Portal • Verified Food Rescue in Visakhapatnam
                </p>
              </div>
            </div>

            {/* Right Form Panel */}
            <div className="p-6 sm:p-8 md:col-span-7">
              {/* Header */}
              <div className="text-center">
                <Link href="/" prefetch={true} className="inline-block transition-transform hover:scale-105 mb-2">
                  <FoodConnectLogo size="lg" showText={false} />
                </Link>
                <PageHeading className="text-2xl font-bold text-foreground">
                  Join FoodConnect Vizag
                </PageHeading>
                <BodyText size="sm" className="mt-1 text-muted-foreground">
                  Register as a food donor, verified NGO partner, courier, or admin
                </BodyText>
              </div>

              {serverError && (
                <div className="mt-5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Role Tab Selector with 4 Roles */}
              <div className="mt-6">
                <LabelText className="text-[0.65rem] text-muted-foreground mb-1.5 block">
                  Select Your Operational Role
                </LabelText>
                <div className="grid grid-cols-4 gap-1 rounded-lg bg-muted p-1 text-[0.75rem] font-medium">
                  <button
                    type="button"
                    onClick={() => setRole("donor")}
                    className={`rounded-md py-1.5 px-1 transition-colors truncate ${
                      role === "donor"
                        ? "bg-card text-foreground shadow-2xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Donor
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("ngo")}
                    className={`rounded-md py-1.5 px-1 transition-colors truncate ${
                      role === "ngo"
                        ? "bg-card text-foreground shadow-2xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    NGO
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("courier")}
                    className={`rounded-md py-1.5 px-1 transition-colors truncate ${
                      role === "courier"
                        ? "bg-card text-foreground shadow-2xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Courier
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`rounded-md py-1.5 px-1 transition-colors truncate ${
                      role === "admin"
                        ? "bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold border border-purple-500/30"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              {/* Role specifics info banner */}
              <div className="mt-3 rounded-lg bg-muted/40 p-2.5 border border-border text-xs text-muted-foreground">
                {role === "donor" && (
                  <p>For restaurants, hotels, bakeries, caterers, and corporate kitchens in Vizag donating surplus food.</p>
                )}
                {role === "ngo" && (
                  <p>For community care kitchens and registered shelters in Vizag. Immediate participation for food needs; operational and distribution records undergo administrative review.</p>
                )}
                {role === "courier" && (
                  <p>For volunteer logistics couriers assisting in safe, prompt temperature-controlled transit of food lots.</p>
                )}
                {role === "admin" && (
                  <p className="text-purple-700 dark:text-purple-300 font-medium">
                    Root Platform Administrator: Full governance, NGO verification audits, and real-time audit log access.
                  </p>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
                <FormField
                  label={
                    role === "donor" 
                      ? "Organization / Restaurant Name" 
                      : role === "ngo" 
                        ? "NGO / Shelter Registered Name" 
                        : "Full Legal Name"
                  }
                  error={fieldErrors.name}
                  required
                >
                  <Input
                    type="text"
                    placeholder={
                      role === "donor" 
                        ? "e.g. Grand Banquet Hall" 
                        : role === "ngo" 
                          ? "e.g. Sneha Care Home" 
                          : "e.g. Harshavardhan Pyla"
                    }
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="Official Contact Email" error={fieldErrors.email} required>
                    <Input
                      type="email"
                      placeholder="coordinator@organization.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </FormField>

                  <FormField 
                    label="Phone Number" 
                    description="10-14 digits" 
                    error={fieldErrors.phone} 
                    required
                  >
                    <Input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="Neighborhood / Area" error={fieldErrors.area} required>
                    <Input
                      type="text"
                      placeholder="e.g. MVP Colony, Siripuram"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      required
                    />
                  </FormField>

                  <FormField
                    label="Create Password"
                    error={fieldErrors.password}
                    required
                  >
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
                </div>

                {/* Real-time Password Strength & Rule Checklist */}
                <div className="p-2.5 rounded-lg bg-muted/30 border border-border/70 space-y-1.5">
                  <span className="text-[0.65rem] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Password Security Criteria:
                  </span>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[0.7rem]">
                    <span className={`flex items-center gap-1 ${passwordCriteria.hasLength ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-muted-foreground"}`}>
                      {passwordCriteria.hasLength ? <CheckCircle2 className="size-3 text-emerald-500" /> : <Circle className="size-3" />}
                      8+ characters
                    </span>
                    <span className={`flex items-center gap-1 ${passwordCriteria.hasUpper ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-muted-foreground"}`}>
                      {passwordCriteria.hasUpper ? <CheckCircle2 className="size-3 text-emerald-500" /> : <Circle className="size-3" />}
                      One uppercase letter (A-Z)
                    </span>
                    <span className={`flex items-center gap-1 ${passwordCriteria.hasLower ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-muted-foreground"}`}>
                      {passwordCriteria.hasLower ? <CheckCircle2 className="size-3 text-emerald-500" /> : <Circle className="size-3" />}
                      One lowercase letter (a-z)
                    </span>
                    <span className={`flex items-center gap-1 ${passwordCriteria.hasNumber ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-muted-foreground"}`}>
                      {passwordCriteria.hasNumber ? <CheckCircle2 className="size-3 text-emerald-500" /> : <Circle className="size-3" />}
                      One number (0-9)
                    </span>
                  </div>
                </div>

                {/* Conditional Admin Passcode Gate */}
                {role === "admin" && (
                  <div className="p-3 rounded-lg border border-purple-500/30 bg-purple-500/5 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
                      <KeyRound className="size-3.5" />
                      <span>Platform Administrator Passcode</span>
                    </div>
                    <FormField 
                      label="Security Verification Code" 
                      description="Enter the pilot admin authorization code" 
                      error={fieldErrors.adminPasscode}
                      required
                    >
                      <Input
                        type="text"
                        value={adminPasscode}
                        onChange={(e) => setAdminPasscode(e.target.value)}
                        placeholder="ADMIN-VIZAG-2026"
                        required
                        className="font-mono text-xs uppercase"
                      />
                    </FormField>
                  </div>
                )}

                {/* Quality Notice */}
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-[0.7rem] text-amber-900 dark:text-amber-200">
                  <div className="flex items-start gap-1.5">
                    <ShieldCheck className="size-4 shrink-0 mt-0.5 text-amber-700 dark:text-amber-300" />
                    <span>
                      <strong>Quality Notice:</strong> Donors are responsible for safe preparation and hygiene declarations. NGOs verify storage capabilities before distribution.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-xs text-muted-foreground pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    className="rounded border-border text-primary mt-0.5"
                    required
                  />
                  <label htmlFor="terms" className="cursor-pointer text-[0.72rem]">
                    I agree to the FoodConnect Humanitarian Terms of Service, Privacy Policy, and Food Safety Guidelines for Visakhapatnam.
                  </label>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full mt-2"
                >
                  {isSubmitting ? "Creating Account..." : "Create Account & Sign In"}
                </Button>
              </form>

              <div className="mt-5 text-center text-xs text-muted-foreground pt-3 border-t border-border">
                Already have an account?{" "}
                <Link href="/login" prefetch={true} className="text-primary font-semibold hover:underline">
                  Sign in
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
