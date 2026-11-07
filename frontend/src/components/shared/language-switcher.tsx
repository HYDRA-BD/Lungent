'use client'

import React, { useState } from 'react'
import { Languages, Check } from 'lucide-react'
import { SUPPORTED_LOCALES, LOCALES_METADATA, type SupportedLocale, useLanguage } from '@/i18n'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  className?: string
  variant?: 'pill' | 'select' | 'compact'
}

export function LanguageSwitcher({ className, variant = 'compact' }: LanguageSwitcherProps) {
  const { locale: currentLocale, setLocale: setCurrentLocale } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (locale: SupportedLocale) => {
    setCurrentLocale(locale)
    setIsOpen(false)
  }

  if (variant === 'pill') {
    return (
      <div
        role="group"
        aria-label="Language selection"
        className={cn('inline-flex items-center rounded-lg border bg-muted/50 p-1 text-xs font-medium', className)}
      >
        {SUPPORTED_LOCALES.map((locale) => {
          const meta = LOCALES_METADATA[locale]
          const isSelected = currentLocale === locale
          return (
            <button
              key={locale}
              type="button"
              onClick={() => handleSelect(locale)}
              aria-pressed={isSelected}
              className={cn(
                'px-2.5 py-1 rounded-md transition-all',
                isSelected
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {meta.nativeName}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('relative inline-block text-left', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select language"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
      >
        <Languages className="size-3.5 text-primary" aria-hidden="true" />
        <span>{LOCALES_METADATA[currentLocale].nativeName}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <ul
            role="listbox"
            aria-label="Available languages"
            className="absolute right-0 z-50 mt-1 w-36 rounded-lg border border-border bg-popover p-1 shadow-md text-xs text-popover-foreground animate-in fade-in zoom-in-95 duration-100"
          >
            {SUPPORTED_LOCALES.map((locale) => {
              const meta = LOCALES_METADATA[locale]
              const isSelected = currentLocale === locale
              return (
                <li
                  key={locale}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(locale)}
                  className={cn(
                    'flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer select-none transition-colors',
                    isSelected
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'hover:bg-muted text-foreground'
                  )}
                >
                  <div className="flex flex-col">
                    <span>{meta.nativeName}</span>
                    <span className="text-[10px] text-muted-foreground">{meta.name}</span>
                  </div>
                  {isSelected && <Check className="size-3.5 text-primary" />}
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
