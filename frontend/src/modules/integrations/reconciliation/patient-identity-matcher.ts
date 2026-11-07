/**
 * Phase 2.9: Patient Identity Matching & Master Patient Index (MPI) Reconciler
 * Deterministic and probabilistic candidate matching across disparate health systems
 * with strict identifier isolation (never overwriting Lungent internal UUID).
 */

import type { PatientIdentityMatchCandidate } from '../types'

export interface KnownPatientIdentityRecord {
  id: string
  fullName: string
  dateOfBirth?: string
  gender: string
  district: string
  nationalIdHash?: string
  externalMrn?: string
}

export interface InboundPatientQuery {
  fullName: string
  dateOfBirth?: string
  gender?: string
  district?: string
  nationalIdHash?: string
  externalMrn?: string
}

/**
 * Normalized string comparison helper
 */
function normalizeString(val: string): string {
  return val
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
}

/**
 * Token-based Jaccard similarity and character Levenshtein similarity for names
 */
export function computeNameSimilarity(nameA: string, nameB: string): number {
  const normA = normalizeString(nameA)
  const normB = normalizeString(nameB)

  if (normA === normB) return 1.0
  if (!normA || !normB) return 0.0

  const tokensA = new Set(normA.split(' '))
  const tokensB = new Set(normB.split(' '))

  let intersection = 0
  for (const t of tokensA) {
    if (tokensB.has(t)) intersection++
  }

  const union = new Set([...tokensA, ...tokensB]).size
  const jaccard = union > 0 ? intersection / union : 0.0

  // Levenshtein distance
  const m = normA.length
  const n = normB.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (normA[i - 1] === normB[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }

  const levDistance = dp[m][n]
  const levRatio = 1 - levDistance / Math.max(m, n)

  return Math.max(jaccard, levRatio)
}

/**
 * Date of birth match score
 */
function computeDobScore(dobA?: string, dobB?: string): { score: number; matchCriterion?: string } {
  if (!dobA || !dobB) return { score: 0.5 } // Neutral when unknown
  const cleanA = dobA.substring(0, 10)
  const cleanB = dobB.substring(0, 10)

  if (cleanA === cleanB) {
    return { score: 1.0, matchCriterion: 'DOB_EXACT' }
  }

  // Same year match
  if (cleanA.substring(0, 4) === cleanB.substring(0, 4)) {
    return { score: 0.5, matchCriterion: 'DOB_YEAR_ONLY' }
  }

  return { score: 0.0 }
}

/**
 * Gender match score
 */
function computeGenderScore(gA: string, gB?: string): { score: number; matchCriterion?: string } {
  if (!gB) return { score: 0.5 }
  const normA = gA.trim().toUpperCase()[0]
  const normB = gB.trim().toUpperCase()[0]

  if (normA === normB) {
    return { score: 1.0, matchCriterion: 'GENDER_MATCH' }
  }
  return { score: 0.0 }
}

/**
 * District match score
 */
function computeDistrictScore(dA: string, dB?: string): { score: number; matchCriterion?: string } {
  if (!dB) return { score: 0.5 }
  const normA = normalizeString(dA)
  const normB = normalizeString(dB)

  if (normA === normB) {
    return { score: 1.0, matchCriterion: 'DISTRICT_EXACT' }
  }
  return { score: 0.0 }
}

/**
 * Matches an inbound identity query against a registry of known Lungent patients
 */
export function matchPatientIdentity(
  inbound: InboundPatientQuery,
  knownPatients: KnownPatientIdentityRecord[]
): PatientIdentityMatchCandidate[] {
  const candidates: PatientIdentityMatchCandidate[] = []

  for (const patient of knownPatients) {
    const matchingCriteria: string[] = []

    // 1. Deterministic Match: Verified National ID hash
    if (inbound.nationalIdHash && patient.nationalIdHash && inbound.nationalIdHash === patient.nationalIdHash) {
      candidates.push({
        patientId: patient.id,
        lungentPatientId: patient.id,
        fullName: patient.fullName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        district: patient.district,
        matchConfidenceScore: 1.0,
        matchClassification: 'exact_match',
        matchingCriteria: ['DETERMINISTIC_NATIONAL_ID_HASH_MATCH'],
      })
      continue
    }

    // 2. Deterministic Match: Verified External MRN
    if (inbound.externalMrn && patient.externalMrn && inbound.externalMrn === patient.externalMrn) {
      candidates.push({
        patientId: patient.id,
        lungentPatientId: patient.id,
        fullName: patient.fullName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        district: patient.district,
        matchConfidenceScore: 0.98,
        matchClassification: 'exact_match',
        matchingCriteria: ['DETERMINISTIC_EXTERNAL_MRN_MATCH'],
      })
      continue
    }

    // 3. Probabilistic Weighted Score
    // Weights: Name 0.35, DOB 0.30, Gender 0.15, District 0.20
    const nameScore = computeNameSimilarity(patient.fullName, inbound.fullName)
    if (nameScore >= 0.8) matchingCriteria.push('NAME_STRONG_SIMILARITY')
    else if (nameScore >= 0.5) matchingCriteria.push('NAME_PARTIAL_SIMILARITY')

    const dobResult = computeDobScore(patient.dateOfBirth, inbound.dateOfBirth)
    if (dobResult.matchCriterion) matchingCriteria.push(dobResult.matchCriterion)

    const genderResult = computeGenderScore(patient.gender, inbound.gender)
    if (genderResult.matchCriterion) matchingCriteria.push(genderResult.matchCriterion)

    const districtResult = computeDistrictScore(patient.district, inbound.district)
    if (districtResult.matchCriterion) matchingCriteria.push(districtResult.matchCriterion)

    const compositeScore = Number(
      (
        nameScore * 0.35 +
        dobResult.score * 0.30 +
        genderResult.score * 0.15 +
        districtResult.score * 0.20
      ).toFixed(2)
    )

    let matchClassification: PatientIdentityMatchCandidate['matchClassification']
    if (compositeScore >= 0.88) {
      matchClassification = 'exact_match'
    } else if (compositeScore >= 0.75) {
      matchClassification = 'probable_match'
    } else if (compositeScore >= 0.55) {
      matchClassification = 'ambiguous_conflict'
    } else {
      matchClassification = 'unmatched'
    }

    if (compositeScore >= 0.40) {
      candidates.push({
        patientId: patient.id,
        lungentPatientId: patient.id,
        fullName: patient.fullName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        district: patient.district,
        matchConfidenceScore: compositeScore,
        matchClassification,
        matchingCriteria,
      })
    }
  }

  // Sort descending by score
  return candidates.sort((a, b) => b.matchConfidenceScore - a.matchConfidenceScore)
}
