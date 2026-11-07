'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

export interface RadioOption {
  value: string
  label: React.ReactNode
  description?: React.ReactNode
  disabled?: boolean
}

export interface RadioGroupProps {
  name: string
  options: RadioOption[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  disabled?: boolean
  className?: string
  orientation?: 'vertical' | 'horizontal'
  error?: boolean | string
}

export function RadioGroup({
  name,
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  disabled = false,
  className,
  orientation = 'vertical',
  error,
}: RadioGroupProps) {
  const [internalValue, setInternalValue] = React.useState<string>(defaultValue || '')
  const isControlled = controlledValue !== undefined
  const currentValue = isControlled ? controlledValue : internalValue

  const handleChange = (val: string) => {
    if (!isControlled) setInternalValue(val)
    if (onChange) onChange(val)
  }

  return (
    <div
      role="radiogroup"
      aria-invalid={Boolean(error) ? "true" : undefined}
      className={cn(
        "gap-3",
        orientation === 'vertical' ? 'flex flex-col' : 'flex flex-row flex-wrap',
        className
      )}
    >
      {options.map((option) => {
        const isChecked = currentValue === option.value
        const isOptDisabled = disabled || option.disabled
        const id = `${name}-${option.value}`

        return (
          <label
            key={option.value}
            htmlFor={id}
            className={cn(
              "inline-flex items-start gap-2.5 cursor-pointer select-none group",
              isOptDisabled && "cursor-not-allowed opacity-50"
            )}
          >
            <div className="relative flex items-center justify-center pt-0.5">
              <input
                type="radio"
                id={id}
                name={name}
                value={option.value}
                checked={isChecked}
                disabled={isOptDisabled}
                onChange={() => handleChange(option.value)}
                className="peer sr-only"
              />
              <div
                className={cn(
                  "size-4 rounded-full border border-input bg-background transition-all flex items-center justify-center",
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-1",
                  isChecked && "border-primary",
                  Boolean(error) && "border-destructive"
                )}
                aria-hidden="true"
              >
                {isChecked && (
                  <span className="size-2 rounded-full bg-primary animate-in zoom-in-50 duration-100" />
                )}
              </div>
            </div>
            <div className="flex flex-col text-sm leading-tight">
              <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                {option.label}
              </span>
              {option.description && (
                <span className="text-xs text-muted-foreground mt-0.5">{option.description}</span>
              )}
            </div>
          </label>
        )
      })}
    </div>
  )
}
