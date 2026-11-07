import { describe, it, expect } from 'vitest'
import { en } from '@/i18n/translations/en'
import { bn } from '@/i18n/translations/bn'
import {
  toBanglaDigits,
  toEnglishDigits,
  formatNumber,
  formatDate,
  formatTime,
  formatDateTime,
  formatDateRange,
  formatRelativeTime,
  formatPercentage,
  formatCurrency,
  formatPackYears,
  formatMeasurement,
  preserveCanonicalIdentifier,
} from '@/i18n/formatters'
import {
  getClinicalTerm,
  getClinicalConceptsByCategory,
  validateClinicalTerminology,
} from '@/i18n/clinical-terminology'
import {
  generateAssessmentReportHtml,
  generateReferralLetterHtml,
} from '@/modules/reporting/document-templates'

describe('Bangla and English Localization Architecture (Phase 1.20)', () => {
  describe('1. Dictionary Completeness & Key Parity', () => {
    function compareObjectKeys(enObj: Record<string, unknown>, bnObj: Record<string, unknown>, path = ''): string[] {
      const missingKeys: string[] = []
      for (const key of Object.keys(enObj)) {
        const currentPath = path ? `${path}.${key}` : key
        if (!(key in bnObj)) {
          missingKeys.push(currentPath)
        } else if (
          typeof enObj[key] === 'object' &&
          enObj[key] !== null &&
          typeof bnObj[key] === 'object' &&
          bnObj[key] !== null
        ) {
          missingKeys.push(
            ...compareObjectKeys(
              enObj[key] as Record<string, unknown>,
              bnObj[key] as Record<string, unknown>,
              currentPath
            )
          )
        }
      }
      return missingKeys
    }

    it('guarantees 100% key parity between English and Bangla dictionaries', () => {
      const missingInBangla = compareObjectKeys(
        en as unknown as Record<string, unknown>,
        bn as unknown as Record<string, unknown>
      )
      expect(missingInBangla).toEqual([])
    })

    it('contains comprehensive translation namespaces across public, auth, patient, clinical, worker, and admin', () => {
      expect(en.nav).toBeDefined()
      expect(bn.nav).toBeDefined()
      expect(en.common).toBeDefined()
      expect(bn.common).toBeDefined()
      expect(en.auth).toBeDefined()
      expect(bn.auth).toBeDefined()
      expect(en.patientPortal).toBeDefined()
      expect(bn.patientPortal).toBeDefined()
      expect(en.workerWorkspace).toBeDefined()
      expect(bn.workerWorkspace).toBeDefined()
      expect(en.clinicalWorkspace).toBeDefined()
      expect(bn.clinicalWorkspace).toBeDefined()
      expect(en.adminWorkspace).toBeDefined()
      expect(bn.adminWorkspace).toBeDefined()
      expect(en.clinicalTerminology).toBeDefined()
      expect(bn.clinicalTerminology).toBeDefined()
      expect(en.reports).toBeDefined()
      expect(bn.reports).toBeDefined()
    })
  })

  describe('2. Locale-Aware Formatting Utilities', () => {
    it('converts ASCII digits to Bengali digits and vice-versa', () => {
      expect(toBanglaDigits(1234567890)).toBe('১২৩৪৫৬৭৮৯০')
      expect(toBanglaDigits('2026-11-06')).toBe('২০২৬-১১-০৬')
      expect(toEnglishDigits('১২৩৪৫৬৭৮৯০')).toBe('1234567890')
      expect(toEnglishDigits('২০২৬-১১-০৬')).toBe('2026-11-06')
    })

    it('formats numbers with correct script and grouping', () => {
      expect(formatNumber(1500, 'en')).toBe('1,500')
      expect(formatNumber(1500, 'bn')).toBe('১,৫০০')
      expect(formatNumber(25.5, 'bn')).toBe('২৫.৫')
    })

    it('formats dates in English and Bangla', () => {
      const testDate = new Date('2026-11-15T10:00:00Z')
      const enDate = formatDate(testDate, 'en')
      const bnDate = formatDate(testDate, 'bn')
      expect(enDate).toContain('2026')
      expect(bnDate).toBeDefined()
      expect(bnDate.length).toBeGreaterThan(0)
    })

    it('formats time and datetime appropriately', () => {
      const testDate = new Date('2026-11-15T14:30:00Z')
      const enTime = formatTime(testDate, 'en')
      const bnTime = formatTime(testDate, 'bn')
      expect(enTime).toBeDefined()
      expect(bnTime).toBeDefined()

      const enDateTime = formatDateTime(testDate, 'en')
      const bnDateTime = formatDateTime(testDate, 'bn')
      expect(enDateTime).toContain('at')
      expect(bnDateTime).toContain(',')
    })

    it('formats date ranges', () => {
      const start = '2026-11-01'
      const end = '2026-11-15'
      expect(formatDateRange(start, end, 'en')).toContain('to')
      expect(formatDateRange(start, end, 'bn')).toContain('হতে')
    })

    it('formats relative times in English and Bangla', () => {
      const now = new Date('2026-11-06T12:00:00Z')
      const twoHoursAgo = new Date('2026-11-06T10:00:00Z')
      const fiveDaysAgo = new Date('2026-11-01T12:00:00Z')

      expect(formatRelativeTime(twoHoursAgo, 'en', now)).toBe('2h ago')
      expect(formatRelativeTime(twoHoursAgo, 'bn', now)).toBe('২ ঘণ্টা আগে')

      expect(formatRelativeTime(fiveDaysAgo, 'en', now)).toBe('5d ago')
      expect(formatRelativeTime(fiveDaysAgo, 'bn', now)).toBe('৫ দিন আগে')
    })

    it('formats percentages and currency (BDT ৳)', () => {
      expect(formatPercentage(85.5, 'en')).toBe('85.5%')
      expect(formatPercentage(85.5, 'bn')).toBe('৮৫.৫%')

      expect(formatCurrency(1500, 'en')).toBe('৳ 1,500')
      expect(formatCurrency(1500, 'bn')).toBe('৳ ১,৫০০')
    })

    it('formats pack-years and clinical measurements', () => {
      expect(formatPackYears(30, 'en')).toBe('30.0 pack-years')
      expect(formatPackYears(30, 'bn')).toBe('৩০.০ প্যাক-বছর')

      expect(formatMeasurement(12, 'mm', 'en')).toBe('12 mm')
      expect(formatMeasurement(12, 'mm', 'bn')).toBe('১২ মিমি')

      expect(formatMeasurement(15, 'km', 'en')).toBe('15 km')
      expect(formatMeasurement(15, 'km', 'bn')).toBe('১৫ কিমি')
    })

    it('preserves canonical machine identifiers without numeric transmutation', () => {
      const patientId = 'LGT-2026-8K2M7P'
      const referralId = 'REF-2026-9K2L4P'
      const uuid = '11111111-1111-4111-a111-111111111111'

      expect(preserveCanonicalIdentifier(patientId)).toBe('LGT-2026-8K2M7P')
      expect(preserveCanonicalIdentifier(referralId)).toBe('REF-2026-9K2L4P')
      expect(preserveCanonicalIdentifier(uuid)).toBe('11111111-1111-4111-a111-111111111111')
    })
  })

  describe('3. Standardized Clinical Terminology System', () => {
    it('distinguishes patient-friendly terms from clinician-professional terms', () => {
      const patientEn = getClinicalTerm('hemoptysis', 'patient', 'en')
      const clinicianEn = getClinicalTerm('hemoptysis', 'clinician', 'en')
      expect(patientEn).toBe('Coughing up blood')
      expect(clinicianEn).toContain('hemoptysis')

      const patientBn = getClinicalTerm('hemoptysis', 'patient', 'bn')
      const clinicianBn = getClinicalTerm('hemoptysis', 'clinician', 'bn')
      expect(patientBn).toContain('রক্তকাশি')
      expect(clinicianBn).toContain('হিমোপটাইসিস')
    })

    it('correctly retrieves terms for LDCT, pack-years, and 2WW referral', () => {
      expect(getClinicalTerm('low_dose_ct', 'patient', 'en')).toBe('Low-dose chest CT scan')
      expect(getClinicalTerm('low_dose_ct', 'patient', 'bn')).toContain('কম মাত্রার')

      expect(getClinicalTerm('pack_years', 'clinician', 'en')).toContain('pack-years')
      expect(getClinicalTerm('pack_years', 'clinician', 'bn')).toContain('প্যাক-ইয়ার্স')

      expect(getClinicalTerm('two_week_wait', 'patient', 'bn')).toContain('২ সপ্তাহের মধ্যে')
    })

    it('verifies clinical governance review status and passes validation audit', () => {
      const audit = validateClinicalTerminology()
      expect(audit.totalConcepts).toBeGreaterThanOrEqual(10)
      expect(audit.approvedCount).toBe(audit.totalConcepts)
      expect(audit.pendingCount).toBe(0)
      expect(audit.unapprovedIds).toEqual([])
    })

    it('filters clinical terminology entries by category', () => {
      const symptoms = getClinicalConceptsByCategory('symptom')
      expect(symptoms.length).toBeGreaterThanOrEqual(3)
      expect(symptoms.some((s) => s.id === 'hemoptysis')).toBe(true)

      const pathways = getClinicalConceptsByCategory('pathway')
      expect(pathways.some((p) => p.id === 'two_week_wait')).toBe(true)
    })
  })

  describe('4. Localized Report & Document Generator', () => {
    it('generates clinical risk assessment summary report in English', () => {
      const html = generateAssessmentReportHtml({
        reportId: 'REP-2026-001',
        patientId: 'LGT-2026-8K2M7P',
        patientName: 'Md. Rafiqul Islam',
        patientAge: 58,
        patientGender: 'Male',
        smokingPackYears: 32.5,
        riskCategory: 'high',
        screeningEligibility: 'eligible',
        concerningSymptoms: ['Persistent cough >3 weeks'],
        assignedFacilityName: 'National Institute of Diseases of the Chest & Hospital',
        clinicianName: 'Dr. Kazi Mahfuzur Rahman',
        generatedAt: '2026-11-06T10:00:00Z',
        methodologyVersion: 'Phase-1.12-Risk-v1',
        locale: 'en',
      })

      expect(html).toContain('Lung Health Assessment & Baseline Clinical Risk Summary')
      expect(html).toContain('LGT-2026-8K2M7P')
      expect(html).toContain('32.5 pack-years')
      expect(html).toContain('HIGH')
      expect(html).toContain('Eligible for Annual LDCT')
      expect(html).toContain('Clinical Safety Notice')
    })

    it('generates clinical risk assessment summary report in Bangla with Hind Siliguri typography', () => {
      const html = generateAssessmentReportHtml({
        reportId: 'REP-2026-001',
        patientId: 'LGT-2026-8K2M7P',
        patientName: 'মো. রফিকুল ইসলাম',
        patientAge: 58,
        patientGender: 'পুরুষ',
        smokingPackYears: 32.5,
        riskCategory: 'high',
        screeningEligibility: 'eligible',
        concerningSymptoms: ['টানা ৩ সপ্তাহের বেশি স্থায়ী কাশি'],
        assignedFacilityName: 'জাতীয় বক্ষব্যাধি ইনস্টিটিউট ও হাসপাতাল',
        clinicianName: 'ডা. কাজী মাহফুজুর রহমান',
        generatedAt: '2026-11-06T10:00:00Z',
        methodologyVersion: 'Phase-1.12-Risk-v1',
        locale: 'bn',
      })

      expect(html).toContain('ফুসফুস স্বাস্থ্য মূল্যায়ন ও প্রাথমিক ঝুঁকি সারসংক্ষেপ')
      expect(html).toContain('Hind Siliguri')
      expect(html).toContain('LGT-2026-8K2M7P')
      expect(html).toContain('৩২.৫ প্যাক-বছর')
      expect(html).toContain('ক্লিনিক্যাল সুরক্ষা বিজ্ঞপ্তি')
    })

    it('generates specialist referral consultation letter in Bangla and English', () => {
      const refLetterBn = generateReferralLetterHtml({
        referralId: 'REF-2026-9K2L4P',
        patientId: 'LGT-2026-8K2M7P',
        patientName: 'মো. রফিকুল ইসলাম',
        patientAge: 58,
        referringFacilityName: 'মিরপুর কমিউনিটি ক্লিনিক',
        destinationFacilityName: 'জাতীয় বক্ষব্যাধি ইনস্টিটিউট ও হাসপাতাল (NIDCH)',
        clinicalIndication: 'ব্যাখ্যাতীত রক্তকাশি ও ৩০ প্যাক-বছর ধূমপানের ইতিহাস।',
        priority: 'urgent_2ww',
        recommendedDate: '2026-11-15',
        referringClinicianName: 'ডা. কাজী মাহফুজুর রহমান',
        generatedAt: '2026-11-06T10:00:00Z',
        locale: 'bn',
      })

      expect(refLetterBn).toContain('বিশেষজ্ঞ পালমোনোলজি ও অনকোলজি পরামর্শ রেফারেল পত্র')
      expect(refLetterBn).toContain('REF-2026-9K2L4P')
      expect(refLetterBn).toContain('জরুরি ২-সপ্তাহ ফাস্ট-ট্র্যাক')
      expect(refLetterBn).toContain('ক্লিনিক্যাল নিশ্চয়তা')
    })
  })
})
