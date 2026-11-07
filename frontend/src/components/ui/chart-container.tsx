import * as React from "react"
import { BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  action?: React.ReactNode
  ariaSummary: string
}

export function ChartContainer({
  title,
  description,
  action,
  ariaSummary,
  children,
  className,
  ...props
}: ChartContainerProps) {
  return (
    <div
      role="region"
      aria-label={title}
      className={cn("rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4", className)}
      {...props}
    >
      <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-primary shrink-0" aria-hidden="true" />
            <h4 className="text-base font-semibold text-foreground tracking-tight">{title}</h4>
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* Visual Chart Canvas Area */}
      <div className="relative min-h-[220px] w-full flex items-center justify-center">
        {children}
      </div>

      {/* Screen reader accessible summary */}
      <div className="sr-only">
        <p>{ariaSummary}</p>
      </div>
    </div>
  )
}
