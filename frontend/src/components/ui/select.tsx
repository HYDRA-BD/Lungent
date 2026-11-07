import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean | string
  options?: SelectOption[]
  placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, placeholder, children, id, ...props }, ref) => {
    const hasError = Boolean(error)

    return (
      <div className="relative w-full">
        <select
          id={id}
          ref={ref}
          aria-invalid={hasError ? "true" : undefined}
          className={cn(
            "flex h-9 w-full appearance-none rounded-lg border bg-background px-3 py-1 pr-8 text-sm shadow-xs transition-colors cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            hasError
              ? "border-destructive text-destructive focus-visible:ring-destructive/30"
              : "border-input text-foreground",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
          <ChevronDown className="size-4" aria-hidden="true" />
        </span>
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
