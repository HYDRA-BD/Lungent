'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

export interface DropdownMenuItem {
  id: string
  label: React.ReactNode
  icon?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  destructive?: boolean
}

export interface DropdownMenuProps {
  trigger: React.ReactElement<{
    onClick?: React.MouseEventHandler
    'aria-expanded'?: boolean
    'aria-haspopup'?: boolean
  }>
  items: (DropdownMenuItem | 'separator')[]
  align?: 'left' | 'right'
  className?: string
}

export function DropdownMenu({
  trigger,
  items,
  align = 'right',
  className,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {React.cloneElement(trigger, {
        onClick: (e: React.MouseEvent) => {
          trigger.props.onClick?.(e)
          setIsOpen(!isOpen)
        },
        'aria-expanded': isOpen,
        'aria-haspopup': true,
      })}

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={cn(
            "absolute z-50 mt-1.5 w-48 rounded-xl border border-border bg-popover p-1 shadow-lg text-popover-foreground animate-in fade-in-0 zoom-in-95 duration-100",
            align === 'right' ? "right-0" : "left-0",
            className
          )}
        >
          {items.map((item, index) => {
            if (item === 'separator') {
              return (
                <div
                  key={`sep-${index}`}
                  role="separator"
                  className="my-1 h-[1px] bg-border"
                />
              )
            }

            return (
              <button
                key={item.id}
                role="menuitem"
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  item.onClick?.()
                  setIsOpen(false)
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-left transition-colors cursor-pointer select-none",
                  item.destructive
                    ? "text-destructive hover:bg-destructive/10"
                    : "text-foreground hover:bg-muted",
                  item.disabled && "cursor-not-allowed opacity-50"
                )}
              >
                {item.icon && <span className="size-4 shrink-0">{item.icon}</span>}
                <span className="flex-1 truncate">{item.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
