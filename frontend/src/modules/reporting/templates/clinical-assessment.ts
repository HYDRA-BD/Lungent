/**
 * Phase 1.22: Clinical Assessment Report Template
 *
 * Designed for clinicians, oncologists, and pulmonologists:
 * - Consolidates Risk Estimation (Phase 1.12), Screening Eligibility (Phase 1.13), and Symptom Triage (Phase 1.14)
 * - Explicitly preserves individual methodology and guideline versions
 * - Records clinician observations, documented decisions, overrides, and audit trails
 * - Avoids combining distinct clinical pathways into a single unexplained score
 */

import { renderBaseDocument } from './base-template'
import type { ReportMetadata } from '../types'

export interface ClinicalAssessmentTemplateData {
  meta: ReportMetadata
  assessmentId: string
  reviewStatus: 'completed' | 'in_review' | 'overridden' | 'pending'
  demographicsSummary: {
    age: number
    gender: string
    smokingStatus: string
    packYears: number
    bmi?: number
    comorbidities: string[]
  }
  riskSection: {
    methodologyName: string
    methodologyVersion: string
    approvalStatus: string
    riskCategory: 'low' | 'moderate' | 'high' | 'very_high'
    calculatedRiskScore?: number
    contributingFactors: string[]
    uncertaintyNotes?: string
  }
  screeningSection: {
    guidelineName: string
    guidelineVersion: string
    approvalStatus: string
    eligibilityOutcome: 'eligible' | 'ineligible' | 'requires_review'
    recommendationSummary: string
    evaluatedCriteria: { criterion: string; result: 'met' | 'unmet' | 'uncertain' }[]
  }
  triageSection: {
    protocolName: string
    protocolVersion: string
    urgencyLevel: 'emergency_escalation' | 'urgent_assessment' | 'routine_assessment' | 'self_care'
    concerningSymptoms: string[]
    recommendedEscalation: string
    timeframeDays: number
  }
  clinicianReview: {
    reviewingClinicianName: string
    bmdcLicense: string
    clinicalNotes: string
    overrides?: {
      field: string
      automatedValue: string
      clinicianValue: string
      justification: string
      documentedAt: string
    }[]
  }
}

export function renderClinicalAssessmentReport(data: ClinicalAssessmentTemplateData): string {
  const isBn = data.meta.language === 'bn'

  const title = isBn
    ? 'সমন্বিত ক্লিনিক্যাল মূল্যায়ন ও সিদ্ধান্ত সহায়তা প্রতিবেদন'
    : 'Consolidated Clinical Assessment & Decision Support Report'
  const subtitle = isBn
    ? 'অনুমোদিত চিকিৎসক ও স্বাস্থ্যকর্মীদের জন্য পূর্ণাঙ্গ ক্লিনিক্যাল সারসংক্ষেপ'
    : 'Comprehensive Clinical Summary for Authorized Medical Practitioners'
  const badge = isBn ? 'ক্লিনিক্যাল প্রতিবেদন' : 'Clinical Assessment'

  const triageBadge = {
    emergency_escalation: 'badge-urgent',
    urgent_assessment: 'badge-urgent',
    routine_assessment: 'badge-info',
    self_care: 'badge-success',
  }[data.triageSection.urgencyLevel]

  const screeningBadge = {
    eligible: 'badge-urgent',
    ineligible: 'badge-neutral',
    requires_review: 'badge-warning',
  }[data.screeningSection.eligibilityOutcome]

  const body = `
    <!-- Executive Clinical Summary Grid -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
      <div class="card-box" style="border-top: 3px solid #0f766e;">
        <div class="meta-label">${isBn ? 'ঝুঁকি মূল্যায়ন ইঞ্জিন' : 'Risk Estimation Engine'}</div>
        <div style="font-size: 11pt; font-weight: 700; margin: 4px 0;">
          ${data.riskSection.riskCategory.toUpperCase()}
          ${data.riskSection.calculatedRiskScore !== undefined ? `(${data.riskSection.calculatedRiskScore}%)` : ''}
        </div>
        <div style="font-size: 7.5pt; color: #64748b;">${data.riskSection.methodologyName} (${data.riskSection.methodologyVersion})</div>
      </div>

      <div class="card-box" style="border-top: 3px solid #0284c7;">
        <div class="meta-label">${isBn ? 'স্ক্রীনিং নির্দেশিকা' : 'Screening Eligibility'}</div>
        <div style="font-size: 11pt; font-weight: 700; margin: 4px 0;">
          <span class="badge ${screeningBadge}">${data.screeningSection.eligibilityOutcome.toUpperCase()}</span>
        </div>
        <div style="font-size: 7.5pt; color: #64748b;">${data.screeningSection.guidelineName} (${data.screeningSection.guidelineVersion})</div>
      </div>

      <div class="card-box" style="border-top: 3px solid #e11d48;">
        <div class="meta-label">${isBn ? 'উপসর্গ ট্রায়াজ নির্দেশিকা' : 'Symptom Triage Pathway'}</div>
        <div style="font-size: 11pt; font-weight: 700; margin: 4px 0;">
          <span class="badge ${triageBadge}">${data.triageSection.urgencyLevel.replace(/_/g, ' ').toUpperCase()}</span>
        </div>
        <div style="font-size: 7.5pt; color: #64748b;">${data.triageSection.protocolName} (${data.triageSection.protocolVersion})</div>
      </div>
    </div>

    <!-- Section 1: Demographics & Clinical Profile -->
    <div class="section-heading">${isBn ? '১. রোগীর মৌলিক ক্লিনিক্যাল প্রোফাইল' : '1. Baseline Demographic & Clinical Profile'}</div>
    <div class="card-box">
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 8.5pt;">
        <div><strong>${isBn ? 'ধূমপানের মাত্রা' : 'Tobacco Exposure'}:</strong> ${data.demographicsSummary.packYears} pack-years (${data.demographicsSummary.smokingStatus})</div>
        <div><strong>${isBn ? 'বিএমআই' : 'Body Mass Index'}:</strong> ${data.demographicsSummary.bmi ? `${data.demographicsSummary.bmi} kg/m²` : 'N/A'}</div>
        <div><strong>${isBn ? 'পূর্ববর্তী জটিলতা' : 'Comorbidities'}:</strong> ${data.demographicsSummary.comorbidities.length > 0 ? data.demographicsSummary.comorbidities.join(', ') : (isBn ? 'নেই' : 'None reported')}</div>
      </div>
    </div>

    <!-- Section 2: Risk Estimation Engine Breakdown -->
    <div class="section-heading">${isBn ? '২. ঝুঁকি প্রাক্কলন ইঞ্জিন বিশদ (Phase 1.12)' : '2. Risk Estimation Engine Details (Phase 1.12)'}</div>
    <div class="card-box">
      <div style="display: flex; justify-content: space-between; font-size: 8.5pt; margin-bottom: 6px;">
        <span><strong>${isBn ? 'মডেল ও প্রোটোকল' : 'Model'}:</strong> ${data.riskSection.methodologyName} (${data.riskSection.methodologyVersion})</span>
        <span><strong>${isBn ? 'অনুমোদন অবস্থা' : 'Status'}:</strong> <span class="badge badge-success">${data.riskSection.approvalStatus}</span></span>
      </div>
      <div style="font-size: 8.5pt; margin-top: 6px;">
        <strong>${isBn ? 'প্রধান প্রভাবক উপাদানসমূহ' : 'Key Contributing Factors'}:</strong>
        <ul style="margin: 4px 0 0 16px; padding: 0;">
          ${data.riskSection.contributingFactors.map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>
      ${data.riskSection.uncertaintyNotes ? `
      <div style="font-size: 8pt; color: #64748b; margin-top: 6px; font-style: italic;">
        ${isBn ? 'সীমাবদ্ধতা ও অনিশ্চয়তা নোট:' : 'Uncertainty & Limitations:'} ${data.riskSection.uncertaintyNotes}
      </div>` : ''}
    </div>

    <!-- Section 3: Screening Eligibility Criteria Breakdown -->
    <div class="section-heading">${isBn ? '৩. স্ক্রীনিং নির্দেশিকা মানদণ্ড মূল্যায়ন (Phase 1.13)' : '3. Screening Eligibility Guideline Evaluation (Phase 1.13)'}</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>${isBn ? 'স্ক্রীনিং মানদণ্ড' : 'Guideline Criterion'}</th>
          <th>${isBn ? 'ফলাফল' : 'Evaluation Result'}</th>
        </tr>
      </thead>
      <tbody>
        ${data.screeningSection.evaluatedCriteria.map(c => `
          <tr>
            <td>${c.criterion}</td>
            <td>
              <span class="badge ${c.result === 'met' ? 'badge-success' : c.result === 'unmet' ? 'badge-neutral' : 'badge-warning'}">
                ${c.result.toUpperCase()}
              </span>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div style="font-size: 8.5pt; margin-top: -6px; margin-bottom: 12px; color: #334155;">
      <strong>${isBn ? 'ক্লিনিক্যাল নির্দেশনা:' : 'Guideline Recommendation:'}</strong> ${data.screeningSection.recommendationSummary}
    </div>

    <!-- Section 4: Symptom Triage & Red-Flag Escalation -->
    <div class="section-heading">${isBn ? '৪. লক্ষণভিত্তিক ট্রায়াজ ও জরুরি সতর্কতা (Phase 1.14)' : '4. Symptom-Based Triage & Red-Flag Alerts (Phase 1.14)'}</div>
    ${data.triageSection.concerningSymptoms.length > 0 ? `
    <div class="alert-box alert-danger">
      <div style="font-weight: 700; margin-bottom: 4px;">
        ${isBn ? 'উদ্বেগজনক লক্ষণ শনাক্তকরণ (Red-Flag Symptoms Identified):' : 'Concerning Red-Flag Symptoms Identified:'}
      </div>
      <ul style="margin: 4px 0 0 16px; padding: 0;">
        ${data.triageSection.concerningSymptoms.map(s => `<li><strong>${s}</strong></li>`).join('')}
      </ul>
      <div style="margin-top: 6px;">
        ${isBn ? 'প্রস্তাবিত পদক্ষেপ:' : 'Recommended Escalation:'} <strong>${data.triageSection.recommendedEscalation}</strong> (${isBn ? 'সময়সীমা:' : 'Target Timeframe:'} ${data.triageSection.timeframeDays} ${isBn ? 'দিন' : 'days'})
      </div>
    </div>` : `
    <div class="alert-box alert-info">
      ${isBn ? 'কোনো জরুরি বা উচ্চ অগ্রাধিকারমূলক লক্ষণ চিহ্নিত হয়নি।' : 'No immediate red-flag or acute urgent symptoms documented at this assessment.'}
    </div>`}

    <!-- Section 5: Clinician Review & Decision Documentation -->
    <div class="section-heading">${isBn ? '৫. চিকিৎসকের পর্যবেক্ষণ, সিদ্ধান্ত ও সমন্বয়' : '5. Clinician Observations & Documented Decisions'}</div>
    <div class="card-box">
      <div><strong>${isBn ? 'পর্যালোচক চিকিৎসক:' : 'Reviewing Clinician:'}</strong> ${data.clinicianReview.reviewingClinicianName} (${data.clinicianReview.bmdcLicense})</div>
      <div style="margin-top: 6px; font-size: 8.5pt; line-height: 1.6;">
        <strong>${isBn ? 'ক্লিনিক্যাল মন্তব্য:' : 'Clinical Notes & Management Plan:'}</strong><br>
        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px; margin-top: 4px;">
          ${data.clinicianReview.clinicalNotes}
        </div>
      </div>

      <!-- Overrides -->
      ${data.clinicianReview.overrides && data.clinicianReview.overrides.length > 0 ? `
      <div style="margin-top: 10px;">
        <span class="badge badge-warning">${isBn ? 'স্বয়ংক্রিয় ফলাফলের ওপর চিকিৎসকের পরিবর্তন (Clinician Overrides):' : 'Documented Clinician Overrides:'}</span>
        <table class="data-table" style="margin-top: 6px;">
          <thead>
            <tr>
              <th>${isBn ? 'ক্ষেত্র' : 'Field'}</th>
              <th>${isBn ? 'স্বয়ংক্রিয় মান' : 'Automated'}</th>
              <th>${isBn ? 'চিকিৎসকের সিদ্ধান্ত' : 'Clinician Override'}</th>
              <th>${isBn ? 'যৌক্তিক কারণ' : 'Justification'}</th>
            </tr>
          </thead>
          <tbody>
            ${data.clinicianReview.overrides.map(o => `
              <tr>
                <td>${o.field}</td>
                <td><del>${o.automatedValue}</del></td>
                <td><strong>${o.clinicianValue}</strong></td>
                <td>${o.justification}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>` : ''}
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
