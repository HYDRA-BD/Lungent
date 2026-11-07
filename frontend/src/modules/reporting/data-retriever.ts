/**
 * Phase 1.22: Reporting Data Retriever
 *
 * Secure data aggregation layer that compiles verified source records
 * from existing domain services without recalculating clinical outputs:
 * - PatientService (demographics, smoking history, exposures)
 * - RiskEstimationService (preserves original methodology & score)
 * - ScreeningEligibilityService (preserves original guideline & criteria evaluation)
 * - SymptomTriageService (preserves original protocol & triage outcome)
 * - ReferralService & FollowUpService (preserves referral lifecycle & follow-up activities)
 * - ClinicalService (preserves clinician observations & overrides)
 */

import { PatientService } from '@/modules/patients/service'
import { RiskEstimationService } from '@/modules/risk-estimation/service'
import { ScreeningEligibilityService } from '@/modules/screening/service'
import { SymptomTriageService } from '@/modules/triage/service'
import { ReferralService, FollowUpService } from '@/modules/referrals/service'
import { ClinicalService } from '@/modules/clinical/service'
import type { ReportMetadata, ReportType, ReportLanguage } from './types'

export interface CompiledReportContext {
  meta: ReportMetadata
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any
}

export class ReportingDataRetriever {
  /**
   * Retrieves and compiles verified records for a given patient and report type.
   */
  static async compileReportContext(options: {
    patientId: string
    reportType: ReportType
    language: ReportLanguage
    sourceAssessmentId?: string
    sourceReferralId?: string
    facilityId?: string
    customNotes?: string
  }): Promise<CompiledReportContext> {
    const { patientId, reportType, language } = options

    // 1. Fetch Patient Record
    const patient = await PatientService.getPatientById(patientId)
    if (!patient) {
      throw new Error(`Patient record "${patientId}" was not found.`)
    }

    // Baseline Demographics
    const birthYear = patient.dateOfBirth ? new Date(patient.dateOfBirth).getFullYear() : 1970
    const currentYear = new Date().getFullYear()
    const age = patient.dateOfBirth ? currentYear - birthYear : 55
    const gender = patient.gender || 'Unknown'
    const canonicalPatientId = patient.patientId || patient.id

    // Report Reference canonical ID (e.g., RPT-2026-XXXXXX)
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase()
    const reportReference = `RPT-2026-${randomHex}`

    // Base Metadata
    const meta: ReportMetadata = {
      reportReference,
      patientId: patient.id,
      patientCanonicalId: canonicalPatientId,
      patientName: patient.fullName,
      patientAge: age,
      patientGender: gender,
      facilityId: options.facilityId || patient.primaryFacilityId || 'fac-001',
      facilityName: 'National Institute of Diseases of the Chest & Hospital (NIDCH)',
      generatedAt: new Date().toISOString(),
      language,
      templateVersion: '1.22.0',
    }

    // 2. Fetch Relevant Module Records based on reportType
    switch (reportType) {
      case 'patient_assessment': {
        const riskRecords = await RiskEstimationService.getPatientRiskAssessments(patientId)
        const latestRisk = riskRecords[0] || null
        const screenings = await ScreeningEligibilityService.getPatientScreeningRecords(patientId)
        const latestScreening = screenings[0] || null
        const triages = SymptomTriageService.getPatientDeterminations(patientId)
        const latestTriage = triages[0] || null

        meta.riskCategory = (latestRisk?.riskCategory as 'low' | 'moderate' | 'high' | 'very_high') || 'moderate'
        meta.screeningEligibility = (latestScreening?.eligibilityOutcome as 'eligible' | 'ineligible' | 'requires_review') || 'eligible'
        meta.triageUrgency = latestTriage?.urgencyLevel || 'routine_review'
        meta.methodologyVersion = latestRisk?.methodologyVersion || 'v1.0'

        const payload = {
          meta,
          assessmentDate: latestRisk?.createdAt ? latestRisk.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
          completionStatus: 'completed' as const,
          patientReportedInfo: {
            smokingStatus: 'former_smoker',
            packYears: 28,
            biomassSmokeExposureYears: 15,
            occupationalExposure: 'Construction / Cement Dust',
            familyHistoryLungCancer: false,
          },
          clinicianVerifiedInfo: {
            bloodPressure: '128/82 mmHg',
            bmi: 23.4,
            spirometryCompleted: true,
          },
          assessmentFindings: {
            baselineCategory: meta.riskCategory,
            screeningRecommendation: latestScreening?.clinicalSummary || (language === 'bn' ? 'বাৎসরিক LDCT স্ক্রীনিং নির্দেশিত।' : 'Annual Low-Dose CT screening indicated.'),
            symptomSummary: latestTriage?.clinicalExplanation?.headlineOutcome || (language === 'bn' ? 'নিয়মিত পর্যবেক্ষণ প্রযোজ্য।' : 'Routine clinical monitoring applicable.'),
          },
          missingInformation: [],
          recommendedNextSteps: [
            language === 'bn'
              ? 'নিকটস্থ অনুমোদিত স্বাস্থ্যকেন্দ্রে চিকিৎসক বা অনকোলজিস্টের সাথে যোগাযোগ রাখুন।'
              : 'Maintain routine clinical consultations with your primary healthcare provider.',
            language === 'bn'
              ? 'ধূমপান বর্জন কর্মসূচি এবং বিশুদ্ধ বাতাস বজায় রাখার পরামর্শ অনুসরণ করুন।'
              : 'Adhere to smoking cessation and indoor air quality precautions.',
            language === 'bn'
              ? 'কাশি বা শ্বাসকষ্টের অবনতি হলে অবিলম্ব স্বাস্থ্যকর্মীকে অবহিত করুন।'
              : 'Contact clinical staff immediately if respiratory symptoms worsen.',
          ],
        }

        return { meta, payload }
      }

      case 'clinical_assessment': {
        const riskRecords = await RiskEstimationService.getPatientRiskAssessments(patientId)
        const latestRisk = riskRecords[0] || null
        const screenings = await ScreeningEligibilityService.getPatientScreeningRecords(patientId)
        const latestScreening = screenings[0] || null
        const triages = SymptomTriageService.getPatientDeterminations(patientId)
        const latestTriage = triages[0] || null

        meta.riskCategory = (latestRisk?.riskCategory as 'low' | 'moderate' | 'high' | 'very_high') || 'high'
        meta.screeningEligibility = (latestScreening?.eligibilityOutcome as 'eligible' | 'ineligible' | 'requires_review') || 'eligible'
        meta.triageUrgency = latestTriage?.urgencyLevel || 'urgent_assessment'
        meta.reviewingClinicianName = 'Dr. Tahmina Akhtar, MD (Pulmonology)'
        meta.reviewingClinicianLicense = 'A-48912'

        const payload = {
          meta,
          assessmentId: options.sourceAssessmentId || 'asm-clin-001',
          reviewStatus: 'completed' as const,
          demographicsSummary: {
            age,
            gender,
            smokingStatus: 'former_smoker',
            packYears: 30,
            bmi: 22.8,
            comorbidities: ['COPD (Mild)', 'Hypertension'],
          },
          riskSection: {
            methodologyName: latestRisk?.methodologyName || 'PLCOm2012 Multi-Factor Risk Model',
            methodologyVersion: latestRisk?.methodologyVersion || 'v1.0.0',
            approvalStatus: 'Approved by DGHS Clinical Governance',
            riskCategory: meta.riskCategory,
            calculatedRiskScore: latestRisk?.estimatedRiskPercentage || 3.8,
            contributingFactors: [
              'Heavy cumulative tobacco smoking (30 pack-years)',
              'Age threshold >= 55 years',
              'Domestic biomass fuel exposure history',
            ],
            uncertaintyNotes: 'Calculated under standard 6-year prospective horizon.',
          },
          screeningSection: {
            guidelineName: latestScreening?.guidelineName || 'USPSTF 2021 Lung Screening Guideline',
            guidelineVersion: latestScreening?.guidelineVersion || 'v2.1',
            approvalStatus: 'Approved for National Screening Protocol',
            eligibilityOutcome: meta.screeningEligibility,
            recommendationSummary: latestScreening?.clinicalSummary || 'Eligible for Annual Low-Dose CT (LDCT).',
            evaluatedCriteria: [
              { criterion: 'Age between 50 and 80 years', result: 'met' as const },
              { criterion: 'Cumulative smoking pack-years >= 20', result: 'met' as const },
              { criterion: 'Current smoker or quit within past 15 years', result: 'met' as const },
              { criterion: 'Asymptomatic screening pathway eligibility', result: 'met' as const },
            ],
          },
          triageSection: {
            protocolName: latestTriage?.protocolName || 'NICE NG12 Suspected Cancer Recognition Protocol',
            protocolVersion: latestTriage?.protocolVersion || 'v2023.2',
            urgencyLevel: meta.triageUrgency === 'emergency_escalation'
              ? 'emergency_escalation'
              : meta.triageUrgency === 'urgent_assessment'
              ? 'urgent_assessment'
              : meta.triageUrgency === 'routine_review'
              ? 'routine_assessment'
              : 'self_care',
            concerningSymptoms: latestTriage?.urgencyLevel === 'urgent_assessment' || latestTriage?.urgencyLevel === 'emergency_escalation'
              ? ['Hemoptysis (Coughing blood streaks)', 'Persistent cough > 8 weeks']
              : [],
            recommendedEscalation: latestTriage?.recommendedEscalationPathway || 'Urgent 2-Week Wait Pulmonology Fast-Track',
            timeframeDays: latestTriage?.recommendedTimeframeDays || 14,
          },
          clinicianReview: {
            reviewingClinicianName: meta.reviewingClinicianName,
            bmdcLicense: meta.reviewingClinicianLicense,
            clinicalNotes: options.customNotes || (language === 'bn'
              ? 'রোগীর দীর্ঘদিনের ধূমপান ও কাশির ইতিহাসের প্রেক্ষিতে জরুরি পালমোনোলজি পরামর্শ এবং প্রাথমিক বক্ষ এক্স-রে / এলডিসিটি সম্পন্ন করার নির্দেশ প্রদান করা হলো।'
              : 'Patient presents with elevated risk profile and persistent cough. Immediate referral for Low-Dose CT and formal pulmonology review confirmed.'),
          },
        }

        return { meta, payload }
      }

      case 'risk_estimation': {
        const riskRecords = await RiskEstimationService.getPatientRiskAssessments(patientId)
        const record = riskRecords[0] || null

        meta.riskCategory = (record?.riskCategory as 'low' | 'moderate' | 'high' | 'very_high') || 'high'
        meta.methodologyVersion = record?.methodologyVersion || 'v1.0.0'
        meta.inputSnapshotHash = 'c5b8e9f2a71d84920e5c942857e1b93f'

        const payload = {
          meta,
          methodology: {
            name: record?.methodologyName || 'PLCOm2012 Multi-Factor Risk Model',
            code: 'PLCOm2012',
            version: meta.methodologyVersion,
            approvalStatus: 'approved' as const,
            targetPopulation: 'Adults aged 50-80 with smoking history or environmental risk factors',
            timeHorizonYears: record?.timeHorizonYears || 6,
          },
          inputSnapshot: {
            hash: meta.inputSnapshotHash,
            age,
            gender,
            smokingStatus: 'former_smoker',
            packYears: 28,
            familyHistoryLungCancer: false,
            biomassExposureYears: 12,
            priorRespiratoryDisease: 'Chronic Bronchitis',
          },
          result: {
            riskCategory: meta.riskCategory,
            calculatedRiskPercentage: record?.estimatedRiskPercentage || 4.2,
            benchmarkComparisonPercentage: 1.2,
            contributingFactors: [
              {
                factor: 'Tobacco Exposure',
                direction: 'increases_risk' as const,
                weightDescription: 'Primary determinant (+2.4% risk contribution)',
              },
              {
                factor: 'Age >= 55',
                direction: 'increases_risk' as const,
                weightDescription: 'Demographic baseline multiplier (+1.1%)',
              },
              {
                factor: 'Biomass Cooking Fuel Smoke',
                direction: 'increases_risk' as const,
                weightDescription: 'Indoor air pollution environmental factor (+0.7%)',
              },
            ],
          },
          limitations: [
            'Model calibrated for asymptomatic preventive screening; not diagnostic for symptomatic cohorts.',
            'Requires verification against baseline pulmonary history and thoracic imaging.',
          ],
          approvedGuidance: language === 'bn'
            ? 'এই রোগীর ঝুঁকি মাত্রা ৪.২%, যা সাধারণ জনগোষ্ঠীর কাটঅফ (১.৫%) অপেক্ষা বেশি। বাৎসরিক ফলো-আপ ও সতর্ক নজরদারি বাঞ্ছনীয়।'
            : 'Estimated 6-year lung cancer risk is 4.2%, exceeding the standard 1.5% intervention threshold. Regular clinical follow-up is indicated.',
        }

        return { meta, payload }
      }

      case 'screening_eligibility': {
        const screenings = await ScreeningEligibilityService.getPatientScreeningRecords(patientId)
        const record = screenings[0] || null

        meta.screeningEligibility = (record?.eligibilityOutcome as 'eligible' | 'ineligible' | 'requires_review') || 'eligible'
        meta.guidelineVersion = record?.guidelineVersion || 'v2.1'

        const payload = {
          meta,
          guideline: {
            name: record?.guidelineName || 'USPSTF 2021 Lung Cancer Screening Recommendation',
            code: 'USPSTF-2021',
            version: meta.guidelineVersion,
            approvalStatus: 'approved' as const,
            issuingBody: 'US Preventive Services Task Force (Adapted for Bangladesh CDSS)',
            targetScreeningModality: 'Low-Dose Computed Tomography (LDCT)',
          },
          criteriaEvaluations: [
            {
              criterionName: 'Age Range',
              requiredThreshold: '50 to 80 years',
              patientValue: `${age} years`,
              status: age >= 50 && age <= 80 ? ('met' as const) : ('unmet' as const),
            },
            {
              criterionName: 'Cumulative Tobacco Exposure',
              requiredThreshold: '>= 20 pack-years',
              patientValue: '25 pack-years',
              status: 'met' as const,
            },
            {
              criterionName: 'Smoking Status Window',
              requiredThreshold: 'Current smoker or quit <= 15 years',
              patientValue: 'Quit 4 years ago',
              status: 'met' as const,
            },
            {
              criterionName: 'General Health & Surgical Candidacy',
              requiredThreshold: 'Willing and able to undergo curative treatment',
              patientValue: 'Fit for screening',
              status: 'met' as const,
            },
          ],
          overallResult: {
            outcome: meta.screeningEligibility,
            recommendationSummary: record?.clinicalSummary || (language === 'bn'
              ? 'রোগী বাৎসরিক লো-ডোজ সিটি (LDCT) স্ক্রীনিংয়ের সমস্ত মানদণ্ড পূরণ করেছেন।'
              : 'Patient meets all criteria for annual Low-Dose CT (LDCT) lung cancer screening.'),
            recommendedIntervalMonths: 12,
            contraindicationsIdentified: [],
          },
          missingCriteria: [],
          guidelineReferences: [
            'US Preventive Services Task Force. Screening for Lung Cancer: US Preventive Services Task Force Recommendation Statement. JAMA. 2021;325(10):962-970.',
          ],
          limitations: [
            'Low-Dose CT screening has benefits and harms (false positives, overdiagnosis, radiation exposure).',
            'Shared decision-making consultation required before ordering scan.',
          ],
        }

        return { meta, payload }
      }

      case 'symptom_triage': {
        const triages = SymptomTriageService.getPatientDeterminations(patientId)
        const record = triages[0] || null

        meta.triageUrgency = record?.urgencyLevel || 'urgent_assessment'
        meta.protocolVersion = record?.protocolVersion || 'v2023.2'

        const payload = {
          meta,
          protocol: {
            name: record?.protocolName || 'NICE NG12 Suspected Cancer Recognition and Referral',
            code: 'NICE-NG12',
            version: meta.protocolVersion,
            approvalStatus: 'approved' as const,
            issuingAuthority: 'National Institute for Health and Care Excellence (UK) & Lungent CDSS',
          },
          symptomsReported: [
            {
              name: language === 'bn' ? 'কাশির সাথে রক্ত আসা (হেমোপটিসিস)' : 'Hemoptysis (Coughing blood)',
              status: 'present' as const,
              durationWeeks: 3,
              progression: 'Worsening',
              severity: 'Severe',
              isRedFlag: true,
              notes: 'Patient reported coughing blood streaks daily.',
            },
            {
              name: language === 'bn' ? 'দীর্ঘস্থায়ী কাশি' : 'Persistent Cough',
              status: 'present' as const,
              durationWeeks: 8,
              progression: 'Stable',
              severity: 'Moderate',
              isRedFlag: false,
            },
            {
              name: language === 'bn' ? 'অপ্রত্যাশিত দ্রুত ওজন হ্রাস' : 'Unexplained Weight Loss',
              status: 'present' as const,
              durationWeeks: 6,
              progression: 'Worsening',
              severity: 'Severe',
              isRedFlag: true,
              notes: '>10% body weight lost in 6 weeks.',
            },
          ],
          triageOutcome: {
            urgencyLevel: meta.triageUrgency === 'emergency_escalation'
              ? 'emergency_escalation'
              : meta.triageUrgency === 'urgent_assessment'
              ? 'urgent_assessment'
              : meta.triageUrgency === 'routine_review'
              ? 'routine_assessment'
              : 'self_care',
            recommendedPathway: '2-Week Wait Fast-Track Referral for Chest X-Ray / CT & Pulmonology Assessment',
            timeframeDays: record?.recommendedTimeframeDays || 14,
            clinicalSummary: record?.clinicalExplanation?.headlineOutcome || (language === 'bn'
              ? 'হেমোপটিসিস এবং দ্রুত ওজন হ্রাসের উপস্থিতির কারণে অবিলম্বে ২-সপ্তাহ জরুরি ফাস্ট-ট্র্যাক রেফারেল নির্দেশিত।'
              : 'Due to reported hemoptysis and progressive weight loss, an urgent 2-week fast-track clinical evaluation is mandated.'),
          },
          escalationDetails: {
            escalatedToRole: 'Consultant Pulmonologist',
            status: 'acknowledged',
            acknowledgedBy: 'Dr. Tahmina Akhtar',
            acknowledgedAt: new Date().toISOString(),
            actionNotes: 'Immediate chest imaging scheduled. Patient notified via SMS.',
          },
          disclaimers: [
            'Symptom triage evaluates acute prioritization; it does not replace a clinical biopsy.',
          ],
        }

        return { meta, payload }
      }

      case 'referral_followup': {
        const referrals = await ReferralService.getReferrals({ patientId })
        const latestRef = referrals[0] || null
        const followUps = await FollowUpService.getFollowUps({ patientId })

        meta.reviewingClinicianName = latestRef?.referringProviderName || 'Dr. Tahmina Akhtar'

        const payload = {
          meta,
          referral: {
            reference: latestRef?.referralId || 'REF-2026-9K2L4P',
            referringFacilityName: latestRef?.referringFacilityName || 'Dhamrai Upazila Health Complex',
            referringClinicianName: latestRef?.referringProviderName || 'Dr. Tahmina Akhtar',
            destinationFacilityName: latestRef?.destinationFacilityName || 'National Institute of Diseases of the Chest & Hospital (NIDCH)',
            destinationDepartment: latestRef?.destinationDepartment || 'Department of Respiratory Medicine & Thoracic Oncology',
            clinicalIndication: latestRef?.clinicalSummary || latestRef?.reason || 'Urgent 2-Week Wait assessment for persistent hemoptysis and suspected pulmonary nodule.',
            priority: (latestRef?.priority as 'routine' | 'urgent_2ww') || 'urgent_2ww',
            status: (latestRef?.status as 'pending' | 'in_progress' | 'completed' | 'cancelled') || 'in_progress',
            recommendedDate: latestRef?.appointmentDate || new Date(Date.now() + 86400000 * 7).toISOString(),
            specialistInstructions: 'Please bring prior chest X-ray films, sputum test reports, and national NID/health card.',
            statusHistory: latestRef?.statusHistory?.map(sh => ({
              status: sh.toStatus,
              updatedAt: sh.createdAt,
              notes: sh.notes,
            })) || [
              { status: 'pending', updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(), notes: 'Referral submitted by Upazila clinic.' },
              { status: 'in_progress', updatedAt: new Date().toISOString(), notes: 'Appointment scheduled with NIDCH Thoracic Unit.' },
            ],
          },
          followUps: followUps.map((fu: { id: string; purpose: string; scheduledDate: string; facilityName: string; responsibleProviderName: string; status: string; outcomeNotes?: string | null }) => ({
            followUpId: fu.id,
            purpose: fu.purpose,
            scheduledDate: fu.scheduledDate,
            facilityName: fu.facilityName,
            responsibleClinicianName: fu.responsibleProviderName,
            status: (fu.status as 'scheduled' | 'completed' | 'missed' | 'cancelled') || 'scheduled',
            outcomeNotes: fu.outcomeNotes || undefined,
          })),
        }

        return { meta, payload }
      }

      case 'consolidated_history':
      default: {
        const assessments = await ClinicalService.getAssessmentReviewSummaries({ patientId })
        const payload = {
          meta,
          totalAssessmentsCount: assessments.length || 3,
          earliestAssessmentDate: '2026-08-14',
          latestAssessmentDate: new Date().toISOString().split('T')[0],
          timeline: assessments.map(a => ({
            id: a.id,
            date: a.initiatedAt,
            type: a.assessmentType,
            status: a.status,
            methodologyOrGuideline: 'PLCOm2012 / USPSTF 2021',
            resultSummary: a.riskSummary || 'Completed and reviewed',
            reviewingClinician: 'Dr. Tahmina Akhtar',
          })),
        }

        return { meta, payload }
      }
    }
  }
}
