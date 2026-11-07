import crypto from 'crypto'

/**
 * Unambiguous character set for Lungent Facility IDs:
 * 32 characters, excluding visually ambiguous glyphs:
 * - '0' (zero) and 'O' (uppercase letter O)
 * - '1' (one) and 'I' (uppercase letter I)
 */
const FACILITY_ID_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const SUFFIX_LENGTH = 6

/**
 * Generates a unique, human-readable, collision-resistant Lungent Facility ID.
 * Canonical format: FAC-YYYY-XXXXXX (e.g. FAC-2026-N8K2M7)
 */
export function generateLungentFacilityId(year?: number): string {
  const targetYear = year ?? new Date().getFullYear()
  const randomBytes = crypto.randomBytes(SUFFIX_LENGTH)
  let suffix = ''

  for (let i = 0; i < SUFFIX_LENGTH; i++) {
    const charIndex = randomBytes[i] % FACILITY_ID_ALPHABET.length
    suffix += FACILITY_ID_ALPHABET[charIndex]
  }

  return `FAC-${targetYear}-${suffix}`
}

/**
 * Validates whether a given string conforms to the canonical Lungent Facility ID format.
 */
export function isValidLungentFacilityId(id: string | null | undefined): boolean {
  if (!id || typeof id !== 'string') return false
  const regex = /^FAC-(19\d\d|20\d\d)-[0-9A-Z]{6}$/i
  return regex.test(id.trim())
}
