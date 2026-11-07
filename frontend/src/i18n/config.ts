import type { SupportedLocale } from '@/types'
export type { SupportedLocale }

export const SUPPORTED_LOCALES: readonly SupportedLocale[] = ['en', 'bn'] as const
export const DEFAULT_LOCALE: SupportedLocale = 'en'

export interface LocaleMetadata {
  code: SupportedLocale
  name: string
  nativeName: string
  direction: 'ltr' | 'rtl'
}

export const LOCALES_METADATA: Record<SupportedLocale, LocaleMetadata> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
  },
  bn: {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    direction: 'ltr',
  },
}

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale)
}
