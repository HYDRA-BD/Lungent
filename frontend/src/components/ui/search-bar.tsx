'use client'

import * as React from "react"
import { Search, X, SlidersHorizontal } from "lucide-react"
import { Input } from "./input"
import { Button } from "./button"
import { cn } from "@/lib/utils"

export interface SearchBarProps {
  value?: string
  defaultValue?: string
  placeholder?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  onFilterClick?: () => void
  hasActiveFilters?: boolean
  className?: string
}

export function SearchBar({
  value: controlledValue,
  defaultValue = "",
  placeholder = "Search by patient ID, name, clinic or symptom...",
  onChange,
  onSearch,
  onFilterClick,
  hasActiveFilters = false,
  className,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (!isControlled) setInternalValue(val)
    if (onChange) onChange(val)
  }

  const handleClear = () => {
    if (!isControlled) setInternalValue("")
    if (onChange) onChange("")
    if (onSearch) onSearch("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(value)
    }
  }

  return (
    <div className={cn("flex items-center gap-2 w-full", className)}>
      <div className="relative flex-1">
        <Input
          type="search"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          leftIcon={<Search className="size-4 text-muted-foreground" />}
          rightIcon={
            value ? (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:text-foreground text-muted-foreground"
                aria-label="Clear search query"
              >
                <X className="size-3.5" />
              </button>
            ) : undefined
          }
          className="pr-8"
        />
      </div>
      {onFilterClick && (
        <Button
          type="button"
          variant={hasActiveFilters ? "default" : "outline"}
          size="sm"
          onClick={onFilterClick}
          aria-label="Toggle search filters"
          leftIcon={<SlidersHorizontal className="size-3.5" />}
        >
          Filters
        </Button>
      )}
    </div>
  )
}
