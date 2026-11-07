import * as React from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  message: string
  onRetry?: () => void
  retryText?: string
}

export function ErrorState({
  title = "Unable to load data",
  message,
  onRetry,
  retryText = "Try Again",
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-destructive/20 bg-destructive/5 space-y-3",
        className
      )}
      {...props}
    >
      <div className="p-3 bg-destructive/10 rounded-full text-destructive">
        <AlertCircle className="size-6" aria-hidden="true" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h4 className="text-base font-semibold text-foreground tracking-tight">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            leftIcon={<RefreshCw className="size-3.5" />}
          >
            {retryText}
          </Button>
        </div>
      )}
    </div>
  )
}
