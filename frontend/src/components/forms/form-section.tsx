import * as React from "react"
import { cn } from "@/lib/utils"

export interface FormSectionProps extends React.HTMLAttributes<HTMLFieldSetElement> {
  title: string
  description?: string
  badge?: React.ReactNode
}

export function FormSection({
  title,
  description,
  badge,
  children,
  className,
  ...props
}: FormSectionProps) {
  return (
    <fieldset
      className={cn(
        "rounded-xl border border-border bg-card p-5 shadow-xs space-y-4",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-3">
        <div className="space-y-0.5">
          <legend className="text-base font-semibold text-foreground tracking-tight">
            {title}
          </legend>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>
      <div className="space-y-4 pt-1">{children}</div>
    </fieldset>
  )
}
