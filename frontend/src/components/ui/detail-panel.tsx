import * as React from "react"
import { cn } from "@/lib/utils"

export interface DetailField {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
  span?: 1 | 2
}

export interface DetailPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  badge?: React.ReactNode
  fields: DetailField[]
  actions?: React.ReactNode
}

export function DetailPanel({
  title,
  description,
  badge,
  fields,
  actions,
  className,
  ...props
}: DetailPanelProps) {
  return (
    <div
      className={cn("rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4", className)}
      {...props}
    >
      <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold text-foreground tracking-tight">{title}</h4>
            {badge && <div>{badge}</div>}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((field, idx) => (
          <div
            key={idx}
            className={cn(
              "space-y-1 p-2.5 rounded-lg bg-muted/30 border border-border/40",
              field.span === 2 && "sm:col-span-2"
            )}
          >
            <dt className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              {field.icon && <span className="size-3.5 text-primary">{field.icon}</span>}
              <span>{field.label}</span>
            </dt>
            <dd className="text-sm font-semibold text-foreground break-words">
              {field.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
