/**
 * Phase 2.6: Advanced Clinical Decision-Support (CDS) & Recommendation Engine
 *
 * Synthesizes patient clinical profile, risk calculations, screening status,
 * alarm symptoms, and environmental context into grounded decision-support
 * insights and traceable recommendations.
 *
 * CLINICAL SAFETY INVARIANT:
 * Decision support never replaces qualified clinician judgment, never claims
 * an autonomous diagnosis, and NEVER suppresses urgent red-flag symptom triage.
 */

import type {
  ClinicalDecisionSupportInsight,
  ClinicalRecommendationAssistance,
  ClinicianActionStatus,
  PatientCDSContextInput,
} from './types'

export class ClinicalDecisionSupportEngine {
  private static inMemoryInsights: Map<string, ClinicalDecisionSupportInsight> = new Map()
  private static inMemoryRecommendations: Map<string, ClinicalRecommendationAssistance> = new Map()

  public static resetForTesting(): void {
    this.inMemoryInsights.clear()
    this.inMemoryRecommendations.clear()
  }

  // ==========================================================================
  // DECISION SUPPORT GENERATION
  // ==========================================================================

  public static async generatePatientCDS(input: PatientCDSContextInput): Promise<{
    insights: ClinicalDecisionSupportInsight[]
    recommendations: ClinicalRecommendationAssistance[]
  }> {
    const insights: ClinicalDecisionSupportInsight[] = []
    const recommendations: ClinicalRecommendationAssistance[] = []
    const now = new Date().toISOString()

    // 1. INVARIANT: RED-FLAG SYMPTOM ESCALATION (NICE NG12 / NICRH)
    if (input.hasHemoptysis || input.hasStridor) {
      const insightId = crypto.randomUUID()
      const symptomNames = []
      if (input.hasHemoptysis) symptomNames.push('Hemoptysis (Coughing blood)')
      if (input.hasStridor) symptomNames.push('Stridor / Airway obstruction')

      const redFlagInsight: ClinicalDecisionSupportInsight = {
        id: insightId,
        patientId: input.patientId,
        assessmentId: input.assessmentId,
        facilityId: input.facilityId,
        insightCategory: 'symptom_warning',
        titleEn: 'Alarm Red-Flag Respiratory Symptom Detected',
        titleBn: 'বিপজ্জনক অ্যালার্ম শ্বাসযন্ত্রের লক্ষণ শনাক্ত হয়েছে',
        explanationEn: `Patient exhibits high-risk alarm symptoms (${symptomNames.join(', ')}). In adults aged >= 40, these symptoms require urgent respiratory evaluation.`,
        explanationBn: `রোগীর বিপজ্জনক লক্ষণ (${symptomNames.join(', ')}) পরিলক্ষিত হয়েছে যা জরুরি রেসপিরেটরি মূল্যায়নের দাবি রাখে।`,
        clinicalJustification: 'NICE NG12 and NICRH National Protocol mandate urgent 2-week wait diagnostic investigation.',
        provenanceType: 'patient_reported',
        triggerAttributes: {
          hasHemoptysis: input.hasHemoptysis,
          hasStridor: input.hasStridor,
          age: input.age,
        },
        supportingEvidenceIds: ['evid-nice-ng12', 'evid-nicrh-bd-2022'],
        confidenceTier: 'high',
        clinicianActionStatus: 'pending',
        createdAt: now,
      }
      insights.push(redFlagInsight)
      this.inMemoryInsights.set(redFlagInsight.id, redFlagInsight)

      const urgentRec: ClinicalRecommendationAssistance = {
        id: crypto.randomUUID(),
        patientId: input.patientId,
        assessmentId: input.assessmentId,
        insightId: redFlagInsight.id,
        recommendationCategory: 'urgent_referral',
        recommendationCode: 'REC_URGENT_2WW_DIAGNOSTIC',
        statementEn: 'Arrange urgent chest radiography and respiratory specialist referral within 2 weeks.',
        statementBn: 'অনতিবিলম্বে চেস্ট এক্স-রে এবং ২ সপ্তাহের মধ্যে বক্ষব্যাধি বিশেষজ্ঞের কাছে রেফারেলের ব্যবস্থা করুন।',
        evidenceSourceId: 'evid-nice-ng12',
        evidenceStrength: 'Strong (NICE NG12 Grade A / NICRH National Protocol)',
        applicabilityConditions: ['Age >= 40 with unexplained hemoptysis or stridor'],
        contraindications: ['None; diagnostic workup is urgently indicated'],
        actionStatus: 'pending',
        createdAt: now,
      }
      recommendations.push(urgentRec)
      this.inMemoryRecommendations.set(urgentRec.id, urgentRec)
    }

    // 2. SCREENING ELIGIBILITY & SHARED DECISION-MAKING
    if (
      input.age >= 50 &&
      input.age <= 80 &&
      input.packYears !== undefined &&
      input.packYears >= 20 &&
      !input.hasHemoptysis &&
      !input.hasStridor
    ) {
      const insightId = crypto.randomUUID()
      const screeningInsight: ClinicalDecisionSupportInsight = {
        id: insightId,
        patientId: input.patientId,
        assessmentId: input.assessmentId,
        facilityId: input.facilityId,
        insightCategory: 'screening_consideration',
        titleEn: 'USPSTF 2021 Screening Eligibility Profile Met',
        titleBn: 'ইউএসপিএসটিএফ ২০২১ স্ক্রিনিং যোগ্যতার মানদণ্ড পূরণ হয়েছে',
        explanationEn: `Patient meets demographic and smoking exposure criteria (Age: ${input.age}, Pack-Years: ${input.packYears}) for low-dose CT screening consideration.`,
        explanationBn: `রোগী বয়স (${input.age}) এবং ধূমপানের পরিমাণ (${input.packYears} প্যাক-বছর) অনুযায়ী লো-ডোজ সিটি স্ক্রিনিং বিবেচনার মানদণ্ড পূরণ করেছেন।`,
        clinicalJustification: 'USPSTF Grade B recommendation based on NLST and NELSON randomized trial evidence.',
        provenanceType: 'system_generated_decision_support',
        triggerAttributes: {
          age: input.age,
          packYears: input.packYears,
          smokingStatus: input.smokingStatus,
        },
        supportingEvidenceIds: ['evid-uspstf-2021', 'evid-nlst-2011'],
        confidenceTier: 'high',
        clinicianActionStatus: 'pending',
        createdAt: now,
      }
      insights.push(screeningInsight)
      this.inMemoryInsights.set(screeningInsight.id, screeningInsight)

      const screeningRec: ClinicalRecommendationAssistance = {
        id: crypto.randomUUID(),
        patientId: input.patientId,
        assessmentId: input.assessmentId,
        insightId: screeningInsight.id,
        recommendationCategory: 'screening',
        recommendationCode: 'REC_LDCT_SHARED_DECISION',
        statementEn: 'Conduct shared decision-making discussion regarding LDCT screening benefits, radiation exposure, and false-positive risk. (Note: In Bangladesh, verify availability of accredited multislice CT center).',
        statementBn: 'লো-ডোজ সিটির সুবিধা ও ঝুঁকি বিষয়ে যৌথ সিদ্ধান্ত আলোচনা করুন। (বাংলাদেশে মানসম্পন্ন সিটি সেন্টারের প্রাপ্যতা নিশ্চিত করুন)।',
        evidenceSourceId: 'evid-uspstf-2021',
        evidenceStrength: 'Grade B (USPSTF 2021 / Level 1a NLST)',
        applicabilityConditions: ['Age 50-80', 'Pack-years >= 20', 'Asymptomatic'],
        contraindications: [
          'Active symptoms concerning for lung cancer (require diagnostic pathway)',
          'Severe comorbidity limiting life expectancy',
        ],
        actionStatus: 'pending',
        createdAt: now,
      }
      recommendations.push(screeningRec)
      this.inMemoryRecommendations.set(screeningRec.id, screeningRec)
    }

    // 3. TOBACCO & BIDI CESSATION ASSISTANCE
    if (input.smokingStatus === 'current_smoker' || input.usesBidi) {
      const insightId = crypto.randomUUID()
      const bidiNote = input.usesBidi
        ? 'Patient smokes unfiltered indigenous bidis, which deliver 2-3x higher CO and PAHs.'
        : 'Patient is an active cigarette smoker.'

      const cessationInsight: ClinicalDecisionSupportInsight = {
        id: insightId,
        patientId: input.patientId,
        assessmentId: input.assessmentId,
        facilityId: input.facilityId,
        insightCategory: 'risk_factor_alert',
        titleEn: 'Active Tobacco Exposure: Cessation Priority',
        titleBn: 'সক্রিয় তামাক সেবন: বর্জন সহায়তা অগ্রাধিকার',
        explanationEn: `${bidiNote} Tobacco cessation provides the single greatest absolute risk reduction for lung cancer and COPD.`,
        explanationBn: `তামাক বর্জন ফুসফুসের ক্যান্সার এবং সিওপিডি প্রতিরোধে সর্বাধিক কার্যকর পদক্ষেপ।`,
        clinicalJustification: 'WHO Global Tobacco Report 2023 demonstrates rapid mortality and cardiovascular benefits upon cessation.',
        provenanceType: 'patient_reported',
        triggerAttributes: {
          smokingStatus: input.smokingStatus,
          usesBidi: input.usesBidi,
          packYears: input.packYears,
        },
        supportingEvidenceIds: ['evid-who-tobacco-2023'],
        confidenceTier: 'high',
        clinicianActionStatus: 'pending',
        createdAt: now,
      }
      insights.push(cessationInsight)
      this.inMemoryInsights.set(cessationInsight.id, cessationInsight)

      const cessationRec: ClinicalRecommendationAssistance = {
        id: crypto.randomUUID(),
        patientId: input.patientId,
        assessmentId: input.assessmentId,
        insightId: cessationInsight.id,
        recommendationCategory: 'smoking_cessation',
        recommendationCode: 'REC_TOBACCO_CESSATION_INTERVENTION',
        statementEn: 'Offer brief behavioral counseling and consider nicotine replacement therapy (NRT) or varenicline if clinically appropriate.',
        statementBn: 'আচরণগত কাউন্সেলিং প্রদান করুন এবং ক্লিনিকালি উপযুক্ত হলে নিকোটিন রিপ্লেসমেন্ট থেরাপি বিবেচনা করুন।',
        evidenceSourceId: 'evid-who-tobacco-2023',
        evidenceStrength: 'Strong (WHO Level 1a)',
        applicabilityConditions: ['Active tobacco consumer'],
        contraindications: ['Check NRT precautions in unstable cardiovascular disease'],
        actionStatus: 'pending',
        createdAt: now,
      }
      recommendations.push(cessationRec)
      this.inMemoryRecommendations.set(cessationRec.id, cessationRec)
    }

    // 4. HOUSEHOLD BIOMASS SMOKE IN BANGLADESH WOMEN
    if (input.usesBiomassChula && input.gender.toLowerCase() === 'female') {
      const insightId = crypto.randomUUID()
      const biomassInsight: ClinicalDecisionSupportInsight = {
        id: insightId,
        patientId: input.patientId,
        assessmentId: input.assessmentId,
        facilityId: input.facilityId,
        insightCategory: 'environmental_hazard',
        titleEn: 'Unmeasured Household Biomass Chula Smoke Exposure',
        titleBn: 'গৃহস্থালি মাটির চুলায় রান্নার বায়োমাস ধোঁয়ার সংস্পর্শ',
        explanationEn: 'Patient reports chronic indoor cooking on traditional unvented clay chulas. Meta-analyses in South Asian women show a 2.1-fold elevated respiratory malignancy odds in non-smokers.',
        explanationBn: 'মাটির চুলায় রান্নার ধোঁয়া দক্ষিণ এশিয়ার নারীদের ফুসফুস ক্যান্সারের ঝুঁকি ২.১ গুণ বৃদ্ধি করে।',
        clinicalJustification: 'Lancet Global Health 2021 meta-analysis on household solid fuel combustion.',
        provenanceType: 'patient_reported',
        triggerAttributes: {
          usesBiomassChula: input.usesBiomassChula,
          gender: input.gender,
        },
        supportingEvidenceIds: ['evid-biomass-sa-2021'],
        confidenceTier: 'moderate',
        clinicianActionStatus: 'pending',
        createdAt: now,
      }
      insights.push(biomassInsight)
      this.inMemoryInsights.set(biomassInsight.id, biomassInsight)

      const biomassRec: ClinicalRecommendationAssistance = {
        id: crypto.randomUUID(),
        patientId: input.patientId,
        assessmentId: input.assessmentId,
        insightId: biomassInsight.id,
        recommendationCategory: 'environmental_mitigation',
        recommendationCode: 'REC_BIOMASS_VENTILATION_COUNSELING',
        statementEn: 'Advise on kitchen ventilation, chimney chula installation, and reduced personal exposure during solid fuel combustion.',
        statementBn: 'রান্নাঘরে উন্নত বায়ু চলাচল, চিমনিযুক্ত চুলার ব্যবহার এবং ধোঁয়ার সংস্পর্শ কমানোর পরামর্শ দিন।',
        evidenceSourceId: 'evid-biomass-sa-2021',
        evidenceStrength: 'Moderate (Lancet Global Health Level 1b)',
        applicabilityConditions: ['Household biomass solid fuel cooking'],
        contraindications: [],
        actionStatus: 'pending',
        createdAt: now,
      }
      recommendations.push(biomassRec)
      this.inMemoryRecommendations.set(biomassRec.id, biomassRec)
    }

    // 5. DATA INCOMPLETENESS / ANOMALY DETECTION NOTICE
    if (input.detectedAnomaliesCount && input.detectedAnomaliesCount > 0) {
      const anomalyInsight: ClinicalDecisionSupportInsight = {
        id: crypto.randomUUID(),
        patientId: input.patientId,
        assessmentId: input.assessmentId,
        facilityId: input.facilityId,
        insightCategory: 'data_incompleteness',
        titleEn: 'Active Data Anomaly or Missing Predictors Flagged',
        titleBn: 'তথ্যে অসঙ্গতি বা অনুপস্থিত ক্লিনিকাল তথ্য চিহ্নিত',
        explanationEn: `Assessment has ${input.detectedAnomaliesCount} active anomaly flag(s) requiring clinician chart review. Risk estimates may carry higher uncertainty.`,
        explanationBn: `মূল্যায়নে ${input.detectedAnomaliesCount}টি তথ্যের গরমিল বা অসঙ্গতি শনাক্ত হয়েছে যা যাচাই করা আবশ্যক।`,
        clinicalJustification: 'Phase 2.5 Data Quality & Anomaly Detection Framework.',
        provenanceType: 'system_generated_decision_support',
        triggerAttributes: { detectedAnomaliesCount: input.detectedAnomaliesCount },
        supportingEvidenceIds: [],
        confidenceTier: 'provisional',
        clinicianActionStatus: 'pending',
        createdAt: now,
      }
      insights.push(anomalyInsight)
      this.inMemoryInsights.set(anomalyInsight.id, anomalyInsight)
    }

    // Enforce safety invariants
    this.assertDecisionSupportInvariants(insights)

    return { insights, recommendations }
  }

  // ==========================================================================
  // CLINICIAN REVIEW & ACTIONS
  // ==========================================================================

  public static async recordClinicianActionOnInsight(
    insightId: string,
    actionStatus: ClinicianActionStatus,
    clinicianId: string,
    notes?: string
  ): Promise<ClinicalDecisionSupportInsight> {
    const item = this.inMemoryInsights.get(insightId)
    if (!item) {
      throw new Error(`CDS Insight with ID "${insightId}" not found.`)
    }

    item.clinicianActionStatus = actionStatus
    item.clinicianActionNotes = notes ?? null
    item.actedBy = clinicianId
    item.actedAt = new Date().toISOString()
    this.inMemoryInsights.set(item.id, item)
    return item
  }

  public static async recordClinicianActionOnRecommendation(
    recommendationId: string,
    actionStatus: ClinicianActionStatus,
    clinicianId: string,
    rationale?: string
  ): Promise<ClinicalRecommendationAssistance> {
    const item = this.inMemoryRecommendations.get(recommendationId)
    if (!item) {
      throw new Error(`Recommendation with ID "${recommendationId}" not found.`)
    }

    item.actionStatus = actionStatus
    item.clinicianRationale = rationale ?? null
    item.clinicianId = clinicianId
    item.documentedAt = new Date().toISOString()
    this.inMemoryRecommendations.set(item.id, item)
    return item
  }

  public static async getInsightsByAssessment(
    assessmentId: string
  ): Promise<ClinicalDecisionSupportInsight[]> {
    return Array.from(this.inMemoryInsights.values()).filter(
      (i) => i.assessmentId === assessmentId
    )
  }

  public static async getRecommendationsByAssessment(
    assessmentId: string
  ): Promise<ClinicalRecommendationAssistance[]> {
    return Array.from(this.inMemoryRecommendations.values()).filter(
      (r) => r.assessmentId === assessmentId
    )
  }

  // ==========================================================================
  // CLINICAL SAFETY INVARIANTS
  // ==========================================================================

  public static assertDecisionSupportInvariants(
    insights: ClinicalDecisionSupportInsight[]
  ): void {
    for (const insight of insights) {
      // 1. Never claim a confirmed lung cancer diagnosis
      if (
        insight.titleEn.toLowerCase().includes('cancer confirmed') ||
        insight.explanationEn.toLowerCase().includes('diagnosed with lung cancer')
      ) {
        throw new Error(
          'CLINICAL SAFETY VIOLATION: Decision support insight cannot claim a confirmed medical diagnosis.'
        )
      }
    }
  }
}
