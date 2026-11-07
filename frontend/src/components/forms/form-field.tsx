import * as React from "react"
import { AlertCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface FormFieldProps {
  id?: string
  label?: string
  required?: boolean
  error?: string
  helperText?: string
  children: React.ReactElement<{
    id?: string
    error?: boolean | string
    'aria-describedby'?: string
  }>
  className?: string
}

export function FormField({
  id: externalId,
  label,
  required,
  error,
  helperText,
  children,
  className,
}: FormFieldProps) {
  const internalId = React.useId()
  const fieldId = externalId || children.props.id || internalId
  const errorId = `${fieldId}-error`
  const helperId = `${fieldId}-helper`

  const describedBy = [
    error ? errorId : null,
    helperText ? helperId : null,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {label && (
        <Label htmlFor={fieldId} required={required}>
          {label}
        </Label>
      )}

      {React.cloneElement(children, {
        id: fieldId,
        error: Boolean(error),
        'aria-describedby': describedBy || undefined,
      })}

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-1.5 text-xs text-destructive font-medium animate-in fade-in-50 duration-150"
        >
          <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      ) : null}
    </div>
  )
}
