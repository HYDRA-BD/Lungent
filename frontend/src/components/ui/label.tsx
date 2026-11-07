import * as React from "react"
import { cn } from "@/lib/utils"

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export function Label({
  className,
  required = false,
  children,
  ...props
}: LabelProps) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none text-foreground select-none inline-flex items-center gap-1",
        props.onClick && "cursor-pointer",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {required && (
        <span className="text-destructive font-bold text-xs" title="Required field" aria-hidden="true">
          *
        </span>
      )}
    </label>
  )
}
