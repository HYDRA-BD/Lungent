import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string
  subMessage?: string
}

export function LoadingState({
  message = "Loading information...",
  subMessage,
  className,
  ...props
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-border/40 bg-card/20 space-y-3",
        className
      )}
      {...props}
    >
      <Loader2 className="size-7 animate-spin text-primary" aria-hidden="true" />
      <div className="space-y-0.5 max-w-sm">
        <p className="text-sm font-medium text-foreground">{message}</p>
        {subMessage && (
          <p className="text-xs text-muted-foreground">{subMessage}</p>
        )}
      </div>
    </div>
  )
}
