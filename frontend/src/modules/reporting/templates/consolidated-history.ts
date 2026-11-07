/**
 * Phase 1.22: Consolidated Longitudinal Assessment History Template
 *
 * Provides a chronological timeline and summary of all assessments,
 * risk estimations, screening guidelines, and triage events for a patient.
 */

import { renderBaseDocument } from './base-template'
import type { ReportMetadata } from '../types'
import { preserveCanonicalIdentifier, formatDate } from '@/i18n/formatters'

export interface AssessmentTimelineItem {
  id: string
  date: string
  type: string
  status: string
  methodologyOrGuideline?: string
  resultSummary: string
  reviewingClinician?: string
}

export interface ConsolidatedHistoryTemplateData {
  meta: ReportMetadata
  totalAssessmentsCount: number
  earliestAssessmentDate: string
  latestAssessmentDate: string
  timeline: AssessmentTimelineItem[]
}

export function renderConsolidatedHistoryReport(data: ConsolidatedHistoryTemplateData): string {
  const isBn = data.meta.language === 'bn'

  const title = isBn
    ? 'দীর্ঘমেয়াদী ধারাবাহিক মূল্যায়ন ইতিহাস ও রেকর্ড'
    : 'Consolidated Longitudinal Assessment History'
  const subtitle = isBn
    ? 'রোগীর সমস্ত পূর্ববর্তী স্ক্রীনিং, ঝুঁকি প্রাক্কলন ও ট্রায়াজ ইভেন্টের কালানুক্রমিক সারসংক্ষেপ'
    : 'Chronological Registry of Clinical Assessments, Risk Evaluations, & Triage Events'
  const badge = isBn ? 'ধারাবাহিক ইতিহাস' : 'Assessment History'

  const body = `
    <!-- Summary Header Box -->
    <div class="card-box" style="border-left: 4px solid #0f766e;">
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; font-size: 8.5pt;">
        <div>
          <span class="meta-label">${isBn ? 'মোট মূল্যায়ন সংখ্যা' : 'Total Assessments'}</span>
          <div style="font-size: 14pt; font-weight: 700; color: #0f766e; margin-top: 2px;">
            ${data.totalAssessmentsCount}
          </div>
        </div>
        <div>
          <span class="meta-label">${isBn ? 'সর্বপ্রথম মূল্যায়নের তারিখ' : 'Initial Assessment'}</span>
          <div style="font-weight: 600; margin-top: 4px;">${data.earliestAssessmentDate}</div>
        </div>
        <div>
          <span class="meta-label">${isBn ? 'সর্বশেষ মূল্যায়নের তারিখ' : 'Most Recent Assessment'}</span>
          <div style="font-weight: 600; margin-top: 4px;">${data.latestAssessmentDate}</div>
        </div>
      </div>
    </div>

    <!-- Timeline Table -->
    <div class="section-heading">${isBn ? 'ধারাবাহিক মূল্যায়নের কালানুক্রমিক তালিকা' : 'Chronological Assessment Timeline'}</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>${isBn ? 'তারিখ ও কোড' : 'Date & ID'}</th>
          <th>${isBn ? 'মূল্যায়নের ধরন' : 'Assessment Type'}</th>
          <th>${isBn ? 'ব্যবহৃত পদ্ধতি / গাইডলাইন' : 'Methodology'}</th>
          <th>${isBn ? 'ফলাফল সারসংক্ষেপ' : 'Outcome Summary'}</th>
          <th>${isBn ? 'পর্যালোচক' : 'Clinician'}</th>
        </tr>
      </thead>
      <tbody>
        ${data.timeline.map(item => `
          <tr>
            <td>
              <strong>${formatDate(item.date, data.meta.language)}</strong>
              <div style="font-size: 7.5pt;" class="canonical-id">${preserveCanonicalIdentifier(item.id)}</div>
            </td>
            <td>
              <span class="badge badge-neutral" style="text-transform: capitalize;">
                ${item.type.replace(/_/g, ' ')}
              </span>
            </td>
            <td style="font-size: 8pt; color: #475569;">${item.methodologyOrGuideline || 'N/A'}</td>
            <td><strong>${item.resultSummary}</strong></td>
            <td style="font-size: 8pt;">${item.reviewingClinician || (isBn ? 'অপেক্ষমাণ' : 'Pending')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `

  return renderBaseDocument({
    meta: data.meta,
    title,
    subtitle,
    reportTypeBadge: badge,
    children: body,
  })
}
