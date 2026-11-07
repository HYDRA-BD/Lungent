import type { DuplicateMatchType } from './types'
import { normalizePhoneNumber } from './patient-id'

export interface DuplicateMatchEvaluation {
  isMatch: boolean
  matchScore: number // 0 to 100
  matchType: DuplicateMatchType
  matchReasons: string[]
}

/**
 * Calculates string similarity using Sørensen-Dice coefficient on character bigrams.
 * Returns a value between 0.0 and 1.0.
 */
export function calculateNameSimilarity(str1: string, str2: string): number {
  const s1 = str1.trim().toLowerCase().replace(/^(md\.|mohammed|muhammad|mst\.|mosammat)\s+/i, '')
  const s2 = str2.trim().toLowerCase().replace(/^(md\.|mohammed|muhammad|mst\.|mosammat)\s+/i, '')

  if (s1 === s2) return 1.0
  if (s1.length < 2 || s2.length < 2) return 0.0

  const getBigrams = (str: string) => {
    const bigrams = new Map<string, number>()
    for (let i = 0; i < str.length - 1; i++) {
      const bigram = str.substring(i, i + 2)
      bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1)
    }
    return bigrams
  }

  const bigrams1 = getBigrams(s1)
  const bigrams2 = getBigrams(s2)

  let intersectionSize = 0
  for (const [bigram, count1] of bigrams1.entries()) {
    const count2 = bigrams2.get(bigram)
    if (count2) {
      intersectionSize += Math.min(count1, count2)
    }
  }

  return (2.0 * intersectionSize) / (s1.length - 1 + (s2.length - 1))
}

export interface PatientCandidateCriteria {
  patientId?: string | null
  fullName: string
  dateOfBirth?: string | null
  approximateAge?: number | null
  phoneNumber?: string | null
  nidNumber?: string | null
  addressDivision?: string | null
}

/**
 * Evaluates duplicate probability between two patient identity records.
 */
export function evaluateDuplicateProbability(
  incoming: PatientCandidateCriteria,
  existing: PatientCandidateCriteria
): DuplicateMatchEvaluation {
  const matchReasons: string[] = []
  let score = 0

  // 1. Exact Lungent Patient ID check
  if (
    incoming.patientId &&
    existing.patientId &&
    incoming.patientId.trim().toUpperCase() === existing.patientId.trim().toUpperCase()
  ) {
    return {
      isMatch: true,
      matchScore: 100,
      matchType: 'exact',
      matchReasons: ['Exact Lungent Patient ID match'],
    }
  }

  // 2. Exact National ID (NID) check (if provided on both)
  if (
    incoming.nidNumber &&
    existing.nidNumber &&
    incoming.nidNumber.trim().replace(/\s+/g, '') ===
      existing.nidNumber.trim().replace(/\s+/g, '')
  ) {
    matchReasons.push('Exact National ID (NID) match')
    score += 95
  }

  // 3. Phone Number Comparison
  const incomingPhoneNorm = normalizePhoneNumber(incoming.phoneNumber)
  const existingPhoneNorm = normalizePhoneNumber(existing.phoneNumber)
  const hasPhoneMatch =
    Boolean(incomingPhoneNorm) &&
    Boolean(existingPhoneNorm) &&
    incomingPhoneNorm === existingPhoneNorm

  if (hasPhoneMatch) {
    matchReasons.push('Identical contact phone number')
  }

  // 4. Name Similarity Calculation
  const nameSim = calculateNameSimilarity(incoming.fullName, existing.fullName)
  const isExactName = nameSim >= 0.98
  const isHighNameSim = nameSim >= 0.75

  if (isExactName) {
    matchReasons.push('Identical full name')
  } else if (isHighNameSim) {
    matchReasons.push(`High name similarity (${Math.round(nameSim * 100)}%)`)
  }

  // 5. Age or Date of Birth Comparison
  let hasDobOrAgeMatch = false
  if (incoming.dateOfBirth && existing.dateOfBirth) {
    if (incoming.dateOfBirth === existing.dateOfBirth) {
      matchReasons.push('Identical date of birth')
      hasDobOrAgeMatch = true
    } else {
      const year1 = new Date(incoming.dateOfBirth).getFullYear()
      const year2 = new Date(existing.dateOfBirth).getFullYear()
      if (Math.abs(year1 - year2) <= 1) {
        matchReasons.push('Matching birth year')
        hasDobOrAgeMatch = true
      }
    }
  } else {
    const age1 =
      incoming.approximateAge ??
      (incoming.dateOfBirth
        ? new Date().getFullYear() - new Date(incoming.dateOfBirth).getFullYear()
        : null)
    const age2 =
      existing.approximateAge ??
      (existing.dateOfBirth
        ? new Date().getFullYear() - new Date(existing.dateOfBirth).getFullYear()
        : null)

    if (age1 !== null && age2 !== null && Math.abs(age1 - age2) <= 2) {
      matchReasons.push(`Consistent approximate age (~${age1} vs ~${age2})`)
      hasDobOrAgeMatch = true
    }
  }

  // 6. Geographic Division Comparison
  const hasDivisionMatch =
    Boolean(incoming.addressDivision) &&
    Boolean(existing.addressDivision) &&
    incoming.addressDivision?.toLowerCase() === existing.addressDivision?.toLowerCase()

  if (hasDivisionMatch) {
    matchReasons.push(`Matching residential division (${incoming.addressDivision})`)
  }

  // 7. Aggregate Probability Scoring
  if (score >= 95) {
    // Already set via NID
  } else if (hasPhoneMatch && isExactName) {
    score = 90
  } else if (hasPhoneMatch && isHighNameSim) {
    score = 85
  } else if (isExactName && hasDobOrAgeMatch && hasDivisionMatch) {
    score = 80
  } else if (isHighNameSim && hasDobOrAgeMatch && hasDivisionMatch) {
    score = 70
  } else if (hasPhoneMatch && !isHighNameSim) {
    // Common in Bangladesh for family members to share a single phone number
    score = 45
    matchReasons.push('Note: Shared family phone potential (distinct names)')
  } else if (isExactName && !hasDobOrAgeMatch) {
    // Same common name (e.g. Md. Abdul Karim) but different age/location
    score = 40
    matchReasons.push('Note: Common name occurrence without matching demographics')
  }

  let matchType: DuplicateMatchType = 'moderate_probability'
  if (score >= 95) {
    matchType = 'exact'
  } else if (score >= 75) {
    matchType = 'high_probability'
  } else {
    matchType = 'moderate_probability'
  }

  return {
    isMatch: score >= 50,
    matchScore: score,
    matchType,
    matchReasons,
  }
}

