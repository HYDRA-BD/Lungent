import * as React from "react"
import { ShieldCheck, AlertTriangle, AlertOctagon, Clock, CheckCircle } from "lucide-react"
import { Badge } from "./badge"
import { cn } from "@/lib/utils"

export type ClinicalRiskTier = 'low' | 'moderate' | 'high' | 'critical'
export type WorkflowStatus = 'draft' | 'pending' | 'in_review' | 'completed' | 'referred'

export interface RiskBadgeProps {
  tier: ClinicalRiskTier
  locale?: 'en' | 'bn'
  showIcon?: boolean
  className?: string
}

export function RiskBadge({
  tier,
  locale = 'en',
  showIcon = true,
  className,
}: RiskBadgeProps) {
  const isBn = locale === 'bn'

  const config = {
    low: {
      label: isBn ? "কম ঝুঁকি" : "Low Risk",
      variant: "success" as const,
      icon: <ShieldCheck className="size-3" />,
    },
    moderate: {
      label: isBn ? "মাঝারি ঝুঁকি" : "Moderate Risk",
      variant: "warning" as const,
      icon: <AlertTriangle className="size-3" />,
    },
    high: {
      label: isBn ? "উচ্চ ঝুঁকি" : "High Risk",
      variant: "destructive" as const,
      icon: <AlertOctagon className="size-3" />,
    },
    critical: {
      label: isBn ? "জরুরি সংকেত" : "Critical Red-Flag",
      variant: "destructive" as const,
      icon: <AlertOctagon className="size-3 animate-pulse" />,
    },
  }[tier]

  return (
    <Badge
      variant={config.variant}
      className={cn("gap-1.5 font-semibold", tier === 'critical' && "animate-pulse ring-1 ring-destructive", className)}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </Badge>
  )
}

export interface StatusBadgeProps {
  status: WorkflowStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    draft: { label: "Draft", variant: "secondary" as const, icon: <Clock className="size-3" /> },
    pending: { label: "Pending Triage", variant: "warning" as const, icon: <Clock className="size-3" /> },
    in_review: { label: "In Review", variant: "info" as const, icon: <Clock className="size-3" /> },
    completed: { label: "Completed", variant: "success" as const, icon: <CheckCircle className="size-3" /> },
    referred: { label: "Referred", variant: "default" as const, icon: <CheckCircle className="size-3" /> },
  }[status]

  return (
    <Badge variant={config.variant} className={cn("gap-1.5", className)}>
      {config.icon}
      <span>{config.label}</span>
    </Badge>
  )
}
