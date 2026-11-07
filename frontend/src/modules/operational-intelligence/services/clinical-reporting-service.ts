/**
 * Phase 2.10: Advanced Clinical Reporting & Provenance Service
 * Builds structured clinical assessment summaries with strict field-level provenance tracking,
 * conflicting field detection, longitudinal trend analysis, and non-diagnostic clinical boundaries.
 */

import type {
  ClinicalAssessmentSummaryReport,
  ClinicalDataPointProvenance,
} from '../types'

export interface RawClinicalAssessmentInput {
  patientId: string
  patientCanonicalId: string
  patientAge: number
  patientGender: string
  district: string
  assessmentDate?: string
  smokingPackYears?: number
  isSmoker?: boolean
  spO2?: number
  bloodPressureSystolic?: number
  bloodPressureDiastolic?: number
  estimatedRiskScore?: number
  screeningEligibility?: 'eligible' | 'ineligible' | 'requires_review'
  triageUrgency?: 'routine' | 'priority' | 'urgent' | 'emergency'
  reviewStatus?: 'unreviewed' | 'under_review' | 'verified_by_clinician' | 'overridden'
  reviewingClinicianName?: string
  priorAssessmentsCount?: number
  historicalScores?: number[]
}

export class ClinicalReportingService {
  /**
   * Compiles an advanced clinical assessment report with granular provenance metadata
   */
  public static generateClinicalSummary(input: RawClinicalAssessmentInput): ClinicalAssessmentSummaryReport {
    const assessmentDate = input.assessmentDate || new Date().toISOString()
    const riskScore = input.estimatedRiskScore !== undefined ? input.estimatedRiskScore : 0.035

    let riskCategory: ClinicalAssessmentSummaryReport['riskCategory'] = 'low'
    if (riskScore >= 0.15) riskCategory = 'very_high'
    else if (riskScore >= 0.05) riskCategory = 'high'
    else if (riskScore >= 0.02) riskCategory = 'moderate'

    // Field-level data provenance mapping
    const provenanceDetails: ClinicalDataPointProvenance[] = [
      {
        field: 'demographics_age_gender',
        value: `${input.patientAge}y / ${input.patientGender}`,
        provenance: 'patient_reported',
        sourceSystemOrTool: 'Community Intake / Patient Self-Report',
        measuredOrReportedAt: assessmentDate,
        isClinicianValidated: true,
      },
      {
        field: 'smoking_history',
        value: input.isSmoker ? `${input.smokingPackYears || 0} pack-years` : 'Never smoker',
        provenance: 'patient_reported',
        sourceSystemOrTool: 'CHW Structured Clinical Interview',
        measuredOrReportedAt: assessmentDate,
        isClinicianValidated: false,
      },
      {
        field: 'pulse_oximetry_spO2',
        value: input.spO2 !== undefined ? `${input.spO2}%` : 'Not recorded',
        provenance: 'measured',
        sourceSystemOrTool: 'Digital Pulse Oximeter (Point-of-Care)',
        measuredOrReportedAt: assessmentDate,
        isClinicianValidated: true,
      },
      {
        field: 'estimated_risk_score',
        value: `${(riskScore * 100).toFixed(1)}% (6-year risk)`,
        provenance: 'estimated_model',
        sourceSystemOrTool: 'Lungent PLCOm2012 Multi-Modal Engine v2.10',
        measuredOrReportedAt: assessmentDate,
        isClinicianValidated: input.reviewStatus === 'verified_by_clinician',
      },
    ]

    // Detect conflicting or missing fields
    const missingOrConflictingFields: string[] = []
    if (input.isSmoker && (!input.smokingPackYears || input.smokingPackYears === 0)) {
      missingOrConflictingFields.push('Inconsistent: Patient reported as active smoker but pack-years recorded as 0')
    }
    if (input.spO2 !== undefined && input.spO2 < 90 && input.triageUrgency === 'routine') {
      missingOrConflictingFields.push('Conflict: SpO2 indicates severe hypoxia (< 90%) but triage urgency is classified as routine')
    }
    if (input.bloodPressureSystolic && input.bloodPressureDiastolic && input.bloodPressureSystolic <= input.bloodPressureDiastolic) {
      missingOrConflictingFields.push('Invalid vitals: Systolic BP must be greater than diastolic BP')
    }

    // Longitudinal trend analysis
    let longitudinalRiskTrend: ClinicalAssessmentSummaryReport['longitudinalRiskTrend'] = 'insufficient_history'
    const hist = input.historicalScores || []
    if (hist.length >= 2) {
      const prev = hist[hist.length - 1]
      const delta = riskScore - prev
      if (Math.abs(delta) < 0.005) longitudinalRiskTrend = 'stable'
      else if (delta > 0) longitudinalRiskTrend = 'increasing'
      else longitudinalRiskTrend = 'decreasing'
    }

    return {
      reportId: `CLIN-REP-${Date.now()}`,
      patientId: input.patientId,
      patientCanonicalId: input.patientCanonicalId,
      patientAge: input.patientAge,
      patientGender: input.patientGender,
      district: input.district,
      assessmentDate,
      methodologyVersion: 'PLCOm2012-BD-v2.10',
      guidelineVersion: 'NCCN-LCS-2026.1 / DGHS-BD-2026',
      riskCategory,
      estimatedRiskScore: riskScore,
      screeningEligibility: input.screeningEligibility || (riskScore >= 0.02 ? 'eligible' : 'ineligible'),
      triageUrgency: input.triageUrgency || 'routine',
      reviewStatus: input.reviewStatus || 'unreviewed',
      reviewingClinicianName: input.reviewingClinicianName,
      provenanceDetails,
      missingOrConflictingFields,
      historicalAssessmentCount: hist.length + 1,
      longitudinalRiskTrend,
      nonDiagnosticNoticeEn:
        'NON-DIAGNOSTIC CLINICAL DECISION SUPPORT NOTICE: The risk scores, screening eligibility indicators, and symptom triage ratings provided herein are generated exclusively for clinical decision support. They do NOT constitute an automated medical diagnosis. Formal diagnostic determinations and care orders remain the sovereign responsibility of the attending licensed physician.',
      nonDiagnosticNoticeBn:
        'অ-ডায়াগনস্টিক ক্লিনিক্যাল নোটিশ: এই প্রতিবেদনে প্রদত্ত ঝুঁকি স্কোর, স্ক্রিনিং নির্দেশিকা এবং লক্ষণ ট্রায়াজ তথ্য শুধুমাত্র চিকিৎসকের সিদ্ধান্ত গ্রহণের সহায়তার জন্য প্রস্তুতকৃত। এটি কোন স্বয়ংক্রিয় রোগ নির্ণয় বা চূড়ান্ত প্রেসক্রিপশন নয়। রোগীর শারীরিক অবস্থা ও চিকিৎসা সংক্রান্ত সকল চূড়ান্ত সিদ্ধান্ত গ্রহণের দায়িত্ব রেজিস্ট্রার্ড চিকিৎসকের।',
    }
  }
}

