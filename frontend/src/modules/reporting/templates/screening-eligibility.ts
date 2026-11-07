/**
 * Phase 1.22: Dedicated Screening Eligibility Report Template
 *
 * Dedicated report for the Lung Cancer Screening Eligibility Engine (Phase 1.13):
 * - Displays screening guideline name, version, and approval status
 * - Explicitly lists criterion-by-criterion evaluation table
 * - Highlights Low-Dose CT (LDCT) recommendations or contraindications
 * - Preserves original guideline thresholds and never recalculates criteria
 */

import { renderBaseDocument } from './base-template'
import type { ReportMetadata } from '../types'

export interface ScreeningEligibilityTemplateData {
  meta: ReportMetadata
  guideline: {
    name: string
    code: string
    version: string
    approvalStatus: 'approved' | 'review_required' | 'deprecated'
    issuingBody: string
    targetScreeningModality: string
  }
  criteriaEvaluations: {
    criterionName: string
    requiredThreshold: string
    patientValue: string
    status: 'met' | 'unmet' | 'uncertain'
    clinicalNote?: string
  }[]
  overallResult: {
    outcome: 'eligible' | 'ineligible' | 'requires_review'
    recommendationSummary: string
    recommendedIntervalMonths?: number
    contraindicationsIdentified: string[]
  }
  missingCriteria: string[]
  guidelineReferences: string[]
  limitations: string[]
}

export function renderScreeningEligibilityReport(data: ScreeningEligibilityTemplateData): string {
  const isBn = data.meta.language === 'bn'

  const title = isBn
    ? 'ফুসফুস ক্যান্সার স্ক্রীনিং যোগ্যতা মূল্যায়ন প্রতিবেদন'
    : 'Lung Cancer Screening Eligibility Report'
  const subtitle = isBn
    ? 'অনুমোদিত ক্লিনিক্যাল স্ক্রীনিং নির্দেশিকা (LDCT) অনুসারে প্রমিত মূল্যায়ন'
    : 'Standardized Low-Dose Computed Tomography (LDCT) Guideline Evaluation'
  const badge = isBn ? 'স্ক্রীনিং যোগ্যতা' : 'Screening Eligibility'

  const outcomeBadge = {
    eligible: 'badge-success',
    ineligible: 'badge-neutral',
    requires_review: 'badge-warning',
  }[data.overallResult.outcome]

  const outcomeLabel = {
    eligible: isBn ? 'যোগ্য — বাৎসরিক LDCT স্ক্রীনিং নির্দেশিত' : 'ELIGIBLE — Annual Low-Dose CT Recommended',
    ineligible: isBn ? 'অনুপযুক্ত — বর্তমান নির্দেশিকা মোতাবেক স্ক্রীনিং প্রযোজ্য নয়' : 'INELIGIBLE — Criteria Not Met For Annual Screening',
    requires_review: isBn ? 'পর্যালোচনা প্রয়োজন — অতিরিক্ত তথ্যের প্রয়োজন' : 'REQUIRES CLINICAL REVIEW — Missing Key Parameters',
  }[data.overallResult.outcome]

  const body = `
    <!-- Guideline Information Box -->
    <div class="card-box" style="border-left: 4px solid #0284c7;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-size: 10pt; font-weight: 700; color: #1e293b;">
          ${data.guideline.name} (${data.guideline.version})
        </span>
        <span class="badge ${data.guideline.approvalStatus === 'approved' ? 'badge-success' : 'badge-warning'}">
          ${data.guideline.approvalStatus.toUpperCase()}
        </span>
      </div>
      <div style="font-size: 8.5pt; color: #475569;">
        <strong>${isBn ? 'কোড:' : 'Guideline Code:'}</strong> <code>${data.guideline.code}</code> &bull; 
        <strong>${isBn ? 'প্রণয়নকারী সংস্থা:' : 'Issuing Body:'}</strong> ${data.guideline.issuingBody} &bull; 
        <strong>${isBn ? 'নির্দেশিত স্ক্রীনিং পদ্ধতি:' : 'Target Modality:'}</strong> ${data.guideline.targetScreeningModality}
      </div>
    </div>

    <!-- Overall Determination Result -->
    <div class="section-heading">${isBn ? '১. সামগ্রিক স্ক্রীনিং যোগ্যতার ফলাফল' : '1. Overall Eligibility Outcome'}</div>
    <div class="card-box" style="padding: 16px; border: 1.5px solid #cbd5e1;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
        <div>
          <div class="meta-label">${isBn ? 'যোগ্যতার স্তর' : 'Eligibility Status'}</div>
          <div style="margin-top: 4px;">
            <span class="badge ${outcomeBadge}" style="font-size: 10pt; padding: 6px 12px;">
              ${outcomeLabel}
            </span>
          </div>
        </div>
        ${data.overallResult.recommendedIntervalMonths ? `
        <div style="text-align: right;">
          <div class="meta-label">${isBn ? 'প্রস্তাবিত বিরতি' : 'Screening Interval'}</div>
          <div style="font-size: 12pt; font-weight: 700; color: #0284c7; margin-top: 2px;">
            ${data.overallResult.recommendedIntervalMonths} ${isBn ? 'মাস (বাৎসরিক)' : 'Months (Annual)'}
          </div>
        </div>` : ''}
      </div>
      <div style="margin-top: 12px; font-size: 9pt; color: #334155; line-height: 1.6;">
        <strong>${isBn ? 'ক্লিনিক্যাল নির্দেশনা:' : 'Guideline Recommendation Summary:'}</strong> ${data.overallResult.recommendationSummary}
      </div>
    </div>

    <!-- Criteria-by-Criteria Breakdown Table -->
    <div class="section-heading">${isBn ? '২. নির্দেশিকা মানদণ্ডভিত্তিক যাচাইকরণ' : '2. Criterion-by-Criterion Evaluation'}</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>${isBn ? 'মানদণ্ডের বিবরণ' : 'Guideline Criterion'}</th>
          <th>${isBn ? 'প্রয়োজনীয় সীমা' : 'Threshold'}</th>
          <th>${isBn ? 'রোগীর উপাত্ত' : 'Patient Value'}</th>
          <th>${isBn ? 'অবস্থা' : 'Evaluation'}</th>
        </tr>
      </thead>
      <tbody>
        ${data.criteriaEvaluations.map(c => `
          <tr>
            <td>
              <strong>${c.criterionName}</strong>
              ${c.clinicalNote ? `<div style="font-size: 7.5pt; color: #64748b;">${c.clinicalNote}</div>` : ''}
            </td>
            <td>${c.requiredThreshold}</td>
            <td><strong>${c.patientValue}</strong></td>
            <td>
              <span class="badge ${c.status === 'met' ? 'badge-success' : c.status === 'unmet' ? 'badge-neutral' : 'badge-warning'}">
                ${c.status.toUpperCase()}
              </span>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Contraindications / Exclusions if any -->
    ${data.overallResult.contraindicationsIdentified.length > 0 ? `
    <div class="alert-box alert-warning">
      <strong>${isBn ? 'চিহ্নিত প্রতিবন্ধকতা / বর্জনীয় কারণ:' : 'Identified Contraindications or Exclusions:'}</strong>
      <ul style="margin: 4px 0 0 16px; padding: 0;">
        ${data.overallResult.contraindicationsIdentified.map(ci => `<li>${ci}</li>`).join('')}
      </ul>
    </div>` : ''}

    <!-- Missing Criteria -->
    ${data.missingCriteria.length > 0 ? `
    <div class="alert-box alert-info">
      <strong>${isBn ? 'অনুপস্থিত বা অপর্যাপ্ত উপাত্ত:' : 'Missing Criteria for Full Evaluation:'}</strong>
      <ul style="margin: 4px 0 0 16px; padding: 0;">
        ${data.missingCriteria.map(m => `<li>${m}</li>`).join('')}
      </ul>
    </div>` : ''}

    <!-- Guideline References -->
    <div class="section-heading">${isBn ? '৩. প্রাতিষ্ঠানিক নির্দেশিকা সূত্র ও প্রকাশনা' : '3. Guideline References & Evidence Base'}</div>
    <div class="card-box" style="font-size: 8pt; color: #475569;">
      <ul style="margin: 4px 0 0 16px; padding: 0;">
        ${data.guidelineReferences.map(ref => `<li>${ref}</li>`).join('')}
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
