'use client'

import React, { createContext, useContext, useSyncExternalStore } from 'react'
import type { SupportedLocale } from './config'
import { DEFAULT_LOCALE, isSupportedLocale } from './config'
import { en, type TranslationKeys } from './translations/en'
import { bn } from './translations/bn'
import { setLocalePreferenceAction } from './actions'

interface LanguageContextType {
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
  dict: TranslationKeys
  t: (path: string) => string
}

const dictionaries: Record<SupportedLocale, TranslationKeys> = {
  en,
  bn,
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const COOKIE_NAME = 'lungent_locale'

function getInitialLocale(): SupportedLocale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE

  // 1. Check Cookie
  const match = document.cookie.match(new RegExp(`(^| )${COOKIE_NAME}=([^;]+)`))
  if (match && match[2] && isSupportedLocale(match[2])) {
    return match[2] as SupportedLocale
  }

  // 2. Check localStorage
  const saved = localStorage.getItem(COOKIE_NAME)
  if (saved && isSupportedLocale(saved)) {
    return saved as SupportedLocale
  }

  return DEFAULT_LOCALE
}

const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

function subscribe(callback: () => void) {
  listeners.add(callback)
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', callback)
  }
  return () => {
    listeners.delete(callback)
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', callback)
    }
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(
    subscribe,
    getInitialLocale,
    () => DEFAULT_LOCALE
  )

  const setLocale = (newLocale: SupportedLocale) => {
    if (!isSupportedLocale(newLocale)) return

    if (typeof window !== 'undefined') {
      document.cookie = `${COOKIE_NAME}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`
      localStorage.setItem(COOKIE_NAME, newLocale)
      document.documentElement.lang = newLocale
      notifyListeners()
      setLocalePreferenceAction(newLocale).catch(() => {})
    }
  }

  const currentDict = dictionaries[locale] || dictionaries.en

  // Helper function to resolve nested keys like 'nav.home' or 'home.heroTitle'
  const t = (path: string): string => {
    const parts = path.split('.')
    let current: unknown = currentDict

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = (current as Record<string, unknown>)[part]
      } else {
        // Fallback to English dictionary if key not found in current locale
        let fallback: unknown = dictionaries.en
        for (const p of parts) {
          if (fallback && typeof fallback === 'object' && p in fallback) {
            fallback = (fallback as Record<string, unknown>)[p]
          } else {
            return path
          }
        }
        return typeof fallback === 'string' ? fallback : path
      }
    }

    return typeof current === 'string' ? current : path
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, dict: currentDict, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext)
  if (!context) {
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      dict: dictionaries.en,
      t: (path: string) => path,
    }
  }
  return context
}

export function useLocale() {
  const { locale, setLocale } = useLanguage()
  return { locale, setLocale }
}
