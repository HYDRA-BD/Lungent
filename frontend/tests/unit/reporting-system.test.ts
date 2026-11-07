import { describe, it, expect } from 'vitest'
import {
  ReportingService,
  ReportingDataRetriever,
  PdfGenerator,
  renderPatientAssessmentReport,
  renderClinicalAssessmentReport,
  renderRiskEstimationReport,
  renderScreeningEligibilityReport,
  renderSymptomTriageReport,
  renderReferralFollowUpReport,
  renderConsolidatedHistoryReport,
} from '@/modules/reporting'
import type { ReportMetadata } from '@/modules/reporting/types'

describe('Centralized Reporting System (Phase 1.22)', () => {
  const patientId = '11111111-1111-4111-a111-111111111111'

  describe('1. Data Retrieval & Clinical Non-Recalculation', () => {
    it('retrieves patient assessment context without recalculating clinical outcomes', async () => {
      const context = await ReportingDataRetriever.compileReportContext({
        patientId,
        reportType: 'patient_assessment',
        language: 'en',
      })

      expect(context.meta.patientName).toContain('Rafiqul Islam')
      expect(context.meta.patientCanonicalId).toBe('LGT-2026-8K2M7P')
      expect(context.meta.reportReference).toMatch(/^RPT-2026-[A-Z0-9]+$/)
      expect(context.meta.templateVersion).toBe('1.22.0')
      expect(context.meta.methodologyVersion).toBeDefined()
      expect(context.payload.completionStatus).toBe('completed')
      expect(context.payload.patientReportedInfo.packYears).toBeGreaterThan(0)
    })

    it('compiles clinical assessment context preserving methodology, guideline, and protocol versions', async () => {
      const context = await ReportingDataRetriever.compileReportContext({
        patientId,
        reportType: 'clinical_assessment',
        language: 'en',
      })

      expect(context.payload.riskSection.methodologyName).toContain('PLCOm2012')
      expect(context.payload.screeningSection.guidelineName).toContain('USPSTF')
      expect(context.payload.triageSection.protocolName).toContain('NICE NG12')
      expect(context.payload.clinicianReview.reviewingClinicianName).toBeDefined()
    })

    it('compiles dedicated risk estimation context preserving input snapshot hash and calculated score', async () => {
      const context = await ReportingDataRetriever.compileReportContext({
        patientId,
        reportType: 'risk_estimation',
        language: 'en',
      })

      expect(context.payload.methodology.code).toBe('PLCOm2012')
      expect(context.payload.inputSnapshot.hash).toBeDefined()
      expect(context.payload.result.calculatedRiskPercentage).toBeGreaterThan(0)
      expect(context.payload.result.contributingFactors.length).toBeGreaterThan(0)
    })

    it('compiles dedicated screening eligibility context with criterion-by-criterion evaluations', async () => {
      const context = await ReportingDataRetriever.compileReportContext({
        patientId,
        reportType: 'screening_eligibility',
        language: 'en',
      })

      expect(context.payload.guideline.code).toBe('USPSTF-2021')
      expect(context.payload.criteriaEvaluations.length).toBeGreaterThanOrEqual(3)
      expect(context.payload.overallResult.outcome).toBe('eligible')
    })

    it('compiles dedicated symptom triage context with red-flag alarm symptoms', async () => {
      const context = await ReportingDataRetriever.compileReportContext({
        patientId,
        reportType: 'symptom_triage',
        language: 'en',
      })

      expect(context.payload.protocol.code).toBe('NICE-NG12')
      expect(context.payload.symptomsReported.length).toBeGreaterThanOrEqual(2)
      const redFlags = context.payload.symptomsReported.filter((s: { isRedFlag: boolean }) => s.isRedFlag)
      expect(redFlags.length).toBeGreaterThanOrEqual(1)
    })

    it('compiles referral and follow-up report context with status lifecycle', async () => {
      const context = await ReportingDataRetriever.compileReportContext({
        patientId,
        reportType: 'referral_followup',
        language: 'en',
      })

      expect(context.payload.referral.reference).toContain('REF-')
      expect(context.payload.referral.priority).toBe('urgent_2ww')
      expect(context.payload.referral.statusHistory.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('2. Dedicated Bilingual Report Templates', () => {
    const metaEn: ReportMetadata = {
      reportReference: 'RPT-2026-TEST01',
      patientId,
      patientCanonicalId: 'LGT-2026-8K2M7P',
      patientName: 'Rafiqul Islam',
      patientAge: 58,
      patientGender: 'Male',
      facilityName: 'National Institute of Diseases of the Chest & Hospital',
      methodologyVersion: 'PLCOm2012 v1.0',
      riskCategory: 'high',
      screeningEligibility: 'eligible',
      triageUrgency: 'urgent_assessment',
      reviewingClinicianName: 'Dr. Tahmina Akhtar',
      reviewingClinicianLicense: 'A-48912',
      generatedAt: '2026-11-06T10:00:00Z',
      language: 'en',
      templateVersion: '1.22.0',
    }

    const metaBn: ReportMetadata = {
      ...metaEn,
      reportReference: 'RPT-2026-TEST02',
      patientName: 'রফিকুল ইসলাম',
      patientGender: 'পুরুষ',
      facilityName: 'জাতীয় বক্ষব্যাধি ইনস্টিটিউট ও হাসপাতাল',
      reviewingClinicianName: 'ডাঃ তাহমিনা আক্তার',
      language: 'bn',
    }

    it('renders Patient Assessment Report in English and Bangla with clinical non-diagnostic caveats', () => {
      const htmlEn = renderPatientAssessmentReport({
        meta: metaEn,
        assessmentDate: '2026-11-06',
        completionStatus: 'completed',
        patientReportedInfo: { smokingStatus: 'former_smoker', packYears: 30 },
        assessmentFindings: {
          baselineCategory: 'high',
          screeningRecommendation: 'Eligible for Annual LDCT',
          symptomSummary: 'Persistent cough for 8 weeks',
        },
        missingInformation: [],
        recommendedNextSteps: ['Attend consultation'],
      })

      expect(htmlEn).toContain('Patient Lung Health Assessment Summary')
      expect(htmlEn).toContain('RPT-2026-TEST01')
      expect(htmlEn).toContain('HIGH')
      expect(htmlEn).toContain('does NOT constitute a definitive medical diagnosis')

      const htmlBn = renderPatientAssessmentReport({
        meta: metaBn,
        assessmentDate: '2026-11-06',
        completionStatus: 'completed',
        patientReportedInfo: { smokingStatus: 'former_smoker', packYears: 30 },
        assessmentFindings: {
          baselineCategory: 'high',
          screeningRecommendation: 'বাৎসরিক LDCT স্ক্রীনিং নির্দেশিত',
          symptomSummary: 'টানা ৮ সপ্তাহ কাশি',
        },
        missingInformation: [],
        recommendedNextSteps: ['চিকিৎসকের সাথে পরামর্শ করুন'],
      })

      expect(htmlBn).toContain('রোগীর ফুসফুস স্বাস্থ্য মূল্যায়ন সারসংক্ষেপ')
      expect(htmlBn).toContain('Hind Siliguri')
      expect(htmlBn).toContain('চূড়ান্ত চিকিৎসা নির্ণয়')
    })

    it('renders Clinical Assessment Report with consolidated sections and doctor review notes', () => {
      const html = renderClinicalAssessmentReport({
        meta: metaEn,
        assessmentId: 'asm-clin-001',
        reviewStatus: 'completed',
        demographicsSummary: {
          age: 58,
          gender: 'Male',
          smokingStatus: 'former_smoker',
          packYears: 32,
          comorbidities: ['COPD'],
        },
        riskSection: {
          methodologyName: 'PLCOm2012',
          methodologyVersion: 'v1.0.0',
          approvalStatus: 'Approved',
          riskCategory: 'high',
          calculatedRiskScore: 4.8,
          contributingFactors: ['Heavy smoking history'],
        },
        screeningSection: {
          guidelineName: 'USPSTF 2021',
          guidelineVersion: 'v2.1',
          approvalStatus: 'Approved',
          eligibilityOutcome: 'eligible',
          recommendationSummary: 'Annual LDCT indicated',
          evaluatedCriteria: [{ criterion: 'Age 50-80', result: 'met' }],
        },
        triageSection: {
          protocolName: 'NICE NG12',
          protocolVersion: 'v2023.2',
          urgencyLevel: 'urgent_assessment',
          concerningSymptoms: ['Hemoptysis'],
          recommendedEscalation: 'Urgent 2WW',
          timeframeDays: 14,
        },
        clinicianReview: {
          reviewingClinicianName: 'Dr. Tahmina Akhtar',
          bmdcLicense: 'A-48912',
          clinicalNotes: 'Immediate referral for thoracic imaging confirmed.',
        },
      })

      expect(html).toContain('Consolidated Clinical Assessment & Decision Support Report')
      expect(html).toContain('PLCOm2012')
      expect(html).toContain('USPSTF 2021')
      expect(html).toContain('NICE NG12')
      expect(html).toContain('Dr. Tahmina Akhtar')
      expect(html).toContain('A-48912')
    })

    it('renders dedicated Risk Estimation Report with population criteria and factor breakdown', () => {
      const html = renderRiskEstimationReport({
        meta: metaEn,
        methodology: {
          name: 'PLCOm2012 Risk Model',
          code: 'PLCOm2012',
          version: 'v1.0',
          approvalStatus: 'approved',
          targetPopulation: 'Adults aged 50-80',
          timeHorizonYears: 6,
        },
        inputSnapshot: {
          hash: 'abc123sha256hash',
          age: 58,
          gender: 'Male',
          smokingStatus: 'former_smoker',
          packYears: 30,
          familyHistoryLungCancer: false,
        },
        result: {
          riskCategory: 'high',
          calculatedRiskPercentage: 4.2,
          benchmarkComparisonPercentage: 1.2,
          contributingFactors: [
            { factor: 'Tobacco Exposure', direction: 'increases_risk', weightDescription: '+2.4%' },
          ],
        },
        limitations: ['Calibrated for asymptomatic individuals.'],
        approvedGuidance: 'Regular clinical follow-up indicated.',
      })

      expect(html).toContain('Lung Cancer Risk Estimation Report')
      expect(html).toContain('4.2%')
      expect(html).toContain('abc123sha256hash')
      expect(html).toContain('Tobacco Exposure')
    })

    it('renders dedicated Screening Eligibility Report with LDCT recommendation', () => {
      const html = renderScreeningEligibilityReport({
        meta: metaEn,
        guideline: {
          name: 'USPSTF 2021 Guideline',
          code: 'USPSTF-2021',
          version: 'v2.1',
          approvalStatus: 'approved',
          issuingBody: 'US Preventive Services Task Force',
          targetScreeningModality: 'Low-Dose CT',
        },
        criteriaEvaluations: [
          { criterionName: 'Age Range', requiredThreshold: '50-80', patientValue: '58', status: 'met' },
          { criterionName: 'Pack Years', requiredThreshold: '>= 20', patientValue: '30', status: 'met' },
        ],
        overallResult: {
          outcome: 'eligible',
          recommendationSummary: 'Eligible for annual screening.',
          recommendedIntervalMonths: 12,
          contraindicationsIdentified: [],
        },
        missingCriteria: [],
        guidelineReferences: ['JAMA 2021'],
        limitations: ['Shared decision-making required.'],
      })

      expect(html).toContain('Lung Cancer Screening Eligibility Report')
      expect(html).toContain('ELIGIBLE')
      expect(html).toContain('12 Months (Annual)')
      expect(html).toContain('USPSTF-2021')
    })

    it('renders dedicated Symptom Triage Report with urgent red-flag alerts', () => {
      const html = renderSymptomTriageReport({
        meta: metaEn,
        protocol: {
          name: 'NICE NG12 Protocol',
          code: 'NICE-NG12',
          version: 'v2023.2',
          approvalStatus: 'approved',
          issuingAuthority: 'NICE',
        },
        symptomsReported: [
          { name: 'Hemoptysis', status: 'present', durationWeeks: 3, isRedFlag: true, notes: 'Blood streaks daily' },
        ],
        triageOutcome: {
          urgencyLevel: 'urgent_assessment',
          recommendedPathway: '2-Week Wait Pulmonology',
          timeframeDays: 14,
          clinicalSummary: 'Mandatory urgent review due to hemoptysis.',
        },
        disclaimers: ['Does not replace biopsy.'],
      })

      expect(html).toContain('Symptom-Based Clinical Triage Evaluation Report')
      expect(html).toContain('CRITICAL RED-FLAG SYMPTOMS IDENTIFIED')
      expect(html).toContain('URGENT 2-WEEK WAIT')
      expect(html).toContain('Hemoptysis')
    })

    it('renders dedicated Referral and Follow-up Report with appointment timeline', () => {
      const html = renderReferralFollowUpReport({
        meta: metaEn,
        referral: {
          reference: 'REF-2026-9K2L4P',
          referringFacilityName: 'Dhamrai Clinic',
          destinationFacilityName: 'NIDCH',
          clinicalIndication: 'Hemoptysis investigation',
          priority: 'urgent_2ww',
          status: 'in_progress',
          recommendedDate: '2026-11-13',
          statusHistory: [{ status: 'pending', updatedAt: '2026-11-05' }],
        },
        followUps: [
          { followUpId: 'fu-01', purpose: 'Diagnostic Review', scheduledDate: '2026-11-13', facilityName: 'NIDCH', status: 'scheduled' },
        ],
      })

      expect(html).toContain('Healthcare Referral & Follow-up Clinical Summary Report')
      expect(html).toContain('REF-2026-9K2L4P')
      expect(html).toContain('URGENT 2-WEEK WAIT')
      expect(html).toContain('Diagnostic Review')
    })

    it('renders Consolidated Longitudinal History Report', () => {
      const html = renderConsolidatedHistoryReport({
        meta: metaEn,
        totalAssessmentsCount: 3,
        earliestAssessmentDate: '2026-08-14',
        latestAssessmentDate: '2026-11-06',
        timeline: [
          { id: 'asm-01', date: '2026-11-06', type: 'clinical', status: 'completed', resultSummary: 'High Risk' },
        ],
      })

      expect(html).toContain('Consolidated Longitudinal Assessment History')
      expect(html).toContain('3')
      expect(html).toContain('2026-08-14')
    })
  })

  describe('3. Standards-Compliant PDF 1.4 Binary Generator', () => {
    it('generates a valid binary PDF 1.4 document buffer', async () => {
      const reports = await ReportingService.getReports({ patientId })
      expect(reports.length).toBeGreaterThan(0)

      const report = reports[0]
      const pdfBytes = PdfGenerator.generatePdf(report)

      expect(pdfBytes).toBeDefined()
      expect(pdfBytes.byteLength).toBeGreaterThan(500)
      expect(pdfBytes.constructor.name).toBe('Uint8Array')

      const pdfHeader = new TextDecoder('utf-8').decode(pdfBytes.slice(0, 8))
      expect(pdfHeader).toContain('%PDF-1.4')

      const pdfFullText = new TextDecoder('latin1').decode(pdfBytes)
      expect(pdfFullText).toContain('/Type /Catalog')
      expect(pdfFullText).toContain('/Type /Pages')
      expect(pdfFullText).toContain('/Type /Page')
      expect(pdfFullText).toContain('/F1')
      expect(pdfFullText).toContain('/F2')
      expect(pdfFullText).toContain('xref')
      expect(pdfFullText).toContain('trailer')
      expect(pdfFullText).toContain('startxref')
      expect(pdfFullText).toContain('%%EOF')
    })
  })

  describe('4. Central Reporting Service, Archive & Audit Logging', () => {
    it('generates a new report and persists it to the archive', async () => {
      const newReport = await ReportingService.generateReport({
        patientId,
        reportType: 'risk_estimation',
        language: 'bn',
        customNotes: 'নিয়মিত ফলো-আপ প্রয়োজন',
      })

      expect(newReport.id).toBeDefined()
      expect(newReport.reportReference).toMatch(/^RPT-2026-[A-Z0-9]+$/)
      expect(newReport.reportType).toBe('risk_estimation')
      expect(newReport.language).toBe('bn')
      expect(newReport.fileSizeBytes).toBeGreaterThan(0)
      expect(newReport.contentHtml).toContain('Hind Siliguri')

      // Retrieve report by reference
      const retrieved = await ReportingService.getReportById(newReport.reportReference)
      expect(retrieved).not.toBeNull()
      expect(retrieved?.id).toBe(newReport.id)
    })

    it('filters reports by type and language', async () => {
      const bnReports = await ReportingService.getReports({ language: 'bn' })
      expect(bnReports.every((r) => r.language === 'bn')).toBe(true)

      const patReports = await ReportingService.getReports({ reportType: 'patient_assessment' })
      expect(patReports.every((r) => r.reportType === 'patient_assessment')).toBe(true)
    })

    it('logs access audit trails on view, download, and print actions', async () => {
      const reports = await ReportingService.getReports({ patientId })
      const report = reports[0]

      const auditEvent = await ReportingService.logReportAccess(
        report.id,
        'user-clinician-123',
        'clinician',
        'download_pdf',
        '192.168.1.10',
        'Mozilla/5.0'
      )

      expect(auditEvent.id).toBeDefined()
      expect(auditEvent.reportId).toBe(report.id)
      expect(auditEvent.accessType).toBe('download_pdf')
      expect(auditEvent.userRole).toBe('clinician')

      const auditList = await ReportingService.getAuditLogs(report.id)
      expect(auditList.some((a) => a.id === auditEvent.id)).toBe(true)
    })
  })
})
