'use client'

import * as React from "react"
import { Check, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode
  description?: React.ReactNode
  indeterminate?: boolean
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, indeterminate, checked, disabled, id, ...props }, ref) => {
    const internalId = React.useId()
    const inputId = id || internalId

    return (
      <div className={cn("inline-flex items-start gap-2.5", className)}>
        <div className="relative flex items-center justify-center pt-0.5">
          <input
            type="checkbox"
            id={inputId}
            ref={ref}
            checked={checked}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <label
            htmlFor={inputId}
            className={cn(
              "size-4 rounded border border-input bg-background transition-colors cursor-pointer flex items-center justify-center",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-1",
              "peer-checked:bg-primary peer-checked:border-primary peer-checked:text-primary-foreground",
              indeterminate && "bg-primary border-primary text-primary-foreground",
              disabled && "cursor-not-allowed opacity-50 bg-muted border-muted-foreground/30"
            )}
          >
            {indeterminate ? (
              <Minus className="size-3.5 stroke-[3] text-primary-foreground m-auto" />
            ) : checked ? (
              <Check className="size-3.5 stroke-[3] text-primary-foreground m-auto" />
            ) : null}
          </label>
        </div>
        {(label || description) && (
          <div className="flex flex-col text-sm leading-tight">
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
              <span className="text-xs text-muted-foreground mt-0.5">{description}</span>
            )}
          </div>
        )}
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
