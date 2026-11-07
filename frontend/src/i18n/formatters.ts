/**
 * Phase 1.20: Locale-Aware Formatting Utilities
 *
 * Implements bilingual formatting for dates, times, numbers, currencies (BDT),
 * percentages, pack-years, and medical measurements.
 * Preserves canonical machine-readable identifiers (e.g., LGT-..., REF-...).
 */

import type { SupportedLocale } from './config'

const BANGLA_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'] as const
const ENGLISH_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const

/**
 * Converts ASCII digits (0-9) to Bengali digits (০-৯).
 */
export function toBanglaDigits(input: string | number): string {
  const str = String(input)
  return str.replace(/[0-9]/g, (char) => BANGLA_DIGITS[Number(char)])
}

/**
 * Converts Bengali digits (০-৯) to ASCII digits (0-9).
 */
export function toEnglishDigits(input: string): string {
  let result = input
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(BANGLA_DIGITS[i], 'g'), ENGLISH_DIGITS[i])
  }
  return result
}

/**
 * Formats numbers according to locale conventions.
 */
export function formatNumber(
  value: number,
  locale: SupportedLocale = 'en',
  options?: Intl.NumberFormatOptions
): string {
  if (isNaN(value)) return locale === 'bn' ? 'অপ্রযোজ্য' : 'N/A'

  if (locale === 'bn') {
    const formatted = new Intl.NumberFormat('en-US', options).format(value)
    return toBanglaDigits(formatted)
  }

  return new Intl.NumberFormat('en-US', options).format(value)
}

/**
 * Formats a calendar date according to locale.
 */
export function formatDate(
  date: Date | string | number,
  locale: SupportedLocale = 'en',
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    if (isNaN(d.getTime())) return locale === 'bn' ? 'তারিখ অনুপলব্ধ' : 'Date Unavailable'

    const defaultOpts: Intl.DateTimeFormatOptions = options || {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }

    if (locale === 'bn') {
      const formatted = new Intl.DateTimeFormat('bn-BD', defaultOpts).format(d)
      return formatted
    }

    return new Intl.DateTimeFormat('en-US', defaultOpts).format(d)
  } catch {
    return String(date)
  }
}

/**
 * Formats time according to locale.
 */
export function formatTime(
  date: Date | string | number,
  locale: SupportedLocale = 'en',
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    if (isNaN(d.getTime())) return locale === 'bn' ? 'সময় অনুপলব্ধ' : 'Time Unavailable'

    const defaultOpts: Intl.DateTimeFormatOptions = options || {
      hour: '2-digit',
      minute: '2-digit',
    }

    if (locale === 'bn') {
      return new Intl.DateTimeFormat('bn-BD', defaultOpts).format(d)
    }

    return new Intl.DateTimeFormat('en-US', defaultOpts).format(d)
  } catch {
    return String(date)
  }
}

/**
 * Formats full timestamp (date + time).
 */
export function formatDateTime(
  date: Date | string | number,
  locale: SupportedLocale = 'en'
): string {
  const d = formatDate(date, locale)
  const t = formatTime(date, locale)
  return locale === 'bn' ? `${d}, ${t}` : `${d} at ${t}`
}

/**
 * Formats a date range.
 */
export function formatDateRange(
  start: Date | string,
  end: Date | string,
  locale: SupportedLocale = 'en'
): string {
  const s = formatDate(start, locale)
  const e = formatDate(end, locale)
  return locale === 'bn' ? `${s} হতে ${e}` : `${s} to ${e}`
}

/**
 * Formats relative time (e.g. "3 days ago" / "৩ দিন আগে").
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale: SupportedLocale = 'en',
  referenceDate: Date = new Date()
): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  const diffMs = referenceDate.getTime() - d.getTime()
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHour = Math.round(diffMin / 60)
  const diffDays = Math.round(diffHour / 24)

  if (locale === 'bn') {
    if (diffSec < 60) return 'এইমাত্র'
    if (diffMin < 60) return `${toBanglaDigits(diffMin)} মিনিট আগে`
    if (diffHour < 24) return `${toBanglaDigits(diffHour)} ঘণ্টা আগে`
    if (diffDays === 1) return 'গতকাল'
    if (diffDays < 30) return `${toBanglaDigits(diffDays)} দিন আগে`
    const months = Math.round(diffDays / 30)
    if (months < 12) return `${toBanglaDigits(months)} মাস আগে`
    const years = Math.round(diffDays / 365)
    return `${toBanglaDigits(years)} বছর আগে`
  }

  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 30) return `${diffDays}d ago`
  const months = Math.round(diffDays / 30)
  if (months < 12) return `${months}mo ago`
  const years = Math.round(diffDays / 365)
  return `${years}y ago`
}

/**
 * Formats percentages with configurable decimals.
 */
export function formatPercentage(
  value: number,
  locale: SupportedLocale = 'en',
  decimals: number = 1
): string {
  const numStr = value.toFixed(decimals)
  if (locale === 'bn') {
    return `${toBanglaDigits(numStr)}%`
  }
  return `${numStr}%`
}

/**
 * Formats currency (defaults to Bangladesh Taka BDT ৳).
 */
export function formatCurrency(
  amount: number,
  locale: SupportedLocale = 'en',
  currency: string = 'BDT'
): string {
  const symbol = currency === 'BDT' ? '৳' : currency
  const formatted = formatNumber(amount, locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

  if (locale === 'bn') {
    return `${symbol} ${formatted}`
  }
  return `${symbol} ${formatted}`
}

/**
 * Formats smoking exposure pack-years.
 */
export function formatPackYears(
  packYears: number,
  locale: SupportedLocale = 'en'
): string {
  const formatted = formatNumber(packYears, locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
  if (locale === 'bn') {
    return `${formatted} প্যাক-বছর`
  }
  return `${formatted} pack-years`
}

/**
 * Formats clinical measurements (mm, km, µg/m³).
 */
export function formatMeasurement(
  value: number,
  unit: string,
  locale: SupportedLocale = 'en',
  decimals: number = 1
): string {
  const formatted = formatNumber(value, locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })

  const unitMap: Record<string, { en: string; bn: string }> = {
    mm: { en: 'mm', bn: 'মিমি' },
    cm: { en: 'cm', bn: 'সেমি' },
    km: { en: 'km', bn: 'কিমি' },
    celsius: { en: '°C', bn: '°সে' },
    aqi: { en: 'AQI', bn: 'একিউআই' },
    ugm3: { en: 'µg/m³', bn: 'মাইক্রোগ্রাম/মি³' },
    years: { en: 'years', bn: 'বছর' },
    days: { en: 'days', bn: 'দিন' },
  }

  const localizedUnit = unitMap[unit]
    ? locale === 'bn'
      ? unitMap[unit].bn
      : unitMap[unit].en
    : unit

  return `${formatted} ${localizedUnit}`
}

/**
 * Explicitly preserves canonical alphanumeric machine identifiers
 * (e.g. LGT-2026-8K2M7P, REF-2026-9K2L4P, session tokens, UUIDs)
 * preventing database lookup failures and cross-system interoperability bugs.
 */
export function preserveCanonicalIdentifier(identifier: string): string {
  if (!identifier) return ''
  return String(identifier).trim()
}
