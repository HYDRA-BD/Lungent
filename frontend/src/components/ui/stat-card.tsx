import * as React from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: string | number
    direction: 'up' | 'down' | 'neutral'
    label?: string
  }
  badge?: React.ReactNode
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  badge,
  className,
  ...props
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3 transition-all hover:border-primary/40",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
        {icon && (
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-2xl font-bold tracking-tight text-foreground font-sans">
            {value}
          </div>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>

        {trend && (
          <div className="flex items-center gap-1.5 text-xs font-medium">
            {trend.direction === 'up' && (
              <span className="flex items-center text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="size-3.5 mr-0.5" aria-hidden="true" />
                +{trend.value}
              </span>
            )}
            {trend.direction === 'down' && (
              <span className="flex items-center text-rose-600 dark:text-rose-400">
                <TrendingDown className="size-3.5 mr-0.5" aria-hidden="true" />
                -{trend.value}
              </span>
            )}
            {trend.direction === 'neutral' && (
              <span className="flex items-center text-muted-foreground">
                <Minus className="size-3.5 mr-0.5" aria-hidden="true" />
                {trend.value}
              </span>
            )}
            {trend.label && (
              <span className="text-muted-foreground font-normal">{trend.label}</span>
            )}
          </div>
        )}

        {description && (
          <p className="text-xs text-muted-foreground leading-normal">{description}</p>
        )}
      </div>
    </div>
  )
}
