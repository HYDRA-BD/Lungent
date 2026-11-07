'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

export interface TabItem {
  id: string
  label: React.ReactNode
  icon?: React.ReactNode
  badge?: React.ReactNode
  disabled?: boolean
}

export interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (id: string) => void
  variant?: 'underline' | 'pills' | 'segmented'
  className?: string
  children?: React.ReactNode
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className,
}: TabsProps) {
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={cn(
        "flex items-center",
        variant === 'underline' && "border-b border-border gap-6",
        variant === 'pills' && "gap-1.5 p-1 bg-muted/60 rounded-xl",
        variant === 'segmented' && "grid w-full grid-flow-col auto-cols-fr p-1 bg-muted rounded-xl",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex items-center justify-center gap-2 text-sm font-medium transition-all select-none cursor-pointer focus-visible:outline-2 focus-visible:outline-ring rounded-lg",
              tab.disabled && "cursor-not-allowed opacity-40",
              variant === 'underline' && [
                "pb-2.5 pt-1 px-1 border-b-2 rounded-none -mb-[1px]",
                isActive
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
              ],
              variant === 'pills' && [
                "px-3 py-1.5 text-xs rounded-lg",
                isActive
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              ],
              variant === 'segmented' && [
                "py-1.5 px-3 text-xs rounded-lg text-center",
                isActive
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              ]
            )}
          >
            {tab.icon && <span className="size-4 shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && <span className="shrink-0">{tab.badge}</span>}
          </button>
        )
      })}
    </div>
  )
}

export function TabPanel({
  id,
  activeTab,
  className,
  children,
}: {
  id: string
  activeTab: string
  className?: string
  children: React.ReactNode
}) {
  if (id !== activeTab) return null

  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      className={cn("pt-4 focus-visible:outline-none", className)}
    >
      {children}
    </div>
  )
}
