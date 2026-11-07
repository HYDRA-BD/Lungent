import { describe, it, expect } from 'vitest'
import {
  generateLungentPatientId,
  isValidLungentPatientId,
  normalizePhoneNumber,
  maskPhoneNumber,
  maskNationalId,
} from '@/modules/patients/patient-id'
import {
  calculateNameSimilarity,
  evaluateDuplicateProbability,
} from '@/modules/patients/duplicate-detector'
import {
  createPatientSchema,
  updatePatientSchema,
  searchPatientsSchema,
  reviewDuplicateSchema,
  mergePatientsSchema,
  linkAccountSchema,
  linkAnonymousSelfCheckSchema,
} from '@/modules/patients/validation'

describe('Lungent Patient ID Generation & Validation', () => {
  it('generates IDs in the canonical LGT-YYYY-XXXXXX format', () => {
    const id = generateLungentPatientId()
    const currentYear = new Date().getFullYear()
    expect(id).toMatch(new RegExp(`^LGT-${currentYear}-[2-9A-HJ-NP-Z]{6}$`))
    expect(isValidLungentPatientId(id)).toBe(true)
  })

  it('allows custom year for back-dated or test scenarios', () => {
    const id2025 = generateLungentPatientId(2025)
    expect(id2025.startsWith('LGT-2025-')).toBe(true)
    expect(isValidLungentPatientId(id2025)).toBe(true)
  })

  it('excludes visually ambiguous characters (0, O, 1, I)', () => {
    // Generate 50 IDs and ensure none contain 0, O, 1, I
    for (let i = 0; i < 50; i++) {
      const id = generateLungentPatientId()
      const suffix = id.split('-')[2]
      expect(suffix).not.toMatch(/[01OIoi]/)
    }
  })

  it('produces unique identifiers across multiple generations', () => {
    const set = new Set<string>()
    for (let i = 0; i < 200; i++) {
      set.add(generateLungentPatientId())
    }
    expect(set.size).toBe(200)
  })

  it('validates canonical and rejects invalid ID structures', () => {
    expect(isValidLungentPatientId('LGT-2026-8K2M7P')).toBe(true)
    expect(isValidLungentPatientId('LGT-2024-ABCDEF')).toBe(true)

    // Invalid prefixes
    expect(isValidLungentPatientId('PAT-2026-8K2M7P')).toBe(false)
    expect(isValidLungentPatientId('2026-8K2M7P')).toBe(false)

    // Invalid ambiguous characters (0, O, 1, I)
    expect(isValidLungentPatientId('LGT-2026-8K2M70')).toBe(false)
    expect(isValidLungentPatientId('LGT-2026-8K2M7O')).toBe(false)
    expect(isValidLungentPatientId('LGT-2026-8K2M71')).toBe(false)
    expect(isValidLungentPatientId('LGT-2026-8K2M7I')).toBe(false)

    // Invalid lengths or formats
    expect(isValidLungentPatientId('LGT-2026-8K2M7')).toBe(false)
    expect(isValidLungentPatientId('LGT-26-8K2M7P')).toBe(false)
    expect(isValidLungentPatientId('')).toBe(false)
  })
})

describe('Phone Number Normalization & Privacy Masking', () => {
  it('normalizes various Bangladesh telephone formats to standard 11 digits', () => {
    expect(normalizePhoneNumber('01712345678')).toBe('01712345678')
    expect(normalizePhoneNumber('+8801712345678')).toBe('01712345678')
    expect(normalizePhoneNumber('8801712345678')).toBe('01712345678')
    expect(normalizePhoneNumber('01712-345678')).toBe('01712345678')
    expect(normalizePhoneNumber(' 018 98 765 432 ')).toBe('01898765432')
  })

  it('returns null for empty or invalid phone values', () => {
    expect(normalizePhoneNumber('')).toBe(null)
    expect(normalizePhoneNumber(null)).toBe(null)
    expect(normalizePhoneNumber(undefined)).toBe(null)
    expect(normalizePhoneNumber('123')).toBe(null)
  })

  it('masks middle digits to safeguard personal privacy', () => {
    expect(maskPhoneNumber('01712345678')).toBe('017••••5678')
    expect(maskPhoneNumber('+8801898765432')).toBe('018••••5432')
    expect(maskPhoneNumber(null)).toBe('—')
    expect(maskPhoneNumber(undefined)).toBe('—')
  })

  it('masks national identity numbers retaining only last 4 digits', () => {
    expect(maskNationalId('19842691234567890')).toBe('•••• •••• 7890')
    expect(maskNationalId('1234567890')).toBe('•••• •••• 7890')
    expect(maskNationalId(null)).toBe('—')
  })
})

describe('Algorithmic Duplicate Detection & Name Matching', () => {
  it('computes Dice similarity handling honorific prefixes and transpositions', () => {
    // Exact match
    expect(calculateNameSimilarity('Md. Rafiqul Islam', 'Md. Rafiqul Islam')).toBe(1.0)

    // Prefix variations (Md., Mohammad, etc.)
    const scoreWithPrefix = calculateNameSimilarity('Md. Rafiqul Islam', 'Rafiqul Islam')
    expect(scoreWithPrefix).toBeGreaterThan(0.7)

    // Mst / Most / Begum variations
    const scoreFemale = calculateNameSimilarity('Mst. Nasima Begum', 'Nasima Begum')
    expect(scoreFemale).toBeGreaterThan(0.7)

    // Minor typo / single character variation
    const typoScore = calculateNameSimilarity('Farhana Ahmed', 'Farhana Ahmad')
    expect(typoScore).toBeGreaterThan(0.8)

    // Completely distinct names
    const distinctScore = calculateNameSimilarity('Abdul Karim', 'Sultana Razia')
    expect(distinctScore).toBeLessThan(0.3)
  })

  it('evaluates duplicate probability: Exact Patient ID match (100%)', () => {
    const candidate = {
      patientId: 'LGT-2026-8K2M7P',
      fullName: 'Different Name',
      phoneNumber: '01700000000',
    }
    const existing = {
      patientId: 'LGT-2026-8K2M7P',
      fullName: 'Rafiqul Islam',
      phoneNumber: '01712345678',
    }

    const result = evaluateDuplicateProbability(candidate, existing)
    expect(result.isMatch).toBe(true)
    expect(result.matchScore).toBe(100)
    expect(result.matchType).toBe('exact')
  })

  it('evaluates duplicate probability: Same Phone + High Name Similarity (>=85%)', () => {
    const candidate = {
      fullName: 'Rafiqul Islam',
      phoneNumber: '01712345678',
      approximateAge: 58,
    }
    const existing = {
      fullName: 'Md. Rafiqul Islam',
      phoneNumber: '+8801712345678',
      approximateAge: 58,
      addressDivision: 'Dhaka',
    }

    const result = evaluateDuplicateProbability(candidate, existing)
    expect(result.isMatch).toBe(true)
    expect(result.matchScore).toBeGreaterThanOrEqual(85)
    expect(result.matchType).toBe('high_probability')
  })

  it('evaluates duplicate probability: Shared family phone with different names', () => {
    // In Bangladesh, family members often share a single mobile number
    const candidate = {
      fullName: 'Fatema Islam',
      phoneNumber: '01712345678',
      gender: 'female' as const,
      approximateAge: 25,
    }
    const existing = {
      fullName: 'Md. Rafiqul Islam',
      phoneNumber: '01712345678',
      gender: 'male' as const,
      approximateAge: 58,
    }

    const result = evaluateDuplicateProbability(candidate, existing)
    // Shared phone contributes some score, but different name/gender/age keeps it moderate/low
    expect(result.matchScore).toBeLessThan(70)
  })
})

describe('Patient Zod Validation Schemas', () => {
  it('validates a complete and correct patient registration payload', () => {
    const validData = {
      fullName: 'Ayesha Rahman',
      dateOfBirth: '1982-05-15',
      approximateAge: 44,
      gender: 'female' as const,
      phoneNumber: '01712345678',
      email: 'ayesha.rahman@example.com',
      nidNumber: '19822691234567890',
      addressDivision: 'Dhaka',
      addressDistrict: 'Dhaka',
      preferredLanguage: 'bn' as const,
      verificationSource: 'community_intake' as const,
    }

    const parsed = createPatientSchema.safeParse(validData)
    expect(parsed.success).toBe(true)
  })

  it('permits approximate age without exact DOB for community intake', () => {
    const dataWithoutDob = {
      fullName: 'Abdul Karim',
      dateOfBirth: null,
      approximateAge: 62,
      gender: 'male' as const,
      phoneNumber: '01811223344',
      preferredLanguage: 'en' as const,
    }

    const parsed = createPatientSchema.safeParse(dataWithoutDob)
    expect(parsed.success).toBe(true)
  })

  it('rejects registration if neither DOB nor approximate age is provided', () => {
    const invalidData = {
      fullName: 'Kazi Nazrul',
      dateOfBirth: null,
      approximateAge: null,
      gender: 'male' as const,
      phoneNumber: '01711223344',
    }

    const parsed = createPatientSchema.safeParse(invalidData)
    expect(parsed.success).toBe(false)
  })

  it('rejects future date of birth', () => {
    const futureData = {
      fullName: 'Future Person',
      dateOfBirth: '2099-01-01',
      gender: 'female' as const,
    }

    const parsed = createPatientSchema.safeParse(futureData)
    expect(parsed.success).toBe(false)
  })

  it('validates update patient schema with partial fields', () => {
    const updateData = {
      phoneNumber: '01912345678',
      addressDivision: 'Chattogram',
      emergencyContactName: 'Kamal Hossain',
      emergencyContactPhone: '01999887766',
    }

    const parsed = updatePatientSchema.safeParse(updateData)
    expect(parsed.success).toBe(true)
  })

  it('validates duplicate candidate review schema and enforces justification length', () => {
    const validReview = {
      candidateId: '11111111-1111-4111-a111-111111111111',
      decision: 'dismissed_distinct' as const,
      justification: 'Verified identity cards: patients are distinct brothers residing at same address.',
    }

    expect(reviewDuplicateSchema.safeParse(validReview).success).toBe(true)

    const shortJustification = {
      candidateId: '11111111-1111-4111-a111-111111111111',
      decision: 'dismissed_distinct' as const,
      justification: 'Too short',
    }

    expect(reviewDuplicateSchema.safeParse(shortJustification).success).toBe(false)
  })

  it('validates search patients schema with pagination defaults', () => {
    const defaultSearch = searchPatientsSchema.parse({})
    expect(defaultSearch.limit).toBe(20)
    expect(defaultSearch.offset).toBe(0)

    const querySearch = searchPatientsSchema.parse({
      query: 'Rafiqul',
      division: 'Dhaka',
      limit: 50,
      offset: 10,
    })
    expect(querySearch.query).toBe('Rafiqul')
    expect(querySearch.division).toBe('Dhaka')
    expect(querySearch.limit).toBe(50)
  })

  it('validates account link schema with valid user profile ID', () => {
    const validLink = {
      patientId: '11111111-1111-4111-a111-111111111111',
      userProfileId: '22222222-2222-4222-a222-222222222222',
      verificationMethod: 'admin_link' as const,
    }

    expect(linkAccountSchema.safeParse(validLink).success).toBe(true)

    const invalidLink = {
      patientId: 'invalid-id',
      userProfileId: '22222222-2222-4222-a222-222222222222',
      verificationMethod: 'admin_link' as const,
    }

    expect(linkAccountSchema.safeParse(invalidLink).success).toBe(false)
  })

  it('validates merge schema and prevents merging a patient into itself', () => {
    const samePatientMerge = {
      survivingPatientId: '11111111-1111-4111-a111-111111111111',
      retiredPatientId: '11111111-1111-4111-a111-111111111111',
      reason: 'Controlled merge of duplicate registration',
    }

    const res = mergePatientsSchema.safeParse(samePatientMerge)
    expect(res.success).toBe(false)

    const validMerge = {
      survivingPatientId: '11111111-1111-4111-a111-111111111111',
      retiredPatientId: '22222222-2222-4222-a222-222222222222',
      reason: 'Confirmed identical patient duplicate registered at outreach camp.',
    }

    expect(mergePatientsSchema.safeParse(validMerge).success).toBe(true)
  })

  it('enforces explicit consent when linking anonymous self-checks', () => {
    const withoutConsent = {
      patientId: '11111111-1111-4111-a111-111111111111',
      explicitConsentGiven: false,
      consentStatement: 'I give consent to attach my survey.',
    }

    expect(linkAnonymousSelfCheckSchema.safeParse(withoutConsent).success).toBe(false)

    const withConsent = {
      patientId: '11111111-1111-4111-a111-111111111111',
      explicitConsentGiven: true,
      consentStatement: 'Patient explicitly confirmed in clinic to attach anonymous survey.',
    }

    expect(linkAnonymousSelfCheckSchema.safeParse(withConsent).success).toBe(true)
  })
})
