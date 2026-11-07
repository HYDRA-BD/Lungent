/**
 * General application utility functions for formatting and transformations.
 * Enhanced in Phase 1.20 with locale-aware formatters.
 */

export * from '@/i18n/formatters'

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}
