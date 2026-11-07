import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  variant?: 'default' | 'success' | 'warning' | 'destructive'
  showLabel?: boolean
}

export function Progress({
  value = 0,
  max = 100,
  variant = 'default',
  showLabel = false,
  className,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const variantClass = {
    default: 'bg-primary',
    success: 'bg-emerald-600',
    warning: 'bg-amber-500',
    destructive: 'bg-rose-600',
  }[variant]

  return (
    <div className={cn("w-full space-y-1.5", className)} {...props}>
      {showLabel && (
        <div className="flex justify-between text-xs font-medium text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={props['aria-label'] || "Progress"}
        className="relative h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn("h-full transition-all duration-300 ease-in-out rounded-full", variantClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
