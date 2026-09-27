import type { LucideIcon } from "lucide-react"
import {
  CheckCircle2,
  Shuffle,
  HandHeart,
  CheckCheck,
  Truck,
  PackageCheck,
  HeartHandshake,
  ShieldCheck,
  Archive,
  Flame,
  PieChart,
  Award,
  ClockAlert,
  Clock,
  XCircle,
  PauseCircle,
} from "lucide-react"

export type FoodConnectStatus =
  | "Available"
  | "Matching"
  | "Requested"
  | "Accepted"
  | "Collection Assigned"
  | "Collected"
  | "Distributed"
  | "Verified"
  | "Closed"
  | "Active Need"
  | "Partially Fulfilled"
  | "Fulfilled"
  | "Expired"
  | "Pending"
  | "Rejected"
  | "Suspended"

export type StatusCategory =
  | "listing"
  | "request"
  | "fulfillment"
  | "verification"
  | "lifecycle"

export interface StatusConfig {
  key: FoodConnectStatus
  label: string
  description: string
  category: StatusCategory
  icon: LucideIcon
  shouldPulse?: boolean
  classes: {
    badge: string
    dot: string
    text: string
    border: string
  }
}

export const STATUS_CONFIG: Record<FoodConnectStatus, StatusConfig> = {
  Available: {
    key: "Available",
    label: "Available",
    description: "Surplus food is cataloged and available for community claiming.",
    category: "listing",
    icon: CheckCircle2,
    classes: {
      badge: "bg-[var(--status-available-bg)] text-[var(--status-available-text)] border-[var(--status-available-border)]",
      dot: "bg-[var(--status-available-text)]",
      text: "text-[var(--status-available-text)]",
      border: "border-[var(--status-available-border)]",
    },
  },
  Matching: {
    key: "Matching",
    label: "Matching",
    description: "Actively routing surplus to nearby verified NGO needs.",
    category: "fulfillment",
    icon: Shuffle,
    shouldPulse: true,
    classes: {
      badge: "bg-[var(--status-matching-bg)] text-[var(--status-matching-text)] border-[var(--status-matching-border)]",
      dot: "bg-[var(--status-matching-text)]",
      text: "text-[var(--status-matching-text)]",
      border: "border-[var(--status-matching-border)]",
    },
  },
  Requested: {
    key: "Requested",
    label: "Requested",
    description: "A verified NGO has requested this surplus food lot.",
    category: "request",
    icon: HandHeart,
    classes: {
      badge: "bg-[var(--status-requested-bg)] text-[var(--status-requested-text)] border-[var(--status-requested-border)]",
      dot: "bg-[var(--status-requested-text)]",
      text: "text-[var(--status-requested-text)]",
      border: "border-[var(--status-requested-border)]",
    },
  },
  Accepted: {
    key: "Accepted",
    label: "Accepted",
    description: "Food donor has approved the request from the recipient NGO.",
    category: "fulfillment",
    icon: CheckCheck,
    classes: {
      badge: "bg-[var(--status-accepted-bg)] text-[var(--status-accepted-text)] border-[var(--status-accepted-border)]",
      dot: "bg-[var(--status-accepted-text)]",
      text: "text-[var(--status-accepted-text)]",
      border: "border-[var(--status-accepted-border)]",
    },
  },
  "Collection Assigned": {
    key: "Collection Assigned",
    label: "Collection Assigned",
    description: "Volunteer or transport courier has been dispatched for pickup.",
    category: "fulfillment",
    icon: Truck,
    shouldPulse: true,
    classes: {
      badge: "bg-[var(--status-collection-assigned-bg)] text-[var(--status-collection-assigned-text)] border-[var(--status-collection-assigned-border)]",
      dot: "bg-[var(--status-collection-assigned-text)]",
      text: "text-[var(--status-collection-assigned-text)]",
      border: "border-[var(--status-collection-assigned-border)]",
    },
  },
  Collected: {
    key: "Collected",
    label: "Collected",
    description: "Food has been safely retrieved from donor location.",
    category: "fulfillment",
    icon: PackageCheck,
    classes: {
      badge: "bg-[var(--status-collected-bg)] text-[var(--status-collected-text)] border-[var(--status-collected-border)]",
      dot: "bg-[var(--status-collected-text)]",
      text: "text-[var(--status-collected-text)]",
      border: "border-[var(--status-collected-border)]",
    },
  },
  Distributed: {
    key: "Distributed",
    label: "Distributed",
    description: "Meals safely handed out to people and families in the community.",
    category: "fulfillment",
    icon: HeartHandshake,
    classes: {
      badge: "bg-[var(--status-distributed-bg)] text-[var(--status-distributed-text)] border-[var(--status-distributed-border)]",
      dot: "bg-[var(--status-distributed-text)]",
      text: "text-[var(--status-distributed-text)]",
      border: "border-[var(--status-distributed-border)]",
    },
  },
  Verified: {
    key: "Verified",
    label: "Verified",
    description: "Identity, hygiene standards, or NGO credentials verified.",
    category: "verification",
    icon: ShieldCheck,
    classes: {
      badge: "bg-[var(--status-verified-bg)] text-[var(--status-verified-text)] border-[var(--status-verified-border)]",
      dot: "bg-[var(--status-verified-text)]",
      text: "text-[var(--status-verified-text)]",
      border: "border-[var(--status-verified-border)]",
    },
  },
  Closed: {
    key: "Closed",
    label: "Closed",
    description: "Listing lifecycle completed and archived with audit record.",
    category: "lifecycle",
    icon: Archive,
    classes: {
      badge: "bg-[var(--status-closed-bg)] text-[var(--status-closed-text)] border-[var(--status-closed-border)]",
      dot: "bg-[var(--status-closed-text)]",
      text: "text-[var(--status-closed-text)]",
      border: "border-[var(--status-closed-border)]",
    },
  },
  "Active Need": {
    key: "Active Need",
    label: "Active Need",
    description: "Urgent active food requirement declared by a verified NGO.",
    category: "request",
    icon: Flame,
    shouldPulse: true,
    classes: {
      badge: "bg-[var(--status-active-need-bg)] text-[var(--status-active-need-text)] border-[var(--status-active-need-border)]",
      dot: "bg-[var(--status-active-need-text)]",
      text: "text-[var(--status-active-need-text)]",
      border: "border-[var(--status-active-need-border)]",
    },
  },
  "Partially Fulfilled": {
    key: "Partially Fulfilled",
    label: "Partially Fulfilled",
    description: "Portion of requested food quota committed; remainder active.",
    category: "fulfillment",
    icon: PieChart,
    classes: {
      badge: "bg-[var(--status-partially-fulfilled-bg)] text-[var(--status-partially-fulfilled-text)] border-[var(--status-partially-fulfilled-border)]",
      dot: "bg-[var(--status-partially-fulfilled-text)]",
      text: "text-[var(--status-partially-fulfilled-text)]",
      border: "border-[var(--status-partially-fulfilled-border)]",
    },
  },
  Fulfilled: {
    key: "Fulfilled",
    label: "Fulfilled",
    description: "100% of community meal target supplied and received.",
    category: "fulfillment",
    icon: Award,
    classes: {
      badge: "bg-[var(--status-fulfilled-bg)] text-[var(--status-fulfilled-text)] border-[var(--status-fulfilled-border)]",
      dot: "bg-[var(--status-fulfilled-text)]",
      text: "text-[var(--status-fulfilled-text)]",
      border: "border-[var(--status-fulfilled-border)]",
    },
  },
  Expired: {
    key: "Expired",
    label: "Expired",
    description: "Perishable consumption window lapsed prior to dispatch.",
    category: "lifecycle",
    icon: ClockAlert,
    classes: {
      badge: "bg-[var(--status-expired-bg)] text-[var(--status-expired-text)] border-[var(--status-expired-border)]",
      dot: "bg-[var(--status-expired-text)]",
      text: "text-[var(--status-expired-text)]",
      border: "border-[var(--status-expired-border)]",
    },
  },
  Pending: {
    key: "Pending",
    label: "Pending",
    description: "Awaiting administrative review or donor response.",
    category: "request",
    icon: Clock,
    shouldPulse: true,
    classes: {
      badge: "bg-[var(--status-pending-bg)] text-[var(--status-pending-text)] border-[var(--status-pending-border)]",
      dot: "bg-[var(--status-pending-text)]",
      text: "text-[var(--status-pending-text)]",
      border: "border-[var(--status-pending-border)]",
    },
  },
  Rejected: {
    key: "Rejected",
    label: "Rejected",
    description: "Request declined or cancelled due to capacity or logistics.",
    category: "lifecycle",
    icon: XCircle,
    classes: {
      badge: "bg-[var(--status-rejected-bg)] text-[var(--status-rejected-text)] border-[var(--status-rejected-border)]",
      dot: "bg-[var(--status-rejected-text)]",
      text: "text-[var(--status-rejected-text)]",
      border: "border-[var(--status-rejected-border)]",
    },
  },
  Suspended: {
    key: "Suspended",
    label: "Suspended",
    description: "Temporarily held pending safety clarification or compliance.",
    category: "lifecycle",
    icon: PauseCircle,
    classes: {
      badge: "bg-[var(--status-suspended-bg)] text-[var(--status-suspended-text)] border-[var(--status-suspended-border)]",
      dot: "bg-[var(--status-suspended-text)]",
      text: "text-[var(--status-suspended-text)]",
      border: "border-[var(--status-suspended-border)]",
    },
  },
}

export function getStatusConfig(status: FoodConnectStatus): StatusConfig {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.Pending
}

export const ALL_STATUSES = Object.keys(STATUS_CONFIG) as FoodConnectStatus[]
