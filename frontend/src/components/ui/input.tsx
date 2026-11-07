'use client'

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean | string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, leftIcon, rightIcon, disabled, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const isPassword = type === "password"
    const actualType = isPassword ? (showPassword ? "text" : "password") : type

    const hasError = Boolean(error)

    return (
      <div className="relative w-full inline-flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-muted-foreground pointer-events-none size-4 flex items-center justify-center">
            {leftIcon}
          </span>
        )}
        <input
          id={id}
          type={actualType}
          disabled={disabled}
          aria-invalid={hasError ? "true" : undefined}
          ref={ref}
          className={cn(
            "flex h-9 w-full rounded-lg border bg-background px-3 py-1 text-sm shadow-xs transition-colors",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            leftIcon && "pl-9",
            (rightIcon || isPassword) && "pr-9",
            hasError
              ? "border-destructive text-destructive focus-visible:ring-destructive/30"
              : "border-input",
            className
          )}
          {...props}
        />
        {isPassword && !rightIcon && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground rounded focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
        {rightIcon && !isPassword && (
          <span className="absolute right-3 text-muted-foreground pointer-events-none size-4 flex items-center justify-center">
            {rightIcon}
          </span>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
