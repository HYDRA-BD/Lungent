'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode
  description?: React.ReactNode
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, checked, disabled, id, ...props }, ref) => {
    const internalId = React.useId()
    const inputId = id || internalId

    return (
      <div className={cn("inline-flex items-center justify-between gap-4", className)}>
        {(label || description) && (
          <div className="flex flex-col text-sm">
            {label && (
              <label
                htmlFor={inputId}
                className={cn(
                  "font-medium text-foreground cursor-pointer select-none",
                  disabled && "cursor-not-allowed opacity-60"
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <span className="text-xs text-muted-foreground">{description}</span>
            )}
          </div>
        )}
        <label htmlFor={inputId} className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id={inputId}
            ref={ref}
            checked={checked}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "h-5 w-9 rounded-full bg-input transition-colors",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
              "peer-checked:bg-primary",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <div
              className={cn(
                "size-4 rounded-full bg-background shadow-xs transition-transform duration-200 mt-0.5 ml-0.5",
                checked && "translate-x-4"
              )}
            />
          </div>
        </label>
      </div>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
