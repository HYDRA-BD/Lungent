import type { SupportedLocale } from '@/types'
export type { SupportedLocale }

export const SUPPORTED_LOCALES: readonly SupportedLocale[] = ['en'] as const
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
    code: 'en' as SupportedLocale,
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
  },
}

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return locale === 'en'
}
