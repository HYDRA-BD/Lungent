import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean | string
  maxLength?: number
  showCount?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, maxLength, showCount, value, defaultValue, onChange, ...props }, ref) => {
    const [currentLength, setCurrentLength] = React.useState<number>(
      typeof value === "string" ? value.length : typeof defaultValue === "string" ? defaultValue.length : 0
    )

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCurrentLength(e.target.value.length)
      if (onChange) onChange(e)
    }

    const hasError = Boolean(error)

    return (
      <div className="w-full space-y-1">
        <textarea
          ref={ref}
          maxLength={maxLength}
          onChange={handleChange}
          value={value}
          defaultValue={defaultValue}
          aria-invalid={hasError ? "true" : undefined}
          className={cn(
            "flex min-h-[80px] w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-xs transition-colors",
            "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            hasError
              ? "border-destructive text-destructive focus-visible:ring-destructive/30"
              : "border-input",
            className
          )}
          {...props}
        />
        {showCount && maxLength && (
          <div className="flex justify-end text-xs text-muted-foreground">
            <span>
              {currentLength} / {maxLength}
            </span>
          </div>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
