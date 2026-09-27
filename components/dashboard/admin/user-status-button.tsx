"use client"

import * as React from "react"
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleUserStatusAction } from "@/app/actions/admin"
import { AccountStatus } from "@/types/database"

interface UserStatusButtonProps {
  userId: string
  currentStatus: AccountStatus
  userName: string
}

export function UserStatusButton({ userId, currentStatus, userName }: UserStatusButtonProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleToggle = async () => {
    const nextStatus: AccountStatus = currentStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED"
    if (!confirm(`Are you sure you want to change ${userName}'s account status to ${nextStatus}?`)) {
      return
    }

    setIsSubmitting(true)
    try {
      await toggleUserStatusAction(userId, nextStatus)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (currentStatus === "SUSPENDED") {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={handleToggle}
        disabled={isSubmitting}
        className="text-[0.65rem] h-6 px-2 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
      >
        {isSubmitting ? <Loader2 className="size-3 animate-spin" /> : <ShieldCheck className="size-3 mr-1" />}
        Reactivate
      </Button>
    )
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleToggle}
      disabled={isSubmitting}
      className="text-[0.65rem] h-6 px-2 text-destructive border-destructive/30 hover:bg-destructive/10"
    >
      {isSubmitting ? <Loader2 className="size-3 animate-spin" /> : <ShieldAlert className="size-3 mr-1" />}
      Suspend
    </Button>
  )
}
