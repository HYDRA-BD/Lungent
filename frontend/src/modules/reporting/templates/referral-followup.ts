/**
 * Phase 1.22: Dedicated Referral and Follow-up Report Template
 *
 * Integrates with Healthcare Referral and Follow-up Management (Phase 1.18):
 * - Displays referral reference, referring and destination facilities
 * - Tracks clinical indication, priority (routine vs urgent_2ww), and lifecycle status
 * - Details follow-up appointments, responsible clinicians, and instructions
 * - Distinguishes scheduled, pending, completed, and unconfirmed activities
 */

import { renderBaseDocument } from './base-template'
import type { ReportMetadata } from '../types'
import { preserveCanonicalIdentifier, formatDate } from '@/i18n/formatters'

export interface ReferralFollowUpTemplateData {
  meta: ReportMetadata
  referral: {
    reference: string
    referringFacilityName: string
    referringClinicianName?: string
    destinationFacilityName: string
    destinationDepartment?: string
    clinicalIndication: string
    priority: 'routine' | 'urgent_2ww'
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    recommendedDate: string
    specialistInstructions?: string
    statusHistory: {
      status: string
      updatedAt: string
      notes?: string
    }[]
  }
  followUps: {
    followUpId: string
    purpose: string
    scheduledDate: string
    facilityName: string
    responsibleClinicianName?: string
    status: 'scheduled' | 'completed' | 'missed' | 'cancelled'
    outcomeNotes?: string
  }[]
}

export function renderReferralFollowUpReport(data: ReferralFollowUpTemplateData): string {
  const isBn = data.meta.language === 'bn'

  const title = isBn
    ? 'স্বাস্থ্যসেবা রেফারেল ও ফলো-আপ সারসংক্ষেপ প্রতিবেদন'
    : 'Healthcare Referral & Follow-up Clinical Summary Report'
  const subtitle = isBn
    ? 'বিশেষায়িত পালমোনোলজি ও অনকোলজি সমন্বয় এবং ফলো-আপ কার্যক্রম বিবরণী'
    : 'Specialist Pulmonary & Oncology Coordination and Longitudinal Follow-up History'
  const badge = isBn ? 'রেফারেল ও ফলো-আপ' : 'Referral & Follow-up'

  const priorityBadge = data.referral.priority === 'urgent_2ww' ? 'badge-urgent' : 'badge-info'
  const priorityLabel = data.referral.priority === 'urgent_2ww'
    ? (isBn ? 'জরুরি ২-সপ্তাহ ফাস্ট-ট্র্যাক (URGENT 2-WEEK WAIT)' : 'URGENT 2-WEEK WAIT (FAST-TRACK)')
    : (isBn ? 'নিয়মিত পরামর্শ (ROUTINE CONSULTATION)' : 'ROUTINE CONSULTATION')

  const statusBadge = {
    pending: 'badge-warning',
    in_progress: 'badge-info',
    completed: 'badge-success',
    cancelled: 'badge-neutral',
  }[data.referral.status]

  const body = `
    <!-- Referral Executive Card -->
    <div class="card-box" style="border-left: 4px solid #0f766e;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-size: 10.5pt; font-weight: 700; color: #1e293b;">
          ${isBn ? 'রেফারেল পরিচিতি' : 'Referral Reference'}: <span class="canonical-id">${preserveCanonicalIdentifier(data.referral.reference)}</span>
        </span>
        <span class="badge ${statusBadge}">
          ${data.referral.status.toUpperCase()}
        </span>
      </div>
      <div style="margin-bottom: 6px;">
        <strong>${isBn ? 'অগ্রাধিকার বিভাগ' : 'Priority Pathway'}:</strong>
        <span class="badge ${priorityBadge}" style="margin-left: 6px;">${priorityLabel}</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 8.5pt; margin-top: 10px; background: #ffffff; padding: 10px; border-radius: 4px; border: 1px solid #e2e8f0;">
        <div>
          <span class="meta-label">${isBn ? 'প্রেরণকারী স্বাস্থ্যকেন্দ্র' : 'Referring Facility'}</span>
          <div style="font-weight: 600; margin-top: 2px;">${data.referral.referringFacilityName}</div>
          <div style="font-size: 7.5pt; color: #64748b;">${data.referral.referringClinicianName || (isBn ? 'অনুমোদিত স্টাফ' : 'Attending Staff')}</div>
        </div>
        <div>
          <span class="meta-label">${isBn ? 'গন্তব্য বিশেষায়িত হাসপাতাল' : 'Destination Facility'}</span>
          <div style="font-weight: 600; margin-top: 2px;">${data.referral.destinationFacilityName}</div>
          <div style="font-size: 7.5pt; color: #64748b;">${data.referral.destinationDepartment || (isBn ? 'রেসপিরেটরি ও অনকোলজি বিভাগ' : 'Respiratory & Oncology')}</div>
        </div>
      </div>
    </div>

    <!-- Clinical Indication & Instructions -->
    <div class="section-heading">${isBn ? '১. ক্লিনিক্যাল কারণ ও নির্দেশনাবলী' : '1. Clinical Indication & Specialist Guidance'}</div>
    <div class="card-box">
      <div>
        <strong>${isBn ? 'রেফারেলের ক্লিনিক্যাল কারণ:' : 'Reason for Referral:'}</strong>
        <p style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 10px; margin-top: 4px; font-size: 9pt;">
          ${data.referral.clinicalIndication}
        </p>
      </div>
      ${data.referral.specialistInstructions ? `
      <div style="margin-top: 8px;">
        <strong>${isBn ? 'রোগী ও বিশেষজ্ঞের জন্য বিশেষ নির্দেশনা:' : 'Specialist Instructions & Preparation:'}</strong>
        <p style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 10px; margin-top: 4px; font-size: 8.5pt; color: #166534;">
          ${data.referral.specialistInstructions}
        </p>
      </div>` : ''}
      <div style="margin-top: 6px; font-size: 8.5pt; color: #475569;">
        <strong>${isBn ? 'প্রস্তাবিত সাক্ষাতের তারিখ:' : 'Recommended Date:'}</strong> ${formatDate(data.referral.recommendedDate, data.meta.language)}
      </div>
    </div>

    <!-- Follow-up Activity Schedules -->
    <div class="section-heading">${isBn ? '২. ফলো-আপ সূচি ও কার্যক্রম' : '2. Follow-up Activity Schedules'}</div>
    ${data.followUps.length > 0 ? `
    <table class="data-table">
      <thead>
        <tr>
          <th>${isBn ? 'ফলো-আপ উদ্দেশ্য' : 'Purpose'}</th>
          <th>${isBn ? 'নির্ধারিত তারিখ' : 'Scheduled Date'}</th>
          <th>${isBn ? 'স্বাস্থ্যকেন্দ্র' : 'Facility'}</th>
          <th>${isBn ? 'অবস্থা' : 'Status'}</th>
        </tr>
      </thead>
      <tbody>
        ${data.followUps.map(fu => `
          <tr>
            <td>
              <strong>${fu.purpose}</strong>
              ${fu.outcomeNotes ? `<div style="font-size: 7.5pt; color: #64748b;">${isBn ? 'ফলাফল:' : 'Outcome:'} ${fu.outcomeNotes}</div>` : ''}
            </td>
            <td>${formatDate(fu.scheduledDate, data.meta.language)}</td>
            <td>${fu.facilityName}</td>
            <td>
              <span class="badge ${fu.status === 'completed' ? 'badge-success' : fu.status === 'scheduled' ? 'badge-info' : 'badge-neutral'}">
                ${fu.status.toUpperCase()}
              </span>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>` : `
    <div class="card-box" style="font-size: 8.5pt; color: #64748b;">
      ${isBn ? 'কোনো ফলো-আপ কর্মসূচি এখনও তালিকাভুক্ত করা হয়নি।' : 'No additional follow-up visits currently scheduled.'}
    </div>`}

    <!-- Referral Status Lifecycle History -->
    <div class="section-heading">${isBn ? '৩. রেফারেলের স্থিতি ইতিহাস' : '3. Referral Lifecycle Status History'}</div>
    <div class="card-box" style="font-size: 8pt;">
      <ul style="margin: 4px 0 0 16px; padding: 0; line-height: 1.8;">
        ${data.referral.statusHistory.map(sh => `
          <li>
            <strong>${formatDate(sh.updatedAt, data.meta.language)}:</strong> 
            <span class="badge badge-neutral" style="font-size: 7.5pt;">${sh.status.toUpperCase()}</span>
            ${sh.notes ? ` &mdash; <em>${sh.notes}</em>` : ''}
          </li>
        `).join('')}
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
