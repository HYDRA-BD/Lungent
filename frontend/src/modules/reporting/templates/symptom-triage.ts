/**
 * Phase 1.22: Dedicated Symptom Triage Report Template
 *
 * Dedicated report for the Symptom-Based Clinical Triage Engine (Phase 1.14):
 * - Displays triage protocol name, version, and approval status
 * - Explicitly lists reported symptoms, duration, progression, and severity
 * - Displays urgency classification and escalation pathway
 * - Prominently highlights red-flag symptom warnings
 * - Reasserts that screening ineligibility or low risk never suppresses symptom red-flags
 */

import { renderBaseDocument } from './base-template'
import type { ReportMetadata } from '../types'

export interface SymptomTriageTemplateData {
  meta: ReportMetadata
  protocol: {
    name: string
    code: string
    version: string
    approvalStatus: 'approved' | 'interim' | 'deprecated'
    issuingAuthority: string
  }
  symptomsReported: {
    name: string
    status: 'present' | 'absent' | 'unknown'
    durationWeeks?: number
    progression?: string
    severity?: string
    isRedFlag: boolean
    notes?: string
  }[]
  triageOutcome: {
    urgencyLevel: 'emergency_escalation' | 'urgent_assessment' | 'routine_assessment' | 'self_care'
    recommendedPathway: string
    timeframeDays: number
    clinicalSummary: string
  }
  escalationDetails?: {
    escalatedToRole: string
    clinicalAlertId?: string
    status: string
    acknowledgedBy?: string
    acknowledgedAt?: string
    actionNotes?: string
  }
  disclaimers: string[]
}

export function renderSymptomTriageReport(data: SymptomTriageTemplateData): string {
  const isBn = data.meta.language === 'bn'

  const title = isBn
    ? 'লক্ষণভিত্তিক ক্লিনিক্যাল ট্রায়াজ মূল্যায়ন প্রতিবেদন'
    : 'Symptom-Based Clinical Triage Evaluation Report'
  const subtitle = isBn
    ? 'অনুমোদিত ট্রায়াজ প্রোটোকল (NICE NG12) অনুসারে লক্ষণ ও লাল-পতাকা সতর্কতা বিশ্লেষণ'
    : 'Systematic Evaluation of Reported Symptoms, Urgent Red-Flags, & Escalation Pathways'
  const badge = isBn ? 'লক্ষণ ট্রায়াজ' : 'Symptom Triage'

  const urgencyBadgeClass = {
    emergency_escalation: 'badge-urgent',
    urgent_assessment: 'badge-urgent',
    routine_assessment: 'badge-info',
    self_care: 'badge-success',
  }[data.triageOutcome.urgencyLevel]

  const urgencyLabel = {
    emergency_escalation: isBn ? 'জরুরি তাৎক্ষণিক নির্গমন (EMERGENCY ESCALATION)' : 'EMERGENCY IMMEDIATE ESCALATION',
    urgent_assessment: isBn ? 'জরুরি ২-সপ্তাহ মূল্যায়ন (URGENT 2-WEEK WAIT)' : 'URGENT 2-WEEK WAIT REFERRAL',
    routine_assessment: isBn ? 'নিয়মিত ক্লিনিক্যাল মূল্যায়ন (ROUTINE ASSESSMENT)' : 'ROUTINE CLINICAL EVALUATION',
    self_care: isBn ? 'স্ব-যত্ন ও পর্যবেক্ষণ (SELF-CARE & MONITORING)' : 'SELF-CARE & SAFETY MONITORING',
  }[data.triageOutcome.urgencyLevel]

  const redFlags = data.symptomsReported.filter(s => s.status === 'present' && s.isRedFlag)

  const body = `
    <!-- Protocol Card -->
    <div class="card-box" style="border-left: 4px solid #e11d48;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-size: 10pt; font-weight: 700; color: #1e293b;">
          ${data.protocol.name} (${data.protocol.version})
        </span>
        <span class="badge ${data.protocol.approvalStatus === 'approved' ? 'badge-success' : 'badge-warning'}">
          ${data.protocol.approvalStatus.toUpperCase()}
        </span>
      </div>
      <div style="font-size: 8.5pt; color: #475569;">
        <strong>${isBn ? 'কর্তৃপক্ষ:' : 'Issuing Authority:'}</strong> ${data.protocol.issuingAuthority} &bull; 
        <strong>${isBn ? 'প্রোটোকল কোড:' : 'Protocol Code:'}</strong> <code>${data.protocol.code}</code>
      </div>
    </div>

    <!-- Triage Outcome & Urgent Alert -->
    <div class="section-heading">${isBn ? '১. ট্রায়াজ ফলাফল ও জরুরি অগ্রাধিকার নির্ধারণ' : '1. Triage Determination & Urgency Level'}</div>
    <div class="card-box" style="padding: 16px; border: 1.5px solid ${redFlags.length > 0 ? '#f87171' : '#cbd5e1'};">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div>
          <div class="meta-label">${isBn ? 'জরুরিত্ব স্তর (Urgency Level)' : 'Urgency Level'}</div>
          <div style="margin-top: 4px;">
            <span class="badge ${urgencyBadgeClass}" style="font-size: 10.5pt; padding: 6px 12px;">
              ${urgencyLabel}
            </span>
          </div>
        </div>
        <div style="text-align: right;">
          <div class="meta-label">${isBn ? 'প্রস্তাবিত পদক্ষেপের সময়সীমা' : 'Action Target Timeframe'}</div>
          <div style="font-size: 13pt; font-weight: 800; color: #e11d48; margin-top: 2px;">
            ${data.triageOutcome.timeframeDays} ${isBn ? 'দিন' : 'Days'}
          </div>
        </div>
      </div>
      <div style="margin-top: 12px; font-size: 9pt; color: #1e293b; line-height: 1.6;">
        <strong>${isBn ? 'ক্লিনিক্যাল নির্দেশিকা সারসংক্ষেপ:' : 'Clinical Summary & Recommended Action:'}</strong><br>
        ${data.triageOutcome.clinicalSummary}
      </div>
      <div style="margin-top: 8px; font-size: 8.5pt; color: #0f766e;">
        <strong>${isBn ? 'প্রস্তাবিত রেফারেল পথ:' : 'Recommended Pathway:'}</strong> ${data.triageOutcome.recommendedPathway}
      </div>
    </div>

    <!-- Mandatory Red Flag Callout if present -->
    ${redFlags.length > 0 ? `
    <div class="alert-box alert-danger">
      <div style="font-size: 10pt; font-weight: 700; margin-bottom: 4px;">
        ⚠️ ${isBn ? 'জরুরি লাল-পতাকা সংকেত চিহ্নিত (Red-Flag Alarm Symptoms Detected)' : 'CRITICAL RED-FLAG SYMPTOMS IDENTIFIED'}
      </div>
      <div style="font-size: 8.5pt; line-height: 1.5;">
        ${isBn
          ? 'রোগীর মধ্যে তাৎক্ষণিক উদ্বেগের লক্ষণ উপস্থিত রয়েছে। স্ক্রীনিংয়ে অনুপযুক্ত হলেও বা সাধারণ ঝুঁকি কম হলেও এই লক্ষণগুলোকে অগ্রাধিকার দিয়ে অনতিবিলম্বে বিশেষজ্ঞ চিকিৎসকের পরামর্শ নিশ্চিত করতে হবে।'
          : 'The patient exhibits clinical alarm symptoms requiring immediate specialist attention. A low risk estimation or screening ineligibility NEVER overrides or suppresses these red-flag findings.'}
      </div>
      <ul style="margin: 6px 0 0 16px; padding: 0;">
        ${redFlags.map(rf => `<li><strong>${rf.name}</strong> ${rf.notes ? `— ${rf.notes}` : ''}</li>`).join('')}
      </ul>
    </div>` : ''}

    <!-- Reported Symptoms Detail Table -->
    <div class="section-heading">${isBn ? '২. নথিভুক্ত লক্ষণসমূহের বিস্তারিত তালিকা' : '2. Detailed Symptom Intake Registry'}</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>${isBn ? 'লক্ষণ' : 'Symptom'}</th>
          <th>${isBn ? 'উপস্থিতি' : 'Status'}</th>
          <th>${isBn ? 'সময়কাল' : 'Duration'}</th>
          <th>${isBn ? 'অগ্রগতি ও তীব্রতা' : 'Progression / Severity'}</th>
          <th>${isBn ? 'বিভাগ' : 'Classification'}</th>
        </tr>
      </thead>
      <tbody>
        ${data.symptomsReported.map(s => `
          <tr>
            <td>
              <strong>${s.name}</strong>
              ${s.notes ? `<div style="font-size: 7.5pt; color: #64748b;">${s.notes}</div>` : ''}
            </td>
            <td>
              <span class="badge ${s.status === 'present' ? (s.isRedFlag ? 'badge-urgent' : 'badge-warning') : 'badge-neutral'}">
                ${s.status.toUpperCase()}
              </span>
            </td>
            <td>${s.durationWeeks ? `${s.durationWeeks} ${isBn ? 'সপ্তাহ' : 'weeks'}` : (isBn ? 'অনির্দিষ্ট' : 'N/A')}</td>
            <td>${s.progression || 'N/A'} ${s.severity ? `(${s.severity})` : ''}</td>
            <td>
              <span class="badge ${s.isRedFlag ? 'badge-urgent' : 'badge-neutral'}">
                ${s.isRedFlag ? (isBn ? 'লাল-পতাকা (Red-Flag)' : 'Red Flag') : (isBn ? 'সাধারণ' : 'Standard')}
              </span>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Escalation & Referral Status -->
    ${data.escalationDetails ? `
    <div class="section-heading">${isBn ? '৩. ক্লিনিক্যাল এসকেলেশন ও ট্র্যাকিং' : '3. Clinical Escalation & Audit Tracking'}</div>
    <div class="card-box" style="font-size: 8.5pt;">
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
        <div><strong>${isBn ? 'দায়িত্বপ্রাপ্ত পদবী:' : 'Assigned Role:'}</strong> ${data.escalationDetails.escalatedToRole}</div>
        <div><strong>${isBn ? 'এসকেলেশন স্থিতি:' : 'Status:'}</strong> <span class="badge badge-info">${data.escalationDetails.status.toUpperCase()}</span></div>
        <div><strong>${isBn ? 'স্বীকৃতি প্রদানকারী:' : 'Acknowledged By:'}</strong> ${data.escalationDetails.acknowledgedBy || (isBn ? 'অপেক্ষমাণ' : 'Pending')}</div>
        <div><strong>${isBn ? 'স্বীকৃতির সময়:' : 'Acknowledged At:'}</strong> ${data.escalationDetails.acknowledgedAt || 'N/A'}</div>
      </div>
      ${data.escalationDetails.actionNotes ? `
      <div style="margin-top: 8px; border-top: 1px dashed #cbd5e1; padding-top: 6px;">
        <strong>${isBn ? 'গৃহীত ব্যবস্থা ও নোট:' : 'Action Taken / Notes:'}</strong> ${data.escalationDetails.actionNotes}
      </div>` : ''}
    </div>` : ''}
  `

  return renderBaseDocument({
    meta: data.meta,
    title,
    subtitle,
    reportTypeBadge: badge,
    children: body,
  })
}
