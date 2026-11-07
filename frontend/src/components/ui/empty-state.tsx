import * as React from "react"
import { FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-border/80 bg-card/40 space-y-3",
        className
      )}
      {...props}
    >
      <div className="p-3 bg-muted/60 rounded-full text-muted-foreground">
        {icon || <FolderOpen className="size-6" aria-hidden="true" />}
      </div>
      <div className="space-y-1 max-w-sm">
        <h4 className="text-base font-semibold text-foreground tracking-tight">{title}</h4>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  )
}
