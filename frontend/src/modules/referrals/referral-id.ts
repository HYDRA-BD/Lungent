/**
 * Phase 1.18: Canonical Referral Identifier Generator
 * Format: REF-YYYY-XXXXXX (e.g. REF-2026-8K2L4P)
 */

import { randomBytes } from 'crypto'

const CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' // Excludes 0, O, 1, I to prevent human transcription errors

export function generateCanonicalReferralId(year: number = new Date().getFullYear()): string {
  const bytes = randomBytes(6)
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += CHARSET[bytes[i] % CHARSET.length]
  }
  return `REF-${year}-${code}`
}

export function isValidReferralId(id: string): boolean {
  return /^REF-\d{4}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/.test(id)
}

