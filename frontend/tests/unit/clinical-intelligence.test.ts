/**
 * Phase 2.6: Advanced Clinical Intelligence Unit Test Suite
 *
 * Comprehensive tests for:
 * 1. Authoritative Evidence Catalog & Provenance (USPSTF, NLST, NELSON, NICE, WHO, NICRH, etc.)
 * 2. Multi-Attribute Clinical Evidence Retrieval & Keyword Search
 * 3. Clinical Knowledge Articles Management (EN/BN)
 * 4. Contextual Decision Support (CDS) Generation
 * 5. Traceable Recommendation Assistance & Clinician Actions (Accept/Dismiss/Override)
 * 6. Clinical Governance Guideline Lifecycle Management
 * 7. Clinical Safety & Governance Invariants
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  ClinicalEvidenceService,
  ClinicalDecisionSupportEngine,
  BASELINE_EVIDENCE_SOURCES,
  BASELINE_KNOWLEDGE_ARTICLES,
} from '@/modules/clinical-intelligence'

describe('Phase 2.6: Advanced Clinical Intelligence Framework', () => {
  beforeEach(() => {
    ClinicalEvidenceService.resetForTesting()
    ClinicalDecisionSupportEngine.resetForTesting()
  })

  // ==========================================================================
  // 1. EVIDENCE CATALOG & PROVENANCE
  // ==========================================================================
  describe('1. Authoritative Evidence Catalog & Provenance', () => {
    it('contains all core baseline guidelines and landmark research trials', () => {
      expect(BASELINE_EVIDENCE_SOURCES.length).toBeGreaterThanOrEqual(8)

      const codes = BASELINE_EVIDENCE_SOURCES.map((e) => e.code)
      expect(codes).toContain('EVID-USPSTF-2021')
      expect(codes).toContain('EVID-NLST-2011')
      expect(codes).toContain('EVID-NELSON-2020')
      expect(codes).toContain('EVID-NICE-NG12')
      expect(codes).toContain('EVID-WHO-TOBACCO-2023')
      expect(codes).toContain('EVID-NICRH-BD-2022')
      expect(codes).toContain('EVID-BIOMASS-SA-2021')
      expect(codes).toContain('EVID-PLCOM-2012')
    })

    it('preserves complete clinical citation metadata and DOIs', () => {
      BASELINE_EVIDENCE_SOURCES.forEach((source) => {
        expect(source.code).toMatch(/^EVID-[A-Z0-9-]+$/)
        expect(source.titleEn).toBeTruthy()
        expect(source.titleBn).toBeTruthy()
        expect(source.issuingOrganization).toBeTruthy()
        expect(source.sourceType).toBeTruthy()
        expect(source.evidenceTier).toBeTruthy()
        expect(source.primaryTopic).toBeTruthy()
        expect(source.jurisdiction).toBeTruthy()
        expect(source.publicationReference).toBeTruthy()
        expect(source.summaryEn).toBeTruthy()
        expect(source.summaryBn).toBeTruthy()
        expect(source.keyRecommendationsEn.length).toBeGreaterThan(0)
        expect(source.keyRecommendationsBn.length).toBeGreaterThan(0)
      })
    })

    it('explicitly distinguishes Bangladesh-adapted protocols from international guidelines', () => {
      const nicrh = BASELINE_EVIDENCE_SOURCES.find((e) => e.code === 'EVID-NICRH-BD-2022')
      expect(nicrh).toBeDefined()
      expect(nicrh?.jurisdiction).toBe('Bangladesh')
      expect(nicrh?.approvedForBangladesh).toBe(true)

      const uspstf = BASELINE_EVIDENCE_SOURCES.find((e) => e.code === 'EVID-USPSTF-2021')
      expect(uspstf).toBeDefined()
      expect(uspstf?.approvedForBangladesh).toBe(false)
      expect(uspstf?.bangladeshAdaptationNotes).toContain('not currently institutionalized')
    })
  })

  // ==========================================================================
  // 2. EVIDENCE RETRIEVAL & MULTI-ATTRIBUTE SEARCH
  // ==========================================================================
  describe('2. Evidence Retrieval & Search Engine', () => {
    it('retrieves evidence source by exact ID and code', async () => {
      const byId = await ClinicalEvidenceService.getEvidenceById('evid-uspstf-2021')
      expect(byId).toBeDefined()
      expect(byId?.code).toBe('EVID-USPSTF-2021')

      const byCode = await ClinicalEvidenceService.getEvidenceByCode('EVID-NICE-NG12')
      expect(byCode).toBeDefined()
      expect(byCode?.issuingOrganization).toContain('NICE')
    })

    it('filters evidence sources by clinical topic', async () => {
      const screeningEvidence = await ClinicalEvidenceService.searchEvidence({
        topic: 'screening_guidance',
      })
      expect(screeningEvidence.length).toBeGreaterThanOrEqual(3)
      screeningEvidence.forEach((e) => expect(e.primaryTopic).toBe('screening_guidance'))
    })

    it('filters evidence sources by jurisdiction and Bangladesh approval flag', async () => {
      const bdEvidence = await ClinicalEvidenceService.searchEvidence({
        approvedForBangladeshOnly: true,
      })
      expect(bdEvidence.length).toBeGreaterThanOrEqual(3)
      bdEvidence.forEach((e) => expect(e.approvedForBangladesh).toBe(true))
    })

    it('performs keyword search across title, summary, citation, and DOI', async () => {
      const bidiResults = await ClinicalEvidenceService.searchEvidence({
        searchQuery: 'bidi',
      })
      expect(bidiResults.length).toBeGreaterThanOrEqual(1)
      expect(bidiResults[0].code).toBe('EVID-WHO-TOBACCO-2023')

      const doiResults = await ClinicalEvidenceService.searchEvidence({
        searchQuery: '10.1056/NEJMoa1102873',
      })
      expect(doiResults.length).toBe(1)
      expect(doiResults[0].code).toBe('EVID-NLST-2011')
    })
  })

  // ==========================================================================
  // 3. CLINICAL KNOWLEDGE MANAGEMENT
  // ==========================================================================
  describe('3. Clinical Knowledge Articles Management', () => {
    it('retrieves knowledge articles across topics with audience tags', async () => {
      expect(BASELINE_KNOWLEDGE_ARTICLES.length).toBeGreaterThanOrEqual(3)
      const allArticles = await ClinicalEvidenceService.getAllKnowledgeArticles()
      expect(allArticles.length).toBeGreaterThanOrEqual(3)

      const bidiArticle = await ClinicalEvidenceService.getArticleBySlug(
        'bidi-tobacco-pathophysiology'
      )
      expect(bidiArticle).toBeDefined()
      expect(bidiArticle?.targetAudience).toBe('clinician')
      expect(bidiArticle?.contentEn).toContain('Diospyros melanoxylon')
      expect(bidiArticle?.contentBn).toBeTruthy()
    })

    it('filters knowledge articles by clinical topic', async () => {
      const triageArticles = await ClinicalEvidenceService.getArticlesByTopic('symptom_triage')
      expect(triageArticles.length).toBeGreaterThanOrEqual(1)
      expect(triageArticles[0].slug).toBe('red-flag-symptoms-urgent-triage')
    })
  })

  // ==========================================================================
  // 4. CONTEXTUAL DECISION SUPPORT GENERATION
  // ==========================================================================
  describe('4. Contextual Decision Support Engine', () => {
    it('generates urgent referral insight and recommendation for alarm red-flag symptoms', async () => {
      const result = await ClinicalDecisionSupportEngine.generatePatientCDS({
        patientId: 'pat-cds-001',
        assessmentId: 'asm-cds-001',
        age: 62,
        gender: 'male',
        smokingStatus: 'current_smoker',
        packYears: 35,
        hasHemoptysis: true, // Alarm red flag!
      })

      expect(result.insights.length).toBeGreaterThanOrEqual(1)
      const redFlag = result.insights.find((i) => i.insightCategory === 'symptom_warning')
      expect(redFlag).toBeDefined()
      expect(redFlag?.titleEn).toContain('Alarm Red-Flag')
      expect(redFlag?.supportingEvidenceIds).toContain('evid-nice-ng12')

      const urgentRec = result.recommendations.find(
        (r) => r.recommendationCategory === 'urgent_referral'
      )
      expect(urgentRec).toBeDefined()
      expect(urgentRec?.recommendationCode).toBe('REC_URGENT_2WW_DIAGNOSTIC')
      expect(urgentRec?.evidenceStrength).toContain('Strong')
    })

    it('generates screening consideration and shared decision-making recommendation for eligible patient', async () => {
      const result = await ClinicalDecisionSupportEngine.generatePatientCDS({
        patientId: 'pat-cds-002',
        assessmentId: 'asm-cds-002',
        age: 65,
        gender: 'male',
        smokingStatus: 'former_smoker',
        packYears: 25,
        hasHemoptysis: false,
        hasStridor: false,
      })

      const screeningInsight = result.insights.find(
        (i) => i.insightCategory === 'screening_consideration'
      )
      expect(screeningInsight).toBeDefined()
      expect(screeningInsight?.supportingEvidenceIds).toContain('evid-uspstf-2021')

      const screeningRec = result.recommendations.find(
        (r) => r.recommendationCategory === 'screening'
      )
      expect(screeningRec).toBeDefined()
      expect(screeningRec?.recommendationCode).toBe('REC_LDCT_SHARED_DECISION')
    })

    it('generates bidi tobacco cessation recommendation for indigenous tobacco smoker', async () => {
      const result = await ClinicalDecisionSupportEngine.generatePatientCDS({
        patientId: 'pat-cds-003',
        assessmentId: 'asm-cds-003',
        age: 48,
        gender: 'male',
        smokingStatus: 'current_smoker',
        usesBidi: true,
      })

      const tobaccoInsight = result.insights.find(
        (i) => i.insightCategory === 'risk_factor_alert'
      )
      expect(tobaccoInsight).toBeDefined()
      expect(tobaccoInsight?.explanationEn).toContain('unfiltered indigenous bidis')

      const cessationRec = result.recommendations.find(
        (r) => r.recommendationCategory === 'smoking_cessation'
      )
      expect(cessationRec).toBeDefined()
    })

    it('generates household biomass smoke hazard insight for rural female chula cook', async () => {
      const result = await ClinicalDecisionSupportEngine.generatePatientCDS({
        patientId: 'pat-cds-004',
        assessmentId: 'asm-cds-004',
        age: 52,
        gender: 'female',
        smokingStatus: 'never_smoker',
        usesBiomassChula: true,
      })

      const biomassInsight = result.insights.find(
        (i) => i.insightCategory === 'environmental_hazard'
      )
      expect(biomassInsight).toBeDefined()
      expect(biomassInsight?.supportingEvidenceIds).toContain('evid-biomass-sa-2021')

      const mitigationRec = result.recommendations.find(
        (r) => r.recommendationCategory === 'environmental_mitigation'
      )
      expect(mitigationRec).toBeDefined()
      expect(mitigationRec?.recommendationCode).toBe('REC_BIOMASS_VENTILATION_COUNSELING')
    })

    it('flags data incompleteness when active anomaly detection flags exist', async () => {
      const result = await ClinicalDecisionSupportEngine.generatePatientCDS({
        patientId: 'pat-cds-005',
        assessmentId: 'asm-cds-005',
        age: 55,
        gender: 'male',
        smokingStatus: 'current_smoker',
        detectedAnomaliesCount: 2,
      })

      const anomalyInsight = result.insights.find(
        (i) => i.insightCategory === 'data_incompleteness'
      )
      expect(anomalyInsight).toBeDefined()
      expect(anomalyInsight?.confidenceTier).toBe('provisional')
    })
  })

  // ==========================================================================
  // 5. CLINICIAN ACTIONS & RECOMMENDATION WORKFLOW
  // ==========================================================================
  describe('5. Clinician Workflow Actions', () => {
    it('records clinician acceptance of a decision-support insight', async () => {
      const { insights } = await ClinicalDecisionSupportEngine.generatePatientCDS({
        patientId: 'pat-action-001',
        assessmentId: 'asm-action-001',
        age: 60,
        gender: 'male',
        smokingStatus: 'current_smoker',
        hasHemoptysis: true,
      })

      const insightId = insights[0].id
      const updated = await ClinicalDecisionSupportEngine.recordClinicianActionOnInsight(
        insightId,
        'accepted',
        'dr_farhana',
        'Acknowledged urgent alarm symptom. Immediate referral requested.'
      )

      expect(updated.clinicianActionStatus).toBe('accepted')
      expect(updated.actedBy).toBe('dr_farhana')
      expect(updated.clinicianActionNotes).toContain('Immediate referral')
    })

    it('records clinician override of a recommendation with documented rationale', async () => {
      const { recommendations } = await ClinicalDecisionSupportEngine.generatePatientCDS({
        patientId: 'pat-action-002',
        assessmentId: 'asm-action-002',
        age: 68,
        gender: 'male',
        smokingStatus: 'current_smoker',
        packYears: 30,
      })

      const rec = recommendations[0]
      const overridden =
        await ClinicalDecisionSupportEngine.recordClinicianActionOnRecommendation(
          rec.id,
          'overridden',
          'dr_farhana',
          'Patient has severe advanced congestive heart failure (NYHA IV) with life expectancy < 6 months; screening contraindicated.'
        )

      expect(overridden.actionStatus).toBe('overridden')
      expect(overridden.clinicianId).toBe('dr_farhana')
      expect(overridden.clinicianRationale).toContain('NYHA IV')
    })
  })

  // ==========================================================================
  // 6. CLINICAL GOVERNANCE GUIDELINE LIFECYCLE
  // ==========================================================================
  describe('6. Clinical Governance Guideline Lifecycle', () => {
    it('updates guideline approval status with documented audit notes', async () => {
      const updated = await ClinicalEvidenceService.updateGuidelineApprovalStatus(
        'evid-uspstf-2021',
        'superseded',
        'cab_chair_dr_rahman',
        'Superseded by updated regional protocol'
      )

      expect(updated.approvalStatus).toBe('superseded')
      expect(updated.metadata?.lastReviewerId).toBe('cab_chair_dr_rahman')
      expect(updated.metadata?.reviewNotes).toContain('Superseded by updated')
    })
  })

  // ==========================================================================
  // 7. CLINICAL SAFETY & GOVERNANCE INVARIANTS
  // ==========================================================================
  describe('7. Clinical Safety & Governance Invariants', () => {
    it('guarantees that low statistical risk NEVER suppresses urgent referral recommendation for hemoptysis', async () => {
      // Patient with simulated low statistical risk (32y, 2 pack-years) but alarming hemoptysis
      const result = await ClinicalDecisionSupportEngine.generatePatientCDS({
        patientId: 'pat-safety-001',
        assessmentId: 'asm-safety-001',
        age: 32,
        gender: 'male',
        smokingStatus: 'former_smoker',
        packYears: 2,
        calculatedPlcomRiskPercent: 0.05, // Extremely low risk
        hasHemoptysis: true, // ALARM RED FLAG
      })

      const urgentRec = result.recommendations.find(
        (r) => r.recommendationCategory === 'urgent_referral'
      )
      expect(urgentRec).toBeDefined()
      expect(urgentRec?.recommendationCode).toBe('REC_URGENT_2WW_DIAGNOSTIC')
    })

    it('prohibits decision-support insights from claiming a confirmed medical diagnosis', () => {
      const invalidInsight = {
        id: 'ins-invalid',
        patientId: 'p1',
        assessmentId: 'a1',
        insightCategory: 'symptom_warning' as const,
        titleEn: 'Cancer Confirmed In Lung',
        titleBn: 'ক্যান্সার নিশ্চিত',
        explanationEn: 'Patient is diagnosed with lung cancer by system.',
        explanationBn: 'রোগীর ক্যান্সার হয়েছে।',
        clinicalJustification: 'Invalid claim',
        provenanceType: 'system_generated_decision_support' as const,
        triggerAttributes: {},
        supportingEvidenceIds: [],
        confidenceTier: 'high' as const,
        clinicianActionStatus: 'pending' as const,
        createdAt: new Date().toISOString(),
      }

      expect(() => {
        ClinicalDecisionSupportEngine.assertDecisionSupportInvariants([invalidInsight])
      }).toThrow('CLINICAL SAFETY VIOLATION')
    })
  })
})
