/**
 * Phase 2.12: Country-Specific Clinical Guideline Governance Service
 * Manages country clinical guidelines, Clinical Advisory Board (CAB) approval verification,
 * and gates clinical execution pathways to prevent unapproved methodologies from impacting care.
 */

import type {
  CountryClinicalGuideline,
  ClinicalGuidelineEvaluation,
} from '../types'

export const PRECONFIGURED_CLINICAL_GUIDELINES: CountryClinicalGuideline[] = [
  {
    id: 'guide-bd-001',
    countryCode: 'BD',
    guidelineKey: 'guideline-bd-nicrh-2026',
    title: 'Bangladesh National Lung Cancer Screening & Triage Protocol 2026',
    titleNative: 'বাংলাদেশ জাতীয় ফুসফুসের ক্যান্সার স্ক্রিনিং ও ট্রায়াজ প্রটোকল ২০২৬',
    sourceOrganization: 'National Institute of Cancer Research & Hospital (NICRH) & DGHS',
    publicationYear: 2026,
    effectiveDate: '2026-01-01',
    reviewCycleMonths: 24,
    intendedPopulation: 'Adult population aged 50-77 with high-risk smoking and environmental biomass exposure',
    clinicalScope: ['screening_eligibility', 'symptom_triage', 'nodule_referral'],
    approvalStatus: 'approved',
    approvedByBoardAt: '2026-02-15T00:00:00.000Z',
    approvedByBoardReference: 'CAB-BD-ONC-2026-04',
    riskEstimationModelAllowed: true,
    screeningEligibilityCriteria: {
      minimumAge: 50,
      maximumAge: 77,
      minimumPackYears: 20,
      currentSmokerOrQuitWithinYears: 15,
      highRiskEnvironmentalBiomassThresholdYears: 10,
    },
    referralPathwaySpecification: {
      primaryTriage: 'upazila_health_complex',
      secondaryEvaluation: 'district_hospital',
      definitiveMdtHub: 'nicrh_dhaka',
    },
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-02-15T00:00:00.000Z',
  },
  {
    id: 'guide-my-002',
    countryCode: 'MY',
    guidelineKey: 'guideline-my-cpg-lung-2024-synthetic',
    title: 'Clinical Practice Guidelines: Management of Lung Cancer (Synthetic Example)',
    titleNative: 'Panduan Amalan Klinikal: Pengurusan Kanser Paru-paru',
    sourceOrganization: 'Ministry of Health Malaysia & Academy of Medicine (Synthetic Draft)',
    publicationYear: 2024,
    effectiveDate: '2024-06-01',
    reviewCycleMonths: 36,
    intendedPopulation: 'Adult population aged 50-75 (Pending Local Board Ratification)',
    clinicalScope: ['screening_eligibility', 'symptom_triage'],
    approvalStatus: 'pending_clinical_advisory_board', // Strict Invariant: Pending CAB approval
    approvedByBoardAt: null,
    approvedByBoardReference: null,
    riskEstimationModelAllowed: false,
    screeningEligibilityCriteria: {
      minimumAge: 50,
      maximumAge: 75,
      minimumPackYears: 20,
      currentSmokerOrQuitWithinYears: 15,
    },
    referralPathwaySpecification: {
      primaryTriage: 'klinik_kesihatan',
      secondaryEvaluation: 'hospital_daerah',
      definitiveMdtHub: 'institut_kanser_negara',
    },
    createdAt: '2026-11-06T00:00:00.000Z',
    updatedAt: '2026-11-06T00:00:00.000Z',
  },
]

export class CountryClinicalGuidelineService {
  private static guidelines: Map<string, CountryClinicalGuideline> = new Map(
    PRECONFIGURED_CLINICAL_GUIDELINES.map(g => [g.guidelineKey, { ...g }])
  )

  /**
   * Retrieves all registered country guidelines
   */
  public static getAllGuidelines(): CountryClinicalGuideline[] {
    return Array.from(this.guidelines.values())
  }

  /**
   * Retrieves clinical guidelines for a specific country
   */
  public static getGuidelinesForCountry(countryCode: string): CountryClinicalGuideline[] {
    const normalized = countryCode.trim().toUpperCase()
    return Array.from(this.guidelines.values()).filter(g => g.countryCode === normalized)
  }

  /**
   * Evaluates whether clinical execution is authorized for a country
   * Invariant: Requires at least one actively APPROVED guideline with CAB verification.
   */
  public static evaluateClinicalExecutionStatus(countryCode: string): ClinicalGuidelineEvaluation {
    const guidelines = this.getGuidelinesForCountry(countryCode)
    const approvedGuideline = guidelines.find(g => g.approvalStatus === 'approved')

    if (!approvedGuideline) {
      return {
        isExecutionAllowed: false,
        warningMessage: `Clinical Execution Blocked: Country '${countryCode}' does not have Clinical Advisory Board approved guidelines. Automated screening & triage disabled.`,
      }
    }

    return {
      isExecutionAllowed: true,
      activeGuideline: approvedGuideline,
    }
  }

  /**
   * Approves a clinical guideline through the Clinical Advisory Board governance process
   */
  public static approveGuideline(
    guidelineKey: string,
    boardReference: string
  ): CountryClinicalGuideline {
    const guideline = this.guidelines.get(guidelineKey)
    if (!guideline) {
      throw new Error(`Guideline not found: ${guidelineKey}`)
    }

    const updated: CountryClinicalGuideline = {
      ...guideline,
      approvalStatus: 'approved',
      approvedByBoardAt: new Date().toISOString(),
      approvedByBoardReference: boardReference,
      riskEstimationModelAllowed: true,
      updatedAt: new Date().toISOString(),
    }

    this.guidelines.set(guidelineKey, updated)
    return updated
  }
}

