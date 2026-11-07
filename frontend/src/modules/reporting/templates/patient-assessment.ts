/**
 * Phase 1.22: Patient Assessment Report Template
 *
 * Designed specifically for patients and families:
 * - Clear, accessible language avoiding unclarified jargon
 * - Distinguishes patient-reported details from verified clinical measurements
 * - Clearly marks missing or incomplete information
 * - Explicitly explains next steps
 * - Stresses that low risk does not eliminate cancer risk and is not a definitive diagnosis
 */

import { renderBaseDocument } from './base-template'
import type { ReportMetadata } from '../types'
import { formatPackYears } from '@/i18n/formatters'

export interface PatientAssessmentTemplateData {
  meta: ReportMetadata
  assessmentDate: string
  completionStatus: 'completed' | 'partial' | 'in_progress'
  patientReportedInfo: {
    smokingStatus: string
    packYears: number
    biomassSmokeExposureYears?: number
    occupationalExposure?: string
    familyHistoryLungCancer?: boolean
  }
  clinicianVerifiedInfo?: {
    bmi?: number
    bloodPressure?: string
    spirometryCompleted?: boolean
  }
  assessmentFindings: {
    baselineCategory: 'low' | 'moderate' | 'high' | 'very_high'
    screeningRecommendation: string
    symptomSummary: string
  }
  missingInformation: string[]
  recommendedNextSteps: string[]
}

export function renderPatientAssessmentReport(data: PatientAssessmentTemplateData): string {
  const isBn = data.meta.language === 'bn'

  const title = isBn
    ? 'রোগীর ফুসফুস স্বাস্থ্য মূল্যায়ন সারসংক্ষেপ'
    : 'Patient Lung Health Assessment Summary'
  const subtitle = isBn
    ? 'রোগী ও পরিবারের সহজে বোঝার জন্য প্রস্তুতকৃত স্বাস্থ্য বিবরণী'
    : 'Comprehensive Patient-Friendly Health & Preventive Care Summary'
  const badge = isBn ? 'রোগী মূল্যায়ন' : 'Patient Assessment'

  const statusLabel = {
    completed: isBn ? 'সম্পূর্ণ হয়েছে' : 'Completed',
    partial: isBn ? 'আংশিক সম্পন্ন' : 'Partially Completed',
    in_progress: isBn ? 'চলমান' : 'In Progress',
  }[data.completionStatus]

  const riskBadgeClass = {
    low: 'badge-info',
    moderate: 'badge-warning',
    high: 'badge-urgent',
    very_high: 'badge-urgent',
  }[data.assessmentFindings.baselineCategory]

  const riskLabelBn = {
    low: 'নিম্ন ঝুঁকি (Low Risk)',
    moderate: 'মাঝারি ঝুঁকি (Moderate Risk)',
    high: 'উচ্চ ঝুঁকি (High Risk)',
    very_high: 'অতি উচ্চ ঝুঁকি (Very High Risk)',
  }[data.assessmentFindings.baselineCategory]

  const body = `
    <!-- Assessment Overview Card -->
    <div class="card-box">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-weight: 700; font-size: 10pt; color: #1e293b;">
          ${isBn ? 'মূল্যায়নের বিবরণ ও সমাপ্তি অবস্থা' : 'Assessment Overview & Status'}
        </span>
        <span class="badge ${data.completionStatus === 'completed' ? 'badge-success' : 'badge-warning'}">
          ${statusLabel}
        </span>
      </div>
      <div style="font-size: 8.5pt; color: #475569;">
        ${isBn ? 'মূল্যায়ন সম্পন্ন হওয়ার তারিখ:' : 'Assessment Date:'} <strong>${data.assessmentDate}</strong> &bull; 
        ${isBn ? 'পদ্ধতি সংস্করণ:' : 'Methodology Version:'} <strong>${data.meta.methodologyVersion || 'v1.0'}</strong>
      </div>
    </div>

    <!-- Findings Section -->
    <div class="section-heading">
      ${isBn ? '১. মূল্যায়নের প্রধান ফলাফলসমূহ' : '1. Key Assessment Findings'}
    </div>
    <div class="card-box" style="border-left: 4px solid #0f766e;">
      <div style="margin-bottom: 8px;">
        <strong>${isBn ? 'প্রাথমিক ঝুঁকি শ্রেণীবিন্যাস:' : 'Baseline Risk Classification:'}</strong>
        <span class="badge ${riskBadgeClass}" style="margin-left: 6px;">
          ${isBn ? riskLabelBn : data.assessmentFindings.baselineCategory.toUpperCase()}
        </span>
      </div>
      <div style="margin-bottom: 8px; font-size: 9pt;">
        <strong>${isBn ? 'স্ক্রীনিং পরামর্শ:' : 'Screening Guidance:'}</strong>
        <span>${data.assessmentFindings.screeningRecommendation}</span>
      </div>
      <div style="font-size: 9pt;">
        <strong>${isBn ? 'উপসর্গের সারসংক্ষেপ:' : 'Reported Symptoms Summary:'}</strong>
        <span>${data.assessmentFindings.symptomSummary}</span>
      </div>
    </div>

    <!-- Clinical Warning: Low Risk Does Not Rule Out Cancer -->
    <div class="alert-box alert-warning">
      <strong>${isBn ? 'গুরুত্বপূর্ণ সতর্কতা:' : 'Important Safety Understanding:'}</strong>
      ${isBn
        ? 'নিম্ন ঝুঁকি (Low Risk) ফলাফল মানে এই নয় যে ভবিষ্যতে ক্যান্সার হওয়ার সম্ভাবনা শূন্য। যদি আপনার কাশির সাথে রক্ত যাওয়া, দীর্ঘস্থায়ী কাশি বা দ্রুত ওজন হ্রাসের মতো লক্ষণ দেখা দেয়, তবে অনতিবিলম্বে চিকিৎসকের পরামর্শ নিন।'
        : 'A low risk estimate does NOT guarantee the absence of lung cancer. If you experience persistent cough, unexplained weight loss, or hemoptysis (coughing blood), seek prompt clinical evaluation regardless of risk scores.'}
    </div>

    <!-- Data Provenance: Patient Reported vs Verified -->
    <div class="section-heading">
      ${isBn ? '২. প্রদত্ত তথ্যের উৎস ও নির্ভুলতা যাচাই' : '2. Information Provenance & Verification'}
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th>${isBn ? 'বিষয়ের বিবরণ' : 'Parameter'}</th>
          <th>${isBn ? 'নথিভুক্ত তথ্য' : 'Recorded Value'}</th>
          <th>${isBn ? 'তথ্যের প্রকৃতি / উৎস' : 'Data Source'}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${isBn ? 'ধূমপানের ইতিহাস' : 'Tobacco Exposure'}</td>
          <td>${formatPackYears(data.patientReportedInfo.packYears, data.meta.language)} (${data.patientReportedInfo.smokingStatus})</td>
          <td><span class="badge badge-neutral">${isBn ? 'রোগী কর্তৃক প্রদত্ত' : 'Patient-Reported'}</span></td>
        </tr>
        ${data.patientReportedInfo.biomassSmokeExposureYears ? `
        <tr>
          <td>${isBn ? 'লাকড়ি/চুলা/বায়োমাস ধোঁয়া' : 'Biomass Fuel Exposure'}</td>
          <td>${data.patientReportedInfo.biomassSmokeExposureYears} ${isBn ? 'বছর' : 'years'}</td>
          <td><span class="badge badge-neutral">${isBn ? 'রোগী কর্তৃক প্রদত্ত' : 'Patient-Reported'}</span></td>
        </tr>` : ''}
        ${data.patientReportedInfo.occupationalExposure ? `
        <tr>
          <td>${isBn ? 'পেশাগত ধুলোবালি/অ্যাসবেস্টস' : 'Occupational Exposure'}</td>
          <td>${data.patientReportedInfo.occupationalExposure}</td>
          <td><span class="badge badge-neutral">${isBn ? 'রোগী কর্তৃক প্রদত্ত' : 'Patient-Reported'}</span></td>
        </tr>` : ''}
        ${data.clinicianVerifiedInfo?.bloodPressure ? `
        <tr>
          <td>${isBn ? 'রক্তচাপ (BP)' : 'Blood Pressure'}</td>
          <td>${data.clinicianVerifiedInfo.bloodPressure}</td>
          <td><span class="badge badge-success">${isBn ? 'ক্লিনিক্যালভাবে পরিমাপকৃত' : 'Clinician-Verified'}</span></td>
        </tr>` : ''}
      </tbody>
    </table>

    <!-- Missing Information -->
    ${data.missingInformation.length > 0 ? `
    <div class="section-heading">
      ${isBn ? '৩. অপূর্ণ বা অনুপস্থিত তথ্য' : '3. Missing or Pending Information'}
    </div>
    <div class="alert-box alert-info">
      ${isBn ? 'সঠিকতর মূল্যায়নের জন্য নিম্নের তথ্যগুলো ভবিষ্যতে প্রদান করা প্রয়োজন:' : 'The following information was not available during this assessment and should be updated:'}
      <ul style="margin: 6px 0 0 16px; padding: 0;">
        ${data.missingInformation.map(m => `<li>${m}</li>`).join('')}
      </ul>
    </div>` : ''}

    <!-- Recommended Next Steps -->
    <div class="section-heading">
      ${isBn ? '৪. আপনার পরবর্তী করণীয় ও পরামর্শ' : '4. Recommended Next Steps'}
    </div>
    <div class="card-box">
      <ul style="margin: 4px 0 0 16px; padding: 0; line-height: 1.8;">
        ${data.recommendedNextSteps.map(step => `<li>${step}</li>`).join('')}
      </ul>
    </div>
  `

  return renderBaseDocument({
    meta: data.meta,
    title,
    subtitle,
    reportTypeBadge: badge,
    children: body,
  })
}
