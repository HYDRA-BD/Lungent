/**
 * Phase 1.22: Centralized Reporting Service
 *
 * Orchestrates report generation, template selection, database persistence,
 * in-memory fallback cache, PDF stream generation, and audit logging.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import type { Json } from '@/types/database'
import type {
  GeneratedReportRecord,
  GenerateReportInput,
  ReportFilterOptions,
  ReportAccessAuditRecord,
  ReportAccessType,
  ReportType,
  ReportLanguage,
} from './types'

function getAdminSupabaseSafe() {
  try {
    return createAdminClient()
  } catch {
    return null
  }
}
import { ReportingDataRetriever } from './data-retriever'
import { PdfGenerator } from './pdf-generator'
import { renderPatientAssessmentReport } from './templates/patient-assessment'
import { renderClinicalAssessmentReport } from './templates/clinical-assessment'
import { renderRiskEstimationReport } from './templates/risk-estimation'
import { renderScreeningEligibilityReport } from './templates/screening-eligibility'
import { renderSymptomTriageReport } from './templates/symptom-triage'
import { renderReferralFollowUpReport } from './templates/referral-followup'
import { renderConsolidatedHistoryReport } from './templates/consolidated-history'

export class ReportingService {
  private static reports: Map<string, GeneratedReportRecord> = new Map()
  private static auditLogs: Map<string, ReportAccessAuditRecord[]> = new Map()
  private static initialized = false

  /**
   * Initializes benchmark reports for demo patients.
   */
  private static ensureInitialized() {
    if (this.initialized) return
    this.initialized = true

    const rafiqulId = '11111111-1111-4111-a111-111111111111'
    this.seedBenchmarkReports(rafiqulId)
  }

  /**
   * Seeds benchmark reports for a given patient.
   */
  static seedBenchmarkReports(patientId: string) {
    const now = new Date().toISOString()

    // 1. Benchmark Patient Assessment Report (English)
    const patRptId = 'rpt-pat-001'
    const patMeta = {
      reportReference: 'RPT-2026-8K2M7P',
      patientId,
      patientCanonicalId: 'LGT-2026-8K2M7P',
      patientName: 'Rafiqul Islam',
      patientAge: 58,
      patientGender: 'Male',
      facilityId: 'fac-001',
      facilityName: 'National Institute of Diseases of the Chest & Hospital (NIDCH)',
      methodologyVersion: 'PLCOm2012 v1.0',
      riskCategory: 'high' as const,
      screeningEligibility: 'eligible' as const,
      triageUrgency: 'urgent_assessment' as const,
      reviewingClinicianName: 'Dr. Tahmina Akhtar, MD',
      reviewingClinicianLicense: 'A-48912',
      generatedAt: now,
      language: 'en' as ReportLanguage,
      templateVersion: '1.22.0',
    }

    const patHtml = renderPatientAssessmentReport({
      meta: patMeta,
      assessmentDate: '2026-11-06',
      completionStatus: 'completed',
      patientReportedInfo: {
        smokingStatus: 'former_smoker',
        packYears: 32,
        biomassSmokeExposureYears: 10,
        occupationalExposure: 'Shipyard Welding & Construction',
        familyHistoryLungCancer: false,
      },
      clinicianVerifiedInfo: {
        bloodPressure: '130/84 mmHg',
        bmi: 23.1,
        spirometryCompleted: true,
      },
      assessmentFindings: {
        baselineCategory: 'high',
        screeningRecommendation: 'Eligible for Annual Low-Dose CT (LDCT) Screening.',
        symptomSummary: 'Persistent cough for 8 weeks and intermittent hemoptysis reported.',
      },
      missingInformation: [],
      recommendedNextSteps: [
        'Attend scheduled Low-Dose CT imaging appointment at NIDCH Thoracic Unit.',
        'Follow smoke-free lifestyle recommendations and avoid secondary smoke.',
        'Report any acute shortness of breath or increased hemoptysis immediately.',
      ],
    })

    const rpt1: GeneratedReportRecord = {
      id: patRptId,
      reportReference: patMeta.reportReference,
      patientId,
      patientCanonicalId: patMeta.patientCanonicalId,
      patientName: patMeta.patientName,
      reportType: 'patient_assessment',
      title: 'Patient Lung Health Assessment Summary',
      summary: 'Patient assessment summary indicating high baseline risk and eligibility for annual LDCT.',
      language: 'en',
      templateVersion: '1.22.0',
      sourceAssessmentId: 'asm-001',
      sourceReferralId: null,
      sourceMetadata: patMeta,
      contentHtml: patHtml,
      fileSizeBytes: Buffer.byteLength(patHtml, 'utf-8'),
      storagePath: '/documents/secure/rpt-pat-001.pdf',
      generatedByUserId: 'usr-clinician-001',
      generatedByRole: 'clinician',
      facilityId: 'fac-001',
      status: 'final',
      isPatientAccessible: true,
      createdAt: now,
      updatedAt: now,
    }
    this.reports.set(rpt1.id, rpt1)

    // 2. Benchmark Clinical Assessment Report (Bangla)
    const clinRptId = 'rpt-clin-002'
    const clinMeta = {
      reportReference: 'RPT-2026-9L3K8Q',
      patientId,
      patientCanonicalId: 'LGT-2026-8K2M7P',
      patientName: 'রফিকুল ইসলাম (Rafiqul Islam)',
      patientAge: 58,
      patientGender: 'পুরুষ (Male)',
      facilityId: 'fac-001',
      facilityName: 'জাতীয় বক্ষব্যাধি ইনস্টিটিউট ও হাসপাতাল (NIDCH)',
      methodologyVersion: 'PLCOm2012 v1.0.0',
      guidelineVersion: 'USPSTF 2021 v2.1',
      protocolVersion: 'NICE NG12 v2023.2',
      riskCategory: 'high' as const,
      screeningEligibility: 'eligible' as const,
      triageUrgency: 'urgent_assessment' as const,
      reviewingClinicianName: 'ডাঃ তাহমিনা আক্তার (Dr. Tahmina Akhtar)',
      reviewingClinicianLicense: 'A-48912',
      generatedAt: now,
      language: 'bn' as ReportLanguage,
      templateVersion: '1.22.0',
    }

    const clinHtml = renderClinicalAssessmentReport({
      meta: clinMeta,
      assessmentId: 'asm-clin-002',
      reviewStatus: 'completed',
      demographicsSummary: {
        age: 58,
        gender: 'পুরুষ (Male)',
        smokingStatus: 'সাবেক ধূমপায়ী (Former Smoker)',
        packYears: 32,
        bmi: 23.1,
        comorbidities: ['সিওপিডি (COPD)', 'উচ্চ রক্তচাপ (Hypertension)'],
      },
      riskSection: {
        methodologyName: 'পিএলসিও-এম২০১২ মাল্টি-ফ্যাক্টর রিস্ক মডেল (PLCOm2012)',
        methodologyVersion: 'v1.0.0',
        approvalStatus: 'ডিজিএইচএস অনুমোদিত (Approved)',
        riskCategory: 'high',
        calculatedRiskScore: 4.8,
        contributingFactors: [
          'দীর্ঘ ৩২ প্যাক-বছরের ধূমপানের ইতিহাস',
          'বয়স ৫৮ বছর (উচ্চ ঝুঁকি বয়সসীমা ৫০-৮০ অন্তর্ভুক্ত)',
          'পেশাগত ধুলোবালি ও বায়োমাস চুলার ধোঁয়ার ইতিহাস',
        ],
        uncertaintyNotes: '৬-বছরের সম্ভাব্য ঝুঁকির ভিত্তিতে প্রণীত।',
      },
      screeningSection: {
        guidelineName: 'ইউএসপিএসটিএফ ২০২১ ফুসফুস স্ক্রীনিং নির্দেশিকা',
        guidelineVersion: 'v2.1',
        approvalStatus: 'অনুমোদিত',
        eligibilityOutcome: 'eligible',
        recommendationSummary: 'বাৎসরিক লো-ডোজ সিটি (LDCT) স্ক্রীনিং যোগ্য।',
        evaluatedCriteria: [
          { criterion: 'বয়স ৫০ থেকে ৮০ বছর', result: 'met' },
          { criterion: 'ধূমপানের মাত্রা ২০ প্যাক-বছর বা বেশি', result: 'met' },
          { criterion: 'বর্তমান ধূমপায়ী অথবা গত ১৫ বছরের মধ্যে বর্জনকারী', result: 'met' },
          { criterion: 'ক্যান্সার চিকিৎসায় শারীরিক উপযুক্ততা', result: 'met' },
        ],
      },
      triageSection: {
        protocolName: 'নাইস এনজি১২ নির্দেশিকা (NICE NG12)',
        protocolVersion: 'v2023.2',
        urgencyLevel: 'urgent_assessment',
        concerningSymptoms: ['কাশির সাথে রক্ত আসা (হেমোপটিসিস)', '৮ সপ্তাহের বেশি স্থায়ী কাশি'],
        recommendedEscalation: 'জরুরি ২-সপ্তাহ পালমোনোলজি ফাস্ট-ট্র্যাক',
        timeframeDays: 14,
      },
      clinicianReview: {
        reviewingClinicianName: 'ডাঃ তাহমিনা আক্তার',
        bmdcLicense: 'A-48912',
        clinicalNotes: 'রোগীর কাশির সাথে রক্ত যাওয়ার ইতিহাস এবং উচ্চ ধূমপানের পরিপ্রেক্ষিতে জরুরি বক্ষ এক্স-রে ও অনকোলজি সমন্বয় নিশ্চিত করা হলো।',
      },
    })

    const rpt2: GeneratedReportRecord = {
      id: clinRptId,
      reportReference: clinMeta.reportReference,
      patientId,
      patientCanonicalId: clinMeta.patientCanonicalId,
      patientName: clinMeta.patientName,
      reportType: 'clinical_assessment',
      title: 'সমন্বিত ক্লিনিক্যাল মূল্যায়ন ও সিদ্ধান্ত সহায়তা প্রতিবেদন',
      summary: 'উচ্চ ঝুঁকি ও জরুরি ২-সপ্তাহ ট্রায়াজ সম্বলিত সমন্বিত ক্লিনিক্যাল রিপোর্ট।',
      language: 'bn',
      templateVersion: '1.22.0',
      sourceAssessmentId: 'asm-clin-002',
      sourceReferralId: null,
      sourceMetadata: clinMeta,
      contentHtml: clinHtml,
      fileSizeBytes: Buffer.byteLength(clinHtml, 'utf-8'),
      storagePath: '/documents/secure/rpt-clin-002.pdf',
      generatedByUserId: 'usr-clinician-001',
      generatedByRole: 'clinician',
      facilityId: 'fac-001',
      status: 'final',
      isPatientAccessible: false,
      createdAt: now,
      updatedAt: now,
    }
    this.reports.set(rpt2.id, rpt2)

    // 3. Benchmark Referral & Follow-up Report (English)
    const refRptId = 'rpt-ref-003'
    const refMeta = {
      reportReference: 'RPT-2026-7J1P5M',
      patientId,
      patientCanonicalId: 'LGT-2026-8K2M7P',
      patientName: 'Rafiqul Islam',
      patientAge: 58,
      patientGender: 'Male',
      facilityId: 'fac-001',
      facilityName: 'National Institute of Diseases of the Chest & Hospital (NIDCH)',
      generatedAt: now,
      language: 'en' as ReportLanguage,
      templateVersion: '1.22.0',
    }

    const refHtml = renderReferralFollowUpReport({
      meta: refMeta,
      referral: {
        reference: 'REF-2026-9K2L4P',
        referringFacilityName: 'Dhamrai Upazila Health Complex',
        referringClinicianName: 'Dr. Tahmina Akhtar',
        destinationFacilityName: 'National Institute of Diseases of the Chest & Hospital (NIDCH)',
        destinationDepartment: 'Department of Respiratory Medicine & Thoracic Oncology',
        clinicalIndication: 'Urgent 2-Week Wait consultation for unremitting hemoptysis and suspected right hilar shadow.',
        priority: 'urgent_2ww',
        status: 'in_progress',
        recommendedDate: '2026-11-13T09:00:00Z',
        specialistInstructions: 'Fast for 4 hours prior to contrast LDCT examination.',
        statusHistory: [
          { status: 'pending', updatedAt: '2026-11-04T10:00:00Z', notes: 'Referral dispatched by community healthcare team.' },
          { status: 'in_progress', updatedAt: '2026-11-05T14:30:00Z', notes: 'Appointment booked with Thoracic Consultation Clinic 3.' },
        ],
      },
      followUps: [
        {
          followUpId: 'fu-001',
          purpose: 'Post-LDCT Diagnostic Review and Pulmonary Consultation',
          scheduledDate: '2026-11-13T10:30:00Z',
          facilityName: 'NIDCH Thoracic Unit',
          responsibleClinicianName: 'Dr. Tahmina Akhtar',
          status: 'scheduled',
        },
      ],
    })

    const rpt3: GeneratedReportRecord = {
      id: refRptId,
      reportReference: refMeta.reportReference,
      patientId,
      patientCanonicalId: refMeta.patientCanonicalId,
      patientName: refMeta.patientName,
      reportType: 'referral_followup',
      title: 'Healthcare Referral & Follow-up Clinical Summary Report',
      summary: 'Urgent 2-week wait referral coordination summary with scheduled NIDCH follow-up.',
      language: 'en',
      templateVersion: '1.22.0',
      sourceAssessmentId: null,
      sourceReferralId: 'ref-001',
      sourceMetadata: refMeta,
      contentHtml: refHtml,
      fileSizeBytes: Buffer.byteLength(refHtml, 'utf-8'),
      storagePath: '/documents/secure/rpt-ref-003.pdf',
      generatedByUserId: 'usr-worker-001',
      generatedByRole: 'healthcare_worker',
      facilityId: 'fac-001',
      status: 'final',
      isPatientAccessible: true,
      createdAt: now,
      updatedAt: now,
    }
    this.reports.set(rpt3.id, rpt3)
  }

  /**
   * Generates a new report from source records.
   */
  static async generateReport(input: GenerateReportInput): Promise<GeneratedReportRecord> {
    this.ensureInitialized()

    const language: ReportLanguage = input.language || 'en'
    const reportType: ReportType = input.reportType

    // Compile verified source context
    const { meta, payload } = await ReportingDataRetriever.compileReportContext({
      patientId: input.patientId,
      reportType,
      language,
      sourceAssessmentId: input.sourceAssessmentId,
      sourceReferralId: input.sourceReferralId,
      facilityId: input.facilityId,
      customNotes: input.customNotes,
    })

    // Render corresponding template
    let contentHtml = ''
    let title = ''
    let summary = ''

    switch (reportType) {
      case 'patient_assessment':
        contentHtml = renderPatientAssessmentReport(payload)
        title = language === 'bn' ? 'রোগীর ফুসফুস স্বাস্থ্য মূল্যায়ন সারসংক্ষেপ' : 'Patient Lung Health Assessment Summary'
        summary = language === 'bn' ? 'রোগী ও পরিবারের জন্য প্রস্তুতকৃত স্বাস্থ্য বিবরণী।' : 'Patient-friendly lung health and preventive screening summary.'
        break
      case 'clinical_assessment':
        contentHtml = renderClinicalAssessmentReport(payload)
        title = language === 'bn' ? 'সমন্বিত ক্লিনিক্যাল মূল্যায়ন ও সিদ্ধান্ত সহায়তা প্রতিবেদন' : 'Consolidated Clinical Assessment & Decision Support Report'
        summary = language === 'bn' ? 'অনুমোদিত চিকিৎসকদের জন্য সমন্বিত মূল্যায়ন প্রতিবেদন।' : 'Consolidated clinical decision support assessment report.'
        break
      case 'risk_estimation':
        contentHtml = renderRiskEstimationReport(payload)
        title = language === 'bn' ? 'ফুসফুস ক্যান্সার ঝুঁকি প্রাক্কলন প্রতিবেদন' : 'Lung Cancer Risk Estimation Report'
        summary = language === 'bn' ? 'অনুমোদিত মডেল দ্বারা গণনাকৃত দীর্ঘমেয়াদী ঝুঁকি ফলাফল।' : 'Epidemiological lung cancer risk estimation report.'
        break
      case 'screening_eligibility':
        contentHtml = renderScreeningEligibilityReport(payload)
        title = language === 'bn' ? 'ফুসফুস ক্যান্সার স্ক্রীনিং যোগ্যতা মূল্যায়ন প্রতিবেদন' : 'Lung Cancer Screening Eligibility Report'
        summary = language === 'bn' ? 'প্রমিত স্ক্রীনিং নির্দেশিকা মোতাবেক যোগ্যতা যাচাই।' : 'Evidence-based Low-Dose CT screening eligibility report.'
        break
      case 'symptom_triage':
        contentHtml = renderSymptomTriageReport(payload)
        title = language === 'bn' ? 'লক্ষণভিত্তিক ক্লিনিক্যাল ট্রায়াজ মূল্যায়ন প্রতিবেদন' : 'Symptom-Based Clinical Triage Evaluation Report'
        summary = language === 'bn' ? 'জরুরি লাল-পতাকা লক্ষণ ও ট্রায়াজ এসকেলেশন বিশ্লেষণ।' : 'Symptom-based clinical triage and red-flag escalation report.'
        break
      case 'referral_followup':
        contentHtml = renderReferralFollowUpReport(payload)
        title = language === 'bn' ? 'স্বাস্থ্যসেবা রেফারেল ও ফলো-আপ সারসংক্ষেপ প্রতিবেদন' : 'Healthcare Referral & Follow-up Clinical Summary Report'
        summary = language === 'bn' ? 'বিশেষায়িত রেফারেল পরামর্শ ও ফলো-আপ সূচি বিবরণী।' : 'Specialist referral and longitudinal follow-up report.'
        break
      case 'consolidated_history':
      default:
        contentHtml = renderConsolidatedHistoryReport(payload)
        title = language === 'bn' ? 'দীর্ঘমেয়াদী ধারাবাহিক মূল্যায়ন ইতিহাস ও রেকর্ড' : 'Consolidated Longitudinal Assessment History'
        summary = language === 'bn' ? 'ধারাবাহিক মূল্যায়নের কালানুক্রমিক সারসংক্ষেপ।' : 'Chronological assessment and triage event history.'
        break
    }

    const now = new Date().toISOString()
    const reportId = `rpt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    const isPatientAccessible = input.isPatientAccessible !== undefined
      ? input.isPatientAccessible
      : (reportType === 'patient_assessment' || reportType === 'referral_followup' || reportType === 'consolidated_history')

    const newRecord: GeneratedReportRecord = {
      id: reportId,
      reportReference: meta.reportReference,
      patientId: input.patientId,
      patientCanonicalId: meta.patientCanonicalId,
      patientName: meta.patientName,
      reportType,
      title,
      summary,
      language,
      templateVersion: meta.templateVersion,
      sourceAssessmentId: input.sourceAssessmentId || null,
      sourceReferralId: input.sourceReferralId || null,
      sourceMetadata: meta,
      contentHtml,
      fileSizeBytes: Buffer.byteLength(contentHtml, 'utf-8'),
      storagePath: `/documents/secure/${reportId}.pdf`,
      generatedByUserId: input.generatedByUserId || null,
      generatedByRole: input.generatedByRole || 'clinician',
      facilityId: meta.facilityId || null,
      status: 'final',
      isPatientAccessible,
      createdAt: now,
      updatedAt: now,
    }

    // Attempt Supabase persistence
    const supabase = getAdminSupabaseSafe()
    if (supabase) {
      try {
        await supabase.from('generated_reports').insert({
          id: newRecord.id,
          report_reference: newRecord.reportReference,
          patient_id: newRecord.patientId,
          report_type: newRecord.reportType,
          title: newRecord.title,
          summary: newRecord.summary,
          language: newRecord.language,
          template_version: newRecord.templateVersion,
          source_assessment_id: newRecord.sourceAssessmentId,
          source_referral_id: newRecord.sourceReferralId,
          source_metadata: newRecord.sourceMetadata as unknown as Json,
          content_html: newRecord.contentHtml,
          file_size_bytes: newRecord.fileSizeBytes,
          storage_path: newRecord.storagePath,
          generated_by_user_id: newRecord.generatedByUserId,
          generated_by_role: newRecord.generatedByRole,
          facility_id: newRecord.facilityId,
          status: newRecord.status,
          is_patient_accessible: newRecord.isPatientAccessible,
        })
      } catch {
        // Fall back to memory
      }
    }

    // Persist in memory store
    this.reports.set(newRecord.id, newRecord)

    // Log generation audit
    await this.logReportAccess(
      newRecord.id,
      input.generatedByUserId || 'system',
      input.generatedByRole || 'system',
      'view'
    )

    return newRecord
  }

  /**
   * Retrieves reports matching filters.
   */
  static async getReports(filters: ReportFilterOptions = {}): Promise<GeneratedReportRecord[]> {
    this.ensureInitialized()

    const supabase = getAdminSupabaseSafe()
    if (supabase) {
      try {
        let query = supabase.from('generated_reports').select('*').order('created_at', { ascending: false })

        if (filters.patientId) query = query.eq('patient_id', filters.patientId)
        if (filters.reportType) query = query.eq('report_type', filters.reportType)
        if (filters.language) query = query.eq('language', filters.language)
        if (filters.status) query = query.eq('status', filters.status)
        if (filters.facilityId) query = query.eq('facility_id', filters.facilityId)
        if (filters.startDate) query = query.gte('created_at', filters.startDate)
        if (filters.endDate) query = query.lte('created_at', filters.endDate)
        if (filters.limit) query = query.limit(filters.limit)

        const { data, error } = await query
        if (!error && data && data.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return data.map((r: any) => ({
            id: r.id,
            reportReference: r.report_reference,
            patientId: r.patient_id,
            patientCanonicalId: r.source_metadata?.patientCanonicalId || r.patient_id,
            patientName: r.source_metadata?.patientName || 'Patient',
            reportType: r.report_type,
            title: r.title,
            summary: r.summary,
            language: r.language,
            templateVersion: r.template_version,
            sourceAssessmentId: r.source_assessment_id,
            sourceReferralId: r.source_referral_id,
            sourceMetadata: r.source_metadata,
            contentHtml: r.content_html,
            fileSizeBytes: r.file_size_bytes || 0,
            storagePath: r.storage_path,
            generatedByUserId: r.generated_by_user_id,
            generatedByRole: r.generated_by_role,
            facilityId: r.facility_id,
            status: r.status,
            isPatientAccessible: r.is_patient_accessible,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          }))
        }
      } catch {
        // Fall back to memory
      }
    }

    // In-memory filter
    let list = Array.from(this.reports.values())
    if (filters.patientId) list = list.filter(r => r.patientId === filters.patientId)
    if (filters.reportType) list = list.filter(r => r.reportType === filters.reportType)
    if (filters.language) list = list.filter(r => r.language === filters.language)
    if (filters.status) list = list.filter(r => r.status === filters.status)
    if (filters.facilityId) list = list.filter(r => r.facilityId === filters.facilityId)
    if (filters.startDate) list = list.filter(r => r.createdAt >= filters.startDate!)
    if (filters.endDate) list = list.filter(r => r.createdAt <= filters.endDate!)

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (filters.limit) list = list.slice(0, filters.limit)

    return list
  }

  /**
   * Retrieves a report by ID or Canonical Reference.
   */
  static async getReportById(idOrReference: string): Promise<GeneratedReportRecord | null> {
    this.ensureInitialized()

    const supabase = getAdminSupabaseSafe()
    if (supabase) {
      try {
        const query = idOrReference.startsWith('RPT-')
          ? supabase.from('generated_reports').select('*').eq('report_reference', idOrReference).single()
          : supabase.from('generated_reports').select('*').eq('id', idOrReference).single()

        const { data, error } = await query
        if (!error && data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const r = data as any
          return {
            id: r.id,
            reportReference: r.report_reference,
            patientId: r.patient_id,
            patientCanonicalId: r.source_metadata?.patientCanonicalId || r.patient_id,
            patientName: r.source_metadata?.patientName || 'Patient',
            reportType: r.report_type,
            title: r.title,
            summary: r.summary,
            language: r.language,
            templateVersion: r.template_version,
            sourceAssessmentId: r.source_assessment_id,
            sourceReferralId: r.source_referral_id,
            sourceMetadata: r.source_metadata,
            contentHtml: r.content_html,
            fileSizeBytes: r.file_size_bytes || 0,
            storagePath: r.storage_path,
            generatedByUserId: r.generated_by_user_id,
            generatedByRole: r.generated_by_role,
            facilityId: r.facility_id,
            status: r.status,
            isPatientAccessible: r.is_patient_accessible,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          }
        }
      } catch {
        // Fall back to memory
      }
    }

    // In-memory lookup
    if (this.reports.has(idOrReference)) {
      return this.reports.get(idOrReference)!
    }
    for (const report of this.reports.values()) {
      if (report.reportReference === idOrReference) {
        return report
      }
    }

    return null
  }

  /**
   * Generates a valid PDF 1.4 binary buffer for a report.
   */
  static async getReportPdf(idOrReference: string): Promise<{ buffer: Uint8Array; filename: string } | null> {
    const report = await this.getReportById(idOrReference)
    if (!report) return null

    const pdfBuffer = PdfGenerator.generatePdf(report)
    const filename = `${report.reportReference}-${report.reportType}.pdf`
    return { buffer: pdfBuffer, filename }
  }

  /**
   * Logs an access audit event for a report.
   */
  static async logReportAccess(
    reportId: string,
    userId: string,
    userRole: string,
    accessType: ReportAccessType,
    ipAddress: string = '127.0.0.1',
    userAgent: string = 'Lungent-Web'
  ): Promise<ReportAccessAuditRecord> {
    const auditRecord: ReportAccessAuditRecord = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      reportId,
      userId,
      userRole,
      accessType,
      ipAddress,
      userAgent,
      createdAt: new Date().toISOString(),
    }

    const supabase = getAdminSupabaseSafe()
    if (supabase) {
      try {
        await supabase.from('report_access_audit').insert({
          id: auditRecord.id,
          report_id: auditRecord.reportId,
          user_id: auditRecord.userId,
          user_role: auditRecord.userRole,
          access_type: auditRecord.accessType,
          ip_address: auditRecord.ipAddress,
          user_agent: auditRecord.userAgent,
        })
      } catch {
        // Ignore fallback
      }
    }

    const list = this.auditLogs.get(reportId) || []
    list.push(auditRecord)
    this.auditLogs.set(reportId, list)

    return auditRecord
  }

  /**
   * Retrieves audit logs for a report.
   */
  static async getAuditLogs(reportId: string): Promise<ReportAccessAuditRecord[]> {
    this.ensureInitialized()
    return this.auditLogs.get(reportId) || []
  }
}
