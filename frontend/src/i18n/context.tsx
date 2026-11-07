'use client'

import React, { createContext, useContext, useEffect } from 'react'
import type { SupportedLocale } from './config'
import { DEFAULT_LOCALE } from './config'
import { en, type TranslationKeys } from './translations/en'

interface LanguageContextType {
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
  dict: TranslationKeys
  t: (path: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const COOKIE_NAME = 'lungent_locale'

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale: SupportedLocale = 'en'
  const setLocale = (_newLocale: SupportedLocale) => {
    // Hardcoded to English per institutional requirements
  }

  // Ensure client DOM and storage are locked to English
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = 'en'
      try {
        localStorage.setItem(COOKIE_NAME, 'en')
        document.cookie = `${COOKIE_NAME}=en; path=/; max-age=31536000; SameSite=Lax`
      } catch {
        // Ignore storage exceptions
      }
    }
  }, [])

  const currentDict = en

  // Helper function to resolve nested keys like 'nav.home' or 'home.heroTitle'
  const t = (path: string): string => {
    const parts = path.split('.')
    let current: unknown = currentDict

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = (current as Record<string, unknown>)[part]
      } else {
        return path
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
      dict: en,
      t: (path: string) => path,
    }
  }
  return context
}

export function useLocale() {
  const { locale, setLocale } = useLanguage()
  return { locale, setLocale }
}
