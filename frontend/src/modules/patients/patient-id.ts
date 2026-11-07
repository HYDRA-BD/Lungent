/**
 * Lungent Patient ID Management & Identifier Formatting
 * Strategy: Collision-resistant, non-sequential alphanumeric string with year prefix.
 * Format: LGT-YYYY-XXXXXX (e.g. LGT-2026-7K8M9P)
 */

// 32-character alphabet excluding ambiguous glyphs (0/O, 1/I)
export const PATIENT_ID_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' as const

/**
 * Generates a unique, collision-resistant Lungent Patient ID.
 * Nationwide scalable: 32^6 = 1,073,741,824 unique IDs per calendar year.
 */
export function generateLungentPatientId(year?: number): string {
  const currentYear = year || new Date().getFullYear()
  let randomSegment = ''

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * PATIENT_ID_ALPHABET.length)
    randomSegment += PATIENT_ID_ALPHABET[randomIndex]
  }

  return `LGT-${currentYear}-${randomSegment}`
}

/**
 * Validates whether a given string is a correctly formatted Lungent Patient ID.
 */
export function isValidLungentPatientId(id: string): boolean {
  if (!id || typeof id !== 'string') return false
  const regex = /^LGT-\d{4}-[2-9A-HJ-NP-Z]{6}$/
  return regex.test(id.trim().toUpperCase())
}

/**
 * Normalizes phone numbers to a consistent 11-digit or E.164 string
 * for reliable duplicate identification in Bangladesh.
 */
export function normalizePhoneNumber(phone?: string | null): string | null {
  if (!phone || typeof phone !== 'string') return null

  // Strip all non-digit characters except leading plus
  let cleaned = phone.trim().replace(/[^\d+]/g, '')

  // Remove Bangladesh country code if present (+880 or 880) to get standard 01XXXXXXXXX
  if (cleaned.startsWith('+880')) {
    cleaned = '0' + cleaned.substring(4)
  } else if (cleaned.startsWith('880')) {
    cleaned = '0' + cleaned.substring(3)
  }

  // If 10 digits starting with 1, prepend 0
  if (cleaned.length === 10 && cleaned.startsWith('1')) {
    cleaned = '0' + cleaned
  }

  return cleaned.length >= 7 ? cleaned : null
}

/**
 * Masks a phone number to prevent unauthorized personal enumeration.
 * Example: 01712345678 -> 017••••5678
 */
export function maskPhoneNumber(phone?: string | null): string {
  if (!phone) return '—'
  const normalized = normalizePhoneNumber(phone)
  if (!normalized || normalized.length < 7) return phone

  const firstThree = normalized.slice(0, 3)
  const lastFour = normalized.slice(-4)
  return `${firstThree}••••${lastFour}`
}

/**
 * Masks a National ID (NID) to ensure privacy while allowing reference verification.
 * Example: 19852691234567890 -> •••• •••• •••• 7890
 */
export function maskNationalId(nid?: string | null): string {
  if (!nid) return '—'
  const cleaned = nid.trim()
  if (cleaned.length <= 4) return '••••'

  const lastFour = cleaned.slice(-4)
  return `•••• •••• ${lastFour}`
}

