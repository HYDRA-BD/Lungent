'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccordionContextValue {
  openItems: string[]
  toggleItem: (id: string) => void
  type: 'single' | 'multiple'
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(undefined)

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'single' | 'multiple'
  defaultValue?: string | string[]
  children: React.ReactNode
}

export function Accordion({
  type = 'single',
  defaultValue,
  className,
  children,
  ...props
}: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<string[]>(() => {
    if (!defaultValue) return []
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue]
  })

  const toggleItem = React.useCallback(
    (id: string) => {
      setOpenItems((prev) => {
        if (type === 'single') {
          return prev.includes(id) ? [] : [id]
        }
        return prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      })
    },
    [type]
  )

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, type }}>
      <div className={cn('divide-y divide-border/60 rounded-xl border border-border bg-card shadow-xs', className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  children: React.ReactNode
}

export function AccordionItem({ value, className, children, ...props }: AccordionItemProps) {
  return (
    <div className={cn('overflow-hidden first:rounded-t-xl last:rounded-b-xl', className)} data-value={value} {...props}>
      {children}
    </div>
  )
}

export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  children: React.ReactNode
}

export function AccordionTrigger({ value, className, children, ...props }: AccordionTriggerProps) {
  const context = React.useContext(AccordionContext)
  if (!context) throw new Error('AccordionTrigger must be used within Accordion')

  const isOpen = context.openItems.includes(value)

  return (
    <h3>
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => context.toggleItem(value)}
        className={cn(
          'flex w-full items-center justify-between p-5 sm:p-6 text-left text-base sm:text-lg font-bold text-foreground transition-all hover:bg-muted/40 cursor-pointer focus-visible:outline-2 focus-visible:outline-ring',
          className
        )}
        {...props}
      >
        <span>{children}</span>
        <ChevronDown
          className={cn(
            'size-5 shrink-0 text-muted-foreground transition-transform duration-300',
            isOpen && 'rotate-180 text-primary'
          )}
          aria-hidden="true"
        />
      </button>
    </h3>
  )
}

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  children: React.ReactNode
}

export function AccordionContent({ value, className, children, ...props }: AccordionContentProps) {
  const context = React.useContext(AccordionContext)
  if (!context) throw new Error('AccordionContent must be used within Accordion')

  const isOpen = context.openItems.includes(value)

  if (!isOpen) return null

  return (
    <div
      role="region"
      className={cn('p-5 sm:p-6 pt-0 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed animate-in fade-in-50 duration-200', className)}
      {...props}
    >
      {children}
    </div>
  )
}
